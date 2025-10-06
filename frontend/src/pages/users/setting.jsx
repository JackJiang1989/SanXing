import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getUserSettings, updateUserSettings, updateAnswer } from "../../api/user";

export default function UserSettingsPage() {
  const token = localStorage.getItem("token");
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ email: "", username: "", password: "" });
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }
    getUserSettings(token)
      .then(data => {
        setUser(data);
        setForm({ email: data.email, username: data.username, password: "" });
      })
      .catch(e => setMessage("❌ " + e.message))
      .finally(() => setIsLoading(false));
  }, [token]);

  const handleUpdateUser = async () => {
    setIsSaving(true);
    setMessage("");
    try {
      await updateUserSettings(token, form);
      setMessage("✅ 用户信息更新成功");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage("❌ " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateAnswer = async (answerId, newContent) => {
    setMessage("");
    try {
      await updateAnswer(token, answerId, newContent);
      setMessage("✅ 答案更新成功");
      // 重新刷新用户信息
      const data = await getUserSettings(token);
      setUser(data);
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage("❌ " + err.message);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100 flex items-center justify-center px-6">
        <div className="bg-white rounded-3xl shadow-xl p-12 text-center">
          <svg className="w-16 h-16 mx-auto mb-4 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <p className="text-gray-700 text-lg mb-6">请先登录查看个人设置</p>
          <Link 
            to="/login" 
            className="inline-block px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors"
          >
            前往登录
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100 flex items-center justify-center">
        <div className="bg-white rounded-3xl shadow-xl p-12 text-center">
          <div className="inline-block w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100 py-12 px-6">
      <div className="max-w-5xl mx-auto">
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

        {/* 消息提示 */}
        {message && (
          <div className={`mb-6 p-4 rounded-xl ${
            message.includes("✅") 
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
              : "bg-red-50 text-red-700 border border-red-200"
          }`}>
            {message}
          </div>
        )}

        {/* 用户信息卡片 */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-8">
          <div className="h-3 bg-gradient-to-r from-emerald-400 via-teal-500 to-emerald-500"></div>
          
          <div className="p-10">
            {/* 标题 */}
            <div className="flex items-center mb-8">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mr-4 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-light text-emerald-900 mb-1">个人设置</h1>
                <p className="text-emerald-600">管理你的账号信息</p>
              </div>
            </div>

            {/* 表单 */}
            <div className="space-y-6">
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  邮箱地址
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-400 focus:outline-none transition-colors text-gray-800"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  用户名
                </label>
                <input
                  type="text"
                  value={form.username}
                  onChange={e => setForm({ ...form, username: e.target.value })}
                  placeholder="设置你的显示名称"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-400 focus:outline-none transition-colors text-gray-800"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  新密码
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="留空则不修改密码"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-400 focus:outline-none transition-colors text-gray-800"
                />
                <p className="mt-2 text-sm text-gray-500">
                  如需修改密码，请输入新密码（至少6位）
                </p>
              </div>

              <button
                onClick={handleUpdateUser}
                disabled={isSaving}
                className="w-full py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center"
              >
                {isSaving ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    保存中...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    保存更改
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* 我的答案卡片 */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="h-3 bg-gradient-to-r from-teal-400 via-emerald-500 to-teal-500"></div>
          
          <div className="p-10">
            <div className="flex items-center mb-8">
              <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-light text-gray-900">我的答案</h2>
                <p className="text-gray-600 text-sm mt-1">
                  共 {user?.answers?.length || 0} 个回答
                </p>
              </div>
            </div>

            {user?.answers?.length === 0 ? (
              <div className="text-center py-16 bg-gradient-to-br from-teal-50 to-emerald-50 rounded-2xl">
                <svg className="w-16 h-16 mx-auto mb-4 text-teal-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-gray-600 text-lg mb-2">还没有答案</p>
                <p className="text-gray-500 text-sm">开始回答问题，记录你的思考</p>
              </div>
            ) : (
              <div className="space-y-6">
                {user.answers.map(a => (
                  <AnswerItem
                    key={a.id}
                    answer={a}
                    onSave={newContent => handleUpdateAnswer(a.id, newContent)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 账号统计卡片 */}
        <div className="mt-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-3xl shadow-xl p-8 text-white">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-light mb-2">账号统计</h3>
            <p className="text-emerald-50 text-sm">你的思考之旅</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
              <div className="text-4xl font-bold mb-2">{user?.answers?.length || 0}</div>
              <div className="text-emerald-50 text-sm">回答总数</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
              <div className="text-4xl font-bold mb-2">
                {user?.created_at ? Math.floor((Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24)) : 0}
              </div>
              <div className="text-emerald-50 text-sm">加入天数</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
              <div className="text-4xl font-bold mb-2">
                {user?.username || "匿名用户"}
              </div>
              <div className="text-emerald-50 text-sm">用户名</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 单个答案可编辑组件
function AnswerItem({ answer, onSave }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(answer.content);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await onSave(editContent);
    setIsSaving(false);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditContent(answer.content);
    setIsEditing(false);
  };

  return (
    <div className="bg-gradient-to-r from-white to-teal-50 rounded-2xl p-6 border border-teal-100">
      {/* 问题标题 */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center mb-2">
            {answer.tag && (
              <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs mr-2">
                {answer.tag}
              </span>
            )}
            <span className="text-xs text-gray-500">
              {new Date(answer.created_at).toLocaleDateString('zh-CN')}
            </span>
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-3">
            {answer.question_text}
          </h3>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="ml-4 p-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
            title="编辑答案"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
        )}
      </div>

      {/* 答案内容 */}
      {isEditing ? (
        <div className="space-y-4">
          <textarea
            value={editContent}
            onChange={e => setEditContent(e.target.value)}
            rows={6}
            className="w-full px-4 py-3 border-2 border-emerald-300 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors text-gray-800 resize-none"
          />
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={handleCancel}
              disabled={isSaving}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  保存中...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  保存
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="prose prose-emerald max-w-none">
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {answer.content}
          </p>
        </div>
      )}
    </div>
  );
}