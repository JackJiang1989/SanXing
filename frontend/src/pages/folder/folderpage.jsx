import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  createFolder, 
  getFolders, 
  deleteFolder 
} from "../../api/folder";

export default function FolderPage() {
  const [folders, setFolders] = useState([]);
  const [newFolderName, setNewFolderName] = useState("");
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");

  // 加载文件夹列表
  useEffect(() => {
    if (token) {
      loadFolders();
    }
  }, [token]);

  async function loadFolders() {
    try {
      const data = await getFolders(token);
      setFolders(data);
    } catch (err) {
      setMessage("❌ " + err.message);
    }
  }

  // 创建文件夹
  async function handleCreateFolder(e) {
    e.preventDefault();
    if (!newFolderName.trim()) {
      setMessage("❌ 文件夹名称不能为空");
      return;
    }
    try {
      await createFolder(token, newFolderName);
      setMessage("✅ 创建成功！");
      setNewFolderName("");
      loadFolders(); // 刷新列表
    } catch (err) {
      setMessage("❌ " + err.message);
    }
  }

  // 删除文件夹
  async function handleDeleteFolder(folderId) {
    if (!confirm("确定要删除这个文件夹吗？")) return;
    try {
      await deleteFolder(token, folderId);
      setMessage("✅ 删除成功！");
      loadFolders();
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

  return (
    <div style={{ padding: "20px" }}>
      <h1>我的文件夹</h1>
      
      {message && <p>{message}</p>}

      {/* 创建文件夹表单 */}
      <form onSubmit={handleCreateFolder} style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="输入文件夹名称"
          value={newFolderName}
          onChange={(e) => setNewFolderName(e.target.value)}
          style={{ padding: "8px", marginRight: "10px" }}
        />
        <button type="submit">创建文件夹</button>
      </form>

      {/* 文件夹列表 */}
      <div>
        <h2>文件夹列表</h2>
        {folders.length === 0 && <p>暂无文件夹</p>}
        {folders.map((folder) => (
          <div
            key={folder.id}
            style={{
              border: "1px solid #ccc",
              padding: "15px",
              marginBottom: "10px",
              borderRadius: "5px"
            }}
          >
            <h3>
              <Link to={`/folders/${folder.id}`}>{folder.name}</Link>
            </h3>
            <p>创建时间: {new Date(folder.created_at).toLocaleString()}</p>
            <p>包含 {folder.questions.length} 个问题</p>
            <button onClick={() => handleDeleteFolder(folder.id)}>
              删除文件夹
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}