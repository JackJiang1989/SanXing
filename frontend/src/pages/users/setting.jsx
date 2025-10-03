import { useEffect, useState } from "react";
import { getUserSettings, updateUserSettings, updateAnswer } from "../../api/user";

export default function UserSettingsPage() {
  const token = localStorage.getItem("token");
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ email: "", username: "", password: "" });
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) return;
    getUserSettings(token).then(data => {
      setUser(data);
      setForm({ email: data.email, username: data.username, password: "" });
    }).catch(e => setMessage(e.message));
  }, [token]);

  const handleUpdateUser = async () => {
    try {
      await updateUserSettings(token, form);
      setMessage("用户信息更新成功");
    } catch (err) {
      setMessage(err.message);
    }
  };

  const handleUpdateAnswer = async (answerId, newContent) => {
    try {
      await updateAnswer(token, answerId, newContent);
      setMessage("答案更新成功");
      // 重新刷新用户信息
      const data = await getUserSettings(token);
      setUser(data);
    } catch (err) {
      setMessage(err.message);
    }
  };

  if (!user) return <p>Loading...</p>;

  return (
    <div>
      <h2>用户设置</h2>
      {message && <p style={{color:"green"}}>{message}</p>}
      <div>
        <label>Email: </label>
        <input
          value={form.email}
          onChange={e => setForm({ ...form, email: e.target.value })}
        />
      </div>
      <div>
        <label>用户名: </label>
        <input
          value={form.username}
          onChange={e => setForm({ ...form, username: e.target.value })}
        />
      </div>
      <div>
        <label>密码: </label>
        <input
          type="password"
          value={form.password}
          onChange={e => setForm({ ...form, password: e.target.value })}
        />
      </div>
      <button onClick={handleUpdateUser}>更新用户信息</button>

      <h3>我的答案</h3>
      {user.answers.map(a => (
        <AnswerItem
          key={a.id}
          answer={a}
          onSave={newContent => handleUpdateAnswer(a.id, newContent)}
        />
      ))}
    </div>
  );
}

// 单个答案可编辑组件
function AnswerItem({ answer, onSave }) {
  const [editContent, setEditContent] = useState(answer.content);
  return (
    <div style={{ border: "1px solid #ccc", marginBottom: "1em", padding: "1em" }}>
      <p><strong>问题：</strong>{answer.question_text}</p>
      <textarea
        value={editContent}
        onChange={e => setEditContent(e.target.value)}
        rows={3}
        style={{ width: "100%" }}
      />
      <button onClick={() => onSave(editContent)}>保存修改</button>
    </div>
  );
}
