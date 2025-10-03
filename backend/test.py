import requests
import random

BASE_URL = "http://127.0.0.1:8000"  # 根据你的后端地址修改

# -------------------------------
# 1. 用户注册（可重复运行时可能报已注册，可忽略）
# -------------------------------
signup_data = {
    "email": "testuser@example.com",
    "password": "TestPassword123"
}

resp = requests.post(f"{BASE_URL}/api/auth/signup", json=signup_data)
print("Signup response:", resp.json())

# -------------------------------
# 2. 用户登录
# -------------------------------
login_data = {
    "email": "testuser@example.com",
    "password": "TestPassword123"
}

resp = requests.post(f"{BASE_URL}/api/auth/login", json=login_data)
login_result = resp.json()
print("Login response:", login_result)

token = login_result.get("access_token")
headers = {"Authorization": f"Bearer {token}"}

# -------------------------------
# 3. 获取随机哲学问题
# -------------------------------
resp = requests.get(f"{BASE_URL}/api/question")
random_question = resp.json()
print("Random question:", random_question)

# -------------------------------
# 4. 获取所有问题 /api/all_questions
# -------------------------------
resp = requests.get(f"{BASE_URL}/api/all_questions")
all_questions = resp.json()
print("All questions:", all_questions)

# 选择一个问题ID用于提交答案
question_id = all_questions[0]["id"] if all_questions else None

# -------------------------------
# 5. 提交答案
# -------------------------------
answer_data = {
    "content": "这是我的自动化测试答案",
    "question_id": question_id
}

resp = requests.post(f"{BASE_URL}/api/answer", json=answer_data, headers=headers)
print("Submit answer response:", resp.json())

# -------------------------------
# 6. 获取用户答案
# -------------------------------
resp = requests.get(f"{BASE_URL}/api/answer", params={"question_id": question_id}, headers=headers)
user_answers = resp.json()
print("User answers:", user_answers)

# -------------------------------
# 7. 获取用户信息
# -------------------------------
resp = requests.get(f"{BASE_URL}/api/me", headers=headers)
user_info = resp.json()
print("User info:", user_info)

# -------------------------------
# 8. 创建新问题 /api/my-questions
# -------------------------------
new_question_data = {
    "question_text": "自动化测试问题示例",
    "tag": "测试",
    "inspiring_words": "保持好奇"
}

resp = requests.post(f"{BASE_URL}/api/my-questions", json=new_question_data, headers=headers)
new_question = resp.json()
print("Created new question:", new_question)

# -------------------------------
# 9. 列出我的问题 /api/my-questions
# -------------------------------
resp = requests.get(f"{BASE_URL}/api/my-questions", headers=headers)
my_questions = resp.json()
print("My questions:", my_questions)

# -------------------------------
# 10. 创建文件夹 /api/folders
# -------------------------------
folder_data = {"name": "测试文件夹"}
resp = requests.post(f"{BASE_URL}/api/folders", json=folder_data, headers=headers)
folder = resp.json()
print("Created folder:", folder)

# -------------------------------
# 11. 给文件夹添加问题 /api/folders/{folder_id}/questions
# -------------------------------
folder_id = folder["id"]
question_to_add = new_question["id"]

resp = requests.post(f"{BASE_URL}/api/folders/{folder_id}/questions", params={"question_id": question_to_add}, headers=headers)
print("Add question to folder response:", resp.json())

# -------------------------------
# 12. 列出文件夹及问题 /api/folders
# -------------------------------
resp = requests.get(f"{BASE_URL}/api/folders", headers=headers)
folders = resp.json()
print("Folders list:", folders)

# -------------------------------
# 13. 修改文件夹名字 /api/folders/{folder_id}
# -------------------------------
rename_data = {"name": "重命名文件夹"}
resp = requests.put(f"{BASE_URL}/api/folders/{folder_id}", json=rename_data, headers=headers)
print("Rename folder response:", resp.json())

# -------------------------------
# 14. 删除文件夹 /api/folders/{folder_id}
# -------------------------------
resp = requests.delete(f"{BASE_URL}/api/folders/{folder_id}", headers=headers)
print("Delete folder response:", resp.json())

# -------------------------------
# 15. 更新用户信息 /api/user/settings
# -------------------------------
update_user_data = {"username": "自动化测试用户"}
resp = requests.put(f"{BASE_URL}/api/user/settings", json=update_user_data, headers=headers)
print("Update user info response:", resp.json())

# -------------------------------
# 16. 更新答案内容 /api/answer/{answer_id}
# -------------------------------
if user_answers:
    answer_id = user_answers[0]["id"]
    update_answer_data = {"content": "更新后的答案内容"}
    resp = requests.put(f"{BASE_URL}/api/answer/{answer_id}", json=update_answer_data, headers=headers)
    print("Update answer response:", resp.json())
