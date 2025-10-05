import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getUserActivity } from "../../api/activity";

export default function ActivityCalendarPage() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [activityData, setActivityData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  // 加载活跃度数据
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

  // 切换月份
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

  // 生成日历数据
  function generateCalendar() {
    const firstDay = new Date(currentYear, currentMonth - 1, 1).getDay(); // 0=周日
    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
    const calendar = [];

    // 填充空白
    for (let i = 0; i < firstDay; i++) {
      calendar.push(null);
    }

    // 填充日期
    for (let day = 1; day <= daysInMonth; day++) {
      calendar.push(day);
    }

    return calendar;
  }

  // 获取活跃度等级（用于设置颜色）
  function getActivityLevel(count) {
    if (!count) return 0;
    if (count <= 2) return 1;
    if (count <= 5) return 2;
    return 3;
  }

  // 点击日期
  function handleDateClick(day) {
    if (!day) return;
    const dateStr = `${currentYear}-${String(currentMonth).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    if (activityData[dateStr]) {
      navigate(`/activity/${dateStr}`);
    }
  }

  if (!token) {
    return (
      <div style={{ padding: "20px" }}>
        <p>请先 <Link to="/login">登录</Link></p>
      </div>
    );
  }

  const calendar = generateCalendar();
  const weekDays = ["日", "一", "二", "三", "四", "五", "六"];
  const today = new Date();
  const isCurrentMonth = currentYear === today.getFullYear() && currentMonth === today.getMonth() + 1;

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <h1>📅 写作日历</h1>
      
      {message && <p style={{ color: "red" }}>{message}</p>}

      {/* 月份导航 */}
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center",
        marginBottom: "20px" 
      }}>
        <button onClick={goToPreviousMonth} style={{ padding: "8px 16px" }}>
          ← 上个月
        </button>
        <h2>{currentYear}年 {currentMonth}月</h2>
        <button onClick={goToNextMonth} style={{ padding: "8px 16px" }}>
          下个月 →
        </button>
      </div>

      {/* 加载状态 */}
      {isLoading && <p>加载中...</p>}

      {/* 日历网格 */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(7, 1fr)", 
        gap: "8px",
        marginBottom: "20px"
      }}>
        {/* 星期标题 */}
        {weekDays.map(day => (
          <div key={day} style={{ 
            textAlign: "center", 
            fontWeight: "bold",
            padding: "8px"
          }}>
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
          
          // 颜色映射
          const colors = ["#f0f0f0", "#c6e48b", "#7bc96f", "#239a3b"];
          const bgColor = colors[level];

          return (
            <div
              key={day}
              onClick={() => handleDateClick(day)}
              style={{
                padding: "12px",
                textAlign: "center",
                backgroundColor: bgColor,
                border: isToday ? "2px solid #007bff" : "1px solid #ddd",
                borderRadius: "5px",
                cursor: count > 0 ? "pointer" : "default",
                position: "relative",
                transition: "transform 0.2s"
              }}
              onMouseEnter={(e) => {
                if (count > 0) e.currentTarget.style.transform = "scale(1.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              <div style={{ fontSize: "16px", fontWeight: "bold" }}>{day}</div>
              {count > 0 && (
                <div style={{ 
                  fontSize: "12px", 
                  color: "#fff", 
                  backgroundColor: "rgba(0,0,0,0.6)",
                  borderRadius: "50%",
                  width: "20px",
                  height: "20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "absolute",
                  top: "2px",
                  right: "2px"
                }}>
                  {count}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 图例 */}
      <div style={{ marginTop: "30px" }}>
        <h3>活跃度图例</h3>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <span>少</span>
          <div style={{ width: "20px", height: "20px", backgroundColor: "#f0f0f0", border: "1px solid #ddd" }} />
          <div style={{ width: "20px", height: "20px", backgroundColor: "#c6e48b" }} />
          <div style={{ width: "20px", height: "20px", backgroundColor: "#7bc96f" }} />
          <div style={{ width: "20px", height: "20px", backgroundColor: "#239a3b" }} />
          <span>多</span>
        </div>
      </div>

      {/* 导航链接 */}
      <div style={{ marginTop: "30px" }}>
        <Link to="/">← 返回首页</Link>
      </div>
    </div>
  );
}