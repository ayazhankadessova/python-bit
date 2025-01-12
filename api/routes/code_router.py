from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from typing import List, Optional
from ..services.code_execution import CodeExecutionService
from ..services.exercise_service import ExerciseService
from ..services.project_service import ProjectService
from ..services.assignment_service import AssignmentService
from ..dependencies import limiter

router = APIRouter()
code_execution = CodeExecutionService()
exercise_service = ExerciseService()
project_service = ProjectService()
assignment_service = AssignmentService()

class TestAssignmentRequest(BaseModel):
    code: str
    assignment_id: str

class CodeExecutionRequest(BaseModel):
    code: str
    exercise_number: Optional[int] = 1
    tutorial_id: Optional[str] = "default"

class TestExerciseRequest(BaseModel):
    code: str
    exercise_number: Optional[int] = 1
    tutorial_id: Optional[str] = "default"
    # test_cases: Optional[List[dict]] = []

class TestProjectRequest(BaseModel):
    code: str
    project_id: Optional[str] = "default"

@router.post("/execute")
@limiter.limit("5/minute")
async def execute_code(request: Request, code_request: CodeExecutionRequest):
    """Main endpoint for executing Python code"""
    try:
        execution_result = await code_execution.execute_python_code(code_request.code)
        
        response_data = {
            'output': execution_result['output'],
            'success': execution_result['success'],
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
    
@router.post("/test-project")
@limiter.limit("30/minute")
async def test_exercise(request: Request, test_request: TestProjectRequest):
    """Endpoint for testing specific exercises"""
    try:
        result = await project_service.test_project(
            code=test_request.code,
            project_id =test_request.project_id,
        )
        return result
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={'error': str(e), 'output': ''}
        )
    
@router.post("/test-assignment")
@limiter.limit("30/minute")
async def test_assignment(request: Request, test_request: TestAssignmentRequest):
    """Endpoint for testing assignments"""
    try:
        result = await assignment_service.test_assignment(
            code=test_request.code,
            assignment_id=test_request.assignment_id
        )
        return result
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={'error': str(e), 'output': ''}
        )