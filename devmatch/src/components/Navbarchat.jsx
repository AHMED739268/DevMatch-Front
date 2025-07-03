// src/components/Navbarchat.jsx
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { LogOut, MessageSquare, Settings, User } from "lucide-react";
import ShadowDOM from 'react-shadow';

const Navbarchat = () => {
  const { logout, authUser } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      // Even if logout fails, navigate to login
      navigate("/login");
    }
  };

  return (
    <ShadowDOM.div mode="open">
      <link rel="stylesheet" href="/tailwind-chat-built.css" />
      <header
        className="bg-base-100 border-b border-base-300 fixed w-full top-0 z-40 
        backdrop-blur-lg bg-base-100/80"
      >
        <div className="container mx-auto px-4 h-16">
          <div className="flex items-center justify-between h-full">
            <div className="flex items-center gap-8">
              <Link 
                to="/privatechats" 
                className="flex items-center gap-2.5 hover:opacity-80 transition-all"
              >
                <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-primary" />
                </div>
                <h1 className="text-lg font-bold">Chatty</h1>
              </Link>
            </div>

            <div className="flex items-center gap-2">
              <Link
                to={"/privatechats/settings"}
                className="btn btn-sm gap-2 transition-colors"
              >
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Settings</span>
              </Link>

              {authUser && (
                <>
                  <Link 
                    to={"/privatechats/profile"} 
                    className="btn btn-sm gap-2"
                  >
                    <User className="size-5" />
                    <span className="hidden sm:inline">Profile</span>
                  </Link>

                  <Link 
                    to={"/"} 
                    className="btn btn-sm gap-2"
                  >
                    <span className="hidden sm:inline">Go to Home</span>
                  </Link>

             
                </>
              )}
            </div>
          </div>
        </div>
      </header>
    </ShadowDOM.div>
  );
};

export default Navbarchat;