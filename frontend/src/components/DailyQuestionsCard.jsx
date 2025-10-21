import { useState, useEffect } from "react";
import { apiUrl } from "../api/config";

export default function DailyQuestionsCard() {
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadQuestions();
  }, []);

  async function loadQuestions() {
    try {
      const res = await fetch(apiUrl("/api/daily-questions"));
      if (!res.ok) throw new Error("获取每日问题失败");
      const data = await res.json();
      setQuestions(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  function handleQuestionClick(questionId) {
    // 在实际应用中，这里应该使用 navigate 或 Link
    window.location.href = `/question/${questionId}`;
  }

  return (
    <div className="min-h-0 bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center p-6 rounded-xl">
      <div className="max-w-6xl w-full">
        {/* 标题区域 */}
        <div className="text-center mb-4">
          {/* <h1 className="text-4xl font-light text-emerald-900 mb-3">
            今日问题
          </h1> */}
          <p className="text-emerald-700 text-xl font-light">
            {new Date().toLocaleDateString('zh-CN', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              weekday: 'long'
            })}
          </p>
        </div>

        {/* 加载状态 */}
        {isLoading && (
          <div className="text-center text-emerald-600">
            <div className="inline-block w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
            <p className="mt-4 text-lg">加载中...</p>
          </div>
        )}

        {/* 错误提示 */}
        {error && (
          <div className="text-center text-red-600 bg-red-50 p-6 rounded-2xl">
            <p>{error}</p>
          </div>
        )}

        {/* 问题卡片网格 */}
        {!isLoading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {questions.map((question, index) => (
              <div
                key={question.id}
                onClick={() => handleQuestionClick(question.id)}
                className="group cursor-pointer"
              >
                <div className="bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden h-full flex flex-col transform hover:-translate-y-2">
                  {/* 顶部装饰条 */}
                  <div className="h-2 bg-gradient-to-r from-emerald-400 to-teal-500"></div>
                  
                  {/* 卡片内容 */}
                  <div className="p-8 flex-1 flex flex-col">
                    {/* 序号标识 */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                        <span className="text-emerald-700 font-semibold text-lg">
                          {index + 1}
                        </span>
                      </div>
                      {question.tag && (
                        <span className="px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-sm">
                          {question.tag}
                        </span>
                      )}
                    </div>

                    {/* 问题文本 */}
                    <h2 className="text-xl font-medium text-gray-800 mb-4 leading-relaxed flex-1 group-hover:text-emerald-700 transition-colors">
                      {question.question_text}
                    </h2>

                    {/* 鼓励语 */}
                    {question.inspiring_words && (
                      <p className="text-emerald-600 text-sm italic border-l-2 border-emerald-200 pl-4 py-2 bg-emerald-50 rounded-r-lg">
                        {question.inspiring_words}
                      </p>
                    )}

                    {/* 底部行动提示 */}
                    <div className="mt-6 pt-4 border-t border-gray-100">
                      <div className="flex items-center text-emerald-600 group-hover:text-emerald-700 transition-colors">
                        <span className="text-sm font-medium">开始回答</span>
                        <svg 
                          className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M13 7l5 5m0 0l-5 5m5-5H6" 
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 空状态 */}
        {!isLoading && !error && questions.length === 0 && (
          <div className="text-center text-gray-500 bg-white p-12 rounded-3xl shadow-lg">
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
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" 
              />
            </svg>
            <p className="text-lg">今天还没有可用的问题</p>
            <p className="text-sm mt-2">请稍后再来查看</p>
          </div>
        )}
      </div>
    </div>
  );
}