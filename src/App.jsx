import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ==============================
// FocusLove – Frameless version 💘
// ==============================

// Helper: MM:SS
export const mmss = (s) => {
  const m = Math.floor(s / 60).toString().padStart(2, "0");
  const ss = Math.floor(s % 60).toString().padStart(2, "0");
  return `${m}:${ss}`;
};

// Helper: YYYY-MM-DD key
export const todayKey = () => new Date().toISOString().slice(0, 10);

// Window shell
const Window = ({ title = "FocusLove", children, tint = "bg-blue-50", onReset }) => {
  return (
    <div className="relative w-[420px] h-[520px] rounded-3xl border-2 border-blue-300 bg-blue-100 p-3 shadow-[0_0_0_3px_#c7d2fe_inset]">
      {/* Cabeçalho arrastável + botões ativos */}
      <div className="flex items-center justify-between rounded-2xl bg-blue-200 px-3 py-2 text-blue-700 draggable">
        <div className="font-pixelify text-2xl tracking-wider opacity-80">{title}</div>
        <div className="flex gap-2">
          {/* Minimizar */}
          <div
            role="button"
            tabIndex={0}
            title="Minimize"
            className="h-6 w-6 rounded-md border-2 border-blue-300 bg-blue-100 no-drag cursor-pointer hover:bg-blue-50 focus:outline-none active:scale-95"
            onClick={() => window.fl?.minimize?.()}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && window.fl?.minimize?.()}
          >
            <span className="block text-center text-blue-500 font-bold -mt-[2px] select-none">–</span>
          </div>
          {/* Fechar */}
          <div
            role="button"
            tabIndex={0}
            title="Close"
            className="h-6 w-6 rounded-md border-2 border-blue-300 bg-blue-100 no-drag cursor-pointer hover:bg-pink-100 focus:outline-none active:scale-95"
            onClick={() => window.fl?.close?.()}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && window.fl?.close?.()}
          >
            <span className="block text-center text-pink-500 font-bold -mt-[1px] select-none">×</span>
          </div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className={`mt-3 h-[440px] overflow-hidden rounded-2xl ${tint} p-5 flex flex-col items-center justify-between`}>
        <div className="flex-1 flex items-center justify-center w-full">{children}</div>
        <div className="text-center text-[10px] text-blue-800/70 pb-1">
          <button
            className="rounded-lg border border-blue-200 bg-white/60 px-2 py-1 hover:bg-white"
            onClick={onReset}
          >
            Reset today’s completion
          </button>
        </div>
      </div>
    </div>
  );
};

// Botão
const Btn = ({ children, onClick, variant = "primary", className = "", disabled }) => {
  const base =
    "px-4 py-2 rounded-2xl border-2 text-lg font-semibold shadow-[4px_4px_0_#bfc5ff] transition-transform active:translate-y-[1px] font-pixelify";
  const styles =
    variant === "primary"
      ? "bg-pink-200 border-pink-300 hover:bg-pink-300 text-pink-900"
      : variant === "ghost"
      ? "bg-white/70 border-blue-200 hover:bg-white/90 text-blue-900"
      : variant === "danger"
      ? "bg-red-200 border-red-300 hover:bg-red-300 text-red-900"
      : "bg-green-200 border-green-300 hover:bg-green-300 text-green-900";
  return (
    <button disabled={disabled} onClick={onClick} className={`${base} ${styles} ${className} disabled:opacity-50`}>
      {children}
    </button>
  );
};

// Progress bar
const Progress = ({ value }) => (
  <div className="h-3 w-full rounded-full bg-blue-2 00">
    <div
      className="h-3 rounded-full bg-pink-400 transition-all"
      style={{ width: `${Math.min(100, Math.max(0, value * 100))}%` }}
    />
  </div>
);

export default function App() {
  const [screen, setScreen] = useState("home");
  const [seconds, setSeconds] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [completedToday, setCompletedToday] = useState(false);
  const [customMin, setCustomMin] = useState(25);
  const tickRef = useRef(null);

  // Favicon + title
  useEffect(() => {
    document.title = "FocusLove 💘";
    const link = document.createElement("link");
    link.rel = "icon";
    link.href = "https://cdn-icons-png.flaticon.com/512/833/833472.png";
    link.type = "image/png";
    document.head.appendChild(link);
    return () => {
      try {
        document.head.removeChild(link);
      } catch {}
    };
  }, []);

  // Load completion
  useEffect(() => {
    const done = localStorage.getItem(`focuslove_done_${todayKey()}`) === "true";
    setCompletedToday(done);
  }, []);

  // Timer tick
  useEffect(() => {
    if (!isRunning) return;
    tickRef.current = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          clearInterval(tickRef.current);
          tickRef.current = null;
          setIsRunning(false);
          setScreen("finishedPrompt");
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(tickRef.current);
  }, [isRunning]);

  const baseSeconds = useMemo(() => Math.max(60, customMin * 60), [customMin]);
  const progress = 1 - seconds / baseSeconds;

  const start = () => {
    setSeconds(baseSeconds);
    setIsRunning(true);
  };
  const pause = () => setIsRunning(false);
  const resume = () => setIsRunning(true);
  const reset = () => {
    setIsRunning(false);
    setSeconds(baseSeconds);
  };
  const markDone = () => {
    localStorage.setItem(`focuslove_done_${todayKey()}`, "true");
    setCompletedToday(true);
  };
  const resetToday = () => {
    localStorage.removeItem(`focuslove_done_${todayKey()}`);
    setCompletedToday(false);
  };

  const page = {
    initial: { opacity: 0, y: 10 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -10 },
  };

  // wrapper sem fundo e sem scroll
  return (
    <div className="w-[420px] h-[520px] overflow-hidden">
      <AnimatePresence mode="wait">
        {/* Home */}
        {screen === "home" && (
          <motion.div
            key="home"
            className="overflow-hidden"
            variants={page}
            initial="initial"
            animate="in"
            exit="out"
            transition={{ duration: 0.2 }}
          >
            <Window onReset={resetToday}>
              <div className="flex flex-col items-center gap-6">
                <div className="font-pixelify text-center text-4xl font-black tracking-wide text-pink-700">
                  Let’s Start!
                </div>
                <div className="relative h-28 w-28">
                  <img
                    src="images/home1.png"
                    alt="Animated image"
                    className="absolute inset-0 h-28 w-28 object-cover animate-frame"
                  />
                  <img
                    src="images/home2.png"
                    alt=""
                    className="absolute inset-0 h-28 w-28 object-cover animate-frame-delay"
                  />
                </div>
                <div className="flex gap-3">
                  <Btn onClick={() => setScreen("goal")}>See Today’s Goal</Btn>
                  <Btn variant="ghost" onClick={() => setScreen("timer")}>Start Focus</Btn>
                </div>
                {completedToday && (
                  <div className="mt-1 rounded-xl bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
                    Daily goal already completed ✅
                  </div>
                )}
              </div>
            </Window>
          </motion.div>
        )}

        {/* Goal */}
        {screen === "goal" && (
          <motion.div
            key="goal"
            className="overflow-hidden"
            variants={page}
            initial="initial"
            animate="in"
            exit="out"
            transition={{ duration: 0.2 }}
          >
            <Window onReset={resetToday}>
              <div className="flex flex-col items-center text-center gap-6">
                <div className="font-pixelify text-4xl font-extrabold text-blue-900">Today’s Goal</div>
                <div className="font-pixelify text-3xl font-black text-pink-700">1 job application</div>
                <div className="flex justify-center gap-3 pt-2">
                  <Btn onClick={() => setScreen("timer")}>Start</Btn>
                  <Btn variant="ghost" onClick={() => setScreen("home")}>Back</Btn>
                </div>
              </div>
            </Window>
          </motion.div>
        )}

        {/* Timer */}
        {screen === "timer" && (
          <motion.div
            key="timer"
            className="overflow-hidden"
            variants={page}
            initial="initial"
            animate="in"
            exit="out"
            transition={{ duration: 0.2 }}
          >
            <Window title="FocusLove" tint="bg-pink-50" onReset={resetToday}>
              <div className="flex flex-col items-center gap-5">
                <div className="font-pixelify text-2xl font-black text-pink-900">Gatinho's Countdown</div>
                <div className="text-sm text-blue-800">How Long? (default is 25 min)</div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    max={120}
                    value={customMin}
                    onChange={(e) => setCustomMin(Number(e.target.value) || 25)}
                    className="w-24 rounded-xl border-2 border-blue-200 bg-white px-3 py-2 text-center text-lg font-semibold text-blue-900 focus:outline-none"
                  />
                  <span className="text-blue-700">min</span>
                </div>
                <div className="rounded-2xl border-2 border-pink-200 bg-white px-8 py-6 text-center shadow-[6px_6px_0_#ffd1dc]">
                  <div className="font-body text-6xl font-black tracking-widest text-blue-900">{mmss(seconds)}</div>
                  <div className="mt-4 w-80 max-w-full"><Progress value={progress} /></div>
                </div>
                <div className="flex flex-wrap justify-center gap-3">
                  {!isRunning && seconds === baseSeconds && <Btn onClick={start}>Start</Btn>}
                  {isRunning && <Btn variant="ghost" onClick={pause}>Pause</Btn>}
                  {!isRunning && seconds !== baseSeconds && seconds !== 0 && <Btn onClick={resume}>Resume</Btn>}
                  <Btn variant="danger" onClick={reset}>Reset</Btn>
                  <Btn variant="ghost" onClick={() => setScreen("home")}>Back</Btn>
                </div>
              </div>
            </Window>
          </motion.div>
        )}

        {/* Finished Prompt */}
        {screen === "finishedPrompt" && (
          <motion.div
            key="finished"
            className="overflow-hidden"
            variants={page}
            initial="initial"
            animate="in"
            exit="out"
            transition={{ duration: 0.2 }}
          >
            <Window onReset={resetToday}>
              <div className="space-y-6 text-center">
                <div className="font-pixelify text-3xl font-extrabold text-blue-900">Finished?</div>
                <div className="flex flex-wrap justify-center gap-3">
                  <Btn onClick={() => { markDone(); setScreen("congrats"); }}>Yes</Btn>
                  <Btn variant="ghost" onClick={() => setScreen("timer")}>No</Btn>
                  <Btn variant="danger" onClick={() => setScreen("withhold")}>Not gonna finish today</Btn>
                </div>
              </div>
            </Window>
          </motion.div>
        )}

        {/* Congrats */}
        {screen === "congrats" && (
          <motion.div
            key="congrats"
            className="overflow-hidden"
            variants={page}
            initial="initial"
            animate="in"
            exit="out"
            transition={{ duration: 0.2 }}
          >
            <Window tint="bg-green-50" onReset={resetToday}>
              <div className="flex flex-col items-center text-center gap-6">
                <div className="font-pixelify text-4xl font-black text-green-800">YAYYY! 🎉</div>
                <p className="text-lg font-medium text-green-900">You're so fierce!</p>
                <p className="font-body text-large font-semibold text-pink-900">
                  Reward: 1 girlfriend nude. Terms and conditions apply😉
                </p>
                <div className="relative h-38 w-41">
                  <img
                    src="images/congrats1.png"
                    alt="Animated image"
                    className="absolute inset-0 h-38 w-41 object-cover animate-frame"
                  />
                  <img
                    src="images/congrats2.png"
                    alt=""
                    className="absolute inset-0 h-38 w-41 object-cover animate-frame-delay"
                  />
                </div>
                <div className="pt-2">
                  <Btn onClick={() => setScreen("home")}>Home</Btn>
                </div>
              </div>
            </Window>
          </motion.div>
        )}

        {/* Withhold */}
        {screen === "withhold" && (
          <motion.div
            key="withhold"
            className="overflow-hidden"
            variants={page}
            initial="initial"
            animate="in"
            exit="out"
            transition={{ duration: 0.2 }}
          >
            <Window tint="bg-yellow-50" onReset={resetToday}>
              <div className="flex flex-col items-center text-center gap-6">
                <div className="font-pixelify text-3xl font-black text-yellow-800">Are you sure???</div>
                <p className="text-lg font-medium text-yellow-900">
                  Warning: Your girlfriend will withhold the boobies until you finish 😅
                </p>
                <div className="relative h-28 w-35">
                  <img
                    src="images/no1.png"
                    alt="Animated image"
                    className="absolute inset-0 h-28 w-35 object-cover animate-frame"
                  />
                  <img
                    src="images/no2.png"
                    alt=""
                    className="absolute inset-0 h-28 w-35 object-cover animate-frame-delay"
                  />
                </div>
                <div className="flex justify-center gap-3 pt-1">
                  <Btn onClick={() => setScreen("timer")}>Back to the timer</Btn>
                  <Btn variant="ghost" onClick={() => setScreen("home")}>Home</Btn>
                </div>
              </div>
            </Window>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
