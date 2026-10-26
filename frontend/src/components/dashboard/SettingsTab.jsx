import React, { useState, useEffect } from "react";
import {
  User as UserIcon,
  Phone,
  Droplet,
  Info,
  Moon,
  Sun,
  Eye,
  EyeOff,
  CheckCircle,
} from "lucide-react";
import { useThemeStore } from "../../store/themeStore";

const SettingsTab = ({ user }) => {
  const { theme, toggleTheme, initializeTheme } = useThemeStore();
  const [showPassword, setShowPassword] = useState(false);

  // to prevent multiple API calls and show success message
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  useEffect(() => {
    initializeTheme();
  }, [initializeTheme]);

  // Form state for settings
  const [settingsForm, setSettingsForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    age: user?.age || "",
    bloodGroup: user?.bloodGroup || "Unknown",
    about: user?.about || "",
    password: "",
  });

  const handleSettingsUpdate = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    setUpdateSuccess(false);

    try {
      const token = localStorage.getItem("token");
      let baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
      if (baseUrl.endsWith("/auth")) baseUrl = baseUrl.replace("/auth", "");

      const payload = { ...settingsForm };
      if (!payload.password) delete payload.password; // if password is empty, don't send it to the server

      const res = await fetch(`${baseUrl}/auth/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        // update localStorage with new user data
        localStorage.setItem("user", JSON.stringify(data));

        // update the form state with the new user data
        setSettingsForm({
          name: data.name,
          email: data.email,
          phone: data.phone || "",
          age: data.age || "",
          bloodGroup: data.bloodGroup || "Unknown",
          about: data.about || "",
          password: "", // reset password field after successful update
        });

        // show success message for 3 seconds
        setUpdateSuccess(true);
        setTimeout(() => setUpdateSuccess(false), 3000); // hide success message after 3 seconds
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to update profile. Please check your connection.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 md:p-10 max-w-3xl relative overflow-hidden">
      {/* SUCCESS NOTIFICATION TOAST */}
      <div
        className={`absolute top-0 left-0 right-0 bg-green-500 text-white px-4 py-3 flex items-center justify-center gap-2 font-bold transition-transform duration-300 ${updateSuccess ? "translate-y-0" : "-translate-y-full"}`}
      >
        <CheckCircle size={20} /> Profile Updated Successfully!
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 mt-2">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          Profile & Preferences
        </h2>
        <button
          onClick={toggleTheme}
          type="button"
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-white rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors font-bold shadow-sm border border-slate-200 dark:border-slate-600 cursor-pointer"
        >
          {theme === "dark" ? (
            <Sun size={18} className="text-yellow-400" />
          ) : (
            <Moon size={18} className="text-slate-600" />
          )}
          {theme === "dark" ? "Light Mode" : "Dark Mode"}
        </button>
      </div>

      <form onSubmit={handleSettingsUpdate} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
              <UserIcon size={16} /> Full Name
            </label>
            <input
              type="text"
              value={settingsForm.name}
              onChange={(e) =>
                setSettingsForm({ ...settingsForm, name: e.target.value })
              }
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-sky-500 bg-slate-50 dark:bg-slate-900 dark:border-slate-700 dark:text-white outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
              <Info size={16} /> Email Address
            </label>
            <input
              type="email"
              value={settingsForm.email}
              onChange={(e) =>
                setSettingsForm({ ...settingsForm, email: e.target.value })
              }
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-sky-500 bg-slate-50 dark:bg-slate-900 dark:border-slate-700 dark:text-white outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
              <Phone size={16} /> Phone Number
            </label>
            <input
              type="text"
              value={settingsForm.phone}
              onChange={(e) =>
                setSettingsForm({ ...settingsForm, phone: e.target.value })
              }
              placeholder="+1 234 567 8900"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-sky-500 bg-slate-50 dark:bg-slate-900 dark:border-slate-700 dark:text-white outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
              <Droplet size={16} className="text-red-500" /> Blood Group
            </label>
            <select
              value={settingsForm.bloodGroup}
              onChange={(e) =>
                setSettingsForm({ ...settingsForm, bloodGroup: e.target.value })
              }
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-sky-500 bg-slate-50 dark:bg-slate-900 dark:border-slate-700 dark:text-white cursor-pointer outline-none"
            >
              <option value="Unknown">Unknown</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
              Age
            </label>
            <input
              type="number"
              min="0"
              max="150"
              value={settingsForm.age}
              onChange={(e) =>
                setSettingsForm({ ...settingsForm, age: e.target.value })
              }
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-sky-500 bg-slate-50 dark:bg-slate-900 dark:border-slate-700 dark:text-white outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
              Update Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={settingsForm.password}
                onChange={(e) =>
                  setSettingsForm({ ...settingsForm, password: e.target.value })
                }
                placeholder="Leave blank to keep current"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-sky-500 bg-slate-50 dark:bg-slate-900 dark:border-slate-700 dark:text-white outline-none pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-sky-600 cursor-pointer"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
            Medical Notes / About
          </label>
          <textarea
            rows="3"
            value={settingsForm.about}
            onChange={(e) =>
              setSettingsForm({ ...settingsForm, about: e.target.value })
            }
            placeholder="Any known allergies or existing conditions..."
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-sky-500 bg-slate-50 dark:bg-slate-900 dark:border-slate-700 dark:text-white outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={isUpdating}
          className="px-6 py-3 bg-[#0284c7] text-white font-bold rounded-lg hover:bg-sky-700 transition-colors shadow-md cursor-pointer disabled:opacity-70 flex items-center justify-center min-w-[150px]"
        >
          {isUpdating ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
};

export default SettingsTab;
