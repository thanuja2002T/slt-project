import { BrowserRouter, Routes, Route } from "react-router-dom";

import Access from "./pages/Access/Access";
import Login from "./pages/login/Login"; 
import AdminDashboard from "./pages/Admin/AdminDashboard";
import FieldApp from "./pages/FieldApp";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Access />} />
        <Route path="/role" element={<Login />} />
        <Route path="/dashboard" element={<AdminDashboard />} />
        <Route path="/field" element={<FieldApp />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;