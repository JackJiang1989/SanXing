export async function createMyQuestion(token, question) {
  const res = await fetch("/api/my-questions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(question),
  });
  if (!res.ok) throw new Error("创建问题失败");
  return res.json();
}

export async function getMyQuestion(token) {
  const res = await fetch("/api/my-questions", {
    headers: { "Authorization": `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("获取问题失败");
  return res.json();
}

export async function shareMyQuestion(token, questionId) {
  const res = await fetch(`/api/questions/${questionId}/share`, {
    method: "PUT",
    headers: { "Authorization": `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("分享失败");
  return res.json();
}
