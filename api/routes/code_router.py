from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from typing import List, Optional
from ..services.code_execution import CodeExecutionService
from ..services.exercise_service import ExerciseService
from ..dependencies import limiter

router = APIRouter()
code_execution = CodeExecutionService()
exercise_service = ExerciseService()

class CodeExecutionRequest(BaseModel):
    code: str
    exercise_number: Optional[int] = 1
    tutorial_id: Optional[str] = "default"

class TestExerciseRequest(BaseModel):
    code: str
    exercise_number: Optional[int] = 1
    tutorial_id: Optional[str] = "default"
    # test_cases: Optional[List[dict]] = []

@router.post("/execute")
@limiter.limit("5/minute")
async def execute_code(request: Request, code_request: CodeExecutionRequest):
    """Main endpoint for executing Python code"""
    try:
        execution_result = await code_execution.execute_python_code(code_request.code)
        
        response_data = {
            'output': execution_result['output'],
            'exercise_number': code_request.exercise_number,
            'tutorial_id': code_request.tutorial_id,
            'error': execution_result['error']
        }
        
        return response_data
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

@router.post("/test-exercise")
@limiter.limit("30/minute")
async def test_exercise(request: Request, test_request: TestExerciseRequest):
    """Endpoint for testing specific exercises"""
    try:
        result = await exercise_service.test_exercise(
            code=test_request.code,
            exercise_number=test_request.exercise_number,
            tutorial_id=test_request.tutorial_id,
            # test_cases=test_request.test_cases
        )
        return result
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={'error': str(e), 'output': ''}
        )