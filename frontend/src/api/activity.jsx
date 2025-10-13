import { apiUrl } from './config';

// 获取用户某月的写作活跃度
export async function getUserActivity(token, year, month) {
  const res = await fetch(apiUrl(`/api/user/activity?year=${year}&month=${month}`), {
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("获取活跃度数据失败");
  return res.json();
}

// 获取用户某天的所有答案
export async function getAnswersByDate(token, date) {
  const res = await fetch(apiUrl(`/api/user/answers/by-date?date=${date}`), {
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("获取答案失败");
  return res.json();
}