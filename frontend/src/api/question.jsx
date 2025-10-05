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


export async function getQuestion(questionId) {
  // return "What is the meaning of life?";
  try {
    const res = await fetch(`/api/question/${questionId}`);

    if (!res.ok) {
      throw new Error("获取问题失败");
    }
    const data = await res.json();
    return data
  } catch (err) {
    console.error("API 调用失败:", err);
    return "加载问题出错了，请稍后再试。";
  }
}
