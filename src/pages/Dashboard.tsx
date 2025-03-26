import { Link } from "react-router-dom";
import React from "react";

// Define the type for styles
const styles: React.CSSProperties = {
  textAlign: "center",
  padding: "20px",
};

const cardContainer: React.CSSProperties = {
  display: "flex",
  gap: "20px",
  justifyContent: "center",
  marginTop: "20px",
};

const card: React.CSSProperties = {
  padding: "20px",
  border: "1px solid #ccc",
  borderRadius: "8px",
  width: "200px",
  textAlign: "center",
};

const Dashboard: React.FC = () => {
  return (
    <div style={styles}>
      <h1>📊 Dashboard</h1>
      <p>Welcome to your AI-Driven CRM dashboard.</p>

      <div style={cardContainer}>
        <div style={card}>📈 Sales Analytics</div>
        <div style={card}>🤖 AI Recommendations</div>
        <div style={card}>📩 Customer Messages</div>
        <div style={card}>🔔 Notifications</div>
      </div>

      <Link to="/profile">Go to Profile</Link>
    </div>
  );
};

export default Dashboard;
