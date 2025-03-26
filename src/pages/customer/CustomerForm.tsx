import React, { useState } from "react";
import { db, collection, addDoc } from "../../firebase/firebaseconfig";

const CustomerForm = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    await addDoc(collection(db, "customers"), {
      name,
      email,
      message,
      lead_score: Math.floor(Math.random() * 100), // Random lead score for now
      manager_reply: "" // Empty initially
    });

    setName("");
    setEmail("");
    setMessage("");
    alert("Query Submitted!");
  };

  return (
    <div>
      <h2>Submit Your Query</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <textarea placeholder="Message" value={message} onChange={(e) => setMessage(e.target.value)} required />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default CustomerForm;
