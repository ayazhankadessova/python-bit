# config/tutorial_config.py

from typing import Dict, List, Optional

class Exercise:
    def __init__(
        self,
        exercise_number: int,
        description: str,
        expected_output: Optional[str] = None,
        test_code: Optional[str] = None,
        hints: List[str] = [],
        difficulty: str = "beginner"
    ):
        self.exercise_number = exercise_number
        self.description = description
        self.expected_output = expected_output
        self.test_code = test_code
        self.hints = hints
        self.difficulty = difficulty

class Tutorial:
    def __init__(
        self,
        tutorial_id: str,
        title: str,
        description: str,
        exercises: Dict[int, Exercise]
    ):
        self.tutorial_id = tutorial_id
        self.title = title
        self.description = description
        self.exercises = exercises

# Define tutorials and their exercises
TUTORIALS = {
    "python101": Tutorial(
        tutorial_id="python101",
        title="Introduction to Python",
        description="Learn the basics of Python programming",
        exercises={
            1: Exercise(
                exercise_number=1,
                description="Write a function that prints 'Hello, World!'",
                expected_output="Hello, World!",
                test_code="""
def test_hello_world():
    import io
    import sys
    output = io.StringIO()
    sys.stdout = output
    hello_world()
    sys.stdout = sys.__stdout__
    assert output.getvalue().strip() == "Hello, World!", "Expected 'Hello, World!'"
    return True
""",
                hints=["Remember to use the print() function", "The message should match exactly"]
            ),
            2: Exercise(
                exercise_number=2,
                description="Create a function that adds two numbers",
                test_code="""
def test_add_numbers():
    assert add_numbers(2, 3) == 5, "2 + 3 should equal 5"
    assert add_numbers(-1, 1) == 0, "(-1) + 1 should equal 0"
    assert add_numbers(0, 0) == 0, "0 + 0 should equal 0"
    return True
""",
                hints=["Use the + operator", "Return the sum of the parameters"]
            ),
            # Add more exercises as needed
        }
    ),
    # Add more tutorials as needed
}

def get_tutorial(tutorial_id: str) -> Optional[Tutorial]:
    return TUTORIALS.get(tutorial_id)

def get_exercise(tutorial_id: str, exercise_number: int) -> Optional[Exercise]:
    tutorial = get_tutorial(tutorial_id)
    if tutorial:
        return tutorial.exercises.get(exercise_number)
    return None