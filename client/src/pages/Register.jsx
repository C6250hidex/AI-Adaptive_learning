import React, { useState } from "react";
import toast from "react-hot-toast";
import API from "../api/axios";
import { useNavigate, Link } from "react-router-dom";
import {
  Brain,
  User,
  Mail,
  Lock,
  ShieldCheck,
  ArrowRight,
  Loader2,
} from "lucide-react";

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "student", // Default role
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // 1. Prepare data
    const payload = {
      username: formData.username.trim(),
      email: formData.email.toLowerCase().trim(),
      password: formData.password,
      role: formData.role.toLowerCase(),
    };

    // 2. Pass the PENDING promise to toast.promise (NO AWAIT HERE)
    const registerPromise = API.post("/auth/register", payload);

    toast.promise(registerPromise, {
      loading: "Syncing with Render Cloud Database...",
      success: (res) => {
        setLoading(false);
        setTimeout(() => navigate("/login"), 2000);
        return "Success! Academic profile indexed.";
      },
      error: (err) => {
        setLoading(false);
        // This will now show the REAL error from Postgres (e.g. 'Email already in use')
        return (
          err.response?.data?.message || "Verify your connection and data."
        );
      },
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md">
        {/* Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-200 mb-4">
            <Brain className="text-white" size={28} />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Join AdaptiveAI
          </h1>
          <p className="text-slate-500 font-medium text-sm">
            Empowering personalized education
          </p>
        </div>

        <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-xl shadow-slate-200 border border-white">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username Field */}
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest block mb-1">
                Full Name
              </label>
              <div className="relative">
                <User
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  className="w-full p-4 pl-12 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-400 outline-none transition text-sm font-medium"
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest block mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <input
                  type="email"
                  required
                  placeholder="email@institution.edu"
                  className="w-full p-4 pl-12 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-400 outline-none transition text-sm font-medium"
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest block mb-1">
                Security Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full p-4 pl-12 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-400 outline-none transition text-sm font-medium"
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Role Selection - NO ADMIN HERE */}
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest block mb-1">
                Account Role
              </label>
              <div className="relative">
                <ShieldCheck
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <select
                  className="w-full p-4 pl-12 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-400 outline-none transition text-sm font-bold appearance-none cursor-pointer"
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                >
                  <option value="student">🎓 I am a Student</option>
                  <option value="teacher">👨‍🏫 I am a Teacher / Lecturer</option>
                </select>
              </div>
            </div>

            <button
              disabled={loading}
              className="w-full bg-indigo-600 text-white p-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 mt-4"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  Create Account <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-slate-500 font-medium">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-indigo-600 font-bold hover:underline"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
