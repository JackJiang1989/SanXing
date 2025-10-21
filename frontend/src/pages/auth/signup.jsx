import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { apiUrl } from "../../api/config";


export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setMessage("❌ 两次输入的密码不一致");
      return;
    }

    if (password.length < 6) {
      setMessage("❌ 密码长度至少6位");
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      const res = await fetch(apiUrl("/api/auth/signup"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("✅ 注册成功！正在跳转...");
        setTimeout(() => navigate("/login"), 1500);
      } else {
        setMessage("❌ " + (data.detail || "注册失败"));
      }
    } catch (err) {
      setMessage("❌ 网络错误，请重试");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        {/* 返回首页链接 */}
        <Link 
          to="/" 
          className="inline-flex items-center text-emerald-700 hover:text-emerald-800 transition-colors mb-8"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="font-medium">返回首页</span>
        </Link>

        {/* 注册卡片 */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          {/* 顶部装饰条 */}
          <div className="h-3 bg-gradient-to-r from-teal-400 via-emerald-500 to-teal-500"></div>
          
          <div className="p-10">
            {/* 头部 */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <h1 className="text-3xl font-light text-emerald-900 mb-2">
                创建账号
              </h1>
              <p className="text-emerald-600">开始你的思考记录之旅</p>
            </div>

            {/* 消息提示 */}
            {message && (
              <div className={`mb-6 p-4 rounded-xl text-center ${
                message.includes("✅") 
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}>
                {message}
              </div>
            )}

            {/* 注册表单 */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  邮箱地址
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  disabled={isLoading}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-400 focus:outline-none transition-colors text-gray-800 disabled:bg-gray-50 disabled:cursor-not-allowed"
                />
                <p className="mt-2 text-sm text-gray-500">
                  我们会将你的思考记录关联到此邮箱
                </p>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  密码
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="至少6位字符"
                  required
                  disabled={isLoading}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-400 focus:outline-none transition-colors text-gray-800 disabled:bg-gray-50 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  确认密码
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="再次输入密码"
                  required
                  disabled={isLoading}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-400 focus:outline-none transition-colors text-gray-800 disabled:bg-gray-50 disabled:cursor-not-allowed"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-emerald-600 font-medium flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    注册中...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    立即注册
                  </>
                )}
              </button>
            </form>

            {/* 分割线 */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-center text-gray-600">
                已有账号？{" "}
                <Link 
                  to="/login" 
                  className="text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
                >
                  立即登录
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* 底部提示 */}
        <div className="mt-6 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-2xl p-6 text-white">
          <div className="space-y-3">
            <div className="flex items-start">
              <svg className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-emerald-50 text-sm">
                记录每日思考，追踪成长轨迹
              </p>
            </div>
            <div className="flex items-start">
              <svg className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-emerald-50 text-sm">
                整理问题文件夹，系统化思考
              </p>
            </div>
            <div className="flex items-start">
              <svg className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-emerald-50 text-sm">
                可视化日历，让坚持看得见
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}