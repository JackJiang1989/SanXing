import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getQuestion } from "../../api/question";
import { saveAnswer, getAnswers } from "../../api/answer";
import { getCurrentUser } from "../../api/user";

export function useCurrentUser() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    let cancelled = false;

    getCurrentUser(token)
      .then(data => {
        if (!cancelled) setUser(data);
      })
      .catch(err => {
        console.error(err);
        if (!cancelled) setUser(null);
      });

    return () => { cancelled = true }; // 防止卸载时 setState
  }, []);

  return user;
}

export default function QuestionPage(props) {
  const user = useCurrentUser();

  const { questionId: paramId } = useParams(); // 从 URL 获取 questionId
  const questionId = props.questionId || paramId;  // 从 props 或 URL 获取 questionId

  const [question, setQuestion] = useState(null);
  const [answerContent, setAnswerContent] = useState("");
  const [message, setMessage] = useState("");
  const [answers, setAnswers] = useState([]);

  const token = localStorage.getItem("token");

  // Fetch the daily question
  useEffect(() => {
    // console.log("test")
    async function fetchData() {
      const q = await getQuestion(questionId);
      setQuestion(q);
    }
    fetchData();
  }, [questionId]);

  // Fetch the user's answers
  useEffect(() => {
    if (token) {
      fetchAnswers();
    }
  }, [token, questionId]);



  async function handleSubmit(e) {
    e.preventDefault();
    // console.log("Submitting answer:", answerContent, questionId);
    // console.log("With token:", token);
    if (!token) {
      setMessage("You must be logged in to submit an answer.");
      return;
    }
    try {
      await saveAnswer(answerContent, token, questionId);
      setMessage("Answer saved successfully!");
      setAnswerContent("");
      // navigate(0); // Refresh the page
      fetchAnswers(); // Refresh the list of answers
    } catch (err) {
      setMessage("Failed to save answer. Please try again.");
    }
  }

  async function fetchAnswers() {
    try {
      const data = await getAnswers(token, questionId);
      setAnswers(data);
    } catch (err) {
      setMessage("Failed to fetch answers.");
    }
  }


  return (
    <div>
    <nav style={{ padding: "10px", borderBottom: "1px solid #ccc" }}>
      {user ? (
        <div>
          <p>欢迎, {user.username}</p>
          <p>Email: {user.email}</p>
          <p>注册时间: {new Date(user.created_at).toLocaleString()}</p>
        </div>
      ) : (
        <span>请登录</span>
      )}
    </nav>
      {question ? <h2>{question.question_text}</h2> : <p>加载中...</p>}
      <p>{question?.question_text}</p>
      <p>{question?.inspiring_words}</p>
      <h2>写下你的回答</h2>
      <form onSubmit={handleSubmit}>
        <textarea
          value={answerContent}
          onChange={(e) => setAnswerContent(e.target.value)}
          placeholder="Write your answer here..."
          rows="5"
          style={{ width: "100%", marginBottom: "10px" }}
        />
        <button type="submit">提交回答</button>
      </form>
      {message && <p>{message}</p>}
      <h2>你的回答</h2>

      <div>
      <h2>答案列表</h2>
      {/* {answers.length === 0 && <p>您尚未回答该问题</p>} */}
      {answers.map(a => (
        <div key={a.id} style={{ marginBottom: "1em" }}>
          <p><strong>问题：</strong> {a.question_text}</p>
          <p><strong>答案：</strong> {a.content}</p>
          <p><small>提交时间：{new Date(a.created_at).toLocaleString()}</small></p>
        </div>
      ))}
      </div>

      {/* <ul>
        {answers.map((answer) => (
          <li key={answer.id}>
            <p>{answer.content}</p>
            <small>{new Date(answer.created_at).toLocaleString()}</small>
          </li>
        ))}
      </ul> */}
    </div>

  );
}

