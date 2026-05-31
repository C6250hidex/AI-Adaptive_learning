import React from "react";
import Sidebar from "../components/Sidebar";
import { PlusCircle, Settings } from "lucide-react";

const SubjectManagement = () => {
  return (
    <div className="flex bg-slate-50 min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8">
        <header className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-black">Subject Management</h1>
          <button className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2">
            <PlusCircle size={18} /> Add New Subject
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 text-center py-20 opacity-40">
            <Settings size={40} className="mx-auto mb-4 animate-spin-slow" />
            <p className="font-bold">Subject Configuration Node</p>
            <p className="text-xs">Under Maintenance</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SubjectManagement;
