import React from "react";
import { LogOut, Sparkles } from "lucide-react";

const Header = ({ user, activeTab, onLogout }) => {
  const getHeaderTitle = () => {
    if (activeTab === "appointments")
      return user?.role === "admin" ? "System Appointments" : "My Appointments";
    if (activeTab === "my-appointments") return "My Personal Appointments";
    if (activeTab === "records") return "Electronic Health Records (EHR)";
    if (activeTab === "settings") return "Account Settings";
    if (user?.role === "doctor") return "Today's Appointment Queue";
    if (user?.role === "admin") return "Admin Control Center";
    if (activeTab === "doctor-records") return "Doctor Directory & Records";
    return "Dashboard Overview";
  };

  return (
    <header className="mb-10 flex flex-col-reverse md:flex-row justify-between items-start md:items-center gap-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          {getHeaderTitle()}
        </h1>
        <p className="text-slate-500 mt-1">
          Manage your clinical schedule and activities.
        </p>
      </div>
      <div className="flex items-center gap-3 bg-white dark:bg-slate-800 p-2 pr-4 rounded-full shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="bg-[#0284c7]/10 p-2 rounded-full text-[#0284c7] font-bold w-10 h-10 flex items-center justify-center">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <div className="text-left hidden md:block">
          <p className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1">
            {user?.role === "doctor" &&
            !user?.name.toLowerCase().includes("dr.")
              ? `Dr. ${user?.name}`
              : user?.name}
            {user?.isPro && (
              <Sparkles
                size={12}
                className="text-purple-500"
                title="Pro User"
              />
            )}
          </p>
          <p className="text-xs text-[#0284c7] font-semibold uppercase">
            {user?.role}
          </p>
        </div>
        <div className="w-px h-8 bg-slate-200 dark:bg-slate-700 mx-1 hidden md:block"></div>
        <button
          onClick={onLogout}
          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
};
export default Header;
