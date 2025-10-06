// frontend/src/pages/folder/CreateFolderPage.jsx

import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createFolder, addQuestionToFolder } from "../api/folder";

export default function CreateFolderPage() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [folderName, setFolderName] = useState("");
  const [allQuestions, setAllQuestions] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (token) {
      loadAllQuestions();
    }
  }, [token]);

  async function loadAllQuestions() {
    setIsLoading(true);
    try {
      const res = await fetch("/api/all_questions");
      const data = await res.json();
      setAllQuestions(data);
    } catch (err) {
      setMessage("❌ 获取问题列表失败");
    } finally {
      setIsLoading(false);
    }
  }

  function toggleQuestion(questionId) {
    if (selectedQuestions.includes(questionId)) {
      setSelectedQuestions(selectedQuestions.filter(id => id !== questionId));
    } else {
      setSelectedQuestions([...selectedQuestions, questionId]);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    
    if (!folderName.trim()) {
      setMessage("❌ 请输入文件夹名称");
      return;
    }

    setIsCreating(true);
    setMessage("");

    try {
      // 1. 创建文件夹
      const folder = await createFolder(token, folderName);
      
      // 2. 添加选中的问题到文件夹
      if (selectedQuestions.length > 0) {
        for (const questionId of selectedQuestions) {
          await addQuestionToFolder(token, folder.id, questionId);
        }
      }

      setMessage("✅ 文件夹创建成功！");
      setTimeout(() => {
        navigate("/folders");
      }, 1000);
    } catch (err) {
      setMessage("❌ " + err.message);
    } finally {
      setIsCreating(false);
    }
  }

  // 过滤问题
  const filteredQuestions = allQuestions.filter(q =>
    q.question_text.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (q.tag && q.tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="bg-white rounded-3xl shadow-xl p-12 text-center">
          <p className="text-gray-700 text-lg mb-6">请先登录</p>
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
          to="/folders" 
          className="inline-flex items-center text-emerald-700 hover:text-emerald-800 transition-colors mb-8"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="font-medium">返回文件夹列表</span>
        </Link>

        {/* 主表单卡片 */}
        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
            {/* 顶部装饰 */}
            <div className="h-3 bg-gradient-to-r from-emerald-400 to-teal-500"></div>
            
            <div className="p-10">
              {/* 标题 */}
              <div className="text-center mb-8">
                <h1 className="text-4xl font-light text-emerald-900 mb-3">
                  📁 创建新文件夹
                </h1>
                <p className="text-emerald-600">为你的问题集合命名并添加内容</p>
              </div>

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

              {/* 文件夹名称输入 */}
              <div className="mb-8">
                <label className="block text-gray-700 font-medium mb-3">
                  文件夹名称 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={folderName}
                  onChange={(e) => setFolderName(e.target.value)}
                  placeholder="例如：哲学思考、生活感悟、工作反思..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-400 focus:outline-none transition-colors text-gray-800"
                  disabled={isCreating}
                />
              </div>

              {/* 选择问题部分 */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-gray-700 font-medium">
                    添加问题（可选）
                  </label>
                  <span className="text-sm text-gray-500">
                    已选择 {selectedQuestions.length} 个
                  </span>
                </div>

                {/* 搜索框 */}
                <div className="relative mb-4">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="搜索问题..."
                    className="w-full px-4 py-2 pl-10 border-2 border-gray-200 rounded-xl focus:border-emerald-400 focus:outline-none transition-colors text-gray-800"
                  />
                  <svg 
                    className="w-5 h-5 text-gray-400 absolute left-3 top-3" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>

                {/* 问题列表 */}
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="inline-block w-6 h-6 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
                    <p className="mt-2 text-gray-600 text-sm">加载问题列表...</p>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-xl p-4 max-h-96 overflow-y-auto">
                    {filteredQuestions.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <svg className="w-12 h-12 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p>没有找到相关问题</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {filteredQuestions.map((question) => {
                          const isSelected = selectedQuestions.includes(question.id);
                          return (
                            <div
                              key={question.id}
                              onClick={() => toggleQuestion(question.id)}
                              className={`
                                p-4 rounded-lg cursor-pointer transition-all duration-200
                                ${isSelected 
                                  ? "bg-emerald-100 border-2 border-emerald-400" 
                                  : "bg-white border-2 border-gray-200 hover:border-emerald-300"
                                }
                              `}
                            >
                              <div className="flex items-start">
                                <div className={`
                                  w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 mr-3 flex-shrink-0
                                  ${isSelected 
                                    ? "bg-emerald-500 border-emerald-500" 
                                    : "border-gray-300"
                                  }
                                `}>
                                  {isSelected && (
                                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                  )}
                                </div>
                                <div className="flex-1">
                                  <p className={`text-sm leading-relaxed ${isSelected ? "text-emerald-900 font-medium" : "text-gray-700"}`}>
                                    {question.question_text}
                                  </p>
                                  {question.tag && (
                                    <span className="inline-block mt-2 px-2 py-1 bg-teal-50 text-teal-700 rounded text-xs">
                                      {question.tag}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 提交按钮 */}
              <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => navigate("/folders")}
                  className="px-6 py-3 text-gray-700 hover:text-gray-900 transition-colors"
                  disabled={isCreating}
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={isCreating || !folderName.trim()}
                  className="px-8 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-emerald-600 flex items-center"
                >
                  {isCreating ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      创建中...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      创建文件夹
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>

        {/* 提示卡片 */}
        <div className="mt-6 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-6 text-white">
          <div className="flex items-start">
            <svg className="w-6 h-6 mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="font-medium mb-1">小提示</h3>
              <p className="text-emerald-50 text-sm leading-relaxed">
                你可以先创建空文件夹，之后再添加问题。创建后可以在文件夹详情页继续管理问题。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}