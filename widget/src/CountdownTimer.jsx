import { h } from "preact";
import { useState, useEffect, useRef } from "preact/hooks";

const CSS = `
  .ct-widget { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; box-sizing: border-box; width: 100%; z-index: 100; }
  .ct-widget.ct-top    { position: sticky; top: 0; }
  .ct-widget.ct-bottom { position: sticky; bottom: 0; }
  .ct-widget.ct-inline { position: relative; margin: 16px 0; border-radius: 12px; overflow: hidden; }
  .ct-inner { display: flex; align-items: center; justify-content: center; gap: 16px; padding: 12px 24px; flex-wrap: wrap; }
  .ct-small  .ct-inner { padding: 8px 16px; }
  .ct-large  .ct-inner { padding: 18px 32px; }
  .ct-description { color: #fff; font-weight: 600; font-size: 0.95rem; text-shadow: 0 1px 2px rgba(0,0,0,0.2); }
  .ct-small .ct-description { font-size: 0.8rem; }
  .ct-large .ct-description { font-size: 1.1rem; }
  .ct-segments { display: flex; gap: 8px; align-items: center; }
  .ct-segment { display: flex; flex-direction: column; align-items: center; background: rgba(0,0,0,0.25); border-radius: 8px; padding: 6px 10px; min-width: 52px; }
  .ct-small .ct-segment { min-width: 40px; padding: 4px 8px; }
  .ct-large .ct-segment { min-width: 64px; padding: 8px 14px; }
  .ct-segment-value { color: #fff; font-size: 1.5rem; font-weight: 700; line-height: 1; font-variant-numeric: tabular-nums; }
  .ct-small .ct-segment-value { font-size: 1.1rem; }
  .ct-large .ct-segment-value { font-size: 2rem; }
  .ct-segment-label { color: rgba(255,255,255,0.75); font-size: 0.62rem; text-transform: uppercase; letter-spacing: 0.08em; margin-top: 2px; }
  .ct-colon { color: rgba(255,255,255,0.7); font-size: 1.4rem; font-weight: 700; margin-top: -8px; }
  .ct-expired { color: #fff; font-weight: 600; font-size: 1rem; padding: 12px 24px; text-align: center; }
  @keyframes ct-pulse { 0%,100%{filter:brightness(1)} 50%{filter:brightness(1.25)} }
  .ct-urgent-pulse .ct-inner { animation: ct-pulse 1s ease-in-out infinite; }
  .ct-banner { display:flex; align-items:center; justify-content:center; gap:8px; background:rgba(0,0,0,0.3); color:#fff; font-size:0.8rem; font-weight:600; letter-spacing:0.06em; text-transform:uppercase; padding:5px 16px; border-top:1px solid rgba(255,255,255,0.2); }
  @keyframes ct-blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
  .ct-blink { animation: ct-blink 0.8s step-start infinite; }
`;

function injectStyles() {
  if (document.getElementById("ct-styles")) return;
  const style = document.createElement("style");
  style.id = "ct-styles";
  style.textContent = CSS;
  document.head.appendChild(style);
}

function calcTimeLeft(endDate) {
  const diff = Math.max(0, new Date(endDate) - new Date());
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
    totalSeconds: Math.floor(diff / 1000),
  };
}

const pad = (n) => String(n).padStart(2, "0");

export default function CountdownTimer({ timer }) {
  const [timeLeft, setTimeLeft] = useState(() => calcTimeLeft(timer.endDate));
  const intervalRef = useRef(null);
  injectStyles();

  useEffect(() => {
    intervalRef.current = setInterval(() => setTimeLeft(calcTimeLeft(timer.endDate)), 1000);
    return () => clearInterval(intervalRef.current);
  }, [timer.endDate]);

  const { color = "#22c55e", size = "medium", position = "top",
    urgencyNotification = "color_pulse", urgencyThresholdMinutes = 5,
    promotionDescription } = timer;

  const isUrgent = timeLeft.totalSeconds > 0 && timeLeft.totalSeconds <= urgencyThresholdMinutes * 60;
  const isExpired = timeLeft.totalSeconds === 0;
  const urgentClass = isUrgent && urgencyNotification === "color_pulse" ? "ct-urgent-pulse" : "";

  return (
    <div class={`ct-widget ct-${position} ct-${size} ${urgentClass}`} style={{ backgroundColor: color }}>
      <div class="ct-inner">
        {promotionDescription && <span class="ct-description">{promotionDescription}</span>}
        {isExpired ? (
          <span class="ct-expired">Offer has ended</span>
        ) : (
          <div class="ct-segments">
            {timeLeft.days > 0 && (<><div class="ct-segment"><span class="ct-segment-value">{pad(timeLeft.days)}</span><span class="ct-segment-label">Days</span></div><span class="ct-colon">:</span></>)}
            <div class="ct-segment"><span class="ct-segment-value">{pad(timeLeft.hours)}</span><span class="ct-segment-label">Hours</span></div>
            <span class="ct-colon">:</span>
            <div class="ct-segment"><span class="ct-segment-value">{pad(timeLeft.minutes)}</span><span class="ct-segment-label">Mins</span></div>
            <span class="ct-colon">:</span>
            <div class="ct-segment"><span class="ct-segment-value">{pad(timeLeft.seconds)}</span><span class="ct-segment-label">Secs</span></div>
          </div>
        )}
      </div>
      {isUrgent && urgencyNotification === "notification_banner" && (
        <div class="ct-banner">
          <span class="ct-blink">⚠</span> Hurry! Offer ends in less than {urgencyThresholdMinutes} minutes! <span class="ct-blink">⚠</span>
        </div>
      )}
    </div>
  );
}