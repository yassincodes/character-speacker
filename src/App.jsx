import { useState, useEffect, useRef } from "react";

const TEACHER = {
  name: "حسوب",
  pic: "https://res.cloudinary.com/dw45jvxmf/image/upload/v1772363764/download_2_eugyiz.jpg",
  prompt: "",
  language: "ar",
  videos: {
    recording: "https://res.cloudinary.com/dw45jvxmf/video/upload/v1772363702/listening_eb8mjk.mp4",
    processing: "https://res.cloudinary.com/dw45jvxmf/video/upload/v1772363725/thinking_x9p6pa.mp4",
    speaking:   "https://res.cloudinary.com/dw45jvxmf/video/upload/v1772363701/lips_moving_c9ebpv.mp4",
  },
};

const DAILY_LIMIT = 5;
const store = { count: 0, date: new Date().toDateString() };
function getRemaining() {
  if (store.date !== new Date().toDateString()) { store.count = 0; store.date = new Date().toDateString(); }
  return DAILY_LIMIT - store.count;
}
function useLimit() { store.count++; }

const DEFAULT_SETTINGS = {
  topic: "", speakingStyle: "conversational", responseLength: "short",
  difficultyLevel: "medium", includeExamples: true, useAnalogies: false, encouragement: true,
};

function formatTime(s) {
  return `${Math.floor(s/60).toString().padStart(2,"0")}:${(s%60).toString().padStart(2,"0")}`;
}

function buildSystemPrompt(s) {
  let p = TEACHER.prompt;
  if (s.topic) p += `\n\nموضوع المحادثة: ${s.topic}`;
  const lengths = { veryShort:"أجب في جملة واحدة فقط", short:"أجب بإجابات قصيرة (2-3 جمل)", medium:"أجب بشكل متوسط الطول", detailed:"قدم إجابة مفصلة" };
  const diffs   = { beginner:"استخدم لغة بسيطة جداً", easy:"اشرح بطريقة سهلة", medium:"استخدم مستوى متوسط", advanced:"استخدم مصطلحات متقدمة" };
  const styles  = { conversational:"تحدث بأسلوب ودي طبيعي", professional:"استخدم أسلوباً مهنياً", enthusiastic:"كن متحمساً ومشجعاً", socratic:"استخدم طريقة سقراط" };
  p += `\n\n${lengths[s.responseLength]}\n${diffs[s.difficultyLevel]}\n${styles[s.speakingStyle]}`;
  if (s.includeExamples) p += "\nقدم أمثلة عملية عند الحاجة";
  if (s.useAnalogies)    p += "\nاستخدم التشبيهات لتوضيح المفاهيم";
  if (s.encouragement)   p += "\nشجع الطالب وامدحه عند الإجابة الصحيحة";
  return p;
}

const GearIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>
);

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: #0a0a0a;
    font-family: 'Tajawal', sans-serif;
    direction: rtl;
    overflow: hidden;
    height: 100vh;
    width: 100vw;
  }

  /* ── SHELL ── */
  .shell {
    width: 100vw;
    height: 100vh;
    display: flex;
    flex-direction: column;
    background: #111;
    position: relative;
    overflow: hidden;
  }

  /* ── VIDEO BACKGROUND ── */
  .video-bg {
    position: absolute;
    inset: 0;
    z-index: 0;
  }
  .video-bg video,
  .video-bg img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    object-position: center center;
    display: block;
    background: #1a1a1a;
  }
  /* subtle vignette only at bottom and top for UI legibility */
  .video-bg::after {
    content: '';
    position: absolute;
    inset: 0;
    background:
      linear-gradient(180deg, rgba(0,0,0,0.45) 0%, transparent 18%),
      linear-gradient(0deg,   rgba(0,0,0,0.55) 0%, transparent 22%);
    pointer-events: none;
  }

  /* ── TOP BAR ── */
  .top-bar {
    position: relative;
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 22px;
    background: linear-gradient(180deg, rgba(0,0,0,0.7) 0%, transparent 100%);
    flex-shrink: 0;
  }
  .tb-left { display: flex; align-items: center; gap: 12px; }
  .back-btn {
    background: rgba(255,255,255,0.1);
    border: none; border-radius: 50%;
    width: 36px; height: 36px;
    display: flex; align-items: center; justify-content: center;
    color: white; cursor: pointer; font-size: 16px;
    transition: background 0.2s;
  }
  .back-btn:hover { background: rgba(255,255,255,0.18); }
  .caller-info { display: flex; align-items: center; gap: 10px; }
  .caller-pic {
    width: 38px; height: 38px; border-radius: 50%;
    object-fit: cover; border: 2px solid rgba(255,255,255,0.35);
  }
  .caller-name { color: white; font-size: 15px; font-weight: 700; }
  .caller-status {
    display: flex; align-items: center; gap: 5px;
    color: rgba(255,255,255,0.6); font-size: 12px; margin-top: 1px;
  }
  .status-dot { width: 7px; height: 7px; border-radius: 50%; }
  .status-dot.connected { background: #22c55e; box-shadow: 0 0 6px rgba(34,197,94,0.8); animation: sdPulse 2s infinite; }
  .status-dot.recording { background: #ef4444; box-shadow: 0 0 6px rgba(239,68,68,0.8); animation: sdPulse 0.8s infinite; }
  .status-dot.processing { background: #f59e0b; box-shadow: 0 0 6px rgba(245,158,11,0.8); }
  .status-dot.speaking { background: #3b82f6; box-shadow: 0 0 6px rgba(59,130,246,0.8); }
  @keyframes sdPulse { 0%,100%{opacity:1;} 50%{opacity:0.4;} }
  .tb-right { display: flex; align-items: center; gap: 10px; }
  .timer-chip {
    background: rgba(0,0,0,0.45);
    border: 1px solid rgba(255,255,255,0.15);
    border-radius: 20px; padding: 5px 12px;
    color: rgba(255,255,255,0.85); font-size: 13px;
    font-variant-numeric: tabular-nums; letter-spacing: 0.06em;
  }
  .icon-btn {
    background: rgba(255,255,255,0.1);
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 50%; width: 36px; height: 36px;
    display: flex; align-items: center; justify-content: center;
    color: rgba(255,255,255,0.75); cursor: pointer;
    transition: all 0.2s;
  }
  .icon-btn:hover { background: rgba(255,255,255,0.2); color: white; }
  .icon-btn.gear:hover { transform: rotate(60deg); }

  /* ── MAIN CONTENT (middle flex area) ── */
  .main-area {
    position: relative;
    z-index: 10;
    flex: 1;
    display: flex;
    align-items: flex-end;
    min-height: 0;
  }

  /* ── CHAT COLUMN ── */
  .chat-col {
    width: 380px;
    max-width: 44vw;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    padding: 10px 14px 6px;
  }
  .messages-scroll {
    display: flex;
    flex-direction: column;
    gap: 10px;
    overflow-y: auto;
    max-height: 100%;
    scrollbar-width: none;
    padding: 4px 2px 6px;
  }
  .messages-scroll::-webkit-scrollbar { display: none; }

  @keyframes bubbleIn {
    from { opacity: 0; transform: translateY(12px) scale(0.94); }
    to   { opacity: 1; transform: none; }
  }

  /* ── ROW wrappers ── */
  .bubble-row { display: flex; align-items: flex-end; gap: 8px; }
  .bubble-row.user      { flex-direction: row-reverse; }
  .bubble-row.assistant { flex-direction: row; }

  .bubble-avatar {
    width: 30px; height: 30px; border-radius: 50%;
    object-fit: cover; flex-shrink: 0;
    border: 2px solid rgba(255,255,255,0.18);
    box-shadow: 0 2px 8px rgba(0,0,0,0.4);
    align-self: flex-end;
    margin-bottom: 2px;
  }

  /* ── BASE BUBBLE ── */
  .bubble {
    max-width: 272px;
    border-radius: 20px;
    font-size: 14px;
    line-height: 1.6;
    animation: bubbleIn 0.32s cubic-bezier(0.34,1.45,0.64,1) both;
    word-break: break-word;
    overflow: hidden;
  }

  /* ── USER bubble ── */
  .bubble.user {
    background: linear-gradient(135deg, #0084ff 0%, #0066d6 100%);
    color: white;
    border-bottom-left-radius: 5px;
    padding: 11px 15px;
    box-shadow: 0 4px 16px rgba(0,132,255,0.3);
  }

  /* ── ASSISTANT bubble ── */
  .bubble.assistant {
    background: rgba(28,28,32,0.88);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    color: rgba(255,255,255,0.93);
    border-bottom-right-radius: 5px;
    border: 1px solid rgba(255,255,255,0.1);
    box-shadow: 0 4px 20px rgba(0,0,0,0.35);
    padding: 0;
  }
  /* inner padding so equation blocks can go edge-to-edge */
  .bubble.assistant .bubble-text { padding: 12px 15px; }

  /* ── RICH CONTENT inside assistant bubble ── */

  /* inline code */
  .bubble .inline-code {
    background: rgba(255,255,255,0.1);
    border: 1px solid rgba(255,255,255,0.14);
    border-radius: 5px;
    padding: 1px 6px;
    font-family: 'Fira Mono', 'Courier New', monospace;
    font-size: 12.5px;
    color: #7dd3fc;
  }

  /* block code */
  .bubble .code-block {
    background: rgba(0,0,0,0.55);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 10px;
    margin: 8px 0;
    overflow: hidden;
  }
  .bubble .code-lang {
    background: rgba(255,255,255,0.06);
    border-bottom: 1px solid rgba(255,255,255,0.08);
    padding: 4px 12px;
    font-size: 10px; font-weight: 700; letter-spacing: 0.08em;
    color: rgba(255,255,255,0.35); text-transform: uppercase;
  }
  .bubble .code-content {
    padding: 10px 12px;
    font-family: 'Fira Mono', 'Courier New', monospace;
    font-size: 12.5px; line-height: 1.6;
    color: #e2e8f0;
    white-space: pre-wrap; overflow-x: auto;
  }

  /* bold */
  .bubble .bold-text { font-weight: 800; color: white; }

  /* block equation */
  .bubble .eq-block {
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 12px;
    padding: 14px 16px;
    margin: 8px 0;
    text-align: center;
    overflow-x: auto;
    direction: ltr;
  }
  .bubble .eq-block .katex { font-size: 1.1em; }

  /* inline equation */
  .bubble .eq-inline {
    background: rgba(255,255,255,0.08);
    border-radius: 4px;
    padding: 0 4px;
    direction: ltr;
    display: inline-block;
    vertical-align: middle;
  }

  /* bullet / numbered list */
  .bubble .msg-list { padding-right: 4px; padding-top: 2px; display: flex; flex-direction: column; gap: 4px; }
  .bubble .msg-list-item { display: flex; gap: 8px; align-items: flex-start; }
  .bubble .msg-list-bullet { color: #0084ff; font-weight: 800; flex-shrink: 0; margin-top: 1px; }
  .bubble .msg-list-num   { color: #60a5fa; font-weight: 800; flex-shrink: 0; min-width: 16px; }

  /* separator line between sections */
  .bubble .msg-divider { height: 1px; background: rgba(255,255,255,0.08); margin: 8px 0; }

  /* ── LIVE RECORDING BUBBLE ── */
  .live-bubble-wrap { display: flex; flex-direction: row-reverse; align-items: flex-end; gap: 8px; }
  .live-bubble {
    max-width: 272px;
    background: rgba(0,100,200,0.3);
    backdrop-filter: blur(14px);
    border: 1.5px solid rgba(0,132,255,0.45);
    border-radius: 20px; border-bottom-left-radius: 5px;
    padding: 11px 15px;
    color: rgba(255,255,255,0.88);
    font-size: 14px; line-height: 1.6;
    animation: bubbleIn 0.25s ease both;
    position: relative;
    box-shadow: 0 4px 16px rgba(0,100,200,0.25);
  }
  .live-badge {
    position: absolute; top: -9px; right: 12px;
    background: #0084ff; border-radius: 10px;
    padding: 2px 8px; font-size: 9px; font-weight: 800;
    color: white; letter-spacing: 0.08em;
    box-shadow: 0 2px 8px rgba(0,132,255,0.5);
  }
  .live-pulse { display: flex; align-items: center; gap: 5px; color: rgba(255,255,255,0.55); font-size: 12px; margin-top: 4px; }
  .lp-dot { width: 5px; height: 5px; border-radius: 50%; background: #0084ff; animation: liveDot 1s ease-in-out infinite; }
  .lp-dot:nth-child(2){animation-delay:0.15s;} .lp-dot:nth-child(3){animation-delay:0.3s;}
  @keyframes liveDot { 0%,100%{transform:scale(0.5);opacity:0.4;} 50%{transform:scale(1.2);opacity:1;} }

  /* ── THINKING DOTS ── */
  .thinking-bubble {
    background: rgba(28,28,32,0.85);
    backdrop-filter: blur(16px);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 20px; border-bottom-right-radius: 5px;
    padding: 14px 18px;
    display: flex; align-items: center; gap: 5px;
    animation: bubbleIn 0.25s ease both;
    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
  }
  .dot {
    width: 7px; height: 7px; border-radius: 50%;
    background: rgba(255,255,255,0.5);
    animation: dotBounce 1.3s ease-in-out infinite;
  }
  .dot:nth-child(2) { animation-delay: 0.18s; }
  .dot:nth-child(3) { animation-delay: 0.36s; }
  @keyframes dotBounce {
    0%,80%,100% { transform: translateY(0); opacity: 0.35; }
    40%          { transform: translateY(-7px); opacity: 1; }
  }

  /* ── BOTTOM CONTROLS ── */
  .bottom-bar {
    position: relative; z-index: 10; flex-shrink: 0;
    padding: 16px 22px 28px;
    background: linear-gradient(0deg, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.5) 70%, transparent 100%);
    display: flex; flex-direction: column; align-items: center; gap: 14px;
  }

  /* error */
  .err { background: rgba(239,68,68,0.2); border: 1px solid rgba(239,68,68,0.4); color: #fca5a5; font-size: 12px; padding: 8px 18px; border-radius: 20px; text-align: center; }

  /* slots */
  .slots-row { display: flex; align-items: center; gap: 8px; }
  .slot { width: 32px; height: 4px; border-radius: 2px; transition: all 0.3s; }
  .slot.used { background: #0084ff; box-shadow: 0 0 6px rgba(0,132,255,0.5); }
  .slot.empty { background: rgba(255,255,255,0.15); }
  .slot-label { color: rgba(255,255,255,0.45); font-size: 11px; }

  /* control buttons row */
  .ctrl-row { display: flex; align-items: center; justify-content: center; gap: 18px; }

  /* secondary buttons */
  .sec-btn {
    width: 48px; height: 48px; border-radius: 50%;
    background: rgba(255,255,255,0.12);
    border: 1px solid rgba(255,255,255,0.16);
    display: flex; align-items: center; justify-content: center;
    color: white; cursor: pointer; font-size: 18px;
    transition: all 0.2s cubic-bezier(0.34,1.56,0.64,1);
    backdrop-filter: blur(8px);
  }
  .sec-btn:hover { background: rgba(255,255,255,0.22); transform: scale(1.06); }
  .sec-btn.danger { background: rgba(239,68,68,0.25); border-color: rgba(239,68,68,0.4); }
  .sec-btn.danger:hover { background: rgba(239,68,68,0.45); }
  .sec-btn.active-vol { background: rgba(234,179,8,0.2); border-color: rgba(234,179,8,0.4); }

  /* MAIN MIC BUTTON */
  .mic-btn {
    width: 68px; height: 68px; border-radius: 50%;
    background: #0084ff;
    border: none;
    display: flex; align-items: center; justify-content: center;
    color: white; cursor: pointer; font-size: 26px;
    transition: all 0.25s cubic-bezier(0.34,1.56,0.64,1);
    box-shadow: 0 0 0 0 rgba(0,132,255,0.4), 0 8px 24px rgba(0,132,255,0.35);
  }
  .mic-btn:hover:not(:disabled) { transform: scale(1.07); box-shadow: 0 0 0 6px rgba(0,132,255,0.15), 0 12px 30px rgba(0,132,255,0.4); }
  .mic-btn.recording {
    background: #ef4444;
    box-shadow: 0 0 0 0 rgba(239,68,68,0.4), 0 8px 24px rgba(239,68,68,0.35);
    animation: micPulse 1.4s ease-in-out infinite;
  }
  @keyframes micPulse {
    0%,100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.35), 0 8px 24px rgba(239,68,68,0.3); }
    50%      { box-shadow: 0 0 0 12px rgba(239,68,68,0.1), 0 8px 24px rgba(239,68,68,0.3); }
  }
  .mic-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none !important; }

  /* ── SETTINGS MODAL ── */
  .modal-backdrop {
    position: fixed; inset: 0; background: rgba(0,0,0,0.7);
    backdrop-filter: blur(8px); z-index: 100;
    display: flex; align-items: flex-end; justify-content: center;
    animation: fadeIn 0.2s ease both;
    padding: 0;
  }
  @keyframes fadeIn { from{opacity:0;} to{opacity:1;} }
  .sheet {
    background: #1c1c1e;
    border-radius: 24px 24px 0 0;
    width: 100%; max-width: 600px;
    max-height: 88vh; overflow-y: auto;
    padding-bottom: env(safe-area-inset-bottom, 20px);
    animation: sheetUp 0.35s cubic-bezier(0.34,1.4,0.64,1) both;
    scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.1) transparent;
  }
  @keyframes sheetUp { from{transform:translateY(100%);opacity:0.5;} to{transform:none;opacity:1;} }
  .sheet-handle { width: 36px; height: 4px; background: rgba(255,255,255,0.2); border-radius: 2px; margin: 14px auto 4px; }
  .sheet-header { padding: 10px 22px 16px; border-bottom: 1px solid rgba(255,255,255,0.08); display: flex; align-items: center; justify-content: space-between; }
  .sheet-header h3 { color: white; font-size: 17px; font-weight: 700; }
  .sheet-close { background: rgba(255,255,255,0.1); border: none; color: rgba(255,255,255,0.6); width: 30px; height: 30px; border-radius: 50%; cursor: pointer; font-size: 14px; transition: all 0.2s; display: flex; align-items: center; justify-content: center; }
  .sheet-close:hover { background: rgba(255,255,255,0.18); color: white; }
  .sheet-body { padding: 16px 22px; display: flex; flex-direction: column; gap: 20px; }

  .setting-section h4 { color: rgba(255,255,255,0.45); font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 10px; }
  .setting-input { width: 100%; background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; color: white; font-size: 14px; font-family: 'Tajawal',sans-serif; padding: 11px 14px; outline: none; direction: rtl; transition: border-color 0.2s; }
  .setting-input:focus { border-color: rgba(0,132,255,0.5); box-shadow: 0 0 0 3px rgba(0,132,255,0.1); }
  .setting-input::placeholder { color: rgba(255,255,255,0.2); }

  .chips { display: flex; flex-wrap: wrap; gap: 8px; }
  .chip { background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; padding: 7px 16px; color: rgba(255,255,255,0.55); font-size: 13px; font-family: 'Tajawal',sans-serif; cursor: pointer; transition: all 0.18s; }
  .chip:hover { background: rgba(255,255,255,0.12); color: white; }
  .chip.on { background: rgba(0,132,255,0.2); border-color: rgba(0,132,255,0.5); color: #60a5fa; }

  .toggles { display: flex; flex-direction: column; gap: 2px; }
  .tgl { display: flex; align-items: center; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.06); cursor: pointer; gap: 12px; }
  .tgl:last-child { border-bottom: none; }
  .tgl-left { display: flex; align-items: center; gap: 10px; flex: 1; }
  .tgl-ico { font-size: 18px; }
  .tgl-label { color: rgba(255,255,255,0.8); font-size: 14px; }
  .tgl-desc  { color: rgba(255,255,255,0.3); font-size: 11px; margin-top: 1px; }
  input.tgl-chk { display: none; }
  .tgl-sw { position: relative; width: 44px; height: 26px; background: rgba(255,255,255,0.12); border-radius: 13px; transition: all 0.28s; flex-shrink: 0; }
  .tgl-sw::after { content:''; position:absolute; top:3px; right:3px; width:20px; height:20px; border-radius:50%; background:white; transition:all 0.28s cubic-bezier(0.34,1.56,0.64,1); opacity:0.6; }
  input.tgl-chk:checked + .tgl-sw { background: #0084ff; }
  input.tgl-chk:checked + .tgl-sw::after { transform: translateX(-18px); opacity: 1; }

  .sheet-footer { padding: 16px 22px 22px; display: flex; gap: 12px; border-top: 1px solid rgba(255,255,255,0.08); }
  .sheet-reset { flex: 1; background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; color: rgba(255,255,255,0.55); font-size: 14px; font-family: 'Tajawal',sans-serif; padding: 13px; cursor: pointer; transition: all 0.2s; }
  .sheet-reset:hover { background: rgba(255,255,255,0.12); color: white; }
  .sheet-save { flex: 2; background: #0084ff; border: none; border-radius: 12px; color: white; font-size: 14px; font-weight: 700; font-family: 'Tajawal',sans-serif; padding: 13px; cursor: pointer; transition: all 0.2s; }
  .sheet-save:hover { background: #0073e0; transform: translateY(-1px); }

  /* ── LIMIT MODAL ── */
  .limit-center {
    display: flex; align-items: center; justify-content: center;
  }
  .limit-card { background: #1c1c1e; border-radius: 20px; padding: 36px 28px; text-align: center; max-width: 320px; width: 90%; animation: popIn 0.35s cubic-bezier(0.34,1.56,0.64,1) both; }
  @keyframes popIn { from{opacity:0;transform:scale(0.88);} to{opacity:1;transform:none;} }
  .limit-card .emoji { font-size: 50px; display: block; margin-bottom: 16px; }
  .limit-card h3 { color: white; font-size: 18px; font-weight: 700; margin-bottom: 10px; }
  .limit-card p  { color: rgba(255,255,255,0.5); font-size: 13px; line-height: 1.6; }
  .limit-card .note { color: rgba(255,255,255,0.25); font-size: 11px; margin-top: 6px; }
  .limit-ok { margin-top: 22px; background: #0084ff; border: none; border-radius: 12px; color: white; font-size: 14px; font-weight: 700; font-family: 'Tajawal',sans-serif; padding: 12px 32px; cursor: pointer; transition: all 0.2s; }
  .limit-ok:hover { background: #0073e0; transform: translateY(-1px); }
`;

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API;

// ── Load KaTeX from CDN once ─────────────────────────────────────────────────
let katexLoaded = false;
let katexLoading = null;
function loadKatex() {
  if (katexLoaded) return Promise.resolve();
  if (katexLoading) return katexLoading;
  katexLoading = new Promise(resolve => {
    // CSS
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/katex.min.css";
    document.head.appendChild(link);
    // JS
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/katex.min.js";
    script.onload = () => { katexLoaded = true; resolve(); };
    document.head.appendChild(script);
  });
  return katexLoading;
}

function renderKatex(tex, display) {
  try {
    if (window.katex) {
      return window.katex.renderToString(tex, { displayMode: display, throwOnError: false });
    }
  } catch {}
  return tex;
}

// ── Rich Message Renderer ────────────────────────────────────────────────────
function RichMessage({ text, isUser }) {
  const [katexReady, setKatexReady] = useState(katexLoaded);
  useEffect(() => { loadKatex().then(() => setKatexReady(true)); }, []);

  if (isUser) return <span>{text}</span>;

  // Parse text into segments: block-eq, inline-eq, code-block, bold, list, plain
  const segments = [];
  let remaining = text;

  while (remaining.length > 0) {
    // 1. Block equation $$...$$
    const blockEqMatch = remaining.match(/^\$\$([\s\S]+?)\$\$/);
    if (blockEqMatch) {
      segments.push({ type: "block-eq", content: blockEqMatch[1] });
      remaining = remaining.slice(blockEqMatch[0].length);
      continue;
    }
    // 2. Code block ```...```
    const codeMatch = remaining.match(/^```(\w*)\n?([\s\S]*?)```/);
    if (codeMatch) {
      segments.push({ type: "code", lang: codeMatch[1] || "code", content: codeMatch[2] });
      remaining = remaining.slice(codeMatch[0].length);
      continue;
    }
    // 3. Line-by-line: process current line
    const nlIdx = remaining.indexOf("\n");
    const line = nlIdx === -1 ? remaining : remaining.slice(0, nlIdx + 1);
    remaining = nlIdx === -1 ? "" : remaining.slice(nlIdx + 1);

    // bullet list
    const bulletMatch = line.match(/^[\-\*•]\s+(.+)/);
    if (bulletMatch) { segments.push({ type: "bullet", content: bulletMatch[1].trim() }); continue; }

    // numbered list
    const numMatch = line.match(/^(\d+)[.)]\s+(.+)/);
    if (numMatch) { segments.push({ type: "numbered", num: numMatch[1], content: numMatch[2].trim() }); continue; }

    // plain line (may contain inline $...$ and **bold** and `code`)
    if (line.trim()) segments.push({ type: "line", content: line.replace(/\n$/, "") });
    else if (segments.length > 0) segments.push({ type: "spacer" });
  }

  // Inline parser: handles $...$, **bold**, `code`
  function parseInline(str) {
    const parts = [];
    let s = str;
    let key = 0;
    while (s.length > 0) {
      // inline eq
      const ieq = s.match(/^\$([^$\n]+?)\$/);
      if (ieq) {
        parts.push(
          <span key={key++} className="eq-inline" dangerouslySetInnerHTML={{
            __html: katexReady ? renderKatex(ieq[1], false) : ieq[1]
          }}/>
        );
        s = s.slice(ieq[0].length); continue;
      }
      // bold
      const bold = s.match(/^\*\*(.+?)\*\*/);
      if (bold) { parts.push(<span key={key++} className="bold-text">{bold[1]}</span>); s = s.slice(bold[0].length); continue; }
      // inline code
      const ic = s.match(/^`([^`]+)`/);
      if (ic) { parts.push(<code key={key++} className="inline-code">{ic[1]}</code>); s = s.slice(ic[0].length); continue; }
      // plain char
      const nextSpecial = s.search(/\$|\*\*|`/);
      if (nextSpecial === -1) { parts.push(s); break; }
      parts.push(s.slice(0, nextSpecial));
      s = s.slice(nextSpecial);
    }
    return parts;
  }

  // Group bullets/numbered into lists
  const grouped = [];
  let i = 0;
  while (i < segments.length) {
    const seg = segments[i];
    if (seg.type === "bullet") {
      const items = [];
      while (i < segments.length && segments[i].type === "bullet") { items.push(segments[i].content); i++; }
      grouped.push({ type: "bullet-list", items });
    } else if (seg.type === "numbered") {
      const items = [];
      while (i < segments.length && segments[i].type === "numbered") { items.push({ num: segments[i].num, content: segments[i].content }); i++; }
      grouped.push({ type: "numbered-list", items });
    } else {
      grouped.push(seg); i++;
    }
  }

  return (
    <div className="bubble-text">
      {grouped.map((seg, idx) => {
        if (seg.type === "block-eq") return (
          <div key={idx} className="eq-block" dangerouslySetInnerHTML={{
            __html: katexReady ? renderKatex(seg.content, true) : seg.content
          }}/>
        );
        if (seg.type === "code") return (
          <div key={idx} className="code-block">
            {seg.lang && <div className="code-lang">{seg.lang}</div>}
            <pre className="code-content">{seg.content}</pre>
          </div>
        );
        if (seg.type === "bullet-list") return (
          <div key={idx} className="msg-list">
            {seg.items.map((item, j) => (
              <div key={j} className="msg-list-item">
                <span className="msg-list-bullet">•</span>
                <span>{parseInline(item)}</span>
              </div>
            ))}
          </div>
        );
        if (seg.type === "numbered-list") return (
          <div key={idx} className="msg-list">
            {seg.items.map((item, j) => (
              <div key={j} className="msg-list-item">
                <span className="msg-list-num">{item.num}.</span>
                <span>{parseInline(item.content)}</span>
              </div>
            ))}
          </div>
        );
        if (seg.type === "spacer") return <div key={idx} style={{height: 6}}/>;
        if (seg.type === "line")   return <div key={idx}>{parseInline(seg.content)}</div>;
        return null;
      })}
    </div>
  );
}

export default function App() {
  const [isRecording,  setIsRecording]  = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking,   setIsSpeaking]   = useState(false);
  const [transcript,   setTranscript]   = useState([]);
  const [liveText,     setLiveText]     = useState("");   // text user is currently saying
  const [error,        setError]        = useState("");
  const [callDuration, setCallDuration] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [remaining,    setRemaining]    = useState(getRemaining);
  const [showLimit,    setShowLimit]    = useState(false);
  const [settings,     setSettings]     = useState(DEFAULT_SETTINGS);
  const [videoState,   setVideoState]   = useState("idle");
  const [volOn,        setVolOn]        = useState(true);

  const mediaRecRef = useRef(null);
  const chunksRef   = useRef([]);
  const audioCtxRef = useRef(null);
  const audioSrcRef = useRef(null);
  const scrollRef   = useRef(null);

  // inject CSS
  useEffect(() => {
    const el = document.createElement("style"); el.textContent = STYLES;
    document.head.appendChild(el); return () => el.remove();
  }, []);

  // timer
  useEffect(() => {
    const t = setInterval(() => setCallDuration(p => p + 1), 1000);
    return () => clearInterval(t);
  }, []);

  // auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [transcript, liveText, isProcessing]);

  // cleanup
  useEffect(() => {
    return () => { try { audioSrcRef.current?.stop(); } catch{} audioCtxRef.current?.close(); };
  }, []);

  const startRecording = async () => {
    if (getRemaining() <= 0) { setShowLimit(true); return; }
    try {
      setError("");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecRef.current = new MediaRecorder(stream);
      chunksRef.current   = [];
      mediaRecRef.current.ondataavailable = e => chunksRef.current.push(e.data);
      mediaRecRef.current.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        await processAudio(blob);
        stream.getTracks().forEach(t => t.stop());
      };
      mediaRecRef.current.start();
      setIsRecording(true); setVideoState("recording");
      // show live recording indicator
      setLiveText("🎤 جاري الاستماع...");
      useLimit(); setRemaining(getRemaining());
    } catch(err) { setError("لا يمكن الوصول إلى الميكروفون"); }
  };

  const stopRecording = () => {
    if (mediaRecRef.current && isRecording) {
      mediaRecRef.current.stop();
      setIsRecording(false); setIsProcessing(true); setVideoState("processing");
      setLiveText("");
    }
  };

  const processAudio = async (blob) => {
    try {
      // 1. Transcribe
      const form = new FormData();
      form.append("file", blob, "audio.webm");
      form.append("model", "gpt-4o-mini-transcribe");
      form.append("language", "ar");
      const tr = await fetch("https://api.openai.com/v1/audio/transcriptions", {
        method: "POST", headers: { Authorization: `Bearer ${OPENAI_API_KEY}` }, body: form,
      });
      if (!tr.ok) throw new Error("فشل تحويل الصوت إلى نص");
      const { text: userText } = await tr.json();

      // show transcribed text immediately
      const next = [...transcript, { role: "user", text: userText }];
      setTranscript(next);

      // 2. Chat
      const cr = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "gpt-4o", max_tokens: 100, temperature: 0.5,
          messages: [{ role: "system", content: buildSystemPrompt(settings) }, ...next.map(m => ({ role: m.role, content: m.text }))],
        }),
      });
      if (!cr.ok) throw new Error("فشل الحصول على رد");
      const aiText = (await cr.json()).choices[0].message.content;
      setTranscript(p => [...p, { role: "assistant", text: aiText }]);

      // 3. TTS
      const tts = await fetch("https://api.openai.com/v1/audio/speech", {
        method: "POST",
        headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model: "gpt-4o-mini-tts", voice: "onyx", input: aiText, response_format: "wav" }),
      });
      if (!tts.ok) throw new Error("فشل تحويل النص إلى صوت");
      playAudio(await tts.arrayBuffer());
    } catch(err) {
      setError(err.message || "حدث خطأ أثناء المعالجة");
      setIsProcessing(false); setVideoState("idle");
    }
  };

  const playAudio = (buf) => {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    audioCtxRef.current = ctx;
    ctx.decodeAudioData(buf, buffer => {
      const src = ctx.createBufferSource();
      src.buffer = buffer; src.connect(ctx.destination); audioSrcRef.current = src;
      setIsSpeaking(true); setIsProcessing(false); setVideoState("speaking");
      src.onended = () => { setIsSpeaking(false); setVideoState("idle"); };
      src.start(0);
    });
  };

  const statusText = isSpeaking ? "يتحدث..." : isProcessing ? "يفكر..." : isRecording ? "يستمع..." : "متصل";
  const dotClass   = isSpeaking ? "speaking" : isProcessing ? "processing" : isRecording ? "recording" : "connected";
  const usedSlots  = DAILY_LIMIT - remaining;

  return (
    <div className="shell">
      {/* ── VIDEO BACKGROUND ── */}
      <div className="video-bg">
        {videoState === "idle"
          ? <img src={TEACHER.pic} alt={TEACHER.name}/>
          : <video key={videoState} src={TEACHER.videos[videoState]} loop muted playsInline autoPlay/>
        }
      </div>

      {/* ── TOP BAR ── */}
      <div className="top-bar">
        <div className="tb-left">
          <button className="back-btn" onClick={() => window.history.back()}>←</button>
          <div className="caller-info">
            <img src={TEACHER.pic} alt={TEACHER.name} className="caller-pic"/>
            <div>
              <div className="caller-name">{TEACHER.name}</div>
              <div className="caller-status">
                <div className={`status-dot ${dotClass}`}/>
                <span>{statusText}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="tb-right">
          <div className="timer-chip">{formatTime(callDuration)}</div>
          <button className="icon-btn gear" onClick={() => setShowSettings(true)}>
            <GearIcon/>
          </button>
        </div>
      </div>

      {/* ── MAIN AREA ── */}
      <div className="main-area">
        {/* Chat column on the right */}
        <div className="chat-col">
          <div className="messages-scroll" ref={scrollRef}>

            {/* existing messages */}
            {transcript.map((m, i) => (
              <div key={i} className={`bubble-row ${m.role}`}>
                {m.role === "assistant" && (
                  <img src={TEACHER.pic} alt={TEACHER.name} className="bubble-avatar"/>
                )}
                <div className={`bubble ${m.role}`}>
                  <RichMessage text={m.text} isUser={m.role === "user"}/>
                </div>
              </div>
            ))}

            {/* live speech text while recording */}
            {isRecording && liveText && (
              <div className="live-bubble-wrap">
                <div className="live-bubble">
                  <span className="live-badge">LIVE</span>
                  <div>جاري الاستماع إليك...</div>
                  <div className="live-pulse">
                    <div className="lp-dot"/><div className="lp-dot"/><div className="lp-dot"/>
                    <span>يستمع</span>
                  </div>
                </div>
              </div>
            )}

            {/* thinking dots while processing */}
            {isProcessing && (
              <div className="bubble-row assistant">
                <img src={TEACHER.pic} alt={TEACHER.name} className="bubble-avatar"/>
                <div className="thinking-bubble">
                  <div className="dot"/><div className="dot"/><div className="dot"/>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* ── BOTTOM CONTROLS ── */}
      <div className="bottom-bar">
        {error && <div className="err">{error}</div>}

        {/* interaction slots */}
        <div className="slots-row">
          <span className="slot-label">التفاعلات:</span>
          {Array.from({ length: DAILY_LIMIT }).map((_, i) => (
            <div key={i} className={`slot ${i < usedSlots ? "used" : "empty"}`}/>
          ))}
          <span className="slot-label">{remaining} متبقية</span>
        </div>

        {/* buttons */}
        <div className="ctrl-row">

          {/* end call */}
          <button className="sec-btn danger" onClick={() => window.history.back()} title="إنهاء المكالمة">
            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
              <path d="M12 9c-1.6 0-3.15.25-4.6.72v3.1c0 .39-.23.74-.56.9-.98.49-1.87 1.12-2.66 1.85-.18.18-.43.28-.7.28-.28 0-.53-.11-.71-.29L.29 13.08c-.18-.17-.29-.42-.29-.7 0-.28.11-.53.29-.71C3.34 8.78 7.46 7 12 7s8.66 1.78 11.71 4.67c.18.18.29.43.29.71 0 .28-.11.53-.29.71l-2.48 2.48c-.18.18-.43.29-.71.29-.27 0-.52-.11-.7-.28-.79-.74-1.69-1.36-2.67-1.85-.33-.16-.56-.5-.56-.9v-3.1C15.15 9.25 13.6 9 12 9z"/>
            </svg>
          </button>

          {/* volume */}
          <button className={`sec-btn ${volOn ? "active-vol" : ""}`} onClick={() => setVolOn(p => !p)} title={volOn ? "كتم الصوت" : "تشغيل الصوت"}>
            {volOn
              ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
              : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>
            }
          </button>

          {/* MIC — main */}
          <button
            className={`mic-btn ${isRecording ? "recording" : ""}`}
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isProcessing || remaining <= 0}
            title={isRecording ? "إيقاف" : "تحدث"}
          >
            {isRecording
              ? <svg viewBox="0 0 24 24" fill="currentColor" width="26" height="26"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>
              : <svg viewBox="0 0 24 24" fill="currentColor" width="26" height="26"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>
            }
          </button>

          {/* clear chat */}
          <button className="sec-btn" onClick={() => setTranscript([])} title="مسح المحادثة">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="19" height="19"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
          </button>

          {/* settings shortcut */}
          <button className="sec-btn" onClick={() => setShowSettings(true)} title="الإعدادات">
            <GearIcon/>
          </button>

        </div>
      </div>

      {/* ── SETTINGS BOTTOM SHEET ── */}
      {showSettings && (
        <div className={`modal-backdrop`} onClick={() => setShowSettings(false)}>
          <div className="sheet" onClick={e => e.stopPropagation()}>
            <div className="sheet-handle"/>
            <div className="sheet-header">
              <h3>⚙️ إعدادات المحادثة</h3>
              <button className="sheet-close" onClick={() => setShowSettings(false)}>✕</button>
            </div>

            <div className="sheet-body">
              {/* Topic */}
              <div className="setting-section">
                <h4>الموضوع</h4>
                <input className="setting-input" type="text" value={settings.topic} onChange={e => setSettings(s => ({...s, topic: e.target.value}))} placeholder="ما هو موضوع المحادثة؟"/>
              </div>

              {/* Style */}
              <div className="setting-section">
                <h4>أسلوب المحادثة</h4>
                <div className="chips">
                  {[{v:"conversational",l:"😊 ودي"},{v:"professional",l:"👔 رسمي"},{v:"enthusiastic",l:"🎉 متحمس"},{v:"socratic",l:"🤔 سقراطي"}].map(o=>(
                    <button key={o.v} className={`chip ${settings.speakingStyle===o.v?"on":""}`} onClick={()=>setSettings(s=>({...s,speakingStyle:o.v}))}>{o.l}</button>
                  ))}
                </div>
              </div>

              {/* Length */}
              <div className="setting-section">
                <h4>طول الإجابة</h4>
                <div className="chips">
                  {[{v:"veryShort",l:"⚡ قصيرة جداً"},{v:"short",l:"📝 قصيرة"},{v:"medium",l:"📄 متوسطة"},{v:"detailed",l:"📚 مفصلة"}].map(o=>(
                    <button key={o.v} className={`chip ${settings.responseLength===o.v?"on":""}`} onClick={()=>setSettings(s=>({...s,responseLength:o.v}))}>{o.l}</button>
                  ))}
                </div>
              </div>

              {/* Difficulty */}
              <div className="setting-section">
                <h4>مستوى الصعوبة</h4>
                <div className="chips">
                  {[{v:"beginner",l:"🌱 مبتدئ"},{v:"easy",l:"📘 سهل"},{v:"medium",l:"📙 متوسط"},{v:"advanced",l:"🔥 متقدم"}].map(o=>(
                    <button key={o.v} className={`chip ${settings.difficultyLevel===o.v?"on":""}`} onClick={()=>setSettings(s=>({...s,difficultyLevel:o.v}))}>{o.l}</button>
                  ))}
                </div>
              </div>

              {/* Toggles */}
              <div className="setting-section">
                <h4>خيارات إضافية</h4>
                <div className="toggles">
                  {[
                    {k:"includeExamples", i:"💡", t:"تضمين أمثلة",       d:"إضافة أمثلة عملية للتوضيح"},
                    {k:"useAnalogies",    i:"🎨", t:"استخدام التشبيهات", d:"شرح المفاهيم بالتشبيهات"},
                    {k:"encouragement",   i:"🌟", t:"التشجيع والمدح",    d:"تشجيع الطالب عند الإجابة الصحيحة"},
                  ].map(t => (
                    <label key={t.k} className="tgl">
                      <div className="tgl-left">
                        <span className="tgl-ico">{t.i}</span>
                        <div><div className="tgl-label">{t.t}</div><div className="tgl-desc">{t.d}</div></div>
                      </div>
                      <input type="checkbox" className="tgl-chk" checked={settings[t.k]} onChange={e => setSettings(s => ({...s, [t.k]: e.target.checked}))}/>
                      <div className="tgl-sw"/>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="sheet-footer">
              <button className="sheet-reset" onClick={() => setSettings(DEFAULT_SETTINGS)}>إعادة تعيين</button>
              <button className="sheet-save" onClick={() => { setShowSettings(false); setTranscript([]); }}>حفظ الإعدادات ✓</button>
            </div>
          </div>
        </div>
      )}

      {/* ── LIMIT MODAL ── */}
      {showLimit && (
        <div className="modal-backdrop limit-center" onClick={() => setShowLimit(false)}>
          <div className="limit-card" onClick={e => e.stopPropagation()}>
            <span className="emoji">🚫</span>
            <h3>وصلت إلى الحد اليومي</h3>
            <p>لقد استخدمت جميع تفاعلاتك الصوتية الـ {DAILY_LIMIT} لهذا اليوم.</p>
            <p className="note">سيتم إعادة تعيين الحد في منتصف الليل.</p>
            <button className="limit-ok" onClick={() => setShowLimit(false)}>حسناً</button>
          </div>
        </div>
      )}
    </div>
  );
}