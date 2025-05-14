from fastapi import FastAPI, WebSocket, Request, WebSocketDisconnect
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from dataclasses import dataclass
import uuid
import json



# Jinja2 templates directory setup
templates = Jinja2Templates(directory="templates")

# Manages all WebSocket connections
@dataclass
class ConnectionManager:
    def __init__(self) -> None:
        self.active_connections: dict = {}

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        connection_id = str(uuid.uuid4())
        self.active_connections[connection_id] = websocket

        # Notify the connected user
        await self.send_message(websocket, json.dumps({
            "isMe": True,
            "data": "You have joined!",
            "username": "You"
        }))

    async def send_message(self, ws: WebSocket, message: str):
        await ws.send_text(message)

    def find_connection_id(self, websocket: WebSocket):
        connections = list(self.active_connections.values())
        ids = list(self.active_connections.keys())
        pos = connections.index(websocket)
        return ids[pos]

    async def broadcast(self, sender_ws: WebSocket, data: str):
        message_data = json.loads(data)

        for ws in self.active_connections.values():
            is_me = (ws == sender_ws)
            await ws.send_text(json.dumps({
                "isMe": is_me,
                "data": message_data['message'],
                "username": message_data['username']
            }))

    def disconnect(self, websocket: WebSocket):
        connection_id = self.find_connection_id(websocket)
        del self.active_connections[connection_id]
        return connection_id

# FastAPI app instance
app = FastAPI()



# Mounting static files (CSS, JS)
app.mount("/static", StaticFiles(directory="static"), name="static")

# Connection manager instance
connection_manager = ConnectionManager()



# Root route: returns index.html
@app.get("/", response_class=HTMLResponse)
def home(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})



# Join route: returns chat room page
@app.get("/join", response_class=HTMLResponse)
def join_room(request: Request):
    return templates.TemplateResponse("room.html", {"request": request})



# WebSocket endpoint for real-time messaging
@app.websocket("/message")
async def websocket_endpoint(websocket: WebSocket):
    await connection_manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            await connection_manager.broadcast(websocket, data)
    except WebSocketDisconnect:
        connection_manager.disconnect(websocket)
        return RedirectResponse("/")
