import { BrowserRouter, Routes, Route } from "react-router-dom";
import Homepage from "./pages/home/homepage";
import QuestionPage from "./pages/QA/QApage";
import Login from "./pages/auth/login";
import Signup from "./pages/auth/signup";
import Setting from "./pages/users/setting";
import MyQuestionPage from "./pages/question/MyQuestionPage";
import CreateQuestionPage from "./pages/question/CreateQuestionPage";
import Test from "./pages/about/test";
import FolderPage from "./pages/folder/folderpage";
import FolderDetailPage from "./pages/folder/folderdetailpage";
import ActivityCalendarPage from "./pages/activity/ActivityCalendarPage"; // ✅ 新增
import DailyAnswersPage from "./pages/activity/DailyAnswersPage"; // ✅ 新增

import DailyQuestionsCard from "./components/DailyQuestionsCard";
import WriteAnswer from "./components/WriteAnswer";

import Calendar from "./components/Calendar";
import CalendarActivity from "./components/CalendarActivity";

import Folders from "./components/Folders";
import FolderCreate from "./components/FolderCreate";
import FolderDetails from "./components/FolderDetails";

import HomePage from "./pages/home/HomePageNew";
import Dashboard from "./pages/home/Dashboard";


export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* <Route path="/" element={<Homepage />} /> */}
        {/* <Route path="/" element={<HomePage />} /> */}
        <Route path="/" element={<Dashboard />} />

        {/* 动态 questionId 从url中获取 useparams*/}
        {/* <Route path="/question/:questionId" element={<QuestionPage />} /> */}
        <Route path="/question/:questionId" element={<WriteAnswer />} />     

        {/* 可选主页固定问题 从element中获取 props*/}
        <Route path="/question/" element={<QuestionPage questionId="597dcd41-7450-47e7-a939-2eae4a9857aa" />} />

        <Route path="/login" element={<Login />} />  {/* 登录页 */}
        <Route path="/signup" element={<Signup />} /> {/* 注册页 */}
        <Route path="/setting" element={<Setting />} />
        <Route path="/myquestion" element={<MyQuestionPage />} />
        <Route path="/createquestion" element={<CreateQuestionPage />} />
        <Route path="/test" element={<Test />} />

        {/* 文件夹相关路由 */}
        {/* <Route path="/folders" element={<FolderPage />} />  */}
        {/* <Route path="/folders/:folderId" element={<FolderDetailPage />} />  */}
        
        <Route path="/folders" element={<Folders />} /> 
        <Route path="/folders/:folderId" element={<FolderDetails />} /> 
        <Route path="/folders/create" element={<FolderCreate />} />        


        {/* ✅ 新增路由 */}
        {/* <Route path="/activity" element={<ActivityCalendarPage />} /> */}
        {/* <Route path="/activity/:date" element={<DailyAnswersPage />} /> */}
        <Route path="/activity" element={<Calendar />} />
        <Route path="/activity/:date" element={<CalendarActivity />} />


        {/* ✅ 3个问题卡片 */}
        <Route path="/dailyquestions" element={<DailyQuestionsCard />} />

      </Routes>
    </BrowserRouter>
  );
}

