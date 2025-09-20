// today's question
// previous questions


import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function HomePage() {
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    async function fetchQuestions() {
      try {
        const res = await fetch("/api/all_questions");
        const data = await res.json();
        setQuestions(data);
      } catch (err) {
        console.error("获取问题失败:", err);
      }
    }

    fetchQuestions();
  }, []);

  return (
    <div>
      <h1>问题列表</h1>
      <ul>
        {questions.map((q) => (
          <li key={q.id}>
            <Link to={`/question/${q.id}`}>{q.question_text}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
