export async function saveAnswer(content, token, question_id) {
  const res = await fetch("/api/answer", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ content, question_id }),
  });
  if (!res.ok) {
    throw new Error("Failed to save answer");
  }
  return res.json();
}

export async function getAnswers(token) {
  const res = await fetch("/api/answer", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    throw new Error("Failed to fetch answers");
  }
  return res.json();
}