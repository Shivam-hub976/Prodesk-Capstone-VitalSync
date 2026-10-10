import React, { useState, useEffect } from "react";
import { Loader2 } from "lucide-react"; // Proper animated spinner
import Login from "./components/Login";
import Register from "./components/Register";
import Logo from "./components/Logo";
import { getProfile, logout } from "./services/authService";

function App() {
  const [user, setUser] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await getProfile();
        setUser(currentUser);
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = () => {
    logout();
    setUser(null);
  };

  // Modern Loading Screen with Spinner
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400">
        <Loader2 className="w-12 h-12 animate-spin text-[#0284c7] mb-4" />
        <p className="text-sm font-medium tracking-wide animate-pulse">
          Connecting to VitalSync Clinical Engine...
        </p>
      </div>
    );
  }

  return (
    <div>
      {user ? (
        <div className="min-h-screen bg-slate-100 dark:bg-slate-900 p-8 flex flex-col items-center justify-center">
          <div className="max-w-md w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-8 shadow-xl text-center transition-all">
            <div className="flex justify-center mb-6">
              <div className="bg-[#0284c7]/10 p-4 rounded-full">
                <Logo className="w-16 h-16" />
              </div>
            </div>

            <div className="inline-block px-4 py-1 bg-[#0284c7]/10 text-[#0284c7] dark:text-sky-400 font-bold text-xs rounded-full uppercase tracking-wider mb-4 border border-[#0284c7]/20">
              Role: {user.role}
            </div>

            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Welcome, {user.name}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-8">
              {user.email}
            </p>

            {/* Clean Dashboard UI Replacing the Confidential JSON Block */}
            <div className="grid grid-cols-2 gap-4 mb-8 text-left">
              <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                <p className="text-xs text-slate-400 uppercase font-semibold mb-1">
                  Status
                </p>
                <div className="flex items-center text-emerald-600 dark:text-emerald-400 font-bold">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div>
                  Active
                </div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                <p className="text-xs text-slate-400 uppercase font-semibold mb-1">
                  Access Level
                </p>
                <p className="text-[#0284c7] dark:text-sky-400 font-bold capitalize">
                  {user.role} Portal
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-bold px-6 py-3 rounded-lg transition-all shadow-md cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </div>
      ) : isRegistering ? (
        <Register
          onSuccess={(u) => setUser(u)}
          switchToLogin={() => setIsRegistering(false)}
        />
      ) : (
        <Login
          onSuccess={(u) => setUser(u)}
          switchToRegister={() => setIsRegistering(true)}
        />
      )}
    </div>
  );
}

export default App;
