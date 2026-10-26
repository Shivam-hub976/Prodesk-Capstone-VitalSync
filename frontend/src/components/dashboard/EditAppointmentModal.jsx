import React, { useState, useEffect } from "react";
import { X, Calendar, Clock } from "lucide-react";
import { useAppointmentStore } from "../../store/appointmentStore";

const EditAppointmentModal = ({ isOpen, onClose, appointment }) => {
  const { loadAppointments } = useAppointmentStore();
  const [formData, setFormData] = useState({ date: "", time: "", reason: "" });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (appointment && isOpen) {
      const d = new Date(appointment.schedule_date);

      // fixed the date and time formatting to ensure two digits for month, day, hours, and minutes within local time zone. This ensures that the input fields display the correct values when editing an appointment.
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");

      const hh = String(d.getHours()).padStart(2, "0");
      const mins = String(d.getMinutes()).padStart(2, "0");

      setFormData({
        date: `${yyyy}-${mm}-${dd}`,
        time: `${hh}:${mins}`,
        reason: appointment.reason_for_visit || "",
      });
    }
  }, [appointment, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      let baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
      if (baseUrl.endsWith("/auth")) baseUrl = baseUrl.replace("/auth", "");

      const newDate = new Date(`${formData.date}T${formData.time}:00`);

      const res = await fetch(
        `${baseUrl}/appointments/${appointment._id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          // Extending the patch to also take date and reason if provided by admin/doctor
          body: JSON.stringify({
            schedule_date: newDate.toISOString(),
            reason_for_visit: formData.reason,
          }),
        },
      );

      if (res.ok) {
        await loadAppointments();
        onClose();
      } else {
        alert(
          "Failed to update. Make sure backend supports date/reason patch.",
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
        <div className="bg-[#0284c7] p-4 flex justify-between items-center text-white">
          <h2 className="text-lg font-bold flex items-center gap-2">
            Edit Appointment
          </h2>
          <button
            onClick={onClose}
            className="hover:bg-white/20 p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
              <Calendar size={16} /> Date
            </label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-sky-500 bg-slate-50 dark:bg-slate-900 dark:border-slate-700 dark:text-white outline-none"
              min={new Date().toISOString().split("T")[0]}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
              <Clock size={16} /> Time
            </label>
            <input
              type="time"
              required
              value={formData.time}
              onChange={(e) =>
                setFormData({ ...formData, time: e.target.value })
              }
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-sky-500 bg-slate-50 dark:bg-slate-900 dark:border-slate-700 dark:text-white outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
              Reason
            </label>
            <input
              type="text"
              required
              value={formData.reason}
              onChange={(e) =>
                setFormData({ ...formData, reason: e.target.value })
              }
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-sky-500 bg-slate-50 dark:bg-slate-900 dark:border-slate-700 dark:text-white outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#0284c7] text-white font-bold py-3 rounded-lg hover:bg-sky-700 transition-colors shadow-md mt-2 disabled:opacity-70 cursor-pointer"
          >
            {isLoading ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditAppointmentModal;
