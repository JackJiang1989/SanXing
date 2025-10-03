import requests
import json
from typing import Optional

# 配置
BASE_URL = "http://localhost:8000"  # 根据你的实际端口调整
TEST_EMAIL = f"test_user_{hash(str(requests.get('http://www.google.com')))}@example.com"  # 使用随机邮箱避免冲突
TEST_PASSWORD = "test_password_123"
TEST_USERNAME = "测试用户"

class APITester:
    def __init__(self, base_url: str):
        self.base_url = base_url
        self.token: Optional[str] = None
        self.test_data = {
            "question_id": None,
            "answer_id": None,
            "folder_id": None,
            "my_question_id": None
        }
    
    def print_result(self, test_name: str, response: requests.Response):
        """打印测试结果"""
        print(f"\n{'='*60}")
        print(f"测试: {test_name}")
        print(f"状态码: {response.status_code}")
        print(f"响应: {json.dumps(response.json() if response.text else {}, indent=2, ensure_ascii=False)}")
        print(f"{'='*60}")
    
    def test_signup(self):
        """测试用户注册"""
        url = f"{self.base_url}/api/auth/signup"
        data = {
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        }
        response = requests.post(url, json=data)
        self.print_result("用户注册", response)
        return response.status_code == 200
    
    def test_login(self):
        """测试用户登录"""
        url = f"{self.base_url}/api/auth/login"
        data = {
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        }
        response = requests.post(url, json=data)
        self.print_result("用户登录", response)
        
        if response.status_code == 200:
            self.token = response.json()["access_token"]
            print(f"✅ Token 已保存: {self.token[:20]}...")
        return response.status_code == 200
    
    def get_headers(self):
        """获取认证头"""
        return {"Authorization": f"Bearer {self.token}"}
    
    def test_get_random_question(self):
        """测试获取随机问题"""
        url = f"{self.base_url}/api/question"
        response = requests.get(url)
        self.print_result("获取随机问题", response)
        return response.status_code == 200
    
    def test_get_all_questions(self):
        """测试获取所有问题"""
        url = f"{self.base_url}/api/all_questions"
        response = requests.get(url)
        self.print_result("获取所有问题", response)
        
        # 保存一个问题ID用于后续测试
        if response.status_code == 200 and len(response.json()) > 0:
            self.test_data["question_id"] = response.json()[0]["id"]
            print(f"✅ 保存问题ID: {self.test_data['question_id']}")
        
        return response.status_code == 200
    
    def test_get_question_by_id(self):
        """测试根据ID获取问题"""
        if not self.test_data["question_id"]:
            print("⚠️ 跳过测试: 没有可用的问题ID")
            return False
        
        url = f"{self.base_url}/api/question/{self.test_data['question_id']}"
        response = requests.get(url)
        self.print_result("根据ID获取问题", response)
        return response.status_code == 200
    
    def test_save_answer(self):
        """测试保存答案"""
        if not self.test_data["question_id"]:
            print("⚠️ 跳过测试: 没有可用的问题ID")
            return False
        
        url = f"{self.base_url}/api/answer"
        data = {
            "content": "这是我的测试答案,对于这个哲学问题,我认为...",
            "question_id": self.test_data["question_id"]
        }
        response = requests.post(url, json=data, headers=self.get_headers())
        self.print_result("保存答案", response)
        return response.status_code == 200
    
    def test_get_answers(self):
        """测试获取答案"""
        if not self.test_data["question_id"]:
            print("⚠️ 跳过测试: 没有可用的问题ID")
            return False
        
        url = f"{self.base_url}/api/answer?question_id={self.test_data['question_id']}"
        response = requests.get(url, headers=self.get_headers())
        self.print_result("获取答案", response)
        
        # 保存答案ID用于后续测试
        if response.status_code == 200 and len(response.json()) > 0:
            self.test_data["answer_id"] = response.json()[0]["id"]
            print(f"✅ 保存答案ID: {self.test_data['answer_id']}")
        
        return response.status_code == 200
    
    def test_get_user_info(self):
        """测试获取用户信息"""
        url = f"{self.base_url}/api/me"
        response = requests.get(url, headers=self.get_headers())
        self.print_result("获取用户信息", response)
        return response.status_code == 200
    
    def test_get_user_settings(self):
        """测试获取用户设置"""
        url = f"{self.base_url}/api/user/settings"
        response = requests.get(url, headers=self.get_headers())
        self.print_result("获取用户设置", response)
        return response.status_code == 200
    
    def test_update_user_settings(self):
        """测试更新用户设置"""
        url = f"{self.base_url}/api/user/settings"
        data = {
            "username": TEST_USERNAME
        }
        response = requests.put(url, json=data, headers=self.get_headers())
        self.print_result("更新用户设置", response)
        return response.status_code == 200
    
    def test_update_answer(self):
        """测试更新答案"""
        if not self.test_data["answer_id"]:
            print("⚠️ 跳过测试: 没有可用的答案ID")
            return False
        
        url = f"{self.base_url}/api/answer/{self.test_data['answer_id']}"
        data = {
            "content": "这是我更新后的答案,经过更深入的思考..."
        }
        response = requests.put(url, json=data, headers=self.get_headers())
        self.print_result("更新答案", response)
        return response.status_code == 200
    
    def test_create_my_question(self):
        """测试创建我的问题"""
        url = f"{self.base_url}/api/my-questions"
        data = {
            "question_text": "什么是真正的勇气?",
            "tag": "勇气",
            "inspiring_words": "勇气不是没有恐惧,而是带着恐惧继续前行"
        }
        response = requests.post(url, json=data, headers=self.get_headers())
        self.print_result("创建我的问题", response)
        
        if response.status_code == 200:
            self.test_data["my_question_id"] = response.json()["id"]
            print(f"✅ 保存我的问题ID: {self.test_data['my_question_id']}")
        
        return response.status_code == 200
    
    def test_list_my_questions(self):
        """测试获取我的问题列表"""
        url = f"{self.base_url}/api/my-questions"
        response = requests.get(url, headers=self.get_headers())
        self.print_result("获取我的问题列表", response)
        return response.status_code == 200
    
    def test_share_question(self):
        """测试分享问题"""
        if not self.test_data["my_question_id"]:
            print("⚠️ 跳过测试: 没有可用的我的问题ID")
            return False
        
        url = f"{self.base_url}/api/my-questions/{self.test_data['my_question_id']}/share"
        response = requests.put(url, headers=self.get_headers())
        self.print_result("分享问题", response)
        return response.status_code == 200
    
    def test_create_folder(self):
        """测试创建文件夹"""
        url = f"{self.base_url}/api/folders"
        data = {
            "name": "我的哲学思考"
        }
        response = requests.post(url, json=data, headers=self.get_headers())
        self.print_result("创建文件夹", response)
        
        if response.status_code == 200:
            self.test_data["folder_id"] = response.json()["id"]
            print(f"✅ 保存文件夹ID: {self.test_data['folder_id']}")
        
        return response.status_code == 200
    
    def test_list_folders(self):
        """测试获取文件夹列表"""
        url = f"{self.base_url}/api/folders"
        response = requests.get(url, headers=self.get_headers())
        self.print_result("获取文件夹列表", response)
        return response.status_code == 200
    
    def test_rename_folder(self):
        """测试重命名文件夹"""
        if not self.test_data["folder_id"]:
            print("⚠️ 跳过测试: 没有可用的文件夹ID")
            return False
        
        url = f"{self.base_url}/api/folders/{self.test_data['folder_id']}"
        data = {
            "name": "我的深度思考"
        }
        response = requests.put(url, json=data, headers=self.get_headers())
        self.print_result("重命名文件夹", response)
        return response.status_code == 200
    
    def test_add_question_to_folder(self):
        """测试添加问题到文件夹"""
        if not self.test_data["folder_id"] or not self.test_data["question_id"]:
            print("⚠️ 跳过测试: 没有可用的文件夹ID或问题ID")
            return False
        
        url = f"{self.base_url}/api/folders/{self.test_data['folder_id']}/questions"
        params = {
            "question_id": self.test_data["question_id"]
        }
        response = requests.post(url, params=params, headers=self.get_headers())
        self.print_result("添加问题到文件夹", response)
        return response.status_code == 200
    
    def test_remove_question_from_folder(self):
        """测试从文件夹移除问题"""
        if not self.test_data["folder_id"] or not self.test_data["question_id"]:
            print("⚠️ 跳过测试: 没有可用的文件夹ID或问题ID")
            return False
        
        url = f"{self.base_url}/api/folders/{self.test_data['folder_id']}/questions/{self.test_data['question_id']}"
        response = requests.delete(url, headers=self.get_headers())
        self.print_result("从文件夹移除问题", response)
        return response.status_code == 200
    
    def test_delete_folder(self):
        """测试删除文件夹"""
        if not self.test_data["folder_id"]:
            print("⚠️ 跳过测试: 没有可用的文件夹ID")
            return False
        
        url = f"{self.base_url}/api/folders/{self.test_data['folder_id']}"
        response = requests.delete(url, headers=self.get_headers())
        self.print_result("删除文件夹", response)
        return response.status_code == 200
    
    def run_all_tests(self):
        """运行所有测试"""
        print("\n" + "="*60)
        print("开始测试 FastAPI 接口")
        print("="*60)
        
        results = {}
        
        # 1. 认证测试
        print("\n📝 === 认证相关测试 ===")
        results["注册"] = self.test_signup()
        results["登录"] = self.test_login()
        
        if not self.token:
            print("\n❌ 登录失败,停止后续测试")
            return results
        
        # 2. 问题相关测试
        print("\n❓ === 问题相关测试 ===")
        results["获取随机问题"] = self.test_get_random_question()
        results["获取所有问题"] = self.test_get_all_questions()
        results["根据ID获取问题"] = self.test_get_question_by_id()
        
        # 3. 答案相关测试
        print("\n💬 === 答案相关测试 ===")
        results["保存答案"] = self.test_save_answer()
        results["获取答案"] = self.test_get_answers()
        results["更新答案"] = self.test_update_answer()
        
        # 4. 用户相关测试
        print("\n👤 === 用户相关测试 ===")
        results["获取用户信息"] = self.test_get_user_info()
        results["获取用户设置"] = self.test_get_user_settings()
        results["更新用户设置"] = self.test_update_user_settings()
        
        # 5. 我的问题测试
        print("\n📋 === 我的问题相关测试 ===")
        results["创建我的问题"] = self.test_create_my_question()
        results["获取我的问题列表"] = self.test_list_my_questions()
        results["分享问题"] = self.test_share_question()
        
        # 6. 文件夹测试
        print("\n📁 === 文件夹相关测试 ===")
        results["创建文件夹"] = self.test_create_folder()
        results["获取文件夹列表"] = self.test_list_folders()
        results["重命名文件夹"] = self.test_rename_folder()
        results["添加问题到文件夹"] = self.test_add_question_to_folder()
        results["从文件夹移除问题"] = self.test_remove_question_from_folder()
        results["删除文件夹"] = self.test_delete_folder()
        
        # 打印测试总结
        print("\n" + "="*60)
        print("测试总结")
        print("="*60)
        
        passed = sum(1 for v in results.values() if v)
        total = len(results)
        
        for test_name, result in results.items():
            status = "✅ 通过" if result else "❌ 失败"
            print(f"{test_name}: {status}")
        
        print(f"\n总计: {passed}/{total} 测试通过")
        print("="*60)
        
        return results


if __name__ == "__main__":
    # 创建测试实例并运行
    tester = APITester(BASE_URL)
    tester.run_all_tests()