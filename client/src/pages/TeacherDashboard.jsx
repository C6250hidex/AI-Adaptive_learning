import { useState, useEffect, useMemo } from "react";
import Sidebar from "../components/Sidebar";
import {
  PlusCircle,
  FileText,
  Users,
  BarChart3,
  TrendingUp,
  AlertCircle,
  Brain,
  Loader2,
  CheckCircle,
  ArrowUpRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [stats, setStats] = useState({
    questions: 0,
    students: 0,
    avgScore: 0,
  });
  const [recentResults, setRecentResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeacherInsights = async () => {
      try {
        // 1. Parallel Database Queries
        // We use /exams/history/all because teachers need to see EVERY student
        const [qRes, rRes] = await Promise.all([
          API.get("/questions"),
          API.get("/exams/history/all"),
        ]);

        const totalQs = qRes.data.questions
          ? qRes.data.questions.length
          : qRes.data.length;
        const results = rRes.data;

        // 2. Real-time Data Mining
        const avg =
          results.length > 0
            ? (
                results.reduce((acc, curr) => acc + curr.accuracy, 0) /
                results.length
              ).toFixed(1)
            : 0;

        setStats({
          questions: totalQs,
          students: [...new Set(results.map((r) => r.userId))].length,
          avgScore: avg,
        });

        setRecentResults(results.slice(0, 5));
      } catch (err) {
        toast.error("Cloud synchronization failed. Check database connection.");
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchTeacherInsights();
  }, [user]);

  const aiAlert = useMemo(() => {
    if (stats.avgScore === 0) return null;
    if (stats.avgScore < 60)
      return "DIFFICULTY ALERT: Accuracy below benchmark. Review your 'Hard' tagged questions.";
    return "STABILITY: Your module is well-balanced. Student progression is optimal.";
  }, [stats.avgScore]);

  if (loading)
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-slate-950">
        <Loader2 className="animate-spin text-indigo-500 mb-4" size={48} />
        <p className="text-slate-500 font-black text-[10px] uppercase tracking-[0.3em]">
          Querying AI Insights...
        </p>
      </div>
    );

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <Sidebar />
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">
              Lecturer Intelligence
            </h1>
            <p className="text-slate-500 font-medium mt-1 italic">
              Logged in as{" "}
              <span className="text-indigo-600 font-bold">
                {user?.username}
              </span>{" "}
              • Identity Verified
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate("/teacher/questions")}
              className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition shadow-xl shadow-indigo-100 flex items-center gap-2"
            >
              <PlusCircle size={16} /> New Entry
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          <StatCard
            icon={<FileText size={24} />}
            label="Question Bank"
            value={stats.questions}
            color="text-indigo-600"
            bg="bg-indigo-50"
          />
          <StatCard
            icon={<Users size={24} />}
            label="Active Students"
            value={stats.students}
            color="text-blue-600"
            bg="bg-blue-50"
          />
          <StatCard
            icon={<TrendingUp size={24} />}
            label="Avg. Mastery"
            value={`${stats.avgScore}%`}
            color="text-emerald-600"
            bg="bg-emerald-50"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 relative overflow-hidden">
            <div className="flex justify-between items-center mb-10">
              <div>
                <h3 className="text-2xl font-black text-slate-800 tracking-tight leading-none">
                  Live Performance Feed
                </h3>
                <p className="text-slate-400 text-xs font-bold uppercase mt-2 tracking-widest">
                  Real-time student submissions
                </p>
              </div>
              <ArrowUpRight size={24} className="text-slate-200" />
            </div>

            <div className="space-y-5">
              {recentResults.length > 0 ? (
                recentResults.map((res) => (
                  <div
                    key={res.id}
                    className="flex items-center justify-between p-5 bg-slate-50 rounded-[1.5rem] group hover:bg-indigo-50 transition-all cursor-default"
                  >
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-indigo-600 font-black shadow-sm transition-transform">
                        {/* Access the joined user data correctly (lowercase 'user') */}
                        {res.user?.username?.charAt(0).toUpperCase() || "S"}
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-800">
                          {res.user?.username || "Student ID " + res.userId}
                        </p>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">
                          {res.subject || "General Track"} •{" "}
                          {new Date(res.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div
                      className={`px-4 py-2 rounded-xl text-xs font-black tracking-widest border ${res.accuracy >= 70 ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-orange-50 text-orange-600 border-orange-100"}`}
                    >
                      {res.accuracy}% ACC
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-20 text-center flex flex-col items-center opacity-20">
                  <Users size={60} className="mb-4" />
                  <p className="font-black uppercase tracking-[0.3em] text-xs">
                    Monitoring Active: No Submissions found
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-indigo-950 text-white p-8 rounded-[3rem] shadow-2xl shadow-indigo-100 relative overflow-hidden group">
              <div className="absolute right-0 top-0 p-8 opacity-10 group-hover:rotate-12 transition-transform duration-500">
                <Brain size={100} />
              </div>

              <div className="flex items-center gap-3 mb-8">
                <div className="bg-white/10 p-2 rounded-lg">
                  <Brain size={20} className="text-indigo-300" />
                </div>
                <h3 className="text-[10px] font-black uppercase tracking-widest text-indigo-300">
                  AI Decision Center
                </h3>
              </div>

              <div className="space-y-6">
                {aiAlert?.includes("ALERT") ? (
                  <div className="bg-red-500/10 border border-red-500/20 p-5 rounded-2xl">
                    <div className="flex items-center gap-2 text-red-400 font-black text-[10px] mb-2 uppercase tracking-widest">
                      <AlertCircle size={14} /> System Intervention
                    </div>
                    <p className="text-xs text-red-100 leading-relaxed font-medium">
                      {aiAlert}
                    </p>
                  </div>
                ) : (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 p-5 rounded-2xl">
                    <div className="flex items-center gap-2 text-emerald-400 font-black text-[10px] mb-2 uppercase tracking-widest">
                      <CheckCircle size={14} /> Logic Optimized
                    </div>
                    <p className="text-xs text-emerald-100 leading-relaxed font-medium">
                      {aiAlert || "Evaluating student engagement levels..."}
                    </p>
                  </div>
                )}

                <div className="pt-6 border-t border-white/10">
                  <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-4">
                    Recommended Action
                  </p>
                  <button
                    onClick={() => navigate("/teacher/questions")}
                    className="w-full py-4 bg-white text-indigo-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-50 transition-colors"
                  >
                    Balance Knowledge Bank
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm text-center">
              <BarChart3 size={32} className="mx-auto text-slate-200 mb-4" />
              <h4 className="font-bold text-slate-800 text-sm">
                Knowledge Coverage
              </h4>
              <p className="text-slate-400 text-xs mt-2 leading-relaxed">
                Your subject modules are active and indexed for {stats.students}{" "}
                verified students.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const StatCard = ({ icon, label, value, color, bg }) => (
  <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex items-center gap-6 hover:shadow-xl hover:translate-y-[-5px] transition-all duration-300">
    <div className={`${bg} ${color} p-5 rounded-3xl shadow-inner`}>{icon}</div>
    <div>
      <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">
        {label}
      </p>
      <p className="text-2xl font-black text-slate-900 leading-none">{value}</p>
    </div>
  </div>
);

export default TeacherDashboard;
