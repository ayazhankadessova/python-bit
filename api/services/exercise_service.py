import asyncio
from .code_execution import CodeExecutionService
from ..config.tutorial_loader import get_exercise, get_tutorial

class ExerciseService:
    def __init__(self):
        self.code_execution = CodeExecutionService()

    async def test_exercise(self, code: str, exercise_number: int, tutorial_id: str) -> dict:
        exercise = get_exercise(tutorial_id, exercise_number)
        if not exercise:
            return {
                'error': True,
                'success': False,
                'output': f'Exercise {exercise_number} not found in tutorial {tutorial_id}'
            }

        try:
            if exercise.expected_output:
                result = await self.code_execution.execute_python_code(code)
                if result['error']:
                    return result

                res = result['output'].strip()
                if res == exercise.expected_output:
                    return {
                        'error': False,
                        'success': True,
                        'output': res
                    }
                return {
                    'error': False,
                    'success': False,
                    'output': f'Your output: {res}\n\nExpected output: {exercise.expected_output}'
                }

            if exercise.test_code:
                full_code = f"{code}\n\n{exercise.test_code}\n\ntest_result = test_{exercise.test_code.split('test_')[1].split('(')[0]}()"
                result = await self.code_execution.execute_python_code(full_code)
                
                return {
                    'error': result['error'],
                    'success': 'True' in result['output'] and not result['error'],
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

    async def get_exercise_info(self, tutorial_id: str, exercise_number: int) -> dict:
        """Get exercise information without test code"""
        exercise = get_exercise(tutorial_id, exercise_number)
        return None if not exercise else {
            'exercise_number': exercise.exercise_number,
            'description': exercise.description,
            'hints': exercise.hints,
            'difficulty': exercise.difficulty
        }

    async def get_tutorial_info(self, tutorial_id: str) -> dict:
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