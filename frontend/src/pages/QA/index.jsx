import React, { useEffect, useState } from "react";
import { getQuestion } from "../../api/getQuestion";
import { saveAnswer, getAnswers } from "../../api/answer";

export default function QuestionPage() {
  const [question, setQuestion] = useState("加载中...");
  const [content, setContent] = useState("");
  const [message, setMessage] = useState("");
  const [answers, setAnswers] = useState([]);

  const token = localStorage.getItem("token");

  // Fetch the daily question
  useEffect(() => {
    async function fetchData() {
      const q = await getQuestion();
      setQuestion(q);
    }
    fetchData();
  }, []);

  // Fetch the user's answers
  useEffect(() => {
    if (token) {
      fetchAnswers();
    }
  }, [token]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!token) {
      setMessage("You must be logged in to submit an answer.");
      return;
    }
    try {
      await saveAnswer(content, token);
      setMessage("Answer saved successfully!");
      setContent("");
      fetchAnswers(); // Refresh the list of answers
    } catch (err) {
      setMessage("Failed to save answer. Please try again.");
    }
  }

  async function fetchAnswers() {
    try {
      const data = await getAnswers(token);
      setAnswers(data.answers);
    } catch (err) {
      setMessage("Failed to fetch answers.");
    }
  }

  return (
    <div style={{ padding: "20px", fontFamily: "Arial", fontSize: "18px" }}>
      <h1>今日哲学问题</h1>
      <p>{question}</p>
      <hr style={{ margin: "20px 0" }} />
      <h2>写下你的回答</h2>
      <form onSubmit={handleSubmit}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your answer here..."
          rows="5"
          style={{ width: "100%", marginBottom: "10px" }}
        />
        <button type="submit">提交回答</button>
      </form>
      {message && <p>{message}</p>}
      <h2>你的回答</h2>
      <ul>
        {answers.map((answer) => (
          <li key={answer.id}>
            <p>{answer.content}</p>
            <small>{new Date(answer.created_at).toLocaleString()}</small>
          </li>
        ))}
      </ul>
    </div>
  );
}