import { API_BASE_URL, apiUrl } from "../../api/config";

export default function Test() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-6">🔧 API 配置测试</h1>
        
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded">
            <h2 className="font-semibold text-lg mb-2">环境信息</h2>
            <p><strong>MODE:</strong> {import.meta.env.MODE}</p>
            <p><strong>DEV:</strong> {String(import.meta.env.DEV)}</p>
            <p><strong>PROD:</strong> {String(import.meta.env.PROD)}</p>
          </div>

          <div className="bg-green-50 p-4 rounded">
            <h2 className="font-semibold text-lg mb-2">API 配置</h2>
            <p><strong>VITE_API_URL:</strong> {import.meta.env.VITE_API_URL || '(未设置)'}</p>
            <p><strong>API_BASE_URL:</strong> {API_BASE_URL || '(空字符串)'}</p>
          </div>

          <div className="bg-yellow-50 p-4 rounded">
            <h2 className="font-semibold text-lg mb-2">测试 URL 生成</h2>
            <p><strong>apiUrl('/api/test'):</strong> {apiUrl('/api/test')}</p>
            <p><strong>apiUrl('/api/auth/login'):</strong> {apiUrl('/api/auth/login')}</p>
          </div>

          <div className="bg-purple-50 p-4 rounded">
            <h2 className="font-semibold text-lg mb-2">所有环境变量</h2>
            <pre className="bg-gray-800 text-green-400 p-4 rounded overflow-auto text-sm">
              {JSON.stringify(import.meta.env, null, 2)}
            </pre>
          </div>

          <button
            onClick={async () => {
              try {
                const url = apiUrl('/api/daily-questions');
                console.log('🔗 Fetching:', url);
                const res = await fetch(url);
                const data = await res.json();
                console.log('✅ Response:', data);
                alert('✅ API 连接成功！查看控制台获取详情');
              } catch (err) {
                console.error('❌ Error:', err);
                alert('❌ API 连接失败: ' + err.message);
              }
            }}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            🧪 测试 API 连接
          </button>
        </div>
      </div>
    </div>
  );
}