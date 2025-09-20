
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
