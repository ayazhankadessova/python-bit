import tempfile
import os
import uuid
import sys
import asyncio
import signal

# Only what Python itself needs to start. Everything else in the API's
# environment stays out of submitted code.
CHILD_ENV_ALLOWLIST = ('PATH', 'LD_LIBRARY_PATH', 'PYTHONHOME', 'TMPDIR')

def _child_env():
   env = {name: os.environ[name] for name in CHILD_ENV_ALLOWLIST if name in os.environ}
   env['PYTHONUTF8'] = '1'
   env['PYTHONIOENCODING'] = 'utf-8'
   return env

def _kill_process_group(pgid):
   try:
       os.killpg(pgid, signal.SIGKILL)
   except (ProcessLookupError, PermissionError):
       pass

class CodeExecutionService:
   @staticmethod 
   async def execute_python_code(code: str, timeout: int = 5):
       try:
           temp_filename = os.path.join(tempfile.gettempdir(), f"{uuid.uuid4()}.py")
           with open(temp_filename, 'w', encoding='utf-8') as temp_file:
               temp_file.write(code)
           
           try:
               process = await asyncio.create_subprocess_exec(
                   sys.executable,
                   temp_filename,
                   stdout=asyncio.subprocess.PIPE, 
                   stderr=asyncio.subprocess.PIPE,
                   env=_child_env(),
                   start_new_session=True,
               )

               try:
                   stdout, stderr = await asyncio.wait_for(process.communicate(), timeout=timeout)

                   if process.returncode != 0:
                       return {
                           'output': stderr.decode().strip(),
                           'error': True,
                           'success': False
                       }

                   return {
                       'output': stdout.decode().strip(), 
                       'error': False,
                       'success': True
                   }

               except asyncio.TimeoutError:
                   return {
                       'output': 'Execution timed out',
                       'error': True,
                       'success': False
                   }

               finally:
                   _kill_process_group(process.pid)
                   try:
                       await asyncio.wait_for(process.wait(), timeout=1)
                   except asyncio.TimeoutError:
                       pass

           finally:
               try:
                   os.unlink(temp_filename)
               except Exception as cleanup_error:
                   print(f"Error cleaning up temp file: {cleanup_error}")

       except Exception as e:
           return {
               'output': f'Unexpected error: {str(e)}',
               'error': True, 
               'success': False
           }