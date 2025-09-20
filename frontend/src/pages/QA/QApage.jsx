import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getQuestion } from "../../api/getQuestion";
import { saveAnswer, getAnswers } from "../../api/answer";
import { getCurrentUser } from "../../api/user";

export function useCurrentUser() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    getCurrentUser(token)
      .then(setUser)
      .catch(err => {
        console.error(err);
        setUser(null);
      });
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
  }, [token]);



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
      const data = await getAnswers(token);
      setAnswers(data.answers);
    } catch (err) {
      setMessage("Failed to fetch answers.");
    }
  }


  return (
    <div>
    <nav style={{ padding: "10px", borderBottom: "1px solid #ccc" }}>
      {user ? <span>欢迎, {user.email}</span> : <span>请登录</span>}
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
      <ul>
        {answers.map((answer) => (
          <li key={answer.id}>
            <p>{answer.content}</p>
            <small>{new Date(answer.created_at).toLocaleString()}</small>
          </li>
        ))}
      </ul>
    </div>
    // <div style={{ padding: "20px", fontFamily: "Arial", fontSize: "18px" }}>
    //   <h1>今日哲学问题</h1>
    //   <p>{question.question_text}</p>
    //   <p>{question.tag}</p>
    //   <p>{question.inspiring_words}</p>
    //   <hr style={{ margin: "20px 0" }} />
    //   <h2>写下你的回答</h2>
    //   <form onSubmit={handleSubmit}>
    //     <textarea
    //       value={content}
    //       onChange={(e) => setAnswerContent(e.target.value)}
    //       placeholder="Write your answer here..."
    //       rows="5"
    //       style={{ width: "100%", marginBottom: "10px" }}
    //     />
    //     <button type="submit">提交回答</button>
    //   </form>
    //   {message && <p>{message}</p>}
    //   <h2>你的回答</h2>
    //   <ul>
    //     {answers.map((answer) => (
    //       <li key={answer.id}>
    //         <p>{answer.content}</p>
    //         <small>{new Date(answer.created_at).toLocaleString()}</small>
    //       </li>
    //     ))}
    //   </ul>
    // </div>
  );
}

