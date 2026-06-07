import { Link, useNavigate } from "react-router-dom";
import "./Sidebar.css";

export default function Sidebar({ open, setOpen }) {

  const navigate = useNavigate();

  const handleLogout = () => {

    localStorage.removeItem(
      "accessGranted"
    );

    localStorage.removeItem(
      "isLoggedIn"
    );

    localStorage.removeItem(
      "selectedTeam"
    );

    navigate("/");

  };

  return (

    <div
      className={`sidebar ${
        open ? "open" : ""
      }`}
    >

      <div className="sidebar-content">

        <h2 className="logo">
          SLT.Perform
        </h2>

        <nav>

          <Link
            to="/dashboard"
            onClick={() =>
              setOpen(false)
            }
          >
            📊 Dashboard
          </Link>

          <Link
            to="/daily"
            onClick={() =>
              setOpen(false)
            }
          >
            📋 Daily Update
          </Link>

          <Link
            to="/analysis"
            onClick={() =>
              setOpen(false)
            }
          >
            🔍 Analysis
          </Link>

          <Link
            to="/summary"
            onClick={() =>
              setOpen(false)
            }
          >
            📈 Summary
          </Link>

          <Link
            to="/settings"
            onClick={() =>
              setOpen(false)
            }
          >
            ⚙️ Settings
          </Link>

        </nav>

      </div>

      {/* USER PROFILE */}

      <div className="sidebar-user">

        <div className="avatar">
          AD
        </div>

        <div className="user-info">

          <p className="user-name">
            Admin User
          </p>

          <p className="user-role">
            SLT Headquarters
          </p>

          <button
            className="logout-btn"
            onClick={handleLogout}
          >
            🚪 Logout
          </button>

        </div>

      </div>

    </div>

  );

}