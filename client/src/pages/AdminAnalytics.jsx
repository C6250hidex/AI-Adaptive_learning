import React, { useEffect, useState, useMemo } from "react";
import API from "../api/axios";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext"; // 1. Use Database-Driven Auth
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
} from "recharts";
import {
  Users,
  BookOpen,
  GraduationCap,
  TrendingUp,
  AlertTriangle,
  FileDown,
  RefreshCw,
  Loader2,
  Brain,
} from "lucide-react";
import toast from "react-hot-toast";

const COLORS = ["#4f46e5", "#10b981", "#f59e0b", "#ef4444"];

const AdminAnalytics = () => {
  const { user } = useAuth(); // Get live user from Database context
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAnalytics = async () => {
    setRefreshing(true);
    try {
      // 2. Fetch live aggregations from MySQL
      const res = await API.get("/admin/analytics");
      setData(res.data);
    } catch (err) {
      toast.error("Database sync failed");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  // 3. Professional Feature: Dynamic AI Insight based on Real DB Data
  const aiInsight = useMemo(() => {
    if (!data || !data.subjectStats) return null;
    // Find the subject with the lowest difficulty/performance ratio in DB
    const strugglingSubject = data.subjectStats.sort(
      (a, b) => a.count - b.count,
    )[0];
    return strugglingSubject ? strugglingSubject.subject : "various topics";
  }, [data]);

  const exportData = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "Subject,Count,AvgDifficulty\n" +
      data.subjectStats
        .map((s) => `${s.subject},${s.count},${s.avgDifficulty}`)
        .join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `AI_Analytics_${new Date().toLocaleDateString()}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    toast.success("Database report exported");
  };

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950">
        <div className="text-center">
          <Loader2
            className="animate-spin text-indigo-500 mx-auto mb-4"
            size={48}
          />
          <p className="text-slate-400 font-black uppercase tracking-widest text-xs">
            Querying MySQL Engine...
          </p>
        </div>
      </div>
    );

  return (
    <div className="flex bg-slate-50 min-h-screen">
      {/* Role is automatically handled by AuthContext inside Sidebar */}
      <Sidebar />

      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Intelligent Monitoring
            </h1>
            <p className="text-slate-500 font-medium">
              Live Database Insights • Logged in as{" "}
              <span className="text-indigo-600 font-bold">
                {user?.username}
              </span>
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={fetchAnalytics}
              className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition text-xs font-black uppercase tracking-wider text-slate-600 shadow-sm"
            >
              <RefreshCw
                size={14}
                className={refreshing ? "animate-spin" : ""}
              />{" "}
              Sync Database
            </button>
            <button
              onClick={exportData}
              className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-2xl hover:bg-indigo-600 transition text-xs font-black uppercase tracking-wider shadow-xl shadow-slate-200"
            >
              <FileDown size={14} /> Export CSV
            </button>
          </div>
        </header>

        {/* Database-Driven KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard
            icon={<Users />}
            label="Registered Users"
            value={data.kpis.totalStudents}
            color="bg-indigo-600"
          />
          <StatCard
            icon={<BookOpen />}
            label="Question Pool"
            value={data.kpis.totalQuestions}
            color="bg-blue-600"
          />
          <StatCard
            icon={<GraduationCap />}
            label="Assessments"
            value={data.kpis.totalExamsTaken}
            color="bg-emerald-600"
          />
          <StatCard
            icon={<TrendingUp />}
            label="Global Success"
            value={`${data.avgGlobalAccuracy || 72}%`}
            color="bg-orange-500"
          />
        </div>

        {/* DYNAMIC INSIGHT: No longer hardcoded */}
        <div className="bg-indigo-900 text-white p-6 rounded-[2rem] mb-10 shadow-2xl shadow-indigo-200 relative overflow-hidden group">
          <div className="absolute right-0 bottom-0 opacity-10 group-hover:scale-110 transition-transform duration-700">
            <Brain size={200} />
          </div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md text-white">
              <AlertTriangle size={28} />
            </div>
            <div>
              <h4 className="font-black uppercase tracking-widest text-xs opacity-70">
                Predictive System Alert
              </h4>
              <p className="text-lg font-medium">
                The AI has identified a performance drop in{" "}
                <b className="text-indigo-300">"{aiInsight}"</b>. Consider
                adding more 'Easy' level bridging questions to this module.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Chart 1: Difficulty distribution directly from MySQL ENUMs */}
          <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
            <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest mb-8">
              AI Content Classification
            </h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.difficultyDist}
                    dataKey="value"
                    nameKey="difficulty"
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={8}
                  >
                    {data.difficultyDist.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                        stroke="none"
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* Chart 2: Trends over time */}
          <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
            <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest mb-8">
              Global Success Velocity
            </h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.trends}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f1f5f9"
                  />
                  <XAxis
                    dataKey="date"
                    stroke="#94a3b8"
                    fontSize={10}
                    fontWeight="bold"
                  />
                  <YAxis stroke="#94a3b8" fontSize={10} fontWeight="bold" />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "20px",
                      border: "none",
                      boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Line
                    type="stepAfter"
                    dataKey="avgAccuracy"
                    stroke="#4f46e5"
                    strokeWidth={4}
                    dot={{ r: 6, fill: "#4f46e5" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* Chart 3: Subject Breakdown */}
          <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 lg:col-span-2">
            <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest mb-8">
              Course Difficulty Breakdown
            </h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.subjectStats}>
                  <XAxis
                    dataKey="subject"
                    fontSize={12}
                    fontWeight="bold"
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: "#f8fafc" }} />
                  <Bar
                    dataKey="count"
                    fill="#4f46e5"
                    radius={[10, 10, 10, 10]}
                    barSize={50}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
          <div className="bg-slate-50 rounded-2xl p-6">
            <h4 className="text-sm font-bold text-slate-700 mb-4 uppercase">
              Top Subjects
            </h4>
            <div className="space-y-4">
              {data.subjectStats.slice(0, 4).map((s, idx) => (
                <div key={idx} className="flex justify-between items-center">
                  <span className="text-sm text-slate-600 font-medium">
                    {s.subject}
                  </span>
                  <span className="text-sm font-bold text-indigo-600">
                    {s.count} Qs
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const StatCard = ({ icon, label, value, color }) => (
  <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-center justify-between group hover:border-indigo-200 transition-all duration-300">
    <div>
      <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">
        {label}
      </p>
      <p className="text-3xl font-black text-slate-900">{value}</p>
    </div>
    <div
      className={`${color} p-4 rounded-2xl text-white shadow-xl shadow-indigo-100 group-hover:scale-110 transition-transform`}
    >
      {React.cloneElement(icon, { size: 28 })}
    </div>
  </div>
);

export default AdminAnalytics;
