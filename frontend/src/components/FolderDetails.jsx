// frontend/src/pages/folder/folderdetailpage.jsx

import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { 
  getFolders, 
  renameFolder, 
  addQuestionToFolder, 
  removeQuestionFromFolder 
} from "../api/folder";
import { apiUrl } from "../api/config";

export default function FolderDetailPage() {
  const { folderId } = useParams();
  const navigate = useNavigate();
  const [folder, setFolder] = useState(null);
  const [newName, setNewName] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState("");
  const [allQuestions, setAllQuestions] = useState([]);
  const [selectedQuestionId, setSelectedQuestionId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (token) {
      loadFolder();
      loadAllQuestions();
    }
  }, [token, folderId]);

  async function loadFolder() {
    try {
      const data = await getFolders(token);
      const currentFolder = data.find(f => f.id === folderId);
      if (currentFolder) {
        setFolder(currentFolder);
        setNewName(currentFolder.name);
      } else {
        setMessage("❌ 文件夹不存在");
      }
    } catch (err) {
      setMessage("❌ " + err.message);
    }
  }

  async function loadAllQuestions() {
    try {
      const res = await fetch(apiUrl("/api/all_questions"));
      const data = await res.json();
      setAllQuestions(data);
    } catch (err) {
      console.error("获取问题失败:", err);
    }
  }

  async function handleRename(e) {
    e.preventDefault();
    if (!newName.trim()) {
      setMessage("❌ 文件夹名称不能为空");
      return;
    }
    try {
      await renameFolder(token, folderId, newName);
      setMessage("✅ 重命名成功！");
      setIsEditing(false);
      loadFolder();
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage("❌ " + err.message);
    }
  }

  async function handleAddQuestion() {
    if (!selectedQuestionId) {
      setMessage("❌ 请选择一个问题");
      return;
    }
    try {
      await addQuestionToFolder(token, folderId, selectedQuestionId);
      setMessage("✅ 添加成功！");
      setSelectedQuestionId("");
      setSearchTerm("");
      setShowAddModal(false);
      loadFolder();
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage("❌ " + err.message);
    }
  }

  async function handleRemoveQuestion(questionId, questionText) {
    if (!confirm(`确定要移除问题"${questionText}"吗？`)) return;
    try {
      await removeQuestionFromFolder(token, folderId, questionId);
      setMessage("✅ 移除成功！");
      loadFolder();
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage("❌ " + err.message);
    }
  }

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

  if (!folder) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="bg-white rounded-3xl shadow-xl p-12 text-center">
          <div className="inline-block w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  // 过滤已在文件夹中的问题
  const availableQuestions = allQuestions.filter(q => 
    !folder.questions.some(fq => fq.id === q.id)
  );

  // 搜索过滤
  const filteredAvailableQuestions = availableQuestions.filter(q =>
    q.question_text.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (q.tag && q.tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 py-12 px-6">
      <div className="max-w-6xl mx-auto">
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

        {/* 文件夹信息卡片 */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-8">
          <div className="h-3 bg-gradient-to-r from-emerald-400 to-teal-500"></div>
          
          <div className="p-10">
            {/* 文件夹头部 */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center flex-1">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mr-5 shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                </div>
                <div className="flex-1">
                  {isEditing ? (
                    <form onSubmit={handleRename} className="flex items-center gap-3">
                      <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="flex-1 px-4 py-2 border-2 border-emerald-300 rounded-xl focus:border-emerald-500 focus:outline-none"
                        autoFocus
                      />
                      <button 
                        type="submit"
                        className="px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors"
                      >
                        保存
                      </button>
                      <button 
                        type="button"
                        onClick={() => {
                          setIsEditing(false);
                          setNewName(folder.name);
                        }}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                      >
                        取消
                      </button>
                    </form>
                  ) : (
                    <div>
                      <h1 className="text-3xl font-light text-gray-900 mb-2">
                        {folder.name}
                      </h1>
                      <div className="flex items-center text-sm text-gray-500">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        创建于 {new Date(folder.created_at).toLocaleDateString('zh-CN')}
                        <span className="mx-2">·</span>
                        {folder.questions.length} 个问题
                      </div>
                    </div>
                  )}
                </div>
              </div>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 text-emerald-600 hover:text-emerald-700 transition-colors flex items-center"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  重命名
                </button>
              )}
            </div>

            {/* 添加问题按钮 */}
            <div className="pt-6 border-t border-gray-200">
              <button
                onClick={() => setShowAddModal(true)}
                className="w-full py-4 border-2 border-dashed border-emerald-300 rounded-xl hover:border-emerald-500 hover:bg-emerald-50 transition-colors flex items-center justify-center text-emerald-700 hover:text-emerald-800"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                添加问题到文件夹
              </button>
            </div>
          </div>
        </div>

        {/* 问题列表 */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-teal-300 to-emerald-400"></div>
          
          <div className="p-10">
            <h2 className="text-2xl font-light text-gray-900 mb-6">
              文件夹中的问题 ({folder.questions.length})
            </h2>

            {folder.questions.length === 0 ? (
              <div className="text-center py-16">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <p className="text-gray-500 text-lg mb-2">文件夹是空的</p>
                <p className="text-gray-400 text-sm">点击上方按钮添加问题</p>
              </div>
            ) : (
              <div className="space-y-4">
                {folder.questions.map((q, index) => (
                  <div
                    key={q.id}
                    className="bg-gradient-to-r from-white to-emerald-50 rounded-2xl p-6 border border-emerald-100 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-3">
                          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center mr-3">
                            <span className="text-emerald-700 font-semibold text-sm">
                              {index + 1}
                            </span>
                          </div>
                          {q.tag && (
                            <span className="px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-sm">
                              {q.tag}
                            </span>
                          )}
                        </div>
                        <Link
                          to={`/question/${q.id}`}
                          className="text-lg font-medium text-gray-800 hover:text-emerald-700 transition-colors block mb-2"
                        >
                          {q.question_text}
                        </Link>
                        {q.inspiring_words && (
                          <p className="text-emerald-600 text-sm italic">
                            {q.inspiring_words}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => handleRemoveQuestion(q.id, q.question_text)}
                        className="ml-4 p-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="移除问题"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 添加问题模态框 */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-6">
            <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
              <div className="h-3 bg-gradient-to-r from-emerald-400 to-teal-500"></div>
              
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-light text-gray-900">添加问题</h3>
                  <button
                    onClick={() => {
                      setShowAddModal(false);
                      setSearchTerm("");
                      setSelectedQuestionId("");
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* 搜索框 */}
                <div className="relative mb-4">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="搜索问题..."
                    className="w-full px-4 py-3 pl-10 border-2 border-gray-200 rounded-xl focus:border-emerald-400 focus:outline-none"
                  />
                  <svg className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>

                {/* 问题列表 */}
                <div className="max-h-96 overflow-y-auto mb-6">
                  {filteredAvailableQuestions.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <p>没有可添加的问题</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {filteredAvailableQuestions.map((q) => (
                        <div
                          key={q.id}
                          onClick={() => setSelectedQuestionId(q.id)}
                          className={`
                            p-4 rounded-xl cursor-pointer transition-all
                            ${selectedQuestionId === q.id
                              ? "bg-emerald-100 border-2 border-emerald-400"
                              : "bg-gray-50 border-2 border-transparent hover:border-emerald-300"
                            }
                          `}
                        >
                          <p className="text-gray-800 mb-1">{q.question_text}</p>
                          {q.tag && (
                            <span className="inline-block px-2 py-1 bg-teal-50 text-teal-700 rounded text-xs">
                              {q.tag}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 按钮 */}
                <div className="flex items-center justify-end gap-3">
                  <button
                    onClick={() => {
                      setShowAddModal(false);
                      setSearchTerm("");
                      setSelectedQuestionId("");
                    }}
                    className="px-6 py-3 text-gray-700 hover:text-gray-900 transition-colors"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleAddQuestion}
                    disabled={!selectedQuestionId}
                    className="px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    添加到文件夹
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}