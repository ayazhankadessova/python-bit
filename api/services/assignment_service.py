# app/services/assignment_service.py
from .code_execution import CodeExecutionService
from ..config.assignment_loader import get_assignment
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AssignmentService:
    def __init__(self):
        self.code_execution = CodeExecutionService()

    async def test_assignment(self, code: str, assignment_id: str) -> dict:
        """
        Test student code against an assignment's test cases
        """
        try:
            logger.info(f"Testing assignment {assignment_id}")
            
            # Get assignment from config
            assignment = get_assignment(assignment_id)
            print(assignment.testCode)
            if not assignment:
                logger.error(f"Assignment {assignment_id} not found")
                return {
                    'error': True,
                    'success': False,
                    'output': f'Assignment {assignment_id} not found'
                }

            # Combine student code with test code
            if assignment.testCode:
                logger.info("Executing test code")
                # Log the code being executed (for debugging)
                logger.debug(f"Student code:\n{code}")
                logger.debug(f"Test code:\n{assignment.testCode}")
                
                # Execute the combined code
                full_code = f"{code}\n\n{assignment.testCode}"
                result = await self.code_execution.execute_python_code(full_code)
                
                logger.info(f"Test execution completed: success={not result['error']}")
                logger.debug(f"Test output: {result['output']}")
                
                return {
                    'error': result['error'],
                    'success': 'Great job!' in result['output'] and not result['error'],
                    'output': result['output']
                }

            logger.error("No test code available for assignment")
            return {
                'error': True,
                'success': False,
                'output': 'No test code available for this assignment'
            }

        except Exception as e:
            logger.error(f"Error testing assignment: {str(e)}", exc_info=True)
            return {
                'error': True,
                'success': False,
                'output': str(e)
            }

    async def get_assignment_info(self, assignment_id: str) -> dict:
        """Get assignment information without test code"""
        logger.info(f"Getting info for assignment {assignment_id}")
        try:
            assignment = get_assignment(assignment_id)
            if not assignment:
                logger.error(f"Assignment {assignment_id} not found")
                return None
                
            assignment_info = {
                'id': assignment.id,
                'title': assignment.title,
                'problemStatement': assignment.problemStatement,
                'starterCode': assignment.starterCode,
                'starterFunctionName': assignment.starterFunctionName,
                'examples': [
                    {
                        'id': ex.id,
                        'inputText': ex.inputText,
                        'outputText': ex.outputText,
                        'explanation': ex.explanation
                    }
                    for ex in assignment.examples
                ]
            }
            logger.info(f"Successfully retrieved assignment info for {assignment_id}")
            return assignment_info
            
        except Exception as e:
            logger.error(f"Error getting assignment info: {str(e)}", exc_info=True)
            return None