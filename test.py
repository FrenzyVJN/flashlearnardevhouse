from fastapi import FastAPI, HTTPException, Request
from pydantic import BaseModel
from pymongo import MongoClient
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import hashlib

# MongoDB setup (replace with your actual Atlas URI)
client = MongoClient("mongodb+srv://FrenzyVJN:adminadmin@edita.6tl7jsm.mongodb.net/?appName=Edita")
db = client["flashlearnar"]
users_collection = db["users"]

app = FastAPI()

# CORS for frontend interaction
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Or your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class UserSignup(BaseModel):
    name: str
    username: str
    password: str
    bio: str
    avatar: str
    level: str
    projects: int = 0
    followers: int = 0
    following: int = 0

class UserLogin(BaseModel):
    username: str
    password: str

# Utils
def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

@app.post("/signup")
async def signup(user: UserSignup):
    if users_collection.find_one({"username": user.username}):
        raise HTTPException(status_code=400, detail="Username already exists")

    user_dict = user.dict()
    user_dict.update({
        "password": hash_password(user.password),
        "joinedDate": datetime.utcnow().isoformat(),
        "badges": [],
        "completedProjects": [],
        "savedItems": [],
        "activityFeed": []
    })

    users_collection.insert_one(user_dict)
    return {"message": "User registered successfully"}

@app.post("/login")
async def login(user: UserLogin):
    db_user = users_collection.find_one({"username": user.username})
    if not db_user or db_user["password"] != hash_password(user.password):
        raise HTTPException(status_code=401, detail="Invalid username or password")
    return {"message": "Login successful", "username": db_user["username"]}