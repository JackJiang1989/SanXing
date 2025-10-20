import os
from fastapi import FastAPI, HTTPException, Depends, Header, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from datetime import date, datetime, timedelta, timezone
from sqlalchemy import create_engine, Column, String, DateTime, ForeignKey, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship, Session
from uuid import uuid4
from typing import Optional, List, Dict, Any
import hashlib
import secrets
import random
from dotenv import load_dotenv
import re
import time


# ✅ 加载环境变量
load_dotenv()

# ✅ 环境配置
DEBUG = os.getenv("DEBUG", "False").lower() == "true"
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./test.db")
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*").split(",")

# ✅ FastAPI 实例
app = FastAPI(
    title="Your App API",
    debug=DEBUG,
)

# ✅ 动态 CORS 配置
if DEBUG:
    cors_origins = ["*"]
    print("🔧 Running in DEBUG mode - CORS allows all origins")
else:
    cors_origins = [origin.strip() for origin in ALLOWED_ORIGINS if origin.strip()]
    print(f"🚀 Running in PRODUCTION mode - CORS allowed origins: {cors_origins}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ 数据库配置
if DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg2://", 1)

connect_args = {}
if "sqlite" in DATABASE_URL:
    connect_args = {"check_same_thread": False}

engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
    echo=DEBUG
)

Base = declarative_base()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def safe_compare(dt1, dt2):
    """安全比较两个 datetime"""
    if dt1.tzinfo is None:
        dt1 = dt1.replace(tzinfo=timezone.utc)
    if dt2.tzinfo is None:
        dt2 = dt2.replace(tzinfo=timezone.utc)
    return dt1 < dt2

# 获取数据库 session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Database Models
class Token(Base):
    __tablename__ = "tokens"
    token = Column(String, primary_key=True, index=True)
    email = Column(String)
    expires_at = Column(DateTime(timezone=True))


class Question(Base):
    __tablename__ = "questions"
    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid4()))
    tag = Column(String)
    inspiring_words = Column(String)
    question_text = Column(String)
    created_by = Column(String, ForeignKey("users.id"), nullable=True)
    is_public = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    answers = relationship("Answer", back_populates="question")


class Answer(Base):
    __tablename__ = "answers"
    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid4()))
    user_email = Column(String, ForeignKey("users.email"))
    content = Column(String)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    question_id = Column(String, ForeignKey("questions.id"))
    question = relationship("Question", back_populates="answers")
    user = relationship("User", back_populates="answers")


class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True, default=lambda: str(uuid4()), index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    username = Column(String, default="Anonymous")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    answers = relationship("Answer", back_populates="user")
    folders = relationship("Folder", back_populates="user")


class Folder(Base):
    __tablename__ = "folders"
    id = Column(String, primary_key=True, default=lambda: str(uuid4()), index=True)
    name = Column(String, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    user = relationship("User", back_populates="folders")
    questions = relationship("FolderQuestion", back_populates="folder")


class FolderQuestion(Base):
    __tablename__ = "folder_questions"
    id = Column(String, primary_key=True, default=lambda: str(uuid4()), index=True)
    folder_id = Column(String, ForeignKey("folders.id"), nullable=False)
    question_id = Column(String, ForeignKey("questions.id"), nullable=False)
    folder = relationship("Folder", back_populates="questions")
    question = relationship("Question")


# Create tables
Base.metadata.create_all(bind=engine)


# Validation Functions (替代 Pydantic)
def validate_email(email: str) -> bool:
    """简单的邮箱格式验证"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None


def validate_user_create(data: Dict[str, Any]) -> Dict[str, str]:
    """验证用户创建数据"""
    email = data.get("email", "").strip()
    password = data.get("password", "")
    
    if not email or not validate_email(email):
        raise HTTPException(status_code=422, detail="Invalid email format")
    if not password or len(password) < 1:
        raise HTTPException(status_code=422, detail="Password is required")
    
    return {"email": email, "password": password}


def validate_answer_create(data: Dict[str, Any]) -> Dict[str, str]:
    """验证答案创建数据"""
    content = data.get("content", "").strip()
    question_id = data.get("question_id", "").strip()
    
    if not content:
        raise HTTPException(status_code=422, detail="Content is required")
    if not question_id:
        raise HTTPException(status_code=422, detail="Question ID is required")
    
    return {"content": content, "question_id": question_id}


def validate_question_create(data: Dict[str, Any]) -> Dict[str, Optional[str]]:
    """验证问题创建数据"""
    question_text = data.get("question_text", "").strip()
    
    if not question_text:
        raise HTTPException(status_code=422, detail="Question text is required")
    
    return {
        "question_text": question_text,
        "tag": data.get("tag"),
        "inspiring_words": data.get("inspiring_words")
    }


def validate_folder_create(data: Dict[str, Any]) -> Dict[str, str]:
    """验证文件夹创建数据"""
    name = data.get("name", "").strip()
    
    if not name:
        raise HTTPException(status_code=422, detail="Folder name is required")
    
    return {"name": name}


def validate_user_settings_update(data: Dict[str, Any]) -> Dict[str, Optional[str]]:
    """验证用户设置更新数据"""
    result = {}
    
    if "email" in data:
        email = data["email"].strip()
        if email and not validate_email(email):
            raise HTTPException(status_code=422, detail="Invalid email format")
        result["email"] = email if email else None
    
    if "username" in data:
        result["username"] = data["username"]
    
    if "password" in data:
        result["password"] = data["password"]
    
    return result


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


def get_current_user(authorization: str = Header(...)):
    """获取当前用户"""
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid token header")
    token = authorization.split(" ")[1]

    db = SessionLocal()
    db_token = db.query(Token).filter(Token.token == token).first()
    # print(db_token.expires_at, datetime.now(timezone.utc))
    # if not db_token or db_token.expires_at < datetime.now(timezone.utc):
    # if not db_token or db_token.expires_at < datetime.utcnow():
    if not db_token or safe_compare(db_token.expires_at, datetime.now(timezone.utc)):
        db.close()
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    user = db.query(User).filter(User.email == db_token.email).first()
    db.close()
    return user


# Response Serializers (替代 Pydantic response_model)
def serialize_question(q: Question) -> Dict[str, Any]:
    """序列化问题对象"""
    return {
        "id": q.id,
        "question_text": q.question_text,
        "tag": q.tag,
        "inspiring_words": q.inspiring_words
    }


def serialize_question_with_public(q: Question) -> Dict[str, Any]:
    """序列化问题对象（包含公开状态）"""
    return {
        "id": q.id,
        "question_text": q.question_text,
        "tag": q.tag,
        "inspiring_words": q.inspiring_words,
        "is_public": q.is_public,
        "created_at": q.created_at.isoformat()
    }


def serialize_answer_with_question(answer: Answer, question: Question) -> Dict[str, Any]:
    """序列化答案和问题"""
    return {
        "id": answer.id,
        "content": answer.content,
        "created_at": answer.created_at.isoformat(),
        "question_id": answer.question_id,
        "question_text": question.question_text
    }


def serialize_user_info(user: User) -> Dict[str, Any]:
    """序列化用户信息"""
    return {
        "email": user.email,
        "username": user.username,
        "created_at": user.created_at.isoformat()
    }


def serialize_folder(folder: Folder) -> Dict[str, Any]:
    """序列化文件夹"""
    questions = [serialize_question(fq.question) for fq in folder.questions]
    return {
        "id": folder.id,
        "name": folder.name,
        "created_at": folder.created_at.isoformat(),
        "questions": questions
    }


# Endpoints
@app.post("/api/auth/signup")
async def signup(data: Dict[str, Any]):
    validated = validate_user_create(data)
    db = SessionLocal()
    existing_user = db.query(User).filter(User.email == validated["email"]).first()
    if existing_user:
        db.close()
        raise HTTPException(status_code=400, detail="Email already registered")
    new_user = User(email=validated["email"], hashed_password=hash_password(validated["password"]))
    db.add(new_user)
    db.commit()
    db.close()
    return {"message": "User registered successfully"}


@app.post("/api/auth/login")
async def login(data: Dict[str, Any]):
    validated = validate_user_create(data)
    db = SessionLocal()
    db_user = db.query(User).filter(User.email == validated["email"]).first()
    if not db_user or not verify_password(validated["password"], db_user.hashed_password):
        db.close()
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = generate_token()
    expires_at = datetime.now(timezone.utc) + timedelta(hours=1)
    new_token = Token(token=token, email=validated["email"], expires_at=expires_at)
    db.add(new_token)
    db.commit()
    db.close()
    return {"access_token": token, "token_type": "bearer"}


@app.get("/api/question/{question_id}")
def get_question(question_id: str):
    db = SessionLocal()
    question = db.query(Question).filter(Question.id == question_id).first()
    db.close()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    return serialize_question(question)


@app.get("/api/all_questions")
def get_all_questions(db: Session = Depends(get_db)):
    questions = db.query(Question).all()
    return [serialize_question(q) for q in questions]


@app.post("/api/answer")
async def save_answer(data: Dict[str, Any], authorization: str = Header(...)):
    validated = validate_answer_create(data)
    db = SessionLocal()

    if not authorization.startswith("Bearer "):
        db.close()
        raise HTTPException(status_code=401, detail="Invalid Authorization header format")
    token = authorization.split(" ")[1]

    db_token = db.query(Token).filter(Token.token == token).first()
    # if not db_token or db_token.expires_at < datetime.now(timezone.utc):
    if not db_token or safe_compare(db_token.expires_at, datetime.now(timezone.utc)):
        db.close()
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    new_answer = Answer(
        user_email=db_token.email,
        content=validated["content"],
        created_at=datetime.now(timezone.utc),
        question_id=validated["question_id"],
    )
    db.add(new_answer)
    db.commit()
    db.close()

    return {"message": "Answer saved successfully"}


@app.get("/api/answer")
def get_answers(question_id: str = Query(...), authorization: str = Header(...)):
    db = SessionLocal()

    if not authorization.startswith("Bearer "):
        db.close()
        raise HTTPException(status_code=401, detail="Invalid Authorization header format")
    token = authorization.split(" ")[1]
    db_token = db.query(Token).filter(Token.token == token).first()
    # if not db_token or db_token.expires_at < datetime.now(timezone.utc):
    if not db_token or safe_compare(db_token.expires_at, datetime.now(timezone.utc)):    
        db.close()
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    answers = (
        db.query(Answer, Question)
        .join(Question, Answer.question_id == Question.id)
        .filter(Answer.user_email == db_token.email, Answer.question_id == question_id)
        .all()
    )
    db.close()

    return [serialize_answer_with_question(a.Answer, a.Question) for a in answers]


@app.get("/api/me")
def me(user=Depends(get_current_user)):
    return serialize_user_info(user)


@app.get("/api/user/settings")
def get_user_settings(user: User = Depends(get_current_user)):
    db = SessionLocal()
    answers = (
        db.query(Answer, Question)
        .join(Question, Answer.question_id == Question.id)
        .filter(Answer.user_email == user.email)
        .all()
    )
    db.close()
    
    answer_list = [
        {
            "id": a.Answer.id,
            "question_id": a.Answer.question_id,
            "question_text": a.Question.question_text,
            "content": a.Answer.content,
            "created_at": a.Answer.created_at.isoformat()
        }
        for a in answers
    ]
    
    return {
        "email": user.email,
        "username": user.username,
        "created_at": user.created_at.isoformat(),
        "answers": answer_list
    }


@app.put("/api/user/settings")
async def update_user_settings(
    data: Dict[str, Any],
    user: User = Depends(get_current_user)
):
    validated = validate_user_settings_update(data)
    db = SessionLocal()
    db_user = db.query(User).filter(User.id == user.id).first()
    if not db_user:
        db.close()
        raise HTTPException(status_code=404, detail="User not found")

    if validated.get("email"):
        db_user.email = validated["email"]
    if validated.get("username"):
        db_user.username = validated["username"]
    if validated.get("password"):
        db_user.hashed_password = hash_password(validated["password"])

    db.commit()
    db.refresh(db_user)
    db.close()
    return {"message": "User info updated successfully"}


@app.put("/api/answer/{answer_id}")
async def update_answer(
    answer_id: str,
    data: Dict[str, Any],
    user: User = Depends(get_current_user)
):
    content = data.get("content", "").strip()
    if not content:
        raise HTTPException(status_code=422, detail="Content is required")
    
    db = SessionLocal()
    answer = db.query(Answer).filter(
        Answer.id == answer_id,
        Answer.user_email == user.email
    ).first()
    if not answer:
        db.close()
        raise HTTPException(status_code=404, detail="Answer not found")

    answer.content = content
    db.commit()
    db.close()
    return {"message": "Answer updated successfully"}


@app.post("/api/my-questions")
async def create_question(data: Dict[str, Any], user: User = Depends(get_current_user)):
    validated = validate_question_create(data)
    db = SessionLocal()
    q = Question(
        question_text=validated["question_text"],
        tag=validated.get("tag"),
        inspiring_words=validated.get("inspiring_words"),
        created_by=user.id,
        is_public=False
    )
    db.add(q)
    db.commit()
    db.refresh(q)
    result = serialize_question_with_public(q)
    db.close()
    return result


@app.get("/api/my-questions")
def list_my_questions(user: User = Depends(get_current_user)):
    db = SessionLocal()
    my_questions = db.query(Question).filter(Question.created_by == user.id).all()
    db.close()
    return [serialize_question(q) for q in my_questions]


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


@app.post("/api/folders")
async def create_folder(data: Dict[str, Any], user: User = Depends(get_current_user)):
    validated = validate_folder_create(data)
    db = SessionLocal()
    folder = Folder(
        name=validated["name"],
        user_id=user.id
    )
    db.add(folder)
    db.commit()
    db.refresh(folder)
    _ = folder.questions
    result = serialize_folder(folder)
    db.close()
    return result


@app.get("/api/folders")
def list_folders(user: User = Depends(get_current_user)):
    db = SessionLocal()
    folders = db.query(Folder).filter(Folder.user_id == user.id).all()
    results = [serialize_folder(f) for f in folders]
    db.close()
    return results


@app.put("/api/folders/{folder_id}")
async def rename_folder(folder_id: str, data: Dict[str, Any], user: User = Depends(get_current_user)):
    validated = validate_folder_create(data)
    db = SessionLocal()
    folder = db.query(Folder).filter(Folder.id == folder_id, Folder.user_id == user.id).first()
    if not folder:
        db.close()
        raise HTTPException(status_code=404, detail="Folder not found")
    folder.name = validated["name"]
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
async def add_question_to_folder(folder_id: str, question_id: str, user: User = Depends(get_current_user)):
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


@app.get("/api/user/activity")
def get_user_activity(
    year: int = Query(..., ge=1900, le=2100, description="年份"),
    month: int = Query(..., ge=1, le=12, description="月份(1-12)"),
    user: User = Depends(get_current_user)
):
    """获取用户某月的写作活跃度统计"""
    db = SessionLocal()
    
    try:
        start_date = datetime(year, month, 1)
        if month == 12:
            end_date = datetime(year + 1, 1, 1)
        else:
            end_date = datetime(year, month + 1, 1)
        
        answers = db.query(Answer).filter(
            Answer.user_email == user.email,
            Answer.created_at >= start_date,
            Answer.created_at < end_date
        ).all()
        
        daily_counts = {}
        for answer in answers:
            date_str = answer.created_at.strftime("%Y-%m-%d")
            daily_counts[date_str] = daily_counts.get(date_str, 0) + 1
        
        return {
            "year": year,
            "month": month,
            "daily_counts": daily_counts
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid date: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        db.close()


@app.get("/api/user/answers/by-date")
def get_answers_by_date(
    date: str = Query(..., description="格式: YYYY-MM-DD"),
    user: User = Depends(get_current_user)
):
    """获取用户某天的所有答案"""
    db = SessionLocal()
    
    try:
        target_date = datetime.strptime(date, "%Y-%m-%d")
    except ValueError:
        db.close()
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
    
    start_time = target_date
    end_time = target_date + timedelta(days=1)
    
    answers = (
        db.query(Answer, Question)
        .join(Question, Answer.question_id == Question.id)
        .filter(
            Answer.user_email == user.email,
            Answer.created_at >= start_time,
            Answer.created_at < end_time
        )
        .order_by(Answer.created_at)
        .all()
    )
    
    db.close()
    
    answer_list = [
        {
            "id": a.Answer.id,
            "content": a.Answer.content,
            "created_at": a.Answer.created_at.isoformat(),
            "question_id": a.Question.id,
            "question_text": a.Question.question_text,
            "tag": a.Question.tag
        }
        for a in answers
    ]
    
    return {
        "date": date,
        "answers": answer_list
    }


@app.get("/api/daily-questions")
def get_daily_questions(db: Session = Depends(get_db)):
    """
    返回每日推荐的3个问题
    使用当天日期作为随机种子，确保同一天返回相同的问题
    """
    all_questions = db.query(Question).all()
    
    if len(all_questions) < 3:
        return [serialize_question(q) for q in all_questions]
    
    today = date.today() + timedelta(days=2)
    seed = int(today.strftime("%Y%m%d"))
    random.seed(seed)
    
    selected = random.sample(all_questions, 3)
    
    return [serialize_question(q) for q in selected]



#健康检查
# 应用启动时间（用于 uptime 计算）
APP_START_TIME = time.time()

@app.get("/health")
async def health_check():
    """
    基础健康检查
    返回 200 表示服务正常运行
    """
    return {"status": "healthy", "service": "fastapi"}


@app.get("/health/ready")
async def readiness_check(db: Session = Depends(get_db)):
    """
    就绪检查 - 检查服务是否准备好接收流量
    包含数据库连接检查
    """
    try:
        # 测试数据库连接
        db.execute("SELECT 1")
        
        return {
            "status": "ready",
            "database": "connected",
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
    except Exception as e:
        return JSONResponse(
            status_code=503,
            content={
                "status": "not ready",
                "database": "disconnected",
                "error": str(e),
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
        )


@app.get("/health/live")
async def liveness_check():
    """
    存活检查 - 检查应用是否仍在运行
    不检查依赖项，只确认进程存活
    """
    uptime_seconds = int(time.time() - APP_START_TIME)
    return {
        "status": "alive",
        "uptime_seconds": uptime_seconds,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }


@app.get("/health/detailed")
async def detailed_health_check(db: Session = Depends(get_db)):
    """
    详细健康检查 - 返回完整的系统状态
    包含数据库、环境等信息
    """
    health_status = {
        "status": "healthy",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "uptime_seconds": int(time.time() - APP_START_TIME),
        "environment": ENVIRONMENT,
        "debug_mode": DEBUG,
        "checks": {}
    }
    
    # 数据库检查
    try:
        db.execute("SELECT 1")
        health_status["checks"]["database"] = {
            "status": "healthy",
            "message": "Database connection successful"
        }
    except Exception as e:
        health_status["status"] = "unhealthy"
        health_status["checks"]["database"] = {
            "status": "unhealthy",
            "error": str(e)
        }
    
    # 数据统计检查
    try:
        question_count = db.query(Question).count()
        user_count = db.query(User).count()
        answer_count = db.query(Answer).count()
        
        health_status["checks"]["data"] = {
            "status": "healthy",
            "statistics": {
                "questions": question_count,
                "users": user_count,
                "answers": answer_count
            }
        }
    except Exception as e:
        health_status["checks"]["data"] = {
            "status": "warning",
            "error": str(e)
        }
    
    # 根据检查结果返回适当的状态码
    status_code = 200 if health_status["status"] == "healthy" else 503
    return JSONResponse(status_code=status_code, content=health_status)


# 可选：添加根路径重定向到 API 文档
@app.get("/")
async def root():
    """
    根路径 - 返回 API 信息
    """
    return {
        "service": "Your App API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
        "health_check": "/health",
        "environment": ENVIRONMENT
    }
