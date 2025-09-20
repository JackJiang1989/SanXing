from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, String
from uuid import uuid4
import os

# 获取项目根目录路径
BASE_DIR = os.path.dirname(os.path.abspath(__file__))  # 当前文件所在目录
DATABASE_PATH = os.path.join(BASE_DIR, "test.db")      # 拼接数据库文件路径
DATABASE_URL = f"sqlite:///{DATABASE_PATH}"
print("数据库路径:", DATABASE_PATH)
Base = declarative_base()
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


# Question 模型（和你定义的一样）
class Question(Base):
    __tablename__ = "questions"
    id = Column(String, primary_key=True, index=True)
    tag = Column(String)
    inspiring_words = Column(String)
    question_text = Column(String)


# 你准备好的问题数据
questions_with_meta = [
    {
        "question_text": "你如何理解幸福？",
        "tag": "幸福/人生",
        "inspiring_words": "描述你心中幸福的模样，不一定要宏大，也可以是细小的瞬间。"
    },
    {
        "question_text": "自由和责任，哪个更重要？",
        "tag": "自由/责任",
        "inspiring_words": "思考一下自由和责任之间的平衡，你更倾向于哪一方？"
    },
    {
        "question_text": "如果一切都是命运安排的，我们还需要努力吗？",
        "tag": "命运/努力",
        "inspiring_words": "假设命运存在，你会如何看待自己的努力？"
    },
    {
        "question_text": "人类追求真理是否可能？",
        "tag": "真理/认识论",
        "inspiring_words": "谈谈你对真理的理解，人类是否有可能接近它？"
    },
    {
        "question_text": "孤独是一种力量还是一种缺陷？",
        "tag": "孤独/心理",
        "inspiring_words": "结合你的经验，孤独带给你的是成长还是困扰？"
    },
    {
        "question_text": "如果没有死亡，人生还有意义吗？",
        "tag": "死亡/意义",
        "inspiring_words": "试想一个没有死亡的世界，你认为生活会失去什么？"
    },
    {
        "question_text": "正义和善良，是否永远一致？",
        "tag": "正义/善良",
        "inspiring_words": "举例说明你是否遇到过正义和善良不一致的情况。"
    },
    {
        "question_text": "你认为痛苦对成长有必要吗？",
        "tag": "痛苦/成长",
        "inspiring_words": "想一想你的人生经历，痛苦是否让你有所成长？"
    },
    {
        "question_text": "科技让我们更自由还是更依赖？",
        "tag": "科技/自由",
        "inspiring_words": "观察你生活中的科技应用，它们让你更自由还是更受束缚？"
    },
    {
        "question_text": "美好生活的标准是什么？",
        "tag": "人生/美好生活",
        "inspiring_words": "描述一下你理想中的美好生活，它需要具备哪些元素？"
    }
]


def init_db():
    """创建数据库表"""
    Base.metadata.create_all(bind=engine)


def insert_questions():
    """批量插入问题"""
    db = SessionLocal()
    for q in questions_with_meta:
        question = Question(
            id=str(uuid4()),  # 用 UUID 作为主键
            tag=q["tag"],
            inspiring_words=q["inspiring_words"],
            question_text=q["question_text"]
        )
        db.add(question)
    db.commit()
    db.close()
    print("✅ 问题已成功导入数据库！")


if __name__ == "__main__":
    init_db()
    insert_questions()
