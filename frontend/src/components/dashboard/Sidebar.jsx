import React from "react";
import {
  LayoutDashboard,
  Calendar,
  FileText,
  Settings,
  Sparkles,
  CheckCircle,
  Loader2,
  Stethoscope,
} from "lucide-react";
import Logo from "../Logo";

const Sidebar = ({
  user,
  activeTab,
  setActiveTab,
  handleUpgrade,
  isCheckoutLoading,
}) => (
  <aside className="w-full md:w-72 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col p-6 md:sticky md:top-0 md:h-screen overflow-y-auto custom-scrollbar">
    <div>
      <div className="flex flex-col items-center justify-center mb-10 mt-2">
        <div className="bg-[#0284c7] p-3 rounded-2xl mb-3 shadow-md">
          <Logo className="w-12 h-12 text-white" />
        </div>
        <h2 className="text-2xl font-extrabold text-[#0284c7]">VitalSync</h2>
      </div>
      <nav className="space-y-2">
        <button
          onClick={() => setActiveTab("dashboard")}
          className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl font-bold transition-colors ${activeTab === "dashboard" ? "bg-[#0284c7]/10 text-[#0284c7]" : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700"}`}
        >
          <LayoutDashboard size={20} /> Dashboard
        </button>

        <button
          onClick={() => setActiveTab("appointments")}
          className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl font-bold transition-colors ${activeTab === "appointments" ? "bg-[#0284c7]/10 text-[#0284c7]" : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700"}`}
        >
          <Calendar size={20} />{" "}
          {user?.role === "admin" ? "System Appointments" : "My Appointments"}
        </button>

        {user?.role === "admin" && (
          <button
            onClick={() => setActiveTab("my-appointments")}
            className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl font-bold transition-colors ${activeTab === "my-appointments" ? "bg-[#0284c7]/10 text-[#0284c7]" : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700"}`}
          >
            <Calendar size={20} /> My Appointments
          </button>
        )}

        <button
          onClick={() => setActiveTab("records")}
          className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl font-bold transition-colors ${activeTab === "records" ? "bg-[#0284c7]/10 text-[#0284c7]" : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700"}`}
        >
          <FileText size={20} /> Patient Records
        </button>

        {/* New button for Doctor Records */}
        {user?.role === "admin" && (
          <button
            onClick={() => setActiveTab("doctor-records")}
            className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl font-bold transition-colors ${activeTab === "doctor-records" ? "bg-[#0284c7]/10 text-[#0284c7]" : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700"}`}
          >
            <Stethoscope size={20} /> Doctor Records
          </button>
        )}

        {/* Settings Button */}
        <button
          onClick={() => setActiveTab("settings")}
          className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl font-bold transition-colors ${activeTab === "settings" ? "bg-[#0284c7]/10 text-[#0284c7]" : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700"}`}
        >
          <Settings size={20} /> Settings
        </button>
      </nav>
    </div>

    <div className="mt-auto pt-10 space-y-4">
      {/* User Profile */}
      <div className="flex items-center gap-3 p-3 bg-slate-100 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600">
        <div className="bg-[#0284c7] text-white w-10 h-10 rounded-full flex items-center justify-center font-bold">
          {user?.name?.charAt(0)}
        </div>
        <div className="overflow-hidden">
          <p className="text-sm font-bold dark:text-white truncate">
            {user?.name}
          </p>
          <p className="text-xs text-slate-500 font-semibold">
            {user?.systemId || "ID Not Assigned"}
          </p>
        </div>
      </div>

      {user?.role === "patient" && (
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-5 text-center text-white shadow-lg">
          {user?.isPro ? (
            <>
              <CheckCircle size={28} className="mx-auto text-green-300 mb-2" />
              <h3 className="font-bold text-sm">VitalSync Pro Active</h3>
              <p className="text-xs text-indigo-100 mt-1">
                Unlimited bookings & priority.
              </p>
            </>
          ) : (
            <>
              <Sparkles size={24} className="mx-auto text-yellow-300 mb-2" />
              <h3 className="font-bold text-sm">VitalSync Pro</h3>
              <button
                onClick={handleUpgrade}
                disabled={isCheckoutLoading}
                className="w-full mt-3 py-2 bg-white text-indigo-600 rounded-lg text-sm font-bold shadow-sm flex justify-center gap-2 disabled:opacity-70"
              >
                {isCheckoutLoading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  "Upgrade for $99"
                )}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  </aside>
);
export default Sidebar;
