from fastapi import APIRouter

router = APIRouter()

@router.get("/health")
async def health_check():
    """Simple health check endpoint"""
    return {
        'status': 'healthy',
        'message': 'Code execution service is running'
    }