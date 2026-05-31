import { useState, useEffect } from "react";
import API from "../api/axios";
import { Trophy, Medal } from "lucide-react";

const Leaderboard = () => {
  const [ranks, setRanks] = useState([]);

  useEffect(() => {
    const fetchRanks = async () => {
      try {
        const { data } = await API.get("/exams/leaderboard");
        setRanks(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchRanks();
  }, []);

  const getMedalColor = (index) => {
    if (index === 0) return "text-yellow-500"; // Gold
    if (index === 1) return "text-slate-400"; // Silver
    if (index === 2) return "text-amber-700"; // Bronze
    return "text-slate-300";
  };

  return (
    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-indigo-100 p-2 rounded-xl text-indigo-600">
          <Trophy size={20} />
        </div>
        <h3 className="text-xl font-black text-slate-800 tracking-tight">
          Global Mastery Rank
        </h3>
      </div>

      <div className="space-y-4">
        {ranks.map((entry, index) => (
          <div
            key={entry.userId}
            className={`flex items-center justify-between p-4 rounded-2xl transition-all ${
              index === 0
                ? "bg-indigo-50 border border-indigo-100"
                : "bg-slate-50"
            }`}
          >
            <div className="flex items-center gap-4">
              {/* BUG FIX 1 & 2: Split medal vs rank-number into distinct layouts.
                  Medal icon gets the color class directly so SVG currentColor
                  resolves correctly. Rank number gets its own sizing/alignment. */}
              <div className="w-6 flex items-center justify-center">
                {index < 3 ? (
                  <Medal size={24} className={getMedalColor(index)} />
                ) : (
                  <span className="font-black text-sm text-center text-slate-400">
                    #{index + 1}
                  </span>
                )}
              </div>
              <div>
                <p className="font-bold text-slate-800 leading-none">
                  {entry.user?.username}
                </p>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                  {entry.examsCount} Tracks Completed
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-black text-indigo-600">
                {parseFloat(entry.avgAccuracy).toFixed(1)}%
              </p>
              <p className="text-[9px] font-bold text-slate-400 uppercase">
                Avg Acc
              </p>
            </div>
          </div>
        ))}

        {ranks.length === 0 && (
          <p className="text-center text-slate-400 py-10 text-sm font-medium italic">
            Competition starts after the first submission...
          </p>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
