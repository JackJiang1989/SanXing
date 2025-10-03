import { useEffect, useState } from "react";
import { getMyQuestion, shareMyQuestion } from "../../api/question";

export default function MyQuestionPage() {
  const [questions, setQuestions] = useState([]);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    async function fetchQuestions() {
      try {
        const data = await getMyQuestion(token);
        setQuestions(data);
      } catch (err) {
        setError("加载失败: " + err.message);
      }
    }
    fetchQuestions();
  }, [token]);

  async function handleShare(id) {
    try {
      await shareMyQuestion(token, id);
      setQuestions(prev =>
        prev.map(q =>
          q.id === id ? { ...q, is_public: true } : q
        )
      );
    } catch (err) {
      alert("分享失败: " + err.message);
    }
  }

  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div>
      <h2>我创建的问题</h2>
      {questions.length === 0 && <p>暂无自定义问题</p>}
      {questions.map(q => (
        <div key={q.id} style={{ border: "1px solid #ccc", padding: "1em", marginBottom: "1em" }}>
          <p><strong>问题:</strong> {q.question_text}</p>
          <p><strong>标签:</strong> {q.tag || "无"}</p>
          <p><strong>创建时间:</strong> {new Date(q.created_at).toLocaleString()}</p>
          <p><strong>状态:</strong> {q.is_public ? "已公开" : "私有"}</p>
          {!q.is_public && (
            <button onClick={() => handleShare(q.id)}>分享公开</button>
          )}
        </div>
      ))}
    </div>
  );
}
