import { useState, useEffect, useMemo } from "react";
import API from "../api/axios";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext"; // 1. Use Live Database Context
import {
  Search,
  BookOpen,
  Brain,
  Target,
  ArrowRight,
  Loader2,
  Info,
  Sparkles,
  BarChart,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const SubjectSearch = () => {
  const { user } = useAuth(); // 2. Database-verified student identity
  const [subjects, setSubjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const { data } = await API.get("/questions/list-subjects");

        // Professional robust mapping
        const catalog = data.map((item) => {
          // Handle cases where subject might be null or data is nested
          const name =
            item.subject ||
            (item.dataValues && item.dataValues.subject) ||
            "Uncategorized";
          const count =
            item.count || (item.dataValues && item.dataValues.count) || 0;

          return {
            name: name,
            count: count,
            description: `Explore and master ${name} through AI-driven adaptive learning paths.`,
          };
        });

        setSubjects(catalog);
      } catch (err) {
        console.error("Frontend Fetch Error:", err);
        toast.error("Cloud registry is temporarily offline.");
      } finally {
        setLoading(false);
      }
    };
    fetchSubjects();
  }, []);

  // Professional Client-side Search Logic
  const filtered = useMemo(() => {
    return subjects.filter((s) =>
      s.name?.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [subjects, searchTerm]);

  return (
    <div className="flex bg-slate-50 min-h-screen">
      {/* Sidebar is now reactive to the live MySQL session */}
      <Sidebar />

      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter">
              Course Discovery
            </h1>
            <p className="text-slate-500 font-medium mt-1">
              Select an AI-indexed module to begin your adaptive track,{" "}
              <span className="text-indigo-600 font-bold">
                {user?.username}
              </span>
              .
            </p>
          </div>
          <div className="hidden lg:flex items-center gap-2 bg-indigo-50 px-4 py-2 rounded-2xl border border-indigo-100">
            <Sparkles size={16} className="text-indigo-600" />
            <span className="text-[10px] font-black uppercase text-indigo-700 tracking-widest">
              AI Engine Active
            </span>
          </div>
        </header>

        {/* Search Bar - Professional Focus Mode */}
        <div className="relative mb-16 max-w-2xl group">
          <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none transition-colors group-focus-within:text-indigo-600 text-slate-400">
            <Search size={22} />
          </div>
          <input
            type="text"
            placeholder="Filter courses (e.g. Psychology, Microservices...)"
            className="w-full p-6 pl-14 rounded-[2rem] border-none shadow-2xl shadow-slate-200/60 focus:ring-4 focus:ring-indigo-500/10 outline-none text-slate-700 font-bold text-lg transition-all placeholder:text-slate-300"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <Loader2 className="animate-spin text-indigo-600 mb-6" size={48} />
            <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-[10px]">
              Syncing Knowledge Base...
            </p>
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
            {filtered.map((subject, index) => (
              <div
                key={index}
                className="group bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 hover:shadow-2xl hover:shadow-indigo-200/40 hover:-translate-y-3 transition-all duration-500 relative overflow-hidden"
              >
                {/* Visual Accent */}
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Brain size={80} />
                </div>

                <div className="bg-slate-950 w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-white mb-8 shadow-xl group-hover:bg-indigo-600 transition-colors">
                  <BookOpen size={30} />
                </div>

                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center gap-1 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-100">
                    <Target size={10} />
                    <span className="text-[9px] font-black uppercase tracking-tighter">
                      Validated
                    </span>
                  </div>
                  <div className="flex items-center gap-1 bg-slate-50 text-slate-500 px-3 py-1 rounded-full border border-slate-100">
                    <BarChart size={10} />
                    <span className="text-[9px] font-black uppercase tracking-tighter">
                      {subject.count} Questions
                    </span>
                  </div>
                </div>

                <h3 className="text-3xl font-black text-slate-900 mb-4 tracking-tight leading-none group-hover:text-indigo-600 transition-colors">
                  {subject.name}
                </h3>

                <p className="text-slate-500 text-sm font-medium leading-relaxed mb-10 min-h-[4rem]">
                  {subject.description}
                </p>

                <button
                  onClick={() => navigate(`/exam?subject=${subject.name}`)}
                  className="w-full py-5 bg-slate-950 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-4 hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200 group-hover:shadow-indigo-500/20"
                >
                  Initiate Track{" "}
                  <ArrowRight
                    size={18}
                    className="group-hover:translate-x-2 transition-transform"
                  />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white border-4 border-dashed border-slate-100 p-24 rounded-[4rem] text-center max-w-3xl mx-auto shadow-inner">
            <div className="bg-slate-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8">
              <Info size={48} className="text-slate-200" />
            </div>
            <h3 className="text-3xl font-black text-slate-800 mb-3 tracking-tighter">
              Module Not Found
            </h3>
            <p className="text-slate-400 font-medium max-w-sm mx-auto">
              {searchTerm
                ? `The term "${searchTerm}" does not match any AI-validated courses in our current registry.`
                : "The faculty registry is currently empty. Please wait for lecturers to upload modules."}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="mt-10 px-8 py-3 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition"
              >
                Reset Search
              </button>
            )}
          </div>
        )}

        <footer className="mt-20 py-10 border-t border-slate-100 text-center">
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em]">
            Adaptive Learning Intelligence • v1.0
          </p>
        </footer>
      </main>
    </div>
  );
};

export default SubjectSearch;
