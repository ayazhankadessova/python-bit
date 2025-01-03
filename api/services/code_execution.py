import tempfile
import os
import uuid
import sys
import asyncio

class CodeExecutionService:
   @staticmethod 
   async def execute_python_code(code: str, timeout: int = 5):
       try:
           temp_filename = os.path.join(tempfile.gettempdir(), f"{uuid.uuid4()}.py")
           with open(temp_filename, 'w') as temp_file:
               temp_file.write(code)
           
           try:
               process = await asyncio.create_subprocess_exec(
                   sys.executable,
                   temp_filename,
                   stdout=asyncio.subprocess.PIPE, 
                   stderr=asyncio.subprocess.PIPE,
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
                   process.kill()
                   return {
                       'output': 'Execution timed out',
                       'error': True,
                       'success': False
                   }

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