import { useState } from "react";
import { createMyQuestion } from "../../api/question";

export default function CreateMyQuestionPage() {
  const [questionText, setQuestionText] = useState("");
  const [tag, setTag] = useState("");
  const [inspiringWords, setInspiringWords] = useState("");
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await createMyQuestion(token, {
        question_text: questionText,
        tag,
        inspiring_words: inspiringWords
      });
      setMessage("✅ 创建成功！");
      setQuestionText("");
      setTag("");
      setInspiringWords("");
    } catch (err) {
      setMessage("❌ 创建失败: " + err.message);
    }
  }

  return (
    <div>
      <h2>创建自定义问题</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <input
            placeholder="问题内容"
            value={questionText}
            onChange={e => setQuestionText(e.target.value)}
            required
          />
        </div>
        <div>
          <input
            placeholder="标签(可选)"
            value={tag}
            onChange={e => setTag(e.target.value)}
          />
        </div>
        <div>
          <textarea
            placeholder="鼓励话语(可选)"
            value={inspiringWords}
            onChange={e => setInspiringWords(e.target.value)}
          />
        </div>
        <button type="submit">提交</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}
