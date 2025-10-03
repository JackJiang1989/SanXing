// api/user.js
export async function getCurrentUser(token) {
  const res = await fetch("/api/me", {
    headers: {
      "Authorization": `Bearer ${token}` // 或自定义 Header
    }
  });
  if (!res.ok) throw new Error("获取用户信息失败");
  return res.json();
}

export async function getUserSettings(token) {
  const res = await fetch("/api/user/settings", {
    headers: {
      "Authorization": `Bearer ${token}`, // 直接写 Bearer + token
    },
  });
  if (!res.ok) throw new Error("获取用户信息失败");
  return res.json();
}

export async function updateUserSettings(token, updates) {
  const res = await fetch("/api/user/settings", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error("更新失败");
  return res.json();
}


// 更新答案
export async function updateAnswer(token, answerId, content) {
  const res = await fetch(`/api/answer/${answerId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ content })
  });
  if (!res.ok) throw new Error("更新答案失败");
  return res.json();
}