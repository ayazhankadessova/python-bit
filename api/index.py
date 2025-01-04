from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from .routes import code_router, health_router
from .dependencies import limiter

# Create FastAPI instance
app = FastAPI(docs_url="/api/py/docs", openapi_url="/api/py/openapi.json")

# Add limiter to app state
app.state.limiter = limiter

# Handle rate limit exceeded errors
@app.exception_handler(RateLimitExceeded)
async def ratelimit_handler(request: Request, exc: RateLimitExceeded):
    return JSONResponse(
        {"error": True, "success": False,  "output": 'Rate limit exceeded. Please wait 1 minute.'},
        status_code=429
    )

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health_router.router, prefix="/api/py")
app.include_router(code_router.router, prefix="/api/py")

@app.get("/api/py/helloFastApi")
def hello_fast_api():
    return {"message": "Hello from FastAPI"}