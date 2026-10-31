import asyncio
import json
from pathlib import Path

import pytest

from api.services.assignment_service import AssignmentService

CONFIGS = json.loads(
    (Path(__file__).parent.parent / 'config' / 'assignment_configs.json').read_text()
)


def first_assignment_with(matches):
    return next(a_id for a_id, a in CONFIGS.items() if matches(a))


STRING_ID = first_assignment_with(lambda a: a['outputType'] == 'string')
OBJECT_ID = first_assignment_with(lambda a: a['outputType'] != 'string')


def mark(code, assignment_id):
    return asyncio.run(AssignmentService().test_assignment(code, assignment_id))


def solution_returning(assignment_id, value):
    name = CONFIGS[assignment_id]['starterFunctionName']
    return f'def {name}(*args, **kwargs):\n    return {value!r}\n'


@pytest.mark.parametrize('assignment_id', [STRING_ID, OBJECT_ID])
def test_correct_solution_is_marked_correct(assignment_id):
    expected = CONFIGS[assignment_id]['examples'][0]['outputText']

    result = mark(solution_returning(assignment_id, expected), assignment_id)

    assert result['success'] is True
    assert result['error'] is False


@pytest.mark.parametrize('assignment_id', [STRING_ID, OBJECT_ID])
def test_wrong_answer_is_not_marked_correct(assignment_id):
    result = mark(solution_returning(assignment_id, 'wrong answer'), assignment_id)

    assert result['success'] is False


def test_syntax_error_is_a_clean_failure():
    result = mark('def broken(:\n    pass\n', STRING_ID)

    assert result['success'] is False
    assert result['error'] is True
    assert 'SyntaxError' in result['output']


def test_exception_in_student_code_is_a_clean_failure():
    name = CONFIGS[STRING_ID]['starterFunctionName']

    result = mark(f"def {name}(*args, **kwargs):\n    raise ValueError('broken')\n", STRING_ID)

    assert result['success'] is False
    assert 'broken' in result['output']


def test_unknown_assignment_is_a_clean_failure():
    result = mark('print(1)', 'no-such-assignment')

    assert result['success'] is False
    assert result['error'] is True
    assert 'not found' in result['output']
