import React, { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { useAppointmentStore } from "../store/appointmentStore";

const fetchDoctorsList = async () => {
  let baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  if (baseUrl.endsWith("/auth")) baseUrl = baseUrl.replace("/auth", "");
  const token = localStorage.getItem("token");
  const response = await fetch(`${baseUrl}/auth/doctors`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("Failed to load doctors");
  return response.json();
};

const fetchPatientsList = async () => {
  let baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  if (baseUrl.endsWith("/auth")) baseUrl = baseUrl.replace("/auth", "");
  const token = localStorage.getItem("token");
  const response = await fetch(`${baseUrl}/auth/patients`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("Failed to load patients");
  return response.json();
};

const BookingModal = ({ isOpen, onClose }) => {
  const { addAppointment } = useAppointmentStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [user, setUser] = useState(null);

  const [formData, setFormData] = useState({
    doctor_id: "",
    schedule_date: "",
    reason_for_visit: "",
    patient_id: "", // For Admin tracking
  });

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    setUser(storedUser);
  }, []);

  useEffect(() => {
    if (isOpen) {
      const getDoctors = async () => {
        setLoadingDoctors(true);
        try {
          const data = await fetchDoctorsList();
          setDoctors(data);
        } catch (err) {
          setError("Could not load the doctor directory.");
        } finally {
          setLoadingDoctors(false);
        }
      };
      getDoctors();

      // Fetch patient list ONLY if user is Admin
      if (user?.role === "admin") {
        const getPatients = async () => {
          setLoadingPatients(true);
          try {
            const data = await fetchPatientsList();
            setPatients(data);
          } catch (err) {
            console.error("Failed to fetch patients.");
          } finally {
            setLoadingPatients(false);
          }
        };
        getPatients();
      }
    }
  }, [isOpen, user?.role]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await addAppointment(formData);

    if (result.success) {
      setFormData({
        doctor_id: "",
        schedule_date: "",
        reason_for_visit: "",
        patient_id: "",
      });
      onClose();
    } else {
      setError(result.message || "Failed to book appointment.");
    }

    setLoading(false);
  };

  // Helper: Prevents booking in past time/dates
  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-700">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Book Appointment
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-200">
              {error}
            </div>
          )}

          {/* Admin's Patient Selection Dropdown */}
          {user?.role === "admin" && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Select Patient (Admin Only)
              </label>
              <div className="relative">
                <select
                  name="patient_id"
                  value={formData.patient_id}
                  onChange={handleChange}
                  disabled={loadingPatients}
                  className="w-full px-4 py-2.5 bg-purple-50 dark:bg-slate-900 border border-purple-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-slate-900 dark:text-white cursor-pointer"
                >
                  <option value="">Self (Book as Admin)</option>
                  {patients.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name} ({p.email}) - {p.systemId || "000"}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Select Physician
            </label>
            <div className="relative">
              <select
                name="doctor_id"
                required
                value={formData.doctor_id}
                onChange={handleChange}
                disabled={loadingDoctors}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-[#0284c7] outline-none text-slate-900 dark:text-white appearance-none cursor-pointer disabled:opacity-50"
              >
                <option value="" disabled>
                  {loadingDoctors
                    ? "Loading directory..."
                    : "Choose a doctor from the list"}
                </option>
                {doctors.map((doc) => (
                  <option key={doc._id} value={doc._id}>
                    {doc.name}
                  </option>
                ))}
              </select>
              {loadingDoctors && (
                <Loader2
                  size={16}
                  className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-[#0284c7]"
                />
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Date & Time
            </label>
            <input
              type="datetime-local"
              name="schedule_date"
              required
              min={getMinDateTime()} // Blocks Past Dates in UI
              value={formData.schedule_date}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-[#0284c7] outline-none text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Reason for Visit
            </label>
            <input
              type="text"
              name="reason_for_visit"
              required
              value={formData.reason_for_visit}
              onChange={handleChange}
              placeholder="e.g., Annual Checkup, Fever"
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-[#0284c7] outline-none text-slate-900 dark:text-white"
            />
          </div>

          <button
            type="submit"
            disabled={loading || formData.doctor_id === ""}
            className="w-full bg-[#0284c7] hover:bg-sky-700 text-white font-bold py-3 rounded-lg mt-4 transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading && <Loader2 size={18} className="animate-spin" />}
            {loading ? "Booking..." : "Confirm Booking"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BookingModal;
