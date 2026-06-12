"use client";
import { useState } from "react";

type ReviewResult = {
  analysis: string;
  security: string;
  optimizations: string;
  report: string;
};

export default function Home() {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("python");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ReviewResult | null>(null);
  const [activeTab, setActiveTab] = useState("report");

  async function reviewCode() {
    if (!code.trim() || loading) return;
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language })
      });
      const data = await res.json();
      setResult(data);
      setActiveTab("report");
    } catch (err) {
      alert("Error — is backend running?");
    } finally {
      setLoading(false);
    }
  }

  const tabs = ["report", "analysis", "security", "optimizations"];

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      {/* Header */}
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-1">🤖 AI Code Review Agent</h1>
          <p className="text-gray-400 text-sm">Powered by 4 specialist agents — Analyzer · Security · Optimizer · Reporter</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT — code input */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-300">Paste your code</label>
              <select
                value={language}
                onChange={e => setLanguage(e.target.value)}
                className="bg-gray-800 border border-gray-700 text-sm px-3 py-1 rounded-lg outline-none"
              >
                <option value="python">Python</option>
                <option value="javascript">JavaScript</option>
                <option value="typescript">TypeScript</option>
                <option value="java">Java</option>
                <option value="cpp">C++</option>
              </select>
            </div>

            <textarea
              className="w-full h-96 bg-gray-900 border border-gray-700 rounded-xl p-4 font-mono text-sm outline-none focus:border-blue-500 resize-none"
              placeholder="paste your code here..."
              value={code}
              onChange={e => setCode(e.target.value)}
            />

            <button
              onClick={reviewCode}
              disabled={loading || !code.trim()}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl font-medium transition"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⟳</span>
                  Agents working... (30-60s)
                </span>
              ) : "Review Code →"}
            </button>

            {/* agent status */}
            {loading && (
              <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 text-sm space-y-2">
                <p className="text-gray-400 font-medium">Agents running:</p>
                {["🔍 Analyzer — finding bugs", "🔒 Security — scanning vulnerabilities", "⚡ Optimizer — improving performance", "📝 Reporter — generating report"].map((a, i) => (
                  <div key={i} className="flex items-center gap-2 text-gray-500">
                    <span className="animate-pulse">●</span> {a}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT — results */}
          <div className="flex flex-col gap-4">
            {result ? (
              <>
                <div className="flex gap-2">
                  {tabs.map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-3 py-1 rounded-lg text-sm capitalize transition ${
                        activeTab === tab
                          ? "bg-blue-600 text-white"
                          : "bg-gray-800 text-gray-400 hover:text-white"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
                <div className="h-96 overflow-y-auto bg-gray-900 border border-gray-700 rounded-xl p-4 text-sm whitespace-pre-wrap leading-relaxed font-mono">
                  {activeTab === "report" && result.report}
                  {activeTab === "analysis" && result.analysis}
                  {activeTab === "security" && result.security}
                  {activeTab === "optimizations" && result.optimizations}
                </div>
              </>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-600 border border-gray-800 rounded-xl">
                <div className="text-center">
                  <p className="text-4xl mb-3">🤖</p>
                  <p>Paste code and click Review</p>
                  <p className="text-xs mt-1">4 agents will analyze your code</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}