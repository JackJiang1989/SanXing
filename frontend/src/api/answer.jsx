export async function saveAnswer(content, token) {
  const res = await fetch("http://localhost:8000/answer", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ content }),
  });
  if (!res.ok) {
    throw new Error("Failed to save answer");
  }
  return res.json();
}

export async function getAnswers(token) {
  const res = await fetch("http://localhost:8000/answers", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    throw new Error("Failed to fetch answers");
  }
  return res.json();
}