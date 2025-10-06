// frontend/src/pages/folder/folderpage.jsx

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getFolders, deleteFolder } from "../api/folder";

export default function FolderPage() {
  const navigate = useNavigate();
  const [folders, setFolders] = useState([]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (token) {
      loadFolders();
    }
  }, [token]);

  async function loadFolders() {
    setIsLoading(true);
    try {
      const data = await getFolders(token);
      setFolders(data);
    } catch (err) {
      setMessage("❌ " + err.message);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDeleteFolder(folderId, folderName) {
    if (!confirm(`确定要删除文件夹"${folderName}"吗？`)) return;
    try {
      await deleteFolder(token, folderId);
      setMessage("✅ 删除成功！");
      loadFolders();
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage("❌ " + err.message);
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="bg-white rounded-3xl shadow-xl p-12 text-center">
          <svg className="w-16 h-16 mx-auto mb-4 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <p className="text-gray-700 text-lg mb-6">请先登录查看文件夹</p>
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
      <div className="max-w-7xl mx-auto">
        {/* 返回链接 */}
        <Link 
          to="/" 
          className="inline-flex items-center text-emerald-700 hover:text-emerald-800 transition-colors mb-8"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="font-medium">返回首页</span>
        </Link>

        {/* 主卡片 */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          {/* 顶部装饰 */}
          <div className="h-3 bg-gradient-to-r from-emerald-400 to-teal-500"></div>
          
          <div className="p-10">
            {/* 标题区域 */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-light text-emerald-900 mb-3">
                📁 我的文件夹
              </h1>
              <p className="text-emerald-600">整理你的问题集合</p>
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

            {/* 加载状态 */}
            {isLoading && (
              <div className="text-center py-12">
                <div className="inline-block w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-600">加载中...</p>
              </div>
            )}

            {/* 文件夹网格 */}
            {!isLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 创建新文件夹卡片 */}
                <div
                  onClick={() => navigate("/folders/create")}
                  className="group cursor-pointer"
                >
                  <div className="h-full border-3 border-dashed border-emerald-300 rounded-2xl p-8 hover:border-emerald-500 hover:bg-emerald-50 transition-all duration-300 flex flex-col items-center justify-center min-h-[280px]">
                    <div className="w-20 h-20 rounded-full bg-emerald-100 group-hover:bg-emerald-200 flex items-center justify-center mb-4 transition-colors">
                      <svg className="w-10 h-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-medium text-emerald-700 group-hover:text-emerald-800 transition-colors">
                      创建新文件夹
                    </h3>
                    <p className="text-sm text-emerald-600 mt-2">整理你的问题集合</p>
                  </div>
                </div>

                {/* 文件夹卡片 */}
                {folders.map((folder) => (
                  <div
                    key={folder.id}
                    className="group relative"
                  >
                    <div className="bg-gradient-to-br from-white to-emerald-50 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-emerald-100">
                      {/* 文件夹头部 */}
                      <div 
                        onClick={() => navigate(`/folders/${folder.id}`)}
                        className="p-6 cursor-pointer"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center flex-1">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mr-4 shadow-md">
                              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                              </svg>
                            </div>
                            <div className="flex-1">
                              <h3 className="text-xl font-medium text-gray-800 group-hover:text-emerald-700 transition-colors mb-1">
                                {folder.name}
                              </h3>
                              <p className="text-sm text-gray-500">
                                {folder.questions.length} 个问题
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* 问题预览（前3个） */}
                        {folder.questions.length > 0 ? (
                          <div className="space-y-2 mb-4">
                            {folder.questions.slice(0, 3).map((q) => (
                              <div 
                                key={q.id}
                                className="bg-white rounded-lg p-3 border border-gray-100 hover:border-emerald-200 transition-colors"
                              >
                                <p className="text-sm text-gray-700 line-clamp-1">
                                  {q.question_text}
                                </p>
                                {q.tag && (
                                  <span className="inline-block mt-1 px-2 py-0.5 bg-teal-50 text-teal-600 rounded text-xs">
                                    {q.tag}
                                  </span>
                                )}
                              </div>
                            ))}
                            {folder.questions.length > 3 && (
                              <p className="text-xs text-gray-400 text-center pt-2">
                                还有 {folder.questions.length - 3} 个问题...
                              </p>
                            )}
                          </div>
                        ) : (
                          <div className="bg-gray-50 rounded-lg p-6 text-center mb-4">
                            <svg className="w-8 h-8 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                            </svg>
                            <p className="text-sm text-gray-400">暂无问题</p>
                          </div>
                        )}

                        {/* 创建时间 */}
                        <div className="flex items-center text-xs text-gray-400">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {new Date(folder.created_at).toLocaleDateString('zh-CN')}
                        </div>
                      </div>

                      {/* 文件夹底部操作栏 */}
                      <div className="border-t border-gray-100 bg-gray-50 px-6 py-3 flex items-center justify-between">
                        <button
                          onClick={() => navigate(`/folders/${folder.id}`)}
                          className="text-sm text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
                        >
                          查看详情 →
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteFolder(folder.id, folder.name);
                          }}
                          className="text-sm text-red-500 hover:text-red-600 transition-colors"
                        >
                          删除
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 空状态 */}
            {!isLoading && folders.length === 0 && (
              <div className="text-center py-16">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center">
                  <svg className="w-12 h-12 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-light text-gray-800 mb-3">
                  还没有文件夹
                </h3>
                <p className="text-gray-500 mb-8">
                  创建文件夹来整理你的问题集合
                </p>
                <button
                  onClick={() => navigate("/folders/create")}
                  className="inline-flex items-center px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors shadow-lg hover:shadow-xl"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>创建第一个文件夹</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}