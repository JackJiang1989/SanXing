from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, timedelta,timezone
from sqlalchemy import create_engine, Column, String, DateTime, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from pydantic import BaseModel, EmailStr
from uuid import uuid4
import hashlib
import secrets
import random

app = FastAPI()

# 允许跨域请求（前端才能正常访问）
app.add_middleware(
    CORSMiddleware,
    # allow_origins=["*"],  # MVP 阶段先允许所有域名
    allow_origins=["http://localhost:5173"],  # Allow only your frontend's origin
    allow_credentials=True,  # Allow cookies and Authorization headers
    allow_methods=["*"],  # Allow all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers (e.g., Content-Type, Authorization)
)

# 哲学问题池
questions = [
    "你如何理解幸福？",
    "自由和责任，哪个更重要？",
    "如果一切都是命运安排的，我们还需要努力吗？",
    "人类追求真理是否可能？",
    "孤独是一种力量还是一种缺陷？",
    "如果没有死亡，人生还有意义吗？",
    "正义和善良，是否永远一致？",
    "你认为痛苦对成长有必要吗？",
    "科技让我们更自由还是更依赖？",
    "美好生活的标准是什么？"
]

@app.get("/api/question")
def get_question():
    # 随机抽取一个问题
    return {"question": random.choice(questions)}

# # In-memory user database (for simplicity)
# users_db = {}
# tokens_db = {}  # Store tokens temporarily for simplicity

DATABASE_URL = "sqlite:///./test.db"  # Use SQLite for simplicity
Base = declarative_base()
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Models
# class User(Base):
#     __tablename__ = "users"
#     email = Column(String, primary_key=True, index=True)
#     hashed_password = Column(String)

# Token model
class Token(Base):
    __tablename__ = "tokens"
    token = Column(String, primary_key=True, index=True)
    email = Column(String)
    expires_at = Column(DateTime)

class Answer(Base):
    __tablename__ = "answers"
    id = Column(String, primary_key=True, index=True)
    user_email = Column(String, ForeignKey("users.email"))  # Foreign key to User.email
    content = Column(String)
    created_at = Column(DateTime, default=datetime.now(timezone.utc))

    # Relationship with User
    user = relationship("User", back_populates="answers")

# Add a relationship in the User model
class User(Base):
    __tablename__ = "users"
    email = Column(String, primary_key=True, index=True)
    hashed_password = Column(String)

    # Relationship with Answer
    answers = relationship("Answer", back_populates="user")

# Create tables
Base.metadata.create_all(bind=engine)

# Pydantic models
class UserCreate(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str

# Define a Pydantic model for the request body
class AnswerCreate(BaseModel):
    content: str

# Utility functions
def hash_password(password: str) -> str:
    """Hash a password using SHA-256."""
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash."""
    return hash_password(plain_password) == hashed_password

def generate_token() -> str:
    """Generate a random token."""
    return secrets.token_hex(16)

# Endpoints
@app.post("/auth/signup")
def signup(user: UserCreate):
    db = SessionLocal()
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    new_user = User(email=user.email, hashed_password=hash_password(user.password))
    db.add(new_user)
    db.commit()
    db.close()
    return {"message": "User registered successfully"}

@app.post("/auth/login", response_model=TokenResponse)
def login(user: UserCreate):
    db = SessionLocal()
    db_user = db.query(User).filter(User.email == user.email).first()
    if not db_user or not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = generate_token()
    expires_at = datetime.now(timezone.utc) + timedelta(hours=1)
    new_token = Token(token=token, email=user.email, expires_at=expires_at)
    db.add(new_token)
    db.commit()
    db.close()
    return {"access_token": token, "token_type": "bearer"}


@app.post("/answer")
def save_answer(answer: AnswerCreate, authorization: str = Header(...)):
    db = SessionLocal()

    # Extract the token from the Authorization header
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid Authorization header format")
    token = authorization.split(" ")[1]

    # Validate the token
    db_token = db.query(Token).filter(Token.token == token).first()
    if not db_token or db_token.expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    # Save the answer
    new_answer = Answer(
        id=str(uuid4()),
        user_email=db_token.email,
        content=answer.content,  # Access the content from the Pydantic model
        created_at=datetime.now(timezone.utc),
    )
    db.add(new_answer)
    db.commit()
    db.close()

    return {"message": "Answer saved successfully"}


@app.get("/answers")
def get_answers(token: str = Header(...)):
    db = SessionLocal()

    # Validate token
    db_token = db.query(Token).filter(Token.token == token).first()
    if not db_token or db_token.expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    # Query answers for the user
    user_answers = db.query(Answer).filter(Answer.user_email == db_token.email).all()
    db.close()

    return {"answers": [{"id": a.id, "content": a.content, "created_at": a.created_at} for a in user_answers]}
