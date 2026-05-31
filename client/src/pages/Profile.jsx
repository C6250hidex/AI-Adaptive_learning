import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";
import toast from "react-hot-toast";
import {
  Mail,
  Shield,
  Calendar,
  Lock,
  Activity,
  CheckCircle,
  Key,
  Loader2,
} from "lucide-react";

const Profile = () => {
  const { user } = useAuth();
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(false);
  const [passData, setPassData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const { data } = await API.get("/exams/history");
        setActivity(data.slice(0, 5)); // Show last 5 actions
      } catch (err) {
        console.error(err);
      }
    };
    fetchActivity();
  }, []);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passData.newPassword !== passData.confirmPassword) {
      return toast.error("New passwords do not match!");
    }

    setLoading(true);
    try {
      await API.put("/auth/change-password", passData);
      toast.success("Security updated successfully");
      setPassData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <Sidebar />
      <main className="flex-1 p-4 md:p-10 overflow-y-auto">
        <header className="mb-10">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Account Settings
          </h1>
          <p className="text-slate-500 font-medium">
            Manage your academic identity and security
          </p>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
          {/* LEFT: Identity Card */}
          <div className="xl:col-span-1 space-y-6">
            <div className="bg-white p-8 rounded-[3rem] shadow-xl shadow-slate-200/50 border border-white text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-24 bg-indigo-600" />
              <div className="relative z-10">
                <div className="w-24 h-24 bg-white p-1 rounded-3xl mx-auto shadow-lg mb-4">
                  <div className="w-full h-full bg-slate-100 rounded-[1.2rem] flex items-center justify-center text-indigo-600 font-black text-3xl">
                    {user?.username?.charAt(0).toUpperCase()}
                  </div>
                </div>
                <h2 className="text-2xl font-black text-slate-800">
                  {user?.username}
                </h2>
                <span className="inline-block px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest mt-2 border border-indigo-100">
                  Verified {user?.role}
                </span>
              </div>

              <div className="mt-10 space-y-4 text-left">
                <InfoRow
                  icon={<Mail size={16} />}
                  label="Email Address"
                  value={user?.email}
                />
                <InfoRow
                  icon={<Shield size={16} />}
                  label="Permission Tier"
                  value={user?.role?.toUpperCase()}
                />
                <InfoRow
                  icon={<Calendar size={16} />}
                  label="Registry Date"
                  value={new Date(user?.createdAt).toLocaleDateString()}
                />
              </div>
            </div>

            <div className="bg-indigo-900 text-white p-8 rounded-[2.5rem] shadow-2xl shadow-indigo-100">
              <div className="flex items-center gap-3 mb-4">
                <Activity size={20} className="text-indigo-300" />
                <h3 className="text-xs font-black uppercase tracking-widest opacity-70">
                  Platform Activity
                </h3>
              </div>
              <div className="space-y-4">
                {activity.length > 0 ? (
                  activity.map((act, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm">
                      <CheckCircle size={14} className="text-emerald-400" />
                      <span className="font-medium opacity-90">
                        Completed {act.subject} module
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs opacity-50 italic">
                    No recent sessions recorded.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: Security Panel */}
          <div className="xl:col-span-2 space-y-8">
            <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100">
              <div className="flex items-center gap-3 mb-8">
                <div className="bg-orange-100 p-3 rounded-2xl text-orange-600">
                  <Key size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-800">
                    Security Credentials
                  </h3>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                    Update your system password
                  </p>
                </div>
              </div>

              <form
                onSubmit={handlePasswordChange}
                className="space-y-6 max-w-lg"
              >
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">
                    Current Password
                  </label>
                  <div className="relative">
                    <Lock
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
                      size={18}
                    />
                    <input
                      type="password"
                      required
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none transition font-medium"
                      value={passData.currentPassword}
                      onChange={(e) =>
                        setPassData({
                          ...passData,
                          currentPassword: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">
                      New Password
                    </label>
                    <input
                      type="password"
                      required
                      className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none transition font-medium"
                      value={passData.newPassword}
                      onChange={(e) =>
                        setPassData({
                          ...passData,
                          newPassword: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">
                      Confirm New
                    </label>
                    <input
                      type="password"
                      required
                      className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none transition font-medium"
                      value={passData.confirmPassword}
                      onChange={(e) =>
                        setPassData({
                          ...passData,
                          confirmPassword: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <button
                  disabled={loading}
                  className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all flex items-center gap-3 disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    "Save Security Settings"
                  )}
                </button>
              </form>
            </div>

            <div className="bg-red-50 border border-red-100 p-8 rounded-[2.5rem] flex items-center justify-between">
              <div>
                <h4 className="text-red-900 font-black text-sm uppercase tracking-widest">
                  Danger Zone
                </h4>
                <p className="text-red-700 text-sm font-medium mt-1">
                  Permanently deactivate your academic account
                </p>
              </div>
              <button className="bg-white text-red-600 px-6 py-2 rounded-xl font-bold border border-red-200 hover:bg-red-600 hover:text-white transition-colors text-xs">
                Deactivate Account
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const InfoRow = ({ icon, label, value }) => (
  <div className="flex items-center gap-4 group">
    <div className="text-slate-300 group-hover:text-indigo-500 transition-colors">
      {icon}
    </div>
    <div>
      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
        {label}
      </p>
      <p className="text-sm font-bold text-slate-700">{value || "N/A"}</p>
    </div>
  </div>
);

export default Profile;
