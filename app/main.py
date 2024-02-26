from fastapi import Cookie, FastAPI, Request, requests
from fastapi.middleware.cors import CORSMiddleware
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
import httpx

from app.config import settings
from app.routers import auth, user
from app.database import User


app = FastAPI()

origins = [
    settings.CLIENT_ORIGIN,
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
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
    # print(request)
    user_data = await get_user_data(access_token)
    # print(user_data)
    return templates.TemplateResponse("index.html", {"request": request, "user_data": user_data['user']})


@app.get("/login", response_class=HTMLResponse)
async def read_item(request: Request):
    return templates.TemplateResponse("login.html", {"request": request})

@app.get("/signup", response_class=HTMLResponse)
async def read_item(request: Request):
    return templates.TemplateResponse("signup.html", {"request": request})

@app.get("/api/healthchecker")
def root():
    return {"message": "Welcome to FastAPI with MongoDB"}