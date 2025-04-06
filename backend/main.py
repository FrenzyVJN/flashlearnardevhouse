import base64
import io
from fastapi import FastAPI, HTTPException, Request
from pydantic import BaseModel
from pymongo import DESCENDING, MongoClient
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import hashlib
from typing import List, Optional
from agno.agent import Agent
from agno.models.google.gemini import Gemini
from pydantic import BaseModel, Field
from typing import Annotated
import asyncio
from fastapi import FastAPI, File, UploadFile
    
import moondream as md
from PIL import Image
from agno.media import Image
from agno.tools.tavily import TavilyTools
from agno.models.google.gemini import Gemini
from PIL import Image as im

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

model = md.vl(model='./moondream-2b-int8.mf.gz') 

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

class Objects(BaseModel):
    item: List[str] = Field(..., description="name of the item")

class project(BaseModel):
    name: str = Field(..., description="name of the project")
    description: str = Field(..., description="description of the project")
    difficulty: str = Field(..., description="difficulty of the project")
    instructions: List[str] = Field(..., description="instructions to make the project")
    references: List[str] = Field(..., description="references to make the project")

class Projects(BaseModel):
    projects: List[project] = Field(..., description="list of projects")

detect = Agent(
        search_knowledge=True,
        model=Gemini(id="gemini-2.0-flash", api_key="AIzaSyDd80SlBKdNeyBF5qUctny6Fp80iEiftOg"),
        tools=[TavilyTools(api_key="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")],
        description="you are an image detection model",
        instructions=["list the items in the image",
                    "ignore insignificant items like connecting wires and screws",
                    "be as specific as possible"],
        response_model=Objects
)

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

@app.post("/publish")
async def add_project(project: ProjectPost):
    new_project = project.dict()
    new_project["likes"] = 0
    new_project["comments"] = 0
    result = projects_collection.insert_one(new_project)
    
    return {"message": "Project added"}

@app.get("/projects")
async def get_latest_projects():
    projects_cursor = projects_collection.find().sort("_id", DESCENDING).limit(10)
    projects = []

    for project in projects_cursor:
        project["_id"] = str(project["_id"])
        projects.append(project)

    return {"projects": projects}

@app.post("/detect/")
def detect_objects(file: UploadFile):
    image = file.file.read()
    objs = detect.run(
            "list the items in this image",
            images=[
                Image(
                    content=image,
                )
            ]
        )
    return objs.content.item


@app.get("/")
def read_root():
    return {"message": "Hello, world!"}

class AnalyzeRequest(BaseModel):
    image_data: str

@app.post("/analyze/")
def analyze_step(request: AnalyzeRequest):
    """
    Analyze a project step using the camera image.
    """
    if model is None:
        # For testing without the model, return mock data
        print("Model not available, returning mock data")
        return {
            "success": True,
            "analysis": {
                "completed": True,
                "feedback": "Mock analysis: This step appears to be completed correctly.",
                "confidence": 0.85,
                "nextStepRecommendation": "You can proceed to the next step."
            }
        }
        
        # Extract the base64 part of the data URL
    if "," in request.image_data:
        base64_str = request.image_data.split(",")[1]
    else:
        base64_str = request.image_data
        
    # Decode the base64 image
    image_bytes = base64.b64decode(base64_str)
    image = im.open(io.BytesIO(image_bytes))
    
    # Create the prompt based on instructions and context
    
    # Run detection/analysis
    result = model.point(image, "phone")
    
    return {
        "success": True,
        "analysis": {
            "feedback": result,
            "confidence": 0.85,  # Placeholder since Moondream doesn't return confidence
        }
    }
