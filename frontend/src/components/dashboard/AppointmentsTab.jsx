import React, { useMemo, useState } from "react";
import {
  Loader2,
  Calendar,
  Trash2,
  PlusCircle,
  RotateCcw,
  Clock,
  AlertTriangle,
  Edit2,
  Users,
  FileX,
} from "lucide-react";
import { useAppointmentStore } from "../../store/appointmentStore";
import BookingModal from "../BookingModal";
import EditAppointmentModal from "./EditAppointmentModal";

const AppointmentsTab = ({ user, activeTab }) => {
  const {
    appointments,
    isLoading,
    error,
    removeAppointment,
    loadAppointments,
  } = useAppointmentStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedApptToEdit, setSelectedApptToEdit] = useState(null);

  const now = new Date();
  const nowTime = now.getTime();
  const todayStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  ).getTime();
  const todayEnd = todayStart + 24 * 60 * 60 * 1000 - 1;
  const oneHour = 60 * 60 * 1000;

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      let baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
      if (baseUrl.endsWith("/auth")) baseUrl = baseUrl.replace("/auth", "");
      const res = await fetch(`${baseUrl}/appointments/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) loadAppointments();
    } catch (err) {}
  };

  const handleEditClick = (app) => {
    setSelectedApptToEdit(app);
    setEditModalOpen(true);
  };

  const baseAppts =
    activeTab === "my-appointments" && user?.role === "admin"
      ? appointments.filter((app) => app.patient_id?._id === user?._id)
      : appointments;

  // 1. ACTIVE LOGIC
  const activeList = [...baseAppts]
    .filter((app) => {
      const apptTime = new Date(app.schedule_date).getTime();
      if (app.status === "scheduled") return true;
      if (app.status === "pending" && nowTime <= apptTime) return true;
      return false;
    })
    .sort(
      (a, b) =>
        new Date(a.schedule_date).getTime() -
        new Date(b.schedule_date).getTime(),
    );

  // 2. HISTORY LOGIC
  const pastList = [...baseAppts]
    .filter((app) => {
      const apptTime = new Date(app.schedule_date).getTime();
      const isPastDate = apptTime < nowTime;
      const isExpiredPending = app.status === "pending" && apptTime < nowTime;

      if (["cancelled", "rejected"].includes(app.status)) return true;
      if (app.status === "completed" && isPastDate) return true;
      if (isExpiredPending) return true;
      return false;
    })
    .sort(
      (a, b) =>
        new Date(b.schedule_date).getTime() -
        new Date(a.schedule_date).getTime(),
    );

  // 3. PREMATURE LOGIC
  const prematureList = [...baseAppts]
    .filter((app) => {
      const isFutureDate = new Date(app.schedule_date).getTime() >= nowTime;
      return ["completed"].includes(app.status) && isFutureDate;
    })
    .sort(
      (a, b) =>
        new Date(a.schedule_date).getTime() -
        new Date(b.schedule_date).getTime(),
    );

  const doctorStats = useMemo(() => {
    if (user?.role !== "doctor") return null;

    const uniquePatients = new Set(
      appointments.map((app) => app.patient_id?._id),
    ).size;
    const pending = appointments.filter(
      (app) => app.status === "pending",
    ).length;
    const cancelled = appointments.filter((app) =>
      ["cancelled", "rejected"].includes(app.status),
    ).length;

    const totalActive = activeList.length;
    const todaysActive = activeList.filter((app) => {
      const t = new Date(app.schedule_date).getTime();
      return t >= todayStart && t <= todayEnd;
    }).length;

    return { uniquePatients, pending, cancelled, todaysActive, totalActive };
  }, [appointments, user?.role, activeList, todayStart, todayEnd]);

  const showStats = user?.role === "doctor" && activeTab === "dashboard";
  const showActive =
    activeTab === "dashboard" ||
    (activeTab === "my-appointments" && user?.role === "admin");
  const showPremature =
    activeTab === "dashboard" ||
    (activeTab === "my-appointments" && user?.role === "admin");
  const showHistory =
    activeTab === "appointments" ||
    (activeTab === "my-appointments" && user?.role === "admin");

  const renderList = (list, type = "active") => {
    if (list.length === 0) {
      return (
        <div className="text-center py-12 m-6 text-slate-500 bg-slate-50/50 dark:bg-slate-800/50 border border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
          {type === "history"
            ? "No historical appointments found."
            : "No active appointments found in queue."}
        </div>
      );
    }

    return (
      <div className="p-0 md:p-6 overflow-x-auto">
        {user?.role === "doctor" || user?.role === "admin" ? (
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="p-4 text-xs font-bold text-slate-500 uppercase">
                  Time
                </th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase">
                  Patient Name
                </th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase">
                  Reason
                </th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase">
                  Status
                </th>
                {/* other than admin, hide Actions column */}
                {(type !== "history" || user?.role === "admin") && (
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase text-right">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {list.map((app) => {
                const apptTime = new Date(app.schedule_date).getTime();
                const status = app.status?.toLowerCase();

                const isScheduledState =
                  status === "scheduled" && type === "active";
                const isLive =
                  isScheduledState &&
                  nowTime >= apptTime &&
                  nowTime <= apptTime + oneHour;
                const isOverdue =
                  isScheduledState && nowTime > apptTime + oneHour;

                const isAutoCancelled =
                  status === "pending" && nowTime > apptTime;

                const displayStatus = isAutoCancelled ? "EXPIRED" : status;
                const statusColor = isAutoCancelled
                  ? "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
                  : status === "pending"
                    ? "bg-yellow-100 text-yellow-700"
                    : status === "scheduled"
                      ? "bg-blue-100 text-blue-700"
                      : status === "completed"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700";

                const canEdit =
                  user?.role === "admin" ||
                  (user?.role === "doctor" &&
                    status === "pending" &&
                    !isAutoCancelled);

                return (
                  <tr
                    key={app._id}
                    className={`border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 ${isOverdue ? "bg-red-50/50 dark:bg-red-900/10" : ""}`}
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div>
                          <p
                            className={`font-bold text-sm ${isOverdue ? "text-red-600 dark:text-red-400" : isLive ? "text-emerald-600 dark:text-emerald-400" : "text-slate-900 dark:text-white"}`}
                          >
                            {new Date(app.schedule_date).toLocaleTimeString(
                              [],
                              { hour: "2-digit", minute: "2-digit" },
                            )}
                          </p>
                          <p
                            className={`text-xs ${isOverdue ? "text-red-500" : isLive ? "text-emerald-500" : "text-slate-500"}`}
                          >
                            {new Date(app.schedule_date).toLocaleDateString()}
                          </p>
                        </div>
                        {isLive && (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 px-2 py-0.5 rounded-full animate-pulse border border-emerald-200 dark:border-emerald-800">
                            <span className="w-1.5 h-1.5 bg-emerald-600 dark:bg-emerald-400 rounded-full"></span>{" "}
                            Live
                          </span>
                        )}
                      </div>
                      {isOverdue && (
                        <span className="text-[10px] font-bold text-red-500 uppercase mt-1 inline-block">
                          Overdue
                        </span>
                      )}
                    </td>
                    <td className="p-4 font-semibold text-slate-700 dark:text-slate-300 text-sm">
                      {app.patient_id?.name || "Unknown"}
                    </td>
                    <td className="p-4 text-sm text-slate-600 dark:text-slate-400 capitalize">
                      {app.reason_for_visit}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 text-[10px] uppercase font-bold rounded-md ${statusColor}`}
                      >
                        {displayStatus}
                      </span>
                    </td>

                    {/* Actions Column */}
                    {(type !== "history" || user?.role === "admin") && (
                      <td className="p-4 flex justify-end gap-2 items-center">
                        {type === "active" && canEdit && (
                          <button
                            onClick={() => handleEditClick(app)}
                            className="p-1.5 text-sky-600 hover:bg-sky-50 rounded transition-colors mr-2 cursor-pointer"
                            title="Edit Time/Reason"
                          >
                            <Edit2 size={16} />
                          </button>
                        )}

                        {type === "active" && status === "pending" && (
                          <>
                            <button
                              onClick={() =>
                                handleStatusUpdate(app._id, "scheduled")
                              }
                              className="px-2 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded text-xs font-bold cursor-pointer"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() =>
                                handleStatusUpdate(app._id, "rejected")
                              }
                              className="px-2 py-1 bg-red-50 text-red-600 hover:bg-red-100 rounded text-xs font-bold cursor-pointer"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {type === "active" && status === "scheduled" && (
                          <>
                            <button
                              onClick={() =>
                                handleStatusUpdate(app._id, "completed")
                              }
                              className="px-2 py-1 bg-green-50 text-green-600 hover:bg-green-100 rounded text-xs font-bold cursor-pointer"
                            >
                              Complete
                            </button>
                            <button
                              onClick={() =>
                                handleStatusUpdate(app._id, "cancelled")
                              }
                              className="px-2 py-1 bg-orange-50 text-orange-600 hover:bg-orange-100 rounded text-xs font-bold cursor-pointer"
                            >
                              Cancel
                            </button>
                          </>
                        )}

                        {type === "premature" && (
                          <>
                            <button
                              onClick={() =>
                                handleStatusUpdate(app._id, "scheduled")
                              }
                              className="flex items-center gap-1 px-2 py-1 bg-yellow-50 text-yellow-700 hover:bg-yellow-100 rounded text-xs font-bold cursor-pointer"
                              title="Undo Completion"
                            >
                              <RotateCcw size={12} /> Undo
                            </button>
                            <button
                              onClick={() =>
                                handleStatusUpdate(app._id, "cancelled")
                              }
                              className="px-2 py-1 bg-red-50 text-red-600 hover:bg-red-100 rounded text-xs font-bold cursor-pointer"
                            >
                              Cancel
                            </button>
                          </>
                        )}

                        {user?.role === "admin" && (
                          <button
                            onClick={() => removeAppointment(app._id)}
                            className="p-1 text-slate-400 hover:text-red-600 ml-2 cursor-pointer"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="grid gap-3 p-4">
            {list.map((app) => {
              const apptTime = new Date(app.schedule_date).getTime();
              const status = app.status?.toLowerCase();

              const isScheduledState =
                status === "scheduled" && type === "active";
              const isLive =
                isScheduledState &&
                nowTime >= apptTime &&
                nowTime <= apptTime + oneHour;
              const isOverdue =
                isScheduledState && nowTime > apptTime + oneHour;

              const isAutoCancelled =
                status === "pending" && nowTime > apptTime;
              const displayStatus = isAutoCancelled ? "EXPIRED" : status;
              const statusColor = isAutoCancelled
                ? "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
                : status === "pending"
                  ? "bg-yellow-100 text-yellow-700"
                  : status === "scheduled"
                    ? "bg-blue-100 text-blue-700"
                    : status === "completed"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700";

              const canPatientEdit = status === "pending" && !isAutoCancelled;
              const canPatientDelete = status === "pending" && !isAutoCancelled;

              return (
                <div
                  key={app._id}
                  className={`flex justify-between items-center p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:shadow-md transition-shadow ${isOverdue ? "border-red-300 dark:border-red-800" : ""}`}
                >
                  <div className="flex flex-col gap-2 w-full">
                    <div className="flex flex-wrap justify-between items-start md:items-center">
                      <div className="flex gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <p
                              className={`font-bold text-sm ${isOverdue ? "text-red-600 dark:text-red-400" : isLive ? "text-emerald-600 dark:text-emerald-400" : "text-slate-900 dark:text-white"}`}
                            >
                              {new Date(app.schedule_date).toLocaleTimeString(
                                [],
                                { hour: "2-digit", minute: "2-digit" },
                              )}
                            </p>
                            {isLive && (
                              <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full animate-pulse border border-emerald-200">
                                <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full"></span>{" "}
                                Live
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500">
                            {new Date(app.schedule_date).toLocaleDateString()}
                          </p>
                          {isOverdue && (
                            <span className="text-[10px] font-bold text-red-500 uppercase mt-1 inline-block">
                              Overdue
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                            {app.doctor_id?.name?.startsWith("Dr.")
                              ? app.doctor_id.name
                              : `Dr. ${app.doctor_id?.name || "Unassigned"}`}
                          </p>
                          <span
                            className={`px-2 py-0.5 text-[10px] uppercase font-bold rounded-md mt-1 inline-block ${statusColor}`}
                          >
                            {displayStatus}
                          </span>
                        </div>
                      </div>

                      {/* Actions Column */}
                      {(type !== "history" || user?.role === "admin") && (
                        <div className="flex items-center gap-2">
                          {canPatientEdit && type === "active" && (
                            <button
                              onClick={() => handleEditClick(app)}
                              className="text-xs font-bold text-sky-600 bg-sky-50 px-3 py-1.5 rounded-lg cursor-pointer"
                            >
                              Edit
                            </button>
                          )}
                          {(user?.role === "admin" ||
                            (user?.role === "patient" && canPatientDelete)) && (
                            <button
                              onClick={() => removeAppointment(app._id)}
                              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                              title="Delete Request"
                            >
                              <Trash2 size={20} />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500 bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded-full inline-block">
                        Reason: {app.reason_for_visit}
                      </p>
                      {status === "scheduled" && user?.role === "patient" && (
                        <p className="text-[10px] text-slate-400 mt-1 italic">
                          * Cannot edit or cancel. Appointment is confirmed by
                          doctor.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {showStats && (
        <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-[#0284c7] text-white text-[10px] px-2 py-1 font-bold rounded-bl-lg">
              TODAY
            </div>
            <h3 className="text-slate-500 font-bold mb-2 flex justify-center items-center gap-1">
              <Calendar size={16} /> Today's / Total Active
            </h3>
            <p className="text-4xl font-extrabold text-[#0284c7]">
              {doctorStats?.todaysActive}{" "}
              <span className="text-xl text-slate-400">
                / {doctorStats?.totalActive}
              </span>
            </p>
          </div>
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 text-center">
            <h3 className="text-slate-500 font-bold mb-2 flex justify-center items-center gap-1">
              <Users size={16} /> Total Patients
            </h3>
            <p className="text-4xl font-extrabold text-slate-800 dark:text-white">
              {doctorStats?.uniquePatients || 0}
            </p>
          </div>
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 text-center">
            <h3 className="text-slate-500 font-bold mb-2 flex justify-center items-center gap-1">
              <Clock size={16} /> Pending Requests
            </h3>
            <p className="text-4xl font-extrabold text-yellow-500">
              {doctorStats?.pending || 0}
            </p>
          </div>
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 text-center">
            <h3 className="text-slate-500 font-bold mb-2 flex justify-center items-center gap-1">
              <FileX size={16} /> Cancellations
            </h3>
            <p className="text-4xl font-extrabold text-red-500">
              {doctorStats?.cancelled || 0}
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 text-red-600 bg-red-50 rounded-lg text-sm border border-red-200">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-[#0284c7]" />
        </div>
      ) : (
        <div className="space-y-8">
          {showPremature && prematureList.length > 0 && (
            <div className="bg-yellow-50 dark:bg-yellow-900/10 rounded-2xl shadow-sm border border-yellow-200 dark:border-yellow-700/50 overflow-hidden">
              <div className="p-6 border-b border-yellow-200/50 flex justify-between items-center">
                <h2 className="text-lg font-bold text-yellow-700 dark:text-yellow-500 flex items-center gap-2">
                  <AlertTriangle size={20} /> Action Required: Prematurely
                  Completed
                </h2>
                <p className="text-xs text-yellow-600 hidden md:block">
                  These future appointments were marked complete.
                </p>
              </div>
              {renderList(prematureList, "premature")}
            </div>
          )}

          {showActive && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Calendar className="text-[#0284c7]" size={20} />
                  Active Appointments
                </h2>
                {(user?.role === "patient" || user?.role === "admin") && (
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#0284c7] text-white rounded-lg hover:bg-sky-700 transition-colors text-sm font-semibold shadow-sm cursor-pointer"
                  >
                    <PlusCircle size={18} /> Book New
                  </button>
                )}
              </div>
              {activeList.length === 0 ? (
                <div className="text-center py-12 m-6 text-slate-500 bg-slate-50/50 dark:bg-slate-800/50 border border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
                  No active appointments found in queue.
                </div>
              ) : (
                renderList(activeList, "active")
              )}
            </div>
          )}

          {showHistory && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden opacity-95">
              <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                <h2 className="text-lg font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Clock className="text-slate-400" size={20} /> Appointment
                  History (Completed / Cancelled)
                </h2>
                {(user?.role === "patient" || user?.role === "admin") &&
                  !showActive && (
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-[#0284c7] text-white rounded-lg hover:bg-sky-700 transition-colors text-sm font-semibold shadow-sm cursor-pointer"
                    >
                      <PlusCircle size={18} /> Book New
                    </button>
                  )}
              </div>
              {renderList(pastList, "history")}
            </div>
          )}
        </div>
      )}

      <BookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
      <EditAppointmentModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        appointment={selectedApptToEdit}
      />
    </>
  );
};

export default AppointmentsTab;
