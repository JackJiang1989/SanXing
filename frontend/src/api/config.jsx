/**
 * API 配置中心
 * 根据环境自动选择正确的 API 地址
 */

// 获取 API 基础 URL
// const getApiBaseUrl = () => {
//   // 开发环境：使用 Vite 代理，返回空字符串
//   if (import.meta.env.DEV) {
//     return '';
//   }
  
//   // 生产环境：使用环境变量配置的完整 URL
//   return import.meta.env.VITE_API_URL || '';
// };


// 获取 API 基础 URL
const getApiBaseUrl = () => {
  // 开发环境：使用 Vite 代理，返回空字符串
  if (import.meta.env.DEV) {
    return '';
  }
  
  // ✅ 生产环境：必须配置完整的后端 URL
  const apiUrl = import.meta.env.VITE_API_URL;
  
  if (!apiUrl) {
    console.error('❌ VITE_API_URL 未配置！请在 Render 环境变量中设置');
    // 返回默认后端地址（可选）
    return 'https://sanxing.onrender.com';
  }
  
  return apiUrl;
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

// ✅ 添加这些调试日志
console.log('=== API Configuration Debug ===');
console.log('🔧 Environment Mode:', import.meta.env.MODE);
console.log('🔧 Is Development:', import.meta.env.DEV);
console.log('🔧 Is Production:', import.meta.env.PROD);
console.log('🔗 VITE_API_URL:', import.meta.env.VITE_API_URL);
console.log('🔗 API_BASE_URL:', API_BASE_URL);
console.log('📝 Test apiUrl("/api/test"):', apiUrl('/api/test'));
console.log('================================');