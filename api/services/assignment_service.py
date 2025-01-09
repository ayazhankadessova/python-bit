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
        """Test student code by running examples and comparing outputs"""
        try:
            logger.info(f"Testing assignment {assignment_id}")
            assignment = get_assignment(assignment_id)
            
            if not assignment:
                return {
                    'error': True,
                    'success': False,
                    'output': f'Assignment {assignment_id} not found'
                }

            # Get the first example to test
            example = assignment.examples[0]  # Just use the first example for now
            
            # Create test code that will run the function and compare output
            test_code = f"""
{code}

try:
    result = {example.inputText}
    expected = '''{example.outputText}'''
    
    print(f'Your output: {{result}}')
    print(f'Expected: {{expected}}')
    
    if result == expected:
        print('✅ Correct!')
    else:
        print('❌ Not quite right yet.')
except Exception as e:
    print(f'Error running code: {{str(e)}}')
"""
            
            # Execute the test code
            result = await self.code_execution.execute_python_code(test_code)
            
            # Check if execution was successful and output matches
            success = '✅ Correct!' in result['output']
            
            return {
                'error': result.get('error', False),
                'success': success,
                'output': result['output']
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