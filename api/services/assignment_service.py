# app/api/config/assignment_loader.py
import json
import os
from typing import Dict, List, Optional
from dataclasses import dataclass

@dataclass
class Example:
    id: str
    inputText: str
    outputText: str
    explanation: str

@dataclass
class Assignment:
    id: str
    title: str
    problemStatement: str
    starterCode: str
    starterFunctionName: str
    examples: List[Example]

class AssignmentLoader:
    _instance = None
    _assignments = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(AssignmentLoader, cls).__new__(cls)
        return cls._instance

    def __init__(self):
        if self._assignments is None:
            self._load_assignments()

    def _load_assignments(self):
        """Load assignments from JSON file"""
        current_dir = os.path.dirname(os.path.abspath(__file__))
        project_root = os.path.dirname(os.path.dirname(current_dir))
        config_path = os.path.join(project_root, 'config', 'assignment_configs.json')

        try:
            with open(config_path, 'r') as f:
                data = json.load(f)
                self._assignments = {}
                
                for assignment_id, assignment_data in data.items():
                    # Convert examples to Example objects
                    examples = [
                        Example(
                            id=ex['id'],
                            inputText=ex['inputText'],
                            outputText=ex['outputText'],
                            explanation=ex['explanation']
                        ) 
                        for ex in assignment_data['examples']
                    ]

                    self._assignments[assignment_id] = Assignment(
                        id=assignment_data['id'],
                        title=assignment_data['title'],
                        problemStatement=assignment_data['problemStatement'],
                        starterCode=assignment_data['starterCode'],
                        starterFunctionName=assignment_data['starterFunctionName'],
                        examples=examples,
                    )

        # print success message
            print(f"Assignments loaded successfully: {len(self._assignments)} assignments found")
        except Exception as e:
            print(f"Error loading assignment configs: {e}")
            self._assignments = {}

    def get_assignment(self, assignment_id: str) -> Optional[Assignment]:
        """Get an assignment by ID"""
        return self._assignments.get(assignment_id)

    def get_all_assignments(self) -> Dict[str, Assignment]:
        """Get all assignments"""
        return self._assignments

    def reload_assignments(self):
        """Force reload of assignments from JSON"""
        self._assignments = None
        self._load_assignments()

# Create a singleton instance
assignment_loader = AssignmentLoader()

# Helper functions
def get_assignment(assignment_id: str) -> Optional[Assignment]:
    return assignment_loader.get_assignment(assignment_id)

def get_all_assignments() -> Dict[str, Assignment]:
    return assignment_loader.get_all_assignments()


# app/services/assignment_service.py
from .code_execution import CodeExecutionService
# from assignment_loader import get_assignment
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
            assignment = assignment_loader.get_assignment(assignment_id)
            
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