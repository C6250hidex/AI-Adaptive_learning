import React, { useState, useEffect, useMemo } from "react";
import {
  Award,
  Clock,
  ChevronRight,
  Brain,
  Target,
  TrendingUp,
  Search,
  ArrowRight,
  Loader2,
  BookMarked,
  Sparkles,
} from "lucide-react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";
import Leaderboard from "../components/Leaderboard"; // social ranking component
import toast from "react-hot-toast";

const StudentDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) return; // Wait until user is verified
      try {
        const { data } = await API.get(`/exams/history`);
        console.log("📊 History fetched:", data.length, "records");
        setStats(data);
      } catch (err) {
        toast.error("Dashboard fetch error");
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) fetchHistory();
  }, [user, authLoading]);

  // Logic for Horizontal Progress Bars
  const subjectAnalysis = useMemo(() => {
    const map = {};
    stats.forEach((s) => {
      if (!map[s.subject]) map[s.subject] = { total: 0, count: 0 };
      map[s.subject].total += s.accuracy;
      map[s.subject].count += 1;
    });
    return Object.keys(map).map((sub) => ({
      name: sub,
      score: (map[sub].total / map[sub].count).toFixed(0),
    }));
  }, [stats]);

  const analytics = useMemo(() => {
    if (stats.length === 0)
      return {
        avg: 0,
        rank: "Awaiting Data",
        total: 0,
        weakestSubject: "None",
      };

    const avg = (
      stats.reduce((acc, curr) => acc + curr.accuracy, 0) / stats.length
    ).toFixed(1);
    const subjectGrades = stats.reduce((acc, curr) => {
      acc[curr.subject] = (acc[curr.subject] || 0) + curr.accuracy;
      return acc;
    }, {});
    const weakest = Object.keys(subjectGrades).reduce((a, b) =>
      subjectGrades[a] < subjectGrades[b] ? a : b,
    );

    let rank = "Beginner";
    if (avg >= 85) rank = "Elite Scholar";
    else if (avg >= 60) rank = "Core Specialist";

    return { avg, rank, total: stats.length, weakestSubject: weakest };
  }, [stats]);

  const getRecommendations = () => {
    if (stats.length === 0)
      return "The AI tutor is ready. Start your first session to map your learning path.";
    if (analytics.avg < 50)
      return `AI ALERT: Your performance in "${analytics.weakestSubject}" is below threshold. Focus on 'Easy' level modules.`;
    return `AI INSIGHT: You are showing high velocity in "${stats[0]?.subject || "General"}". The system is now unlocking 'Hard' complexity challenges.`;
  };

  const startRecommendedSession = () => {
    let startLevel = "Medium";
    if (analytics.avg < 50) startLevel = "Easy";
    if (analytics.avg > 80) startLevel = "Hard";
    navigate("/exam", { state: { initialDifficulty: startLevel } });
  };

  if (loading)
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-slate-950">
        <Loader2 className="animate-spin text-indigo-500 mb-4" size={48} />
        <p className="text-slate-500 font-black text-[10px] uppercase tracking-[0.3em]">
          Syncing Progress...
        </p>
      </div>
    );

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar role="student" />

      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter">
              Student Overview
            </h1>
            <p className="text-slate-500 font-medium">
              Hello,{" "}
              <span className="text-indigo-600 font-bold">
                {user?.username}
              </span>
              . Your AI track is active.
            </p>
          </div>
          <button
            onClick={() => navigate("/student/search")}
            className="group flex items-center gap-3 bg-slate-900 text-white px-8 py-4 rounded-[1.5rem] font-bold hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200"
          >
            <Search size={18} /> Discover Subjects{" "}
            <ArrowRight
              className="group-hover:translate-x-1 transition-transform"
              size={18}
            />
          </button>
        </header>

        {/* KPI Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard
            icon={<Target size={22} />}
            label="Avg. Accuracy"
            value={`${analytics.avg}%`}
            color="text-indigo-600"
            bg="bg-indigo-50"
          />
          <StatCard
            icon={<BookMarked size={22} />}
            label="Tracks Done"
            value={analytics.total}
            color="text-blue-600"
            bg="bg-blue-50"
          />
          <StatCard
            icon={<Award size={22} />}
            label="Global Rank"
            value={analytics.rank}
            color="text-emerald-600"
            bg="bg-emerald-50"
          />
          <StatCard
            icon={<TrendingUp size={22} />}
            label="Velocity"
            value={analytics.total > 0 ? "+12%" : "0%"}
            color="text-orange-600"
            bg="bg-orange-50"
          />
        </div>

        {/* AI Banner */}
        <div className="bg-indigo-900 text-white p-8 rounded-[2.5rem] mb-12 shadow-2xl shadow-indigo-200 relative overflow-hidden group">
          <div className="absolute right-0 top-0 p-10 opacity-10 group-hover:scale-125 transition-transform duration-1000">
            <Brain size={120} />
          </div>
          <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
            <div className="bg-white/10 p-5 rounded-3xl backdrop-blur-md">
              <Brain size={42} className="text-indigo-300" />
            </div>
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-300 mb-2">
                Adaptive Recommendation
              </h3>
              <p className="text-xl font-medium leading-relaxed max-w-2xl">
                {getRecommendations()}
              </p>
            </div>
            <button
              onClick={startRecommendedSession}
              className="md:ml-auto whitespace-nowrap bg-white text-indigo-900 px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-50 transition-colors"
            >
              Start Session
            </button>
          </div>
        </div>

        {/* ROW 1: Progression & Leaderboard */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
          <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                <TrendingUp size={20} className="text-indigo-600" /> Knowledge
                progression
              </h3>
            </div>
            <div className="h-[300px] w-full overflow-hidden">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.slice().reverse()}>
                  <defs>
                    <linearGradient
                      id="progGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f1f5f9"
                  />
                  <XAxis dataKey="createdAt" hide />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: "bold" }}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "24px",
                      border: "none",
                      boxShadow: "0 25px 50px -12px rgb(0 0 0 / 0.1)",
                    }}
                    labelFormatter={(label) =>
                      new Date(label).toLocaleDateString()
                    }
                  />
                  <Area
                    type="monotone"
                    dataKey="accuracy"
                    stroke="#4f46e5"
                    strokeWidth={5}
                    fillOpacity={1}
                    fill="url(#progGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="lg:col-span-1">
            <Leaderboard />
          </div>
        </div>

        {/* ROW 2: Subject Mastery & Session Log */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
            <h3 className="text-xl font-black mb-8 flex items-center gap-2">
              <Sparkles size={20} className="text-indigo-600" /> Subject Mastery
            </h3>
            <div className="space-y-6">
              {subjectAnalysis.length > 0 ? (
                subjectAnalysis.map((sub) => (
                  <div key={sub.name}>
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-2">
                      <span className="text-slate-400">{sub.name}</span>
                      <span className="text-indigo-600">{sub.score}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full">
                      <div
                        className="h-full bg-indigo-600 rounded-full shadow-[0_0_10px_rgba(79,70,229,0.3)]"
                        style={{ width: `${sub.score}%` }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-slate-400 text-xs italic">
                  No subject data available.
                </p>
              )}
            </div>
          </div>

          <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
            <h3 className="text-xl font-black text-slate-800 tracking-tight mb-8">
              Session Log
            </h3>
            <div className="space-y-4">
              {stats.length > 0 ? (
                stats.slice(0, 5).map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-[1.5rem] group hover:bg-indigo-50 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white shadow-xl ${s.accuracy >= 70 ? "bg-indigo-500 shadow-indigo-100" : "bg-orange-500 shadow-orange-100"}`}
                      >
                        {s.score}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-sm leading-none mb-1">
                          {s.subject || "General Track"}
                        </p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          {new Date(s.createdAt).toLocaleDateString()} •{" "}
                          {s.accuracy}% Accuracy
                        </p>
                      </div>
                    </div>
                    <ChevronRight
                      size={16}
                      className="text-slate-300 group-hover:translate-x-1 transition-transform"
                    />
                  </div>
                ))
              ) : (
                <div className="text-center py-10 opacity-20 flex flex-col items-center">
                  <Clock size={48} className="mb-2" />
                  <p className="text-xs font-black uppercase">
                    No activity history
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// Reusable Professional Stat Card
const StatCard = ({ icon, label, value, color, bg }) => (
  <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-center gap-5 hover:border-indigo-100 transition-all duration-300 group">
    <div
      className={`${bg} ${color} p-4 rounded-2xl group-hover:scale-110 transition-transform shadow-inner`}
    >
      {icon}
    </div>
    <div>
      <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">
        {label}
      </p>
      <p className="text-2xl font-black text-slate-900 leading-none">{value}</p>
    </div>
  </div>
);

export default StudentDashboard;
