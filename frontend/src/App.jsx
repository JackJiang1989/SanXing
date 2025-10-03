import { BrowserRouter, Routes, Route } from "react-router-dom";
import Homepage from "./pages/home/homepage";
import QuestionPage from "./pages/QA/QApage";
import Login from "./pages/auth/login";
import Signup from "./pages/auth/signup";
import Setting from "./pages/users/setting";
import MyQuestionPage from "./pages/question/MyQuestionPage";
import CreateQuestionPage from "./pages/question/CreateQuestionPage";
import Test from "./pages/about/test";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Homepage />} />

        {/* 动态 questionId 从url中获取 useparams*/}
        <Route path="/question/:questionId" element={<QuestionPage />} />
        
        {/* 可选主页固定问题 从element中获取 props*/}
        <Route path="/question/" element={<QuestionPage questionId="597dcd41-7450-47e7-a939-2eae4a9857aa" />} />

        <Route path="/login" element={<Login />} />  {/* 登录页 */}
        <Route path="/signup" element={<Signup />} /> {/* 注册页 */}
        <Route path="/setting" element={<Setting />} />
        <Route path="/myquestion" element={<MyQuestionPage />} />
        <Route path="/createquestion" element={<CreateQuestionPage />} />
        <Route path="/test" element={<Test />} />
      </Routes>
    </BrowserRouter>
  );
}

