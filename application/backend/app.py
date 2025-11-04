from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from typing import Dict, List
from sqlalchemy import create_engine, Column, Integer, String, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from dotenv import load_dotenv
import os
from fastapi.middleware.cors import CORSMiddleware

# Load environment variables from .env file
load_dotenv()

app = FastAPI()

# Database Configuration
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://logesh:@localhost/todolist")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# CORS Configuration
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000") # Default for development

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# SQLAlchemy Models
class DBUser(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    password = Column(String)

class DBTodoItem(Base):
    __tablename__ = "todos"
    id = Column(Integer, primary_key=True, index=True)
    task = Column(String)
    completed = Column(Boolean, default=False)
    owner_id = Column(Integer) # Foreign key to link with user

# Create database tables
Base.metadata.create_all(bind=engine)

# Dependency to get the database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class UserCreate(BaseModel):
    username: str
    password: str

class UserSignIn(BaseModel):
    username: str
    password: str

class TodoItemCreate(BaseModel):
    task: str
    completed: bool = False

class TodoItemUpdate(BaseModel):
    id: int
    task: str
    completed: bool = False

class TodoItemResponse(BaseModel):
    id: int
    task: str
    completed: bool

    class Config:
        from_attributes = True

@app.post("/signup")
async def signup(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(DBUser).filter(DBUser.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    new_user = DBUser(username=user.username, password=user.password) # In a real app, hash the password
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": "User registered successfully", "user_id": new_user.id}

@app.post("/signin")
async def signin(user: UserSignIn, db: Session = Depends(get_db)):
    db_user = db.query(DBUser).filter(DBUser.username == user.username).first()
    if not db_user or db_user.password != user.password: # In a real app, verify hashed password
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return {"message": "Signed in successfully", "user_id": db_user.id}

@app.put("/todoupdate/{user_id}")
async def todoupdate(user_id: int, todo_item: TodoItemUpdate, db: Session = Depends(get_db)):
    db_todo = db.query(DBTodoItem).filter(
        DBTodoItem.id == todo_item.id,
        DBTodoItem.owner_id == user_id
    ).first()

    if db_todo:
        db_todo.task = todo_item.task
        db_todo.completed = todo_item.completed
        db.commit()
        db.refresh(db_todo)
        return {"message": "Todo item updated successfully", "todo": TodoItemResponse.from_orm(db_todo)}
    else:
        # If todo item doesn't exist for this user, create a new one
        new_todo = DBTodoItem(task=todo_item.task, completed=todo_item.completed, owner_id=user_id)
        db.add(new_todo)
        db.commit()
        db.refresh(new_todo)
        return {"message": "Todo item added successfully", "todo": TodoItemResponse.from_orm(new_todo)}

@app.get("/todoget/{user_id}", response_model=List[TodoItemResponse])
async def todoget(user_id: int, db: Session = Depends(get_db)):
    todos = db.query(DBTodoItem).filter(DBTodoItem.owner_id == user_id).all()
    return todos
