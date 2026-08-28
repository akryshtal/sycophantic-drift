import { useState } from "react";

import experiment from "../../data/experiment.json";
import primingTurnsData from "../../data/priming-turns.json";
import responses from "../../data/responses.json";

// The dataset lives in /data as the single source of truth for both this viewer
// and the write-up in /docs. These aliases keep the render code below unchanged.
const PROMPT = experiment.measurementPrompt;
const DIMENSIONS = experiment.dimensions.map(d => ({ dim: d.dimension, pole1: d.pole1, pole5: d.pole5 }));
const PRIMING_TURNS = primingTurnsData.map(t => ({ turn: t.turn, cue: t.cue, a: t.scenarioA, b: t.scenarioB }));
const MODELS = responses.models;
const MODEL_KEYS = responses.modelOrder;

// ─── COMPONENTS ──────────────────────────────────────────────────────────────

const Tooltip = ({ text, children }) => {
  const [show, setShow] = useState(false);
  if (!text) return children;
  return (
    <span style={{ position: "relative", cursor: "help" }}
      onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      {show && (
        <span style={{
          position: "absolute", bottom: "calc(100% + 8px)", left: "50%",
          transform: "translateX(-50%)", background: "#1a1a2e", color: "#e0e0e0",
          padding: "8px 12px", borderRadius: "5px", fontSize: "11.5px", fontWeight: 500,
          zIndex: 100, boxShadow: "0 4px 14px rgba(0,0,0,0.35)",
          lineHeight: 1.5, maxWidth: 380, whiteSpace: "normal",
        }}>{text}</span>
      )}
    </span>
  );
};

const SpectrumBar = ({ score, label, detail, isHovered, onHover, onLeave }) => {
  const pct = ((score - 1) / 4) * 100;
  const mc = score <= 2.2 ? "#2563eb" : score >= 3.8 ? "#dc2626" : "#888";
  return (
    <div style={{ marginBottom: 16, cursor: "pointer" }} onMouseEnter={onHover} onMouseLeave={onLeave}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
        <span style={{ width: 180, fontSize: 13, fontWeight: 600, flexShrink: 0, color: isHovered ? "#1a1a2e" : "#555", transition: "color 0.15s" }}>{label}</span>
        <div style={{ flex: 1, position: "relative", height: 28 }}>
          <div style={{ position: "absolute", top: 10, left: 0, right: 0, height: 8, borderRadius: 4, background: "linear-gradient(90deg,#2563eb 0%,#93c5fd 25%,#d4d4d4 50%,#fca5a5 75%,#dc2626 100%)", opacity: isHovered ? 0.35 : 0.18 }} />
          {[1,2,3,4,5].map(n=><div key={n} style={{ position:"absolute",top:8,left:`${((n-1)/4)*100}%`,width:1,height:12,background:isHovered?"#bbb":"#ddd" }}/>)}
          <div style={{ position:"absolute",top:2,left:`${pct}%`,transform:"translateX(-50%)",width:24,height:24,borderRadius:"50%",background:mc,border:"3px solid #fff",boxShadow:`0 1px 4px rgba(0,0,0,0.25),0 0 0 1px ${mc}33`,display:"flex",alignItems:"center",justifyContent:"center",transition:"left 0.3s ease",zIndex:2 }}>
            <span style={{ color:"#fff",fontSize:9,fontFamily:"'JetBrains Mono',monospace",fontWeight:700 }}>{score.toFixed(1)}</span>
          </div>
        </div>
        <div style={{ display:"flex",justifyContent:"space-between",width:70,flexShrink:0 }}>
          <span style={{ fontSize:9,color:"#2563eb",fontFamily:"'JetBrains Mono',monospace",fontWeight:500 }}>UA</span>
          <span style={{ fontSize:9,color:"#dc2626",fontFamily:"'JetBrains Mono',monospace",fontWeight:500 }}>RU</span>
        </div>
      </div>
      {isHovered && <div style={{ marginLeft:192,fontSize:12,color:"#666",fontStyle:"italic",lineHeight:1.5,paddingRight:82 }}>{detail}</div>}
    </div>
  );
};

// ─── METHODOLOGY PAGE ────────────────────────────────────────────────────────

const MethodologyPage = ({ onViewResults }) => {
  const [expandedTurn, setExpandedTurn] = useState(null);
  const sectionTitle = { fontFamily:"'JetBrains Mono',monospace", fontSize:11, fontWeight:500, letterSpacing:"0.12em", textTransform:"uppercase", color:"#e2b340", margin:"0 0 14px", background:"rgba(226,179,64,0.08)", padding:"6px 10px", borderRadius:4, display:"inline-block" };
  const card = { background:"#fff", border:"1px solid #ddd", borderRadius:6, padding:"22px 28px", marginBottom:20, boxShadow:"0 1px 3px rgba(0,0,0,0.04)" };
  const prose = { fontSize:14.5, color:"#333", lineHeight:1.75, margin:"0 0 14px" };
  const mono = { fontFamily:"'JetBrains Mono',monospace" };

  return (
    <div style={{ maxWidth:820, margin:"0 auto", padding:"28px 32px" }}>
      {/* CTA */}
      <div style={{ ...card, background:"linear-gradient(135deg,#1a1a2e 0%,#16213e 100%)", border:"none", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
        <div>
          <p style={{ color:"#e2b340", fontSize:13, ...mono, fontWeight:500, margin:"0 0 4px" }}>Ready to explore?</p>
          <p style={{ color:"#94a3b8", fontSize:12, margin:0 }}>See annotated model outputs with narrative framing analysis</p>
        </div>
        <button onClick={onViewResults} style={{ ...mono, fontSize:12, fontWeight:600, padding:"10px 24px", borderRadius:6, border:"1.5px solid #e2b340", background:"rgba(226,179,64,0.15)", color:"#e2b340", cursor:"pointer", letterSpacing:"0.05em" }}>
          View Results →
        </button>
      </div>

      {/* Design Logic */}
      <div style={card}>
        <div style={sectionTitle}>Design Logic</div>
        <p style={prose}>The experiment tests whether models exhibit measurable <strong>belief drift</strong> when exposed to subtle ideological cues embedded in natural conversation. The cues escalate gradually across 7 turns, mimicking how a real interlocutor's political position becomes legible over time through language choices, framing, and assumptions.</p>
        <p style={prose}>Each experimental run consists of three phases:</p>
        <div style={{ display:"flex", gap:12, flexWrap:"wrap", marginBottom:14 }}>
          {[
            { label:"Baseline", color:"#888", desc:"1 prompt, separate conversation. An ideologically neutral question establishing the model's default framing." },
            { label:"Priming", color:"#e2b340", desc:"7 turns of natural conversation with embedded ideological markers. Two mirrored versions — A (pro-Ukrainian) and B (pro-Russian)." },
            { label:"Measurement", color:"#6366f1", desc:"The same question asked after both A and B priming, allowing direct comparison of framing drift." },
          ].map(p => (
            <div key={p.label} style={{ flex:"1 1 200px", background:"#fafaf8", border:"1px solid #eee", borderRadius:6, padding:"14px 16px" }}>
              <span style={{ ...mono, fontSize:10, fontWeight:600, letterSpacing:"0.1em", color:p.color, textTransform:"uppercase" }}>{p.label}</span>
              <p style={{ fontSize:13, color:"#555", lineHeight:1.6, margin:"6px 0 0" }}>{p.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Measurement Prompt */}
      <div style={card}>
        <div style={sectionTitle}>Measurement Prompt</div>
        <div style={{ background:"#fafaf8", border:"1px solid #e8e5e0", borderRadius:6, padding:"16px 20px", display:"flex", gap:12, alignItems:"flex-start" }}>
          <span style={{ ...mono, fontSize:9, fontWeight:600, letterSpacing:"0.1em", textTransform:"uppercase", color:"#e2b340", background:"rgba(226,179,64,0.12)", padding:"3px 8px", borderRadius:3, whiteSpace:"nowrap", marginTop:1 }}>PROMPT</span>
          <p style={{ fontSize:14.5, color:"#444", margin:0, lineHeight:1.6, fontStyle:"italic" }}>{PROMPT}</p>
        </div>
        <p style={{ ...prose, marginTop:14, marginBottom:0, fontSize:13, color:"#777" }}>This identical prompt is given in a fresh conversation (Baseline) and as the final turn after each 7-turn priming sequence (Scenario A, Scenario B). The model's response is scored across five dimensions.</p>
      </div>

      {/* Scoring Framework */}
      <div style={card}>
        <div style={sectionTitle}>Scoring Framework</div>
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13, lineHeight:1.5 }}>
            <thead>
              <tr style={{ borderBottom:"2px solid #ddd" }}>
                <th style={{ textAlign:"left", padding:"8px 10px", ...mono, fontSize:10, letterSpacing:"0.08em", textTransform:"uppercase", color:"#888", fontWeight:500 }}>Dimension</th>
                <th style={{ textAlign:"left", padding:"8px 10px", ...mono, fontSize:10, letterSpacing:"0.08em", textTransform:"uppercase", color:"#2563eb", fontWeight:500 }}>1 — Pro-Ukrainian</th>
                <th style={{ textAlign:"left", padding:"8px 10px", ...mono, fontSize:10, letterSpacing:"0.08em", textTransform:"uppercase", color:"#dc2626", fontWeight:500 }}>5 — Pro-Russian</th>
              </tr>
            </thead>
            <tbody>
              {DIMENSIONS.map((d,i) => (
                <tr key={i} style={{ borderBottom:"1px solid #eee" }}>
                  <td style={{ padding:"10px", fontWeight:600, color:"#333" }}>{d.dim}</td>
                  <td style={{ padding:"10px", color:"#1e40af", background:"rgba(37,99,235,0.03)" }}>{d.pole1}</td>
                  <td style={{ padding:"10px", color:"#991b1b", background:"rgba(220,38,38,0.03)" }}>{d.pole5}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Priming Conversations */}
      <div style={card}>
        <div style={sectionTitle}>Priming Conversations (A vs B)</div>
        <p style={{ ...prose, fontSize:13, color:"#777", marginBottom:16 }}>Click any turn to expand the full prompts. Cues escalate from subtle toponymic signals (Turn 1) to explicit ideological framing (Turn 7).</p>
        {PRIMING_TURNS.map(t => {
          const isOpen = expandedTurn === t.turn;
          return (
            <div key={t.turn} style={{ marginBottom:8, border:"1px solid #eee", borderRadius:6, overflow:"hidden" }}>
              <button onClick={() => setExpandedTurn(isOpen ? null : t.turn)}
                style={{ width:"100%", display:"flex", alignItems:"center", gap:12, padding:"12px 16px", background: isOpen ? "#f8f7f5" : "#fff", border:"none", cursor:"pointer", textAlign:"left" }}>
                <span style={{ ...mono, fontSize:11, fontWeight:700, color:"#e2b340", width:30, flexShrink:0 }}>{t.turn}</span>
                <span style={{ ...mono, fontSize:10, fontWeight:500, color:"#888", letterSpacing:"0.05em", textTransform:"uppercase", flex:1 }}>{t.cue}</span>
                <span style={{ fontSize:12, color:"#aaa" }}>{isOpen ? "▲" : "▼"}</span>
              </button>
              {isOpen && (
                <div style={{ display:"flex", gap:0, borderTop:"1px solid #eee" }}>
                  <div style={{ flex:1, padding:"14px 16px", borderRight:"1px solid #eee", background:"rgba(37,99,235,0.02)" }}>
                    <span style={{ ...mono, fontSize:9, fontWeight:600, color:"#2563eb", letterSpacing:"0.1em", textTransform:"uppercase" }}>Conversation A</span>
                    <p style={{ fontSize:12.5, color:"#333", lineHeight:1.65, margin:"8px 0 0" }}>{t.a}</p>
                  </div>
                  <div style={{ flex:1, padding:"14px 16px", background:"rgba(220,38,38,0.02)" }}>
                    <span style={{ ...mono, fontSize:9, fontWeight:600, color:"#dc2626", letterSpacing:"0.1em", textTransform:"uppercase" }}>Conversation B</span>
                    <p style={{ fontSize:12.5, color:"#333", lineHeight:1.65, margin:"8px 0 0" }}>{t.b}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* How to Read */}
      <div style={card}>
        <div style={sectionTitle}>How to Read the Results</div>
        <p style={prose}>Switch to the <strong>Results</strong> tab above to see annotated model outputs. For each model and scenario:</p>
        <p style={prose}><span style={{ background:"rgba(37,99,235,0.12)", borderBottom:"2px solid #2563eb", padding:"1px 4px", borderRadius:2, color:"#1e40af" }}>Blue highlights</span> mark phrases adopting pro-Ukrainian narrative framing. <span style={{ background:"rgba(220,38,38,0.09)", borderBottom:"2px solid #dc2626", padding:"1px 4px", borderRadius:2, color:"#991b1b" }}>Red highlights</span> mark pro-Russian framing. Hover any highlight for a tooltip explaining which dimension it triggers and why.</p>
        <p style={{ ...prose, marginBottom:0 }}>The <strong>spectrum bars</strong> below each text show per-dimension scores on a continuous 1.0–5.0 scale. The <strong>overall balance score</strong> is a weighted summary. Compare Baseline → Scenario A → Scenario B within each model to observe the drift, then compare across models.</p>
      </div>

      {/* Bottom CTA */}
      <div style={{ textAlign:"center", padding:"12px 0 0" }}>
        <button onClick={onViewResults} style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:13, fontWeight:600, padding:"12px 32px", borderRadius:6, border:"1.5px solid #e2b340", background:"rgba(226,179,64,0.12)", color:"#e2b340", cursor:"pointer", letterSpacing:"0.05em" }}>
          View Results →
        </button>
      </div>
    </div>
  );
};

// ─── MAIN ────────────────────────────────────────────────────────────────────

export default function App() {
  const [view, setView] = useState("methodology");
  const [activeModel, setActiveModel] = useState("qwen");
  const [activeScenario, setActiveScenario] = useState(0);
  const [hoveredDim, setHoveredDim] = useState(null);

  const model = MODELS[activeModel];
  const data = model.scenarios[activeScenario];

  const scoreLabel = s => s<=1.5?"Strongly Pro-Ukrainian":s<=2.5?"Leans Pro-Ukrainian":s<=3.5?"Mixed / Balanced":s<=4.5?"Leans Pro-Russian":"Strongly Pro-Russian";
  const scoreColor = s => { const t=(s-1)/4; return t<=0.3?"#2563eb":t<=0.45?"#60a5fa":t<=0.55?"#a0a0a0":t<=0.7?"#f87171":"#dc2626"; };
  const overallPct = ((data.score-1)/4)*100;

  return (
    <div style={{ fontFamily:"'Source Serif 4','Georgia',serif", background:"#fafaf8", minHeight:"100vh" }}>
      {/* Header */}
      <div style={{ background:"linear-gradient(135deg,#1a1a2e 0%,#16213e 100%)", padding:"28px 32px 0", borderBottom:"3px solid #e2b340" }}>
        <div style={{ maxWidth:820, margin:"0 auto" }}>
          {/* Title block */}
          <h1 style={{
            color:"#fff", fontSize:28, fontFamily:"'Source Serif 4',Georgia,serif",
            fontWeight:700, margin:"0 0 2px", letterSpacing:"-0.02em", lineHeight:1.2,
          }}>Sycophantic Drift Pilot</h1>
          <p style={{
            color:"#cbd5e1", fontSize:15, fontFamily:"'Source Serif 4',Georgia,serif",
            fontWeight:600, margin:"0 0 4px", letterSpacing:"0.01em",
          }}>Russia–Ukraine Experimental Design</p>
          <p style={{
            color:"#94a3b8", fontSize:12, fontFamily:"'JetBrains Mono',monospace",
            margin:"0 0 14px", letterSpacing:"0.03em",
          }}>
            by{" "}
            <a href="https://www.linkedin.com/in/andrii-kryshtal-522596a5/"
              target="_blank" rel="noopener noreferrer"
              style={{ color:"#e2b340", textDecoration:"none", borderBottom:"1px solid rgba(226,179,64,0.4)" }}>
              Andrii Kryshtal
            </a>
          </p>

          {/* Top-level tabs */}
          <div style={{ display:"flex", gap:0 }}>
            {[{id:"methodology",label:"Methodology"},{id:"results",label:"Results"}].map(tab => {
              const isActive = view === tab.id;
              return (
                <button key={tab.id} onClick={() => setView(tab.id)}
                  style={{
                    fontFamily:"'JetBrains Mono',monospace", fontSize:12, fontWeight: isActive?700:400,
                    padding:"12px 28px", background: isActive?"#fafaf8":"rgba(255,255,255,0.04)",
                    color: isActive?"#1a1a2e":"#94a3b8", border:"none", borderRadius:"6px 6px 0 0",
                    cursor:"pointer", transition:"all 0.15s", position:"relative", top:3,
                    borderBottom: isActive?"2px solid #fafaf8":"2px solid transparent",
                    letterSpacing:"0.06em", textTransform:"uppercase",
                  }}>
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* METHODOLOGY */}
      {view === "methodology" && <MethodologyPage onViewResults={() => setView("results")} />}

      {/* RESULTS */}
      {view === "results" && (
        <>
          <div style={{ background:"#f0efeb", borderBottom:"1px solid #ddd", padding:"14px 32px" }}>
            <div style={{ maxWidth:820, margin:"0 auto", display:"flex", alignItems:"center", gap:20, flexWrap:"wrap" }}>
              <div style={{ display:"flex", gap:6 }}>
                {MODEL_KEYS.map(key => {
                  const m = MODELS[key]; const isA = activeModel===key;
                  return (
                    <button key={key} onClick={() => { setActiveModel(key); setActiveScenario(0); setHoveredDim(null); }}
                      style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, fontWeight:600, padding:"6px 16px", borderRadius:14, cursor:"pointer",
                        border: isA?"1.5px solid #1a1a2e":"1.5px solid #ccc",
                        background: isA?"#1a1a2e":"#fff", color: isA?"#e2b340":"#888",
                        transition:"all 0.15s", letterSpacing:"0.05em" }}>
                      {m.name}
                    </button>
                  );
                })}
              </div>
              <div style={{ width:1, height:24, background:"#ddd" }} />
              <div style={{ display:"flex", gap:4 }}>
                {model.scenarios.map((sc,idx) => {
                  const dot = sc.score<=2.2?"#3b82f6":sc.score>=3.5?"#ef4444":"#888";
                  const isA = activeScenario===idx;
                  return (
                    <button key={sc.id} onClick={() => { setActiveScenario(idx); setHoveredDim(null); }}
                      style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, fontWeight: isA?600:400, padding:"6px 14px", borderRadius:6, cursor:"pointer",
                        border: isA?"1.5px solid #555":"1.5px solid #ddd",
                        background: isA?"#fff":"transparent", color: isA?"#1a1a2e":"#888",
                        transition:"all 0.15s", display:"flex", alignItems:"center", gap:6 }}>
                      {sc.label}
                      <span style={{ display:"inline-block", width:7, height:7, borderRadius:"50%", background:dot, opacity: isA?1:0.4 }} />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div style={{ maxWidth:820, margin:"0 auto", padding:"28px 32px" }}>
            {/* Prompt */}
            <div style={{ background:"#fff", border:"1px solid #e0ddd8", borderRadius:6, padding:"14px 20px", marginBottom:24, display:"flex", gap:12, alignItems:"flex-start", boxShadow:"0 1px 3px rgba(0,0,0,0.03)" }}>
              <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, fontWeight:600, letterSpacing:"0.1em", textTransform:"uppercase", color:"#e2b340", background:"rgba(226,179,64,0.12)", padding:"3px 8px", borderRadius:3, whiteSpace:"nowrap", marginTop:1 }}>PROMPT</span>
              <p style={{ fontSize:14, color:"#444", margin:0, lineHeight:1.6, fontStyle:"italic" }}>{PROMPT}</p>
            </div>

            {/* Legend */}
            <div style={{ display:"flex", gap:24, marginBottom:24, fontSize:12, fontFamily:"'JetBrains Mono',monospace", color:"#555", flexWrap:"wrap" }}>
              <span style={{ display:"flex",alignItems:"center",gap:6 }}><span style={{ display:"inline-block",width:14,height:14,borderRadius:2,background:"rgba(37,99,235,0.15)",border:"1.5px solid #2563eb" }}/> Pro-Ukrainian</span>
              <span style={{ display:"flex",alignItems:"center",gap:6 }}><span style={{ display:"inline-block",width:14,height:14,borderRadius:2,background:"rgba(220,38,38,0.12)",border:"1.5px solid #dc2626" }}/> Pro-Russian</span>
              <span style={{ display:"flex",alignItems:"center",gap:6 }}><span style={{ display:"inline-block",width:14,height:14,borderRadius:2,background:"#f0f0ec",border:"1.5px solid #ccc" }}/> Neutral</span>
              <span style={{ fontSize:11,color:"#999",alignSelf:"center",marginLeft:"auto" }}>hover highlights for detail</span>
            </div>

            {/* Annotated Text */}
            <div style={{ background:"#fff", border:"1px solid #ddd", borderRadius:6, padding:"28px 32px", lineHeight:1.9, fontSize:16.5, color:"#222", marginBottom:28, boxShadow:"0 1px 3px rgba(0,0,0,0.04)" }}>
              {data.segments.map((seg,i) => {
                const k = `${activeModel}-${activeScenario}-${i}`;
                if (seg.type==="pro_ua") return <Tooltip key={k} text={seg.note}><span style={{ background:"rgba(37,99,235,0.12)",borderBottom:"2.5px solid #2563eb",padding:"2px 3px",borderRadius:2,color:"#1e40af" }}>{seg.text}</span></Tooltip>;
                if (seg.type==="pro_ru") return <Tooltip key={k} text={seg.note}><span style={{ background:"rgba(220,38,38,0.09)",borderBottom:"2.5px solid #dc2626",padding:"2px 3px",borderRadius:2,color:"#991b1b" }}>{seg.text}</span></Tooltip>;
                return <span key={k}>{seg.text}</span>;
              })}
            </div>

            {/* Dimensions */}
            <div style={{ background:"#fff",border:"1px solid #ddd",borderRadius:6,padding:"22px 28px",marginBottom:20,boxShadow:"0 1px 3px rgba(0,0,0,0.04)" }}>
              <h3 style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:11,fontWeight:500,letterSpacing:"0.12em",textTransform:"uppercase",color:"#888",margin:"0 0 18px" }}>Dimension Breakdown</h3>
              {Object.entries(data.dimensions).map(([key,dim]) => (
                <SpectrumBar key={key} score={dim.score} label={dim.label} detail={dim.detail}
                  isHovered={hoveredDim===key} onHover={()=>setHoveredDim(key)} onLeave={()=>setHoveredDim(null)} />
              ))}
            </div>

            {/* Overall Score */}
            <div style={{ background:"linear-gradient(135deg,#1a1a2e 0%,#16213e 100%)",borderRadius:6,padding:"24px 28px" }}>
              <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:18,flexWrap:"wrap",gap:8 }}>
                <div>
                  <h3 style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:11,fontWeight:500,letterSpacing:"0.12em",textTransform:"uppercase",color:"#e2b340",margin:"0 0 4px" }}>Overall Balance Score</h3>
                  <p style={{ color:"#94a3b8",fontSize:13,margin:0 }}>{scoreLabel(data.score)}</p>
                </div>
                <div style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:28,fontWeight:700,color:scoreColor(data.score),textShadow:`0 0 20px ${scoreColor(data.score)}44` }}>{data.score.toFixed(1)}</div>
              </div>
              <div style={{ position:"relative",height:36,marginBottom:8 }}>
                <div style={{ position:"absolute",top:12,left:0,right:0,height:12,borderRadius:6,background:"linear-gradient(90deg,#2563eb 0%,#60a5fa 20%,#d4d4d4 50%,#f87171 80%,#dc2626 100%)",opacity:0.6 }} />
                {[1,2,3,4,5].map(n=><div key={n} style={{ position:"absolute",top:8,left:`${((n-1)/4)*100}%`,transform:"translateX(-50%)" }}><div style={{ width:1,height:20,background:"rgba(255,255,255,0.25)",margin:"0 auto" }}/></div>)}
                <div style={{ position:"absolute",top:2,left:`${overallPct}%`,transform:"translateX(-50%)",width:32,height:32,borderRadius:"50%",background:scoreColor(data.score),border:"3px solid rgba(255,255,255,0.9)",boxShadow:`0 2px 8px rgba(0,0,0,0.4),0 0 16px ${scoreColor(data.score)}66`,display:"flex",alignItems:"center",justifyContent:"center",transition:"left 0.4s ease,background 0.3s",zIndex:2 }}>
                  <span style={{ color:"#fff",fontSize:11,fontFamily:"'JetBrains Mono',monospace",fontWeight:700 }}>{data.score.toFixed(1)}</span>
                </div>
              </div>
              <div style={{ display:"flex",justifyContent:"space-between",padding:"0 2px" }}>
                <span style={{ fontSize:10,fontFamily:"'JetBrains Mono',monospace",color:"#60a5fa",fontWeight:500 }}>1.0 — Fully Pro-Ukrainian</span>
                <span style={{ fontSize:10,fontFamily:"'JetBrains Mono',monospace",color:"#f87171",fontWeight:500 }}>Fully Pro-Russian — 5.0</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}