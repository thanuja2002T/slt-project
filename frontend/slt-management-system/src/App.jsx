import { BrowserRouter, Routes, Route } from "react-router-dom";

import Access from "./pages/Access/Access";
import Login from "./pages/login/Login";

import AdminLayout from "./layout/AdminLayout";

import AdminDashboard from "./pages/admin/Dashboard/AdminDashboard";
import DailyUpdate from "./pages/admin/DailyUpdate/DailyUpdate";
import Summary from "./pages/admin/Summary/Summary";
import Analysis from "./pages/admin/Analysis/Analysis";
import Notifications from "./pages/admin/Notification/Notifications";

import FieldApp from "./pages/Filed/FieldApp";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Access />} />
        <Route path="/role" element={<Login />} />

        {/* 🔥 ADMIN ROUTES */}
        <Route path="/dashboard" element={
          <AdminLayout><AdminDashboard /></AdminLayout>
        } />

        <Route path="/daily" element={
          <AdminLayout><DailyUpdate /></AdminLayout>
        } />

        <Route path="/summary" element={
          <AdminLayout><Summary /></AdminLayout>
        } />

        <Route path="/analysis" element={
          <AdminLayout><Analysis /></AdminLayout>
        } />

        <Route path="/notifications" element={
          <AdminLayout><Notifications /></AdminLayout>
        } />

        <Route path="/field" element={<FieldApp />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;