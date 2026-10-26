import React, { useEffect, useState, useMemo } from "react";
import {
  Loader2,
  Activity,
  Pill,
  Stethoscope,
  X,
  Edit,
  Trash2,
} from "lucide-react";
import { useRecordStore } from "../../store/recordStore";

const EHRTab = ({ user }) => {
  const {
    activePatientHistory,
    activePrescriptions,
    isLoading,
    fetchPatientEHR,
    addClinicalEntry,
    addPrescription,
  } = useRecordStore();
  const [ehrPatients, setEhrPatients] = useState([]);
  const [selectedEhrPatient, setSelectedEhrPatient] = useState("");

  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [isRxModalOpen, setIsRxModalOpen] = useState(false);
  const [noteForm, setNoteForm] = useState({
    diagnosis: "",
    clinical_notes: "",
  });
  const [rxForm, setRxForm] = useState({
    medication_name: "",
    dosage_instructions: "",
    record_id: null,
  });

  // Admin Manage Patient State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState(null);

  const fetchPatientsList = async () => {
    let baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
    if (baseUrl.endsWith("/auth")) baseUrl = baseUrl.replace("/auth", "");
    const res = await fetch(`${baseUrl}/auth/patients`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    const data = await res.json();
    setEhrPatients(data);
  };

  useEffect(() => {
    if (user?.role === "patient") {
      fetchPatientEHR(user._id);
      setSelectedEhrPatient(user._id);
    } else {
      fetchPatientsList();
    }
  }, [user]);

  useEffect(() => {
    if (selectedEhrPatient) fetchPatientEHR(selectedEhrPatient);
  }, [selectedEhrPatient]);

  const activePatientDetails = useMemo(() => {
    if (user?.role === "patient") return user;
    return ehrPatients.find((p) => p._id === selectedEhrPatient);
  }, [selectedEhrPatient, ehrPatients, user]);

  const handleAddNote = async (e) => {
    e.preventDefault();
    await addClinicalEntry({ ...noteForm, patient_id: selectedEhrPatient });
    setIsNoteModalOpen(false);
    setNoteForm({ diagnosis: "", clinical_notes: "" });
  };

  const handleAddRx = async (e) => {
    e.preventDefault();
    await addPrescription({ ...rxForm, patient_id: selectedEhrPatient });
    setIsRxModalOpen(false);
    setRxForm({
      medication_name: "",
      dosage_instructions: "",
      record_id: null,
    });
  };

  // ADMIN ACTION: Update Patient
  const handleUpdatePatient = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      let baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
      if (baseUrl.endsWith("/auth")) baseUrl = baseUrl.replace("/auth", "");
      const res = await fetch(`${baseUrl}/auth/users/${editForm._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editForm),
      });
      if (res.ok) {
        setIsEditModalOpen(false);
        fetchPatientsList(); // Refresh list
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ADMIN ACTION: Delete Patient
  const handleDeletePatient = async (id) => {
    if (
      !window.confirm(
        "WARNING: Are you sure you want to delete this patient profile?",
      )
    )
      return;
    try {
      const token = localStorage.getItem("token");
      let baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
      if (baseUrl.endsWith("/auth")) baseUrl = baseUrl.replace("/auth", "");
      const res = await fetch(`${baseUrl}/auth/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setSelectedEhrPatient(""); // Clear selection
        fetchPatientsList();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {(user?.role === "admin" || user?.role === "doctor") && (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
            Select Patient Profile
          </label>
          <select
            value={selectedEhrPatient}
            onChange={(e) => setSelectedEhrPatient(e.target.value)}
            className="w-full md:w-1/2 px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-[#0284c7] outline-none text-slate-900 dark:text-white cursor-pointer"
          >
            <option value="">-- Choose a Patient --</option>
            {ehrPatients.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name} ({p.systemId || "000"})
              </option>
            ))}
          </select>
        </div>
      )}

      {!selectedEhrPatient ? (
        <div className="text-center py-16 text-slate-500 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
          <Activity size={48} className="mx-auto mb-3 text-slate-300" />
          <p>Please select a patient to view their medical history.</p>
        </div>
      ) : isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-[#0284c7]" />
        </div>
      ) : (
        <>
          {/* PATIENT PROFILE CARD */}
          <div className="bg-[#0284c7]/10 border border-[#0284c7]/20 p-6 rounded-2xl mb-6 relative">
            {/* ADMIN ACTIONS: Edit & Delete Buttons */}
            {user?.role === "admin" && (
              <div className="absolute top-4 right-4 flex gap-2">
                <button
                  onClick={() => {
                    setEditForm(activePatientDetails);
                    setIsEditModalOpen(true);
                  }}
                  className="p-1.5 bg-sky-100 text-sky-600 rounded-md hover:bg-sky-200 transition-colors"
                  title="Edit Patient"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => handleDeletePatient(activePatientDetails._id)}
                  className="p-1.5 bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition-colors"
                  title="Delete Patient"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )}

            <h2 className="text-xl font-extrabold text-[#0284c7] mb-2 pr-16">
              Patient Profile: {activePatientDetails?.name}
            </h2>
            <div className="flex flex-wrap gap-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
              <p>ID: {activePatientDetails?.systemId || "N/A"}</p>
              <p>|</p>
              <p>Age: {activePatientDetails?.age || "Not Provided"}</p>
              <p>|</p>
              <p>
                Blood Group:{" "}
                <span className="text-red-500">
                  {activePatientDetails?.bloodGroup || "Unknown"}
                </span>
              </p>
            </div>
            {activePatientDetails?.about && (
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-400 italic">
                "{activePatientDetails.about}"
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Stethoscope className="text-[#0284c7]" size={20} /> Medical
                  History
                </h2>
                {(user?.role === "doctor" || user?.role === "admin") && (
                  <button
                    onClick={() => setIsNoteModalOpen(true)}
                    className="text-[#0284c7] hover:text-sky-700 font-bold text-sm bg-[#0284c7]/10 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                  >
                    + Add Note
                  </button>
                )}
              </div>
              <div className="p-6 space-y-4">
                {activePatientHistory.length === 0 ? (
                  <p className="text-center py-4 text-slate-500">
                    No history recorded.
                  </p>
                ) : (
                  activePatientHistory.map((record) => (
                    <div
                      key={record._id}
                      className="border-l-2 border-[#0284c7] pl-4 py-1 relative"
                    >
                      <div className="absolute w-3 h-3 bg-[#0284c7] rounded-full -left-[7px] top-2"></div>
                      <p className="text-xs font-bold text-slate-500">
                        {new Date(record.visit_date).toLocaleDateString()}
                      </p>
                      <h3 className="text-md font-bold text-slate-900 dark:text-white mt-1">
                        {record.diagnosis}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                        {record.clinical_notes}
                      </p>
                      <p className="text-xs text-slate-400 mt-2">
                        By{" "}
                        {record.doctor_id?.name?.startsWith("Dr.")
                          ? record.doctor_id.name
                          : `Dr. ${record.doctor_id?.name || "Unknown"}`}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Pill className="text-[#0284c7]" size={20} /> Active
                  Prescriptions
                </h2>
                {(user?.role === "doctor" || user?.role === "admin") && (
                  <button
                    onClick={() => setIsRxModalOpen(true)}
                    className="text-[#0284c7] hover:text-sky-700 font-bold text-sm bg-[#0284c7]/10 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                  >
                    + Issue Rx
                  </button>
                )}
              </div>
              <div className="p-6 grid gap-3">
                {activePrescriptions.length === 0 ? (
                  <p className="text-center py-4 text-slate-500">
                    No prescriptions.
                  </p>
                ) : (
                  activePrescriptions.map((rx) => (
                    <div
                      key={rx._id}
                      className="bg-sky-50 dark:bg-slate-700/50 p-4 rounded-xl border border-sky-100 dark:border-slate-700"
                    >
                      <h3 className="font-bold text-slate-900 dark:text-white">
                        {rx.medication_name}
                      </h3>
                      <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">
                        {rx.dosage_instructions}
                      </p>
                      <p className="text-xs text-slate-400 mt-2">
                        Issued: {new Date(rx.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Note Modal */}
      {isNoteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Add Clinical Note
              </h2>
              <button onClick={() => setIsNoteModalOpen(false)}>
                <X className="text-slate-400 hover:text-slate-600 cursor-pointer" />
              </button>
            </div>
            <form onSubmit={handleAddNote} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Diagnosis
                </label>
                <input
                  required
                  value={noteForm.diagnosis}
                  onChange={(e) =>
                    setNoteForm({ ...noteForm, diagnosis: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-sky-500 bg-slate-50 dark:bg-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Notes
                </label>
                <textarea
                  required
                  rows="4"
                  value={noteForm.clinical_notes}
                  onChange={(e) =>
                    setNoteForm({ ...noteForm, clinical_notes: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-sky-500 bg-slate-50 dark:bg-slate-900 dark:text-white"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-[#0284c7] text-white font-bold py-3 rounded-lg hover:bg-sky-700 cursor-pointer"
              >
                Save Record
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Prescription Modal */}
      {isRxModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Issue Prescription
              </h2>
              <button onClick={() => setIsRxModalOpen(false)}>
                <X className="text-slate-400 hover:text-slate-600 cursor-pointer" />
              </button>
            </div>
            <form onSubmit={handleAddRx} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Medication Name
                </label>
                <input
                  required
                  value={rxForm.medication_name}
                  onChange={(e) =>
                    setRxForm({ ...rxForm, medication_name: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-sky-500 bg-slate-50 dark:bg-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Dosage Instructions
                </label>
                <input
                  required
                  value={rxForm.dosage_instructions}
                  onChange={(e) =>
                    setRxForm({
                      ...rxForm,
                      dosage_instructions: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-sky-500 bg-slate-50 dark:bg-slate-900 dark:text-white"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-[#0284c7] text-white font-bold py-3 rounded-lg hover:bg-sky-700 cursor-pointer"
              >
                Issue
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Admin Patient Edit Modal */}
      {isEditModalOpen && editForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
            <div className="bg-[#0284c7] p-4 flex justify-between items-center text-white">
              <h2 className="text-lg font-bold">Edit Patient Profile</h2>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="hover:bg-white/20 p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleUpdatePatient} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Name
                </label>
                <input
                  required
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-sky-500 bg-slate-50 dark:bg-slate-900 dark:border-slate-700 dark:text-white outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Age
                  </label>
                  <input
                    type="number"
                    value={editForm.age || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, age: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-sky-500 bg-slate-50 dark:bg-slate-900 dark:border-slate-700 dark:text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Blood Group
                  </label>
                  <input
                    value={editForm.bloodGroup || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, bloodGroup: e.target.value })
                    }
                    placeholder="e.g. O+"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-sky-500 bg-slate-50 dark:bg-slate-900 dark:border-slate-700 dark:text-white outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Medical Notes / About
                </label>
                <textarea
                  rows="2"
                  value={editForm.about || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, about: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-sky-500 bg-slate-50 dark:bg-slate-900 dark:border-slate-700 dark:text-white outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-[#0284c7] text-white font-bold py-3 rounded-lg hover:bg-sky-700 transition-colors cursor-pointer"
              >
                Save Changes
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EHRTab;
