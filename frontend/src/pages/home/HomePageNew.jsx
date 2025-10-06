// frontend/src/pages/home/homepage.jsx

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getCurrentUser } from "../../api/user";
import { getDailyQuestions } from "../../api/question";
import { getUserActivity } from "../../api/activity";
import { getFolders } from "../../api/folder";

// 每日问题组件
function DailyQuestionsSection() {
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadQuestions();
  }, []);

  async function loadQuestions() {
    try {
      const res = await fetch("/api/daily-questions");
      if (!res.ok) throw new Error("获取每日问题失败");
      const data = await res.json();
      setQuestions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {questions.map((question, index) => (
        <Link
          key={question.id}
          to={`/question/${question.id}`}
          className="group"
        >
          <div className="bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden h-full flex flex-col transform hover:-translate-y-2">
            <div className="h-2 bg-gradient-to-r from-emerald-400 to-teal-500"></div>
            
            <div className="p-8 flex-1 flex flex-col">
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

              <h2 className="text-xl font-medium text-gray-800 mb-4 leading-relaxed flex-1 group-hover:text-emerald-700 transition-colors">
                {question.question_text}
              </h2>

              {question.inspiring_words && (
                <p className="text-emerald-600 text-sm italic border-l-2 border-emerald-200 pl-4 py-2 bg-emerald-50 rounded-r-lg mb-4">
                  {question.inspiring_words}
                </p>
              )}

              <div className="pt-4 border-t border-gray-100">
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
        </Link>
      ))}
    </div>
  );
}

// 日历组件
function CalendarSection({ token }) {
  const navigate = useNavigate();
  const [activityData, setActivityData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  useEffect(() => {
    if (token) {
      loadActivity();
    }
  }, [token]);

  async function loadActivity() {
    try {
      const data = await getUserActivity(token, currentYear, currentMonth);
      setActivityData(data.daily_counts || {});
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  function generateCalendar() {
    const firstDay = new Date(currentYear, currentMonth - 1, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
    const calendar = [];

    for (let i = 0; i < firstDay; i++) {
      calendar.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      calendar.push(day);
    }

    return calendar;
  }

  function getActivityLevel(count) {
    if (!count) return 0;
    if (count <= 2) return 1;
    if (count <= 5) return 2;
    return 3;
  }

  function handleDateClick(day) {
    if (!day) return;
    const dateStr = `${currentYear}-${String(currentMonth).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    if (activityData[dateStr]) {
      navigate(`/activity/${dateStr}`);
    }
  }

  if (!token) {
    return (
      <div className="text-center py-12 bg-emerald-50 rounded-2xl">
        <svg className="w-12 h-12 mx-auto mb-3 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p className="text-gray-600 mb-4">登录后查看你的写作日历</p>
        <Link to="/login" className="text-emerald-600 hover:text-emerald-700 font-medium">
          立即登录 →
        </Link>
      </div>
    );
  }

  const calendar = generateCalendar();
  const weekDays = ["日", "一", "二", "三", "四", "五", "六"];
  const today = currentDate.getDate();

  // 统计数据
  const totalAnswers = Object.values(activityData).reduce((sum, count) => sum + count, 0);
  const activeDays = Object.keys(activityData).length;

  return (
    <div>
      {/* 统计卡片 */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-emerald-700">{totalAnswers}</div>
          <div className="text-xs text-emerald-600">本月回答</div>
        </div>
        <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-teal-700">{activeDays}</div>
          <div className="text-xs text-teal-600">活跃天数</div>
        </div>
        <div className="bg-gradient-to-br from-cyan-50 to-emerald-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-cyan-700">
            {activeDays > 0 ? (totalAnswers / activeDays).toFixed(1) : 0}
          </div>
          <div className="text-xs text-cyan-600">日均回答</div>
        </div>
      </div>

      {/* 日历网格 */}
      {isLoading ? (
        <div className="text-center py-8">
          <div className="inline-block w-6 h-6 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map(day => (
              <div key={day} className="text-center font-semibold text-gray-600 text-sm py-2">
                {day}
              </div>
            ))}

            {calendar.map((day, index) => {
              if (!day) return <div key={`empty-${index}`} />;

              const dateStr = `${currentYear}-${String(currentMonth).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const count = activityData[dateStr] || 0;
              const level = getActivityLevel(count);
              const isToday = day === today;
              
              const colors = [
                "bg-white border-gray-200",
                "bg-emerald-100 border-emerald-200",
                "bg-emerald-300 border-emerald-400",
                "bg-emerald-500 border-emerald-600"
              ];
              const textColors = [
                "text-gray-400",
                "text-emerald-700",
                "text-emerald-800",
                "text-white"
              ];

              return (
                <div
                  key={day}
                  onClick={() => handleDateClick(day)}
                  className={`
                    relative p-2 rounded-lg border-2 transition-all duration-300 text-center
                    ${colors[level]}
                    ${count > 0 ? "cursor-pointer hover:scale-110" : ""}
                    ${isToday ? "ring-2 ring-emerald-400" : ""}
                  `}
                >
                  <div className={`text-sm font-semibold ${textColors[level]}`}>
                    {day}
                  </div>
                  {count > 0 && (
                    <div className={`
                      absolute -top-1 -right-1 w-4 h-4 rounded-full 
                      flex items-center justify-center text-xs font-bold
                      ${level === 3 ? "bg-white text-emerald-600" : "bg-emerald-600 text-white"}
                    `}>
                      {count}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 查看完整日历链接 */}
      <div className="text-center mt-4">
        <Link 
          to="/activity" 
          className="text-emerald-600 hover:text-emerald-700 text-sm font-medium"
        >
          查看完整日历 →
        </Link>
      </div>
    </div>
  );
}

// 文件夹组件
function FoldersSection({ token }) {
  const navigate = useNavigate();
  const [folders, setFolders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (token) {
      loadFolders();
    }
  }, [token]);

  async function loadFolders() {
    try {
      const data = await getFolders(token);
      setFolders(data.slice(0, 4)); // 只显示前4个
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="text-center py-12 bg-emerald-50 rounded-2xl">
        <svg className="w-12 h-12 mx-auto mb-3 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
        <p className="text-gray-600 mb-4">登录后整理你的问题集合</p>
        <Link to="/login" className="text-emerald-600 hover:text-emerald-700 font-medium">
          立即登录 →
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 创建新文件夹卡片 */}
        <div
          onClick={() => navigate("/folders/create")}
          className="group cursor-pointer"
        >
          <div className="h-full border-3 border-dashed border-emerald-300 rounded-2xl p-6 hover:border-emerald-500 hover:bg-emerald-50 transition-all duration-300 flex flex-col items-center justify-center min-h-[200px]">
            <div className="w-16 h-16 rounded-full bg-emerald-100 group-hover:bg-emerald-200 flex items-center justify-center mb-3 transition-colors">
              <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-emerald-700 group-hover:text-emerald-800 transition-colors">
              创建新文件夹
            </h3>
          </div>
        </div>

        {/* 文件夹列表 */}
        {folders.map((folder) => (
          <div
            key={folder.id}
            onClick={() => navigate(`/folders/${folder.id}`)}
            className="group cursor-pointer"
          >
            <div className="bg-gradient-to-br from-white to-emerald-50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-emerald-100 min-h-[200px]">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-800 group-hover:text-emerald-700 transition-colors">
                      {folder.name}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {folder.questions.length} 个问题
                    </p>
                  </div>
                </div>

                {/* 问题预览 */}
                {folder.questions.length > 0 ? (
                  <div className="space-y-2">
                    {folder.questions.slice(0, 2).map((q) => (
                      <div 
                        key={q.id}
                        className="bg-white rounded-lg p-2 border border-gray-100 text-sm text-gray-600 line-clamp-1"
                      >
                        {q.question_text}
                      </div>
                    ))}
                    {folder.questions.length > 2 && (
                      <p className="text-xs text-gray-400 text-center">
                        还有 {folder.questions.length - 2} 个...
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-center text-gray-400 text-sm py-4">
                    暂无问题
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 查看全部链接 */}
      <div className="text-center mt-6">
        <Link 
          to="/folders" 
          className="text-emerald-600 hover:text-emerald-700 text-sm font-medium"
        >
          查看全部文件夹 →
        </Link>
      </div>
    </div>
  );
}

// 主页面
export default function Homepage() {
  const [user, setUser] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (token) {
      getCurrentUser(token)
        .then(data => setUser(data))
        .catch(err => console.error(err));
    }
  }, [token]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* 导航栏 */}
      <nav className="bg-white shadow-sm border-b border-emerald-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <h1 className="text-2xl font-light text-emerald-800">哲思日记</h1>
          </div>
          
          {user ? (
            <div className="flex items-center gap-4">
              <Link to="/setting" className="text-gray-600 hover:text-emerald-700 transition-colors">
                设置
              </Link>
              <div className="flex items-center">
                <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center">
                  <span className="text-emerald-700 font-semibold text-sm">
                    {user.username.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="ml-2 text-gray-700 text-sm">{user.username}</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link 
                to="/login" 
                className="px-4 py-2 text-emerald-600 hover:text-emerald-700 transition-colors"
              >
                登录
              </Link>
              <Link 
                to="/signup" 
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                注册
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* 主内容区 */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* 每日问题卡片 */}
        <section className="mb-20">
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
            <div className="h-3 bg-gradient-to-r from-emerald-400 to-teal-500"></div>
            <div className="p-10">
              <div className="text-center mb-10">
                <h2 className="text-3xl font-light text-emerald-900 mb-2">
                  今日问题
                </h2>
                <p className="text-emerald-600">
                  {new Date().toLocaleDateString('zh-CN', { 
                    month: 'long', 
                    day: 'numeric',
                    weekday: 'long'
                  })}
                </p>
              </div>
              <DailyQuestionsSection />
            </div>
          </div>
        </section>

        {/* 日历卡片 */}
        <section className="mb-20">
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
            <div className="h-3 bg-gradient-to-r from-teal-400 to-cyan-500"></div>
            <div className="p-10">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-light text-emerald-900 mb-2">
                  📅 写作日历
                </h2>
                <p className="text-emerald-600">
                  {new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' })}
                </p>
              </div>
              <CalendarSection token={token} />
            </div>
          </div>
        </section>

        {/* 文件夹卡片 */}
        <section>
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
            <div className="h-3 bg-gradient-to-r from-cyan-400 to-emerald-500"></div>
            <div className="p-10">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-light text-emerald-900 mb-2">
                  📁 我的文件夹
                </h2>
                <p className="text-emerald-600">整理你的问题集合</p>
              </div>
              <FoldersSection token={token} />
            </div>
          </div>
        </section>
      </main>

      {/* 页脚 */}
      <footer className="bg-white border-t border-emerald-100 mt-20">
        <div className="max-w-7xl mx-auto px-6 py-8 text-center text-gray-500 text-sm">
          <p>© 2025 哲思日记 · 记录每一次思考</p>
        </div>
      </footer>
    </div>
  );
}