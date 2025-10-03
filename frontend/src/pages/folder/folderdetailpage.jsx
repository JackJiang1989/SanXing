import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { 
  getFolders, 
  renameFolder, 
  addQuestionToFolder, 
  removeQuestionFromFolder 
} from "../../api/folder";

export default function FolderDetailPage() {
  const { folderId } = useParams();
  const [folder, setFolder] = useState(null);
  const [newName, setNewName] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState("");
  const [allQuestions, setAllQuestions] = useState([]);
  const [selectedQuestionId, setSelectedQuestionId] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (token) {
      loadFolder();
      loadAllQuestions();
    }
  }, [token, folderId]);

  async function loadFolder() {
    try {
      const data = await getFolders(token);
      const currentFolder = data.find(f => f.id === folderId);
      if (currentFolder) {
        setFolder(currentFolder);
        setNewName(currentFolder.name);
      } else {
        setMessage("❌ 文件夹不存在");
      }
    } catch (err) {
      setMessage("❌ " + err.message);
    }
  }

  async function loadAllQuestions() {
    try {
      const res = await fetch("/api/all_questions");
      const data = await res.json();
      setAllQuestions(data);
    } catch (err) {
      console.error("获取问题失败:", err);
    }
  }

  async function handleRename(e) {
    e.preventDefault();
    if (!newName.trim()) {
      setMessage("❌ 文件夹名称不能为空");
      return;
    }
    try {
      await renameFolder(token, folderId, newName);
      setMessage("✅ 重命名成功！");
      setIsEditing(false);
      loadFolder();
    } catch (err) {
      setMessage("❌ " + err.message);
    }
  }

  async function handleAddQuestion() {
    if (!selectedQuestionId) {
      setMessage("❌ 请选择一个问题");
      return;
    }
    try {
      await addQuestionToFolder(token, folderId, selectedQuestionId);
      setMessage("✅ 添加成功！");
      setSelectedQuestionId("");
      loadFolder();
    } catch (err) {
      setMessage("❌ " + err.message);
    }
  }

  async function handleRemoveQuestion(questionId) {
    if (!confirm("确定要移除这个问题吗？")) return;
    try {
      await removeQuestionFromFolder(token, folderId, questionId);
      setMessage("✅ 移除成功！");
      loadFolder();
    } catch (err) {
      setMessage("❌ " + err.message);
    }
  }

  if (!token) {
    return (
      <div style={{ padding: "20px" }}>
        <p>请先 <Link to="/login">登录</Link></p>
      </div>
    );
  }

  if (!folder) {
    return <div style={{ padding: "20px" }}>加载中...</div>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <Link to="/folders">← 返回文件夹列表</Link>
      
      {message && <p>{message}</p>}

      {/* 文件夹名称 */}
      <div style={{ marginTop: "20px" }}>
        {isEditing ? (
          <form onSubmit={handleRename}>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              style={{ padding: "8px", marginRight: "10px" }}
            />
            <button type="submit">保存</button>
            <button type="button" onClick={() => setIsEditing(false)}>
              取消
            </button>
          </form>
        ) : (
          <div>
            <h1>{folder.name}</h1>
            <button onClick={() => setIsEditing(true)}>重命名</button>
          </div>
        )}
      </div>

      <p>创建时间: {new Date(folder.created_at).toLocaleString()}</p>

      {/* 添加问题 */}
      <div style={{ marginTop: "30px", marginBottom: "30px" }}>
        <h2>添加问题到文件夹</h2>
        <select
          value={selectedQuestionId}
          onChange={(e) => setSelectedQuestionId(e.target.value)}
          style={{ padding: "8px", marginRight: "10px" }}
        >
          <option value="">-- 选择一个问题 --</option>
          {allQuestions.map((q) => (
            <option key={q.id} value={q.id}>
              {q.question_text}
            </option>
          ))}
        </select>
        <button onClick={handleAddQuestion}>添加</button>
      </div>

      {/* 文件夹中的问题列表 */}
      <div>
        <h2>文件夹中的问题 ({folder.questions.length})</h2>
        {folder.questions.length === 0 && <p>暂无问题</p>}
        {folder.questions.map((q) => (
          <div
            key={q.id}
            style={{
              border: "1px solid #ccc",
              padding: "10px",
              marginBottom: "10px",
              borderRadius: "5px"
            }}
          >
            <h3>
              <Link to={`/question/${q.id}`}>{q.question_text}</Link>
            </h3>
            {q.tag && <p><strong>标签:</strong> {q.tag}</p>}
            {q.inspiring_words && <p><em>{q.inspiring_words}</em></p>}
            <button onClick={() => handleRemoveQuestion(q.id)}>
              从文件夹移除
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}