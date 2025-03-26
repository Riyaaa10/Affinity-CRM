import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  auth,
  googleProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  saveUserRole,
} from "../firebase/firebaseconfig";
import { Box, Button, Container, Grid, Typography, Paper, TextField } from "@mui/material";

const AdminAuth: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignup, setIsSignup] = useState(true);
  const navigate = useNavigate();

  // 🔹 Handle Email Signup/Login
  const handleEmailAuth = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      let userCredential;
      if (isSignup) {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await saveUserRole(userCredential.user.uid, "admin", email);
      } else {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      }
      navigate("/admin-dashboard");
    } catch (error) {
      alert((error as Error).message);
    }
  };

  // 🔹 Handle Google Sign-In
  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        await saveUserRole(result.user.uid, "admin", result.user.email!);
        navigate("/admin-dashboard");
      }
    } catch (error) {
      alert((error as Error).message);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100vw",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #f6f9fc, #ddeffd)",
        color: "#333333",
        padding: 4,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* 🔷 Abstract Big Shape Background */}
      <Box
        sx={{
          position: "absolute",
          top: "-50px",
          left: "-100px",
          width: "400px",
          height: "400px",
          background: "#ffcc00",
          opacity: 0.2,
          borderRadius: "50%",
          filter: "blur(1200px)",
          zIndex: 0,
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: "-80px",
          right: "-80px",
          width: "450px",
          height: "450px",
          background: "#00c6ff",
          opacity: 0.2,
          borderRadius: "50%",
          filter: "blur(120px)",
          zIndex: 0,
        }}
      />

      {/* 🔺 Multiple Triangles */}
      {[
        { top: "10%", left: "5%", size: "120px", color: "#ff7eb3", rotate: "-20deg" },
        { bottom: "20%", right: "10%", size: "150px", color: "#00cc99", rotate: "30deg" },
        { top: "70%", left: "20%", size: "100px", color: "#ffcc00", rotate: "-10deg" },
        { top: "30%", right: "15%", size: "130px", color: "#66ff66", rotate: "15deg" },
        { bottom: "5%", left: "40%", size: "140px", color: "#ff589b", rotate: "-25deg" },
        { top: "50%", right: "5%", size: "110px", color: "#ffcc66", rotate: "20deg" },
        { bottom: "40%", left: "15%", size: "160px", color: "#ff9933", rotate: "-15deg" },
        { top: "85%", right: "30%", size: "90px", color: "#00c6ff", rotate: "35deg" },
        { bottom: "10%", left: "70%", size: "200px", color: "#ff6666", rotate: "-10deg" },
        { top: "20%", right: "40%", size: "125px", color: "#33ccff", rotate: "25deg" },
      ].map((triangle, index) => (
        <Box
          key={index}
          sx={{
            position: "absolute",
            top: triangle.top,
            right: triangle.right,
            bottom: triangle.bottom,
            left: triangle.left,
            width: triangle.size,
            height: triangle.size,
            clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
            background: triangle.color,
            opacity: 0.15,
            
            zIndex: 0,
          }}
        />
      ))}

      <Container maxWidth="md" sx={{ position: "relative", zIndex: 1 }}>
        <Paper elevation={4} sx={{ padding: 12, borderRadius: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: "bold", mb: 2}}>
            {isSignup ? "Admin Signup" : "Admin Login"}
          </Typography>
          <form onSubmit={handleEmailAuth}>
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              fullWidth
              sx={{ mb: 2 }}
            />
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              fullWidth
              sx={{ mb: 2 }}
            />
            <Button variant="contained" type="submit" sx={{ background: "#ff7eb3", color: "#fff", mb: 2 }}>
              {isSignup ? "Signup" : "Login"}
            </Button>
          </form>
          <Button variant="contained" onClick={handleGoogleSignIn} sx={{ background: "#00c6ff", color: "#fff", mb: 2 }}>
            Sign in with Google
          </Button>
          <Typography variant="body2" sx={{ cursor: "pointer" }} onClick={() => setIsSignup(!isSignup)}>
            {isSignup ? "Already have an account? Login" : "Don't have an account? Signup"}
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
};

export default AdminAuth;