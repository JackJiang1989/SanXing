import { apiUrl } from './config';

// 创建文件夹
export async function createFolder(token, name) {
  const res = await fetch(apiUrl("/api/folders"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) throw new Error("创建文件夹失败");
  return res.json();
}

// 获取文件夹列表
export async function getFolders(token) {
  const res = await fetch(apiUrl("/api/folders"), {
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("获取文件夹失败");
  return res.json();
}

// 重命名文件夹
export async function renameFolder(token, folderId, newName) {
  const res = await fetch(apiUrl(`/api/folders/${folderId}`), {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({ name: newName }),
  });
  if (!res.ok) throw new Error("重命名文件夹失败");
  return res.json();
}

// 删除文件夹
export async function deleteFolder(token, folderId) {
  const res = await fetch(apiUrl(`/api/folders/${folderId}`), {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("删除文件夹失败");
  return res.json();
}

// 添加问题到文件夹
export async function addQuestionToFolder(token, folderId, questionId) {
  const res = await fetch(`/api/folders/${folderId}/questions?question_id=${questionId}`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("添加问题失败");
  return res.json();
}

// 从文件夹移除问题
export async function removeQuestionFromFolder(token, folderId, questionId) {
  const res = await fetch(`/api/folders/${folderId}/questions/${questionId}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("移除问题失败");
  return res.json();
}