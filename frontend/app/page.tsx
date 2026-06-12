"use client";
import { useState, useCallback } from "react";
import MarkdownRenderer from "./components/MarkdownRenderer";

type ReviewResult = {
  analysis: string;
  security: string;
  optimizations: string;
  report: string;
};

const LANGUAGES = [
  { value: "python", label: "Python" },
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "java", label: "Java" },
  { value: "cpp", label: "C++" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
];

const TABS: { key: keyof ReviewResult; label: string }[] = [
  { key: "report", label: "Report" },
  { key: "analysis", label: "Analysis" },
  { key: "security", label: "Security" },
  { key: "optimizations", label: "Optimizations" },
];

/* ─── Icons ─── */

function IconTerminal({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="4 17 10 11 4 5" /><line x1="12" y1="19" x2="20" y2="19" />
    </svg>
  );
}

function IconShield({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function IconZap({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

function IconFileText({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  );
}

function IconSearch({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function IconArrowRight({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

function IconLoader({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "spin 0.8s linear infinite" }}>
      <path d="M21 12a9 9 0 1 1-6.22-8.56" />
    </svg>
  );
}

function IconAlertCircle({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

function IconCode({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
    </svg>
  );
}

function IconChevronDown({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

const AGENT_CONFIG = [
  { key: "analysis", label: "Analyzer", icon: <IconSearch size={14} />, desc: "Scanning for bugs and code smells" },
  { key: "security", label: "Security", icon: <IconShield size={14} />, desc: "Checking vulnerabilities" },
  { key: "optimizations", label: "Optimizer", icon: <IconZap size={14} />, desc: "Finding performance improvements" },
  { key: "report", label: "Reporter", icon: <IconFileText size={14} />, desc: "Generating final report" },
];

const TAB_ICONS: Record<string, React.ReactNode> = {
  report: <IconFileText size={14} />,
  analysis: <IconSearch size={14} />,
  security: <IconShield size={14} />,
  optimizations: <IconZap size={14} />,
};

export default function Home() {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("python");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ReviewResult | null>(null);
  const [activeTab, setActiveTab] = useState<keyof ReviewResult>("report");
  const [error, setError] = useState<string | null>(null);

  const reviewCode = useCallback(async () => {
    if (!code.trim() || loading) return;
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const res = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language }),
      });

      if (!res.ok) throw new Error(`Server returned ${res.status}`);

      const data = await res.json();
      setResult(data);
      setActiveTab("report");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      setError(`Failed to get review. ${msg}`);
    } finally {
      setLoading(false);
    }
  }, [code, language, loading]);

  const lineCount = code.split("\n").length;
  const canSubmit = !loading && code.trim().length > 0;

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--bg-0)" }}>
      {/* ─── Header ─── */}
      <header style={{ background: "var(--bg-1)", borderBottom: "1px solid var(--border)", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", height: 52, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: 7, background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}>
              <IconCode size={14} />
            </div>
            <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-0)", letterSpacing: "-0.02em" }}>
              CodeReview
            </span>
            <span style={{ width: 1, height: 16, background: "var(--border)", display: "inline-block" }} />
            <span style={{ fontSize: 13, color: "var(--text-3)" }}>
              AI Agent
            </span>
          </div>

          <div
            style={{
              fontSize: 12,
              color: "var(--text-2)",
              padding: "4px 10px",
              borderRadius: 6,
              border: "1px solid var(--border)",
              background: "var(--bg-2)",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: loading ? "var(--amber)" : "var(--green)",
                display: "inline-block",
                animation: loading ? "pulse-subtle 1.2s ease-in-out infinite" : "none",
              }}
            />
            {loading ? "Processing" : "Ready"}
          </div>
        </div>
      </header>

      {/* ─── Main ─── */}
      <main style={{ flex: 1, maxWidth: 1200, width: "100%", margin: "0 auto", padding: "20px 24px 48px" }}>
        <div className="main-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

          {/* ─── Left: Code Editor ─── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div className="panel">
              {/* Toolbar */}
              <div className="panel-toolbar">
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ color: "var(--text-2)", display: "flex" }}><IconTerminal size={14} /></span>
                  <span style={{ fontSize: 12, fontWeight: 500, color: "var(--text-1)" }}>Input</span>
                  {code && (
                    <span style={{ fontSize: 11, color: "var(--text-3)" }}>
                      · {lineCount} line{lineCount !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>

                {/* Language picker */}
                <div style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
                  <select
                    id="language-select"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="focus-ring"
                    style={{
                      appearance: "none",
                      background: "var(--bg-1)",
                      border: "1px solid var(--border)",
                      borderRadius: 6,
                      color: "var(--text-1)",
                      fontSize: 12,
                      padding: "4px 26px 4px 8px",
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    {LANGUAGES.map((l) => (
                      <option key={l.value} value={l.value}>{l.label}</option>
                    ))}
                  </select>
                  <span style={{ position: "absolute", right: 6, pointerEvents: "none", color: "var(--text-3)", display: "flex" }}>
                    <IconChevronDown />
                  </span>
                </div>
              </div>

              {/* Code textarea */}
              <textarea
                id="code-input"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                spellCheck={false}
                placeholder={`Paste your ${LANGUAGES.find((l) => l.value === language)?.label ?? ""} code here…`}
                style={{
                  width: "100%",
                  height: 420,
                  padding: 16,
                  background: "var(--bg-1)",
                  color: "var(--text-0)",
                  border: "none",
                  outline: "none",
                  resize: "none",
                  fontSize: 13,
                  lineHeight: 1.7,
                  tabSize: 2,
                }}
              />
            </div>

            {/* Submit button */}
            <button
              id="review-btn"
              onClick={reviewCode}
              disabled={!canSubmit}
              className="focus-ring"
              style={{
                width: "100%",
                padding: "11px 0",
                borderRadius: 10,
                border: canSubmit ? "1px solid var(--accent)" : "1px solid var(--border)",
                background: canSubmit ? "var(--accent)" : "var(--bg-2)",
                color: canSubmit ? "#fff" : "var(--text-3)",
                fontSize: 13,
                fontWeight: 500,
                fontFamily: "inherit",
                cursor: canSubmit ? "pointer" : "not-allowed",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                transition: "all 150ms ease",
              }}
            >
              {loading ? (
                <><IconLoader size={14} /> Analyzing…</>
              ) : (
                <>Run Review <IconArrowRight /></>
              )}
            </button>

            {/* Error message */}
            {error && (
              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: 10,
                  background: "var(--red-dim)",
                  border: "1px solid rgba(239, 68, 68, 0.2)",
                  color: "#fca5a5",
                  fontSize: 13,
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 8,
                  animation: "fade-in 200ms ease",
                }}
              >
                <span style={{ marginTop: 2, flexShrink: 0, color: "var(--red)" }}>
                  <IconAlertCircle size={14} />
                </span>
                <span>{error}</span>
              </div>
            )}

            {/* Pipeline status (during loading) */}
            {loading && (
              <div className="panel" style={{ animation: "fade-in 200ms ease" }}>
                <div className="panel-toolbar">
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <IconLoader size={12} />
                    <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-2)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      Pipeline
                    </span>
                  </div>
                  <span style={{ fontSize: 11, color: "var(--text-3)" }}>4 agents</span>
                </div>
                <div style={{ padding: 6 }}>
                  {AGENT_CONFIG.map((agent, i) => (
                    <AgentRow key={agent.key} agent={agent} index={i} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ─── Right: Results ─── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {result ? (
              <div className="panel" style={{ animation: "fade-in 250ms ease", display: "flex", flexDirection: "column", minHeight: 500 }}>
                {/* Tab bar */}
                <div style={{ borderBottom: "1px solid var(--border)", background: "var(--bg-2)", padding: "0 6px", display: "flex", alignItems: "center" }}>
                  {TABS.map((tab) => {
                    const isActive = activeTab === tab.key;
                    return (
                      <button
                        key={tab.key}
                        id={`tab-${tab.key}`}
                        onClick={() => setActiveTab(tab.key)}
                        style={{
                          padding: "11px 14px",
                          fontSize: 12,
                          fontWeight: isActive ? 500 : 400,
                          fontFamily: "inherit",
                          color: isActive ? "var(--text-0)" : "var(--text-3)",
                          background: "transparent",
                          border: "none",
                          borderBottom: `2px solid ${isActive ? "var(--accent)" : "transparent"}`,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          transition: "color 120ms ease",
                        }}
                      >
                        <span style={{ color: isActive ? "var(--accent)" : "var(--text-3)", display: "flex" }}>
                          {TAB_ICONS[tab.key]}
                        </span>
                        {tab.label}
                      </button>
                    );
                  })}
                </div>

                {/* Result content */}
                <div
                  style={{
                    flex: 1,
                    padding: 20,
                    overflowY: "auto",
                  }}
                >
                  {result[activeTab] ? (
                    <MarkdownRenderer content={result[activeTab]} />
                  ) : (
                    <span style={{ color: "var(--text-3)", fontSize: 13 }}>No data returned for this section.</span>
                  )}
                </div>
              </div>
            ) : (
              /* Empty state */
              <div
                style={{
                  borderRadius: 12,
                  border: "1px dashed var(--border)",
                  background: "var(--bg-1)",
                  minHeight: 500,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "48px 32px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 10,
                    background: "var(--bg-3)",
                    border: "1px solid var(--border)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--text-3)",
                    marginBottom: 16,
                  }}
                >
                  <IconCode size={20} />
                </div>
                <p style={{ fontSize: 14, fontWeight: 500, color: "var(--text-1)", marginBottom: 6 }}>
                  No results yet
                </p>
                <p style={{ fontSize: 13, color: "var(--text-3)", maxWidth: 260, lineHeight: 1.6 }}>
                  Paste your code on the left and run a review. Four agents will analyze it in parallel.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ─── Footer ─── */}
      <footer style={{ borderTop: "1px solid var(--border)", padding: "12px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 11, color: "var(--text-3)" }}>
          <span>CodeReview AI</span>
          <span>Analyzer · Security · Optimizer · Reporter</span>
        </div>
      </footer>
    </div>
  );
}

/* ─── Agent pipeline row ─── */

function AgentRow({ agent, index }: { agent: (typeof AGENT_CONFIG)[number]; index: number }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "9px 10px",
        borderRadius: 8,
        animation: `fade-in 300ms ease ${index * 80}ms both`,
      }}
    >
      <span style={{ color: "var(--accent)", flexShrink: 0, display: "flex" }}>
        {agent.icon}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 3 }}>
          <span style={{ fontSize: 12, fontWeight: 500, color: "var(--text-0)" }}>
            {agent.label}
          </span>
          <span
            style={{
              fontSize: 10,
              color: "var(--text-3)",
              animation: "pulse-subtle 1.4s ease-in-out infinite",
              animationDelay: `${index * 200}ms`,
            }}
          >
            running
          </span>
        </div>
        <div style={{ height: 2, borderRadius: 1, background: "var(--bg-3)", overflow: "hidden" }}>
          <div
            style={{
              height: "100%",
              borderRadius: 1,
              background: "var(--accent)",
              animation: `bar-fill ${8 + index * 3}s ease-out forwards`,
              animationDelay: `${index * 200}ms`,
            }}
          />
        </div>
        <p style={{ fontSize: 11, color: "var(--text-3)", marginTop: 2 }}>
          {agent.desc}
        </p>
      </div>
    </div>
  );
}