from datetime import datetime
from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional

class QuizResult(BaseModel):
    Topic: str
    Difficulty: str
    TimeTaken: str
    Score: str
    Accuracy: str

class UserBaseSchema(BaseModel):
    name: str
    email: str
    username: str
    role: Optional[str] = None
    pastQuiz: List[QuizResult] = Field(default_factory=list)
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        orm_mode = True


class CreateUserSchema(UserBaseSchema):
    password: str # type: ignore
    passwordConfirm: str
    verified: bool = False


class LoginUserSchema(BaseModel):
    email: EmailStr
    # password: constr(min_length=8) # type: ignore
    password: str


class UserResponseSchema(UserBaseSchema):
    id: str
    pass


class UserResponse(BaseModel):
    status: str
    user: UserResponseSchema
