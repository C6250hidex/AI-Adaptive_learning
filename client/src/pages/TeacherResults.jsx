import React, { useEffect, useState } from "react";
import API from "../api/axios";
import Sidebar from "../components/Sidebar";
// import { GraduationCap, Calendar, Target } from "lucide-react";

const TeacherResults = () => {
  const [results, setResults] = useState([]);

  useEffect(() => {
    const fetchResults = async () => {
      const { data } = await API.get("/exams/history/all");
      setResults(data);
    };
    fetchResults();
  }, []);

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-black mb-8">Global Student Performance</h1>
        <div className="bg-white rounded-[2rem] shadow-sm border overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
              <tr>
                <th className="p-6">Student</th>
                <th className="p-6">Subject</th>
                <th className="p-6">Score</th>
                <th className="p-6">Accuracy</th>
                <th className="p-6">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {results.map((res) => (
                <tr key={res.id} className="hover:bg-slate-50 transition">
                  <td className="p-6 font-bold">
                    {res.user?.username || "ID: " + res.userId}
                  </td>
                  <td className="p-6">
                    <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-lg text-xs font-bold">
                      {res.subject}
                    </span>
                  </td>
                  <td className="p-6 font-mono">
                    {res.score}/{res.totalQuestions}
                  </td>
                  <td
                    className={`p-6 font-black ${res.accuracy > 70 ? "text-emerald-500" : "text-orange-500"}`}
                  >
                    {res.accuracy}%
                  </td>
                  <td className="p-6 text-slate-400 text-xs">
                    {new Date(res.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default TeacherResults;
