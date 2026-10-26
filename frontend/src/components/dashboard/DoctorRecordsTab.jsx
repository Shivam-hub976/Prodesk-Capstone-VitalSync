import React, { useEffect, useState } from "react";
import {
  Loader2,
  Stethoscope,
  Mail,
  Phone,
  Droplet,
  Hash,
  User as UserIcon,
  Edit,
  Trash2,
  X,
} from "lucide-react";

const DoctorRecordsTab = () => {
  const [doctors, setDoctors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editForm, setEditForm] = useState(null);

  const fetchDoctors = async () => {
    try {
      const token = localStorage.getItem("token");
      let baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
      if (baseUrl.endsWith("/auth")) baseUrl = baseUrl.replace("/auth", "");
      const res = await fetch(`${baseUrl}/auth/doctors`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setDoctors(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleDelete = async (id) => {
    if (
      !window.confirm("WARNING: Are you sure you want to delete this doctor?")
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
      if (res.ok) fetchDoctors();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdate = async (e) => {
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
        setIsModalOpen(false);
        fetchDoctors();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const openEditModal = (doc) => {
    setEditForm(doc);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-extrabold text-[#0284c7] flex items-center gap-2">
            <Stethoscope size={24} /> Registered Doctors Directory
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Manage, update, and remove healthcare professionals.
          </p>
        </div>
        <div className="bg-[#0284c7]/10 px-4 py-2 rounded-xl border border-[#0284c7]/20">
          <p className="text-sm font-bold text-[#0284c7]">
            Total: {doctors.length}
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-[#0284c7]" />
        </div>
      ) : doctors.length === 0 ? (
        <div className="text-center py-16 text-slate-500 bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
          No doctors registered yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {doctors.map((doc) => (
            <div
              key={doc._id}
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-md transition-shadow relative"
            >
              <div className="absolute top-4 right-4 flex gap-2">
                <button
                  onClick={() => openEditModal(doc)}
                  className="p-1.5 bg-sky-50 text-sky-600 rounded-md hover:bg-sky-100 transition-colors"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => handleDelete(doc._id)}
                  className="p-1.5 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="p-5 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="bg-[#0284c7] text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-sm">
                    {doc.name.replace("Dr. ", "").charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white pr-16">
                      {doc.name.startsWith("Dr.")
                        ? doc.name
                        : `Dr. ${doc.name}`}
                    </h3>
                    <p className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                      <Hash size={12} /> {doc.systemId || "Pending ID"}
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-5 space-y-3">
                <p className="text-sm flex items-center gap-3 text-slate-600 dark:text-slate-300">
                  <Mail size={16} className="text-slate-400" /> {doc.email}
                </p>
                <p className="text-sm flex items-center gap-3 text-slate-600 dark:text-slate-300">
                  <Phone size={16} className="text-slate-400" />{" "}
                  {doc.phone || "Not Provided"}
                </p>
                <div className="flex gap-4 pt-2 mt-2 border-t border-slate-100 dark:border-slate-700">
                  <p className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                    <UserIcon size={14} /> Age: {doc.age || "--"}
                  </p>
                  <p className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                    <Droplet size={14} className="text-red-400" /> Blood:{" "}
                    {doc.bloodGroup || "Unknown"}
                  </p>
                </div>
                {doc.about && (
                  <p className="text-xs text-slate-500 italic mt-3 bg-slate-50 dark:bg-slate-700/50 p-2 rounded-lg">
                    "{doc.about}"
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Admin Edit Modal */}
      {isModalOpen && editForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
            <div className="bg-[#0284c7] p-4 flex justify-between items-center text-white">
              <h2 className="text-lg font-bold">Edit Doctor Profile</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="hover:bg-white/20 p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleUpdate} className="p-6 space-y-4">
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
                    Phone
                  </label>
                  <input
                    value={editForm.phone || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, phone: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-sky-500 bg-slate-50 dark:bg-slate-900 dark:border-slate-700 dark:text-white outline-none"
                  />
                </div>
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
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Specialization / About
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

export default DoctorRecordsTab;
