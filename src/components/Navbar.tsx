import React from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase/firebaseconfig";

const Navbar: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await auth.signOut();
    navigate("/");
  };

  return (
    <nav className="navbar">
      <h2>AI CRM</h2>
      <button onClick={() => navigate("/profile")}>👤 Profile</button>
      <button onClick={handleLogout}>🚪 Logout</button>
    </nav>
  );
};

export default Navbar;
