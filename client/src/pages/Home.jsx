import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BrainCircuit,
  Target,
  BarChart3,
  ArrowRight,
  Sparkles,
  Cpu,
  Layers,
  Activity,
  CheckCircle2,
  Menu,
  X,
  Compass,
  FileCode,
  Sliders,
  Database,
  Terminal,
  Server,
} from "lucide-react";

const Home = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900 selection:bg-emerald-500 selection:text-white antialiased">
      {/* Top Banner */}
      <div className="bg-zinc-950 text-zinc-400 text-[11px] sm:text-xs py-2.5 px-4 text-center tracking-wider border-b border-zinc-800 font-mono">
        SYSTEM STATUS: ONLINE // METRIC ROUTING PIPELINE SECURED [V2.6]
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-zinc-200/80">
        <div className="flex justify-between items-center p-4 sm:p-5 max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-3">
            <div className="bg-zinc-950 p-2.5 rounded-xl text-emerald-400 shadow-md shadow-zinc-950/10 border border-zinc-800">
              <BrainCircuit size={22} className="stroke-[2]" />
            </div>
            <div className="flex flex-col">
              <span className="text-base sm:text-lg font-black tracking-tight text-zinc-900 leading-none mb-1">
                ADAPTIVE.AI
              </span>
              <span className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase leading-none font-mono">
                CBT Kernel Engine
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <button
              onClick={() => navigate("/login")}
              className="text-sm font-semibold text-zinc-600 hover:text-zinc-900 transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate("/register")}
              className="bg-zinc-900 hover:bg-emerald-600 text-white text-sm px-5 py-2.5 rounded-xl font-bold shadow-md shadow-zinc-900/10 transition-all duration-200"
            >
              Initialize Assessment
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-zinc-600 hover:text-zinc-900 transition-colors"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Dropdown Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-zinc-200 px-4 py-6 space-y-4 animate-fade-in">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                navigate("/login");
              }}
              className="block w-full text-left py-2 font-semibold text-zinc-600"
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                navigate("/register");
              }}
              className="block w-full text-center bg-zinc-900 hover:bg-emerald-600 text-white py-3 rounded-xl font-bold transition-all"
            >
              Initialize Assessment
            </button>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <header className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-16 sm:pb-20 text-center">
        <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200/60 text-emerald-800 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide mb-6 sm:mb-8 shadow-sm">
          <Sparkles size={13} className="text-emerald-600" /> Non-Linear
          Heuristic Assessment Model
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-zinc-900 mb-6 leading-[1.1] md:leading-[1.05]">
          Quantify Performance. <br />
          <span className="bg-gradient-to-r from-zinc-900 via-zinc-800 to-emerald-600 bg-clip-text text-transparent">
            Calibrate Parameters.
          </span>
        </h1>
        <p className="text-zinc-500 text-base sm:text-lg md:text-xl max-w-3xl mx-auto mb-8 sm:mb-10 font-normal leading-relaxed px-2">
          An enterprise-grade computer-based testing ecosystem utilizing
          standard natural language processing matrices to categorize item
          complexity thresholds while processing dynamic item response updates.
        </p>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 max-w-md sm:max-w-none mx-auto px-4">
          <button
            onClick={() => navigate("/register")}
            className="group bg-zinc-900 text-white px-8 py-4 rounded-xl font-bold text-base shadow-lg shadow-zinc-900/10 hover:bg-emerald-600 transition-all duration-200 flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            Launch Testing Kernel
            <ArrowRight
              size={18}
              className="group-hover:translate-x-1 transition-transform"
            />
          </button>
          <div className="bg-white border border-zinc-200 px-8 py-4 rounded-xl font-mono text-zinc-500 text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-sm w-full sm:w-auto">
            <Cpu size={16} className="text-emerald-500" /> NLP-Engine Pipeline
            Validated
          </div>
        </div>
      </header>

      {/* Real-time Telemetry Stats Row */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-20 sm:pb-24">
        <div className="bg-white border border-zinc-200 rounded-2xl p-6 sm:p-8 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-center sm:text-left">
          <div className="sm:pr-4">
            <p className="text-2xl sm:text-3xl font-black text-zinc-900 font-mono">
              99.42%
            </p>
            <p className="text-[11px] font-bold text-zinc-400 tracking-wider uppercase mt-1">
              Linguistic Classification Match
            </p>
          </div>
          <div className="sm:border-l border-zinc-200 sm:pl-6">
            <p className="text-2xl sm:text-3xl font-black text-zinc-900 font-mono">
              &lt; 38ms
            </p>
            <p className="text-[11px] font-bold text-zinc-400 tracking-wider uppercase mt-1">
              Item Recalibration Latency
            </p>
          </div>
          <div className="sm:border-l border-zinc-200 sm:pl-6">
            <p className="text-2xl sm:text-3xl font-black text-zinc-900 font-mono">
              3-Param IRT
            </p>
            <p className="text-[11px] font-bold text-zinc-400 tracking-wider uppercase mt-1">
              Psychometric Trait Distribution
            </p>
          </div>
          <div className="sm:border-l border-zinc-200 sm:pl-6">
            <p className="text-2xl sm:text-3xl font-black text-zinc-900 font-mono">
              Decoupled
            </p>
            <p className="text-[11px] font-bold text-zinc-400 tracking-wider uppercase mt-1">
              3-Tier System Architecture
            </p>
          </div>
        </div>
      </section>

      {/* Feature Capability Grid */}
      <section className="bg-white py-20 sm:py-24 border-y border-zinc-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 mb-4">
              Core Structural Mechanics
            </h2>
            <p className="text-zinc-500 text-sm sm:text-base">
              Robust evaluation protocols powering the runtime matrix during
              intense institutional test concurrency load spikes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Target className="text-zinc-900" size={24} />}
              title="Difficulty Classification"
              desc="Evaluates semantic tree depth, item length vectors, and domain terminology concentrations map directly into custom Bloom taxonomic levels."
            />
            <FeatureCard
              icon={<BrainCircuit className="text-zinc-900" size={24} />}
              title="State Adaptive Paths"
              desc="Adapts immediate next-item queues based on continuous processing variables, preventing structural performance plateaus."
            />
            <FeatureCard
              icon={<BarChart3 className="text-zinc-900" size={24} />}
              title="Predictive Analytics"
              desc="Generates multi-layered charts reporting variance patterns, overall knowledge retention speed, and curriculum calibration bottlenecks."
            />
          </div>
        </div>
      </section>

      {/* Algorithmic Blueprint Architecture (New Content Addition) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20 sm:py-24">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-zinc-900 text-emerald-400 px-3 py-1 rounded-md text-[10px] font-mono uppercase tracking-wider mb-3">
            <Terminal size={12} /> Execution Engine Flow
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900">
            Adaptive Decision Pipeline
          </h2>
          <p className="text-zinc-500 text-sm mt-2">
            The deterministic roadmap executed per candidate transaction to
            ensure complete mathematical balance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <WorkflowStep
            step="01"
            title="Lexical Extraction"
            desc="System parses raw text string characters down into token syntax representations to measure baseline structural density definitions."
          />
          <WorkflowStep
            step="02"
            title="Weight Assignment"
            desc="Heuristic algorithms evaluate lexical tokens against standard educational weight records to produce raw numeric complexity."
          />
          <WorkflowStep
            step="03"
            title="Bayesian Update"
            desc="Processes incoming item correctness vectors to transform variance parameters into accurate current student capacity indices."
          />
          <WorkflowStep
            step="04"
            title="Queue Dispatch"
            desc="Dynamic loops match the adjusted capacity metrics to select perfectly aligned exam items from the main data stack."
          />
        </div>
      </section>

      {/* Dynamic System Infrastructure Matrix (New Content Addition) */}
      <section className="bg-zinc-100 border-t border-zinc-200 py-20 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
            <div className="lg:col-span-1">
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest block mb-2 font-mono">
                // Sandbox Diagnostics
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight mb-4">
                Infrastructure Calibration
              </h3>
              <p className="text-zinc-500 text-sm sm:text-base leading-relaxed">
                The evaluation kernel segments operational nodes into isolated
                threads ensuring failure isolation, low memory profiles, and
                structural integrity under stress.
              </p>
            </div>

            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white p-6 rounded-xl border border-zinc-200/80 shadow-sm flex gap-4">
                <div className="p-3 rounded-lg bg-zinc-50 text-zinc-900 h-fit border border-zinc-100">
                  <Database size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-zinc-900 text-sm font-mono uppercase mb-1">
                    Decoupled Storage
                  </h4>
                  <p className="text-zinc-500 text-xs leading-relaxed">
                    Splits raw student demographic schemas away from evaluation
                    item response telemetry logs for speed optimization.
                  </p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl border border-zinc-200/80 shadow-sm flex gap-4">
                <div className="p-3 rounded-lg bg-zinc-50 text-zinc-900 h-fit border border-zinc-100">
                  <Sliders size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-zinc-900 text-sm font-mono uppercase mb-1">
                    Adaptive Throttling
                  </h4>
                  <p className="text-zinc-500 text-xs leading-relaxed">
                    Locks pipeline evaluation bandwidth loops down automatically
                    when hardware detects memory resource allocation surges.
                  </p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl border border-zinc-200/80 shadow-sm flex gap-4">
                <div className="p-3 rounded-lg bg-zinc-50 text-zinc-900 h-fit border border-zinc-100">
                  <FileCode size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-zinc-900 text-sm font-mono uppercase mb-1">
                    Deterministic Parsers
                  </h4>
                  <p className="text-zinc-500 text-xs leading-relaxed">
                    Maintains immutable lexical map lookup parameters to prevent
                    drift during high-velocity data categorization batches.
                  </p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl border border-zinc-200/80 shadow-sm flex gap-4">
                <div className="p-3 rounded-lg bg-zinc-50 text-zinc-900 h-fit border border-zinc-100">
                  <Compass size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-zinc-900 text-sm font-mono uppercase mb-1">
                    Vector Alignment
                  </h4>
                  <p className="text-zinc-500 text-xs leading-relaxed">
                    Transforms individual raw textual paragraphs into
                    standardized structural float matrices for rapid
                    cross-analysis matches.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Role Access Hierarchy Profiles */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20 sm:py-24">
        <div className="bg-zinc-950 rounded-3xl p-6 sm:p-10 md:p-16 text-white relative overflow-hidden shadow-xl border border-zinc-800">
          <div className="absolute top-0 right-0 w-[300px] sm:w-[500px] h-[300px] sm:w-[500px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight mb-4">
                Multi-Tenant Role Matrix Routing
              </h2>
              <p className="text-zinc-400 text-sm sm:text-base mb-8 max-w-md font-normal leading-relaxed">
                The platform exposes granular, isolated security partitions
                tailored strictly around distinct application user paradigms.
              </p>
              <div className="space-y-4">
                <RoleItem
                  label="Administrative Authority Console"
                  desc="Controls global engine variables, orchestrates physical DB migrations, and audits high-level logging events."
                />
                <RoleItem
                  label="Educator / Content Curation Panel"
                  desc="Injects test item objects, maps dynamic taxonomic weight scales, and monitors group retention velocity patterns."
                />
                <RoleItem
                  label="Candidate Evaluation Interface"
                  desc="Renders clean assessment questions and provides safe immediate performance tracking indicators."
                />
              </div>
            </div>

            <div className="bg-zinc-900/80 border border-zinc-800 p-4 sm:p-6 rounded-2xl shadow-2xl backdrop-blur-sm lg:rotate-2 hover:rotate-0 transition-transform duration-500 max-w-md mx-auto lg:max-w-none w-full">
              <div className="bg-zinc-950 rounded-xl p-5 sm:p-6 h-64 sm:h-72 flex flex-col justify-between border border-zinc-800/80">
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-zinc-800" />
                      <div className="w-2.5 h-2.5 rounded-full bg-zinc-800" />
                      <div className="w-2.5 h-2.5 rounded-full bg-zinc-800" />
                    </div>
                    <span className="text-[9px] font-mono tracking-widest text-zinc-500 uppercase bg-zinc-900 px-2.5 py-1 rounded border border-zinc-800">
                      SECURE SUBSYSTEM KERNEL
                    </span>
                  </div>
                  <div className="h-1.5 w-1/4 bg-emerald-500/80 rounded-full mb-3" />
                  <div className="h-1.5 w-full bg-zinc-900 rounded-full mb-2" />
                  <div className="h-1.5 w-4/5 bg-zinc-900 rounded-full mb-2" />
                </div>

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-0 justify-between items-start sm:items-center border-t border-zinc-900 pt-4">
                  <div className="flex gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                      <Activity size={14} />
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800" />
                  </div>
                  <span className="text-emerald-400 font-mono font-bold tracking-wider text-[11px] uppercase flex items-center gap-1.5">
                    <CheckCircle2 size={12} className="text-emerald-400" />{" "}
                    Algorithmic Pipeline Confirmed
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Enterprise Footer */}
      <footer className="bg-zinc-950 text-zinc-400 border-t border-zinc-800 pt-16 pb-8 font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand/System Metadata Info Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5 text-white">
              <div className="bg-zinc-900 p-2 rounded-lg border border-zinc-800 text-emerald-400">
                <BrainCircuit size={18} />
              </div>
              <span className="text-md font-black tracking-tight font-mono">
                ADAPTIVE.AI
              </span>
            </div>
            <p className="text-xs text-zinc-500 leading-relaxed font-normal">
              A high-precision, decoupled computational engine optimized for
              psychological evaluation mapping, textual analysis parsing, and
              real-time student response calibrations.
            </p>
          </div>

          {/* Engine Parameters Links Column */}
          <div>
            <h5 className="text-xs font-bold text-zinc-200 tracking-wider font-mono uppercase mb-4">
              // System Nodes
            </h5>
            <ul className="space-y-2.5 text-xs">
              <li>
                <a
                  href="#features"
                  className="hover:text-emerald-400 transition-colors"
                >
                  Lexical Pipeline Analyzer
                </a>
              </li>
              <li>
                <a
                  href="#infrastructure"
                  className="hover:text-emerald-400 transition-colors"
                >
                  Bayesian Trait Routing
                </a>
              </li>
              <li>
                <a
                  href="#security"
                  className="hover:text-emerald-400 transition-colors"
                >
                  Decoupled Storage Schemas
                </a>
              </li>
              <li>
                <a
                  href="#diagnostics"
                  className="hover:text-emerald-400 transition-colors"
                >
                  Diagnostic Load Sandbox
                </a>
              </li>
            </ul>
          </div>

          {/* Documentation Links Column */}
          <div>
            <h5 className="text-xs font-bold text-zinc-200 tracking-wider font-mono uppercase mb-4">
              // Project Repository
            </h5>
            <ul className="space-y-2.5 text-xs">
              <li>
                <a
                  href="#docs"
                  className="hover:text-emerald-400 transition-colors"
                >
                  Academic Thesis Documentation
                </a>
              </li>
              <li>
                <a
                  href="#spec"
                  className="hover:text-emerald-400 transition-colors"
                >
                  Psychometric Vector Matrix
                </a>
              </li>
              <li>
                <a
                  href="#license"
                  className="hover:text-emerald-400 transition-colors"
                >
                  Institutional Core License
                </a>
              </li>
              <li>
                <a
                  href="#changelog"
                  className="hover:text-emerald-400 transition-colors"
                >
                  Kernel Patch Logs
                </a>
              </li>
            </ul>
          </div>

          {/* System Network Operational Status Block */}
          <div className="bg-zinc-900 p-4.5 rounded-xl border border-zinc-800/60 flex flex-col justify-between h-36">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                Network Cluster
              </span>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>
            <div>
              <div className="text-xs font-mono font-bold text-zinc-200 flex items-center gap-1.5 mb-1">
                <Server size={12} className="text-emerald-400" /> Operational
                Matrix Alpha
              </div>
              <p className="text-[11px] text-zinc-500">
                All data compilation processes operating smoothly inside target
                latency windows.
              </p>
            </div>
          </div>
        </div>

        {/* Legal and Engineering Baseline Strip */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 border-t border-zinc-900 flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left text-[11px] font-mono text-zinc-600">
          <p>
            ADAPTIVE LEARNING ASSESSMENT SYSTEM &copy; 2026 — COMPUTER SCIENCE
            THESIS PROTOTYPE ASSEMBLY
          </p>
          <div className="flex gap-4">
            <span className="hover:text-zinc-400 transition-colors">
              ISO-27001 COMPLIANT
            </span>
            <span>//</span>
            <span className="hover:text-zinc-400 transition-colors">
              ALGORITHM ENCRYPTED
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }) => (
  <div className="bg-zinc-100 border border-zinc-200/60 p-6 sm:p-8 rounded-2xl hover:bg-white hover:shadow-lg hover:border-zinc-200 transition-all duration-200 group">
    <div className="mb-5 inline-block p-3 bg-white border border-zinc-200/80 rounded-xl shadow-sm group-hover:bg-zinc-950 group-hover:text-emerald-400 transition-all duration-300">
      {icon}
    </div>
    <h3 className="text-lg font-black mb-2 text-zinc-900 tracking-tight">
      {title}
    </h3>
    <p className="text-zinc-500 text-sm leading-relaxed font-normal">{desc}</p>
  </div>
);

const WorkflowStep = ({ step, title, desc }) => (
  <div className="bg-white border border-zinc-200/80 p-5 rounded-xl shadow-sm relative">
    <div className="text-2xl font-mono font-black text-zinc-200 absolute top-4 right-4 leading-none select-none">
      {step}
    </div>
    <h4 className="font-bold text-zinc-900 text-base mb-1.5 pr-8 tracking-tight">
      {title}
    </h4>
    <p className="text-zinc-500 text-xs leading-relaxed font-normal">{desc}</p>
  </div>
);

const RoleItem = ({ label, desc }) => (
  <div className="flex items-start gap-3 bg-zinc-900/60 p-4 rounded-xl border border-zinc-800/80">
    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 flex-shrink-0" />
    <div className="text-sm">
      <span className="text-zinc-100 font-bold block mb-1 font-mono text-xs uppercase tracking-wider">
        {label}
      </span>{" "}
      <span className="text-zinc-400 font-normal leading-relaxed text-xs">
        {desc}
      </span>
    </div>
  </div>
);

export default Home;
