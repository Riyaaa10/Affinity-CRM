const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
  service: "gmail", // Use your email provider
  auth: {
    user: "riyasuryawanshi1003@gmail.com", // Replace with your email
    pass: "kbqu tyqy dryr xpcg", // Replace with your email password or app password
  },
});

// API endpoint to send emails
app.post("/send-email", async (req, res) => {
  const { email, subject, message } = req.body;

  try {
    await transporter.sendMail({
      from: "riyasuryawanshi1003@gmail.com", // Sender address
      to: email, // Receiver's email address
      subject: subject, // Subject line
      text: message, // Plain text body
    });

    res.status(200).send("Email sent successfully!");
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).send("Failed to send email.");
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
