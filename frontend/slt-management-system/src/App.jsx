import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import Access from "./pages/Access/Access";
import Login from "./pages/login/Login";

import AdminLayout from "./layout/AdminLayout";

import AdminDashboard from "./pages/admin/Dashboard/AdminDashboard";
import DailyUpdate from "./pages/admin/DailyUpdate/DailyUpdate";
import Summary from "./pages/admin/Summary/Summary";
import Analysis from "./pages/admin/Analysis/Analysis";
import Settings from "./pages/admin/Setting/setting";

import FieldApp from "./pages/Field/FieldApp";

/* =========================
   ACCESS ROUTE
========================= */

function AccessRoute({ children }) {

  const accessGranted =
    localStorage.getItem(
      "accessGranted"
    );

  return accessGranted === "true"
    ? children
    : <Navigate to="/" replace />;

}

/* =========================
   PROTECTED ROUTE
========================= */

function ProtectedRoute({ children }) {

  const accessGranted =
    localStorage.getItem(
      "accessGranted"
    );

  const isLoggedIn =
    localStorage.getItem(
      "isLoggedIn"
    );

  return accessGranted === "true" &&
         isLoggedIn === "true"
    ? children
    : <Navigate to="/" replace />;

}

/* =========================
   APP
========================= */

function App() {

  return (

    <BrowserRouter>

      <Routes>

        {/* ACCESS PAGE */}

        <Route
          path="/"
          element={<Access />}
        />

        {/* ROLE PAGE */}

        <Route
          path="/role"
          element={
            <AccessRoute>
              <Login />
            </AccessRoute>
          }
        />

        {/* ADMIN ROUTES */}

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <AdminDashboard />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/daily"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <DailyUpdate />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/summary"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <Summary />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/analysis"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <Analysis />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <Settings />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        {/* FIELD */}

        <Route
          path="/field"
          element={<FieldApp />}
        />

        {/* INVALID ROUTE */}

        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />

      </Routes>

    </BrowserRouter>

  );

}

export default App;