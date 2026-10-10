import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { login } from "../services/authService";
import Logo from "./Logo";

const Login = ({ onSuccess, switchToRegister }) => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const user = await login(formData);
      if (onSuccess) onSuccess(user);
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-slate-100 dark:bg-slate-900">
      {/* Left Brand Panel - Matching Figma Wireframe */}
      <div className="w-full md:w-1/2 bg-[#0284c7] flex flex-col items-center justify-center p-8 text-white min-h-[30vh] md:min-h-screen">
        <Logo className="w-24 h-24 mb-4 drop-shadow-md" />
        <h1 className="text-4xl font-extrabold tracking-tight">VitalSync</h1>
        <p className="text-sky-100 text-sm mt-2 text-center max-w-xs font-medium">
          Enterprise EHR & Clinical Operations Platform
        </p>
      </div>

      {/* Right Form Panel - Matching Figma Layout */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-12">
        <div className="max-w-md w-full bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
              Welcome Back
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              Sign in to your clinical portal
            </p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm p-3 rounded-lg mb-6 text-center font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0284c7] transition-all"
                placeholder="doctor@vitalsync.com"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full pl-4 pr-12 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0284c7] transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-1"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0284c7] hover:bg-sky-700 text-white font-bold py-3 rounded-lg shadow-md transition-all cursor-pointer mt-2 disabled:opacity-50"
            >
              {loading ? "Authenticating..." : "Log In"}
            </button>
          </form>

          <p className="text-slate-500 dark:text-slate-400 text-sm text-center mt-6">
            Need an account?{" "}
            <button
              onClick={switchToRegister}
              className="text-[#0284c7] dark:text-sky-400 font-semibold hover:underline cursor-pointer"
            >
              Register here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
