from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from ..services.connection_manager import ConnectionManager
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()
manager = ConnectionManager()

# @router.websocket("/ws/health")
# async def health_check(websocket: WebSocket):
#     """
#     WebSocket endpoint for connection health monitoring.
#     Simplified version that responds to any received message.
#     """
#     print("New health check connection attempting to connect...")
    
#     try:
#         await websocket.accept()
#         print("Health check connection accepted")
        
#         # Send initial health status
#         await websocket.send_json({
#             "type": "health",
#             "status": "connected",
#             "message": "WebSocket connection established"
#         })
        
#         while True:
#             try:
#                 # Wait for any message from client
#                 data = await websocket.receive_json()
#                 print(f"Received message: {data}")
                
#                 # Echo back with health status
#                 await websocket.send_json({
#                     "type": "health",
#                     "status": "healthy",
#                     "message": "Connection is active",
#                     "received": data
#                 })
                
#             except WebSocketDisconnect:
#                 print("Client disconnected normally")
#                 break
#             except Exception as e:
#                 print(f"Error in WebSocket communication: {str(e)}")
#                 await websocket.send_json({
#                     "type": "health",
#                     "status": "error",
#                     "message": str(e)
#                 })
#                 break
                
#     except Exception as e:
#         print(f"Error in health check: {str(e)}")
#         if websocket.client_state.connected:
#             await websocket.close(code=status.WS_1011_INTERNAL_ERROR)
#         return JSONResponse(
#             status_code=500,
#             content={"error": str(e)}
#         )
    
@router.websocket("/ws/{classroom_id}/{username}/{is_teacher}")
async def websocket_endpoint(
    websocket: WebSocket,
    classroom_id: str,
    username: str,
    is_teacher: str
):
    logger.info(f"New connection: classroom={classroom_id}, user={username}, is_teacher={is_teacher}")

    await manager.connect(websocket, classroom_id, username, is_teacher.lower() == "true")
    logger.info(f"Connection established for user {username} in classroom {classroom_id}")
    
    print("here")
    try:
        while True:
            data = await websocket.receive_json()
            event_type = data.get("type")
            event_data = data.get("data", {})  # Get data with empty dict as default
            
            logger.info(f"Received message from {username}: type={event_type}, data={event_data}")
            
            if event_type == "code-update":
                if classroom_id in manager.classrooms:
                    classroom = manager.classrooms[classroom_id]
                    if username in classroom["students"]:
                        classroom["students"][username]["code"] = event_data.get("code", "")
                        await manager.broadcast(classroom_id, "student-code-updated", {
                            "username": username,
                            "code": event_data.get("code", "")
                        })
            # Checked
            elif event_type == "send-code-to-all":
                await manager.broadcast(classroom_id, "teacher-code", {
                    "code": event_data.get("code", "")
                })
                
            # Checked
            elif event_type == "get-student-code":
                if classroom_id in manager.classrooms:
                    classroom = manager.classrooms[classroom_id]
                    target_username = event_data.get("username")
                    student = classroom["students"].get(target_username)
                    if student:
                        await websocket.send_json({
                            "type": "student-code",
                            "data": {
                                "username": student["username"],
                                "code": student.get("code", "")
                            }
                        })
            # CHECKED            
            elif event_type == "send-code-to-student":
                target_username = event_data.get("studentUsername")
                if classroom_id in manager.classrooms:
                    classroom = manager.classrooms[classroom_id]
                    student = classroom["students"].get(target_username)
                    if student and student.get("websocket"):
                        await student["websocket"].send_json({
                            "type": "teacher-code",
                            "data": {
                                "code": event_data.get("code", "")
                            }
                        })
                        
    except WebSocketDisconnect:
        manager.disconnect(websocket, classroom_id, username)
        await manager.broadcast_participants(classroom_id)
    except Exception as e:
        print(f"Error in websocket: {str(e)}")
        manager.disconnect(websocket, classroom_id, username)
        await manager.broadcast_participants(classroom_id)