import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import Login from "./components/Login";
import Register from "./components/Register";
import Logo from "./components/Logo";
import { getProfile, logout } from "./services/authService";
import Dashboard from "./components/Dashboard";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Verify token and fetch profile on initial load
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await getProfile();
        setUser(currentUser);
      } catch (err) {
        setUser(null);
        logout(); // Clear invalid/expired token from localStorage
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleAuthSuccess = (userData) => {
    setUser(userData);
    navigate("/dashboard");
  };

  const handleLogout = () => {
    logout();
    setUser(null);
    navigate("/login");
  };

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
    <Routes>
      {/* Protected Dashboard Route */}
      <Route
        path="/dashboard"
        element={
          user ? (
            <Dashboard user={user} onLogout={handleLogout} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* Public Login Route */}
      <Route
        path="/login"
        element={
          !user ? (
            <Login
              onSuccess={handleAuthSuccess}
              switchToRegister={() => navigate("/register")}
            />
          ) : (
            <Navigate to="/dashboard" replace />
          )
        }
      />

      {/* Public Register Route */}
      <Route
        path="/register"
        element={
          !user ? (
            <Register
              onSuccess={handleAuthSuccess}
              switchToLogin={() => navigate("/login")}
            />
          ) : (
            <Navigate to="/dashboard" replace />
          )
        }
      />

      {/* Catch-all fallback */}
      <Route
        path="*"
        element={<Navigate to={user ? "/dashboard" : "/login"} replace />}
      />
    </Routes>
  );
}

export default App;
