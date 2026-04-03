import { h, render } from "preact";
import { useState, useEffect } from "preact/hooks";
import CountdownTimer from "./CountdownTimer";

function App() {
  const [timer, setTimer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const container = document.getElementById("countdown-timer-widget");
    if (!container) return;

    const shop = container.dataset.shop;
    const apiBase = container.dataset.apiBase;

    if (!shop || !apiBase) { setLoading(false); return; }

    fetch(`${apiBase}/api/timers/active?shop=${encodeURIComponent(shop)}`)
      .then((r) => r.json())
      .then((data) => { setTimer(data.timer || null); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading || !timer) return null;
  return <CountdownTimer timer={timer} />;
}

function mountWidget() {
  const container = document.getElementById("countdown-timer-widget");
  if (container) render(<App />, container);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", mountWidget);
} else {
  mountWidget();
}