
// import { useEffect, useState } from "react";
// import axios from "axios";

// const API_BASE = "http://127.0.0.1:8000"; // 后端地址（开发环境）

// api.jsx
export async function getQuestion() {
  // return "What is the meaning of life?";
  try {
    const res = await fetch("http://localhost:8000/api/question");
    // const res = await axios.get("/api/answers");
    if (!res.ok) {
      throw new Error("获取问题失败");
    }
    const data = await res.json();
    return data.question;
  } catch (err) {
    console.error("API 调用失败:", err);
    return "加载问题出错了，请稍后再试。";
  }
}


// import { useEffect, useState } from "react";
// import axios from "axios";

// const API_BASE = "http://127.0.0.1:8000"; // 后端地址（开发环境）

// export default function App() {
//   const [list, setList] = useState([]);
//   const [question, setQuestion] = useState("");
//   const [answer, setAnswer] = useState("");
//   const [loading, setLoading] = useState(false);

//   async function fetchAnswers() {
//     // const { data } = await axios.get(`${API_BASE}/answers`);
//     const { data } = await axios.get("/api/answers");
//     setList(data);
//   }