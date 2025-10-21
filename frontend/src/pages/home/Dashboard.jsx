import { Link } from "react-router-dom";
import DailyQuestionsCard from "../../components/DailyQuestionsCard";
import Calendar from "../../components/Calendar";
import Folders from "../../components/Folders";

function Dashboard() {
  const token = localStorage.getItem("token");

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100">
      {/* 顶部导航栏 */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-emerald-100">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mr-3 shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h1 class="kaishu text-3xl font-light text-emerald-900 tracking-wider">三省</h1>
            </div>
            
            {token ? (
              <div className="flex items-center gap-4">
                <Link 
                  to="/setting" 
                  className="px-4 py-2 text-emerald-700 hover:text-emerald-800 transition-colors flex items-center"
                >
                  <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  个人中心
                </Link>
              </div>
            ) : (
              <Link 
                to="/login" 
                className="px-6 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors shadow-md"
              >
                登录
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* 主容器 */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Hero Section */}
        {/* <div className="text-center mb-8">
          <h2 className="text-5xl font-extralight text-emerald-900 mb-4">
            每日思考，记录成长
          </h2>
          <p className="text-xl text-emerald-600 font-light">
            在这里整理你的想法，追踪你的思考轨迹
          </p>
        </div> */}

        {/* 功能卡片容器 */}
        <div className="space-y-8">
          {/* 卡片1: 每日问题 */}
          <section 
            id="daily-questions" 
            className="scroll-mt-20 bg-white rounded-3xl shadow-xl overflow-hidden transform transition-all duration-500 hover:shadow-2xl"
          >
            <div className="h-2 bg-gradient-to-r from-emerald-400 via-teal-500 to-emerald-500"></div>
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-2xl font-light text-gray-900">今日问题</h3>
                    <p className="text-sm text-emerald-600 mt-1">开始你的每日思考之旅</p>
                  </div>
                </div>
                <a 
                  href="#daily-questions" 
                  className="text-emerald-600 hover:text-emerald-700 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </a>
              </div>
              <DailyQuestionsCard />
            </div>
          </section>

          {/* 卡片2: 写作日历 */}
          <section 
            id="calendar" 
            className="scroll-mt-20 bg-white rounded-3xl shadow-xl overflow-hidden transform transition-all duration-500 hover:shadow-2xl"
          >
            <div className="h-2 bg-gradient-to-r from-teal-400 via-emerald-500 to-teal-500"></div>
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-2xl font-light text-gray-900">写作日历</h3>
                    <p className="text-sm text-teal-600 mt-1">记录你的思考轨迹</p>
                  </div>
                </div>
                <a 
                  href="#calendar" 
                  className="text-teal-600 hover:text-teal-700 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </a>
              </div>
              {token ? (
                <Calendar />
              ) : (
                <div className="text-center py-16 bg-gradient-to-br from-teal-50 to-emerald-50 rounded-2xl">
                  <svg className="w-16 h-16 mx-auto mb-4 text-teal-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <p className="text-gray-700 text-lg mb-6">登录后查看你的写作日历</p>
                  <Link 
                    to="/login" 
                    className="inline-block px-6 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors shadow-md"
                  >
                    立即登录
                  </Link>
                </div>
              )}
            </div>
          </section>

          {/* 卡片3: 问题文件夹 */}
          <section 
            id="folders" 
            className="scroll-mt-20 bg-white rounded-3xl shadow-xl overflow-hidden transform transition-all duration-500 hover:shadow-2xl"
          >
            <div className="h-2 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400"></div>
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-2xl font-light text-gray-900">问题文件夹</h3>
                    <p className="text-sm text-emerald-600 mt-1">整理你的思考主题</p>
                  </div>
                </div>
                <a 
                  href="#folders" 
                  className="text-emerald-600 hover:text-emerald-700 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </a>
              </div>
              {token ? (
                <Folders />
              ) : (
                <div className="text-center py-16 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl">
                  <svg className="w-16 h-16 mx-auto mb-4 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <p className="text-gray-700 text-lg mb-6">登录后管理你的问题文件夹</p>
                  <Link 
                    to="/login" 
                    className="inline-block px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors shadow-md"
                  >
                    立即登录
                  </Link>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* 页面底部装饰 */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center justify-center space-x-2 text-emerald-600">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
            <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse delay-100"></div>
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse delay-200"></div>
          </div>
          <p className="mt-4 text-sm text-emerald-600 font-light">
            让思考成为习惯
          </p>
        </div>
      </div>

      {/* 返回顶部按钮 */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-8 right-8 w-14 h-14 bg-emerald-600 text-white rounded-full shadow-xl hover:bg-emerald-700 transition-all duration-300 hover:scale-110 flex items-center justify-center z-40"
        aria-label="返回顶部"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      </button>
    </div>
  );
}

export default Dashboard;