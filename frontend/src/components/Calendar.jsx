import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getUserActivity } from "../api/activity";

export default function ActivityCalendarPage() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [activityData, setActivityData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) return;
    loadActivity();
  }, [currentYear, currentMonth, token]);

  async function loadActivity() {
    setIsLoading(true);
    setMessage("");
    try {
      const data = await getUserActivity(token, currentYear, currentMonth);
      setActivityData(data.daily_counts || {});
    } catch (err) {
      setMessage("❌ " + err.message);
    } finally {
      setIsLoading(false);
    }
  }

  function goToPreviousMonth() {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  }

  function goToNextMonth() {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
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
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="bg-white rounded-3xl shadow-xl p-12 text-center">
          <svg className="w-16 h-16 mx-auto mb-4 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <p className="text-gray-700 text-lg mb-6">请先登录查看写作日历</p>
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

  const calendar = generateCalendar();
  const weekDays = ["日", "一", "二", "三", "四", "五", "六"];
  const today = new Date();
  const isCurrentMonth = currentYear === today.getFullYear() && currentMonth === today.getMonth() + 1;

  // 计算统计数据
  const totalAnswers = Object.values(activityData).reduce((sum, count) => sum + count, 0);
  const activeDays = Object.keys(activityData).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 py-12 px-6">
      <div className="max-w-6xl mx-auto">
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
                📅 写作日历
              </h1>
              <p className="text-emerald-600">记录你的每一次思考</p>
            </div>

            {/* 统计卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 text-center">
                <div className="text-3xl font-bold text-emerald-700 mb-2">{totalAnswers}</div>
                <div className="text-sm text-emerald-600">本月回答总数</div>
              </div>
              <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl p-6 text-center">
                <div className="text-3xl font-bold text-teal-700 mb-2">{activeDays}</div>
                <div className="text-sm text-teal-600">活跃天数</div>
              </div>
              <div className="bg-gradient-to-br from-cyan-50 to-emerald-50 rounded-2xl p-6 text-center">
                <div className="text-3xl font-bold text-cyan-700 mb-2">
                  {activeDays > 0 ? (totalAnswers / activeDays).toFixed(1) : 0}
                </div>
                <div className="text-sm text-cyan-600">日均回答数</div>
              </div>
            </div>

            {/* 错误提示 */}
            {message && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
                {message}
              </div>
            )}

            {/* 月份导航 */}
            <div className="flex items-center justify-between mb-8">
              <button 
                onClick={goToPreviousMonth} 
                className="flex items-center px-5 py-2.5 bg-emerald-100 text-emerald-700 rounded-xl hover:bg-emerald-200 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                上个月
              </button>
              
              <h2 className="text-2xl font-light text-gray-800">
                {currentYear}年 {currentMonth}月
              </h2>
              
              <button 
                onClick={goToNextMonth} 
                className="flex items-center px-5 py-2.5 bg-emerald-100 text-emerald-700 rounded-xl hover:bg-emerald-200 transition-colors"
              >
                下个月
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* 加载状态 */}
            {isLoading && (
              <div className="text-center py-12">
                <div className="inline-block w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-600">加载中...</p>
              </div>
            )}

            {/* 日历网格 */}
            {!isLoading && (
              <div className="bg-gray-50 rounded-2xl p-6">
                <div className="grid grid-cols-7 gap-3">
                  {/* 星期标题 */}
                  {weekDays.map(day => (
                    <div 
                      key={day} 
                      className="text-center font-semibold text-gray-600 py-3"
                    >
                      {day}
                    </div>
                  ))}

                  {/* 日期格子 */}
                  {calendar.map((day, index) => {
                    if (!day) {
                      return <div key={`empty-${index}`} />;
                    }

                    const dateStr = `${currentYear}-${String(currentMonth).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                    const count = activityData[dateStr] || 0;
                    const level = getActivityLevel(count);
                    const isToday = isCurrentMonth && day === today.getDate();
                    
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
                          relative p-4 rounded-xl border-2 transition-all duration-300
                          ${colors[level]}
                          ${count > 0 ? "cursor-pointer hover:scale-110 hover:shadow-lg" : ""}
                          ${isToday ? "ring-4 ring-emerald-400 ring-opacity-50" : ""}
                        `}
                      >
                        <div className={`text-center font-semibold ${textColors[level]}`}>
                          {day}
                        </div>
                        {count > 0 && (
                          <div className={`
                            absolute -top-2 -right-2 w-6 h-6 rounded-full 
                            flex items-center justify-center text-xs font-bold
                            ${level === 3 ? "bg-white text-emerald-600" : "bg-emerald-600 text-white"}
                            shadow-md
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

            {/* 图例 */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-3">活跃度图例</h3>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500">少</span>
                <div className="w-8 h-8 rounded-lg bg-white border-2 border-gray-200"></div>
                <div className="w-8 h-8 rounded-lg bg-emerald-100 border-2 border-emerald-200"></div>
                <div className="w-8 h-8 rounded-lg bg-emerald-300 border-2 border-emerald-400"></div>
                <div className="w-8 h-8 rounded-lg bg-emerald-500 border-2 border-emerald-600"></div>
                <span className="text-sm text-gray-500">多</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}