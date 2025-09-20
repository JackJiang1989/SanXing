from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, timedelta,timezone
from sqlalchemy import create_engine, Column, String, DateTime, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship, Session
from pydantic import BaseModel, EmailStr
from uuid import uuid4
import hashlib
import secrets
import random

app = FastAPI()

# 允许跨域请求（前端才能正常访问）
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # MVP 阶段先允许所有域名
    # allow_origins=["http://localhost:5173"],  # Allow only your frontend's origin
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

# TODO 这里的 SessionLocal 应该用 Depends 注入
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 获取数据库 session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Token model
class Token(Base):
    __tablename__ = "tokens"
    token = Column(String, primary_key=True, index=True)
    email = Column(String)
    expires_at = Column(DateTime(timezone=True))

class Question(Base):
    __tablename__ = "questions"
    id = Column(String, primary_key=True, index=True)
    tag = Column(String)
    inspiring_words = Column(String)
    question_text = Column(String)

    # Relationship with Answer
    answers = relationship("Answer", back_populates="question")


class Answer(Base):
    __tablename__ = "answers"
    id = Column(String, primary_key=True, index=True)
    user_email = Column(String, ForeignKey("users.email"))  # Foreign key to User.email
    content = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow())
    question_id = Column(String, ForeignKey("questions.id"))  # Foreign key to Question.id

    # Relationship with Question
    question = relationship("Question", back_populates="answers")

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
    question_id: str  # 接收前端传来的 question_id

class QuestionResponse(BaseModel):
    id: str
    question_text: str
    tag: str
    inspiring_words: str


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
@app.post("/api/auth/signup")
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

@app.post("/api/auth/login", response_model=TokenResponse)
def login(user: UserCreate):
    db = SessionLocal()
    db_user = db.query(User).filter(User.email == user.email).first()
    if not db_user or not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = generate_token()
    # expires_at = datetime.now(timezone.utc) + timedelta(hours=1)
    expires_at = datetime.utcnow() + timedelta(hours=1)  # naive but UTC
    new_token = Token(token=token, email=user.email, expires_at=expires_at)
    db.add(new_token)
    db.commit()
    db.close()
    return {"access_token": token, "token_type": "bearer"}

# 获取一个URL里ID指向的问题
@app.get("/api/question/{question_id}", response_model=QuestionResponse)
def get_question(question_id: str):
    db = SessionLocal()
    question = db.query(Question).filter(Question.id == question_id).first()
    db.close()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    return question  # 会自动转成 JSON，包含 id

# 获取所有问题
@app.get("/api/all_questions")
def get_all_questions(db: Session = Depends(get_db)):
    questions = db.query(Question).all()
    return [
        {
            "id": q.id,
            "question_text": q.question_text,
            "tag": q.tag,
            "inspiring_words": q.inspiring_words
        }
        for q in questions
    ]

@app.post("/api/answer")
def save_answer(answer: AnswerCreate, authorization: str = Header(...)):
    
    db = SessionLocal()

    # Extract the token from the Authorization header
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid Authorization header format")
    token = authorization.split(" ")[1]

    # Validate the token
    db_token = db.query(Token).filter(Token.token == token).first()
    if not db_token or db_token.expires_at < datetime.utcnow():
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    # Save the answer
    new_answer = Answer(
        id=str(uuid4()),
        user_email=db_token.email,
        content=answer.content,
        created_at=datetime.utcnow(),
        question_id=answer.question_id,  # 绑定到问题
    )
    db.add(new_answer)
    db.commit()
    db.close()

    return {"message": "Answer saved successfully"}


@app.get("/api/answer")
def get_answers(authorization: str = Header(...)):
    db = SessionLocal()

    # Extract the token from the Authorization header
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid Authorization header format")
    token = authorization.split(" ")[1]

    # Validate the token
    db_token = db.query(Token).filter(Token.token == token).first()
    if not db_token or db_token.expires_at < datetime.utcnow():
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    # Query answers for the user
    user_answers = db.query(Answer).filter(Answer.user_email == db_token.email).all()
    db.close()

    return {"answers": [{"id": a.id, "content": a.content, "created_at": a.created_at} for a in user_answers]}





class UserInfoResponse(BaseModel):
    email: str
    # name: str  # 或其他你需要展示的字段

def get_current_user(token: str = Header(...)):
    db = SessionLocal()
    db_token = db.query(Token).filter(Token.token == token).first()
    if not db_token or db_token.expires_at < datetime.utcnow():
        db.close()
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    user = db.query(User).filter(User.email == db_token.email).first()
    db.close()
    return user

@app.get("/api/me", response_model=UserInfoResponse)
def me(user=Depends(get_current_user)):
    return user