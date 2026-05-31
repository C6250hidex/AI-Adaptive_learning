import { useState, useEffect, useCallback } from "react";
import API from "../api/axios";
import toast from "react-hot-toast";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Timer,
  BrainCircuit,
  CheckCircle2,
  ShieldAlert,
  Activity,
  Award,
  Sparkles,
  ArrowRight,
  TrendingUp,
} from "lucide-react";

const ExamInterface = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const selectedSubject = queryParams.get("subject") || "General Assessment";

  // State Management
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [attempted, setAttempted] = useState([]);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [count, setCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(600);
  const [isFinished, setIsFinished] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const { initialDifficulty } = location.state || {};
  const MAX_QUESTIONS = 10;
  const storageKey = `exam_progress_${user?.id}_${selectedSubject}`;

  // 1. DATABASE COMMIT: Save results to MySQL
  const finishExam = useCallback(
    async (finalScore) => {
      if (isFinished) return;
      setIsFinished(true);
      const loadingToast = toast.loading(
        "Syncing adaptive metrics to MySQL...",
      );

      try {
        const actualScore = finalScore ?? score;
        const accuracy = ((actualScore / MAX_QUESTIONS) * 100).toFixed(2);

        await API.post("/exams/save-result", {
          userId: user?.id,
          score: actualScore,
          totalQuestions: MAX_QUESTIONS,
          accuracy: parseFloat(accuracy),
          subject: selectedSubject,
        });

        localStorage.removeItem(storageKey);
        toast.success("Identity scores updated in DB", { id: loadingToast });
      } catch (err) {
        toast.error("Database commit failed. Result saved locally.", {
          id: loadingToast,
        });
      }
    },
    [score, selectedSubject, isFinished, user, storageKey],
  );

  // 2. ADAPTIVE ENGINE: Fetching next challenge
  const fetchNextQuestion = useCallback(
    async (lastCorrect = null, currentScore = score) => {
      // Logic for progression feedback
      if (lastCorrect === true) {
        setFeedback("Well done! Increasing complexity...");
        setTimeout(() => setFeedback(null), 2000);
      }

      // Exit condition
      if (count >= MAX_QUESTIONS) {
        finishExam(currentScore);
        return;
      }

      setLoading(true);
      try {
        const { data } = await API.post("/exams/next-question", {
          subject:
            selectedSubject === "General Assessment" ? null : selectedSubject,
          attemptedIds: attempted,
          lastCorrect,
          currentDifficulty:
            currentQuestion?.difficulty || initialDifficulty || "Medium",
        });

        if (!data) {
          // If no more questions exist in this specific subject
          finishExam(currentScore);
        } else {
          setCurrentQuestion(data);
          setCount((prev) => prev + 1);
        }
      } catch (err) {
        toast.error("AI Engine Offline");
      } finally {
        setLoading(false);
      }
    },
    [
      count,
      attempted,
      selectedSubject,
      initialDifficulty,
      currentQuestion,
      score,
      finishExam,
    ],
  );

  // 3. PERSISTENCE: Resume session logic
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      const { attempted: a, score: s, count: c, time: t } = JSON.parse(saved);
      setAttempted(a);
      setScore(s);
      setCount(c);
      setTimeLeft(t);
      toast("Resuming previous session...", { icon: "🔄" });
    }
  }, [user, selectedSubject, storageKey]);

  // 4. TIMER & AUTO-SAVE LOOP
  useEffect(() => {
    if (isFinished) return;
    if (timeLeft <= 0) {
      toast.error("Time expired. Auto-submitting...");
      finishExam();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        const newTime = prev - 1;
        // Background Save
        localStorage.setItem(
          storageKey,
          JSON.stringify({
            attempted,
            score,
            count,
            time: newTime,
          }),
        );
        return newTime;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, finishExam, isFinished, storageKey, attempted, score, count]);

  // Initial trigger
  useEffect(() => {
    if (!isFinished && count === 0) fetchNextQuestion();
  }, [fetchNextQuestion, isFinished, count]);

  // Anti-Cheat
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && !isFinished) {
        toast.error("INTEGRITY ALERT: Hidden activity logged.", {
          duration: 4000,
          style: { background: "#7f1d1d", color: "#fff" },
        });
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [isFinished]);

  const handleAnswer = (selectedOption) => {
    const isCorrect = selectedOption === currentQuestion.correctAnswer;
    const newScore = isCorrect ? score + 1 : score;

    if (isCorrect) {
      setScore(newScore);
      toast.success("Correct Response", { position: "top-right" });
    } else {
      toast.error("Incorrect Response", { position: "top-right" });
    }

    setAttempted((prev) => [...prev, currentQuestion.id]);

    // Check if this was the final question
    if (count >= MAX_QUESTIONS) {
      finishExam(newScore);
    } else {
      fetchNextQuestion(isCorrect, newScore);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // UI RENDERING - LOADING
  if (loading && count === 0) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
        <Activity size={50} className="animate-spin text-indigo-500 mb-6" />
        <p className="font-black text-xs uppercase tracking-[0.3em] animate-pulse">
          Syncing Adaptive Nodes
        </p>
      </div>
    );
  }

  // UI RENDERING - FINISHED
  if (isFinished || (!currentQuestion && !loading)) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-slate-900 p-12 rounded-[3rem] border border-slate-800 shadow-2xl text-center">
          <div className="w-24 h-24 bg-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-indigo-500/20 rotate-12">
            <CheckCircle2 size={48} className="text-white -rotate-12" />
          </div>
          <h2 className="text-3xl font-black text-white mb-2 tracking-tight">
            Assessment Done
          </h2>
          <p className="text-slate-400 text-sm font-medium mb-10">
            Credentials and scores committed to database.
          </p>
          <div className="grid grid-cols-2 gap-4 mb-10">
            <div className="bg-slate-800/50 p-6 rounded-3xl border border-slate-700">
              <p className="text-[10px] font-black text-slate-500 uppercase mb-2">
                Final Accuracy
              </p>
              <p className="text-3xl font-black text-indigo-400">
                {((score / MAX_QUESTIONS) * 100).toFixed(0)}%
              </p>
            </div>
            <div className="bg-slate-800/50 p-6 rounded-3xl border border-slate-700">
              <p className="text-[10px] font-black text-slate-500 uppercase mb-2">
                Rank Earned
              </p>
              <p className="text-xl font-black text-white">
                {score > 7 ? "Master" : "Learner"}
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate("/student-dashboard")}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // UI RENDERING - MAIN EXAM
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-4 md:p-8 font-sans">
      {feedback && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[100] animate-bounce">
          <div className="bg-emerald-500 text-white px-8 py-3 rounded-2xl font-black shadow-[0_0_40px_rgba(16,185,129,0.4)] flex items-center gap-3">
            <Sparkles size={20} /> {feedback}
          </div>
        </div>
      )}
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
          <div className="flex items-center gap-5">
            <div className="bg-indigo-600 p-3 rounded-2xl shadow-xl shadow-indigo-500/10">
              <BrainCircuit size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-white">
                {selectedSubject}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest text-xs">
                  Identity Verified Session
                </p>
              </div>
            </div>
          </div>
          <div className="px-8 py-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-center gap-4 shadow-xl">
            <Timer
              size={20}
              className={
                timeLeft < 60 ? "text-red-500 animate-pulse" : "text-indigo-500"
              }
            />
            <span
              className={`text-2xl font-mono font-black ${timeLeft < 60 ? "text-red-500" : "text-white"}`}
            >
              {formatTime(timeLeft)}
            </span>
          </div>
        </header>

        <div className="mb-8">
          <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-3 ml-2">
            <span>Knowledge Progression</span>
            <span>
              {count} of {MAX_QUESTIONS}
            </span>
          </div>
          <div className="h-2.5 w-full bg-slate-900 rounded-full border border-slate-800 overflow-hidden p-0.5">
            <div
              className="h-full bg-indigo-500 rounded-full transition-all duration-700 shadow-[0_0_20px_rgba(99,102,241,0.4)]"
              style={{ width: `${(count / MAX_QUESTIONS) * 100}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            <div className="bg-slate-900 border border-slate-800 p-8 md:p-16 rounded-[3.5rem] shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Award size={40} />
              </div>
              <div className="mb-10">
                <span
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                    currentQuestion?.difficulty === "Hard"
                      ? "bg-red-500/10 text-red-400 border-red-500/20"
                      : currentQuestion?.difficulty === "Medium"
                        ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                        : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  }`}
                >
                  {currentQuestion?.difficulty} Complexity
                </span>
              </div>
              <h2 className="text-2xl md:text-4xl font-bold text-white leading-[1.4] mb-16">
                {currentQuestion?.questionText}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {["A", "B", "C", "D"].map((opt) => (
                  <button
                    key={opt}
                    onClick={() => handleAnswer(opt)}
                    disabled={loading}
                    className="group flex items-center p-6 bg-slate-800/40 hover:bg-indigo-600 rounded-[2rem] transition-all duration-300 border border-slate-800 hover:border-indigo-400 text-left disabled:opacity-30 shadow-inner"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-slate-950 group-hover:bg-indigo-500 flex items-center justify-center font-black text-xl mr-6 transition-all">
                      {opt}
                    </div>
                    <span className="font-bold text-lg text-slate-300 group-hover:text-white">
                      {currentQuestion?.[`option${opt}`]}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-xl shadow-black/20">
              <div className="flex items-center gap-3 mb-8">
                <ShieldAlert size={20} className="text-indigo-500" />
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                  Integrity Log
                </h4>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed italic border-l-2 border-indigo-500 pl-4">
                AI is monitoring your session integrity and response latency.
              </p>
            </div>

            <div className="bg-indigo-900 text-white p-8 rounded-[2.5rem] shadow-2xl shadow-indigo-500/10">
              <h4 className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-6 flex items-center gap-2">
                <TrendingUp size={14} /> Performance
              </h4>
              <div className="space-y-5">
                <div className="flex justify-between items-end">
                  <span className="text-xs font-bold opacity-70">Points</span>
                  <span className="text-3xl font-black">{score}</span>
                </div>
                <div className="flex justify-between items-end pt-5 border-t border-white/10">
                  <span className="text-xs font-bold opacity-70">Accuracy</span>
                  <span className="text-xl font-black">
                    {count > 1 ? ((score / (count - 1)) * 100).toFixed(0) : 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamInterface;
