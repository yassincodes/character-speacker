import { useState, useEffect, useRef } from "react";

// ─── Hardcoded teacher data ───────────────────────────────────────────────────
const TEACHER = {
  name: " حسوب ",
  pic: "https://res.cloudinary.com/dw45jvxmf/image/upload/v1772363764/download_2_eugyiz.jpg",
  prompt: "",
  bio: "",
  language: "ar",
  quote: "   .",
  videos: {
    recording:
      "https://res.cloudinary.com/dw45jvxmf/video/upload/v1772363702/listening_eb8mjk.mp4",
    processing:
      "https://res.cloudinary.com/dw45jvxmf/video/upload/v1772363725/thinking_x9p6pa.mp4",
    speaking:
      "https://res.cloudinary.com/dw45jvxmf/video/upload/v1772363701/lips_moving_c9ebpv.mp4",
  },
};

// ─── Inline CSS ───────────────────────────────────────────────────────────────
const STYLES = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: #0a0a0f;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    direction: rtl;
    overflow: hidden;
    height: 100vh;
  }

  .video-call-container {
    position: relative;
    width: 100vw;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #0a0a0f 0%, #0d1520 50%, #0a0f1a 100%);
    overflow: hidden;
  }

  /* ── Animated background orbs ── */
  .background-orbs {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 0;
  }
  .orb {
    position: absolute;
    border-radius: 50%;
    filter: blur(80px);
    opacity: 0.15;
    animation: orbFloat 8s ease-in-out infinite alternate;
  }
  .orb-1 {
    width: 400px; height: 400px;
    background: radial-gradient(circle, #1a6b4a, transparent);
    top: -100px; left: -100px;
    animation-delay: 0s;
  }
  .orb-2 {
    width: 350px; height: 350px;
    background: radial-gradient(circle, #c9a227, transparent);
    bottom: -80px; right: -80px;
    animation-delay: -3s;
  }
  .orb-3 {
    width: 300px; height: 300px;
    background: radial-gradient(circle, #1a4a6b, transparent);
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    animation-delay: -6s;
  }
  @keyframes orbFloat {
    from { transform: scale(1) translate(0, 0); }
    to   { transform: scale(1.2) translate(20px, -20px); }
  }

  /* ── Main video wrapper ── */
  .video-wrapper {
    position: relative;
    z-index: 1;
    width: min(480px, 95vw);
    height: min(780px, 95vh);
    background: rgba(15, 20, 30, 0.85);
    border: 1px solid rgba(201, 162, 39, 0.2);
    border-radius: 28px;
    backdrop-filter: blur(20px);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    box-shadow:
      0 0 0 1px rgba(201,162,39,0.08),
      0 30px 80px rgba(0,0,0,0.6),
      inset 0 1px 0 rgba(255,255,255,0.05);
  }

  /* ── Top bar ── */
  .call-top-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    border-bottom: 1px solid rgba(255,255,255,0.06);
    background: rgba(0,0,0,0.2);
    flex-shrink: 0;
  }
  .call-info {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .avatar-wrapper {
    position: relative;
    width: 44px;
    height: 44px;
  }
  .call-avatar {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid rgba(201,162,39,0.4);
  }
  .online-indicator {
    position: absolute;
    bottom: 2px;
    right: 2px;
    width: 10px;
    height: 10px;
    background: #22c55e;
    border-radius: 50%;
    border: 2px solid #0f141e;
    animation: pulse 2s infinite;
  }
  @keyframes pulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(34,197,94,0.4); }
    50%       { box-shadow: 0 0 0 6px rgba(34,197,94,0); }
  }
  .call-top-bar h3 {
    color: #e8d5a3;
    font-size: 15px;
    font-weight: 600;
    letter-spacing: 0.01em;
  }
  .call-time {
    color: rgba(255,255,255,0.4);
    font-size: 12px;
    font-variant-numeric: tabular-nums;
  }
  .top-bar-right {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  /* ── Message counter ── */
  .message-counter {
    display: flex;
    align-items: center;
    gap: 5px;
    background: rgba(201,162,39,0.1);
    border: 1px solid rgba(201,162,39,0.25);
    border-radius: 20px;
    padding: 5px 10px;
    cursor: default;
  }
  .counter-icon { font-size: 13px; }
  .counter-number {
    color: #c9a227;
    font-size: 12px;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
  }

  /* ── Settings button ── */
  .settings-btn {
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 10px;
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgba(255,255,255,0.5);
    cursor: pointer;
    transition: all 0.2s;
  }
  .settings-btn:hover {
    background: rgba(255,255,255,0.1);
    color: #e8d5a3;
  }

  /* ── Status badge ── */
  .status-badge {
    font-size: 11px;
    padding: 4px 10px;
    border-radius: 20px;
    font-weight: 600;
    white-space: nowrap;
    transition: all 0.3s;
  }
  .status-badge.connected  { background: rgba(34,197,94,0.15);  color: #22c55e; border: 1px solid rgba(34,197,94,0.3); }
  .status-badge.recording  { background: rgba(239,68,68,0.15);  color: #ef4444; border: 1px solid rgba(239,68,68,0.3); animation: statusPulse 1s infinite; }
  .status-badge.processing { background: rgba(234,179,8,0.15);  color: #eab308; border: 1px solid rgba(234,179,8,0.3); }
  .status-badge.speaking   { background: rgba(59,130,246,0.15); color: #3b82f6; border: 1px solid rgba(59,130,246,0.3); }
  @keyframes statusPulse {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.6; }
  }

  /* ── Video main area ── */
  .video-main {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    min-height: 0;
  }
  .video-frame {
    position: relative;
    width: 100%;
    height: 100%;
    border-radius: 20px;
    overflow: hidden;
    background: rgba(0,0,0,0.3);
    border: 1px solid rgba(201,162,39,0.1);
  }
  .avatar-video {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
  .video-shimmer {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      135deg,
      transparent 40%,
      rgba(201,162,39,0.03) 50%,
      transparent 60%
    );
    animation: shimmer 3s linear infinite;
    pointer-events: none;
  }
  @keyframes shimmer {
    0%   { transform: translateX(-100%) translateY(-100%); }
    100% { transform: translateX(100%) translateY(100%); }
  }

  /* ── Transcript sidebar ── */
  .transcript-sidebar {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(10,14,22,0.96);
    backdrop-filter: blur(10px);
    z-index: 10;
    display: flex;
    flex-direction: column;
    border-radius: 28px;
    overflow: hidden;
  }
  .transcript-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px;
    border-bottom: 1px solid rgba(255,255,255,0.08);
    flex-shrink: 0;
  }
  .transcript-header h4 {
    color: #e8d5a3;
    font-size: 16px;
  }
  .close-transcript {
    background: rgba(255,255,255,0.08);
    border: none;
    color: rgba(255,255,255,0.6);
    width: 32px;
    height: 32px;
    border-radius: 50%;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.2s;
  }
  .close-transcript:hover { background: rgba(255,255,255,0.15); color: white; }
  .transcript-messages {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    scrollbar-width: thin;
    scrollbar-color: rgba(201,162,39,0.3) transparent;
  }
  .transcript-msg {
    padding: 10px 14px;
    border-radius: 12px;
    max-width: 85%;
  }
  .transcript-msg.user {
    background: rgba(26,107,74,0.2);
    border: 1px solid rgba(26,107,74,0.3);
    align-self: flex-end;
    text-align: right;
  }
  .transcript-msg.assistant {
    background: rgba(201,162,39,0.1);
    border: 1px solid rgba(201,162,39,0.2);
    align-self: flex-start;
    text-align: right;
  }
  .transcript-msg strong {
    display: block;
    font-size: 11px;
    color: rgba(255,255,255,0.5);
    margin-bottom: 4px;
  }
  .transcript-msg p {
    color: rgba(255,255,255,0.85);
    font-size: 13px;
    line-height: 1.5;
  }

  /* ── Call controls ── */
  .call-controls {
    padding: 16px 20px 24px;
    border-top: 1px solid rgba(255,255,255,0.06);
    background: rgba(0,0,0,0.2);
    flex-shrink: 0;
  }
  .error-toast {
    background: rgba(239,68,68,0.15);
    border: 1px solid rgba(239,68,68,0.3);
    color: #ef4444;
    font-size: 12px;
    padding: 8px 12px;
    border-radius: 8px;
    margin-bottom: 12px;
    text-align: center;
  }
  .control-btns {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
  }
  .control-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 16px;
    padding: 14px 20px;
    cursor: pointer;
    color: rgba(255,255,255,0.7);
    font-size: 11px;
    font-weight: 600;
    transition: all 0.2s;
    min-width: 70px;
  }
  .control-btn:hover:not(:disabled) {
    background: rgba(255,255,255,0.12);
    color: white;
    transform: translateY(-2px);
  }
  .control-btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .control-btn.active {
    background: rgba(239,68,68,0.2);
    border-color: rgba(239,68,68,0.4);
    color: #ef4444;
  }
  .btn-icon {
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .btn-icon svg { width: 22px; height: 22px; }
  .transcript-btn.active {
    background: rgba(59,130,246,0.2);
    border-color: rgba(59,130,246,0.4);
    color: #3b82f6;
  }
  .end-btn {
    background: rgba(239,68,68,0.15);
    border-color: rgba(239,68,68,0.3);
    color: #ef4444;
  }
  .end-btn:hover {
    background: rgba(239,68,68,0.3) !important;
  }

  /* ── Modals ── */
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.7);
    backdrop-filter: blur(4px);
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
  }

  /* Limit modal */
  .limit-modal {
    background: linear-gradient(135deg, #0f141e, #1a1f2e);
    border: 1px solid rgba(239,68,68,0.3);
    border-radius: 24px;
    padding: 40px 30px;
    text-align: center;
    max-width: 320px;
    width: 100%;
    box-shadow: 0 20px 60px rgba(0,0,0,0.5);
  }
  .limit-icon { font-size: 48px; margin-bottom: 16px; }
  .limit-modal h2 { color: #e8d5a3; font-size: 18px; margin-bottom: 12px; }
  .limit-modal p  { color: rgba(255,255,255,0.6); font-size: 14px; line-height: 1.5; margin-bottom: 8px; }
  .limit-reset { color: rgba(255,255,255,0.4) !important; font-size: 12px !important; }
  .limit-btn {
    margin-top: 24px;
    background: linear-gradient(135deg, #1a6b4a, #22c55e);
    border: none;
    border-radius: 12px;
    color: white;
    font-size: 14px;
    font-weight: 700;
    padding: 12px 32px;
    cursor: pointer;
    transition: opacity 0.2s;
  }
  .limit-btn:hover { opacity: 0.85; }

  /* Settings modal */
  .settings-modal-content {
    background: linear-gradient(135deg, #0f141e, #1a1f2e);
    border: 1px solid rgba(201,162,39,0.2);
    border-radius: 24px;
    width: min(480px, 95vw);
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 30px 80px rgba(0,0,0,0.6);
    scrollbar-width: thin;
    scrollbar-color: rgba(201,162,39,0.3) transparent;
  }
  .settings-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    padding: 24px 24px 16px;
    border-bottom: 1px solid rgba(255,255,255,0.06);
    position: sticky;
    top: 0;
    background: #0f141e;
    z-index: 1;
  }
  .settings-header h2 { color: #e8d5a3; font-size: 18px; margin-bottom: 4px; }
  .settings-subtitle  { color: rgba(255,255,255,0.4); font-size: 13px; }
  .settings-close {
    background: rgba(255,255,255,0.08);
    border: none;
    color: rgba(255,255,255,0.5);
    width: 32px;
    height: 32px;
    border-radius: 50%;
    cursor: pointer;
    font-size: 14px;
    flex-shrink: 0;
    transition: all 0.2s;
  }
  .settings-close:hover { background: rgba(255,255,255,0.15); color: white; }

  .settings-body { padding: 16px 24px; display: flex; flex-direction: column; gap: 12px; }

  .settings-card {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 16px;
    padding: 16px;
    display: flex;
    align-items: flex-start;
    gap: 12px;
  }
  .card-icon { font-size: 20px; flex-shrink: 0; margin-top: 2px; }
  .settings-label {
    display: block;
    color: rgba(255,255,255,0.6);
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin-bottom: 10px;
  }
  .settings-input {
    width: 100%;
    background: rgba(0,0,0,0.3);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 10px;
    color: white;
    font-size: 14px;
    padding: 10px 14px;
    outline: none;
    direction: rtl;
    transition: border-color 0.2s;
  }
  .settings-input:focus { border-color: rgba(201,162,39,0.4); }
  .settings-input::placeholder { color: rgba(255,255,255,0.25); }
  .settings-hint { color: rgba(255,255,255,0.3); font-size: 11px; margin-top: 6px; }

  .settings-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }
  .settings-option {
    background: rgba(0,0,0,0.3);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 10px;
    padding: 10px 8px;
    color: rgba(255,255,255,0.6);
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    transition: all 0.2s;
  }
  .settings-option:hover { background: rgba(255,255,255,0.06); color: white; }
  .settings-option.active {
    background: rgba(201,162,39,0.15);
    border-color: rgba(201,162,39,0.4);
    color: #c9a227;
  }
  .option-emoji { font-size: 14px; }

  .difficulty-selector {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
  }
  .difficulty-option {
    background: rgba(0,0,0,0.3);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 10px;
    padding: 10px 6px;
    color: rgba(255,255,255,0.6);
    font-size: 11px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    transition: all 0.2s;
  }
  .difficulty-option:hover { background: rgba(255,255,255,0.06); color: white; }
  .difficulty-option.active {
    background: rgba(255,255,255,0.08);
    border-color: var(--level-color, rgba(201,162,39,0.4));
    color: var(--level-color, #c9a227);
  }
  .difficulty-icon { font-size: 16px; }

  .toggle-options { display: flex; flex-direction: column; gap: 8px; }
  .toggle-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 12px;
    background: rgba(0,0,0,0.2);
    border-radius: 10px;
    cursor: pointer;
    gap: 10px;
  }
  .toggle-info { display: flex; align-items: center; gap: 10px; flex: 1; }
  .toggle-icon { font-size: 18px; }
  .toggle-title { color: rgba(255,255,255,0.8); font-size: 13px; font-weight: 600; }
  .toggle-desc  { color: rgba(255,255,255,0.35); font-size: 11px; margin-top: 2px; }
  .toggle-checkbox { display: none; }
  .toggle-switch {
    position: relative;
    width: 40px;
    height: 22px;
    background: rgba(255,255,255,0.1);
    border-radius: 11px;
    transition: background 0.2s;
    flex-shrink: 0;
  }
  .toggle-switch::after {
    content: '';
    position: absolute;
    top: 3px;
    right: 3px;
    width: 16px;
    height: 16px;
    background: white;
    border-radius: 50%;
    transition: transform 0.2s;
  }
  .toggle-checkbox:checked + .toggle-switch { background: #1a6b4a; }
  .toggle-checkbox:checked + .toggle-switch::after { transform: translateX(-18px); }

  .teacher-card { align-items: center; }
  .teacher-info { display: flex; align-items: center; gap: 10px; }
  .teacher-mini-pic {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    object-fit: cover;
    border: 1px solid rgba(201,162,39,0.3);
  }
  .teacher-name-text { color: #e8d5a3; font-size: 14px; font-weight: 600; }

  .settings-footer {
    display: flex;
    gap: 12px;
    padding: 16px 24px 24px;
    border-top: 1px solid rgba(255,255,255,0.06);
    position: sticky;
    bottom: 0;
    background: #0f141e;
  }
  .settings-btn-secondary {
    flex: 1;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 12px;
    color: rgba(255,255,255,0.6);
    font-size: 14px;
    font-weight: 600;
    padding: 12px;
    cursor: pointer;
    transition: all 0.2s;
  }
  .settings-btn-secondary:hover { background: rgba(255,255,255,0.1); color: white; }
  .settings-btn-primary {
    flex: 2;
    background: linear-gradient(135deg, #1a6b4a, #22c55e);
    border: none;
    border-radius: 12px;
    color: white;
    font-size: 14px;
    font-weight: 700;
    padding: 12px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: opacity 0.2s;
  }
  .settings-btn-primary:hover { opacity: 0.85; }
`;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API;

const DEFAULT_SETTINGS = {
  topic: "",
  speakingStyle: "conversational",
  responseLength: "short",
  difficultyLevel: "medium",
  includeExamples: true,
  useAnalogies: false,
  encouragement: true,
  formalLevel: "casual",
};

function formatDuration(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function buildSystemPrompt(settings) {
  let prompt = TEACHER.prompt;
  if (settings.topic) prompt += `\n\nموضوع المحادثة: ${settings.topic}`;

  const lengths = { veryShort: "أجب في جملة واحدة فقط", short: "أجب بإجابات قصيرة ومباشرة (2-3 جمل)", medium: "أجب بشكل متوسط الطول مع بعض التفاصيل", detailed: "قدم إجابة مفصلة وشاملة" };
  const diffs   = { beginner: "استخدم لغة بسيطة جداً ومناسبة للمبتدئين", easy: "اشرح بطريقة سهلة وواضحة", medium: "استخدم مستوى متوسط من التعقيد", advanced: "يمكنك استخدام مصطلحات متقدمة ومفاهيم معقدة" };
  const styles  = { conversational: "تحدث بأسلوب ودي ومحادثة طبيعية", professional: "استخدم أسلوباً مهنياً ورسمياً", enthusiastic: "كن متحمساً ومشجعاً في إجاباتك", socratic: "استخدم طريقة سقراط في التعليم بطرح أسئلة توجيهية" };

  prompt += `\n\n${lengths[settings.responseLength]}`;
  prompt += `\n${diffs[settings.difficultyLevel]}`;
  prompt += `\n${styles[settings.speakingStyle]}`;
  if (settings.includeExamples) prompt += "\nقدم أمثلة عملية عندما يكون ذلك مناسباً";
  if (settings.useAnalogies)    prompt += "\nاستخدم التشبيهات والاستعارات لتوضيح المفاهيم";
  if (settings.encouragement)   prompt += "\nشجع الطالب وامدحه عند الإجابة الصحيحة";
  return prompt;
}

// ─── Simple in-memory rate limiter (resets on page reload) ───────────────────
const DAILY_LIMIT = 5;
const rateLimitStore = { count: 0, date: new Date().toDateString() };
function getRemainingLocal() {
  if (rateLimitStore.date !== new Date().toDateString()) {
    rateLimitStore.count = 0;
    rateLimitStore.date  = new Date().toDateString();
  }
  return DAILY_LIMIT - rateLimitStore.count;
}
function incrementLocal() { rateLimitStore.count++; }

// ─── App Component ────────────────────────────────────────────────────────────
export default function App() {
  const [isRecording, setIsRecording]   = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking]     = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [transcript, setTranscript]     = useState([]);
  const [error, setError]               = useState("");
  const [callDuration, setCallDuration] = useState(0);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [voiceInteractionsRemaining, setVoiceInteractionsRemaining] = useState(getRemainingLocal);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [settings, setSettings]         = useState(DEFAULT_SETTINGS);
  const [currentVideoState, setCurrentVideoState] = useState("idle");

  const mediaRecorderRef = useRef(null);
  const audioChunksRef   = useRef([]);
  const audioContextRef  = useRef(null);
  const audioSourceRef   = useRef(null);
  const transcriptEndRef = useRef(null);

  // Inject CSS
  useEffect(() => {
    const el = document.createElement("style");
    el.textContent = STYLES;
    document.head.appendChild(el);
    return () => el.remove();
  }, []);

  // Call timer
  useEffect(() => {
    const t = setInterval(() => setCallDuration(p => p + 1), 1000);
    return () => clearInterval(t);
  }, []);

  // Scroll transcript
  useEffect(() => {
    if (showTranscript) transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcript, showTranscript]);

  // Cleanup audio
  useEffect(() => {
    return () => {
      try { audioSourceRef.current?.stop(); } catch {}
      audioContextRef.current?.close();
    };
  }, []);

  // ── Recording ──────────────────────────────────────────────────────────────
  const startRecording = async () => {
    const remaining = getRemainingLocal();
    if (remaining <= 0) { setShowLimitModal(true); return; }

    try {
      setError("");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current   = [];

      mediaRecorderRef.current.ondataavailable = e => audioChunksRef.current.push(e.data);
      mediaRecorderRef.current.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        await processAudio(blob);
        stream.getTracks().forEach(t => t.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setCurrentVideoState("recording");

      // Decrement
      incrementLocal();
      setVoiceInteractionsRemaining(getRemainingLocal());
    } catch (err) {
      console.error(err);
      setError("لا يمكن الوصول إلى الميكروفون");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsProcessing(true);
      setCurrentVideoState("processing");
    }
  };

  // ── Audio processing ───────────────────────────────────────────────────────
  const processAudio = async (audioBlob) => {
    try {
      // 1. Transcribe
      const form = new FormData();
      form.append("file", audioBlob, "audio.webm");
      form.append("model", "gpt-4o-mini-transcribe");
      form.append("language", "ar");

      const transRes = await fetch("https://api.openai.com/v1/audio/transcriptions", {
        method: "POST",
        headers: { Authorization: `Bearer ${OPENAI_API_KEY}` },
        body: form,
      });
      if (!transRes.ok) throw new Error("فشل تحويل الصوت إلى نص");
      const { text: userText } = await transRes.json();

      const nextTranscript = [...transcript, { role: "user", text: userText }];
      setTranscript(nextTranscript);

      // 2. Chat
      const chatRes = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "gpt-4o",
          max_tokens: 100,
          temperature: 0.5,
          messages: [
            { role: "system", content: buildSystemPrompt(settings) },
            ...nextTranscript.map(t => ({ role: t.role, content: t.text })),
          ],
        }),
      });
      if (!chatRes.ok) throw new Error("فشل الحصول على رد");
      const chatData = await chatRes.json();
      const aiText   = chatData.choices[0].message.content;
      setTranscript(prev => [...prev, { role: "assistant", text: aiText }]);

      // 3. TTS
      const ttsRes = await fetch("https://api.openai.com/v1/audio/speech", {
        method: "POST",
        headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model: "gpt-4o-mini-tts", voice: "onyx", input: aiText, response_format: "wav" }),
      });
      if (!ttsRes.ok) throw new Error("فشل تحويل النص إلى صوت");

      const audioData = await ttsRes.arrayBuffer();
      playAudio(audioData);
    } catch (err) {
      console.error(err);
      setError(err.message || "حدث خطأ أثناء المعالجة");
      setIsProcessing(false);
      setCurrentVideoState("idle");
    }
  };

  const playAudio = (arrayBuffer) => {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    audioContextRef.current = ctx;
    ctx.decodeAudioData(arrayBuffer, buffer => {
      const src = ctx.createBufferSource();
      src.buffer = buffer;
      src.connect(ctx.destination);
      audioSourceRef.current = src;

      setIsSpeaking(true);
      setIsProcessing(false);
      setCurrentVideoState("speaking");

      src.onended = () => { setIsSpeaking(false); setCurrentVideoState("idle"); };
      src.start(0);
    });
  };

  const getVideoUrl = (state) => TEACHER.videos?.[state] ?? null;

  // ── Status label ───────────────────────────────────────────────────────────
  const statusClass = isSpeaking ? "speaking" : isProcessing ? "processing" : isRecording ? "recording" : "connected";
  const statusLabel = isSpeaking ? "🔊 يتحدث"  : isProcessing ? "⏳ يفكر"    : isRecording ? "🎤 يستمع"   : "✓ متصل";

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="video-call-container">
      {/* Background */}
      <div className="background-orbs">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>

      {/* Main card */}
      <div className="video-wrapper">

        {/* Top bar */}
        <div className="call-top-bar">
          <div className="call-info">
            <div className="avatar-wrapper">
              <img src={TEACHER.pic} alt={TEACHER.name} className="call-avatar" />
              <div className="online-indicator" />
            </div>
            <div>
              <h3>{TEACHER.name}</h3>
              <span className="call-time">{formatDuration(callDuration)}</span>
            </div>
          </div>

          <div className="top-bar-right">
            <div className="message-counter" title={`${voiceInteractionsRemaining} تفاعلات صوتية متبقية اليوم`}>
              <span className="counter-icon">🎤</span>
              <span className="counter-number">{voiceInteractionsRemaining}/{DAILY_LIMIT}</span>
            </div>

            <button className="settings-btn" onClick={() => setShowSettingsModal(true)} title="إعدادات المحادثة">
              <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
              </svg>
            </button>

            <div className={`status-badge ${statusClass}`}>{statusLabel}</div>
          </div>
        </div>

        {/* Video */}
        <div className="video-main">
          <div className="video-frame">
            {currentVideoState === "idle" ? (
              <img src={TEACHER.pic} alt={TEACHER.name} className="avatar-video" />
            ) : (
              <video
                key={currentVideoState}
                className="avatar-video"
                src={getVideoUrl(currentVideoState)}
                loop muted playsInline autoPlay
              />
            )}
            <div className="video-shimmer" />
          </div>
        </div>

        {/* Transcript overlay */}
        {showTranscript && (
          <div className="transcript-sidebar">
            <div className="transcript-header">
              <h4>📝 نص المحادثة</h4>
              <button className="close-transcript" onClick={() => setShowTranscript(false)}>✕</button>
            </div>
            <div className="transcript-messages">
              {transcript.map((msg, i) => (
                <div key={i} className={`transcript-msg ${msg.role}`}>
                  <strong>{msg.role === "user" ? "أنت" : TEACHER.name}</strong>
                  <p>{msg.text}</p>
                </div>
              ))}
              <div ref={transcriptEndRef} />
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="call-controls">
          {error && <div className="error-toast">{error}</div>}
          <div className="control-btns">

            {/* Mic button */}
            <button
              className={`control-btn mic-btn ${isRecording ? "active" : ""}`}
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isProcessing || voiceInteractionsRemaining <= 0}
              title={voiceInteractionsRemaining <= 0 ? "لقد وصلت إلى الحد اليومي" : isRecording ? "إيقاف التسجيل" : "ابدأ التحدث"}
            >
              <div className="btn-icon">
                {isRecording ? (
                  <svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                    <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                  </svg>
                )}
              </div>
              <span>{isRecording ? "إيقاف" : "تحدث"}</span>
            </button>

            {/* Transcript toggle */}
            <button
              className={`control-btn transcript-btn ${showTranscript ? "active" : ""}`}
              onClick={() => setShowTranscript(p => !p)}
              title="عرض نص المحادثة"
            >
              <div className="btn-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
                </svg>
              </div>
              <span>نص</span>
            </button>

            {/* End call */}
            <button className="control-btn end-btn" onClick={() => window.history.back()} title="إنهاء المكالمة">
              <div className="btn-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 9c-1.6 0-3.15.25-4.6.72v3.1c0 .39-.23.74-.56.9-.98.49-1.87 1.12-2.66 1.85-.18.18-.43.28-.7.28-.28 0-.53-.11-.71-.29L.29 13.08c-.18-.17-.29-.42-.29-.7 0-.28.11-.53.29-.71C3.34 8.78 7.46 7 12 7s8.66 1.78 11.71 4.67c.18.18.29.43.29.71 0 .28-.11.53-.29.71l-2.48 2.48c-.18.18-.43.29-.71.29-.27 0-.52-.11-.7-.28-.79-.74-1.69-1.36-2.67-1.85-.33-.16-.56-.5-.56-.9v-3.1C15.15 9.25 13.6 9 12 9z"/>
                </svg>
              </div>
              <span>إنهاء</span>
            </button>

          </div>
        </div>
      </div>

      {/* ── Limit modal ── */}
      {showLimitModal && (
        <div className="modal-overlay" onClick={() => setShowLimitModal(false)}>
          <div className="limit-modal" onClick={e => e.stopPropagation()}>
            <div className="limit-icon">🚫</div>
            <h2>لقد وصلت إلى الحد اليومي</h2>
            <p>لقد استخدمت جميع تفاعلاتك الصوتية الـ {DAILY_LIMIT} لهذا اليوم.</p>
            <p className="limit-reset">سيتم إعادة تعيين الحد في منتصف الليل.</p>
            <button className="limit-btn" onClick={() => setShowLimitModal(false)}>حسناً</button>
          </div>
        </div>
      )}

      {/* ── Settings modal ── */}
      {showSettingsModal && (
        <div className="modal-overlay" onClick={() => setShowSettingsModal(false)}>
          <div className="settings-modal-content" onClick={e => e.stopPropagation()}>

            <div className="settings-header">
              <div>
                <h2>⚙️ إعدادات المحادثة</h2>
                <p className="settings-subtitle">خصص تجربة التعلم الخاصة بك</p>
              </div>
              <button className="settings-close" onClick={() => setShowSettingsModal(false)}>✕</button>
            </div>

            <div className="settings-body">

              {/* Teacher */}
              <div className="settings-card teacher-card">
                <div className="card-icon">👤</div>
                <div>
                  <label className="settings-label">المعلم</label>
                  <div className="teacher-info">
                    <img src={TEACHER.pic} alt={TEACHER.name} className="teacher-mini-pic" />
                    <span className="teacher-name-text">{TEACHER.name}</span>
                  </div>
                </div>
              </div>

              {/* Topic */}
              <div className="settings-card">
                <div className="card-icon">📚</div>
                <div style={{ flex: 1 }}>
                  <label className="settings-label">موضوع المحادثة</label>
                  <input
                    type="text"
                    className="settings-input"
                    value={settings.topic}
                    onChange={e => setSettings(s => ({ ...s, topic: e.target.value }))}
                    placeholder="ما هو موضوع المحادثة؟"
                  />
                  <p className="settings-hint">اترك فارغاً للمحادثة العامة</p>
                </div>
              </div>

              {/* Style */}
              <div className="settings-card">
                <div className="card-icon">💬</div>
                <div style={{ flex: 1 }}>
                  <label className="settings-label">أسلوب المحادثة</label>
                  <div className="settings-grid">
                    {[{ value: "conversational", label: "ودي", emoji: "😊" }, { value: "professional", label: "رسمي", emoji: "👔" }, { value: "enthusiastic", label: "متحمس", emoji: "🎉" }, { value: "socratic", label: "سقراطي", emoji: "🤔" }].map(o => (
                      <button key={o.value} className={`settings-option ${settings.speakingStyle === o.value ? "active" : ""}`} onClick={() => setSettings(s => ({ ...s, speakingStyle: o.value }))}>
                        <span className="option-emoji">{o.emoji}</span><span>{o.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Length */}
              <div className="settings-card">
                <div className="card-icon">📏</div>
                <div style={{ flex: 1 }}>
                  <label className="settings-label">طول الإجابة</label>
                  <div className="settings-grid">
                    {[{ value: "veryShort", label: "قصيرة جداً", emoji: "⚡" }, { value: "short", label: "قصيرة", emoji: "📝" }, { value: "medium", label: "متوسطة", emoji: "📄" }, { value: "detailed", label: "مفصلة", emoji: "📚" }].map(o => (
                      <button key={o.value} className={`settings-option ${settings.responseLength === o.value ? "active" : ""}`} onClick={() => setSettings(s => ({ ...s, responseLength: o.value }))}>
                        <span className="option-emoji">{o.emoji}</span><span>{o.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Difficulty */}
              <div className="settings-card">
                <div className="card-icon">🎯</div>
                <div style={{ flex: 1 }}>
                  <label className="settings-label">مستوى الصعوبة</label>
                  <div className="difficulty-selector">
                    {[{ value: "beginner", label: "مبتدئ", color: "#4ade80", icon: "🌱" }, { value: "easy", label: "سهل", color: "#60a5fa", icon: "📘" }, { value: "medium", label: "متوسط", color: "#fbbf24", icon: "📙" }, { value: "advanced", label: "متقدم", color: "#f87171", icon: "🔥" }].map(o => (
                      <button key={o.value} className={`difficulty-option ${settings.difficultyLevel === o.value ? "active" : ""}`} style={{ "--level-color": o.color }} onClick={() => setSettings(s => ({ ...s, difficultyLevel: o.value }))}>
                        <span className="difficulty-icon">{o.icon}</span><span>{o.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Toggles */}
              <div className="settings-card">
                <div className="card-icon">✨</div>
                <div style={{ flex: 1 }}>
                  <label className="settings-label">خيارات إضافية</label>
                  <div className="toggle-options">
                    {[
                      { key: "includeExamples", icon: "💡", title: "تضمين أمثلة",       desc: "إضافة أمثلة عملية للتوضيح" },
                      { key: "useAnalogies",    icon: "🎨", title: "استخدام التشبيهات", desc: "شرح المفاهيم بالتشبيهات والاستعارات" },
                      { key: "encouragement",   icon: "🌟", title: "التشجيع والمدح",    desc: "تشجيع الطالب عند الإجابة الصحيحة" },
                    ].map(t => (
                      <label key={t.key} className="toggle-item">
                        <div className="toggle-info">
                          <span className="toggle-icon">{t.icon}</span>
                          <div>
                            <div className="toggle-title">{t.title}</div>
                            <div className="toggle-desc">{t.desc}</div>
                          </div>
                        </div>
                        <input type="checkbox" className="toggle-checkbox" checked={settings[t.key]} onChange={e => setSettings(s => ({ ...s, [t.key]: e.target.checked }))} />
                        <div className="toggle-switch" />
                      </label>
                    ))}
                  </div>
                </div>
              </div>

            </div>

            <div className="settings-footer">
              <button className="settings-btn-secondary" onClick={() => setSettings(DEFAULT_SETTINGS)}>إعادة تعيين</button>
              <button className="settings-btn-primary" onClick={() => { setShowSettingsModal(false); setTranscript([]); }}>
                <span>حفظ الإعدادات</span><span>✓</span>
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}