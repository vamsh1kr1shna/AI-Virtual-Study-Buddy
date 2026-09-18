from fastapi import FastAPI
from pydantic import BaseModel
from dotenv import load_dotenv
from groq import Groq
from supabase import create_client, Client
from fastapi.middleware.cors import CORSMiddleware
import os

load_dotenv()

# Supabase
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

supabase: Client = create_client(
    SUPABASE_URL,
    SUPABASE_KEY
)

# Groq
client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
    "https://zooming-trust-production-56d8.up.railway.app",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatRequest(BaseModel):
    message: str
    user_id: str

class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

class TaskCreate(BaseModel):
    user_id: str
    title: str
    description: str = ""
    subject: str = ""
    status: str = "todo"
    priority: str = "medium"
    due_date: str = ""
    estimated_time: str = ""

@app.get("/")
def home():
    return {
        "message": "Backend is working!"
    }


@app.post("/register")
def register(user: RegisterRequest):

    try:
        result = supabase.table("users").insert({
            "name": user.name,
            "email": user.email,
            "password": user.password
        }).execute()

        return {
            "message": "User registered successfully",
            "data": result.data
        }

    except Exception as e:
        return {
            "message": "Registration failed",
            "error": str(e)
        }

@app.post("/login")
def login(user: LoginRequest):

    result = supabase.table("users").select("*").eq(
        "email",
        user.email
    ).execute()

    if len(result.data) == 0:
        return {
            "message": "User not found"
        }

    db_user = result.data[0]

    if db_user["password"] != user.password:
        return {
            "message": "Invalid password"
        }

    return {
        "message": "Login successful",
        "user": {
            "id": db_user["id"],
            "name": db_user["name"],
            "email": db_user["email"]
        }
    }

@app.post("/chat")
def chat(data: ChatRequest):
    response = client.chat.completions.create(
        model="openai/gpt-oss-120b",
        messages=[
            {
                "role": "user",
                "content": data.message
            }
        ]
    )

    reply = response.choices[0].message.content

    supabase.table("chat_messages").insert([
        {
            "user_id": data.user_id,
            "role": "user",
            "content": data.message
        },
        {
            "user_id": data.user_id,
            "role": "assistant",
            "content": reply
        }
    ]).execute()

    return {
        "reply": reply
    }
@app.get("/chat-history/{user_id}")
def get_chat_history(user_id: str):
    result = (
        supabase
        .table("chat_messages")
        .select("id, role, content, created_at")
        .eq("user_id", user_id)
        .order("created_at")
        .execute()
    )

    return {
        "messages": result.data
    }
@app.post("/tasks")
def create_task(task: TaskCreate):

    result = supabase.table("tasks").insert({
        "user_id": task.user_id,
        "title": task.title,
        "description": task.description,
        "subject": task.subject,
        "status": task.status,
        "priority": task.priority,
        "due_date": task.due_date,
        "estimated_time": task.estimated_time
    }).execute()

    return {
        "message": "Task created successfully",
        "task": result.data
    }


@app.get("/tasks/{user_id}")
def get_tasks(user_id: str):

    result = supabase.table("tasks").select("*").eq(
        "user_id",
        user_id
    ).execute()

    return {
        "tasks": result.data
    }


class TaskUpdate(BaseModel):
    status: str


@app.put("/tasks/{task_id}")
def update_task(task_id: str, task: TaskUpdate):

    result = supabase.table("tasks").update({
        "status": task.status
    }).eq(
        "id",
        task_id
    ).execute()

    return {
        "message": "Task updated successfully",
        "task": result.data
    }
class StudySessionCreate(BaseModel):
    user_id: str
    subject: str
    topic: str
    session_date: str
    session_time: str
    duration: str


@app.post("/study-sessions")
def create_study_session(session: StudySessionCreate):

    result = supabase.table("study_sessions").insert({
        "user_id": session.user_id,
        "subject": session.subject,
        "topic": session.topic,
        "session_date": session.session_date,
        "session_time": session.session_time,
        "duration": session.duration
    }).execute()

    return {
        "message": "Study session created",
        "data": result.data
    }


@app.get("/study-sessions/{user_id}")
def get_study_sessions(user_id: str):

    result = supabase.table("study_sessions").select("*").eq(
        "user_id",
        user_id
    ).execute()

    return {
        "sessions": result.data
    }