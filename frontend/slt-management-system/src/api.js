const BASE = "http://localhost:5000/api";

export const api = {
  saveDaily: (data) =>
    fetch(`${BASE}/daily/save`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    }),

  getToday: (date) =>
    fetch(`${BASE}/daily/today?date=${date}`)
      .then(res => res.json()),

  sendNotification: (data) =>
    fetch(`${BASE}/notifications/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    }),

  getNotifications: (date) =>
    fetch(`${BASE}/notifications?date=${date}`)
      .then(res => res.json())
};