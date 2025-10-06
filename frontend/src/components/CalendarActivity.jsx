// frontend/src/pages/activity/DailyAnswersPage.jsx

import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getAnswersByDate } from "../api/activity";

export default function DailyAnswersPage() {
  const { date } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  
  const [answers, setAnswers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) return;
    loadAnswers();
  }, [date, token]);

  async function loadAnswers() {
    setIsLoading(true);
    setMessage("");
    try {
      const data = await getAnswersByDate(token, date);
      setAnswers(data.answers || []);
    } catch (err) {
      setMessage("❌ " + err.message);
    } finally {
      setIsLoading(false);
    }
  }

  function formatDate(dateStr) {
    const d = new Date(dateStr);
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 ${weekdays[d.getDay()]}`;
  }

  function formatTime(datetimeStr) {
    const d = new Date(datetimeStr);
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="bg-white rounded-3xl shadow-xl p-12 text-center">
          <svg className="w-16 h-16 mx-auto mb-4 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <p className="text-gray-700 text-lg mb-6">请先登录查看回答记录</p>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 py-12 px-6">
      <div className="max-w-5xl mx-auto">
        {/* 返回链接 */}
        <Link 
          to="/activity" 
          className="inline-flex items-center text-emerald-700 hover:text-emerald-800 transition-colors mb-8"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="font-medium">返回日历</span>
        </Link>

        {/* 标题卡片 */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-8">
          <div className="h-3 bg-gradient-to-r from-emerald-400 to-teal-500"></div>
          <div className="p-10">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-light text-gray-900 mb-2">
                  📝 {formatDate(date)}
                </h1>
                <p className="text-gray-500">
                  {answers.length > 0 ? `共完成 ${answers.length} 个回答` : '这一天还没有回答'}
                </p>
              </div>
              {answers.length > 0 && (
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg">
                  <span className="text-white text-3xl font-bold">{answers.length}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 错误提示 */}
        {message && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
            {message}
          </div>
        )}

        {/* 加载状态 */}
        {isLoading && (
          <div className="bg-white rounded-3xl shadow-xl p-12 text-center">
            <div className="inline-block w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">加载中...</p>
          </div>
        )}

        {/* 答案列表 */}
        {!isLoading && answers.length > 0 && (
          <div className="space-y-6">
            {answers.map((answer, index) => (
              <div
                key={answer.id}
                className="bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                <div className="h-2 bg-gradient-to-r from-emerald-300 to-teal-400"></div>
                <div className="p-8">
                  {/* 问题标题 */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex-1">
                      <div className="flex items-center mb-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center mr-3">
                          <span className="text-emerald-700 font-semibold text-sm">
                            {index + 1}
                          </span>
                        </div>
                        {answer.tag && (
                          <span className="px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-sm">
                            {answer.tag}
                          </span>
                        )}
                      </div>
                      <h2 
                        onClick={() => navigate(`/question/${answer.question_id}`)}
                        className="text-xl font-medium text-gray-800 hover:text-emerald-700 cursor-pointer transition-colors leading-relaxed"
                      >
                        {answer.question_text}
                      </h2>
                    </div>
                  </div>

                  {/* 分割线 */}
                  <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mb-6"></div>

                  {/* 答案内容 */}
                  <div className="prose prose-emerald max-w-none">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {answer.content}
                    </p>
                  </div>

                  {/* 时间信息 */}
                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <div className="flex items-center text-sm text-gray-500">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      提交于 {formatTime(answer.created_at)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 空状态 */}
        {!isLoading && answers.length === 0 && (
          <div className="bg-white rounded-3xl shadow-xl p-16 text-center">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center">
              <svg 
                className="w-12 h-12 text-emerald-400" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" 
                />
              </svg>
            </div>
            <h3 className="text-2xl font-light text-gray-800 mb-3">
              这一天还没有回答
            </h3>
            <p className="text-gray-500 mb-8">
              每一次思考都值得被记录
            </p>
            <Link 
              to="/" 
              className="inline-flex items-center px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors shadow-lg hover:shadow-xl"
            >
              <span>去回答问题</span>
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        )}

        {/* 统计卡片 */}
        {!isLoading && answers.length > 0 && (
          <div className="mt-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-3xl shadow-xl p-8 text-white text-center">
            <div className="flex items-center justify-center mb-3">
              <svg className="w-8 h-8 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-2xl font-light">完成度统计</h3>
            </div>
            <p className="text-emerald-50 text-lg">
              这一天你完成了 <strong className="text-3xl font-bold mx-2">{answers.length}</strong> 个问题的思考
            </p>
            <p className="text-emerald-100 text-sm mt-3">
              坚持每日记录，让思考成为习惯 ✨
            </p>
          </div>
        )}
      </div>
    </div>
  );
}