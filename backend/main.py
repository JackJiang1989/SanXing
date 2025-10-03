from fastapi import FastAPI, HTTPException, Depends, Header, Query
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, timedelta,timezone
from sqlalchemy import create_engine, Column, String, DateTime, ForeignKey,Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship, Session
from pydantic import BaseModel, EmailStr
from uuid import uuid4
from typing import Optional, List
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
    # id = Column(String, primary_key=True, index=True)
    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid4()))
    tag = Column(String)
    inspiring_words = Column(String)
    question_text = Column(String)

    created_by = Column(String, ForeignKey("users.id"), nullable=True)  # ✅ 作者ID
    is_public = Column(Boolean, default=False)                          # ✅ 是否公开
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationship with Answer
    answers = relationship("Answer", back_populates="question")


class Answer(Base):
    __tablename__ = "answers"
    # id = Column(String, primary_key=True, index=True)
    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid4()))
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
    # 主键ID，推荐UUID或自增
    id = Column(String, primary_key=True, default=lambda: str(uuid4()), index=True)
    # 邮箱设置为唯一约束即可
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    # 用户名
    username = Column(String, default="Anonymous")
    # 注册时间（注意这里不加括号）
    created_at = Column(DateTime, default=datetime.utcnow)
    # Relationship with Answer
    answers = relationship("Answer", back_populates="user")

    # Relationship with Folder
    folders = relationship("Folder", back_populates="user")


class Folder(Base):
    __tablename__ = "folders"

    id = Column(String, primary_key=True, default=lambda: str(uuid4()), index=True)
    name = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)

    # 关系：一个文件夹属于一个用户
    user = relationship("User", back_populates="folders")

    # 多对多关系：文件夹和问题
    questions = relationship("FolderQuestion", back_populates="folder")

class FolderQuestion(Base):
    __tablename__ = "folder_questions"

    id = Column(String, primary_key=True, default=lambda: str(uuid4()), index=True)
    folder_id = Column(String, ForeignKey("folders.id"), nullable=False)
    question_id = Column(String, ForeignKey("questions.id"), nullable=False)

    # 关系
    folder = relationship("Folder", back_populates="questions")
    question = relationship("Question")


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
    class Config:
        orm_mode = True  # 开启 ORM 模式

class UserInfoResponse(BaseModel):
    email: str
    username: str
    created_at: datetime


class AnswerWithQuestionResponse(BaseModel):
    id: str
    content: str
    created_at: datetime
    question_id: str
    question_text: str  # 你想返回问题文本

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
        # id=str(uuid4()),
        user_email=db_token.email,
        content=answer.content,
        created_at=datetime.utcnow(),
        question_id=answer.question_id,  # 绑定到问题
    )
    db.add(new_answer)
    db.commit()
    db.close()

    return {"message": "Answer saved successfully"}


@app.get("/api/answer", response_model=list[AnswerWithQuestionResponse])
def get_answers(question_id: str = Query(...), authorization: str = Header(...)):
    db = SessionLocal()

    # 验证 token
    if not authorization.startswith("Bearer "):
        db.close()
        raise HTTPException(status_code=401, detail="Invalid Authorization header format")
    token = authorization.split(" ")[1]
    db_token = db.query(Token).filter(Token.token == token).first()
    if not db_token or db_token.expires_at < datetime.utcnow():
        db.close()
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    # 查询当前用户指定问题的答案
    answers = (
        db.query(Answer, Question)
        .join(Question, Answer.question_id == Question.id)
        .filter(Answer.user_email == db_token.email, Answer.question_id == question_id)
        .all()
    )
    db.close()

    # 返回列表
    return [
        {
            "id": a.Answer.id,
            "content": a.Answer.content,
            "created_at": a.Answer.created_at,
            "question_id": a.Answer.question_id,
            "question_text": a.Question.question_text
        }
        for a in answers
    ]


def get_current_user(authorization: str = Header(...)):
    # Authorization: Bearer <token>
    
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid token header")
    token = authorization.split(" ")[1]

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
    return UserInfoResponse(
        email=user.email,
        username=user.username,
        created_at=user.created_at
    )

# 单个答案结构
class AnswerInfo(BaseModel):
    id: str    
    question_id: str
    question_text: str
    content: str
    created_at: datetime

# 获取用户信息
class UserSettingsResponse(BaseModel):
    email: str
    username: str
    created_at: datetime
    answers: List[AnswerInfo]

# 更新用户信息（可选字段）
class UserSettingsUpdate(BaseModel):
    email: Optional[EmailStr] = None
    username: Optional[str] = None
    password: Optional[str] = None

class AnswerUpdate(BaseModel):
    content: str

@app.get("/api/user/settings", response_model=UserSettingsResponse)
def get_user_settings(user: User = Depends(get_current_user)):
    db = SessionLocal()
    answers = (
        db.query(Answer, Question)
        .join(Question, Answer.question_id == Question.id)
        .filter(Answer.user_email == user.email)
        .all()
    )
    db.close()
    return UserSettingsResponse(
        email=user.email,
        username=user.username,
        created_at=user.created_at,
        answers=[
            AnswerInfo(
                id=a.Answer.id,
                question_id=a.Answer.question_id,
                question_text=a.Question.question_text,
                content=a.Answer.content,
                created_at=a.Answer.created_at
            )
            for a in answers
        ]
    )


@app.put("/api/user/settings")
def update_user_settings(
    data: UserSettingsUpdate,
    user: User = Depends(get_current_user)
):
    db = SessionLocal()
    db_user = db.query(User).filter(User.id == user.id).first()
    if not db_user:
        db.close()
        raise HTTPException(status_code=404, detail="User not found")

    if data.email:
        db_user.email = data.email
    if data.username:
        db_user.username = data.username
    if data.password:
        db_user.hashed_password = hash_password(data.password)

    db.commit()
    db.refresh(db_user)
    db.close()
    return {"message": "User info updated successfully"}


@app.put("/api/answer/{answer_id}")
def update_answer(
    answer_id: str,
    data: AnswerUpdate,
    user: User = Depends(get_current_user)
):
    db = SessionLocal()
    answer = db.query(Answer).filter(
        Answer.id == answer_id,
        Answer.user_email == user.email
    ).first()
    if not answer:
        db.close()
        raise HTTPException(status_code=404, detail="Answer not found")

    answer.content = data.content
    db.commit()
    db.close()
    return {"message": "Answer updated successfully"}

class myQuestionCreate(BaseModel):
    question_text: str
    tag: Optional[str] = None
    inspiring_words: Optional[str] = None

class myQuestionResponse(BaseModel):
    id: str
    question_text: str
    tag: Optional[str]
    inspiring_words: Optional[str]
    is_public: bool
    created_at: datetime

    class Config:
        orm_mode = True


@app.post("/api/my-questions", response_model=myQuestionResponse)
def create_question(data: myQuestionCreate, user: User = Depends(get_current_user)):
    db = SessionLocal()
    q = Question(
        question_text=data.question_text,
        tag=data.tag,
        inspiring_words=data.inspiring_words,
        created_by=user.id,
        is_public=False
    )
    db.add(q)
    db.commit()
    db.refresh(q)
    db.close()
    return q


@app.get("/api/my-questions", response_model=list[QuestionResponse])
def list_my_questions(user: User = Depends(get_current_user)):
    db = SessionLocal()
    my_questions = db.query(Question).filter(Question.created_by == user.id).all()
    db.close()
    return my_questions

@app.put("/api/my-questions/{question_id}/share")
def share_question(question_id: str, user: User = Depends(get_current_user)):
    db = SessionLocal()
    q = db.query(Question).filter(
        Question.id == question_id,
        Question.created_by == user.id
    ).first()
    if not q:
        db.close()
        raise HTTPException(status_code=404, detail="Question not found or not owned by user")
    q.is_public = True
    db.commit()
    db.close()
    return {"message": "Question is now public"}




class QuestionInfo(BaseModel):
    id: str
    question_text: str
    tag: Optional[str]
    inspiring_words: Optional[str]

    class Config:
        orm_mode = True


class FolderCreate(BaseModel):
    name: str


class FolderResponse(BaseModel):
    id: str
    name: str
    created_at: datetime
    questions: List[QuestionInfo] = []

    class Config:
        orm_mode = True


@app.post("/api/folders", response_model=FolderResponse)
def create_folder(data: FolderCreate, user: User = Depends(get_current_user)):
    db = SessionLocal()
    folder = Folder(
        name=data.name,
        user_id=user.id
    )
    db.add(folder)
    db.commit()
    db.refresh(folder)
    db.close()
    return folder


@app.get("/api/folders", response_model=List[FolderResponse])
def list_folders(user: User = Depends(get_current_user)):
    db = SessionLocal()
    folders = db.query(Folder).filter(Folder.user_id == user.id).all()
    results = []
    for f in folders:
        questions = [QuestionInfo.from_orm(fq.question) for fq in f.questions]
        results.append(FolderResponse(
            id=f.id,
            name=f.name,
            created_at=f.created_at,
            questions=questions
        ))
    db.close()
    return results


@app.put("/api/folders/{folder_id}")
def rename_folder(folder_id: str, data: FolderCreate, user: User = Depends(get_current_user)):
    db = SessionLocal()
    folder = db.query(Folder).filter(Folder.id == folder_id, Folder.user_id == user.id).first()
    if not folder:
        db.close()
        raise HTTPException(status_code=404, detail="Folder not found")
    folder.name = data.name
    db.commit()
    db.close()
    return {"message": "Folder renamed successfully"}


@app.delete("/api/folders/{folder_id}")
def delete_folder(folder_id: str, user: User = Depends(get_current_user)):
    db = SessionLocal()
    folder = db.query(Folder).filter(Folder.id == folder_id, Folder.user_id == user.id).first()
    if not folder:
        db.close()
        raise HTTPException(status_code=404, detail="Folder not found")
    db.delete(folder)
    db.commit()
    db.close()
    return {"message": "Folder deleted successfully"}


@app.post("/api/folders/{folder_id}/questions")
def add_question_to_folder(folder_id: str, question_id: str, user: User = Depends(get_current_user)):
    db = SessionLocal()
    folder = db.query(Folder).filter(Folder.id == folder_id, Folder.user_id == user.id).first()
    if not folder:
        db.close()
        raise HTTPException(status_code=404, detail="Folder not found")

    fq = FolderQuestion(folder_id=folder_id, question_id=question_id)
    db.add(fq)
    db.commit()
    db.close()
    return {"message": "Question added to folder successfully"}


@app.delete("/api/folders/{folder_id}/questions/{question_id}")
def remove_question_from_folder(folder_id: str, question_id: str, user: User = Depends(get_current_user)):
    db = SessionLocal()
    fq = db.query(FolderQuestion).join(Folder).filter(
        FolderQuestion.folder_id == folder_id,
        FolderQuestion.question_id == question_id,
        Folder.user_id == user.id
    ).first()
    if not fq:
        db.close()
        raise HTTPException(status_code=404, detail="Question not in folder")
    db.delete(fq)
    db.commit()
    db.close()
    return {"message": "Question removed from folder successfully"}