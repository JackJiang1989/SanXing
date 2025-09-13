import { BrowserRouter, Routes, Route } from "react-router-dom";
import QA from "./pages/QA";
import Login from "./pages/auth/login";
import Signup from "./pages/auth/signup";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<QA />} />   {/* 主页 */}
        <Route path="/login" element={<Login />} />  {/* 登录页 */}
        <Route path="/signup" element={<Signup />} /> {/* 注册页 */}
      </Routes>
    </BrowserRouter>
  );
}

