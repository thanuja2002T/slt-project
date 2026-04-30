import "./Notifications.css";
import { useState } from "react";

export default function Notifications() {

  const [filter, setFilter] = useState("all");
  const [active, setActive] = useState(0);

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "JA4 — Service 007 update required",
      desc: "Fault details missing for 3 entries",
      time: "09:45",
      type: "info",
      read: false
    },
    {
      id: 2,
      title: "Low completion alert — Service 008",
      desc: "Completion dropped below 60%",
      time: "10:12",
      type: "alert",
      read: false
    },
    {
      id: 3,
      title: "JA1 daily summary submitted",
      desc: "All faults attended · 100%",
      time: "11:30",
      type: "success",
      read: true
    },
    {
      id: 4,
      title: "Monthly report ready",
      desc: "Summary generated",
      time: "Yesterday",
      type: "info",
      read: true
    }
  ]);

  // 🔥 FILTER LOGIC
  const filtered = notifications.filter((n) => {
    if (filter === "unread") return !n.read;
    if (filter === "alerts") return n.type === "alert";
    return true;
  });

  // 🔥 CLICK → MARK AS READ
  const handleClick = (item, index) => {
    setActive(index);

    const updated = notifications.map(n =>
      n.id === item.id ? { ...n, read: true } : n
    );

    setNotifications(updated);
  };

  // 🔥 MARK ALL READ
  const markAllRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
  };

  const getIcon = (type) => {
    if (type === "alert") return "⚠️";
    if (type === "success") return "✅";
    return "🔧";
  };

  return (
    <div className="notifications-page">

      {/* HEADER */}
      <div className="header">
        <div>
          <h1>Notifications</h1>
          <p>Field alerts and staff update reminders</p>
        </div>

        <button className="mark-btn" onClick={markAllRead}>
          Mark all read
        </button>
      </div>

      {/* FILTER */}
      <div className="tabs">
        <button 
          className={filter === "all" ? "active" : ""}
          onClick={() => setFilter("all")}
        >
          All
        </button>

        <button 
          className={filter === "unread" ? "active" : ""}
          onClick={() => setFilter("unread")}
        >
          Unread
        </button>

        <button 
          className={filter === "alerts" ? "active" : ""}
          onClick={() => setFilter("alerts")}
        >
          Alerts
        </button>
      </div>

      {/* GRID */}
      <div className="notify-grid">

        {/* LEFT LIST */}
        <div className="left-panel">
          <h4>RECENT NOTIFICATIONS</h4>

          {filtered.map((n, i) => (
            <div
              key={n.id}
              className={`notify-card ${active === i ? "active" : ""} ${!n.read ? "unread" : ""}`}
              onClick={() => handleClick(n, i)}
            >
              <div className="icon">{getIcon(n.type)}</div>

              <div className="content">
                <h5>{n.title}</h5>
                <p>{n.desc}</p>
              </div>

              <span className="time">{n.time}</span>
            </div>
          ))}

        </div>

        {/* RIGHT PANEL */}
        <div className="right-panel">

          <h4>DETAIL VIEW</h4>

          <div className="detail-card">
            <h3>Selected Notification</h3>
            <p>
              {filtered[active]
                ? filtered[active].desc
                : "Select a notification"}
            </p>

            <div className="actions">
              <button className="save">Save Updates</button>
              <button className="back">← Back</button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}