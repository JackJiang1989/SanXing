import requests
import json

# === 配置你的后端 API URL ===
BASE_URL = "https://sanxing.onrender.com"  # 你的 Render 部署地址

# 测试账户信息
TEST_EMAIL = "testuser@example.com"
TEST_PASSWORD = "test12345"

def test_signup():
    url = f"{BASE_URL}/api/auth/signup"
    data = {"email": TEST_EMAIL, "password": TEST_PASSWORD}
    resp = requests.post(url, json=data)
    if resp.status_code == 400 and "already registered" in resp.text:
        print("✅ User already exists, skipping signup.")
    elif resp.status_code == 200:
        print("✅ Signup successful:", resp.json())
    else:
        print("❌ Signup failed:", resp.status_code, resp.text)

def test_login():
    url = f"{BASE_URL}/api/auth/login"
    data = {"email": TEST_EMAIL, "password": TEST_PASSWORD}
    resp = requests.post(url, json=data)
    if resp.status_code == 200:
        token = resp.json().get("access_token")
        print("✅ Login successful. Token:", token)
        return token
    else:
        print("❌ Login failed:", resp.status_code, resp.text)
        return None

def test_create_question(token):
    url = f"{BASE_URL}/api/my-questions"
    headers = {"Authorization": f"Bearer {token}"}
    data = {
        "question_text": "What inspires you today?",
        "tag": "motivation",
        "inspiring_words": "Keep pushing forward!"
    }
    resp = requests.post(url, json=data, headers=headers)
    if resp.status_code == 200:
        print("✅ Question created:", resp.json())
        return resp.json()["id"]
    else:
        print("❌ Create question failed:", resp.status_code, resp.text)
        return None

def test_list_my_questions(token):
    url = f"{BASE_URL}/api/my-questions"
    headers = {"Authorization": f"Bearer {token}"}
    resp = requests.get(url, headers=headers)
    print("📋 My questions:", resp.json())

def test_answer_question(token, question_id):
    url = f"{BASE_URL}/api/answer"
    headers = {"Authorization": f"Bearer {token}"}
    data = {"question_id": question_id, "content": "My answer is: Stay positive!"}
    resp = requests.post(url, json=data, headers=headers)
    if resp.status_code == 200:
        print("✅ Answer added successfully.")
    else:
        print("❌ Answer failed:", resp.status_code, resp.text)

def test_get_answers(token, question_id):
    url = f"{BASE_URL}/api/answer"
    headers = {"Authorization": f"Bearer {token}"}
    params = {"question_id": question_id}
    resp = requests.get(url, headers=headers, params=params)
    print("📋 Answers:", resp.json())

if __name__ == "__main__":
    print("🚀 Starting backend production tests...")

    test_signup()
    token = test_login()
    if token:
        qid = test_create_question(token)
        if qid:
            test_list_my_questions(token)
            test_answer_question(token, qid)
            test_get_answers(token, qid)

    print("✅ All tests finished.")
