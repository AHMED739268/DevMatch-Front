import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Layouts
import PrivateChatsLayout from "./layout/PrivateChatsLayout";

// Pages - Private Chat
import ProfilePagechat from "./pages/ProfilePagechat";
import SettingsPagechat from "./pages/SettingsPagechat";
import HomePagechat from "./pages/HomePagechat";
import SignUpPagechat from "./pages/SignUpPagechat";
import LoginPagechat from "./pages/LoginPagechat";

// Pages - Public
import HomePage from "./pages/HomePage";
import ChatPage from "./pages/ChatPage";
import NotFound from "./pages/NotFound";
import Register from "./pages/Register";
import Login from "./pages/Login";
import JobsPage from "./pages/JobsPage";
import JobDetails from "./pages/JobDetails";
import Freelancers from "./pages/Freelancers";
import CompleteFreelancerProfile from "./pages/ProfileCompletionForm";
import FreelancerProfile from "./pages/FreelancerProfile";
import PostJob from "./pages/PostJob";
import RecruiterDashboard from "./pages/RecruiterDashboard";
import CompleteProfile from "./pages/CompleteProfile";
import JobApplications from "./pages/JobApplications";
import ApplicationDetails from "./pages/ApplicationDetails";
import JobApplication from "./pages/JobApplication";
import PaymentPage from "./pages/PaymentPage";
import AuthSuccess from "./pages/AuthSuccess";
import ChooseRole from "./pages/ChooseRole";
import EditJob from "./pages/EditJob";
import FollowingPage from './pages/FollowingPage';
import ApplicationsPage from './pages/ApplicationsPage';
// Stores & Contexts
import { useAuthStore } from './store/useAuthStore';
import { useThemeStore } from "./store/useThemeStore";
import { useAuth } from './pages/AuthContext';
import { AuthProvider } from "./pages/AuthContext";
import { NotificationProvider } from "./pages/NotificationContext";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { LanguageProvider } from "./components/LanguageContext";
import ProgrammerExam from "./components/ProgrammerExam";
import RequireExamPass from "./components/RequireExamPass";


function AppContent() {
  const { theme } = useThemeStore();
  const { user } = useAuth();
  const { connectSocket } = useAuthStore();
  const fetchUser = useAuthStore((state) => state.fetchUser);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    if (user) {
      connectSocket();
    }
  }, [user]);

  return (
    <NotificationProvider>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover />
      <div className="app-container" data-theme={theme}>
        <Routes>
          {/* Private Chat Routes */}
          <Route path="/privatechats" element={<PrivateChatsLayout />}>
            <Route index element={<Navigate to="home" />} />
            <Route path="home" element={<HomePagechat />} />
            <Route path="signup" element={<SignUpPagechat />} />
            <Route path="login" element={<LoginPagechat />} />
            <Route path="settings" element={<SettingsPagechat />} />
            <Route path="profile" element={<ProfilePagechat />} />
          </Route>

          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/jobs" element={<RequireExamPass><JobsPage /></RequireExamPass>} />
          <Route path="/jobs/:id" element={<RequireExamPass><JobDetails /></RequireExamPass>} />
          <Route path="/jobs/:id/apply" element={<RequireExamPass><JobApplication /></RequireExamPass>} />
          <Route path="/recruiter-dashboard" element={<RecruiterDashboard />} />
          <Route path="/post-job" element={<PostJob />} />
          <Route path="/complete-profile" element={<CompleteProfile />} />
          <Route path="/recruiter-dashboard/jobs/:jobId/applications" element={<JobApplications />} />
          <Route path="/recruiter-dashboard/applications/:id" element={<ApplicationDetails />} />
          <Route path="/freelancers" element={<Freelancers />} />
          <Route path="/completefreelancerprofile" element={<CompleteFreelancerProfile />} />
          <Route path="/freelancerprofile/:id" element={<FreelancerProfile />} />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/auth-success" element={<AuthSuccess />} />
          <Route path="/choose-role" element={<ChooseRole />} />
          <Route path="/edit-job/:id" element={<EditJob />} />
          <Route path="/following" element={<FollowingPage />} />
          <Route path="/my-applications" element={<ApplicationsPage />} />
          <Route path="/exam" element={<ProgrammerExam />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </NotificationProvider>
  );
}

function App() {
  return (
        <LanguageProvider>

    <AuthProvider>
      <AppContent />
    </AuthProvider>
        </LanguageProvider>
  );
}

export default App;
