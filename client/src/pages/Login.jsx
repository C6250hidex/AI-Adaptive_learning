import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import API from "../api/axios";
import { useNavigate, Link } from "react-router-dom";
import { Brain, Lock, Mail, ArrowRight, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext"; // 1. Import the Auth Hook

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [localLoading, setLocalLoading] = useState(false);
  const navigate = useNavigate();

  // 2. Extract login and user from Context
  const { login, user, loading } = useAuth();

  useEffect(() => {
    // Only redirect AWAY from login if a user is actually found in the DB
    if (!loading && user) {
      const roleRoutes = {
        admin: "/admin-dashboard",
        teacher: "/teacher-dashboard",
        student: "/student-dashboard",
      };
      navigate(roleRoutes[user.role], { replace: true });
    }
  }, [user, loading, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalLoading(true);

    const loginPromise = API.post("/auth/login", formData);

    toast.promise(loginPromise, {
      loading: "Authenticating with AI Server...",
      success: (res) => {
        const { token, user: userData } = res.data;

        // 4. Use Context login (it handles localStorage and state sync automatically)
        login(userData, token);

        setLocalLoading(false);
        return `Identity Verified. Welcome, ${userData.username}!`;
      },
      error: (err) => {
        setLocalLoading(false);
        return (
          err.response?.data?.message ||
          "Invalid credentials. Please try again."
        );
      },
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md">
        {/* Logo / Brand Area */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-200 mb-4">
            <Brain className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            AdaptiveAI
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            Intelligent E-Learning Platform
          </p>
        </div>

        <div className="bg-white p-8 md:p-10 rounded-[2rem] shadow-xl shadow-slate-200 border border-white">
          <h2 className="text-xl font-bold text-slate-800 mb-6 text-center">
            Sign In
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1 block mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <input
                  type="email"
                  placeholder="name@university.edu"
                  required
                  disabled={localLoading}
                  className="w-full p-4 pl-12 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-400 outline-none transition text-sm font-medium"
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-end mb-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1 block">
                  Security Key
                </label>
                <button
                  type="button"
                  className="text-[10px] font-bold text-indigo-600 hover:underline uppercase"
                >
                  Forgot?
                </button>
              </div>
              <div className="relative">
                <Lock
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <input
                  type="password"
                  placeholder="••••••••"
                  required
                  disabled={localLoading}
                  className="w-full p-4 pl-12 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-400 outline-none transition text-sm font-medium"
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
              </div>
            </div>

            <button
              disabled={localLoading}
              className="w-full bg-slate-900 text-white p-4 rounded-2xl font-bold hover:bg-indigo-600 transition-all shadow-lg shadow-slate-200 flex items-center justify-center gap-2"
            >
              {localLoading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  Enter Dashboard <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-50 text-center text-sm text-slate-500">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-indigo-600 font-bold hover:underline"
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
