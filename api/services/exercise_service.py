# app/api/config/tutorial_loader.py

import json
import os
from typing import Dict, List, Optional
from dataclasses import dataclass

@dataclass
class Exercise:
    exercise_number: int
    description: str
    expected_output: Optional[str] = None
    test_code: Optional[str] = None
    hints: List[str] = None
    difficulty: str = "beginner"

@dataclass
class Tutorial:
    tutorial_id: str
    title: str
    description: str
    exercises: Dict[int, Exercise]

class TutorialLoader:
    _instance = None
    _tutorials = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(TutorialLoader, cls).__new__(cls)
        return cls._instance

    def __init__(self):
        if self._tutorials is None:
            self._load_tutorials()

    def _load_tutorials(self):
        """Load tutorials from JSON file"""
        # Get the project root directory (2 levels up from current file)
        current_dir = os.path.dirname(os.path.abspath(__file__))
        project_root = os.path.dirname(os.path.dirname(current_dir))
        config_path = os.path.join(project_root, 'config', 'tutorial_configs.json')

        # print(config_path)

        try:
            with open(config_path, 'r') as f:
                data = json.load(f)
            
            self._tutorials = {}
            for tutorial_id, tutorial_data in data.items():
                exercises = {}
                for ex_num, ex_data in tutorial_data['exercises'].items():
                    exercises[int(ex_num)] = Exercise(
                        exercise_number=ex_data['exercise_number'],
                        description=ex_data['description'],
                        expected_output=ex_data.get('expected_output'),
                        test_code=ex_data.get('test_code'),
                        hints=ex_data.get('hints', []),
                        difficulty=ex_data.get('difficulty', 'beginner')
                    )

                self._tutorials[tutorial_id] = Tutorial(
                    tutorial_id=tutorial_data['tutorial_id'],
                    title=tutorial_data['title'],
                    description=tutorial_data['description'],
                    exercises=exercises
                )
            
        except Exception as e:
            print(f"Error loading tutorial configs: {e}")
            self._tutorials = {}

    def get_tutorial(self, tutorial_id: str) -> Optional[Tutorial]:
        """Get a tutorial by ID"""
        # print(self._tutorials.get(tutorial_id))
        # return self._tutorials.get(tutorial_id)

    def get_exercise(self, tutorial_id: str, exercise_number: int) -> Optional[Exercise]:
        """Get a specific exercise from a tutorial"""
        tutorial = self.get_tutorial(tutorial_id)
        if tutorial:
            # print(tutorial)
            return tutorial.exercises.get(exercise_number)
        # else:
        #     print(f"Tutorial '{tutorial_id}' not found")
        #     # return None
        return None

    def get_all_tutorials(self) -> Dict[str, Tutorial]:
        """Get all tutorials"""
        return self._tutorials

    def reload_tutorials(self):
        """Force reload of tutorials from JSON"""
        self._tutorials = None
        self._load_tutorials()

# Create a singleton instance
tutorial_loader = TutorialLoader()

# Helper functions
def get_tutorial(tutorial_id: str) -> Optional[Tutorial]:
    return tutorial_loader.get_tutorial(tutorial_id)

def get_exercise(tutorial_id: str, exercise_number: int) -> Optional[Exercise]:
    return tutorial_loader.get_exercise(tutorial_id, exercise_number)

def get_all_tutorials() -> Dict[str, Tutorial]:
    return tutorial_loader.get_all_tutorials()

import asyncio
from .code_execution import CodeExecutionService
# from ..config.tutorial_loader import get_exercise, get_tutorial

class ExerciseService:
    def __init__(self):
        self.code_execution = CodeExecutionService()

    async def test_exercise(self, code: str, exercise_number: int, tutorial_id: str) -> dict:
        exercise = tutorial_loader.get_exercise(tutorial_id, exercise_number)
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
        exercise = tutorial_loader.get_exercise(tutorial_id, exercise_number)
        return None if not exercise else {
            'exercise_number': exercise.exercise_number,
            'description': exercise.description,
            'hints': exercise.hints,
            'difficulty': exercise.difficulty
        }

    async def get_tutorial_info(self, tutorial_id: str) -> dict:
        tutorial = tutorial_loader.get_tutorial(tutorial_id)
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