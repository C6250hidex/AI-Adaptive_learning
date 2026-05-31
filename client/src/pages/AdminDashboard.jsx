import { useState, useEffect, useMemo } from "react";
import toast from "react-hot-toast";
import API from "../api/axios";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext"; // 1. Use Global Database Auth
import {
  PlusCircle,
  Trash2,
  Search,
  Filter,
  AlertCircle,
  Loader2,
  Sparkles,
  Database,
  Bookmark,
  Brain,
} from "lucide-react";

const AdminDashboard = () => {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [prediction, setPrediction] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Filtering State
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState("All");

  const [newQuestion, setNewQuestion] = useState({
    questionText: "",
    optionA: "",
    optionB: "",
    optionC: "",
    optionD: "",
    correctAnswer: "A",
    subject: "",
  });

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const { data } = await API.get(
        `/questions?page=${page}&limit=10&subject=${filterDifficulty !== "All" ? filterDifficulty : ""}&search=${searchTerm}`,
      );

      setQuestions(data.questions); // Use the paginated array
      setTotalPages(data.totalPages);
    } catch (err) {
      toast.error(err.message || "Database connection failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [page, filterDifficulty, searchTerm]);

  // AI Logic: Prediction trigger
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (newQuestion.questionText.length > 15) {
        try {
          const { data } = await API.post("/questions/predict", {
            questionText: newQuestion.questionText,
          });
          setPrediction(data);
        } catch (err) {
          console.error(err);
        }
      } else {
        setPrediction(null);
      }
    }, 1000);
    return () => clearTimeout(delayDebounceFn);
  }, [newQuestion.questionText]);

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    const loadingToast = toast.loading("AI Engine indexing question...");

    try {
      await API.post("/questions", newQuestion);
      toast.success("Question stored in MySQL bank", {
        id: loadingToast,
        icon: "🤖",
      });

      setNewQuestion({
        questionText: "",
        optionA: "",
        optionB: "",
        optionC: "",
        optionD: "",
        correctAnswer: "A",
        subject: "",
      });
      setPrediction(null);
      fetchQuestions();
    } catch (err) {
      toast.error(err.message || "Failed to commit to database", {
        id: loadingToast,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (
      window.confirm(
        "Archive this question? It will be removed from all adaptive exams.",
      )
    ) {
      try {
        await API.delete(`/questions/${id}`);
        toast.success("Question archived");
        fetchQuestions();
      } catch (err) {
        toast.error(err.message || "Deletion failed");
      }
    }
  };

  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      const matchesSearch =
        q.questionText.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.subject.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDiff =
        filterDifficulty === "All" || q.difficulty === filterDifficulty;
      return matchesSearch && matchesDiff;
    });
  }, [questions, searchTerm, filterDifficulty]);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              {user?.role === "admin"
                ? "System Question Bank"
                : "My Lecturer Panel"}
            </h2>
            <p className="text-slate-500 font-medium italic">
              Logged in as{" "}
              <span className="text-indigo-600 font-bold">
                {user?.username}
              </span>{" "}
              • Database Connected
            </p>
          </div>

          <div className="flex gap-4">
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
              <div className="bg-indigo-50 p-2 rounded-lg text-indigo-600">
                <Database size={20} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Repository Size
                </p>
                <p className="text-xl font-black text-slate-800">
                  {questions.length}
                </p>
              </div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* FORM: Left Sticky Panel */}
          <section className="xl:col-span-1">
            <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-white sticky top-8">
              <h3 className="text-lg font-black mb-6 flex items-center gap-2 text-slate-800 uppercase tracking-tight">
                <PlusCircle size={20} className="text-indigo-600" /> Index New
                Question
              </h3>

              <form onSubmit={handleAddQuestion} className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest block mb-2">
                    Problem Statement
                  </label>
                  <textarea
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-400 outline-none transition h-32 text-sm font-medium"
                    value={newQuestion.questionText}
                    onChange={(e) =>
                      setNewQuestion({
                        ...newQuestion,
                        questionText: e.target.value,
                      })
                    }
                    placeholder="Enter technical context or problem..."
                    required
                  />

                  {prediction && (
                    <div className="mt-3 flex items-center justify-between p-4 bg-indigo-900 text-white rounded-2xl shadow-lg animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="flex items-center gap-2 font-bold text-xs">
                        <Sparkles size={14} className="text-indigo-300" /> AI
                        PREDICTION: {prediction.difficulty}
                      </div>
                      <span className="text-[10px] font-black opacity-50">
                        Score: {prediction.score}
                      </span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {["A", "B", "C", "D"].map((opt) => (
                    <input
                      key={opt}
                      type="text"
                      className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium"
                      value={newQuestion[`option${opt}`]}
                      onChange={(e) =>
                        setNewQuestion({
                          ...newQuestion,
                          [`option${opt}`]: e.target.value,
                        })
                      }
                      placeholder={`Choice ${opt}`}
                      required
                    />
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <select
                      className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold outline-none appearance-none cursor-pointer"
                      value={newQuestion.correctAnswer}
                      onChange={(e) =>
                        setNewQuestion({
                          ...newQuestion,
                          correctAnswer: e.target.value,
                        })
                      }
                    >
                      <option value="A">Answer: A</option>
                      <option value="B">Answer: B</option>
                      <option value="C">Answer: C</option>
                      <option value="D">Answer: D</option>
                    </select>
                  </div>
                  <input
                    type="text"
                    className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium"
                    value={newQuestion.subject}
                    onChange={(e) =>
                      setNewQuestion({
                        ...newQuestion,
                        subject: e.target.value,
                      })
                    }
                    placeholder="Subject Tag"
                    required
                  />
                </div>

                <button
                  disabled={isSaving}
                  className="w-full bg-slate-900 text-white p-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-600 transition shadow-2xl shadow-slate-200 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSaving ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    "Commit to Bank"
                  )}
                </button>
              </form>
            </div>
          </section>

          {/* TABLE: Inventory Management */}
          <section className="xl:col-span-2 space-y-6">
            <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 items-center">
              <div className="relative flex-1 w-full">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Filter by keyword or subject..."
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-2xl border-none outline-none text-sm font-medium"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                <Filter
                  size={16}
                  className="text-slate-400 mt-3 hidden md:block"
                />
                <select
                  className="bg-slate-50 border-none rounded-2xl px-6 py-3 text-sm font-bold outline-none w-full"
                  value={filterDifficulty}
                  onChange={(e) => setFilterDifficulty(e.target.value)}
                >
                  <option value="All">All Difficulty</option>
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase font-black tracking-widest">
                  <tr>
                    <th className="p-6">Question Context</th>
                    <th className="p-6">Subject</th>
                    <th className="p-6">AI Metric</th>
                    <th className="p-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {loading ? (
                    <tr>
                      <td colSpan="4" className="p-20 text-center">
                        <Loader2
                          className="animate-spin mx-auto text-indigo-600 mb-2"
                          size={32}
                        />
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                          Syncing MySQL Tables...
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredQuestions.map((q) => (
                      <tr
                        key={q.id}
                        className="hover:bg-slate-50/50 transition group"
                      >
                        <td className="p-6 max-w-md">
                          <p className="text-sm font-bold text-slate-700 line-clamp-1">
                            {q.questionText}
                          </p>
                          <div className="flex gap-2 mt-2">
                            <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-slate-100 text-slate-400 rounded">
                              Key: {q.correctAnswer}
                            </span>
                          </div>
                        </td>
                        <td className="p-6">
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600">
                            <Bookmark size={12} /> {q.subject}
                          </span>
                        </td>
                        <td className="p-6">
                          <div className="flex items-center gap-2 group relative">
                            <span
                              className={`flex items-center gap-1.5 text-[10px] font-black uppercase px-3 py-1 rounded-full border ${
                                q.difficulty === "Hard"
                                  ? "text-red-600 border-red-100 bg-red-50"
                                  : q.difficulty === "Medium"
                                    ? "text-amber-600 border-amber-100 bg-amber-50"
                                    : "text-emerald-600 border-emerald-100 bg-emerald-50"
                              }`}
                            >
                              {q.difficulty}
                            </span>

                            {/* AI REASONING TOOLTIP */}
                            <div className="cursor-help text-slate-300 hover:text-indigo-500 transition-colors">
                              <Brain size={14} />

                              {/* The Tooltip - Shows on Hover */}
                              <div className="absolute bottom-full left-0 mb-2 w-64 p-4 bg-slate-900 text-white text-[10px] rounded-2xl shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 leading-relaxed border border-slate-700">
                                <div className="flex items-center gap-2 mb-2 text-indigo-400 font-bold border-b border-slate-800 pb-1">
                                  <Sparkles size={10} /> AI CLASSIFICATION LOGIC
                                </div>
                                {q.reasoning ||
                                  "Historical data: Standard classification."}
                                <div className="mt-2 text-slate-500 italic">
                                  Score metric: {q.aiScore}
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-6 text-right">
                          <button
                            onClick={() => handleDelete(q.id)}
                            className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              <div className="flex justify-between items-center p-6 bg-white border-t border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase">
                  Page {page} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="px-4 py-2 bg-slate-100 rounded-xl text-xs font-bold hover:bg-slate-200 disabled:opacity-50 transition"
                  >
                    Previous
                  </button>
                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-indigo-600 disabled:opacity-50 transition"
                  >
                    Next
                  </button>
                </div>
              </div>
              {!loading && filteredQuestions.length === 0 && (
                <div className="p-20 text-center text-slate-400 flex flex-col items-center">
                  <AlertCircle size={40} className="mb-4 opacity-20" />
                  <p className="font-bold text-sm">
                    No matching records in database
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
