from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import create_engine, Column, String, DateTime, ForeignKey, Boolean
from datetime import datetime, timedelta,timezone
from uuid import uuid4
import os
from backend.main import Question


# 获取项目根目录路径
BASE_DIR = os.path.dirname(os.path.abspath(__file__))  # 当前文件所在目录
DATABASE_PATH = os.path.join(BASE_DIR, "test.db")      # 拼接数据库文件路径
DATABASE_URL = f"sqlite:///{DATABASE_PATH}"
print("数据库路径:", DATABASE_PATH)
Base = declarative_base()
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


# 你准备好的问题数据
questions_with_meta = [
    # 1️⃣ 自我认识与内在探索
    {"question_text": "我最根本的渴望是什么？我害怕的是什么？",
     "tag": "渴望/恐惧",
     "inspiring_words": "可以从物质、情感、精神三个层面展开；尝试写下最极端的答案，比如“我害怕毫无意义的死亡”“我渴望被无条件地爱”。"},
    {"question_text": "如果完全没有外界评价，我最想成为怎样的人？",
     "tag": "真实自我",
     "inspiring_words": "想象一个没有家庭、朋友、社会期待的孤岛，你会如何生活？"},
    {"question_text": "我做出重要选择时，真正驱动我的往往是什么：理性、情感、恐惧还是好奇？",
     "tag": "动力源",
     "inspiring_words": "回顾人生中3个重大决定，拆解当时的心理动机。"},
    {"question_text": "哪些事情最容易让我愤怒、悲伤或喜悦？这些情绪背后隐藏着怎样的价值观？",
     "tag": "情绪映射",
     "inspiring_words": "从最近一次强烈情绪出发，追问“为什么这件事让我如此在意”。"},
    {"question_text": "我认为“善”的标准是什么？它来自家庭教育、社会环境还是自主选择？",
     "tag": "善与恶",
     "inspiring_words": "试着写下三个“善”的具体例子，而不是抽象概念。"},
    {"question_text": "如果必须在“自由”“安全”“爱情”“金钱”“成长”之间做优先排序，我会如何选择？",
     "tag": "价值排序",
     "inspiring_words": "用1–5的排序并解释原因，可以揭示潜在价值体系。"},
    {"question_text": "我还是过去的我吗？变化中有哪些“核心”一直没有动摇？",
     "tag": "自我持续性",
     "inspiring_words": "回忆10年前的自己，写下三个相同点和三个不同点。"},
    {"question_text": "哪些记忆或选择最深刻地塑造了今天的我？",
     "tag": "回忆与遗憾",
     "inspiring_words": "挑选一个“如果可以重来”的瞬间，分析为什么它如此关键。"},
    {"question_text": "如果未来的我能给现在的我写一封信，他/她最想提醒什么？",
     "tag": "未来自我",
     "inspiring_words": "尝试从40岁、60岁甚至临终视角写信，观察价值观的变化。"},
    {"question_text": "我有哪些长期习惯或小动作，可能暗示着被忽视的需求或恐惧？",
     "tag": "习惯/惯性",
     "inspiring_words": "例如咬指甲、拖延、频繁刷手机背后的心理机制。"},
    {"question_text": "别人对我的评价中，哪一句让我反复记起？为什么？",
     "tag": "他人镜像",
     "inspiring_words": "写下3句印象最深的评价，剖析它们触动的自我形象。"},
    {"question_text": "我最不愿被别人知道的想法是什么？它揭示了我怎样的另一面？",
     "tag": "阴影面",
     "inspiring_words": "可以用第三人称写作，降低心理防御。"},

    # 2️⃣ 我与他人、社会的关系
    {"question_text": "如果用一张图画出我与家人、朋友、同事的亲密程度，它会是什么形状？",
     "tag": "关系地图",
     "inspiring_words": "尝试画“圆心图”或“同心圆”，越靠近中心代表越重要的人。"},
    {"question_text": "在关系中，我最害怕失去的是什么——陪伴、认可、经济支持、精神共鸣？",
     "tag": "情感依赖",
     "inspiring_words": "写出最近一次害怕失去某人的经历，拆解其中的真实需求。"},
    {"question_text": "我在亲密关系中最难设立的界限是什么？为什么？",
     "tag": "界限感",
     "inspiring_words": "写“我希望别人不要做的三件事”和“我愿意做的三件事”。"},
    {"question_text": "我如何定义“爱”？它更像责任、情感、还是一种行动？",
     "tag": "爱的定义",
     "inspiring_words": "回顾一段最难忘的爱情或亲情，提炼其中的关键词。"},
    {"question_text": "我从家庭中继承了哪些价值观？哪些我已经反思或拒绝？",
     "tag": "原生家庭",
     "inspiring_words": "列出三个“我像父母”的地方和三个“我完全不同”的地方。"},
    {"question_text": "朋友在我的生命中扮演怎样的角色：陪伴者、思想碰撞者、实用合作伙伴？",
     "tag": "朋友的角色",
     "inspiring_words": "写下三个最重要朋友的共同特质，看是否映射出你的需求。"},
    {"question_text": "我在社会中扮演哪些角色？哪一个最接近真实的我？",
     "tag": "社会身份",
     "inspiring_words": "用第一人称写出“我是……但我更想成为……”的句子。"},
    {"question_text": "在工作、家庭和社会中，我认为自己最不可推卸的责任是什么？",
     "tag": "责任感",
     "inspiring_words": "从最具体的小责任开始，例如“陪伴家人”或“缴纳税款”。"},
    {"question_text": "我如何理解“自由”？它意味着没有约束，还是自我约束的能力？",
     "tag": "权力与自由",
     "inspiring_words": "思考一个曾让你感到“真正自由”的瞬间，并分析原因。"},
    {"question_text": "我如何看待“公平”与“平等”？两者是否总能并存？",
     "tag": "正义观",
     "inspiring_words": "选一个具体社会议题（贫富差距、性别平权、环境保护）来回应。"},
    {"question_text": "我是否愿意为某个信念付出代价（时间、金钱、关系）？",
     "tag": "立场与行动",
     "inspiring_words": "回忆一次因价值观而与他人产生冲突的经历。"},
    {"question_text": "我更倾向于作为独立个体存在，还是群体的一员？",
     "tag": "群体认同",
     "inspiring_words": "写下让你感到“归属”或“疏离”的社会场景。"},
    {"question_text": "他人的评价在多大程度上影响我的自我认同？",
     "tag": "评价的力量",
     "inspiring_words": "写下三句最影响你的赞美或批评，并分析情绪反应。"},
    {"question_text": "我如何面对与他人的分歧？更倾向于妥协还是坚持？",
     "tag": "冲突与和解",
     "inspiring_words": "举一例你曾主动和解或选择离开的经历。"},
    {"question_text": "我最讨厌他人的哪种特质？这种特质是否在我自己身上也存在？",
     "tag": "投射效应",
     "inspiring_words": "用第三人称写“某人让我生气，因为……”，再替换成“我自己有时也……”。"},

    # 3️⃣ 人生意义与存在
    {"question_text": "如果生命本身没有预设意义，我愿意赋予它怎样的个人意义？",
     "tag": "意义追问",
     "inspiring_words": "想象宇宙冷漠无声，你依然选择活下去的理由是什么？"},
    {"question_text": "如果可以用一句话概括我此生最想完成的事，那会是什么？",
     "tag": "终极目标",
     "inspiring_words": "可以是具体成就，也可以是精神状态（例如“成为一个善良的人”）。"},
    {"question_text": "我如何定义“幸福”与“成功”？它们是过程还是结果？",
     "tag": "幸福/成功",
     "inspiring_words": "回忆一个最幸福的瞬间和一个最成功的时刻，比较两者的情感差异。"},
    {"question_text": "如果人生没有绝对意义，我是否能从“无意义”中感受到解放？",
     "tag": "荒诞与自由",
     "inspiring_words": "可以借鉴加缪的“西西弗神话”来反思：即使推石头毫无终点，我们为何继续？"},
    {"question_text": "真正的自由是否需要承担孤独和责任？我愿意为自由放弃什么？",
     "tag": "自由的代价",
     "inspiring_words": "写下三件你曾为了独立而拒绝的事或人。"},
    {"question_text": "我最艰难的选择是什么？当时是如何权衡意义与现实的？",
     "tag": "选择的勇气",
     "inspiring_words": "回顾一次“改变人生方向”的决定，如换工作、移居、分手。"},
    {"question_text": "我如何看待死亡？它让我恐惧、释然，还是麻木？",
     "tag": "死亡观",
     "inspiring_words": "想象生命只剩一年，你会做什么？"},
    {"question_text": "如果明天生命结束，我希望别人如何记住我？",
     "tag": "遗产与痕迹",
     "inspiring_words": "尝试写一篇“自己的墓志铭”或“临终遗言”。"},
    {"question_text": "我最深刻感受到生命无常的时刻是什么？它改变了我的哪些看法？",
     "tag": "无常体验",
     "inspiring_words": "可以是一次失去、疾病、灾难，或一次偶然的醒悟。"},
    {"question_text": "如果幸福与道德发生冲突，我会如何选择？",
     "tag": "善的选择",
     "inspiring_words": "想象一个情景：为了保护所爱的人，需要说谎或违法，你会如何决定？"},
    {"question_text": "我是否有一套“无论如何都坚持”的原则？它们是如何形成的？",
     "tag": "人生准则",
     "inspiring_words": "列出3条“底线”，回顾它们在不同情境下是否被挑战。"},
    {"question_text": "我相信“为他人而活”能带来意义吗？",
     "tag": "利他与自利",
     "inspiring_words": "写下你曾经的无私行为与纯粹自私的行为，并比较两者带来的感受。"},
    {"question_text": "我如何在有限的时间里体验“当下”？",
     "tag": "活在当下",
     "inspiring_words": "描述最近一次完全投入当下、忘记时间的经历。"},
    {"question_text": "我希望5年、10年后的人生是什么样？",
     "tag": "长远愿景",
     "inspiring_words": "不必完美规划，只需描绘核心状态（例如“内心平和”或“持续学习”）。"},
    {"question_text": "如果生命可以无限延长，我的生活方式会改变吗？",
     "tag": "无限想象",
     "inspiring_words": "思考“永生”是否真能带来意义还是让一切失去价值。"},
    {"question_text": "在无边的宇宙与亿万年的时间里，我的存在意味着什么？",
     "tag": "宇宙尺度",
     "inspiring_words": "写下从天文学、自然或夜空中获得的感受：渺小、震撼、安慰或恐惧。"},
    {"question_text": "我是否需要某种信仰或哲学体系来支撑意义？",
     "tag": "宗教/信仰",
     "inspiring_words": "可以从宗教、科学、人文主义等角度比较其给予的慰藉。"},

    # 4️⃣ 行动与实践
    {"question_text": "我理想中的一天是怎样度过的？现实与理想差距在哪里？",
     "tag": "生活节奏",
     "inspiring_words": "写下“理想的一天”时间表，对比真实的一天，找出可调整的小环节。"},
    {"question_text": "哪些日常习惯最能支撑我的精神状态？哪些习惯正在消耗我？",
     "tag": "习惯的力量",
     "inspiring_words": "列出“给我能量的三件小事”和“让我疲惫的三件小事”。"},
    {"question_text": "我是否有能让日常变得更有意义的仪式？",
     "tag": "仪式感",
     "inspiring_words": "比如写日记、晨跑、冥想、家庭晚餐——哪一件是我想坚持的？"},
    {"question_text": "当面对选择时，我最常依靠的判断标准是什么：利益、情感、道德还是直觉？",
     "tag": "行动标准",
     "inspiring_words": "回顾一次最近的重大决策，写下当时的心理权重。"},
    {"question_text": "为了靠近理想人生，我今天能采取的最小行动是什么？",
     "tag": "最小行动",
     "inspiring_words": "尽量具体到“15分钟以内可以完成”的任务。"},
    {"question_text": "我最容易拖延的事情是什么？背后的恐惧或阻力是什么？",
     "tag": "拖延与恐惧",
     "inspiring_words": "写下过去一周被反复推迟的任务，并分析情绪原因。"},
    {"question_text": "我希望在未来几年掌握哪些知识或技能？",
     "tag": "终身学习",
     "inspiring_words": "将兴趣分为“立即实践型”和“长期积累型”，例如：烹饪 vs. 语言。"},
    {"question_text": "我最痛苦但最有价值的成长经历是什么？",
     "tag": "成长痛",
     "inspiring_words": "回忆一个失败经历，提炼其中的教训和意外收获。"},
    {"question_text": "我如何从他人或环境中获取反馈并改进？",
     "tag": "反馈循环",
     "inspiring_words": "描述最近一次因为他人建议而改变习惯的案例。"},
    {"question_text": "我如何在日常选择中体现自己的价值观？",
     "tag": "价值落地",
     "inspiring_words": "例如消费选择（环保、公益）、人际交往（诚信、善意）。"},
    {"question_text": "当价值观与现实利益冲突时，我会如何取舍？",
     "tag": "矛盾时刻",
     "inspiring_words": "回顾一次“知道正确但难以坚持”的情境。"},
    {"question_text": "我愿意通过哪些方式对社会做出贡献？",
     "tag": "社会参与",
     "inspiring_words": "从小到大都可，如志愿活动、社区交流、环保习惯。"},
    {"question_text": "当遇到巨大压力或挫折时，我最有效的自我安抚方法是什么？",
     "tag": "应对压力",
     "inspiring_words": "列出三种“我曾用过且有效”的策略，如运动、倾诉、写作。"},
    {"question_text": "我上一次感到完全失控是什么时候？如何恢复平衡？",
     "tag": "失控体验",
     "inspiring_words": "复盘情境、情绪、恢复过程，找出可复制的调节机制。"},
    {"question_text": "我最难原谅自己的哪件事？我可以如何重新与自己和解？",
     "tag": "自我宽恕",
     "inspiring_words": "尝试写一封“给过去的我”的宽恕信。"},
    {"question_text": "五年后，我希望在生活的五个领域（健康、关系、事业、精神、兴趣）各处于何种状态？",
     "tag": "五年图景",
     "inspiring_words": "每个领域写下一个关键词，如“平衡”“探索”“稳定”。"},
    {"question_text": "如果我不做任何改变，五年后我可能会后悔什么？",
     "tag": "逆向思考",
     "inspiring_words": "写下三个“未来可能的遗憾”以激发行动。"},
    {"question_text": "我可以用什么方法定期审视并调整人生方向？",
     "tag": "持续优化",
     "inspiring_words": "例如每月回顾、年度计划、与朋友/伴侣的深度对话。"}
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
            question_text=q["question_text"],
            created_by=None,                       # 如果暂时没有用户
            is_public=False,                        # 默认不公开
            created_at=datetime.utcnow()            # 当前时间
        )
        db.add(question)
    db.commit()
    db.close()
    print("✅ 问题已成功导入数据库！")


if __name__ == "__main__":
    init_db()
    insert_questions()
