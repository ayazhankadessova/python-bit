import asyncio
import os
import sys
import time

import pytest

from api.services.code_execution import CodeExecutionService


def run(code, timeout=5):
    return asyncio.run(CodeExecutionService.execute_python_code(code, timeout=timeout))


def process_exists(pid):
    try:
        os.kill(pid, 0)
    except ProcessLookupError:
        return False
    return True


def wait_until_gone(pid, seconds=3):
    deadline = time.monotonic() + seconds
    while time.monotonic() < deadline:
        if not process_exists(pid):
            return True
        time.sleep(0.05)
    return False


def script_starting_child(pid_file, child_stdout='None', then='time.sleep(60)'):
    return f"""
import subprocess, sys, time
child = subprocess.Popen(
    [sys.executable, '-c', 'import time; time.sleep(60)'],
    stdout={child_stdout},
    stderr={child_stdout},
)
with open({str(pid_file)!r}, 'w') as f:
    f.write(str(child.pid))
{then}
"""


def read_pid_and_check_gone(pid_file):
    pid = int(pid_file.read_text())
    try:
        assert wait_until_gone(pid), 'child process is still running'
    finally:
        if process_exists(pid):
            os.kill(pid, 9)


def test_api_environment_is_not_visible_to_submitted_code(monkeypatch):
    monkeypatch.setenv('PYTHONBIT_TEST_VALUE', 'should-not-be-visible')

    result = run("import os; print(os.environ.get('PYTHONBIT_TEST_VALUE'))")

    assert result['error'] is False
    assert result['output'] == 'None'


def test_timeout_kills_child_processes(tmp_path):
    pid_file = tmp_path / 'child.pid'

    result = run(script_starting_child(pid_file), timeout=2)

    assert result['output'] == 'Execution timed out'
    assert result['error'] is True
    read_pid_and_check_gone(pid_file)


def test_normal_exit_kills_background_child(tmp_path):
    pid_file = tmp_path / 'child.pid'

    result = run(
        script_starting_child(pid_file, child_stdout='subprocess.DEVNULL', then="print('done')")
    )

    assert result['output'] == 'done'
    assert result['error'] is False
    read_pid_and_check_gone(pid_file)


def test_normal_output_returns_success():
    result = run("print('hello')")

    assert result == {'output': 'hello', 'error': False, 'success': True}


def test_raised_exception_returns_error():
    result = run("raise ValueError('broken')")

    assert result['error'] is True
    assert result['success'] is False
    assert 'ValueError: broken' in result['output']


def test_crash_keeps_output_printed_before_it():
    result = run("print('before')\nraise ValueError('broken')")

    assert result['error'] is True
    assert result['output'].startswith('before\n')
    assert 'ValueError: broken' in result['output']


def test_timeout_keeps_output_printed_before_it():
    result = run("import time\nprint('before')\nwhile True:\n    time.sleep(1)", timeout=1)

    assert result['error'] is True
    assert result['output'] == 'before\nExecution timed out'


def test_large_output_is_capped():
    result = run("print('x' * 5_000_000)")

    assert result['error'] is False
    assert len(result['output']) < 1_100_000
    assert result['output'].endswith('[output truncated]')


def test_endless_output_is_capped_on_timeout():
    result = run("while True:\n    print('x' * 1000)", timeout=1)

    assert result['error'] is True
    assert len(result['output']) < 1_100_000
    assert result['output'].endswith('Execution timed out')


def test_invalid_utf8_output_does_not_fail_the_run():
    result = run("import sys; sys.stdout.buffer.write(b'ok \\xff')")

    assert result['error'] is False
    assert result['output'].startswith('ok ')


def test_cpu_limit_is_applied():
    result = run("import resource; print(resource.getrlimit(resource.RLIMIT_CPU)[0])", timeout=5)

    assert result['output'] == '6'


@pytest.mark.skipif(sys.platform != 'linux', reason='memory limit only applies on Linux')
def test_memory_limit_stops_large_allocations():
    result = run("x = bytearray(1024 * 1024 * 1024)")

    assert result['error'] is True
    assert 'MemoryError' in result['output']


@pytest.mark.skipif(sys.platform != 'linux', reason='process limit only applies on Linux')
def test_process_limit_is_applied():
    result = run("import resource; print(resource.getrlimit(resource.RLIMIT_NPROC)[0])")

    assert result['output'] == '32'


def test_utf8_marker_survives_without_locale_settings(monkeypatch):
    for name in ('LANG', 'LC_ALL', 'LC_CTYPE'):
        monkeypatch.delenv(name, raising=False)

    result = run("print('✅ Correct!')")

    assert result['error'] is False
    assert result['output'] == '✅ Correct!'
