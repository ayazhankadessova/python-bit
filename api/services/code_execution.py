import tempfile
import os
import uuid
import sys
import asyncio
import resource
import signal

# Only what Python itself needs to start. Everything else in the API's
# environment stays out of submitted code.
CHILD_ENV_ALLOWLIST = ("PATH", "LD_LIBRARY_PATH", "PYTHONHOME", "TMPDIR")

MAX_OUTPUT_BYTES = 1_000_000
MAX_MEMORY_BYTES = 256 * 1024 * 1024
MAX_PROCESSES = 32


def _child_env():
    env = {name: os.environ[name] for name in CHILD_ENV_ALLOWLIST if name in os.environ}
    env["PYTHONUTF8"] = "1"
    env["PYTHONIOENCODING"] = "utf-8"
    # Without this, output from before a timeout is stuck in the child's buffer.
    env["PYTHONUNBUFFERED"] = "1"
    return env


def _apply_limits(timeout):
    """Runs in the child before exec. A partial limit, not a sandbox."""
    limits = [(resource.RLIMIT_CPU, timeout + 1)]
    # macOS doesn't enforce the memory limit, and its process limit counts every
    # process the user is running, so these two only apply on Linux.
    if sys.platform == "linux":
        limits.append((resource.RLIMIT_AS, MAX_MEMORY_BYTES))
        limits.append((resource.RLIMIT_NPROC, MAX_PROCESSES))

    for limit, value in limits:
        try:
            resource.setrlimit(limit, (value, value))
        except (ValueError, OSError):
            pass


def _kill_process_group(pgid):
    try:
        os.killpg(pgid, signal.SIGKILL)
    except (ProcessLookupError, PermissionError):
        pass


async def _read_capped(stream, buffer):
    """Keeps reading so the child never blocks, but stores only the first part."""
    while chunk := await stream.read(65536):
        buffer.extend(chunk[: MAX_OUTPUT_BYTES - len(buffer)])


def _decode(buffer):
    text = buffer.decode("utf-8", errors="replace").strip()
    if len(buffer) >= MAX_OUTPUT_BYTES:
        text += "\n[output truncated]"
    return text


def _join_output(*parts):
    return "\n".join(part for part in parts if part)


class CodeExecutionService:
    @staticmethod
    async def execute_python_code(code: str, timeout: int = 5):
        try:
            temp_filename = os.path.join(tempfile.gettempdir(), f"{uuid.uuid4()}.py")
            with open(temp_filename, "w", encoding="utf-8") as temp_file:
                temp_file.write(code)

            try:
                process = await asyncio.create_subprocess_exec(
                    sys.executable,
                    temp_filename,
                    stdout=asyncio.subprocess.PIPE,
                    stderr=asyncio.subprocess.PIPE,
                    env=_child_env(),
                    start_new_session=True,
                    preexec_fn=lambda: _apply_limits(timeout),
                )

                stdout, stderr = bytearray(), bytearray()
                readers = asyncio.gather(
                    _read_capped(process.stdout, stdout),
                    _read_capped(process.stderr, stderr),
                )
                timed_out = False

                try:
                    await asyncio.wait_for(process.wait(), timeout=timeout)
                except asyncio.TimeoutError:
                    timed_out = True
                finally:
                    _kill_process_group(process.pid)

                # The group is dead, so the pipes close and the readers finish.
                try:
                    await asyncio.wait_for(
                        asyncio.gather(process.wait(), readers), timeout=1
                    )
                except asyncio.TimeoutError:
                    pass

                if timed_out:
                    return {
                        "output": _join_output(
                            _decode(stdout), _decode(stderr), "Execution timed out"
                        ),
                        "error": True,
                        "success": False,
                    }

                if process.returncode != 0:
                    stopped = (
                        f"Process stopped by signal {-process.returncode}"
                        if process.returncode < 0
                        else ""
                    )
                    return {
                        "output": _join_output(
                            _decode(stdout), _decode(stderr), stopped
                        ),
                        "error": True,
                        "success": False,
                    }

                return {
                    "output": _decode(stdout),
                    "error": False,
                    "success": True,
                }

            finally:
                try:
                    os.unlink(temp_filename)
                except Exception as cleanup_error:
                    print(f"Error cleaning up temp file: {cleanup_error}")

        except Exception as e:
            return {
                "output": f"Unexpected error: {str(e)}",
                "error": True,
                "success": False,
            }
