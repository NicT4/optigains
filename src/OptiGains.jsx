import { useState, useEffect, useRef, useCallback } from "react";

// ─── CONSTANTS ───────────────────────────────────────────────────────────────

const APP_VERSION = "1.0.0";
const STORAGE_KEY = "optigains_v1";

const GOAL_MODES = {
  bulk: { label: "Lean Bulk", color: "#4ade80", icon: "📈" },
  cut: { label: "Cut", color: "#f87171", icon: "📉" },
  maintain: { label: "Maintain", color: "#60a5fa", icon: "⚖️" },
};

const SESSION_TYPES = ["Push", "Pull", "Legs", "Upper", "Full Body", "Arms", "Cardio"];

const DEFAULT_SESSIONS = [
  {
    id: "mon", day: "Monday", type: "Push", color: "#FF6B35", icon: "💪",
    exercises: [
      { id: "e1", name: "Incline DB Press", sets: 3, reps: "8–12", notes: "1 rep short of failure", muscleGroup: "Chest", supersetWith: null },
      { id: "e2", name: "Barbell Shoulder Press", sets: 3, reps: "6–10", notes: "1 rep short of failure", muscleGroup: "Shoulders", supersetWith: null },
      { id: "e3", name: "Machine Chest Fly", sets: 3, reps: "12–15", notes: "To failure", muscleGroup: "Chest", supersetWith: null },
      { id: "e4", name: "Lateral Raise", sets: 3, reps: "15–20", notes: "To failure", muscleGroup: "Shoulders", supersetWith: null },
      { id: "e5", name: "Tricep Pushdown", sets: 3, reps: "12–15", notes: "To failure", muscleGroup: "Triceps", supersetWith: null },
      { id: "e6", name: "Overhead Cable Tricep Extension", sets: 3, reps: "12–15", notes: "To failure", muscleGroup: "Triceps", supersetWith: null },
    ],
  },
  {
    id: "tue", day: "Tuesday", type: "Pull", color: "#4ECDC4", icon: "🏋️",
    exercises: [
      { id: "e7", name: "Weighted Pull Up / Lat Pulldown", sets: 3, reps: "6–10", notes: "1 rep short of failure", muscleGroup: "Back", supersetWith: null },
      { id: "e8", name: "Barbell Row", sets: 3, reps: "6–10", notes: "1 rep short of failure", muscleGroup: "Back", supersetWith: null },
      { id: "e9", name: "Rear Delt Fly", sets: 3, reps: "15–20", notes: "To failure", muscleGroup: "Rear Delts", supersetWith: null },
      { id: "e10", name: "Incline DB Curl", sets: 3, reps: "10–15", notes: "To failure", muscleGroup: "Biceps", supersetWith: null },
      { id: "e11", name: "Hammer Curl", sets: 3, reps: "10–15", notes: "To failure", muscleGroup: "Biceps", supersetWith: null },
      { id: "e12", name: "Lower Back Extension", sets: 2, reps: "15", notes: "Controlled", muscleGroup: "Lower Back", supersetWith: null },
    ],
  },
  {
    id: "thu", day: "Thursday", type: "Legs", color: "#A855F7", icon: "🦵",
    exercises: [
      { id: "e13", name: "Barbell Squat", sets: 3, reps: "3–5", notes: "1 rep short of failure", muscleGroup: "Quads", supersetWith: null },
      { id: "e14", name: "Romanian Deadlift", sets: 3, reps: "8–12", notes: "1–2 reps short", muscleGroup: "Hamstrings", supersetWith: null },
      { id: "e15", name: "Leg Press", sets: 3, reps: "10–15", notes: "To failure", muscleGroup: "Quads", supersetWith: null },
      { id: "e16", name: "Leg Curl", sets: 3, reps: "12–15", notes: "To failure", muscleGroup: "Hamstrings", supersetWith: null },
      { id: "e17", name: "Calf Raise", sets: 3, reps: "15–20", notes: "To failure", muscleGroup: "Calves", supersetWith: null },
      { id: "e18", name: "Weighted Leg Raise", sets: 2, reps: "To failure", notes: "Abs finisher", muscleGroup: "Abs", supersetWith: null },
    ],
  },
  {
    id: "fri", day: "Friday", type: "Upper", color: "#F59E0B", icon: "⚡",
    exercises: [
      { id: "e19", name: "Machine Chest Press", sets: 3, reps: "10–15", notes: "1 rep short of failure", muscleGroup: "Chest", supersetWith: null },
      { id: "e20", name: "Neutral Grip Lat Pulldown", sets: 3, reps: "10–15", notes: "1 rep short of failure", muscleGroup: "Back", supersetWith: null },
      { id: "e21", name: "Machine Supported Row", sets: 3, reps: "10–15", notes: "1 rep short of failure", muscleGroup: "Back", supersetWith: null },
      { id: "e22", name: "Machine Shoulder Press", sets: 3, reps: "10–15", notes: "1 rep short of failure", muscleGroup: "Shoulders", supersetWith: null },
      { id: "e23", name: "Machine Chest Fly", sets: 3, reps: "12–15", notes: "To failure", muscleGroup: "Chest", supersetWith: null },
      { id: "e24", name: "Lateral Raise", sets: 3, reps: "15–20", notes: "To failure", muscleGroup: "Shoulders", supersetWith: null },
      { id: "e25", name: "Cable Curl", sets: 3, reps: "12–15", notes: "To failure", muscleGroup: "Biceps", supersetWith: "e26" },
      { id: "e26", name: "Tricep Pushdown", sets: 3, reps: "12–15", notes: "To failure", muscleGroup: "Triceps", supersetWith: "e25" },
    ],
  },
];

const EXERCISE_ALTERNATIVES = {
  Chest: [
    { name: "Flat DB Press", reps: "8–12", notes: "1 rep short of failure" },
    { name: "Push Up (Weighted)", reps: "10–15", notes: "To failure" },
    { name: "Cable Chest Fly", reps: "12–15", notes: "To failure" },
    { name: "Pec Deck Machine", reps: "12–15", notes: "To failure" },
    { name: "Smith Machine Incline Press", reps: "8–12", notes: "1 rep short of failure" },
  ],
  Shoulders: [
    { name: "DB Shoulder Press", reps: "8–12", notes: "1 rep short of failure" },
    { name: "Arnold Press", reps: "10–12", notes: "1 rep short of failure" },
    { name: "Cable Lateral Raise", reps: "15–20", notes: "To failure" },
    { name: "Seated DB Lateral Raise", reps: "15–20", notes: "To failure" },
    { name: "Machine Shoulder Press", reps: "10–15", notes: "1 rep short of failure" },
  ],
  Triceps: [
    { name: "Tricep Dips", reps: "To failure", notes: "To failure" },
    { name: "Close Grip Bench Press", reps: "8–12", notes: "1 rep short of failure" },
    { name: "DB Skull Crusher", reps: "10–15", notes: "1 rep short of failure" },
    { name: "Cable Tricep Kickback", reps: "12–15", notes: "To failure" },
    { name: "Single Arm DB Extension", reps: "12–15", notes: "To failure" },
  ],
  Back: [
    { name: "DB Row (Single Arm)", reps: "8–12", notes: "1 rep short of failure" },
    { name: "Cable Row (Seated)", reps: "10–15", notes: "1 rep short of failure" },
    { name: "T-Bar Row", reps: "8–12", notes: "1 rep short of failure" },
    { name: "Wide Grip Pulldown", reps: "10–15", notes: "1 rep short of failure" },
    { name: "Inverted Row", reps: "To failure", notes: "To failure" },
  ],
  "Rear Delts": [
    { name: "Face Pull (Cable)", reps: "15–20", notes: "To failure" },
    { name: "Band Pull Apart", reps: "20–25", notes: "To failure" },
    { name: "Reverse Pec Deck", reps: "15–20", notes: "To failure" },
    { name: "Incline Rear Delt Raise", reps: "15–20", notes: "To failure" },
  ],
  Biceps: [
    { name: "Barbell Curl", reps: "8–12", notes: "To failure" },
    { name: "Cable Curl", reps: "12–15", notes: "To failure" },
    { name: "Preacher Curl", reps: "10–15", notes: "To failure" },
    { name: "Concentration Curl", reps: "12–15", notes: "To failure" },
    { name: "EZ Bar Curl", reps: "10–12", notes: "To failure" },
  ],
  "Lower Back": [
    { name: "Hyperextension", reps: "15–20", notes: "Controlled" },
    { name: "Good Morning (Light)", reps: "12–15", notes: "Controlled" },
    { name: "Superman Hold", reps: "15–20", notes: "Controlled" },
  ],
  Quads: [
    { name: "Hack Squat", reps: "10–15", notes: "To failure" },
    { name: "Bulgarian Split Squat", reps: "10–12", notes: "1 rep short" },
    { name: "Goblet Squat", reps: "12–15", notes: "To failure" },
    { name: "Smith Machine Squat", reps: "8–12", notes: "1 rep short" },
    { name: "Leg Extension", reps: "12–15", notes: "To failure" },
  ],
  Hamstrings: [
    { name: "Seated Leg Curl", reps: "12–15", notes: "To failure" },
    { name: "Nordic Curl", reps: "6–10", notes: "1 rep short" },
    { name: "Stiff Leg Deadlift (DB)", reps: "10–12", notes: "1 rep short" },
    { name: "Cable Pull Through", reps: "12–15", notes: "To failure" },
  ],
  Calves: [
    { name: "Seated Calf Raise", reps: "15–20", notes: "To failure" },
    { name: "Leg Press Calf Raise", reps: "15–20", notes: "To failure" },
    { name: "Single Leg Calf Raise", reps: "To failure", notes: "To failure" },
  ],
  Abs: [
    { name: "Cable Crunch", reps: "15–20", notes: "To failure" },
    { name: "Hanging Knee Raise", reps: "To failure", notes: "To failure" },
    { name: "Ab Wheel Rollout", reps: "10–15", notes: "To failure" },
    { name: "Decline Sit Up", reps: "15–20", notes: "To failure" },
  ],
};

const MUSCLE_GROUPS = ["Chest", "Back", "Shoulders", "Rear Delts", "Biceps", "Triceps", "Quads", "Hamstrings", "Calves", "Abs", "Lower Back"];
const REST_PRESETS = [{ label: "60s", seconds: 60 }, { label: "90s", seconds: 90 }, { label: "2m", seconds: 120 }, { label: "3m", seconds: 180 }];
const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const SESSION_COLORS = ["#FF6B35", "#4ECDC4", "#A855F7", "#F59E0B", "#4ade80", "#f87171", "#60a5fa"];
const SESSION_ICONS = { Push: "💪", Pull: "🏋️", Legs: "🦵", Upper: "⚡", "Full Body": "🔥", Arms: "💪", Cardio: "🏃" };

// ─── SUPABASE CONFIG ──────────────────────────────────────────────────────────

const SUPABASE_URL = "https://elbgsmahfnayjqyrevwe.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVsYmdzbWFoZm5heWpxeXJldndlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4Njg3OTksImV4cCI6MjA5MzQ0NDc5OX0.kAlsjV5p2O9jPftH8Got6OG7xij3cXHjZKEjGIIrdgg";

// Lazy-load Supabase JS client to avoid CORS/allowlist issues with raw fetch
let _supabase = null;
async function getSupabase() {
  if (_supabase) return _supabase;
  // Dynamically import from CDN
  const { createClient } = await import("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm");
  _supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  return _supabase;
}

const sb = {
  async upsert(table, body) {
    try {
      const client = await getSupabase();
      const { data, error } = await client.from(table).upsert(body, { onConflict: Object.keys(body)[0] });
      if (error) { console.warn("Supabase upsert error:", error); return null; }
      return data;
    } catch(e) { console.warn("Supabase upsert failed:", e); return null; }
  },
  async get(table, filters = {}) {
    try {
      const client = await getSupabase();
      let query = client.from(table).select("*");
      Object.entries(filters).forEach(([k, v]) => { query = query.eq(k, v); });
      const { data, error } = await query;
      if (error) { console.warn("Supabase get error:", error); return null; }
      return data;
    } catch(e) { console.warn("Supabase get failed:", e); return null; }
  },
  async getOrdered(table, orderCol, limit = null) {
    try {
      const client = await getSupabase();
      let query = client.from(table).select("*").order(orderCol, { ascending: true });
      if (limit) query = query.limit(limit);
      const { data, error } = await query;
      if (error) { console.warn("Supabase getOrdered error:", error); return null; }
      return data;
    } catch(e) { console.warn("Supabase getOrdered failed:", e); return null; }
  },
};

// ─── STORAGE ──────────────────────────────────────────────────────────────────

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch { return null; }
}

function saveData(data) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
}

function initData() {
  const saved = loadData();
  if (saved) return saved;
  return {
    settings: { goalMode: "bulk", calorieTarget: 2500, weightUnit: "kg", deloadWeek: 0, startDate: new Date().toISOString() },
    sessions: DEFAULT_SESSIONS,
    skippedSessions: {},
    workoutHistory: [],
    prs: {},
    bodyWeight: [],
    nutrition: [],
    chatHistory: [],
    customExercises: [],
  };
}

// ─── SUPABASE SYNC ────────────────────────────────────────────────────────────

async function syncToSupabase(data) {
  try {
    await sb.upsert("app_settings", { id: 1, data: data.settings });
    await sb.upsert("sessions", { id: 1, data: data.sessions, skipped: data.skippedSessions || {} });

    for (const bw of (data.bodyWeight || [])) {
      await sb.upsert("body_weight", { date: bw.date, value: bw.value });
    }
    for (const n of (data.nutrition || [])) {
      await sb.upsert("nutrition", { date: n.date, calories: n.calories, notes: n.notes || "" });
    }
    for (const [exercise, pr] of Object.entries(data.prs || {})) {
      await sb.upsert("personal_records", { exercise, weight: pr.weight, date: pr.date });
    }
    for (const w of (data.workoutHistory || []).slice(0, 50)) {
      await sb.upsert("workout_history", {
        id: w.id, session_id: w.sessionId, session_type: w.sessionType,
        date: w.date, log: w.log, exercises: w.exercises, duration: w.duration || 0
      });
    }
  } catch (e) { console.warn("Supabase sync error:", e); }
}

async function loadFromSupabase() {
  try {
    const [settingsRes, sessionsRes, bwRes, nutRes, prRes, histRes] = await Promise.all([
      sb.get("app_settings", { id: 1 }),
      sb.get("sessions", { id: 1 }),
      sb.getOrdered("body_weight", "date"),
      sb.getOrdered("nutrition", "date"),
      sb.get("personal_records"),
      sb.getOrdered("workout_history", "date"),
    ]);

    const settings = settingsRes?.[0]?.data || null;
    const sessionsData = sessionsRes?.[0] || null;
    const bodyWeight = (bwRes || []).map(r => ({ date: r.date, value: r.value }));
    const nutrition = (nutRes || []).map(r => ({ date: r.date, calories: r.calories, notes: r.notes }));
    const prs = {};
    (prRes || []).forEach(r => { prs[r.exercise] = { weight: r.weight, date: r.date, exercise: r.exercise }; });
    const workoutHistory = (histRes || []).reverse().map(r => ({
      id: r.id, sessionId: r.session_id, sessionType: r.session_type,
      date: r.date, log: r.log, exercises: r.exercises, duration: r.duration
    }));

    if (!settings) return null;

    return {
      settings,
      sessions: sessionsData?.data || DEFAULT_SESSIONS,
      skippedSessions: sessionsData?.skipped || {},
      bodyWeight,
      nutrition,
      prs,
      workoutHistory,
      chatHistory: [],
      customExercises: [],
    };
  } catch (e) { console.warn("Supabase load error:", e); return null; }
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function uid() { return Math.random().toString(36).slice(2, 9); }
function today() { return new Date().toISOString().slice(0, 10); }
function formatDate(iso) { return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" }); }
function formatTime(s) { return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`; }
function getLast(arr, n) { return arr.slice(-n); }
function avg(arr) { return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0; }

function getWeekNumber(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const y = new Date(d.getFullYear(), 0, 1);
  return Math.ceil((((d - y) / 86400000) + 1) / 7);
}

// ─── CIRCULAR TIMER ──────────────────────────────────────────────────────────

function CircularTimer({ timeLeft, total, color }) {
  const r = 52;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - (total > 0 ? timeLeft / total : 0));
  return (
    <svg width="136" height="136" style={{ transform: "rotate(-90deg)" }}>
      <circle cx="68" cy="68" r={r} fill="none" stroke="#1a1f2e" strokeWidth="8" />
      <circle cx="68" cy="68" r={r} fill="none" stroke={color} strokeWidth="8"
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 0.8s linear" }} />
    </svg>
  );
}

// ─── MINI SPARKLINE ──────────────────────────────────────────────────────────

function Sparkline({ data, color, width = 120, height = 36 }) {
  if (!data || data.length < 2) return <div style={{ width, height, opacity: 0.3, background: "#1a1f2e", borderRadius: 4 }} />;
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg width={width} height={height}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />
    </svg>
  );
}

// ─── MINI BAR CHART ──────────────────────────────────────────────────────────

function MiniBarChart({ data, target, color, width = 280, height = 80 }) {
  if (!data || data.length === 0) return null;
  const max = Math.max(target * 1.2, ...data.map(d => d.value));
  return (
    <svg width={width} height={height}>
      {data.map((d, i) => {
        const bw = (width / data.length) - 4;
        const x = i * (width / data.length) + 2;
        const bh = Math.max(2, (d.value / max) * (height - 16));
        const y = height - 14 - bh;
        const over = d.value > target;
        return (
          <g key={i}>
            <rect x={x} y={y} width={bw} height={bh} rx="3" fill={over ? "#f87171" : color} opacity="0.85" />
            <text x={x + bw / 2} y={height - 2} textAnchor="middle" fontSize="9" fill="#555">{d.label}</text>
          </g>
        );
      })}
      <line x1="0" y1={height - 14 - (target / max) * (height - 16)} x2={width} y2={height - 14 - (target / max) * (height - 16)} stroke={color} strokeDasharray="4,3" strokeWidth="1" opacity="0.4" />
    </svg>
  );
}

// ─── LINE CHART ──────────────────────────────────────────────────────────────

function LineChart({ data, color, width = 300, height = 120, showAvg, avgColor }) {
  if (!data || data.length < 2) return <div style={{ width, height, display: "flex", alignItems: "center", justifyContent: "center", color: "#333", fontSize: 13 }}>Not enough data yet</div>;
  const vals = data.map(d => d.value);
  const min = Math.min(...vals) - 0.5, max = Math.max(...vals) + 0.5;
  const range = max - min || 1;
  const toX = i => (i / (data.length - 1)) * (width - 20) + 10;
  const toY = v => height - 20 - ((v - min) / range) * (height - 30);
  const pts = data.map((d, i) => `${toX(i)},${toY(d.value)}`).join(" ");
  const avgVal = avg(vals);
  const avgY = toY(avgVal);
  return (
    <svg width={width} height={height}>
      <defs>
        <linearGradient id={`grad_${color.replace("#","")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`10,${height - 20} ${pts} ${toX(data.length - 1)},${height - 20}`} fill={`url(#grad_${color.replace("#","")})`} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {showAvg && <line x1="10" y1={avgY} x2={width - 10} y2={avgY} stroke={avgColor || "#888"} strokeDasharray="4,3" strokeWidth="1.5" />}
      {data.map((d, i) => i === data.length - 1 && (
        <circle key={i} cx={toX(i)} cy={toY(d.value)} r="4" fill={color} stroke="#0d1117" strokeWidth="2" />
      ))}
      <text x="10" y={height - 4} fontSize="10" fill="#444">{data[0]?.label}</text>
      <text x={width - 10} y={height - 4} fontSize="10" fill="#444" textAnchor="end">{data[data.length - 1]?.label}</text>
    </svg>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────

export default function OptiGains() {
  const [data, setData] = useState(() => initData());
  const [tab, setTab] = useState("dashboard");
  const [workoutState, setWorkoutState] = useState(null);
  const [modal, setModal] = useState(null);
  const [syncStatus, setSyncStatus] = useState("idle"); // idle | syncing | synced | error
  const syncTimer = useRef(null);

  // On first load, try to pull from Supabase
  useEffect(() => {
    setSyncStatus("syncing");
    loadFromSupabase().then(cloud => {
      if (cloud) {
        setData(cloud);
        saveData(cloud);
        setSyncStatus("synced");
      } else {
        setSyncStatus("idle");
      }
    }).catch(() => setSyncStatus("error"));
  }, []);

  // Save locally immediately, sync to Supabase debounced
  useEffect(() => {
    saveData(data);
    clearTimeout(syncTimer.current);
    syncTimer.current = setTimeout(() => {
      setSyncStatus("syncing");
      syncToSupabase(data)
        .then(() => setSyncStatus("synced"))
        .catch(() => setSyncStatus("error"));
    }, 1500);
    return () => clearTimeout(syncTimer.current);
  }, [data]);

  const update = useCallback((fn) => setData(prev => { const next = { ...prev }; fn(next); return next; }), []);

  // ─── RENDER ───────────────────────────────────────────────────────────────

  const syncDot = { idle: null, syncing: "#f59e0b", synced: "#4ade80", error: "#f87171" }[syncStatus];

  return (
    <div style={{ background: "#0d1117", minHeight: "100vh", color: "#e6edf3", fontFamily: "'DM Mono', 'Courier New', monospace", maxWidth: 430, margin: "0 auto", position: "relative" }}>
      {/* Sync indicator */}
      {syncDot && (
        <div style={{ position: "fixed", top: 12, right: 16, zIndex: 999, display: "flex", alignItems: "center", gap: 5 }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: syncDot, boxShadow: `0 0 6px ${syncDot}` }} />
          <span style={{ fontSize: 10, color: syncDot, fontWeight: 700, letterSpacing: 0.5 }}>
            {syncStatus === "syncing" ? "SYNCING" : syncStatus === "synced" ? "SAVED" : "OFFLINE"}
          </span>
        </div>
      )}
      {workoutState
        ? <WorkoutScreen data={data} update={update} workoutState={workoutState} setWorkoutState={setWorkoutState} />
        : <>
          <div style={{ paddingBottom: 72 }}>
            {tab === "dashboard" && <DashboardTab data={data} update={update} setWorkoutState={setWorkoutState} />}
            {tab === "workout" && <WorkoutTab data={data} update={update} setWorkoutState={setWorkoutState} modal={modal} setModal={setModal} />}
            {tab === "nutrition" && <NutritionTab data={data} update={update} />}
            {tab === "progress" && <ProgressTab data={data} />}
            {tab === "coach" && <CoachTab data={data} update={update} />}
            {tab === "settings" && <SettingsTab data={data} update={update} />}
          </div>
          <BottomNav tab={tab} setTab={setTab} />
        </>
      }
    </div>
  );
}

// ─── BOTTOM NAV ──────────────────────────────────────────────────────────────

function BottomNav({ tab, setTab }) {
  const items = [
    { id: "dashboard", icon: "⊞", label: "Home" },
    { id: "workout", icon: "🏋️", label: "Train" },
    { id: "nutrition", icon: "🥗", label: "Nutrition" },
    { id: "progress", icon: "📈", label: "Progress" },
    { id: "coach", icon: "🤖", label: "Coach" },
    { id: "settings", icon: "⚙️", label: "Settings" },
  ];
  return (
    <nav style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430, background: "#0d1117", borderTop: "1px solid #1a1f2e", display: "flex", zIndex: 100 }}>
      {items.map(it => (
        <button key={it.id} onClick={() => setTab(it.id)} style={{ flex: 1, padding: "10px 0 14px", background: "none", border: "none", color: tab === it.id ? "#4ade80" : "#3d4451", fontSize: 9, fontWeight: 700, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, letterSpacing: 0.5, fontFamily: "inherit", transition: "color 0.2s" }}>
          <span style={{ fontSize: 18 }}>{it.icon}</span>
          {it.label.toUpperCase()}
        </button>
      ))}
    </nav>
  );
}

// ─── DASHBOARD TAB ───────────────────────────────────────────────────────────

function DashboardTab({ data, update, setWorkoutState }) {
  const { settings, bodyWeight, nutrition, workoutHistory, sessions, prs } = data;
  const goal = GOAL_MODES[settings.goalMode];
  const todayStr = today();
  const todayDay = new Date().toLocaleDateString("en-US", { weekday: "long" });
  const todaySession = sessions.find(s => s.day === todayDay && !data.skippedSessions?.[`${todayStr}_${s.id}`]);
  const recentWeights = getLast(bodyWeight, 8).map(w => w.value);
  const avg7 = avg(getLast(bodyWeight, 7).map(w => w.value));
  const latestWeight = bodyWeight[bodyWeight.length - 1]?.value;
  const todayNutrition = nutrition.find(n => n.date === todayStr);
  const cals = todayNutrition?.calories || 0;
  const calPct = Math.min(100, (cals / settings.calorieTarget) * 100);
  const thisWeekSessions = workoutHistory.filter(w => {
    const d = new Date(w.date);
    const now = new Date();
    const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - ((now.getDay() + 6) % 7));
    weekStart.setHours(0, 0, 0, 0);
    return d >= weekStart;
  }).length;
  const weeklyPRs = Object.values(prs).filter(pr => {
    const d = new Date(pr.date);
    const now = new Date();
    return (now - d) < 7 * 86400000;
  });
  const weeksTraining = Math.floor((new Date() - new Date(settings.startDate)) / (7 * 86400000));
  const deloadDue = weeksTraining > 0 && (weeksTraining - settings.deloadWeek) >= 5;

  return (
    <div style={{ padding: "52px 16px 16px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <p style={{ margin: 0, fontSize: 11, color: "#3d4451", letterSpacing: 2, fontWeight: 700 }}>{todayDay.toUpperCase()} · OPTIGAINS</p>
          <h1 style={{ margin: "4px 0 0", fontSize: 28, fontWeight: 700, letterSpacing: -1, color: "#e6edf3" }}>Dashboard</h1>
        </div>
        <div style={{ background: `${goal.color}18`, border: `1px solid ${goal.color}44`, borderRadius: 20, padding: "6px 14px", display: "flex", alignItems: "center", gap: 6 }}>
          <span>{goal.icon}</span>
          <span style={{ color: goal.color, fontSize: 12, fontWeight: 700, letterSpacing: 0.5 }}>{goal.label.toUpperCase()}</span>
        </div>
      </div>

      {/* Deload Warning */}
      {deloadDue && (
        <div style={{ background: "#f59e0b18", border: "1px solid #f59e0b44", borderRadius: 12, padding: "12px 16px", marginBottom: 12, display: "flex", gap: 10, alignItems: "center" }}>
          <span style={{ fontSize: 20 }}>⚠️</span>
          <div>
            <p style={{ margin: 0, fontWeight: 700, color: "#f59e0b", fontSize: 13 }}>Deload Due</p>
            <p style={{ margin: 0, color: "#888", fontSize: 12 }}>{weeksTraining - settings.deloadWeek} weeks since last deload. Consider reducing volume this week.</p>
          </div>
        </div>
      )}

      {/* PR Badge */}
      {weeklyPRs.length > 0 && (
        <div style={{ background: "#4ade8018", border: "1px solid #4ade8044", borderRadius: 12, padding: "12px 16px", marginBottom: 12, display: "flex", gap: 10, alignItems: "center" }}>
          <span style={{ fontSize: 20 }}>🏆</span>
          <div>
            <p style={{ margin: 0, fontWeight: 700, color: "#4ade80", fontSize: 13 }}>New PR This Week!</p>
            <p style={{ margin: 0, color: "#888", fontSize: 12 }}>{weeklyPRs.map(p => p.exercise).join(", ")}</p>
          </div>
        </div>
      )}

      {/* Today's Session */}
      {todaySession && (
        <div style={{ background: `${todaySession.color}12`, border: `1px solid ${todaySession.color}33`, borderRadius: 16, padding: "16px", marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <p style={{ margin: "0 0 4px", fontSize: 11, color: todaySession.color, fontWeight: 700, letterSpacing: 1 }}>TODAY'S SESSION</p>
              <p style={{ margin: "0 0 2px", fontSize: 20, fontWeight: 700 }}>{todaySession.icon} {todaySession.type} Day</p>
              <p style={{ margin: 0, fontSize: 12, color: "#555" }}>{todaySession.exercises.length} exercises · {todaySession.exercises.reduce((a, e) => a + e.sets, 0)} sets</p>
            </div>
            <button onClick={() => { const init = {}; todaySession.exercises.forEach((ex, i) => { init[i] = {}; for (let s = 0; s < ex.sets; s++) init[i][s] = { weight: "", reps: "", done: false, dropSets: [] }; }); setWorkoutState({ session: todaySession, logData: init, activeEx: 0, startTime: Date.now(), swapped: {}, supersets: {} }); }}
              style={{ background: todaySession.color, border: "none", borderRadius: 12, padding: "10px 18px", color: "#0d1117", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
              START →
            </button>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
        {/* Body Weight */}
        <div style={{ background: "#111827", border: "1px solid #1a1f2e", borderRadius: 14, padding: "14px" }}>
          <p style={{ margin: "0 0 4px", fontSize: 10, color: "#3d4451", fontWeight: 700, letterSpacing: 1 }}>BODYWEIGHT</p>
          <p style={{ margin: "0 0 2px", fontSize: 24, fontWeight: 700, color: "#60a5fa" }}>{latestWeight ? `${latestWeight}` : "—"}<span style={{ fontSize: 12, color: "#555" }}> {settings.weightUnit}</span></p>
          <p style={{ margin: "0 0 8px", fontSize: 11, color: "#555" }}>7d avg: {avg7 ? avg7.toFixed(1) : "—"}{settings.weightUnit}</p>
          <Sparkline data={recentWeights} color="#60a5fa" width={110} height={28} />
        </div>

        {/* Calories */}
        <div style={{ background: "#111827", border: "1px solid #1a1f2e", borderRadius: 14, padding: "14px" }}>
          <p style={{ margin: "0 0 4px", fontSize: 10, color: "#3d4451", fontWeight: 700, letterSpacing: 1 }}>CALORIES</p>
          <p style={{ margin: "0 0 2px", fontSize: 24, fontWeight: 700, color: cals >= settings.calorieTarget ? "#4ade80" : "#f59e0b" }}>{cals}<span style={{ fontSize: 12, color: "#555" }}>/{settings.calorieTarget}</span></p>
          <p style={{ margin: "0 0 8px", fontSize: 11, color: "#555" }}>{cals >= settings.calorieTarget ? "✓ Target hit" : `${settings.calorieTarget - cals} remaining`}</p>
          <div style={{ background: "#1a1f2e", borderRadius: 4, height: 6 }}>
            <div style={{ background: cals >= settings.calorieTarget ? "#4ade80" : "#f59e0b", width: `${calPct}%`, height: "100%", borderRadius: 4, transition: "width 0.5s ease" }} />
          </div>
        </div>
      </div>

      {/* Weekly Workout Ring */}
      <div style={{ background: "#111827", border: "1px solid #1a1f2e", borderRadius: 14, padding: "14px 16px", marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <p style={{ margin: "0 0 4px", fontSize: 10, color: "#3d4451", fontWeight: 700, letterSpacing: 1 }}>WEEKLY SESSIONS</p>
            <p style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>{thisWeekSessions}<span style={{ fontSize: 13, color: "#555" }}>/{sessions.length} done</span></p>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {sessions.map((s, i) => {
              const done = workoutHistory.some(w => {
                const d = new Date(w.date);
                const now = new Date();
                const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - ((now.getDay() + 6) % 7));
                weekStart.setHours(0, 0, 0, 0);
                return d >= weekStart && w.sessionId === s.id;
              });
              return <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: done ? s.color : "#1a1f2e", border: `1px solid ${done ? s.color : "#2a2f3e"}` }} />;
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── WORKOUT TAB ─────────────────────────────────────────────────────────────

function WorkoutTab({ data, update, setWorkoutState, modal, setModal }) {
  const { sessions, skippedSessions } = data;
  const todayStr = today();
  const [editingSession, setEditingSession] = useState(null);
  const [showAddSession, setShowAddSession] = useState(false);
  const [workoutSubTab, setWorkoutSubTab] = useState("plan"); // plan | history
  const [viewingHistory, setViewingHistory] = useState(null); // workout entry being viewed/edited
  const [editingLog, setEditingLog] = useState(null); // deep copy of log being edited

  const startWorkout = (session) => {
    const init = {};
    session.exercises.forEach((ex, i) => { init[i] = {}; for (let s = 0; s < ex.sets; s++) init[i][s] = { weight: "", reps: "", done: false, dropSets: [] }; });
    setWorkoutState({ session, logData: init, activeEx: 0, startTime: Date.now(), swapped: {}, supersets: {} });
  };

  const skipSession = (sessionId) => update(d => { if (!d.skippedSessions) d.skippedSessions = {}; d.skippedSessions[`${todayStr}_${sessionId}`] = true; });
  const unskipSession = (sessionId) => update(d => { if (d.skippedSessions) delete d.skippedSessions[`${todayStr}_${sessionId}`]; });
  const deleteSession = (sessionId) => update(d => { d.sessions = d.sessions.filter(s => s.id !== sessionId); });

  const openHistory = (entry) => {
    setViewingHistory(entry);
    setEditingLog(JSON.parse(JSON.stringify(entry.log || {})));
  };

  const saveHistoryEdit = () => {
    update(d => {
      const idx = d.workoutHistory.findIndex(w => w.id === viewingHistory.id);
      if (idx >= 0) d.workoutHistory[idx] = { ...d.workoutHistory[idx], log: editingLog };
    });
    setViewingHistory(prev => ({ ...prev, log: editingLog }));
    alert("Changes saved!");
  };

  const deleteHistoryEntry = (id) => {
    if (!window.confirm("Delete this workout entry?")) return;
    update(d => { d.workoutHistory = d.workoutHistory.filter(w => w.id !== id); });
    setViewingHistory(null);
  };

  // If viewing a history entry, show detail view
  if (viewingHistory) {
    const entry = viewingHistory;
    const sessionColor = sessions.find(s => s.id === entry.sessionId)?.color || "#4ade80";
    return (
      <div style={{ padding: "20px 16px 80px" }}>
        <button onClick={() => setViewingHistory(null)} style={{ background: "none", border: "none", color: "#555", fontSize: 14, cursor: "pointer", fontFamily: "inherit", marginBottom: 16, padding: 0 }}>← Back to History</button>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <div>
            <p style={{ margin: "0 0 4px", fontSize: 11, color: sessionColor, fontWeight: 700, letterSpacing: 1 }}>{entry.sessionType?.toUpperCase()} DAY</p>
            <h2 style={{ margin: "0 0 2px", fontSize: 22, fontWeight: 700 }}>{formatDate(entry.date)}</h2>
            <p style={{ margin: 0, fontSize: 12, color: "#555" }}>{new Date(entry.date).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })} · {entry.duration || 0} mins</p>
          </div>
          <button onClick={() => deleteHistoryEntry(entry.id)} style={{ background: "#f8717118", border: "1px solid #f8717144", borderRadius: 10, padding: "7px 12px", color: "#f87171", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>🗑 Delete</button>
        </div>

        {(entry.exercises || []).map((ex, ei) => {
          const sets = editingLog?.[ei] || {};
          return (
            <div key={ei} style={{ background: "#111827", border: `1px solid ${sessionColor}22`, borderRadius: 14, padding: "14px", marginBottom: 10 }}>
              <p style={{ margin: "0 0 2px", fontSize: 11, color: sessionColor, fontWeight: 700, letterSpacing: 0.5 }}>{ex.muscleGroup?.toUpperCase()}</p>
              <p style={{ margin: "0 0 10px", fontSize: 16, fontWeight: 700 }}>{ex.name}</p>
              {/* Set rows editable */}
              <div style={{ background: "#0d1117", borderRadius: 10, padding: "0 10px" }}>
                <div style={{ display: "flex", gap: 6, padding: "8px 0 6px", borderBottom: "1px solid #1a1f2e" }}>
                  <span style={{ width: 28, fontSize: 10, color: "#3d4451", fontWeight: 700 }}>SET</span>
                  <span style={{ flex: 1, textAlign: "center", fontSize: 10, color: "#3d4451", fontWeight: 700 }}>KG</span>
                  <span style={{ flex: 1, textAlign: "center", fontSize: 10, color: "#3d4451", fontWeight: 700 }}>REPS</span>
                  <span style={{ width: 50, textAlign: "center", fontSize: 10, color: "#3d4451", fontWeight: 700 }}>DONE</span>
                </div>
                {Object.entries(sets).map(([si, setData]) => (
                  <div key={si} style={{ display: "flex", gap: 6, padding: "7px 0", borderBottom: "1px solid #1a1f2e", alignItems: "center" }}>
                    <span style={{ width: 28, fontSize: 13, fontWeight: 700, color: setData.done ? sessionColor : "#3d4451" }}>{parseInt(si) + 1}</span>
                    <input type="number" value={setData.weight || ""} onChange={e => setEditingLog(prev => ({ ...prev, [ei]: { ...prev[ei], [si]: { ...prev[ei][si], weight: e.target.value } } }))} style={{ flex: 1, background: "#1a1f2e", border: "1px solid #2a2f3e", borderRadius: 8, color: "#e6edf3", fontSize: 14, fontWeight: 700, textAlign: "center", padding: "6px 4px", fontFamily: "inherit", outline: "none" }} placeholder="—" />
                    <input type="number" value={setData.reps || ""} onChange={e => setEditingLog(prev => ({ ...prev, [ei]: { ...prev[ei], [si]: { ...prev[ei][si], reps: e.target.value } } }))} style={{ flex: 1, background: "#1a1f2e", border: "1px solid #2a2f3e", borderRadius: 8, color: "#e6edf3", fontSize: 14, fontWeight: 700, textAlign: "center", padding: "6px 4px", fontFamily: "inherit", outline: "none" }} placeholder="—" />
                    <div style={{ width: 50, textAlign: "center" }}>
                      <span style={{ fontSize: 14, color: setData.done ? sessionColor : "#2a2f3e" }}>{setData.done ? "✓" : "○"}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
        <button onClick={saveHistoryEdit} style={{ width: "100%", background: "#4ade80", border: "none", borderRadius: 14, padding: "15px", color: "#0d1117", fontWeight: 700, fontSize: 15, cursor: "pointer", fontFamily: "inherit", marginTop: 8 }}>Save Changes</button>
      </div>
    );
  }

  return (
    <div style={{ padding: "52px 16px 16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, letterSpacing: -1 }}>Training</h1>
        {workoutSubTab === "plan" && <button onClick={() => setShowAddSession(true)} style={{ background: "#4ade8018", border: "1px solid #4ade8044", borderRadius: 10, padding: "8px 14px", color: "#4ade80", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>+ Session</button>}
      </div>

      {/* Sub tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {["plan", "history"].map(t => (
          <button key={t} onClick={() => setWorkoutSubTab(t)} style={{ flex: 1, background: workoutSubTab === t ? "#4ade80" : "#111827", border: `1px solid ${workoutSubTab === t ? "transparent" : "#1a1f2e"}`, borderRadius: 12, padding: "10px", color: workoutSubTab === t ? "#0d1117" : "#555", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit", letterSpacing: 0.5 }}>{t === "plan" ? "📋 PLAN" : "🕐 HISTORY"}</button>
        ))}
      </div>

      {/* History Sub Tab */}
      {workoutSubTab === "history" && (
        <div>
          {(data.workoutHistory || []).length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: "#444" }}>
              <p style={{ fontSize: 36 }}>🏋️</p>
              <p style={{ fontWeight: 700 }}>No workouts logged yet</p>
              <p style={{ fontSize: 13 }}>Complete a session to see it here</p>
            </div>
          ) : (data.workoutHistory || []).map(entry => {
            const color = sessions.find(s => s.id === entry.sessionId)?.color || "#4ade80";
            const doneSets = Object.values(entry.log || {}).reduce((a, ex) => a + Object.values(ex).filter(s => s.done).length, 0);
            const totalSets = Object.values(entry.log || {}).reduce((a, ex) => a + Object.values(ex).length, 0);
            return (
              <div key={entry.id} onClick={() => openHistory(entry)} style={{ background: "#111827", border: `1px solid ${color}22`, borderRadius: 14, padding: "14px 16px", marginBottom: 10, cursor: "pointer", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 0, left: 0, width: 4, height: "100%", background: color }} />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <span style={{ background: `${color}22`, color, padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700 }}>{entry.sessionType}</span>
                    <p style={{ margin: "6px 0 2px", fontWeight: 700, fontSize: 16 }}>{formatDate(entry.date)}</p>
                    <p style={{ margin: 0, fontSize: 12, color: "#555" }}>{new Date(entry.date).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })} · {entry.duration || 0} mins · {(entry.exercises || []).length} exercises</p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ margin: 0, color, fontWeight: 800, fontSize: 20 }}>{doneSets}<span style={{ fontSize: 13, color: "#555" }}>/{totalSets}</span></p>
                    <p style={{ margin: 0, color: "#555", fontSize: 11 }}>SETS</p>
                    <p style={{ margin: "4px 0 0", fontSize: 11, color: "#3d4451" }}>Tap to view ›</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Plan Sub Tab */}
      {workoutSubTab === "plan" && <div>

      {sessions.map(session => {
        const isSkipped = skippedSessions?.[`${todayStr}_${session.id}`];
        return (
          <div key={session.id} style={{ background: "#111827", border: `1px solid ${session.color}22`, borderRadius: 16, padding: "16px", marginBottom: 10, opacity: isSkipped ? 0.5 : 1 }}>
            <div style={{ position: "absolute", display: "none" }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
                  <span style={{ background: `${session.color}22`, color: session.color, padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700 }}>{session.day}</span>
                  {isSkipped && <span style={{ background: "#f8717122", color: "#f87171", padding: "2px 8px", borderRadius: 20, fontSize: 10, fontWeight: 700 }}>SKIPPED TODAY</span>}
                </div>
                <p style={{ margin: "0 0 2px", fontSize: 18, fontWeight: 700 }}>{session.icon} {session.type}</p>
                <p style={{ margin: 0, fontSize: 12, color: "#555" }}>{session.exercises.length} exercises · {session.exercises.reduce((a, e) => a + e.sets, 0)} sets</p>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => setEditingSession(session)} style={{ background: "#1a1f2e", border: "1px solid #2a2f3e", borderRadius: 8, padding: "6px 10px", color: "#888", cursor: "pointer", fontSize: 13, fontFamily: "inherit" }}>✏️</button>
                {!isSkipped
                  ? <button onClick={() => skipSession(session.id)} style={{ background: "#1a1f2e", border: "1px solid #2a2f3e", borderRadius: 8, padding: "6px 10px", color: "#888", cursor: "pointer", fontSize: 13, fontFamily: "inherit" }}>⏭</button>
                  : <button onClick={() => unskipSession(session.id)} style={{ background: "#1a1f2e", border: "1px solid #2a2f3e", borderRadius: 8, padding: "6px 10px", color: "#4ade80", cursor: "pointer", fontSize: 13, fontFamily: "inherit" }}>↩</button>
                }
                <button onClick={() => startWorkout(session)} style={{ background: session.color, border: "none", borderRadius: 8, padding: "6px 14px", color: "#0d1117", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>GO</button>
              </div>
            </div>
          </div>
        );
      })}

      {/* Edit Session Modal */}
      {editingSession && <SessionEditor session={editingSession} update={update} onClose={() => setEditingSession(null)} onDelete={() => { deleteSession(editingSession.id); setEditingSession(null); }} customExercises={data.customExercises || []} />}
      {showAddSession && <AddSessionModal update={update} onClose={() => setShowAddSession(false)} />}
      </div>}
    </div>
  );
}

// ─── SESSION EDITOR ──────────────────────────────────────────────────────────

function SessionEditor({ session, update, onClose, onDelete, customExercises = [] }) {
  const [draft, setDraft] = useState(JSON.parse(JSON.stringify(session)));
  const [showAddEx, setShowAddEx] = useState(false);
  const [supersetPicker, setSupersetPicker] = useState(null);

  const save = () => { update(d => { const idx = d.sessions.findIndex(s => s.id === draft.id); if (idx >= 0) d.sessions[idx] = draft; }); onClose(); };
  const removeEx = (exId) => setDraft(prev => ({ ...prev, exercises: prev.exercises.filter(e => e.id !== exId) }));
  const updateEx = (exId, field, val) => setDraft(prev => ({ ...prev, exercises: prev.exercises.map(e => e.id === exId ? { ...e, [field]: val } : e) }));
  const addSuperset = (exId, withId) => {
    setDraft(prev => ({ ...prev, exercises: prev.exercises.map(e => e.id === exId ? { ...e, supersetWith: withId } : e.id === withId ? { ...e, supersetWith: exId } : e) }));
    setSupersetPicker(null);
  };
  const removeSuperset = (exId) => {
    const ex = draft.exercises.find(e => e.id === exId);
    const partnerId = ex?.supersetWith;
    setDraft(prev => ({ ...prev, exercises: prev.exercises.map(e => e.id === exId || e.id === partnerId ? { ...e, supersetWith: null } : e) }));
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "#000d", zIndex: 200, overflowY: "auto" }}>
      <div style={{ background: "#0d1117", minHeight: "100%", maxWidth: 430, margin: "0 auto", padding: "20px 16px 100px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Edit Session</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#555", fontSize: 22, cursor: "pointer" }}>✕</button>
        </div>

        {/* Day & Type */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
          <div>
            <p style={{ margin: "0 0 6px", fontSize: 11, color: "#555", fontWeight: 700, letterSpacing: 1 }}>DAY</p>
            <select value={draft.day} onChange={e => setDraft(p => ({ ...p, day: e.target.value }))} style={{ width: "100%", background: "#111827", border: "1px solid #1a1f2e", borderRadius: 10, color: "#e6edf3", padding: "10px 12px", fontSize: 14, fontFamily: "inherit" }}>
              {DAYS_OF_WEEK.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <p style={{ margin: "0 0 6px", fontSize: 11, color: "#555", fontWeight: 700, letterSpacing: 1 }}>TYPE</p>
            <select value={draft.type} onChange={e => setDraft(p => ({ ...p, type: e.target.value, icon: SESSION_ICONS[e.target.value] || "💪" }))} style={{ width: "100%", background: "#111827", border: "1px solid #1a1f2e", borderRadius: 10, color: "#e6edf3", padding: "10px 12px", fontSize: 14, fontFamily: "inherit" }}>
              {SESSION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>

        {/* Exercises */}
        <p style={{ margin: "0 0 10px", fontSize: 11, color: "#555", fontWeight: 700, letterSpacing: 1 }}>EXERCISES</p>
        {draft.exercises.map((ex, i) => {
          const partner = draft.exercises.find(e => e.id === ex.supersetWith);
          return (
            <div key={ex.id} style={{ background: "#111827", border: "1px solid #1a1f2e", borderRadius: 12, padding: "12px", marginBottom: 8 }}>
              {partner && ex.supersetWith && draft.exercises.findIndex(e => e.id === ex.id) < draft.exercises.findIndex(e => e.id === ex.supersetWith) && (
                <span style={{ fontSize: 10, background: "#A855F722", color: "#A855F7", padding: "2px 8px", borderRadius: 10, fontWeight: 700, display: "inline-block", marginBottom: 6 }}>SUPERSET WITH {partner.name}</span>
              )}
              <input value={ex.name} onChange={e => updateEx(ex.id, "name", e.target.value)} style={{ width: "100%", background: "none", border: "none", color: "#e6edf3", fontSize: 15, fontWeight: 700, fontFamily: "inherit", marginBottom: 6, outline: "none", boxSizing: "border-box" }} />
              <div style={{ display: "flex", gap: 8 }}>
                <select value={ex.muscleGroup} onChange={e => updateEx(ex.id, "muscleGroup", e.target.value)} style={{ flex: 1, background: "#1a1f2e", border: "1px solid #2a2f3e", borderRadius: 8, color: "#888", padding: "6px 8px", fontSize: 12, fontFamily: "inherit" }}>
                  {MUSCLE_GROUPS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                <input value={ex.sets} onChange={e => updateEx(ex.id, "sets", parseInt(e.target.value) || 1)} type="number" min="1" max="10" style={{ width: 50, background: "#1a1f2e", border: "1px solid #2a2f3e", borderRadius: 8, color: "#e6edf3", padding: "6px 8px", fontSize: 13, textAlign: "center", fontFamily: "inherit" }} />
                <span style={{ color: "#555", alignSelf: "center", fontSize: 12 }}>sets</span>
              </div>
              <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                {!ex.supersetWith
                  ? <button onClick={() => setSupersetPicker(ex.id)} style={{ flex: 1, background: "#1a1f2e", border: "1px solid #A855F744", borderRadius: 8, color: "#A855F7", padding: "6px", fontSize: 11, cursor: "pointer", fontFamily: "inherit", fontWeight: 700 }}>+ Superset</button>
                  : <button onClick={() => removeSuperset(ex.id)} style={{ flex: 1, background: "#A855F718", border: "1px solid #A855F744", borderRadius: 8, color: "#A855F7", padding: "6px", fontSize: 11, cursor: "pointer", fontFamily: "inherit", fontWeight: 700 }}>✕ Superset</button>
                }
                <button onClick={() => removeEx(ex.id)} style={{ background: "#f8717118", border: "1px solid #f8717144", borderRadius: 8, color: "#f87171", padding: "6px 10px", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>🗑</button>
              </div>
            </div>
          );
        })}

        {/* Superset Picker */}
        {supersetPicker && (
          <div style={{ background: "#111827", border: "1px solid #A855F744", borderRadius: 12, padding: "12px", marginBottom: 8 }}>
            <p style={{ margin: "0 0 8px", fontSize: 12, color: "#A855F7", fontWeight: 700 }}>Link superset with:</p>
            {draft.exercises.filter(e => e.id !== supersetPicker && !e.supersetWith).map(e => (
              <button key={e.id} onClick={() => addSuperset(supersetPicker, e.id)} style={{ display: "block", width: "100%", background: "#1a1f2e", border: "1px solid #2a2f3e", borderRadius: 8, color: "#e6edf3", padding: "8px 12px", fontSize: 13, cursor: "pointer", fontFamily: "inherit", textAlign: "left", marginBottom: 4 }}>{e.name}</button>
            ))}
            <button onClick={() => setSupersetPicker(null)} style={{ background: "none", border: "none", color: "#555", fontSize: 12, cursor: "pointer", fontFamily: "inherit", marginTop: 4 }}>Cancel</button>
          </div>
        )}

        <button onClick={() => setShowAddEx(true)} style={{ width: "100%", background: "#1a1f2e", border: "1px dashed #2a2f3e", borderRadius: 12, padding: "12px", color: "#555", fontSize: 14, cursor: "pointer", fontFamily: "inherit", marginBottom: 16 }}>+ Add Exercise</button>

        {showAddEx && (
          <div>
            {customExercises.length > 0 && (
              <div style={{ marginBottom: 10 }}>
                <p style={{ margin: "0 0 8px", fontSize: 11, color: "#4ade80", fontWeight: 700, letterSpacing: 1 }}>MY EXERCISES</p>
                {customExercises.map(ex => (
                  <button key={ex.id} onClick={() => { setDraft(p => ({ ...p, exercises: [...p.exercises, { ...ex, id: uid(), supersetWith: null }] })); setShowAddEx(false); }} style={{ display: "block", width: "100%", background: "#111827", border: "1px solid #4ade8033", borderRadius: 10, padding: "9px 12px", marginBottom: 5, textAlign: "left", cursor: "pointer", fontFamily: "inherit" }}>
                    <p style={{ margin: "0 0 1px", fontWeight: 700, color: "#4ade80", fontSize: 13 }}>{ex.name}</p>
                    <p style={{ margin: 0, color: "#555", fontSize: 11 }}>{ex.muscleGroup} · {ex.reps}</p>
                  </button>
                ))}
                <div style={{ height: 1, background: "#1a1f2e", margin: "10px 0" }} />
              </div>
            )}
            <AddExerciseForm onAdd={(ex) => { setDraft(p => ({ ...p, exercises: [...p.exercises, { ...ex, id: uid(), supersetWith: null }] })); setShowAddEx(false); }} onClose={() => setShowAddEx(false)} />
          </div>
        )}

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onDelete} style={{ flex: 1, background: "#f8717118", border: "1px solid #f8717144", borderRadius: 12, padding: "14px", color: "#f87171", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", fontSize: 14 }}>Delete Session</button>
          <button onClick={save} style={{ flex: 2, background: "#4ade80", border: "none", borderRadius: 12, padding: "14px", color: "#0d1117", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", fontSize: 14 }}>Save Changes</button>
        </div>
      </div>
    </div>
  );
}

// ─── ADD EXERCISE FORM ───────────────────────────────────────────────────────

function AddExerciseForm({ onAdd, onClose }) {
  const [name, setName] = useState("");
  const [muscleGroup, setMuscleGroup] = useState("Chest");
  const [sets, setSets] = useState(3);
  const [reps, setReps] = useState("8–12");
  const [notes, setNotes] = useState("To failure");
  return (
    <div style={{ background: "#1a1f2e", border: "1px solid #2a2f3e", borderRadius: 12, padding: "14px", marginBottom: 10 }}>
      <p style={{ margin: "0 0 10px", fontWeight: 700, fontSize: 14, color: "#4ade80" }}>New Exercise</p>
      <input placeholder="Exercise name" value={name} onChange={e => setName(e.target.value)} style={{ width: "100%", background: "#111827", border: "1px solid #2a2f3e", borderRadius: 8, color: "#e6edf3", padding: "10px 12px", fontSize: 14, fontFamily: "inherit", marginBottom: 8, boxSizing: "border-box", outline: "none" }} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 60px 1fr", gap: 8, marginBottom: 8 }}>
        <select value={muscleGroup} onChange={e => setMuscleGroup(e.target.value)} style={{ background: "#111827", border: "1px solid #2a2f3e", borderRadius: 8, color: "#e6edf3", padding: "8px", fontSize: 13, fontFamily: "inherit" }}>
          {MUSCLE_GROUPS.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <input type="number" value={sets} onChange={e => setSets(parseInt(e.target.value) || 1)} min="1" max="10" style={{ background: "#111827", border: "1px solid #2a2f3e", borderRadius: 8, color: "#e6edf3", padding: "8px", fontSize: 13, textAlign: "center", fontFamily: "inherit" }} />
        <input placeholder="Reps e.g. 8–12" value={reps} onChange={e => setReps(e.target.value)} style={{ background: "#111827", border: "1px solid #2a2f3e", borderRadius: 8, color: "#e6edf3", padding: "8px", fontSize: 13, fontFamily: "inherit" }} />
      </div>
      <input placeholder="Notes e.g. To failure" value={notes} onChange={e => setNotes(e.target.value)} style={{ width: "100%", background: "#111827", border: "1px solid #2a2f3e", borderRadius: 8, color: "#e6edf3", padding: "8px 12px", fontSize: 13, fontFamily: "inherit", marginBottom: 10, boxSizing: "border-box", outline: "none" }} />
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={onClose} style={{ flex: 1, background: "none", border: "1px solid #2a2f3e", borderRadius: 8, padding: "8px", color: "#555", cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
        <button onClick={() => { if (name.trim()) onAdd({ name: name.trim(), muscleGroup, sets, reps, notes }); }} style={{ flex: 2, background: "#4ade80", border: "none", borderRadius: 8, padding: "8px", color: "#0d1117", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Add</button>
      </div>
    </div>
  );
}

// ─── ADD SESSION MODAL ───────────────────────────────────────────────────────

function AddSessionModal({ update, onClose }) {
  const [day, setDay] = useState("Monday");
  const [type, setType] = useState("Push");
  const [color, setColor] = useState("#FF6B35");
  const save = () => {
    update(d => {
      d.sessions.push({ id: uid(), day, type, color, icon: SESSION_ICONS[type] || "💪", exercises: [] });
    });
    onClose();
  };
  return (
    <div style={{ position: "fixed", inset: 0, background: "#000c", zIndex: 200, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div style={{ background: "#0d1117", border: "1px solid #1a1f2e", borderRadius: "20px 20px 0 0", padding: "24px 20px 48px", width: "100%", maxWidth: 430 }}>
        <p style={{ margin: "0 0 16px", fontWeight: 700, fontSize: 18 }}>New Session</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
          <div>
            <p style={{ margin: "0 0 6px", fontSize: 11, color: "#555", fontWeight: 700 }}>DAY</p>
            <select value={day} onChange={e => setDay(e.target.value)} style={{ width: "100%", background: "#111827", border: "1px solid #1a1f2e", borderRadius: 10, color: "#e6edf3", padding: "10px 12px", fontSize: 14, fontFamily: "inherit" }}>
              {DAYS_OF_WEEK.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <p style={{ margin: "0 0 6px", fontSize: 11, color: "#555", fontWeight: 700 }}>TYPE</p>
            <select value={type} onChange={e => setType(e.target.value)} style={{ width: "100%", background: "#111827", border: "1px solid #1a1f2e", borderRadius: 10, color: "#e6edf3", padding: "10px 12px", fontSize: 14, fontFamily: "inherit" }}>
              {SESSION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>
        <p style={{ margin: "0 0 8px", fontSize: 11, color: "#555", fontWeight: 700 }}>COLOR</p>
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          {SESSION_COLORS.map(c => <button key={c} onClick={() => setColor(c)} style={{ width: 30, height: 30, borderRadius: "50%", background: c, border: color === c ? "3px solid #e6edf3" : "3px solid transparent", cursor: "pointer" }} />)}
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, background: "none", border: "1px solid #1a1f2e", borderRadius: 12, padding: "14px", color: "#555", cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
          <button onClick={save} style={{ flex: 2, background: "#4ade80", border: "none", borderRadius: 12, padding: "14px", color: "#0d1117", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", fontSize: 14 }}>Create Session</button>
        </div>
      </div>
    </div>
  );
}

// ─── WORKOUT SCREEN ───────────────────────────────────────────────────────────

function WorkoutScreen({ data, update, workoutState, setWorkoutState }) {
  const { session, logData, activeEx, startTime, swapped, supersets } = workoutState;
  // Timer uses endTime (timestamp) instead of countdown to survive backgrounding
  const [restTimer, setRestTimer] = useState({ active: false, timeLeft: 90, total: 90, endTime: null });
  const [showRestPicker, setShowRestPicker] = useState(false);
  const [showSwap, setShowSwap] = useState(false);
  const [showSupersetPicker, setShowSupersetPicker] = useState(false);
  const [showAddMidWorkout, setShowAddMidWorkout] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const timerRef = useRef(null);
  const audioCtx = useRef(null);
  const notifGranted = useRef(false);

  const setWS = (fn) => setWorkoutState(prev => { const next = { ...prev }; fn(next); return next; });

  // Get last session data for an exercise by name
  const getLastSessionData = (exName) => {
    const history = data.workoutHistory || [];
    for (const session of history) {
      const exIdx = (session.exercises || []).findIndex(e => e.name === exName);
      if (exIdx >= 0 && session.log?.[exIdx]) {
        const sets = Object.values(session.log[exIdx]).filter(s => s.weight || s.reps);
        if (sets.length > 0) return { date: session.date, sets };
      }
    }
    return null;
  };

  // Get all-time history for an exercise by name
  const getAllTimeHistory = (exName) => {
    const history = data.workoutHistory || [];
    const results = [];
    for (const session of history) {
      const exIdx = (session.exercises || []).findIndex(e => e.name === exName);
      if (exIdx >= 0 && session.log?.[exIdx]) {
        const sets = Object.values(session.log[exIdx]).filter(s => s.weight || s.reps);
        if (sets.length > 0) results.push({ date: session.date, sets });
      }
    }
    return results;
  };

  // Add exercise mid-workout
  const addExMidWorkout = (ex) => {
    setWS(ws => {
      const newIdx = ws.session.exercises.length;
      ws.session = { ...ws.session, exercises: [...ws.session.exercises, { ...ex, id: uid(), supersetWith: null }] };
      ws.logData = { ...ws.logData, [newIdx]: Object.fromEntries(Array.from({ length: ex.sets }, (_, s) => [s, { weight: "", reps: "", done: false, dropSets: [] }])) };
    });
    setShowAddMidWorkout(false);
  };

  // Request notification permission on mount
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().then(p => { notifGranted.current = p === "granted"; });
    } else if ("Notification" in window && Notification.permission === "granted") {
      notifGranted.current = true;
    }
  }, []);

  const playBeep = useCallback(() => {
    try {
      if (!audioCtx.current) audioCtx.current = new (window.AudioContext || window.webkitAudioContext)();
      const ctx = audioCtx.current; const osc = ctx.createOscillator(); const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination); osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.3, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.5);
    } catch {}
  }, []);

  const scheduleNotification = useCallback((seconds) => {
    if (!("Notification" in window) || Notification.permission !== "granted") return;
    // Use setTimeout for notification — works even when app is backgrounded on most browsers
    setTimeout(() => {
      try {
        new Notification("Rest Complete! 💪", {
          body: "Time to hit your next set.",
          icon: "/favicon.svg",
          tag: "rest-timer",
          requireInteraction: false,
        });
      } catch {}
    }, seconds * 1000);
  }, []);

  // Timestamp-based countdown — recalculates from endTime every tick so backgrounding doesn't freeze it
  useEffect(() => {
    if (!restTimer.active || !restTimer.endTime) return;
    const tick = () => {
      const remaining = Math.max(0, Math.ceil((restTimer.endTime - Date.now()) / 1000));
      if (remaining <= 0) {
        playBeep();
        setRestTimer(p => ({ ...p, active: false, timeLeft: 0, endTime: null }));
      } else {
        setRestTimer(p => ({ ...p, timeLeft: remaining }));
        timerRef.current = setTimeout(tick, 500); // 500ms tick for accuracy
      }
    };
    timerRef.current = setTimeout(tick, 500);
    return () => clearTimeout(timerRef.current);
  }, [restTimer.active, restTimer.endTime, playBeep]);

  // Recalculate on visibility change (user returns to app)
  useEffect(() => {
    const onVisible = () => {
      if (!restTimer.active || !restTimer.endTime) return;
      const remaining = Math.max(0, Math.ceil((restTimer.endTime - Date.now()) / 1000));
      if (remaining <= 0) {
        playBeep();
        setRestTimer(p => ({ ...p, active: false, timeLeft: 0, endTime: null }));
      } else {
        setRestTimer(p => ({ ...p, timeLeft: remaining }));
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [restTimer.active, restTimer.endTime, playBeep]);

  const getEx = (idx) => {
    const base = session.exercises[idx];
    const sw = swapped[idx];
    return sw ? { ...base, name: sw.name, reps: sw.reps, notes: sw.notes } : base;
  };

  const ex = getEx(activeEx);
  const baseEx = session.exercises[activeEx];
  const isSwapped = !!swapped[activeEx];
  const supersetPartnerIdx = supersets[activeEx] !== undefined ? supersets[activeEx] : (ex?.supersetWith ? session.exercises.findIndex(e => e.id === ex.supersetWith) : -1);
  const supersetPartner = supersetPartnerIdx >= 0 ? getEx(supersetPartnerIdx) : null;

  const allSets = Object.values(logData).flatMap(ex => Object.values(ex));
  const doneSets = allSets.filter(s => s.done).length;
  const totalSets = allSets.length;
  const progress = totalSets > 0 ? doneSets / totalSets : 0;

  const updateSet = (exIdx, setIdx, field, val) => setWS(ws => { ws.logData = { ...ws.logData, [exIdx]: { ...ws.logData[exIdx], [setIdx]: { ...ws.logData[exIdx][setIdx], [field]: val } } }; });
  const addDropSet = (exIdx, setIdx) => setWS(ws => {
    const cur = ws.logData[exIdx][setIdx];
    ws.logData = { ...ws.logData, [exIdx]: { ...ws.logData[exIdx], [setIdx]: { ...cur, dropSets: [...(cur.dropSets || []), { weight: "", reps: "", done: false }] } } };
  });
  const updateDropSet = (exIdx, setIdx, dropIdx, field, val) => setWS(ws => {
    const cur = ws.logData[exIdx][setIdx];
    const drops = [...(cur.dropSets || [])];
    drops[dropIdx] = { ...drops[dropIdx], [field]: val };
    ws.logData = { ...ws.logData, [exIdx]: { ...ws.logData[exIdx], [setIdx]: { ...cur, dropSets: drops } } };
  });
  const removeDropSet = (exIdx, setIdx, dropIdx) => setWS(ws => {
    const cur = ws.logData[exIdx][setIdx];
    const drops = [...(cur.dropSets || [])];
    drops.splice(dropIdx, 1);
    ws.logData = { ...ws.logData, [exIdx]: { ...ws.logData[exIdx], [setIdx]: { ...cur, dropSets: drops } } };
  });
  const toggleSetDone = (exIdx, setIdx) => {
    const wasDone = logData[exIdx]?.[setIdx]?.done;
    updateSet(exIdx, setIdx, "done", !wasDone);
    if (!wasDone) { setShowRestPicker(true); checkPR(exIdx, setIdx); }
  };

  const checkPR = (exIdx, setIdx) => {
    const setData = logData[exIdx]?.[setIdx];
    const exName = getEx(exIdx)?.name;
    const weight = parseFloat(setData?.weight);
    if (!exName || !weight) return;
    const currentPR = data.prs[exName]?.weight || 0;
    if (weight > currentPR) { update(d => { d.prs[exName] = { weight, date: new Date().toISOString(), exercise: exName }; }); }
  };

  const finishWorkout = () => {
    const entry = { id: uid(), sessionId: session.id, sessionType: session.type, date: new Date().toISOString(), log: logData, exercises: session.exercises.map((e, i) => ({ ...e, ...swapped[i] && { name: swapped[i].name } })), duration: Math.round((Date.now() - startTime) / 60000) };
    update(d => { d.workoutHistory = [entry, ...d.workoutHistory]; });
    setWorkoutState(null);
  };

  const addSupersetOnFly = (partnerIdx) => {
    setWS(ws => { ws.supersets = { ...ws.supersets, [activeEx]: partnerIdx, [partnerIdx]: activeEx }; });
    const partnerEx = session.exercises[partnerIdx];
    if (!logData[partnerIdx]) {
      setWS(ws => { ws.logData = { ...ws.logData, [partnerIdx]: Object.fromEntries(Array.from({ length: partnerEx.sets }, (_, s) => [s, { weight: "", reps: "", done: false, dropSets: [] }])) }; });
    }
    setShowSupersetPicker(false);
  };

  const removeSupersetOnFly = () => {
    setWS(ws => {
      const partner = ws.supersets[activeEx];
      const next = { ...ws.supersets };
      delete next[activeEx]; if (partner !== undefined) delete next[partner];
      ws.supersets = next;
    });
  };

  const ic = session.color;

  return (
    <div style={{ background: "#0d1117", minHeight: "100vh", paddingBottom: 20 }}>
      {/* Header */}
      <div style={{ padding: "20px 16px 12px", background: "#111827", borderBottom: "1px solid #1a1f2e" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <button onClick={() => { if (window.confirm("End workout?")) setWorkoutState(null); }} style={{ background: "none", border: "none", color: "#555", fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>✕ End</button>
          <span style={{ fontSize: 13, color: "#555" }}>{Math.round((Date.now() - startTime) / 60000)}m</span>
          <button onClick={finishWorkout} style={{ background: ic, border: "none", borderRadius: 20, padding: "6px 16px", color: "#0d1117", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>Finish ✓</button>
        </div>
        <div style={{ background: "#1a1f2e", borderRadius: 4, height: 3, marginBottom: 8 }}>
          <div style={{ background: ic, width: `${progress * 100}%`, height: "100%", borderRadius: 4, transition: "width 0.4s" }} />
        </div>
        <p style={{ margin: 0, fontSize: 11, color: "#555", letterSpacing: 0.5 }}>{doneSets}/{totalSets} SETS · {session.type.toUpperCase()}</p>
      </div>

      {/* Exercise Tabs */}
      <div style={{ display: "flex", gap: 6, padding: "10px 16px", overflowX: "auto", scrollbarWidth: "none" }}>
        {session.exercises.map((e, i) => {
          const exSets = Object.values(logData[i] || {});
          const allDone = exSets.length > 0 && exSets.every(s => s.done);
          const isSuper = supersets[i] !== undefined || e.supersetWith;
          return (
            <button key={i} onClick={() => setWS(ws => { ws.activeEx = i; })} style={{ flexShrink: 0, background: i === activeEx ? ic : allDone ? `${ic}33` : "#111827", border: `1px solid ${i === activeEx ? "transparent" : allDone ? ic + "66" : isSuper ? "#A855F744" : "#1a1f2e"}`, borderRadius: 20, padding: "5px 12px", color: i === activeEx ? "#0d1117" : allDone ? ic : isSuper ? "#A855F7" : "#555", fontSize: 11, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap", fontFamily: "inherit" }}>
              {allDone ? "✓ " : isSuper ? "⟲ " : ""}{i + 1}.{(swapped[i]?.name || e.name).split(" ")[0]}
            </button>
          );
        })}
      </div>

      {/* Current Exercise */}
      <div style={{ padding: "0 16px" }}>
        {(() => {
          const lastSession = getLastSessionData(ex?.name);
          const allHistory = getAllTimeHistory(ex?.name);
          return (
            <div style={{ background: "#111827", border: `1px solid ${isSwapped ? "#f59e0b44" : ic + "33"}`, borderRadius: 16, padding: "14px", marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ flex: 1 }}>
                  {isSwapped && <span style={{ fontSize: 10, background: "#f59e0b18", color: "#f59e0b", padding: "2px 8px", borderRadius: 8, fontWeight: 700, display: "inline-block", marginBottom: 4 }}>⇄ SWAPPED</span>}
                  {supersetPartner && <span style={{ fontSize: 10, background: "#A855F718", color: "#A855F7", padding: "2px 8px", borderRadius: 8, fontWeight: 700, display: "inline-block", marginBottom: 4, marginLeft: 4 }}>⟲ SUPERSET</span>}
                  <p style={{ margin: "0 0 2px", fontSize: 11, color: ic, fontWeight: 700, letterSpacing: 0.5 }}>{ex?.muscleGroup?.toUpperCase()}</p>
                  <h2 style={{ margin: "0 0 2px", fontSize: 19, fontWeight: 700, lineHeight: 1.2 }}>{ex?.name}</h2>
                  <p style={{ margin: 0, fontSize: 12, color: "#555" }}>{ex?.reps} reps · {ex?.notes}</p>
                  {supersetPartner && <p style={{ margin: "4px 0 0", fontSize: 12, color: "#A855F7" }}>+ {supersetPartner.name}</p>}
                  {/* Last session quick reference */}
                  {lastSession && (
                    <div style={{ marginTop: 8, padding: "6px 10px", background: "#0d1117", borderRadius: 8, border: "1px solid #1a1f2e" }}>
                      <p style={{ margin: "0 0 4px", fontSize: 10, color: "#3d4451", fontWeight: 700, letterSpacing: 0.5 }}>LAST SESSION — {formatDate(lastSession.date).toUpperCase()}</p>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {lastSession.sets.map((s, i) => (
                          <span key={i} style={{ fontSize: 11, color: "#60a5fa", fontWeight: 700 }}>
                            S{i+1}: {s.weight ? `${s.weight}kg` : "—"} × {s.reps || "—"}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, marginLeft: 8 }}>
                  <button onClick={() => setShowSwap(true)} style={{ background: "#1a1f2e", border: "1px solid #2a2f3e", borderRadius: 8, padding: "6px 10px", color: "#888", fontSize: 11, cursor: "pointer", fontFamily: "inherit", fontWeight: 700 }}>⇄ Swap</button>
                  {supersetPartnerIdx < 0
                    ? <button onClick={() => setShowSupersetPicker(true)} style={{ background: "#A855F718", border: "1px solid #A855F744", borderRadius: 8, padding: "6px 10px", color: "#A855F7", fontSize: 11, cursor: "pointer", fontFamily: "inherit", fontWeight: 700 }}>⟲ SS</button>
                    : <button onClick={removeSupersetOnFly} style={{ background: "#A855F733", border: "1px solid #A855F766", borderRadius: 8, padding: "6px 10px", color: "#A855F7", fontSize: 11, cursor: "pointer", fontFamily: "inherit", fontWeight: 700 }}>✕ SS</button>
                  }
                  {allHistory.length > 0 && (
                    <button onClick={() => setShowHistory(true)} style={{ background: "#60a5fa18", border: "1px solid #60a5fa44", borderRadius: 8, padding: "6px 10px", color: "#60a5fa", fontSize: 11, cursor: "pointer", fontFamily: "inherit", fontWeight: 700 }}>📊 Log</button>
                  )}
                </div>
              </div>
            </div>
          );
        })()}

        {/* Sets Table */}
        <div style={{ background: "#111827", border: "1px solid #1a1f2e", borderRadius: 14, padding: "0 14px", marginBottom: 10 }}>
          <div style={{ display: "flex", gap: 6, padding: "10px 0 7px", borderBottom: "1px solid #1a1f2e" }}>
            <span style={{ width: 28, fontSize: 10, color: "#3d4451", fontWeight: 700 }}>SET</span>
            <span style={{ flex: 1, textAlign: "center", fontSize: 10, color: "#3d4451", fontWeight: 700 }}>KG</span>
            <span style={{ flex: 1, textAlign: "center", fontSize: 10, color: "#3d4451", fontWeight: 700 }}>REPS</span>
            <span style={{ width: 70, textAlign: "center", fontSize: 10, color: "#3d4451", fontWeight: 700 }}>STATUS</span>
          </div>
          {Array.from({ length: ex?.sets || 0 }, (_, si) => {
            const setData = logData[activeEx]?.[si] || {};
            const isPR = setData.weight && parseFloat(setData.weight) > (data.prs[ex?.name]?.weight || 0) && setData.done;
            return (
              <div key={si}>
                <div style={{ display: "flex", gap: 6, padding: "8px 0", borderBottom: "1px solid #1a1f2e", opacity: setData.done ? 0.55 : 1, alignItems: "center" }}>
                  <span style={{ width: 28, fontSize: 14, fontWeight: 700, color: setData.done ? ic : "#3d4451" }}>{si + 1}{isPR ? "🏆" : ""}</span>
                  <input style={{ flex: 1, background: "#1a1f2e", border: "1px solid #2a2f3e", borderRadius: 8, color: "#e6edf3", fontSize: 14, fontWeight: 700, textAlign: "center", padding: "7px 4px", fontFamily: "inherit", outline: "none" }} type="number" placeholder="—" value={setData.weight || ""} onChange={e => updateSet(activeEx, si, "weight", e.target.value)} />
                  <input style={{ flex: 1, background: "#1a1f2e", border: "1px solid #2a2f3e", borderRadius: 8, color: "#e6edf3", fontSize: 14, fontWeight: 700, textAlign: "center", padding: "7px 4px", fontFamily: "inherit", outline: "none" }} type="number" placeholder="—" value={setData.reps || ""} onChange={e => updateSet(activeEx, si, "reps", e.target.value)} />
                  <button onClick={() => toggleSetDone(activeEx, si)} style={{ width: 70, background: setData.done ? `${ic}33` : "#1a1f2e", border: `1px solid ${setData.done ? ic : "#2a2f3e"}`, borderRadius: 8, color: setData.done ? ic : "#555", padding: "7px 0", fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s" }}>{setData.done ? "✓" : "Done"}</button>
                </div>
                {/* Drop Sets */}
                {(setData.dropSets || []).map((drop, di) => (
                  <div key={di} style={{ display: "flex", gap: 6, padding: "6px 0 6px 16px", borderBottom: "1px solid #1a1f2e", background: "#0d1117", alignItems: "center" }}>
                    <span style={{ width: 28, fontSize: 11, color: "#f59e0b", fontWeight: 700 }}>↘D{di + 1}</span>
                    <input style={{ flex: 1, background: "#1a1f2e", border: "1px solid #f59e0b44", borderRadius: 8, color: "#e6edf3", fontSize: 13, fontWeight: 700, textAlign: "center", padding: "6px 4px", fontFamily: "inherit", outline: "none" }} type="number" placeholder="—" value={drop.weight || ""} onChange={e => updateDropSet(activeEx, si, di, "weight", e.target.value)} />
                    <input style={{ flex: 1, background: "#1a1f2e", border: "1px solid #f59e0b44", borderRadius: 8, color: "#e6edf3", fontSize: 13, fontWeight: 700, textAlign: "center", padding: "6px 4px", fontFamily: "inherit", outline: "none" }} type="number" placeholder="—" value={drop.reps || ""} onChange={e => updateDropSet(activeEx, si, di, "reps", e.target.value)} />
                    <button onClick={() => removeDropSet(activeEx, si, di)} style={{ width: 70, background: "#f59e0b18", border: "1px solid #f59e0b44", borderRadius: 8, color: "#f59e0b", padding: "6px 0", fontWeight: 700, fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>✕ Drop</button>
                  </div>
                ))}
                <button onClick={() => addDropSet(activeEx, si)} style={{ display: "block", width: "100%", background: "none", border: "none", color: "#f59e0b", fontSize: 11, cursor: "pointer", fontFamily: "inherit", padding: "5px 0", textAlign: "left", paddingLeft: 28 }}>+ Drop Set</button>
              </div>
            );
          })}
        </div>

        {/* Superset Partner Sets */}
        {supersetPartner && supersetPartnerIdx >= 0 && (
          <div style={{ background: "#111827", border: "1px solid #A855F733", borderRadius: 14, padding: "0 14px", marginBottom: 10 }}>
            <p style={{ margin: "10px 0 6px", fontSize: 11, color: "#A855F7", fontWeight: 700 }}>⟲ {supersetPartner.name}</p>
            {Array.from({ length: supersetPartner.sets || 0 }, (_, si) => {
              const setData = logData[supersetPartnerIdx]?.[si] || {};
              return (
                <div key={si} style={{ display: "flex", gap: 6, padding: "7px 0", borderBottom: "1px solid #1a1f2e", opacity: setData.done ? 0.55 : 1, alignItems: "center" }}>
                  <span style={{ width: 28, fontSize: 13, fontWeight: 700, color: setData.done ? "#A855F7" : "#3d4451" }}>{si + 1}</span>
                  <input style={{ flex: 1, background: "#1a1f2e", border: "1px solid #A855F744", borderRadius: 8, color: "#e6edf3", fontSize: 14, fontWeight: 700, textAlign: "center", padding: "7px 4px", fontFamily: "inherit", outline: "none" }} type="number" placeholder="—" value={setData.weight || ""} onChange={e => updateSet(supersetPartnerIdx, si, "weight", e.target.value)} />
                  <input style={{ flex: 1, background: "#1a1f2e", border: "1px solid #A855F744", borderRadius: 8, color: "#e6edf3", fontSize: 14, fontWeight: 700, textAlign: "center", padding: "7px 4px", fontFamily: "inherit", outline: "none" }} type="number" placeholder="—" value={setData.reps || ""} onChange={e => updateSet(supersetPartnerIdx, si, "reps", e.target.value)} />
                  <button onClick={() => { updateSet(supersetPartnerIdx, si, "done", !setData.done); if (!setData.done) setShowRestPicker(true); }} style={{ width: 70, background: setData.done ? "#A855F733" : "#1a1f2e", border: `1px solid ${setData.done ? "#A855F7" : "#2a2f3e"}`, borderRadius: 8, color: setData.done ? "#A855F7" : "#555", padding: "7px 0", fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>{setData.done ? "✓" : "Done"}</button>
                </div>
              );
            })}
          </div>
        )}

        {/* Rest Timer Button */}
        <button onClick={() => setShowRestPicker(true)} style={{ width: "100%", background: "#111827", border: "1px solid #1a1f2e", borderRadius: 12, padding: 13, color: "#555", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", marginBottom: 8 }}>⏱ REST TIMER</button>

        {/* Nav */}
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setWS(ws => { ws.activeEx = Math.max(0, ws.activeEx - 1); })} disabled={activeEx === 0} style={{ flex: 1, background: "#111827", border: "1px solid #1a1f2e", borderRadius: 12, padding: 13, color: activeEx === 0 ? "#2a2f3e" : "#555", cursor: activeEx === 0 ? "default" : "pointer", fontWeight: 700, fontSize: 14, fontFamily: "inherit" }}>← Prev</button>
          <button onClick={() => setWS(ws => { ws.activeEx = Math.min(session.exercises.length - 1, ws.activeEx + 1); })} disabled={activeEx === session.exercises.length - 1} style={{ flex: 1, background: "#111827", border: "1px solid #1a1f2e", borderRadius: 12, padding: 13, color: activeEx === session.exercises.length - 1 ? "#2a2f3e" : "#555", cursor: activeEx === session.exercises.length - 1 ? "default" : "pointer", fontWeight: 700, fontSize: 14, fontFamily: "inherit" }}>Next →</button>
        </div>

        {/* Add Exercise Mid-Workout */}
        <button onClick={() => setShowAddMidWorkout(true)} style={{ width: "100%", background: "#111827", border: "1px dashed #2a2f3e", borderRadius: 12, padding: 12, color: "#555", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", marginBottom: 16 }}>+ Add Exercise to Session</button>
      </div>

      {/* History Modal */}
      {showHistory && (() => {
        const allHistory = getAllTimeHistory(ex?.name);
        return (
          <div style={{ position: "fixed", inset: 0, background: "#000c", zIndex: 300 }} onClick={() => setShowHistory(false)}>
            <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430, background: "#0d1117", border: "1px solid #60a5fa33", borderRadius: "20px 20px 0 0", padding: "20px 16px 48px", maxHeight: "75vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div>
                  <p style={{ margin: 0, fontWeight: 800, fontSize: 17 }}>📊 {ex?.name}</p>
                  <p style={{ margin: "2px 0 0", fontSize: 12, color: "#555" }}>All-time history — {allHistory.length} sessions</p>
                </div>
                <button onClick={() => setShowHistory(false)} style={{ background: "none", border: "none", color: "#555", fontSize: 20, cursor: "pointer" }}>✕</button>
              </div>
              {allHistory.length === 0 ? (
                <p style={{ color: "#333", fontSize: 13, textAlign: "center", padding: "20px 0" }}>No history yet for this exercise.</p>
              ) : allHistory.map((session, si) => (
                <div key={si} style={{ background: "#111827", border: "1px solid #1a1f2e", borderRadius: 12, padding: "12px 14px", marginBottom: 8 }}>
                  <p style={{ margin: "0 0 8px", fontSize: 11, color: "#60a5fa", fontWeight: 700 }}>{formatDate(session.date)} {new Date(session.date).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</p>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {session.sets.map((s, i) => (
                      <div key={i} style={{ background: "#1a1f2e", borderRadius: 8, padding: "6px 10px", minWidth: 70, textAlign: "center" }}>
                        <p style={{ margin: "0 0 2px", fontSize: 10, color: "#3d4451", fontWeight: 700 }}>SET {i+1}</p>
                        <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#e6edf3" }}>{s.weight ? `${s.weight}kg` : "BW"}</p>
                        <p style={{ margin: 0, fontSize: 11, color: "#888" }}>{s.reps || "—"} reps</p>
                        {s.dropSets?.length > 0 && s.dropSets.map((d, di) => (
                          <p key={di} style={{ margin: "2px 0 0", fontSize: 10, color: "#f59e0b" }}>↘{d.weight}kg×{d.reps}</p>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {/* Add Mid-Workout Modal */}
      {showAddMidWorkout && (
        <div style={{ position: "fixed", inset: 0, background: "#000c", zIndex: 300 }} onClick={() => setShowAddMidWorkout(false)}>
          <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430, background: "#0d1117", border: "1px solid #1a1f2e", borderRadius: "20px 20px 0 0", padding: "20px 16px 48px", maxHeight: "80vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <p style={{ margin: 0, fontWeight: 800, fontSize: 17 }}>Add Exercise</p>
              <button onClick={() => setShowAddMidWorkout(false)} style={{ background: "none", border: "none", color: "#555", fontSize: 20, cursor: "pointer" }}>✕</button>
            </div>
            {/* Custom exercises first */}
            {(data.customExercises || []).length > 0 && (
              <>
                <p style={{ margin: "0 0 8px", fontSize: 11, color: "#4ade80", fontWeight: 700, letterSpacing: 1 }}>MY EXERCISES</p>
                {(data.customExercises || []).map((ex, i) => (
                  <button key={i} onClick={() => addExMidWorkout(ex)} style={{ display: "block", width: "100%", background: "#111827", border: "1px solid #4ade8033", borderRadius: 12, padding: "12px 14px", marginBottom: 6, textAlign: "left", cursor: "pointer", fontFamily: "inherit" }}>
                    <p style={{ margin: "0 0 2px", fontWeight: 700, color: "#e6edf3", fontSize: 14 }}>{ex.name}</p>
                    <p style={{ margin: 0, color: "#555", fontSize: 12 }}>{ex.muscleGroup} · {ex.reps} · {ex.notes}</p>
                  </button>
                ))}
                <div style={{ height: 1, background: "#1a1f2e", margin: "12px 0" }} />
              </>
            )}
            {/* Built-in by muscle group */}
            {MUSCLE_GROUPS.map(mg => {
              const alts = EXERCISE_ALTERNATIVES[mg] || [];
              if (alts.length === 0) return null;
              return (
                <div key={mg}>
                  <p style={{ margin: "0 0 8px", fontSize: 11, color: "#3d4451", fontWeight: 700, letterSpacing: 1 }}>{mg.toUpperCase()}</p>
                  {alts.map((alt, i) => (
                    <button key={i} onClick={() => addExMidWorkout({ ...alt, muscleGroup: mg, sets: 3 })} style={{ display: "block", width: "100%", background: "#111827", border: "1px solid #1a1f2e", borderRadius: 12, padding: "10px 14px", marginBottom: 5, textAlign: "left", cursor: "pointer", fontFamily: "inherit" }}>
                      <p style={{ margin: "0 0 1px", fontWeight: 700, color: "#e6edf3", fontSize: 13 }}>{alt.name}</p>
                      <p style={{ margin: 0, color: "#555", fontSize: 11 }}>{alt.reps} · {alt.notes}</p>
                    </button>
                  ))}
                  <div style={{ height: 1, background: "#1a1f2e", margin: "8px 0 12px" }} />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Swap Modal */}
      {showSwap && (
        <div style={{ position: "fixed", inset: 0, background: "#000c", zIndex: 300 }} onClick={() => setShowSwap(false)}>
          <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430, background: "#0d1117", border: "1px solid #1a1f2e", borderRadius: "20px 20px 0 0", padding: "20px 16px 48px", maxHeight: "75vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
              <p style={{ margin: 0, fontWeight: 700, fontSize: 16 }}>Swap — {baseEx.muscleGroup}</p>
              <button onClick={() => setShowSwap(false)} style={{ background: "none", border: "none", color: "#555", fontSize: 18, cursor: "pointer" }}>✕</button>
            </div>
            {isSwapped && (
              <button onClick={() => { setWS(ws => { const s = { ...ws.swapped }; delete s[activeEx]; ws.swapped = s; }); setShowSwap(false); }} style={{ width: "100%", background: "#f59e0b18", border: "1px solid #f59e0b44", borderRadius: 12, padding: "12px 14px", marginBottom: 8, textAlign: "left", cursor: "pointer", color: "#f59e0b", fontFamily: "inherit", fontWeight: 700 }}>↩ Restore: {baseEx.name}</button>
            )}
            {/* Custom exercises for same muscle group */}
            {(data.customExercises || []).filter(e => e.muscleGroup === baseEx.muscleGroup).map((alt, i) => (
              <button key={"c"+i} onClick={() => { setWS(ws => { ws.swapped = { ...ws.swapped, [activeEx]: alt }; const fresh = {}; for (let s = 0; s < baseEx.sets; s++) fresh[s] = { weight: "", reps: "", done: false, dropSets: [] }; ws.logData = { ...ws.logData, [activeEx]: fresh }; }); setShowSwap(false); }} style={{ display: "block", width: "100%", background: "#4ade8011", border: "1px solid #4ade8033", borderRadius: 12, padding: "12px 14px", marginBottom: 6, textAlign: "left", cursor: "pointer", fontFamily: "inherit" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <p style={{ margin: "0 0 2px", fontWeight: 700, color: "#4ade80", fontSize: 14 }}>{alt.name}</p>
                    <p style={{ margin: 0, color: "#555", fontSize: 12 }}>{alt.reps} · {alt.notes}</p>
                  </div>
                  <span style={{ fontSize: 10, color: "#4ade80", fontWeight: 700 }}>CUSTOM</span>
                </div>
              </button>
            ))}
            {/* Built-in alternatives */}
            {(EXERCISE_ALTERNATIVES[baseEx.muscleGroup] || []).map((alt, i) => (
              <button key={i} onClick={() => { setWS(ws => { ws.swapped = { ...ws.swapped, [activeEx]: alt }; const fresh = {}; for (let s = 0; s < baseEx.sets; s++) fresh[s] = { weight: "", reps: "", done: false, dropSets: [] }; ws.logData = { ...ws.logData, [activeEx]: fresh }; }); setShowSwap(false); }} style={{ display: "block", width: "100%", background: "#111827", border: "1px solid #1a1f2e", borderRadius: 12, padding: "12px 14px", marginBottom: 6, textAlign: "left", cursor: "pointer", fontFamily: "inherit" }}>
                <p style={{ margin: "0 0 2px", fontWeight: 700, color: "#e6edf3", fontSize: 14 }}>{alt.name}</p>
                <p style={{ margin: 0, color: "#555", fontSize: 12 }}>{alt.reps} · {alt.notes}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Superset Picker */}
      {showSupersetPicker && (
        <div style={{ position: "fixed", inset: 0, background: "#000c", zIndex: 300 }} onClick={() => setShowSupersetPicker(false)}>
          <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430, background: "#0d1117", border: "1px solid #A855F744", borderRadius: "20px 20px 0 0", padding: "20px 16px 48px", maxHeight: "60vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
            <p style={{ margin: "0 0 14px", fontWeight: 700, fontSize: 16, color: "#A855F7" }}>⟲ Superset with</p>
            {session.exercises.map((e, i) => i !== activeEx && (
              <button key={i} onClick={() => addSupersetOnFly(i)} style={{ display: "block", width: "100%", background: "#111827", border: "1px solid #A855F733", borderRadius: 12, padding: "12px 14px", marginBottom: 6, textAlign: "left", cursor: "pointer", fontFamily: "inherit" }}>
                <p style={{ margin: 0, fontWeight: 700, color: "#e6edf3", fontSize: 14 }}>{swapped[i]?.name || e.name}</p>
                <p style={{ margin: 0, color: "#555", fontSize: 12 }}>{e.muscleGroup}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Rest Picker */}
      {showRestPicker && (
        <div style={{ position: "fixed", inset: 0, background: "#000a", zIndex: 300 }} onClick={() => setShowRestPicker(false)}>
          <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430, background: "#0d1117", border: "1px solid #1a1f2e", borderRadius: "20px 20px 0 0", padding: "20px 16px 48px" }} onClick={e => e.stopPropagation()}>
            <p style={{ margin: "0 0 14px", fontWeight: 700, fontSize: 16 }}>Rest Duration</p>
            <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
              {REST_PRESETS.map(p => <button key={p.label} onClick={() => { const end = Date.now() + p.seconds * 1000; setRestTimer({ active: true, timeLeft: p.seconds, total: p.seconds, endTime: end }); scheduleNotification(p.seconds); setShowRestPicker(false); }} style={{ flex: 1, background: "#111827", border: `1px solid ${ic}44`, borderRadius: 12, padding: "16px 0", color: ic, fontWeight: 800, fontSize: 17, cursor: "pointer", fontFamily: "inherit" }}>{p.label}</button>)}
            </div>
            <button onClick={() => setShowRestPicker(false)} style={{ width: "100%", background: "none", border: "1px solid #1a1f2e", borderRadius: 12, padding: 12, color: "#555", cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Rest Timer Overlay */}
      {restTimer.active && (
        <div style={{ position: "fixed", inset: 0, background: "#0d1117ee", zIndex: 400, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, maxWidth: 430, left: "50%", transform: "translateX(-50%)" }}>
          <p style={{ margin: 0, fontSize: 11, color: "#3d4451", letterSpacing: 2, fontWeight: 700 }}>RESTING</p>
          <div style={{ position: "relative", width: 136, height: 136 }}>
            <CircularTimer timeLeft={restTimer.timeLeft} total={restTimer.total} color={ic} />
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 34, fontWeight: 700, color: ic, letterSpacing: -1 }}>{formatTime(restTimer.timeLeft)}</span>
            </div>
          </div>
          <button onClick={() => { clearTimeout(timerRef.current); setRestTimer({ active: false, timeLeft: 90, total: 90, endTime: null }); }} style={{ background: "#111827", border: "1px solid #1a1f2e", borderRadius: 20, padding: "10px 28px", color: "#555", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Skip</button>
        </div>
      )}
    </div>
  );
}

// ─── NUTRITION TAB ────────────────────────────────────────────────────────────

function NutritionTab({ data, update }) {
  const { nutrition, settings } = data;
  const todayStr = today();
  const todayEntry = nutrition.find(n => n.date === todayStr) || { date: todayStr, calories: 0, notes: "" };
  const [cals, setCals] = useState(todayEntry.calories || "");
  const [notes, setNotes] = useState(todayEntry.notes || "");
  const [saved, setSaved] = useState(false);

  const save = () => {
    update(d => {
      const idx = d.nutrition.findIndex(n => n.date === todayStr);
      const entry = { date: todayStr, calories: parseInt(cals) || 0, notes };
      if (idx >= 0) d.nutrition[idx] = entry;
      else d.nutrition.push(entry);
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const recent7 = getLast(nutrition.filter(n => n.date !== todayStr), 6).concat(todayEntry.calories ? [todayEntry] : []);
  const chartData = recent7.map(n => ({ label: formatDate(n.date).split(" ")[0], value: n.calories }));
  const calsNum = parseInt(cals) || 0;
  const pct = Math.min(100, (calsNum / settings.calorieTarget) * 100);
  const diff = calsNum - settings.calorieTarget;

  const QUICK_ADDS = [
    { label: "Salmon Rice Bowl", kcal: 545 },
    { label: "Protein Shake", kcal: 150 },
    { label: "Chicken & Rice", kcal: 480 },
    { label: "Oats", kcal: 320 },
  ];

  return (
    <div style={{ padding: "52px 16px 16px" }}>
      <h1 style={{ margin: "0 0 20px", fontSize: 28, fontWeight: 700, letterSpacing: -1 }}>Nutrition</h1>

      {/* Today Log */}
      <div style={{ background: "#111827", border: "1px solid #1a1f2e", borderRadius: 16, padding: "16px", marginBottom: 12 }}>
        <p style={{ margin: "0 0 10px", fontSize: 11, color: "#3d4451", fontWeight: 700, letterSpacing: 1 }}>TODAY'S CALORIES</p>
        <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 12 }}>
          <input type="number" value={cals} onChange={e => setCals(e.target.value)} placeholder="0" style={{ flex: 1, background: "#1a1f2e", border: "1px solid #2a2f3e", borderRadius: 12, color: "#e6edf3", fontSize: 28, fontWeight: 700, textAlign: "center", padding: "12px", fontFamily: "inherit", outline: "none" }} />
          <div style={{ textAlign: "center" }}>
            <p style={{ margin: 0, fontSize: 12, color: "#555" }}>TARGET</p>
            <p style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#3d4451" }}>{settings.calorieTarget}</p>
          </div>
        </div>
        <div style={{ background: "#1a1f2e", borderRadius: 6, height: 8, marginBottom: 8 }}>
          <div style={{ background: pct >= 100 ? "#4ade80" : pct >= 80 ? "#f59e0b" : "#60a5fa", width: `${pct}%`, height: "100%", borderRadius: 6, transition: "width 0.4s" }} />
        </div>
        <p style={{ margin: "0 0 10px", fontSize: 13, color: pct >= 100 ? "#4ade80" : "#f59e0b" }}>
          {pct >= 100 ? `✓ Target hit (+${diff} kcal)` : `${settings.calorieTarget - calsNum} kcal remaining`}
        </p>
        <input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notes (e.g. ate out, high protein day)..." style={{ width: "100%", background: "#1a1f2e", border: "1px solid #2a2f3e", borderRadius: 10, color: "#888", fontSize: 13, padding: "10px 12px", fontFamily: "inherit", marginBottom: 10, boxSizing: "border-box", outline: "none" }} />
        <button onClick={save} style={{ width: "100%", background: saved ? "#4ade8033" : "#4ade80", border: saved ? "1px solid #4ade8066" : "none", borderRadius: 12, padding: "13px", color: saved ? "#4ade80" : "#0d1117", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit", transition: "all 0.3s" }}>
          {saved ? "✓ Saved" : "Save Today"}
        </button>
      </div>

      {/* Quick Adds */}
      <p style={{ margin: "0 0 8px", fontSize: 11, color: "#3d4451", fontWeight: 700, letterSpacing: 1 }}>QUICK ADD</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
        {QUICK_ADDS.map(qa => (
          <button key={qa.label} onClick={() => setCals(prev => String((parseInt(prev) || 0) + qa.kcal))} style={{ background: "#111827", border: "1px solid #1a1f2e", borderRadius: 12, padding: "12px", cursor: "pointer", fontFamily: "inherit", textAlign: "left" }}>
            <p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 700, color: "#e6edf3" }}>{qa.label}</p>
            <p style={{ margin: 0, fontSize: 12, color: "#4ade80" }}>+{qa.kcal} kcal</p>
          </button>
        ))}
      </div>

      {/* 7-Day Chart */}
      <p style={{ margin: "0 0 10px", fontSize: 11, color: "#3d4451", fontWeight: 700, letterSpacing: 1 }}>7-DAY HISTORY</p>
      <div style={{ background: "#111827", border: "1px solid #1a1f2e", borderRadius: 16, padding: "16px" }}>
        {chartData.length > 0
          ? <MiniBarChart data={chartData} target={settings.calorieTarget} color="#4ade80" width={362} height={90} />
          : <p style={{ color: "#333", fontSize: 13, textAlign: "center", margin: "20px 0" }}>No data yet — start logging!</p>
        }
      </div>
    </div>
  );
}

// ─── PROGRESS TAB ─────────────────────────────────────────────────────────────

function ProgressTab({ data }) {
  const { bodyWeight, workoutHistory, nutrition, settings, prs } = data;
  const [subTab, setSubTab] = useState("weight");

  const subTabs = [
    { id: "weight", label: "Weight" },
    { id: "calories", label: "Calories" },
    { id: "strength", label: "Strength" },
    { id: "consistency", label: "Sessions" },
    { id: "volume", label: "Volume" },
  ];

  const last30Weight = getLast(bodyWeight, 30).map(w => ({ label: formatDate(w.date), value: w.value }));
  const avg7w = avg(getLast(bodyWeight, 7).map(w => w.value));
  const startWeight = bodyWeight[0]?.value;
  const latestWeight = bodyWeight[bodyWeight.length - 1]?.value;
  const weightDelta = latestWeight && startWeight ? (latestWeight - startWeight).toFixed(1) : null;

  const last30Cal = getLast(nutrition, 30).map(n => ({ label: formatDate(n.date), value: n.calories }));
  const avgCals = avg(last30Cal.map(d => d.value));

  const last8Weeks = Array.from({ length: 8 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (7 * (7 - i)));
    const week = getWeekNumber(d);
    const year = d.getFullYear();
    const sessions = workoutHistory.filter(w => getWeekNumber(new Date(w.date)) === week && new Date(w.date).getFullYear() === year).length;
    return { label: `W${i + 1}`, sessions };
  });

  const muscleVolume = {};
  const recentHistory = getLast(workoutHistory, 4);
  recentHistory.forEach(session => {
    (session.exercises || []).forEach(ex => {
      const mg = ex.muscleGroup || "Other";
      if (!muscleVolume[mg]) muscleVolume[mg] = 0;
      muscleVolume[mg] += ex.sets || 0;
    });
  });
  const volumeData = Object.entries(muscleVolume).sort((a, b) => b[1] - a[1]);

  const prList = Object.values(prs).sort((a, b) => new Date(b.date) - new Date(a.date));
  const [selectedEx, setSelectedEx] = useState(prList[0]?.exercise || "");
  const strengthHistory = workoutHistory.flatMap(session =>
    (session.log ? Object.entries(session.log) : []).flatMap(([exIdx, sets]) => {
      const exName = session.exercises?.[parseInt(exIdx)]?.name;
      if (exName !== selectedEx) return [];
      const maxW = Math.max(...Object.values(sets).map(s => parseFloat(s.weight) || 0));
      return maxW > 0 ? [{ label: formatDate(session.date), value: maxW }] : [];
    })
  );

  return (
    <div style={{ padding: "52px 16px 16px" }}>
      <h1 style={{ margin: "0 0 16px", fontSize: 28, fontWeight: 700, letterSpacing: -1 }}>Progress</h1>

      {/* Sub Tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 16, overflowX: "auto", scrollbarWidth: "none" }}>
        {subTabs.map(st => (
          <button key={st.id} onClick={() => setSubTab(st.id)} style={{ flexShrink: 0, background: subTab === st.id ? "#4ade80" : "#111827", border: `1px solid ${subTab === st.id ? "transparent" : "#1a1f2e"}`, borderRadius: 20, padding: "7px 16px", color: subTab === st.id ? "#0d1117" : "#555", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", letterSpacing: 0.5 }}>{st.label.toUpperCase()}</button>
        ))}
      </div>

      {/* Weight */}
      {subTab === "weight" && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 12 }}>
            {[{ label: "CURRENT", value: latestWeight ? `${latestWeight}${settings.weightUnit}` : "—", color: "#60a5fa" }, { label: "7D AVG", value: avg7w ? `${avg7w.toFixed(1)}${settings.weightUnit}` : "—", color: "#A855F7" }, { label: "TOTAL", value: weightDelta ? `${weightDelta > 0 ? "+" : ""}${weightDelta}${settings.weightUnit}` : "—", color: weightDelta > 0 ? "#4ade80" : "#f87171" }].map(s => (
              <div key={s.label} style={{ background: "#111827", border: "1px solid #1a1f2e", borderRadius: 12, padding: "12px 10px", textAlign: "center" }}>
                <p style={{ margin: "0 0 4px", fontSize: 9, color: "#3d4451", fontWeight: 700, letterSpacing: 1 }}>{s.label}</p>
                <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: s.color }}>{s.value}</p>
              </div>
            ))}
          </div>
          <div style={{ background: "#111827", border: "1px solid #1a1f2e", borderRadius: 16, padding: "16px" }}>
            <p style={{ margin: "0 0 12px", fontSize: 11, color: "#3d4451", fontWeight: 700, letterSpacing: 1 }}>30-DAY TREND</p>
            <LineChart data={last30Weight} color="#60a5fa" width={362} height={130} showAvg avgColor="#A855F7" />
          </div>
        </div>
      )}

      {/* Calories */}
      {subTab === "calories" && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
            {[{ label: "TARGET", value: `${settings.calorieTarget} kcal`, color: "#4ade80" }, { label: "30D AVG", value: avgCals ? `${Math.round(avgCals)} kcal` : "—", color: avgCals >= settings.calorieTarget ? "#4ade80" : "#f59e0b" }].map(s => (
              <div key={s.label} style={{ background: "#111827", border: "1px solid #1a1f2e", borderRadius: 12, padding: "14px", textAlign: "center" }}>
                <p style={{ margin: "0 0 4px", fontSize: 9, color: "#3d4451", fontWeight: 700, letterSpacing: 1 }}>{s.label}</p>
                <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: s.color }}>{s.value}</p>
              </div>
            ))}
          </div>
          <div style={{ background: "#111827", border: "1px solid #1a1f2e", borderRadius: 16, padding: "16px" }}>
            <p style={{ margin: "0 0 12px", fontSize: 11, color: "#3d4451", fontWeight: 700, letterSpacing: 1 }}>30-DAY INTAKE</p>
            <LineChart data={last30Cal} color="#4ade80" width={362} height={130} showAvg avgColor="#f59e0b" />
          </div>
        </div>
      )}

      {/* Strength */}
      {subTab === "strength" && (
        <div>
          <p style={{ margin: "0 0 8px", fontSize: 11, color: "#3d4451", fontWeight: 700, letterSpacing: 1 }}>PERSONAL RECORDS</p>
          {prList.length === 0 ? <p style={{ color: "#333", fontSize: 13 }}>No PRs yet — start logging weights!</p> : (
            <>
              <div style={{ display: "flex", gap: 6, marginBottom: 12, overflowX: "auto", scrollbarWidth: "none" }}>
                {prList.map(pr => (
                  <button key={pr.exercise} onClick={() => setSelectedEx(pr.exercise)} style={{ flexShrink: 0, background: selectedEx === pr.exercise ? "#f59e0b" : "#111827", border: `1px solid ${selectedEx === pr.exercise ? "transparent" : "#1a1f2e"}`, borderRadius: 20, padding: "5px 12px", color: selectedEx === pr.exercise ? "#0d1117" : "#555", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}>{pr.exercise.split(" ")[0]}</button>
                ))}
              </div>
              {selectedEx && prList.find(p => p.exercise === selectedEx) && (
                <div style={{ background: "#111827", border: "1px solid #f59e0b33", borderRadius: 16, padding: "16px", marginBottom: 10 }}>
                  <p style={{ margin: "0 0 4px", fontSize: 11, color: "#f59e0b", fontWeight: 700 }}>🏆 {selectedEx}</p>
                  <p style={{ margin: "0 0 10px", fontSize: 26, fontWeight: 700 }}>{prList.find(p => p.exercise === selectedEx)?.weight} {settings.weightUnit}</p>
                  <p style={{ margin: "0 0 12px", fontSize: 12, color: "#555" }}>Set on {formatDate(prList.find(p => p.exercise === selectedEx)?.date)}</p>
                  {strengthHistory.length > 1 && <LineChart data={strengthHistory} color="#f59e0b" width={362} height={110} />}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Consistency */}
      {subTab === "consistency" && (
        <div>
          <p style={{ margin: "0 0 10px", fontSize: 11, color: "#3d4451", fontWeight: 700, letterSpacing: 1 }}>8-WEEK SESSION LOG</p>
          <div style={{ background: "#111827", border: "1px solid #1a1f2e", borderRadius: 16, padding: "16px" }}>
            <div style={{ display: "flex", gap: 6, alignItems: "flex-end", height: 90 }}>
              {last8Weeks.map((w, i) => (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <div style={{ width: "100%", background: w.sessions > 0 ? "#4ade80" : "#1a1f2e", borderRadius: "4px 4px 0 0", height: `${(w.sessions / 5) * 70}%`, minHeight: w.sessions > 0 ? 8 : 4, border: w.sessions === 0 ? "1px solid #2a2f3e" : "none" }} />
                  <span style={{ fontSize: 9, color: "#3d4451" }}>{w.label}</span>
                  <span style={{ fontSize: 10, color: "#555", fontWeight: 700 }}>{w.sessions}</span>
                </div>
              ))}
            </div>
          </div>
          <p style={{ margin: "12px 0 0", fontSize: 12, color: "#555", textAlign: "center" }}>Total workouts logged: {workoutHistory.length}</p>
        </div>
      )}

      {/* Volume */}
      {subTab === "volume" && (
        <div>
          <p style={{ margin: "0 0 10px", fontSize: 11, color: "#3d4451", fontWeight: 700, letterSpacing: 1 }}>RECENT WEEKLY VOLUME (SETS)</p>
          {volumeData.length === 0 ? <p style={{ color: "#333", fontSize: 13 }}>Complete workouts to see volume data</p> : volumeData.map(([mg, sets]) => {
            const pct = (sets / (volumeData[0][1] || 1)) * 100;
            return (
              <div key={mg} style={{ background: "#111827", border: "1px solid #1a1f2e", borderRadius: 12, padding: "12px 14px", marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 700 }}>{mg}</span>
                  <span style={{ fontSize: 13, color: "#4ade80", fontWeight: 700 }}>{sets} sets</span>
                </div>
                <div style={{ background: "#1a1f2e", borderRadius: 4, height: 5 }}>
                  <div style={{ background: "#4ade80", width: `${pct}%`, height: "100%", borderRadius: 4 }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── COACH TAB ────────────────────────────────────────────────────────────────

function CoachTab({ data, update }) {
  const [messages, setMessages] = useState(data.chatHistory || []);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [briefing, setBriefing] = useState(null);
  const [loadingBriefing, setLoadingBriefing] = useState(false);
  const bottomRef = useRef(null);

  const buildContext = () => {
    const { settings, bodyWeight, nutrition, workoutHistory, prs } = data;
    const last7w = getLast(bodyWeight, 7).map(w => `${formatDate(w.date)}: ${w.value}${settings.weightUnit}`).join(", ") || "none";
    const last7c = getLast(nutrition, 7).map(n => `${formatDate(n.date)}: ${n.calories}kcal`).join(", ") || "none";
    const recentWorkouts = getLast(workoutHistory, 3).map(w => `${formatDate(w.date)} ${w.sessionType}`).join(", ") || "none";
    const topPRs = Object.values(prs).slice(0, 5).map(p => `${p.exercise}: ${p.weight}${settings.weightUnit}`).join(", ") || "none";
    return `You are OptiGains AI Coach — a knowledgeable, direct, and evidence-based personal trainer and nutrition coach. The user is a natural lifter on a lean bulk, 63kg, 170cm, 8 years experience, training to failure on isolations and one rep short on compounds, 4 days/week (Push/Pull/Legs/Upper). They have a history of discipline issues with trading (not fitness). Be concise, direct, and specific.

Current goal: ${GOAL_MODES[settings.goalMode]?.label}
Calorie target: ${settings.calorieTarget} kcal/day
Weight unit: ${settings.weightUnit}
Last 7 days weight: ${last7w}
Last 7 days calories: ${last7c}
Recent workouts: ${recentWorkouts}
Top PRs: ${topPRs}`;
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: "user", content: input.trim() };
    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: buildContext(),
          messages: newMsgs.map(m => ({ role: m.role, content: m.content })),
        }),
      });
      const d = await res.json();
      const reply = d.content?.[0]?.text || "Sorry, I couldn't respond right now.";
      const assistantMsg = { role: "assistant", content: reply };
      const finalMsgs = [...newMsgs, assistantMsg];
      setMessages(finalMsgs);
      update(d => { d.chatHistory = finalMsgs.slice(-20); });
    } catch { setMessages(prev => [...prev, { role: "assistant", content: "Connection error. Try again." }]); }
    finally { setLoading(false); }
  };

  const getDailyBriefing = async () => {
    setLoadingBriefing(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: buildContext(),
          messages: [{ role: "user", content: "Give me a concise daily briefing (under 120 words). Include: 1) weight trend assessment, 2) calorie compliance, 3) one specific action for today's training or diet. Be direct and specific with numbers." }],
        }),
      });
      const d = await res.json();
      setBriefing(d.content?.[0]?.text || "Couldn't load briefing.");
    } catch { setBriefing("Connection error. Check your network."); }
    finally { setLoadingBriefing(false); }
  };

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const QUICK_QUESTIONS = [
    "Should I increase my calories?",
    "Am I ready to deload?",
    "How is my chest volume looking?",
    "What should I focus on today?",
  ];

  return (
    <div style={{ padding: "52px 16px 0", display: "flex", flexDirection: "column", height: "calc(100vh - 72px)" }}>
      <h1 style={{ margin: "0 0 12px", fontSize: 28, fontWeight: 700, letterSpacing: -1, flexShrink: 0 }}>AI Coach 🤖</h1>

      {/* Daily Briefing */}
      <div style={{ background: "#111827", border: "1px solid #4ade8033", borderRadius: 16, padding: "14px", marginBottom: 10, flexShrink: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: briefing ? 8 : 0 }}>
          <p style={{ margin: 0, fontSize: 11, color: "#4ade80", fontWeight: 700, letterSpacing: 1 }}>📋 DAILY BRIEFING</p>
          <button onClick={getDailyBriefing} disabled={loadingBriefing} style={{ background: "#4ade8018", border: "1px solid #4ade8044", borderRadius: 10, padding: "6px 12px", color: "#4ade80", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
            {loadingBriefing ? "Loading..." : briefing ? "Refresh" : "Get Briefing"}
          </button>
        </div>
        {briefing && <p style={{ margin: 0, fontSize: 13, color: "#888", lineHeight: 1.6 }}>{briefing}</p>}
      </div>

      {/* Chat */}
      <div style={{ flex: 1, overflowY: "auto", scrollbarWidth: "none", marginBottom: 10 }}>
        {messages.length === 0 ? (
          <div>
            <p style={{ color: "#3d4451", fontSize: 13, marginBottom: 12 }}>Ask your coach anything about training or nutrition.</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {QUICK_QUESTIONS.map(q => (
                <button key={q} onClick={() => { setInput(q); }} style={{ background: "#111827", border: "1px solid #1a1f2e", borderRadius: 12, padding: "10px 12px", color: "#888", fontSize: 12, cursor: "pointer", fontFamily: "inherit", textAlign: "left", lineHeight: 1.4 }}>{q}</button>
              ))}
            </div>
          </div>
        ) : messages.map((msg, i) => (
          <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start", marginBottom: 10 }}>
            <div style={{ maxWidth: "82%", background: msg.role === "user" ? "#4ade8022" : "#111827", border: `1px solid ${msg.role === "user" ? "#4ade8044" : "#1a1f2e"}`, borderRadius: msg.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px", padding: "10px 14px" }}>
              <p style={{ margin: 0, fontSize: 13, color: msg.role === "user" ? "#4ade80" : "#c9d1d9", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{msg.content}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 10 }}>
            <div style={{ background: "#111827", border: "1px solid #1a1f2e", borderRadius: "16px 16px 16px 4px", padding: "10px 16px" }}>
              <span style={{ color: "#555", fontSize: 13 }}>Thinking...</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ display: "flex", gap: 8, paddingBottom: 16, flexShrink: 0 }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && sendMessage()} placeholder="Ask your coach..." style={{ flex: 1, background: "#111827", border: "1px solid #1a1f2e", borderRadius: 14, color: "#e6edf3", fontSize: 14, padding: "12px 16px", fontFamily: "inherit", outline: "none" }} />
        <button onClick={sendMessage} disabled={loading || !input.trim()} style={{ background: input.trim() ? "#4ade80" : "#1a1f2e", border: "none", borderRadius: 14, padding: "12px 18px", color: input.trim() ? "#0d1117" : "#3d4451", fontWeight: 700, fontSize: 16, cursor: input.trim() ? "pointer" : "default", fontFamily: "inherit", transition: "all 0.2s" }}>↑</button>
      </div>
    </div>
  );
}

// ─── SETTINGS TAB ─────────────────────────────────────────────────────────────

function SettingsTab({ data, update }) {
  const { settings } = data;
  const [calTarget, setCalTarget] = useState(settings.calorieTarget);
  const [weight, setWeight] = useState("");
  const [saved, setSaved] = useState("");
  const [importStatus, setImportStatus] = useState("");
  const importRef = useRef(null);
  const weeksTraining = Math.floor((new Date() - new Date(settings.startDate)) / (7 * 86400000));
  const weeksSinceDeload = weeksTraining - settings.deloadWeek;

  const save = (field, value) => { update(d => { d.settings[field] = value; }); setSaved(field); setTimeout(() => setSaved(""), 1500); };

  const exportData = () => {
    const exportPayload = { ...data, exportedAt: new Date().toISOString(), version: APP_VERSION };
    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `optigains-backup-${today()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result);
        if (!parsed.settings || !parsed.sessions) {
          setImportStatus("error"); setTimeout(() => setImportStatus(""), 3000); return;
        }
        update(d => {
          d.settings = parsed.settings || d.settings;
          d.sessions = parsed.sessions || d.sessions;
          d.workoutHistory = parsed.workoutHistory || d.workoutHistory;
          d.prs = parsed.prs || d.prs;
          d.bodyWeight = parsed.bodyWeight || d.bodyWeight;
          d.nutrition = parsed.nutrition || d.nutrition;
          d.chatHistory = parsed.chatHistory || d.chatHistory;
          d.skippedSessions = parsed.skippedSessions || d.skippedSessions;
        });
        setImportStatus("success");
        setTimeout(() => setImportStatus(""), 3000);
      } catch { setImportStatus("error"); setTimeout(() => setImportStatus(""), 3000); }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const logWeight = () => {
    const w = parseFloat(weight);
    if (!w) return;
    update(d => {
      const todayStr = today();
      const idx = d.bodyWeight.findIndex(bw => bw.date === todayStr);
      if (idx >= 0) d.bodyWeight[idx].value = w;
      else d.bodyWeight.push({ date: todayStr, value: w });
    });
    setSaved("weight"); setTimeout(() => setSaved(""), 1500);
    setWeight("");
  };

  const [showExLib, setShowExLib] = useState(false);
  const [newEx, setNewEx] = useState({ name: "", muscleGroup: "Chest", sets: 3, reps: "8–12", notes: "To failure" });

  const addCustomEx = () => {
    if (!newEx.name.trim()) return;
    update(d => { if (!d.customExercises) d.customExercises = []; d.customExercises.push({ ...newEx, name: newEx.name.trim(), id: uid() }); });
    setNewEx({ name: "", muscleGroup: "Chest", sets: 3, reps: "8–12", notes: "To failure" });
  };

  const deleteCustomEx = (id) => {
    update(d => { d.customExercises = (d.customExercises || []).filter(e => e.id !== id); });
  };

  return (
    <div style={{ padding: "52px 16px 16px" }}>
      <h1 style={{ margin: "0 0 20px", fontSize: 28, fontWeight: 700, letterSpacing: -1 }}>Settings</h1>

      {/* Custom Exercise Library */}
      <div style={{ background: "#111827", border: "1px solid #4ade8033", borderRadius: 16, padding: "16px", marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <p style={{ margin: 0, fontSize: 11, color: "#4ade80", fontWeight: 700, letterSpacing: 1 }}>💪 EXERCISE LIBRARY</p>
          <button onClick={() => setShowExLib(!showExLib)} style={{ background: "#4ade8018", border: "1px solid #4ade8044", borderRadius: 10, padding: "5px 12px", color: "#4ade80", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>{showExLib ? "Hide" : `Manage (${(data.customExercises || []).length})`}</button>
        </div>
        <p style={{ margin: 0, fontSize: 12, color: "#555" }}>Create custom exercises — they appear in swap lists and session editors across all days.</p>

        {showExLib && (
          <div style={{ marginTop: 14 }}>
            {/* Add new */}
            <div style={{ background: "#0d1117", border: "1px solid #1a1f2e", borderRadius: 12, padding: "12px", marginBottom: 12 }}>
              <p style={{ margin: "0 0 10px", fontSize: 12, color: "#4ade80", fontWeight: 700 }}>+ New Exercise</p>
              <input placeholder="Exercise name" value={newEx.name} onChange={e => setNewEx(p => ({ ...p, name: e.target.value }))} style={{ width: "100%", background: "#111827", border: "1px solid #2a2f3e", borderRadius: 8, color: "#e6edf3", padding: "9px 12px", fontSize: 14, fontFamily: "inherit", marginBottom: 8, boxSizing: "border-box", outline: "none" }} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 50px", gap: 8, marginBottom: 8 }}>
                <select value={newEx.muscleGroup} onChange={e => setNewEx(p => ({ ...p, muscleGroup: e.target.value }))} style={{ background: "#111827", border: "1px solid #2a2f3e", borderRadius: 8, color: "#e6edf3", padding: "8px", fontSize: 13, fontFamily: "inherit" }}>
                  {MUSCLE_GROUPS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                <input type="number" value={newEx.sets} onChange={e => setNewEx(p => ({ ...p, sets: parseInt(e.target.value) || 3 }))} min="1" max="10" style={{ background: "#111827", border: "1px solid #2a2f3e", borderRadius: 8, color: "#e6edf3", padding: "8px", fontSize: 13, textAlign: "center", fontFamily: "inherit" }} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
                <input placeholder="Reps e.g. 8–12" value={newEx.reps} onChange={e => setNewEx(p => ({ ...p, reps: e.target.value }))} style={{ background: "#111827", border: "1px solid #2a2f3e", borderRadius: 8, color: "#e6edf3", padding: "8px", fontSize: 13, fontFamily: "inherit", outline: "none" }} />
                <input placeholder="Notes" value={newEx.notes} onChange={e => setNewEx(p => ({ ...p, notes: e.target.value }))} style={{ background: "#111827", border: "1px solid #2a2f3e", borderRadius: 8, color: "#e6edf3", padding: "8px", fontSize: 13, fontFamily: "inherit", outline: "none" }} />
              </div>
              <button onClick={addCustomEx} style={{ width: "100%", background: "#4ade80", border: "none", borderRadius: 10, padding: "10px", color: "#0d1117", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", fontSize: 14 }}>Add to Library</button>
            </div>

            {/* Existing custom exercises */}
            {(data.customExercises || []).length === 0 ? (
              <p style={{ color: "#333", fontSize: 12, textAlign: "center", padding: "8px 0" }}>No custom exercises yet.</p>
            ) : (data.customExercises || []).map(ex => (
              <div key={ex.id} style={{ background: "#0d1117", border: "1px solid #1a1f2e", borderRadius: 10, padding: "10px 12px", marginBottom: 6, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <p style={{ margin: "0 0 2px", fontWeight: 700, fontSize: 13, color: "#e6edf3" }}>{ex.name}</p>
                  <p style={{ margin: 0, fontSize: 11, color: "#555" }}>{ex.muscleGroup} · {ex.sets} sets · {ex.reps}</p>
                </div>
                <button onClick={() => deleteCustomEx(ex.id)} style={{ background: "#f8717118", border: "1px solid #f8717144", borderRadius: 8, padding: "5px 9px", color: "#f87171", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>🗑</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Export / Import */}
      <div style={{ background: "#111827", border: "1px solid #60a5fa33", borderRadius: 16, padding: "16px", marginBottom: 12 }}>
        <p style={{ margin: "0 0 6px", fontSize: 11, color: "#60a5fa", fontWeight: 700, letterSpacing: 1 }}>💾 DATA BACKUP</p>
        <p style={{ margin: "0 0 12px", fontSize: 12, color: "#555", lineHeight: 1.5 }}>Export saves all your data as a file. Import restores from a previous export. Do this before clearing browser data.</p>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={exportData} style={{ flex: 1, background: "#60a5fa22", border: "1px solid #60a5fa44", borderRadius: 12, padding: "13px", color: "#60a5fa", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", fontSize: 13 }}>⬇ Export Backup</button>
          <button onClick={() => importRef.current?.click()} style={{ flex: 1, background: importStatus === "success" ? "#4ade8022" : importStatus === "error" ? "#f8717122" : "#1a1f2e", border: `1px solid ${importStatus === "success" ? "#4ade8044" : importStatus === "error" ? "#f8717144" : "#2a2f3e"}`, borderRadius: 12, padding: "13px", color: importStatus === "success" ? "#4ade80" : importStatus === "error" ? "#f87171" : "#888", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", fontSize: 13, transition: "all 0.3s" }}>
            {importStatus === "success" ? "✓ Imported!" : importStatus === "error" ? "✗ Invalid File" : "⬆ Import Backup"}
          </button>
        </div>
        <input ref={importRef} type="file" accept=".json" onChange={importData} style={{ display: "none" }} />
      </div>

      {/* Log Weight */}
      <div style={{ background: "#111827", border: "1px solid #1a1f2e", borderRadius: 16, padding: "16px", marginBottom: 12 }}>
        <p style={{ margin: "0 0 10px", fontSize: 11, color: "#3d4451", fontWeight: 700, letterSpacing: 1 }}>LOG BODY WEIGHT</p>
        <div style={{ display: "flex", gap: 10 }}>
          <input type="number" step="0.1" value={weight} onChange={e => setWeight(e.target.value)} placeholder={`e.g. 63.2 ${settings.weightUnit}`} style={{ flex: 1, background: "#1a1f2e", border: "1px solid #2a2f3e", borderRadius: 10, color: "#e6edf3", fontSize: 16, padding: "10px 14px", fontFamily: "inherit", outline: "none" }} />
          <button onClick={logWeight} style={{ background: saved === "weight" ? "#4ade8033" : "#60a5fa", border: saved === "weight" ? "1px solid #4ade8066" : "none", borderRadius: 10, padding: "10px 18px", color: saved === "weight" ? "#4ade80" : "#0d1117", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", fontSize: 14, transition: "all 0.3s" }}>{saved === "weight" ? "✓" : "Log"}</button>
        </div>
      </div>

      {/* Goal Mode */}
      <div style={{ background: "#111827", border: "1px solid #1a1f2e", borderRadius: 16, padding: "16px", marginBottom: 12 }}>
        <p style={{ margin: "0 0 10px", fontSize: 11, color: "#3d4451", fontWeight: 700, letterSpacing: 1 }}>GOAL MODE</p>
        <div style={{ display: "flex", gap: 8 }}>
          {Object.entries(GOAL_MODES).map(([key, g]) => (
            <button key={key} onClick={() => save("goalMode", key)} style={{ flex: 1, background: settings.goalMode === key ? `${g.color}22` : "#1a1f2e", border: `1px solid ${settings.goalMode === key ? g.color + "66" : "#2a2f3e"}`, borderRadius: 12, padding: "10px 6px", color: settings.goalMode === key ? g.color : "#555", fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>{g.icon} {g.label}</button>
          ))}
        </div>
      </div>

      {/* Calorie Target */}
      <div style={{ background: "#111827", border: "1px solid #1a1f2e", borderRadius: 16, padding: "16px", marginBottom: 12 }}>
        <p style={{ margin: "0 0 10px", fontSize: 11, color: "#3d4451", fontWeight: 700, letterSpacing: 1 }}>DAILY CALORIE TARGET</p>
        <div style={{ display: "flex", gap: 10 }}>
          <input type="number" value={calTarget} onChange={e => setCalTarget(parseInt(e.target.value) || 0)} style={{ flex: 1, background: "#1a1f2e", border: "1px solid #2a2f3e", borderRadius: 10, color: "#e6edf3", fontSize: 16, padding: "10px 14px", fontFamily: "inherit", outline: "none" }} />
          <button onClick={() => save("calorieTarget", calTarget)} style={{ background: saved === "calorieTarget" ? "#4ade8033" : "#4ade80", border: saved === "calorieTarget" ? "1px solid #4ade8066" : "none", borderRadius: 10, padding: "10px 18px", color: saved === "calorieTarget" ? "#4ade80" : "#0d1117", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", fontSize: 14, transition: "all 0.3s" }}>{saved === "calorieTarget" ? "✓" : "Save"}</button>
        </div>
      </div>

      {/* Weight Unit */}
      <div style={{ background: "#111827", border: "1px solid #1a1f2e", borderRadius: 16, padding: "16px", marginBottom: 12 }}>
        <p style={{ margin: "0 0 10px", fontSize: 11, color: "#3d4451", fontWeight: 700, letterSpacing: 1 }}>WEIGHT UNIT</p>
        <div style={{ display: "flex", gap: 8 }}>
          {["kg", "lbs"].map(u => <button key={u} onClick={() => save("weightUnit", u)} style={{ flex: 1, background: settings.weightUnit === u ? "#60a5fa22" : "#1a1f2e", border: `1px solid ${settings.weightUnit === u ? "#60a5fa66" : "#2a2f3e"}`, borderRadius: 12, padding: "12px", color: settings.weightUnit === u ? "#60a5fa" : "#555", fontWeight: 700, fontSize: 15, cursor: "pointer", fontFamily: "inherit" }}>{u}</button>)}
        </div>
      </div>

      {/* Deload */}
      <div style={{ background: "#111827", border: `1px solid ${weeksSinceDeload >= 5 ? "#f59e0b44" : "#1a1f2e"}`, borderRadius: 16, padding: "16px", marginBottom: 12 }}>
        <p style={{ margin: "0 0 4px", fontSize: 11, color: "#3d4451", fontWeight: 700, letterSpacing: 1 }}>DELOAD TRACKER</p>
        <p style={{ margin: "0 0 10px", fontSize: 13, color: weeksSinceDeload >= 5 ? "#f59e0b" : "#555" }}>{weeksSinceDeload} weeks since last deload {weeksSinceDeload >= 5 ? "⚠️ Due now" : ""}</p>
        <button onClick={() => save("deloadWeek", weeksTraining)} style={{ background: "#f59e0b18", border: "1px solid #f59e0b44", borderRadius: 10, padding: "10px 16px", color: "#f59e0b", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", fontSize: 13 }}>Mark Deload Done</button>
      </div>

      {/* Clear Data */}
      <button onClick={() => { if (window.confirm("Clear ALL data? This cannot be undone.")) { localStorage.removeItem(STORAGE_KEY); window.location.reload(); } }} style={{ width: "100%", background: "#f8717118", border: "1px solid #f8717144", borderRadius: 14, padding: "14px", color: "#f87171", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", fontSize: 14, marginBottom: 12 }}>Clear All Data</button>

      <p style={{ textAlign: "center", color: "#2a2f3e", fontSize: 11, marginTop: 4 }}>OptiGains v{APP_VERSION}</p>
    </div>
  );
}
