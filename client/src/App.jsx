import React, { useContext } from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import EmailVerify from "./pages/EmailVerify.jsx";
import Login from "./pages/Login.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AddChild from "./pages/AddChild.jsx";
import MyChildren from "./pages/MyChildren.jsx";
import ChildHome from "./pages/ChildHome.jsx";
import ChildChatBot from "./pages/ChildChatBot.jsx";
import Articles from "./pages/Articles";
import ArticlePage from "./pages/ArticlePage";
import TestStart from "./pages/TestStart";
import TestQuestions from "./pages/TestQuestions";
import TestResult from "./pages/TestResult";
import ExercisesPage from "./pages/ExercisesPage";
import ExerciseDetail from "./pages/ExerciseDetail";
import ChildOverview from "./pages/ChildOverview.jsx";
import LuscherTest from "./pages/LuscherTest";
import Fairytales from "./pages/Fairytales.jsx"; // Імпорт казок

import Footer from "./components/Footer";
import { AppContext } from "./context/AppContext.jsx";

const App = () => {
  const { userData } = useContext(AppContext);
  const currentUserId = userData?._id || null;

  return (
    <div className="flex flex-col min-h-screen">
      <ToastContainer />

      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/email-verify" element={<EmailVerify />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/add-child" element={<AddChild />} />
          <Route path="/my-children" element={<MyChildren />} />
          <Route path="/child/:id" element={<ChildOverview />} />
          <Route path="/child-home/:childId" element={<ChildHome />} />
          <Route path="/child-chatbot/:childId" element={<ChildChatBot />} />
          <Route path="/articles" element={<Articles />} />
          <Route path="/articles/:id" element={<ArticlePage />} />
          <Route path="/test/start" element={<TestStart />} />
          <Route path="/test/questions" element={<TestQuestions />} />
          <Route path="/test/result" element={<TestResult />} />
          <Route path="/exercises" element={<ExercisesPage />} />
          <Route path="/exercises/:id" element={<ExerciseDetail />} />
          <Route
            path="/luscher-test"
            element={<LuscherTest userId={currentUserId} />}
          />
          {/* ТЕПЕР МАРШРУТ ВСЕРЕДИНІ ROUTES */}
          <Route path="/fairytales/:childId" element={<Fairytales />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
};

export default App;
