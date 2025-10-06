// frontend/src/pages/QA/QApage.jsx

import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getQuestion } from "../api/question";
import { saveAnswer, getAnswers } from "../api/answer";
import { getCurrentUser } from "../api/user";

export function useCurrentUser() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    let cancelled = false;

    getCurrentUser(token)
      .then(data => {
        if (!cancelled) setUser(data);
      })
      .catch(err => {
        console.error(err);
        if (!cancelled) setUser(null);
      });

    return () => { cancelled = true };
  }, []);

  return user;
}

export default function QuestionPage(props) {
  const user = useCurrentUser();

  const { questionId: paramId } = useParams();
  const questionId = props.questionId || paramId;

  const [question, setQuestion] = useState(null);
  const [answerContent, setAnswerContent] = useState("");
  const [message, setMessage] = useState("");
  const [answers, setAnswers] = useState([]);

  const token = localStorage.getItem("token");

  useEffect(() => {
    async function fetchData() {
      const q = await getQuestion(questionId);
      setQuestion(q);
    }
    fetchData();
  }, [questionId]);

  useEffect(() => {
    if (token) {
      fetchAnswers();
    }
  }, [token, questionId]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!token) {
      setMessage("请先登录后再提交回答");
      return;
    }
    if (!answerContent.trim()) {
      setMessage("回答内容不能为空");
      return;
    }
    try {
      await saveAnswer(answerContent, token, questionId);
      setMessage("success");
      setAnswerContent("");
      fetchAnswers();
      // 3秒后清除成功消息
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage("提交失败，请重试");
    }
  }

  async function fetchAnswers() {
    try {
      const data = await getAnswers(token, questionId);
      setAnswers(data);
    } catch (err) {
      console.error("获取答案失败", err);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
      {/* 顶部导航栏 */}
      <nav className="bg-white shadow-sm border-b border-emerald-100">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link 
            to="/" 
            className="flex items-center text-emerald-700 hover:text-emerald-800 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-medium">返回首页</span>
          </Link>
          
          {user ? (
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-800">{user.username}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                <span className="text-emerald-700 font-semibold">
                  {user.username.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
          ) : (
            <Link 
              to="/login" 
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              登录
            </Link>
          )}
        </div>
      </nav>

      {/* 主内容区 */}
      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* 问题卡片 */}
        {question ? (
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-8">
            {/* 顶部装饰 */}
            <div className="h-3 bg-gradient-to-r from-emerald-400 to-teal-500"></div>
            
            <div className="p-10">
              {/* 标签 */}
              {question.tag && (
                <span className="inline-block px-4 py-1 bg-teal-50 text-teal-700 rounded-full text-sm mb-6">
                  {question.tag}
                </span>
              )}
              
              {/* 问题文本 */}
              <h1 className="text-3xl font-light text-gray-900 mb-6 leading-relaxed">
                {question.question_text}
              </h1>
              
              {/* 鼓励语 */}
              {question.inspiring_words && (
                <div className="bg-emerald-50 border-l-4 border-emerald-400 p-4 rounded-r-lg">
                  <p className="text-emerald-700 italic">
                    {question.inspiring_words}
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-xl p-10 text-center">
            <div className="inline-block w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">加载中...</p>
          </div>
        )}

        {/* 回答表单 */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-8">
          <div className="p-10">
            <h2 className="text-2xl font-light text-gray-900 mb-6">写下你的回答</h2>
            
            <form onSubmit={handleSubmit}>
              <textarea
                value={answerContent}
                onChange={(e) => setAnswerContent(e.target.value)}
                placeholder="在这里分享你的思考..."
                rows="8"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-400 focus:outline-none resize-none transition-colors text-gray-800 leading-relaxed"
              />
              
              {/* 提示信息 */}
              {message && (
                <div className={`mt-4 p-4 rounded-lg ${
                  message === "success" 
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
                    : "bg-red-50 text-red-700 border border-red-200"
                }`}>
                  {message === "success" ? "✓ 回答提交成功！" : message}
                </div>
              )}
              
              <div className="mt-6 flex justify-end">
                <button
                  type="submit"
                  className="px-8 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium"
                >
                  提交回答
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* 历史回答列表 */}
        {answers.length > 0 && (
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
            <div className="p-10">
              <h2 className="text-2xl font-light text-gray-900 mb-6">
                你的回答历史 
                <span className="ml-3 text-lg text-gray-500">({answers.length})</span>
              </h2>
              
              <div className="space-y-6">
                {answers.map((a, index) => (
                  <div 
                    key={a.id} 
                    className="border-l-4 border-emerald-200 pl-6 py-4 hover:border-emerald-400 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-gray-500">
                        第 {answers.length - index} 次回答
                      </span>
                      <span className="text-sm text-gray-400">
                        {new Date(a.created_at).toLocaleDateString('zh-CN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {a.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 空状态 */}
        {token && answers.length === 0 && question && (
          <div className="bg-white rounded-3xl shadow-xl p-12 text-center">
            <svg 
              className="w-16 h-16 mx-auto mb-4 text-gray-300" 
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
            <p className="text-gray-500 text-lg">还没有回答这个问题</p>
            <p className="text-gray-400 text-sm mt-2">在上方写下你的第一个回答吧</p>
          </div>
        )}
      </div>
    </div>
  );
}