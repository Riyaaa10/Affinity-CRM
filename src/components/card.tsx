import React from "react";

const Card = ({ children, className = "" }) => {
  return (
    <div
      className={`bg-white rounded-md shadow-md p-4 ${className}`}
    >
      {children}
    </div>
  );
};

const CardHeader = ({ children }) => {
  return (
    <div className="flex justify-between mb-4">
      {children}
    </div>
  );
};

const CardContent = ({ children }) => {
  return (
    <div className="text-sm text-gray-500">{children}</div>
  );
};

const CardTitle = ({ children }) => {
  return (
    <h2 className="text-lg font-bold">{children}</h2>
  );
};

const CardDescription = ({ children }) => {
  return (
    <p className="text-sm text-gray-500">{children}</p>
  );
};

export { Card, CardHeader, CardContent, CardTitle, CardDescription };
