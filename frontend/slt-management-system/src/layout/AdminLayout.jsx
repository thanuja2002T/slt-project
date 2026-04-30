import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import "../pages/Admin/AdminDashboard.css";

export default function AdminLayout({ children }) {
  const [open, setOpen] = useState(false);

  // 🔥 Swipe support
  useEffect(() => {
    let startX = 0;

    const handleTouchStart = (e) => {
      startX = e.touches[0].clientX;
    };

    const handleTouchEnd = (e) => {
      let endX = e.changedTouches[0].clientX;

      if (startX < 50 && endX > 120) {
        setOpen(true);
      }

      if (startX > 200 && endX < 100) {
        setOpen(false);
      }
    };

    document.addEventListener("touchstart", handleTouchStart);
    document.addEventListener("touchend", handleTouchEnd);

    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, []);

  return (
    <>
      {/* ✅ SIDEBAR OUTSIDE */}
      <Sidebar open={open} setOpen={setOpen} />

      {/* ☰ BUTTON */}
      <div className="menu-btn" onClick={() => setOpen(!open)}>
        ☰
      </div>

      {/* OVERLAY */}
      {open && <div className="overlay" onClick={() => setOpen(false)}></div>}

      {/* MAIN LAYOUT */}
      <div className="admin-layout">
        <div className={`dashboard ${open ? "blur" : ""}`}>
          {children}
        </div>
      </div>
    </>
  );
}