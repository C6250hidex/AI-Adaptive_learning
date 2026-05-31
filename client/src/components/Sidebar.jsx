import { useState } from "react";
import {
  Brain,
  Users,
  BookOpen,
  PlusSquare,
  BarChart3,
  LogOut,
  Search,
  ShieldCheck,
  GraduationCap,
  Settings,
  Menu,
  X,
  LayoutDashboard,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false); // Mobile toggle state
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    toast.success("Securely logged out. See you soon!", {
      icon: "👋",
      style: { borderRadius: "15px", background: "#1e293b", color: "#fff" },
    });
    navigate("/", { replace: true });
  };

  const menuItems = {
    admin: [
      {
        icon: <LayoutDashboard size={20} />,
        label: "Site Overview",
        path: "/admin-dashboard",
      },
      {
        icon: <Users size={20} />,
        label: "User Management",
        path: "/admin/users",
      },
      {
        icon: <BookOpen size={20} />,
        label: "Manage Subjects",
        path: "/admin/subjects",
      },
      {
        icon: <BarChart3 size={20} />,
        label: "Global Analytics",
        path: "/admin-analytics",
      },
      { icon: <Settings size={20} />, label: "Settings", path: "/profile" },
    ],
    teacher: [
      {
        icon: <LayoutDashboard size={20} />,
        label: "My Dashboard",
        path: "/teacher-dashboard",
      },
      {
        icon: <PlusSquare size={20} />,
        label: "Add Questions",
        path: "/teacher/questions",
      },
      {
        icon: <BarChart3 size={20} />,
        label: "Student Results",
        path: "/teacher/results",
      },
      { icon: <Settings size={20} />, label: "Settings", path: "/profile" },
    ],
    student: [
      {
        icon: <LayoutDashboard size={20} />,
        label: "My Progress",
        path: "/student-dashboard",
      },
      {
        icon: <Search size={20} />,
        label: "Search Courses",
        path: "/student/search",
      },
      { icon: <Brain size={20} />, label: "Take Exam", path: "/exam" },
      { icon: <Settings size={20} />, label: "Settings", path: "/profile" },
    ],
  };

  const currentMenu = menuItems[user?.role] || [];

  const toggleSidebar = () => setIsOpen(!isOpen);

  // Helper to handle navigation on mobile (closes sidebar after click)
  const navTo = (path) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <>
      {/* MOBILE HAMBURGER BUTTON - Only visible on small screens */}
      <div className="lg:hidden fixed top-4 left-4 z-[100]">
        <button
          onClick={toggleSidebar}
          className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg hover:bg-indigo-700 transition-all"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* BACKDROP - Dims the screen when sidebar is open on mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[80] lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* MAIN SIDEBAR CONTAINER */}
      <aside
        className={`
        fixed lg:sticky top-0 left-0 z-[90]
        h-screen w-72 bg-slate-950 text-slate-400 
        flex flex-col border-r border-slate-800 
        transition-all duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}
      >
        {/* Brand Identity */}
        <div
          onClick={() => navTo(`/${user?.role}-dashboard`)}
          className="p-8 flex items-center gap-3 text-white border-b border-slate-900 cursor-pointer group"
        >
          <div className="bg-indigo-600 p-2.5 rounded-xl shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform">
            <Brain size={24} className="text-white" />
          </div>
          <div>
            <span className="font-black text-xl tracking-tighter block leading-none">
              ADAPTIVE
            </span>
            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">
              Learning AI
            </span>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
          <p className="px-4 text-[10px] font-black text-slate-600 uppercase tracking-widest mb-4">
            Main Menu
          </p>
          {currentMenu.map((item) => (
            <button
              key={item.path}
              onClick={() => navTo(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-200 group ${
                location.pathname === item.path
                  ? "bg-indigo-600 text-white shadow-xl shadow-indigo-600/20"
                  : "hover:bg-slate-900 hover:text-slate-100"
              }`}
            >
              <div
                className={`${location.pathname === item.path ? "text-white" : "text-slate-500 group-hover:text-indigo-400"} transition-colors`}
              >
                {item.icon}
              </div>
              <span className="font-bold text-sm">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* User Session Footer */}
        <div className="p-4 border-t border-slate-900">
          <div className="mb-6 px-4 py-4 bg-slate-900/50 rounded-[1.5rem] border border-slate-800/50 shadow-inner">
            <div className="flex items-center gap-3 mb-1">
              {user?.role === "admin" ? (
                <ShieldCheck size={14} className="text-red-500" />
              ) : (
                <GraduationCap size={14} className="text-indigo-400" />
              )}
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">
                {user?.role} Account
              </p>
            </div>
            <p className="text-sm font-bold text-slate-100 truncate">
              {user?.username}
            </p>
            <p className="text-[10px] text-slate-500 truncate font-medium">
              {user?.email}
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-500 hover:bg-red-500/10 hover:text-red-500 transition-all duration-200 font-bold text-sm"
          >
            <LogOut size={18} /> <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
