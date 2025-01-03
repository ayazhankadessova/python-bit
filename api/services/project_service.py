# app/api/services/project_service.py
from .code_execution import CodeExecutionService
from ..config.project_loader import get_project

class ProjectService:
    def __init__(self):
        self.code_execution = CodeExecutionService()

    async def test_project(self, code: str, project_id: str) -> dict:
        print(project_id)
        project = get_project(project_id)
        if not project:
            print("NOT FOUND")
            return {
                'error': True,
                'success': False,
                'output': f'Project {project_id} not found.'
            }

        try:
            if project.test_code:
                # Combine user code with test code
                full_code = (
                    f"{code}\n\n"
                    f"{project.test_code}\n\n"
                )
                
                result = await self.code_execution.execute_python_code(full_code)
                print(result)
                return {
                    'error': result['error'],
                    'success': 'All tests passed!' in result['output'] and not result['error'],
                    'output': result['output']
                }
                
            return {
                'error': True,
                'success': False,
                'output': 'No test criteria available'
            }
            
        except Exception as e:
            return {
                'error': True,
                'success': False,
                'output': str(e)
            }