from fastapi import FastAPI, HTTPException, Request
from pydantic import BaseModel
from pymongo import MongoClient
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import hashlib
from typing import List

# MongoDB setup (replace with your actual Atlas URI)
client = MongoClient("mongodb+srv://FrenzyVJN:adminadmin@edita.6tl7jsm.mongodb.net/?appName=Edita")
db = client["flashlearnar"]
users_collection = db["users"]
projects_collection = db["Projects"]

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
    confirmPassword: str
    termsAccepted: bool

class UserLogin(BaseModel):
    username: str
    password: str

# Utils
def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

class UserDetailsForPublish(BaseModel):
    name: str
    avatar: str
    level: str

class ProjectPost(BaseModel):
    user: UserDetailsForPublish
    title: str
    content: str
    image: str
    projectName: str
    tags: List[str]

@app.post("/signup")
async def signup(user: UserSignup):
    print(user)
    if users_collection.find_one({"username": user.username}):
        raise HTTPException(status_code=400, detail="Username already exists")

    user_dict = user.dict()
    user_dict.update({
        "bio": "Add your bio here!",
        "avatar": "https://http.cat/images/418.jpg",
        "level": "",
        "projects": 0,
        "followers": 0,
        "following": 0,
        "joinedDate": datetime.utcnow().isoformat(),
        "badges": [],
        "completedProjects": [],
        "savedItems": [],
        "activityFeed": []
    })

    result = users_collection.insert_one(user_dict)
    user_dict["_id"] = str(result.inserted_id)
    return {"message": "User registered successfully", "user": user_dict}

@app.post("/login")
async def login(user: UserLogin):
    db_user = users_collection.find_one({"username": user.username})
    if not db_user or db_user["password"] != user.password:
        raise HTTPException(status_code=401, detail="Invalid username or password")
    
    sanitized_user = {
        key: value for key, value in db_user.items()
        if key not in ("_id", "password")
    }

    return {"message": "User Login successfully", "user": sanitized_user}

@app.post("/projects")
def add_project(project: ProjectPost):
    new_project = project.dict()
    new_project["likes"] = 0
    new_project["comments"] = 0
    result = projects_collection.insert_one(new_project)
    
    return {"message": "Project added"}