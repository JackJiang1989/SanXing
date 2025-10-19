#!/usr/bin/env python3
"""
后端 API 自动化测试脚本
使用方法: python test_backend.py
"""

import requests
import json
from datetime import datetime

# ✅ 修改为你的后端 URL
BACKEND_URL = "https://sanxing.onrender.com"

# 使用时间戳生成唯一测试邮箱
TEST_EMAIL = f"test_{datetime.now().strftime('%Y%m%d_%H%M%S')}@example.com"
TEST_PASSWORD = "testpass123"

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    END = '\033[0m'

def print_test(name, passed, details=""):
    """打印测试结果"""
    status = f"{Colors.GREEN}✓ PASS{Colors.END}" if passed else f"{Colors.RED}✗ FAIL{Colors.END}"
    print(f"{status} {name}")
    if details:
        print(f"  {Colors.BLUE}{details}{Colors.END}")

def print_section(title):
    """打印测试部分标题"""
    print(f"\n{Colors.YELLOW}{'='*60}{Colors.END}")
    print(f"{Colors.YELLOW}{title}{Colors.END}")
    print(f"{Colors.YELLOW}{'='*60}{Colors.END}")

def test_health_check():
    """测试 1: 健康检查（支持冷启动）"""
    print_section("测试 1: 健康检查")
    
    print(f"{Colors.YELLOW}⏳ 正在连接服务器（免费套餐冷启动可能需要 30-60 秒）...{Colors.END}")
    
    # 增加超时时间，支持冷启动
    max_retries = 3
    retry_delay = 20  # 每次重试间隔 20 秒
    
    for attempt in range(1, max_retries + 1):
        try:
            print(f"  尝试 {attempt}/{max_retries}...")
            
            # 使用 70 秒超时，足够冷启动
            response = requests.get(f"{BACKEND_URL}/health", timeout=70)
            data = response.json()
            
            print(f"{Colors.GREEN}✓ 服务已唤醒！{Colors.END}")
            print_test("服务运行", response.status_code == 200, f"状态码: {response.status_code}")
            print_test("数据库连接", data.get("database") == "connected", f"数据库: {data.get('database')}")
            print_test("环境配置", data.get("environment") == "production", f"环境: {data.get('environment')}")
            
            return response.status_code == 200
            
        except requests.exceptions.Timeout:
            if attempt < max_retries:
                print(f"  {Colors.YELLOW}⏰ 超时，{retry_delay} 秒后重试...{Colors.END}")
                import time
                time.sleep(retry_delay)
            else:
                print_test("健康检查", False, "多次尝试后仍超时，请稍后再试")
                return False
                
        except Exception as e:
            print_test("健康检查", False, f"错误: {str(e)}")
            return False
    
    return False

def test_api_docs():
    """测试 2: API 文档访问"""
    print_section("测试 2: API 文档")
    
    try:
        response = requests.get(f"{BACKEND_URL}/docs", timeout=10)
        print_test("Swagger UI 可访问", response.status_code == 200, f"{BACKEND_URL}/docs")
        return response.status_code == 200
    except Exception as e:
        print_test("API 文档", False, str(e))
        return False

def test_user_registration():
    """测试 3: 用户注册"""
    print_section("测试 3: 用户注册")
    
    try:
        response = requests.post(
            f"{BACKEND_URL}/api/auth/signup",
            json={"email": TEST_EMAIL, "password": TEST_PASSWORD},
            timeout=10
        )
        
        success = response.status_code == 200
        print_test("用户注册", success, f"邮箱: {TEST_EMAIL}")
        
        if not success:
            print(f"  {Colors.RED}响应内容: {response.text}{Colors.END}")
        
        return success
    except Exception as e:
        print_test("用户注册", False, str(e))
        return False

def test_duplicate_registration():
    """测试 4: 重复注册（应该失败）"""
    print_section("测试 4: 重复注册检测")
    
    try:
        response = requests.post(
            f"{BACKEND_URL}/api/auth/signup",
            json={"email": TEST_EMAIL, "password": TEST_PASSWORD},
            timeout=10
        )
        
        # 应该返回 400 错误
        success = response.status_code == 400
        print_test("重复注册拒绝", success, f"状态码: {response.status_code} (期望: 400)")
        
        return success
    except Exception as e:
        print_test("重复注册检测", False, str(e))
        return False

def test_user_login():
    """测试 5: 用户登录并返回 token"""
    print_section("测试 5: 用户登录")
    
    try:
        response = requests.post(
            f"{BACKEND_URL}/api/auth/login",
            json={"email": TEST_EMAIL, "password": TEST_PASSWORD},
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            token = data.get("access_token")
            print_test("用户登录", True, f"Token (前20字符): {token[:20]}...")
            print_test("Token 类型", data.get("token_type") == "bearer", f"类型: {data.get('token_type')}")
            return token
        else:
            print_test("用户登录", False, f"状态码: {response.status_code}")
            print(f"  {Colors.RED}响应: {response.text}{Colors.END}")
            return None
    except Exception as e:
        print_test("用户登录", False, str(e))
        return None

def test_wrong_password():
    """测试 6: 错误密码（应该失败）"""
    print_section("测试 6: 错误密码检测")
    
    try:
        response = requests.post(
            f"{BACKEND_URL}/api/auth/login",
            json={"email": TEST_EMAIL, "password": "wrongpassword"},
            timeout=10
        )
        
        success = response.status_code == 401
        print_test("错误密码拒绝", success, f"状态码: {response.status_code} (期望: 401)")
        
        return success
    except Exception as e:
        print_test("错误密码检测", False, str(e))
        return False

def test_get_user_info(token):
    """测试 7: 获取用户信息"""
    print_section("测试 7: 获取用户信息")
    
    try:
        response = requests.get(
            f"{BACKEND_URL}/api/me",
            headers={"Authorization": f"Bearer {token}"},
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            print_test("获取用户信息", True)
            print(f"  邮箱: {data.get('email')}")
            print(f"  用户名: {data.get('username')}")
            print(f"  注册时间: {data.get('created_at')}")
            return True
        else:
            print_test("获取用户信息", False, f"状态码: {response.status_code}")
            return False
    except Exception as e:
        print_test("获取用户信息", False, str(e))
        return False

def test_daily_questions():
    """测试 8: 每日问题"""
    print_section("测试 8: 每日问题")
    
    try:
        response = requests.get(f"{BACKEND_URL}/api/daily-questions", timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            print_test("获取每日问题", len(data) == 3, f"返回 {len(data)} 个问题 (期望: 3)")
            
            if len(data) > 0:
                question = data[0]
                print(f"  示例问题:")
                print(f"    ID: {question.get('id')}")
                print(f"    问题: {question.get('question_text')}")
                print(f"    标签: {question.get('tag')}")
                return question.get('id')
            return None
        else:
            print_test("获取每日问题", False, f"状态码: {response.status_code}")
            return None
    except Exception as e:
        print_test("获取每日问题", False, str(e))
        return None

def test_all_questions():
    """测试 9: 获取所有问题"""
    print_section("测试 9: 获取所有问题")
    
    try:
        response = requests.get(f"{BACKEND_URL}/api/all_questions", timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            print_test("获取所有问题", len(data) > 0, f"找到 {len(data)} 个问题")
            return True
        else:
            print_test("获取所有问题", False, f"状态码: {response.status_code}")
            return False
    except Exception as e:
        print_test("获取所有问题", False, str(e))
        return False

def test_save_answer(token, question_id):
    """测试 10: 保存答案"""
    print_section("测试 10: 保存答案")
    
    if not question_id:
        print_test("保存答案", False, "没有可用的问题 ID")
        return None
    
    try:
        answer_content = f"这是一个自动化测试答案 - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
        response = requests.post(
            f"{BACKEND_URL}/api/answer",
            json={"content": answer_content, "question_id": question_id},
            headers={"Authorization": f"Bearer {token}"},
            timeout=10
        )
        
        success = response.status_code == 200
        print_test("保存答案", success, f"问题 ID: {question_id}")
        
        if not success:
            print(f"  {Colors.RED}响应: {response.text}{Colors.END}")
        
        return success
    except Exception as e:
        print_test("保存答案", False, str(e))
        return False

def test_get_answers(token, question_id):
    """测试 11: 获取答案"""
    print_section("测试 11: 获取答案")
    
    try:
        response = requests.get(
            f"{BACKEND_URL}/api/answer?question_id={question_id}",
            headers={"Authorization": f"Bearer {token}"},
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            print_test("获取答案", len(data) > 0, f"找到 {len(data)} 个答案")
            
            if len(data) > 0:
                answer = data[0]
                print(f"  答案内容: {answer.get('content')[:50]}...")
                print(f"  创建时间: {answer.get('created_at')}")
            return True
        else:
            print_test("获取答案", False, f"状态码: {response.status_code}")
            return False
    except Exception as e:
        print_test("获取答案", False, str(e))
        return False

def test_create_folder(token):
    """测试 12: 创建文件夹"""
    print_section("测试 12: 文件夹功能")
    
    try:
        folder_name = f"测试文件夹_{datetime.now().strftime('%H%M%S')}"
        response = requests.post(
            f"{BACKEND_URL}/api/folders",
            json={"name": folder_name},
            headers={"Authorization": f"Bearer {token}"},
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            folder_id = data.get("id")
            print_test("创建文件夹", True, f"文件夹名: {folder_name}")
            print(f"  文件夹 ID: {folder_id}")
            return folder_id
        else:
            print_test("创建文件夹", False, f"状态码: {response.status_code}")
            return None
    except Exception as e:
        print_test("创建文件夹", False, str(e))
        return None

def test_get_folders(token):
    """测试 13: 获取文件夹列表"""
    print_section("测试 13: 获取文件夹列表")
    
    try:
        response = requests.get(
            f"{BACKEND_URL}/api/folders",
            headers={"Authorization": f"Bearer {token}"},
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            print_test("获取文件夹列表", len(data) > 0, f"找到 {len(data)} 个文件夹")
            return True
        else:
            print_test("获取文件夹列表", False, f"状态码: {response.status_code}")
            return False
    except Exception as e:
        print_test("获取文件夹列表", False, str(e))
        return False

def test_user_settings(token):
    """测试 14: 用户设置"""
    print_section("测试 14: 用户设置")
    
    try:
        response = requests.get(
            f"{BACKEND_URL}/api/user/settings",
            headers={"Authorization": f"Bearer {token}"},
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            print_test("获取用户设置", True)
            print(f"  邮箱: {data.get('email')}")
            print(f"  用户名: {data.get('username')}")
            print(f"  答案数量: {len(data.get('answers', []))}")
            return True
        else:
            print_test("获取用户设置", False, f"状态码: {response.status_code}")
            return False
    except Exception as e:
        print_test("获取用户设置", False, str(e))
        return False

def main():
    """主测试流程"""
    print(f"\n{Colors.YELLOW}{'='*60}{Colors.END}")
    print(f"{Colors.YELLOW}后端 API 自动化测试{Colors.END}")
    print(f"{Colors.YELLOW}{'='*60}{Colors.END}")
    print(f"后端 URL: {Colors.BLUE}{BACKEND_URL}{Colors.END}")
    print(f"测试邮箱: {Colors.BLUE}{TEST_EMAIL}{Colors.END}")
    print(f"开始时间: {Colors.BLUE}{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}{Colors.END}")
    
    print(f"\n{Colors.YELLOW}💡 提示: 免费套餐首次请求可能需要 30-60 秒唤醒服务{Colors.END}")
    print(f"{Colors.YELLOW}   服务唤醒后，后续测试会很快完成{Colors.END}\n")
    
    results = {
        "passed": 0,
        "failed": 0,
        "total": 0
    }
    
    # 测试计数器
    def count_result(result):
        results["total"] += 1
        if result:
            results["passed"] += 1
        else:
            results["failed"] += 1
            
    question_id = test_daily_questions()
    count_result(question_id is not None)

    # # 1. 健康检查（支持冷启动重试）
    # if not test_health_check():
    #     print(f"\n{Colors.RED}❌ 健康检查失败{Colors.END}")
    #     print(f"\n{Colors.YELLOW}可能的原因：{Colors.END}")
    #     print(f"  1. 服务正在冷启动（需要更长时间）")
    #     print(f"  2. 服务部署失败（检查 Render 日志）")
    #     print(f"  3. 网络连接问题")
    #     print(f"\n{Colors.YELLOW}建议：{Colors.END}")
    #     print(f"  - 访问 {BACKEND_URL}/docs 检查服务是否正常")
    #     print(f"  - 等待 1-2 分钟后重新运行测试")
    #     print(f"  - 检查 Render Dashboard 的部署状态\n")
    #     return
    
    # # 2. API 文档
    # count_result(test_api_docs())
    
    # # 3. 用户注册
    # if not test_user_registration():
    #     print(f"\n{Colors.RED}❌ 用户注册失败，停止测试{Colors.END}")
    #     return
    # count_result(True)
    
    # # 4. 重复注册
    # count_result(test_duplicate_registration())
    
    # # 5. 用户登录
    # token = test_user_login()
    # if not token:
    #     print(f"\n{Colors.RED}❌ 用户登录失败，停止测试{Colors.END}")
    #     return
    # count_result(True)
    
    # # 6. 错误密码
    # count_result(test_wrong_password())
    
    # # 7. 获取用户信息
    # count_result(test_get_user_info(token))
    
    # # 8. 每日问题
    # question_id = test_daily_questions()
    # count_result(question_id is not None)
    
    # # 9. 所有问题
    # count_result(test_all_questions())
    
    # # 10-11. 答案功能
    # if question_id:
    #     count_result(test_save_answer(token, question_id))
    #     count_result(test_get_answers(token, question_id))
    
    # # 12-13. 文件夹功能
    # folder_id = test_create_folder(token)
    # count_result(folder_id is not None)
    # if folder_id:
    #     count_result(test_get_folders(token))
    
    # # 14. 用户设置
    # count_result(test_user_settings(token))
    
    # # 总结
    # print_section("测试总结")
    # print(f"总测试数: {results['total']}")
    # print(f"{Colors.GREEN}通过: {results['passed']}{Colors.END}")
    # print(f"{Colors.RED}失败: {results['failed']}{Colors.END}")
    
    # success_rate = (results['passed'] / results['total'] * 100) if results['total'] > 0 else 0
    # print(f"成功率: {success_rate:.1f}%")
    
    # if results['failed'] == 0:
    #     print(f"\n{Colors.GREEN}{'='*60}{Colors.END}")
    #     print(f"{Colors.GREEN}🎉 所有测试通过！后端 API 运行正常！{Colors.END}")
    #     print(f"{Colors.GREEN}{'='*60}{Colors.END}")
    # else:
    #     print(f"\n{Colors.YELLOW}{'='*60}{Colors.END}")
    #     print(f"{Colors.YELLOW}⚠️  部分测试失败，请检查错误信息{Colors.END}")
    #     print(f"{Colors.YELLOW}{'='*60}{Colors.END}")
    
    # print(f"\n完成时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    # print(f"\n{Colors.BLUE}💡 提示: 你也可以访问 {BACKEND_URL}/docs 手动测试 API{Colors.END}\n")

if __name__ == "__main__":
    main()