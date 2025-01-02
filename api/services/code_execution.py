import subprocess
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
                # Create process with asyncio
                process = await asyncio.create_subprocess_exec(
                    sys.executable,
                    temp_filename,
                    stdout=asyncio.subprocess.PIPE,
                    stderr=asyncio.subprocess.PIPE,
                )

                try:
                    # Wait for the process with timeout
                    stdout, stderr = await asyncio.wait_for(process.communicate(), timeout=timeout)
                    
                    if process.returncode != 0:
                        return {
                            'output': stderr.decode().strip(),
                            'error': True,
                            'returncode': process.returncode
                        }
                    
                    return {
                        'output': stdout.decode().strip(),
                        'error': False,
                        'returncode': process.returncode
                    }
                
                except asyncio.TimeoutError:
                    process.kill()
                    return {
                        'output': 'Execution timed out',
                        'error': True,
                        'returncode': -1
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
                'returncode': -1
            }