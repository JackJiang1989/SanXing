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