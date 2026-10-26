import React, { useEffect, useState } from "react";
import Sidebar from "./dashboard/Sidebar";
import Header from "./dashboard/Header";
import AppointmentsTab from "./dashboard/AppointmentsTab";
import EHRTab from "./dashboard/EHRTab";
import SettingsTab from "./dashboard/SettingsTab";
import { triggerStripeCheckout } from "../services/paymentService";
import { useAppointmentStore } from "../store/appointmentStore";
import DoctorRecordsTab from "./dashboard/DoctorRecordsTab";

const Dashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);

  // Force re-render when appointments are loaded
  const { loadAppointments } = useAppointmentStore();

  // Load appointments when the component mounts
  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    if (query.get("success") === "true" && query.get("session_id")) {
      verifyPaymentStatus(query.get("session_id"));
    }
  }, []);

  const verifyPaymentStatus = async (sessionId) => {
    try {
      const token = localStorage.getItem("token");
      let baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
      if (baseUrl.endsWith("/auth")) baseUrl = baseUrl.replace("/auth", "");
      const res = await fetch(`${baseUrl}/payments/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ session_id: sessionId }),
      });
      const data = await res.json();
      if (data.success) {
        const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
        storedUser.isPro = true;
        localStorage.setItem("user", JSON.stringify(storedUser));
        window.history.replaceState(null, "", "/dashboard");
        window.location.reload();
      }
    } catch (err) {}
  };

  const handleUpgrade = async () => {
    setIsCheckoutLoading(true);
    try {
      window.location.href = await triggerStripeCheckout();
    } catch (err) {
      alert(err.message);
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 dark:bg-slate-900">
      <Sidebar
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        handleUpgrade={handleUpgrade}
        isCheckoutLoading={isCheckoutLoading}
      />
      <main className="flex-1 p-6 md:p-10 overflow-y-auto h-screen">
        <Header user={user} activeTab={activeTab} onLogout={onLogout} />
        {activeTab === "settings" && <SettingsTab user={user} />}
        {activeTab === "records" && <EHRTab user={user} />}
        {["dashboard", "appointments", "my-appointments"].includes(
          activeTab,
        ) && <AppointmentsTab user={user} activeTab={activeTab} />}
        {activeTab === "doctor-records" && <DoctorRecordsTab />}
      </main>
    </div>
  );
};
export default Dashboard;
