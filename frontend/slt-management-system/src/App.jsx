import { BrowserRouter, Routes, Route } from "react-router-dom";

import Access from "./pages/Access/Access";
import Login from "./pages/login/Login";

import AdminLayout from "./layout/AdminLayout";

import AdminDashboard from "./pages/admin/AdminDashboard";
import DailyUpdate from "./pages/admin/DailyUpdate";
import Summary from "./pages/admin/Summary";
import Analysis from "./pages/admin/Analysis";
import Notifications from "./pages/admin/Notifications";

import FieldApp from "./pages/FieldApp";
import FieldFaults from "./pages/FieldFaults"; // ✅ IMPORT HERE

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* 🔐 ACCESS */}
        <Route path="/" element={<Access />} />
        <Route path="/role" element={<Login />} />

        {/* 🔥 ADMIN ROUTES (with Sidebar Layout) */}
        <Route
          path="/dashboard"
          element={
            <AdminLayout>
              <AdminDashboard />
            </AdminLayout>
          }
        />

        <Route
          path="/daily"
          element={
            <AdminLayout>
              <DailyUpdate />
            </AdminLayout>
          }
        />

        <Route
          path="/summary"
          element={
            <AdminLayout>
              <Summary />
            </AdminLayout>
          }
        />

        <Route
          path="/analysis"
          element={
            <AdminLayout>
              <Analysis />
            </AdminLayout>
          }
        />

        <Route
          path="/notifications"
          element={
            <AdminLayout>
              <Notifications />
            </AdminLayout>
          }
        />

        {/* ⚙️ FIELD ROUTES */}
        <Route path="/field" element={<FieldApp />} />
        <Route path="/field-faults" element={<FieldFaults />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;