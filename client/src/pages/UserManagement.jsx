import { useEffect, useState, useMemo } from "react";
import API from "../api/axios";
import Sidebar from "../components/Sidebar";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext"; // 1. Live Identity Integration
import {
  UserCog,
  Trash2,
  Search,
  Filter,
  Mail,
  ShieldAlert,
  Calendar,
  UserPlus,
  UserMinus,
} from "lucide-react";

const UserManagement = () => {
  const { user: currentUser } = useAuth(); // 2. Identify the active Admin
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("All");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // 3. Fetch full registry from MySQL
      const { data } = await API.get("/admin/users");
      setUsers(data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Cloud registry sync failed");
    } finally {
      setLoading(false);
    }
  };

  const updateRole = async (userId, newRole) => {
    const loadingToast = toast.loading(`Provisioning ${newRole} access...`);
    try {
      await API.put(`/admin/users/${userId}`, { role: newRole });
      toast.success("Role committed to database!", { id: loadingToast });
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Database update rejected", { id: loadingToast });
    }
  };

  const deleteUser = async (id, username) => {
    if (
      window.confirm(`PERMANENT ACTION: Purge ${username} from the system?`)
    ) {
      try {
        await API.delete(`/admin/users/${id}`);
        toast.success("Identity purged successfully");
        fetchUsers();
      } catch (err) {
        toast.error(err.response?.data?.message || "Access denied or record locked");
      }
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = filterRole === "All" || u.role === filterRole;
      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, filterRole]);

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <Sidebar />

      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">
              Access Control
            </h1>
            <p className="text-slate-500 font-medium mt-1">
              Registry Authority:{" "}
              <span className="text-indigo-600 font-bold">
                {currentUser?.username}
              </span>
            </p>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="bg-indigo-50 p-2 rounded-lg text-indigo-600">
              <UserCog size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
                Total Registry
              </p>
              <p className="text-xl font-black text-slate-800">
                {users.length} Users
              </p>
            </div>
          </div>
        </header>

        {/* Professional Search Toolbar */}
        <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-white mb-10 flex flex-col lg:flex-row gap-6 items-center">
          <div className="relative flex-1 w-full group">
            <Search
              className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors"
              size={20}
            />
            <input
              type="text"
              placeholder="Query by name or academic email..."
              className="w-full pl-14 pr-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 outline-none transition shadow-inner"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3 w-full lg:w-auto">
            <Filter size={18} className="text-slate-400" />
            <select
              className="bg-slate-50 border-none rounded-2xl px-8 py-4 text-xs font-black uppercase tracking-widest text-slate-600 outline-none w-full shadow-inner cursor-pointer"
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
            >
              <option value="All">All Identities</option>
              <option value="student">🎓 Students</option>
              <option value="teacher">👨‍🏫 Lecturers</option>
              <option value="admin">🛡️ Admins</option>
            </select>
          </div>
        </div>

        {/* User Registry Table */}
        <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                <tr>
                  <th className="p-8">Verified Identity</th>
                  <th className="p-8">Permission Tier</th>
                  <th className="p-8">Joined Date</th>
                  <th className="p-8 text-right">System Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan="4" className="p-8">
                        <div className="h-12 bg-slate-50 rounded-2xl"></div>
                      </td>
                    </tr>
                  ))
                ) : filteredUsers.length > 0 ? (
                  filteredUsers.map((u) => (
                    <tr
                      key={u.id}
                      className={`hover:bg-slate-50/50 transition-colors ${u.id === currentUser?.id ? "bg-indigo-50/30" : ""}`}
                    >
                      <td className="p-8">
                        <div className="flex items-center gap-5">
                          <div
                            className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black shadow-inner ${u.role === "admin" ? "bg-indigo-600 text-white" : "bg-white border border-slate-200 text-slate-400"}`}
                          >
                            {u.username.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-black text-slate-800 text-lg leading-none mb-1">
                              {u.username}{" "}
                              {u.id === currentUser?.id && (
                                <span className="text-[10px] text-indigo-500 ml-2 italic">
                                  (You)
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
                              <Mail size={12} /> {u.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-8">
                        <span
                          className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase border tracking-widest ${
                            u.role === "admin"
                              ? "bg-red-50 text-red-600 border-red-100"
                              : u.role === "teacher"
                                ? "bg-indigo-50 text-indigo-600 border-indigo-100"
                                : "bg-slate-50 text-slate-500 border-slate-200"
                          }`}
                        >
                          <div
                            className={`w-1.5 h-1.5 rounded-full ${u.role === "admin" ? "bg-red-500" : u.role === "teacher" ? "bg-indigo-500" : "bg-slate-400"}`}
                          />
                          {u.role}
                        </span>
                      </td>
                      <td className="p-8">
                        <div className="flex items-center gap-2 text-slate-400 font-bold text-xs">
                          <Calendar size={14} />{" "}
                          {new Date(u.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="p-8">
                        <div className="flex justify-end gap-3">
                          {u.id !== currentUser?.id && u.role !== "admin" ? (
                            <>
                              <button
                                onClick={() =>
                                  updateRole(
                                    u.id,
                                    u.role === "teacher"
                                      ? "student"
                                      : "teacher",
                                  )
                                }
                                className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-5 py-2.5 rounded-xl transition shadow-lg ${
                                  u.role === "teacher"
                                    ? "bg-slate-900 text-white hover:bg-slate-700"
                                    : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100"
                                }`}
                              >
                                {u.role === "teacher" ? (
                                  <UserMinus size={14} />
                                ) : (
                                  <UserPlus size={14} />
                                )}
                                {u.role === "teacher" ? "Demote" : "Promote"}
                              </button>
                              <button
                                onClick={() => deleteUser(u.id, u.username)}
                                className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                              >
                                <Trash2 size={20} />
                              </button>
                            </>
                          ) : (
                            <div className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 rounded-xl text-slate-400 text-[10px] font-black uppercase tracking-widest opacity-50">
                              <ShieldAlert size={14} /> Protected Identity
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="p-32 text-center">
                      <div className="flex flex-col items-center opacity-10">
                        <UserCog size={80} />
                        <p className="mt-4 font-black uppercase tracking-[0.5em] text-xs">
                          Registry Empty
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserManagement;
