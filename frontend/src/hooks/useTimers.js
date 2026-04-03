import { useState, useEffect, useCallback } from "react";

const BASE_URL = "/api/timers";

const useTimers = (shop) => {
  const [timers, setTimers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});

  const headers = {
    "Content-Type": "application/json",
    "x-shopify-shop-domain": shop,
  };

  const fetchTimers = useCallback(async (params = {}) => {
    setLoading(true); setError(null);
    try {
      const qs = new URLSearchParams({ shop, ...params }).toString();
      const res = await fetch(`${BASE_URL}?${qs}`, { headers });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch timers");
      setTimers(data.timers);
      setPagination(data.pagination || {});
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, [shop]);

  useEffect(() => { if (shop) fetchTimers(); }, [shop, fetchTimers]);

  const createTimer = async (timerData) => {
    const res = await fetch(BASE_URL, { method: "POST", headers, body: JSON.stringify(timerData) });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to create timer");
    setTimers((prev) => [data.timer, ...prev]);
    return data.timer;
  };

  const updateTimer = async (id, timerData) => {
    const res = await fetch(`${BASE_URL}/${id}`, { method: "PUT", headers, body: JSON.stringify(timerData) });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to update timer");
    setTimers((prev) => prev.map((t) => (t._id === id ? data.timer : t)));
    return data.timer;
  };

  const deleteTimer = async (id) => {
    const res = await fetch(`${BASE_URL}/${id}`, { method: "DELETE", headers });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to delete timer");
    setTimers((prev) => prev.filter((t) => t._id !== id));
  };

  const toggleTimer = async (id) => {
    const res = await fetch(`${BASE_URL}/${id}/toggle`, { method: "PATCH", headers });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to toggle timer");
    setTimers((prev) => prev.map((t) => (t._id === id ? data.timer : t)));
    return data.timer;
  };

  return { timers, loading, error, pagination, fetchTimers, createTimer, updateTimer, deleteTimer, toggleTimer };
}

export default useTimers;