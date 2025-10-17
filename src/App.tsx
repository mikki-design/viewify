import { Routes, Route } from "react-router-dom";
import { useChat } from "@/context/ChatContext";
import ForgotPassword from "@/_root/pages/ForgotPassword";
import ResetPassword from "@/_root/pages/ResetPassword";
import ResetPasswordConfirm from "@/_root/pages/ResetPasswordConfirm";


import { X } from "lucide-react";

import {
  Home,
  Explore,
  Saved,
  CreatePost,
  Profile,
  EditPost,
  PostDetails,
  UpdateProfile,
  AllUsers,
} from "@/_root/pages";
import AuthLayout from "./_auth/AuthLayout";
import RootLayout from "./_root/RootLayout";
import SignupForm from "@/_auth/forms/SignupForm";
import SigninForm from "@/_auth/forms/SigninForm";
import { Toaster } from "@/components/ui/toaster";
import ChatBox from "@/components/chat/ChatBox"; // ✅ make sure this is imported
import ChatModalWrapper from "@/_root/pages/ChatModalWrapper";

import "./globals.css";

const App = () => {
  const { showChat, setShowChat, receiverId } = useChat();
  return (
    <main className="flex h-screen">
      <Routes>
        {/* public routes */}
        <Route element={<AuthLayout />}>
          <Route path="/sign-in" element={<SigninForm />} />
          <Route path="/sign-up" element={<SignupForm />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/reset-password-confirm" element={<ResetPasswordConfirm />} />
        
        </Route>

        {/* private routes */}
        <Route element={<RootLayout />}>
          <Route index element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/saved" element={<Saved />} />
          <Route path="/all-users" element={<AllUsers />} />
          <Route path="/create-post" element={<CreatePost />} />
          <Route path="/update-post/:id" element={<EditPost />} />
          <Route path="/posts/:id" element={<PostDetails />} />
          <Route path="/profile/:id/*" element={<Profile />} />
          <Route path="/update-profile/:id" element={<UpdateProfile />} />
            
          <Route
  path="/chat"
  element={<ChatModalWrapper />} // a page/component that renders <ChatModal />
/>
        </Route>
        
      </Routes>
        {/* 🗨️ Global Chat Overlay */}
      {showChat && receiverId && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="relative w-[90%] max-w-md bg-dark-2 rounded-xl p-4 shadow-lg">
            <button
              onClick={() => setShowChat(false)}
              className="absolute top-2 right-2 text-gray-400 hover:text-white"
            >
              <X size={20} />
            </button>
            <ChatBox receiverId={receiverId} />
          </div>
        </div>
      )}

      <Toaster />
    </main>
  );
};

export default App;
