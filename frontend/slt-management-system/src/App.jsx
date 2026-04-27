import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/login/Login";
import AdminDashboard from "./pages/admin/AdminDashboard";
import FieldApp from "./pages/FieldApp";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<AdminDashboard />} />
        <Route path="/field" element={<FieldApp />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;