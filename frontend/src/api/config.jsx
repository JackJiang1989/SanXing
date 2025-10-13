/**
 * API 配置中心
 * 根据环境自动选择正确的 API 地址
 */

// 获取 API 基础 URL
const getApiBaseUrl = () => {
  // 开发环境：使用 Vite 代理，返回空字符串
  if (import.meta.env.DEV) {
    return '';
  }
  
  // 生产环境：使用环境变量配置的完整 URL
  return import.meta.env.VITE_API_URL || '';
};

export const API_BASE_URL = getApiBaseUrl();

/**
 * 构造完整的 API URL
 * @param {string} path - API 路径，如 '/api/auth/login'
 * @returns {string} 完整的 URL
 */
export const apiUrl = (path) => {
  // 开发环境：直接返回路径，由 Vite 代理处理
  if (import.meta.env.DEV) {
    return path;
  }
  
  // 生产环境：拼接完整 URL
  return `${API_BASE_URL}${path}`;
};

// 调试信息（仅开发环境）
if (import.meta.env.DEV) {
  console.log('🔧 Development Mode');
  console.log('API Base URL:', API_BASE_URL);
}