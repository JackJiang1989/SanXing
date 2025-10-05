import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getAnswersByDate } from "../../api/activity";

export default function DailyAnswersPage() {
  const { date } = useParams(); // 从 URL 获取日期
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

  // 格式化日期显示
  function formatDate(dateStr) {
    const d = new Date(dateStr);
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
  }

  // 格式化时间显示
  function formatTime(datetimeStr) {
    const d = new Date(datetimeStr);
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  }

  if (!token) {
    return (
      <div style={{ padding: "20px" }}>
        <p>请先 <Link to="/login">登录</Link></p>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      {/* 页面标题 */}
      <div style={{ marginBottom: "20px" }}>
        <Link to="/activity" style={{ textDecoration: "none", color: "#007bff" }}>
          ← 返回日历
        </Link>
      </div>

      <h1>📝 {formatDate(date)} 的回答</h1>

      {message && <p style={{ color: "red" }}>{message}</p>}

      {/* 加载状态 */}
      {isLoading && <p>加载中...</p>}

      {/* 答案列表 */}
      {!isLoading && answers.length === 0 && (
        <div style={{ 
          padding: "40px", 
          textAlign: "center", 
          backgroundColor: "#f9f9f9",
          borderRadius: "8px"
        }}>
          <p style={{ fontSize: "18px", color: "#666" }}>这一天还没有回答任何问题</p>
          <Link to="/" style={{ color: "#007bff", textDecoration: "none" }}>
            去回答问题 →
          </Link>
        </div>
      )}

      {answers.map((answer) => (
        <div
          key={answer.id}
          style={{
            border: "1px solid #ddd",
            borderRadius: "8px",
            padding: "20px",
            marginBottom: "20px",
            backgroundColor: "#fff",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
          }}
        >
          {/* 问题信息 */}
          <div style={{ marginBottom: "15px" }}>
            <Link 
              to={`/question/${answer.question_id}`}
              style={{ 
                fontSize: "20px", 
                fontWeight: "bold",
                color: "#333",
                textDecoration: "none"
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = "#007bff"}
              onMouseLeave={(e) => e.currentTarget.style.color = "#333"}
            >
              问题：{answer.question_text}
            </Link>
            {answer.tag && (
              <span style={{ 
                marginLeft: "10px",
                padding: "4px 8px",
                backgroundColor: "#e3f2fd",
                borderRadius: "4px",
                fontSize: "14px",
                color: "#1976d2"
              }}>
                {answer.tag}
              </span>
            )}
          </div>

          {/* 分割线 */}
          <hr style={{ margin: "15px 0", border: "none", borderTop: "1px solid #eee" }} />

          {/* 答案内容 */}
          <div style={{ 
            fontSize: "16px", 
            lineHeight: "1.6",
            color: "#555",
            whiteSpace: "pre-wrap"
          }}>
            {answer.content}
          </div>

          {/* 时间信息 */}
          <div style={{ 
            marginTop: "15px",
            fontSize: "14px",
            color: "#999"
          }}>
            提交时间：{formatTime(answer.created_at)}
          </div>
        </div>
      ))}

      {/* 统计信息 */}
      {answers.length > 0 && (
        <div style={{ 
          marginTop: "30px",
          padding: "15px",
          backgroundColor: "#f0f7ff",
          borderRadius: "8px",
          textAlign: "center"
        }}>
          <p style={{ margin: 0, color: "#007bff", fontSize: "16px" }}>
            🎉 这一天你完成了 <strong>{answers.length}</strong> 个回答！
          </p>
        </div>
      )}
    </div>
  );
}