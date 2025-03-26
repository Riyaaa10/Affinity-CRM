import React from "react";

const CustomerCard: React.FC<{ user: any }> = ({ user }) => {
  return (
    <div className="customer-card">
      <h3>📄 Profile</h3>
      <p><strong>Email:</strong> {user?.email || "N/A"}</p>
      <p><strong>Lead Score:</strong> {user?.leadScore || "Not Available"}</p>
      <p><strong>Recent Activity:</strong> {user?.lastInteraction || "No recent interactions"}</p>
    </div>
  );
};

export default CustomerCard;