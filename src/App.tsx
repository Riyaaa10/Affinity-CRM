import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import CustomerAuth from "./auth/CustomerAuth";
import CustomerDashboard from "./pages/customer/CustomerDashboard";

import AdminDashboard from "./pages/AdminDashboard";
import AdminAuth from "./auth/AdminAuth";
import ProtectedRoute from "./auth/ProtectedRoute";
import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/customer-auth" element={<CustomerAuth />} />
        <Route path="/customer-dashboard" element={<CustomerDashboard />} />
        
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/protected-route" element={<ProtectedRoute />} />
        <Route path="/admin-auth" element={<AdminAuth />} />
        <Route path="/about" element={<About />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
