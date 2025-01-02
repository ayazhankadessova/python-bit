# api/services/exercise_service.py

import asyncio
from .code_execution import CodeExecutionService
from ..config.tutorial_loader import get_exercise, get_tutorial

class ExerciseService:
    def __init__(self):
        self.code_execution = CodeExecutionService()

    async def test_exercise(
        self, 
        code: str, 
        exercise_number: int, 
        tutorial_id: str,
    ) -> dict:
        # Get exercise configuration
        exercise = get_exercise(tutorial_id, exercise_number)
        if not exercise:
            return {
                'success': False,
                'error': f'Exercise {exercise_number} not found in tutorial {tutorial_id}',
                'output': ''
            }

        try:
            # If there's expected output, check against that
            if exercise.expected_output:
                result = await self.code_execution.execute_python_code(code)
                print(result['output'].strip())
                success = result['output'].strip() == exercise.expected_output
                return {
                    'success': success,
                    'output': result['output'],
                    'error': None if success else 'Output does not match expected result'
                }

            # If there's test code, run it
            if exercise.test_code:
                full_code = f"{code}\n\n{exercise.test_code}\n\ntest_result = test_{exercise.test_code.split('test_')[1].split('(')[0]}()"
                result = await self.code_execution.execute_python_code(full_code)
                
                return {
                    'success': 'True' in result['output'] and not result['error'],
                    'output': result['output'],
                    'error': result['error']
                }

            return {
                'success': False,
                'error': 'No test criteria available for this exercise',
                'output': ''
            }

        except Exception as e:
            return {
                'success': False,
                'output': '',
                'error': str(e)
            }

    async def get_exercise_info(self, tutorial_id: str, exercise_number: int) -> dict:
        """Get exercise information without test code"""
        exercise = get_exercise(tutorial_id, exercise_number)
        if not exercise:
            return None
            
        return {
            'exercise_number': exercise.exercise_number,
            'description': exercise.description,
            'hints': exercise.hints,
            'difficulty': exercise.difficulty
        }

    async def get_tutorial_info(self, tutorial_id: str) -> dict:
        """Get tutorial information"""
        tutorial = get_tutorial(tutorial_id)
        if not tutorial:
            return None
            
        exercises = {
            num: {
                'exercise_number': ex.exercise_number,
                'description': ex.description,
                'hints': ex.hints,
                'difficulty': ex.difficulty
            }
            for num, ex in tutorial.exercises.items()
        }
            
        return {
            'tutorial_id': tutorial.tutorial_id,
            'title': tutorial.title,
            'description': tutorial.description,
            'exercises': exercises
        }