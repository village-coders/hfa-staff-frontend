import React, { useState } from "react";
import { Navigate } from "react-router-dom";
import { Lock, XCircle } from "lucide-react";
import { API_BASE_URL } from "../constants/theme";
import { useApp } from "../context/AppContext";
import logo from "../logo.jpg";

export default function LoginPage() {
  const { loggedInUser, handleLogin } = useApp();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Already logged in → redirect
  if (loggedInUser) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        const data = await res.json();
        const userObj = data.user || data.data?.user || {};
        const mappedUser = {
          name: userObj.fullName || userObj.name || data.data?.name || username,
          role: userObj.role || data.data?.role || "user",
          username: userObj.username || username,
          token: data.accessToken || data.token || data.data?.token || data.data?.accessToken,
          id: userObj.id || userObj._id || data.data?.id || data.data?._id,
        };
        handleLogin(mappedUser);
      } else {
        const errData = await res.json().catch(() => ({}));
        setError(errData.message || "Invalid username or password. Please try again.");
      }
    } catch {
      setError("Unable to connect to the backend server, please try again in a few seconds.");
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-[#F8FAFC] via-[#F1F5F9] to-[#E2E8F0]">
      <div className="relative w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row animate-scale-in border border-slate-200 bg-white my-auto">

        {/* Left Banner */}
        <div className="relative w-full md:w-1/2 p-6 sm:p-8 lg:p-12 flex flex-col justify-between overflow-hidden bg-gradient-to-br from-[#007A87] via-[#054D66] to-[#031B38] text-white text-center md:text-left">
          <div className="absolute top-0 left-0 w-48 h-48 opacity-20 pointer-events-none">
            <svg width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
              <pattern id="dotPattern" x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1.5" fill="#FFFFFF" />
              </pattern>
              <rect width="100%" height="100%" fill="url(#dotPattern)" />
            </svg>
          </div>

          <div className="relative z-10 flex flex-col items-center md:items-start">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-2">IFRS</h1>
            <p className="text-sm sm:text-base font-semibold text-teal-100">Internal Financial Record System</p>
            <div className="w-12 h-0.5 bg-teal-300/50 my-3 sm:my-4 rounded-full" />
            <p className="text-xs text-teal-50/90 leading-relaxed max-w-xs sm:max-w-sm font-normal">
              Secure access to manage and monitor Internal Financial Record System operations and analytics.
            </p>
          </div>

          <div className="relative z-10 mt-6 sm:mt-8 md:mt-12 pt-4 md:pt-8 flex justify-center items-end hidden sm:flex">
            <svg className="w-full h-32 md:h-44 text-white/30" viewBox="0 0 400 160" fill="currentColor">
              <line x1="0" y1="150" x2="400" y2="150" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
              <g transform="translate(140, 10)">
                <path d="M 50 140 L 50 10 C 50 10 90 40 100 140 Z" fill="none" stroke="currentColor" strokeWidth="2" />
                <line x1="50" y1="0" x2="50" y2="140" stroke="currentColor" strokeWidth="2" />
                <line x1="30" y1="140" x2="110" y2="140" stroke="currentColor" strokeWidth="3" />
                <circle cx="50" cy="25" r="4" fill="currentColor" />
              </g>
              <rect x="20" y="100" width="15" height="40" fill="none" stroke="currentColor" strokeWidth="1" />
              <rect x="40" y="80" width="20" height="60" fill="none" stroke="currentColor" strokeWidth="1" />
              <rect x="260" y="90" width="18" height="50" fill="none" stroke="currentColor" strokeWidth="1" />
              <rect x="285" y="70" width="25" height="70" fill="none" stroke="currentColor" strokeWidth="1" />
            </svg>
          </div>
        </div>

        {/* Right Form */}
        <div className="w-full md:w-1/2 p-6 sm:p-8 lg:p-12 bg-[#02132B] text-white flex flex-col justify-between items-center text-center">
          <div className="w-full max-w-sm flex flex-col items-center my-auto">
            <div className="mb-4 sm:mb-6 flex items-center justify-center">
              <div className="p-1 bg-[#F8FAFC] rounded-full shadow-xl shadow-black/30 border border-white/20 flex items-center justify-center transform hover:scale-105 transition-transform duration-300">
                <img src={logo} alt="Logo" className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 object-contain rounded-full" />
              </div>
            </div>

            <p className="text-white/90 text-xs font-medium mb-4 sm:mb-6">Enter Details to Login</p>

            <form onSubmit={handleSubmit} className="w-full space-y-4">
              <div className="relative flex items-center bg-white rounded-xl overflow-hidden shadow-inner">
                <div className="px-3.5 py-3 text-slate-500 bg-slate-100 border-r border-slate-200">
                  <Lock size={18} />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Your Username"
                  className="w-full px-4 py-3 text-xs text-slate-800 outline-none bg-white placeholder-slate-400 font-medium"
                />
              </div>

              <div className="relative flex items-center bg-white rounded-xl overflow-hidden shadow-inner">
                <div className="px-3.5 py-3 text-slate-500 bg-slate-100 border-r border-slate-200">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your Password"
                  className="w-full px-4 py-3 text-xs text-slate-800 outline-none bg-white placeholder-slate-400 font-medium"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2.5">
                  <XCircle size={14} className="text-rose-500 flex-shrink-0" />
                  <p className="text-xs text-rose-700 font-medium text-left">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 px-6 rounded-xl font-semibold text-xs text-white bg-gradient-to-r from-[#0D9488] to-[#0284C7] hover:from-[#0F766E] hover:to-[#0369A1] shadow-md active:scale-98 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoading ? (
                  <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /><span>Authenticating...</span></>
                ) : "Log In"}
              </button>
            </form>
          </div>

          <div className="flex items-center gap-2 mt-6 sm:mt-8">
            <span className="w-2 h-2 rounded-full bg-teal-400/50" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#0D9488] shadow-sm" />
            <span className="w-2 h-2 rounded-full bg-teal-400/50" />
          </div>
        </div>
      </div>
    </div>
  );
}
