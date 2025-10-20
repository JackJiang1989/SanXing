import requests
import json
from typing import Optional
from datetime import datetime, timedelta

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
    


    # ========== ✅ 新增活跃度相关测试 ==========
    
    def test_get_activity_current_month(self):
        """测试获取当前月份的写作活跃度"""
        now = datetime.now()
        url = f"{self.base_url}/api/user/activity"
        params = {
            "year": now.year,
            "month": now.month
        }
        response = requests.get(url, params=params, headers=self.get_headers())
        self.print_result(f"获取写作活跃度 ({now.year}年{now.month}月)", response)
        
        # 验证返回数据结构
        if response.status_code == 200:
            data = response.json()
            assert "year" in data, "响应缺少 year 字段"
            assert "month" in data, "响应缺少 month 字段"
            assert "daily_counts" in data, "响应缺少 daily_counts 字段"
            assert isinstance(data["daily_counts"], dict), "daily_counts 应该是字典类型"
            print(f"✅ 数据结构验证通过")
            print(f"✅ 本月写作天数: {len(data['daily_counts'])} 天")
            print(f"✅ 本月总答案数: {sum(data['daily_counts'].values())} 个")
        
        return response.status_code == 200
    
    def test_get_activity_specific_month(self):
        """测试获取指定月份的写作活跃度"""
        url = f"{self.base_url}/api/user/activity"
        params = {
            "year": 2025,
            "month": 10
        }
        response = requests.get(url, params=params, headers=self.get_headers())
        self.print_result("获取指定月份活跃度 (2025年10月)", response)
        return response.status_code == 200
    
    def test_get_activity_invalid_month(self):
        """测试无效月份参数"""
        url = f"{self.base_url}/api/user/activity"
        params = {
            "year": 2025,
            "month": 13  # 无效月份
        }
        response = requests.get(url, params=params, headers=self.get_headers())
        self.print_result("测试无效月份 (应该返回错误)", response)
        # 预期应该返回 400 或 422 错误
        return response.status_code >= 400
    
    def test_get_answers_by_date_today(self):
        """测试获取今天的答案"""
        today = datetime.now().strftime("%Y-%m-%d")
        url = f"{self.base_url}/api/user/answers/by-date"
        params = {
            "date": today
        }
        response = requests.get(url, params=params, headers=self.get_headers())
        self.print_result(f"获取今天的答案 ({today})", response)
        
        # 验证返回数据结构
        if response.status_code == 200:
            data = response.json()
            assert "date" in data, "响应缺少 date 字段"
            assert "answers" in data, "响应缺少 answers 字段"
            assert isinstance(data["answers"], list), "answers 应该是列表类型"
            print(f"✅ 数据结构验证通过")
            print(f"✅ 今天的答案数量: {len(data['answers'])} 个")
            
            # 验证每个答案的结构
            if len(data["answers"]) > 0:
                answer = data["answers"][0]
                required_fields = ["id", "content", "created_at", "question_id", "question_text"]
                for field in required_fields:
                    assert field in answer, f"答案缺少 {field} 字段"
                print(f"✅ 答案数据结构验证通过")
        
        return response.status_code == 200
    
    def test_get_answers_by_date_specific(self):
        """测试获取指定日期的答案"""
        url = f"{self.base_url}/api/user/answers/by-date"
        params = {
            "date": "2025-10-04"
        }
        response = requests.get(url, params=params, headers=self.get_headers())
        self.print_result("获取指定日期的答案 (2025-10-04)", response)
        return response.status_code == 200
    
    def test_get_answers_by_date_invalid_format(self):
        """测试无效的日期格式"""
        url = f"{self.base_url}/api/user/answers/by-date"
        params = {
            "date": "2025/10/04"  # 错误格式
        }
        response = requests.get(url, params=params, headers=self.get_headers())
        self.print_result("测试无效日期格式 (应该返回 400)", response)
        return response.status_code == 400
    
    def test_get_answers_by_date_no_data(self):
        """测试查询没有数据的日期"""
        # 查询很久以前的日期，应该没有数据
        url = f"{self.base_url}/api/user/answers/by-date"
        params = {
            "date": "2020-01-01"
        }
        response = requests.get(url, params=params, headers=self.get_headers())
        self.print_result("查询无数据日期 (2020-01-01)", response)
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ 返回空列表: {len(data['answers']) == 0}")
        
        return response.status_code == 200
    
    def test_activity_unauthorized(self):
        """测试未授权访问活跃度接口"""
        url = f"{self.base_url}/api/user/activity"
        params = {
            "year": 2025,
            "month": 10
        }
        # 不传 token
        response = requests.get(url, params=params)
        success = response.status_code in [401, 422]
        self.print_result("测试未授权访问 (应该返回 401 或 422)", response)
        return success
    
    def test_activity_workflow(self):
        """测试完整的活跃度工作流"""
        print("\n" + "="*60)
        print("🔄 测试完整活跃度工作流")
        print("="*60)
        
        # 1. 获取当前月份活跃度
        now = datetime.now()
        activity_url = f"{self.base_url}/api/user/activity"
        activity_params = {"year": now.year, "month": now.month}
        activity_response = requests.get(activity_url, params=activity_params, headers=self.get_headers())
        
        if activity_response.status_code != 200:
            print("❌ 获取活跃度失败")
            return False
        
        activity_data = activity_response.json()
        print(f"✅ 步骤1: 获取活跃度成功")
        print(f"   - 本月写作天数: {len(activity_data['daily_counts'])}")
        
        # 2. 找到有数据的日期
        if not activity_data["daily_counts"]:
            print("⚠️  本月暂无写作记录，工作流测试结束")
            return True
        
        # 选择第一个有数据的日期
        test_date = list(activity_data["daily_counts"].keys())[0]
        expected_count = activity_data["daily_counts"][test_date]
        print(f"✅ 步骤2: 选择测试日期 {test_date}，预期答案数: {expected_count}")
        
        # 3. 获取该日期的详细答案
        answers_url = f"{self.base_url}/api/user/answers/by-date"
        answers_params = {"date": test_date}
        answers_response = requests.get(answers_url, params=answers_params, headers=self.get_headers())
        
        if answers_response.status_code != 200:
            print("❌ 获取答案详情失败")
            return False
        
        answers_data = answers_response.json()
        actual_count = len(answers_data["answers"])
        print(f"✅ 步骤3: 获取答案详情成功")
        print(f"   - 实际答案数: {actual_count}")
        
        # 4. 验证数据一致性
        if actual_count == expected_count:
            print(f"✅ 步骤4: 数据一致性验证通过 ✨")
            return True
        else:
            print(f"❌ 步骤4: 数据不一致！预期 {expected_count} 个，实际 {actual_count} 个")
            return False
    

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
        
        '''
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
        '''
        # ✅ 7. 活跃度相关测试
        print("\n📊 === 写作活跃度相关测试 ===")
        results["获取当前月份活跃度"] = self.test_get_activity_current_month()
        results["获取指定月份活跃度"] = self.test_get_activity_specific_month()
        results["测试无效月份参数"] = self.test_get_activity_invalid_month()
        results["获取今天的答案"] = self.test_get_answers_by_date_today()
        results["获取指定日期的答案"] = self.test_get_answers_by_date_specific()
        results["测试无效日期格式"] = self.test_get_answers_by_date_invalid_format()
        results["查询无数据日期"] = self.test_get_answers_by_date_no_data()
        results["测试未授权访问"] = self.test_activity_unauthorized()
        results["完整活跃度工作流"] = self.test_activity_workflow() 

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