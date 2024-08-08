import datetime
from bson import ObjectId
from fastapi import Cookie, FastAPI, HTTPException, Header, Request, requests
from fastapi.middleware.cors import CORSMiddleware
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import httpx
import pymongo

from app.config import settings
from app.routers import auth, user
from app.database import User
from app.config import settings

app = FastAPI()

origins = [
    settings.CLIENT_ORIGIN,
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class UpdatePastQuizRequest(BaseModel):
    Topic: str
    Difficulty: str
    TimeTaken: str
    Score: str
    Accuracy: str

templates = Jinja2Templates(directory="templates")
app.mount("/static", StaticFiles(directory="static"), name="static")

app.include_router(auth.router, tags=['Auth'], prefix='/api/auth')
app.include_router(user.router, tags=['Users'], prefix='/api/users')

async def get_user_data(access_token):
    headers = {"Authorization": f"Bearer {access_token}"}
    async with httpx.AsyncClient() as client:
        response = await client.get("http://localhost:8000/api/users/me", headers=headers)
        if response.status_code == 200:
            return response.json()
        else:
            # Handle the error, for example, raising an exception
            raise Exception(f"Failed to fetch user data: {response.text}")
      
@app.get("/quiz", response_class=HTMLResponse)
async def read_item(request: Request, access_token: str = Cookie(None)):
    try:
        user_data = await get_user_data(access_token)
        return templates.TemplateResponse("index.html", {"request": request, "user_data": user_data['user']})
    except Exception as e:
        # If an exception occurs (status code 500), redirect to /login
        return RedirectResponse("/login")


@app.get("/login", response_class=HTMLResponse)
async def read_item(request: Request):
    return templates.TemplateResponse("login.html", {"request": request})

@app.get("/signup", response_class=HTMLResponse)
async def read_item(request: Request):
    return templates.TemplateResponse("signup.html", {"request": request})

# @app.put("/users/{user_id}")
# async def update_past_quiz(user_id: str, request_data: UpdatePastQuizRequest):
#     if user_id not in users_data:
#         raise HTTPException(status_code=404, detail="User not found")

#     # past_quiz_data = request_data.dict()

#     # Update user's pastQuiz data
#     users_data[user_id]["pastQuiz"].append(past_quiz_data)
#     users_data[user_id]["updated_at"] = datetime.utcnow()

#     return {"message": "Past quiz updated successfully"}

@app.put("/update-users-data")
async def update_user(authorization: str = Header(...), data: dict = {}):
    user_data = await get_user_data(authorization)
    # if not user_data:
    #     raise HTTPException(status_code=401, detail="Unauthorized")
    # print(user_data)
    client = pymongo.MongoClient(settings.DATABASE_URL)
    db = client.get_database(settings.MONGO_INITDB_DATABASE)

    user_data['user']['pastQuiz'].append(data)
    # user_data['user']['updated_at'] = datetime.datetime.utcnow()
    id = user_data['user']['id']   
    query = { "_id": ObjectId(id) }
    newvalues = { "$push": { "pastQuiz": data } }
    result = db.users.update_one(query, newvalues)
    if result.acknowledged:
        return {"message": "Quiz data updated successfully"}
    else:
        raise HTTPException(status_code=500, detail="Failed to update quiz data")


@app.get("/api/healthchecker")
def root():
    return {"message": "Welcome to FastAPI with MongoDB"}