import requests
import json
from typing import List, Dict

# ✅ 配置你的 Render 部署地址
API_BASE_URL = "https://sanxing.onrender.com"  # 替换为你的实际部署地址

# 问题数据（与 insert_questions.py 中相同）
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


def create_admin_user(base_url: str) -> tuple[str, str]:
    """
    创建一个管理员用户用于插入问题
    返回 (email, token)
    """
    admin_email = "admin@example.com"
    admin_password = "admin123456"
    
    print(f"📝 正在创建管理员账户: {admin_email}")
    
    # 尝试注册
    signup_url = f"{base_url}/api/auth/signup"
    signup_data = {
        "email": admin_email,
        "password": admin_password
    }
    
    try:
        response = requests.post(signup_url, json=signup_data)
        if response.status_code == 200:
            print("✅ 管理员账户创建成功")
        elif response.status_code == 400 and "already registered" in response.text.lower():
            print("ℹ️  管理员账户已存在，将使用现有账户")
        else:
            print(f"⚠️  注册响应: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"⚠️  注册请求失败: {e}")
    
    # 登录获取 token
    print("🔐 正在登录...")
    login_url = f"{base_url}/api/auth/login"
    login_data = {
        "email": admin_email,
        "password": admin_password
    }
    
    try:
        response = requests.post(login_url, json=login_data)
        if response.status_code == 200:
            token = response.json()["access_token"]
            print("✅ 登录成功")
            return admin_email, token
        else:
            raise Exception(f"登录失败: {response.status_code} - {response.text}")
    except Exception as e:
        raise Exception(f"无法登录: {e}")


def insert_questions_via_api(base_url: str, token: str, questions: List[Dict]):
    """
    通过 API 批量插入问题
    """
    create_url = f"{base_url}/api/my-questions"
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    success_count = 0
    fail_count = 0
    
    print(f"\n📤 开始插入 {len(questions)} 个问题...")
    print("=" * 60)
    
    for i, question_data in enumerate(questions, 1):
        try:
            response = requests.post(create_url, json=question_data, headers=headers)
            
            if response.status_code == 200:
                success_count += 1
                result = response.json()
                question_id = result.get("id", "unknown")
                print(f"✅ [{i}/{len(questions)}] 成功: {question_data['question_text'][:30]}... (ID: {question_id})")
            else:
                fail_count += 1
                print(f"❌ [{i}/{len(questions)}] 失败: {response.status_code} - {response.text}")
        
        except Exception as e:
            fail_count += 1
            print(f"❌ [{i}/{len(questions)}] 异常: {e}")
    
    print("=" * 60)
    print(f"\n📊 导入统计:")
    print(f"   成功: {success_count}")
    print(f"   失败: {fail_count}")
    print(f"   总计: {len(questions)}")
    
    return success_count, fail_count


def share_all_questions(base_url: str, token: str):
    """
    将所有创建的问题设为公开（is_public=True）
    """
    print("\n🌍 正在将问题设为公开...")
    
    # 获取所有自己创建的问题
    list_url = f"{base_url}/api/my-questions"
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.get(list_url, headers=headers)
        if response.status_code != 200:
            print(f"❌ 获取问题列表失败: {response.status_code}")
            return
        
        questions = response.json()
        print(f"📋 找到 {len(questions)} 个问题")
        
        shared_count = 0
        for question in questions:
            question_id = question["id"]
            share_url = f"{base_url}/api/my-questions/{question_id}/share"
            
            try:
                response = requests.put(share_url, headers=headers)
                if response.status_code == 200:
                    shared_count += 1
                    print(f"✅ 已公开: {question['question_text'][:40]}...")
                else:
                    print(f"⚠️  公开失败 ({question_id}): {response.status_code}")
            except Exception as e:
                print(f"❌ 公开异常 ({question_id}): {e}")
        
        print(f"\n✅ 成功公开 {shared_count}/{len(questions)} 个问题")
    
    except Exception as e:
        print(f"❌ 获取或公开问题失败: {e}")


def main():
    """
    主函数
    """
    print("=" * 60)
    print("🚀 哲思日记 - 远程问题导入工具")
    print("=" * 60)
    print()
    
    # 1. 确认 API 地址
    print(f"📍 目标 API: {API_BASE_URL}")
    confirm = input("请确认 API 地址是否正确？(y/n): ").lower()
    if confirm != 'y':
        print("\n请修改脚本中的 API_BASE_URL 变量")
        return
    
    print()
    
    try:
        # 2. 创建/登录管理员账户
        email, token = create_admin_user(API_BASE_URL)
        print(f"✅ 已获取访问令牌")
        print()
        
        # 3. 插入问题
        success, fail = insert_questions_via_api(API_BASE_URL, token, questions_with_meta)
        
        # 4. 将问题设为公开
        if success > 0:
            print()
            share_confirm = input("是否将所有问题设为公开？(y/n): ").lower()
            if share_confirm == 'y':
                share_all_questions(API_BASE_URL, token)
        
        print()
        print("=" * 60)
        print("✨ 完成！")
        print("=" * 60)
    
    except Exception as e:
        print()
        print("=" * 60)
        print(f"❌ 执行失败: {e}")
        print("=" * 60)


if __name__ == "__main__":
    main()