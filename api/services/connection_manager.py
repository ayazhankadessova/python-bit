from fastapi import WebSocket
from typing import Dict, Set, Optional

class ConnectionManager:
    def __init__(self):
        self.classrooms: Dict[str, Dict] = {}

    async def connect(self, websocket: WebSocket, classroom_id: str, username: str, is_teacher: bool):

        if not is_teacher and classroom_id not in self.classrooms:
            await websocket.close(code=4000, reason="Cannot join - no teacher present")
            return
    
        await websocket.accept()
        
        if classroom_id not in self.classrooms:
            self.classrooms[classroom_id] = {
                "teacher": None,
                "students": {}
            }
        
        if is_teacher:
            self.classrooms[classroom_id]["teacher"] = {
                "websocket": websocket,
                "username": username
            }
        else:
            self.classrooms[classroom_id]["students"][username] = {
                "websocket": websocket,
                "username": username,
                "code": ""
            }
        
        await self.broadcast_participants(classroom_id)

    def disconnect(self, websocket: WebSocket, classroom_id: str, username: str):
        if classroom_id in self.classrooms:
            classroom = self.classrooms[classroom_id]
            
            # Check if it's the teacher
            if classroom["teacher"] and classroom["teacher"]["websocket"] == websocket:
                classroom["teacher"] = None
            
            # Check if it's a student
            if username in classroom["students"]:
                del classroom["students"][username]
            
            # Remove classroom if empty
            if not classroom["teacher"] and not classroom["students"]:
                del self.classrooms[classroom_id]

    async def broadcast(self, classroom_id: str, message_type: str, data: dict):
        if classroom_id in self.classrooms:
            classroom = self.classrooms[classroom_id]
            message = {"type": message_type, "data": data}
            # Add debug logging
            print(f"Broadcasting message: {message}")
            
            # Send to teacher if connected
            if classroom["teacher"]:
                try:
                    await classroom["teacher"]["websocket"].send_json(message)
                    print(f"Message sent to teacher: {classroom['teacher']['username']}")
                except Exception as e:
                    print(f"Error sending to teacher: {str(e)}")

            # Send to all students
            for student in classroom["students"].values():
                try:
                    await student["websocket"].send_json(message)
                    print(f"Message sent to student: {student['username']}")
                except Exception as e:
                    print(f"Error sending to student {student['username']}: {str(e)}")

    async def broadcast_participants(self, classroom_id: str):
        if classroom_id in self.classrooms:
            classroom = self.classrooms[classroom_id]
            participants = {
                "teacher": classroom["teacher"]["username"] if classroom["teacher"] else None,
                "students": list(classroom["students"].keys())
            }
            # Add debug logging
            print(f"Broadcasting participants for classroom {classroom_id}: {participants}")
            await self.broadcast(classroom_id, "update-participants", participants)

        if classroom_id in self.classrooms:
            classroom = self.classrooms[classroom_id]
            participants = {
                "teacher": classroom["teacher"]["username"] if classroom["teacher"] else None,
                "students": list(classroom["students"].keys())
            }
            
            await self.broadcast(classroom_id, "update-participants", participants)