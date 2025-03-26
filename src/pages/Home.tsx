import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Briefcase, HeartHandshake, ShoppingBag, TrendingUp } from "lucide-react";
import { Box, Button, Container, Grid, Typography, Paper } from "@mui/material";

// Animations
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const Welcome = () => {
  const navigate = useNavigate();

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
          filter: "blur(120px)",
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
            transform: `rotate(${triangle.rotate})`,
            zIndex: 0,
          }}
        />
      ))}

      {/* 🔥 AffinityCRM Title */}
      <motion.h1
        style={{
          fontSize: "4.0rem",
          fontWeight: "bold",
          textShadow: "4px 4px 12px rgba(0,0,0,0.2)",
          background: "linear-gradient(to right, #ff7eb3, #ffcc00)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          position: "center",
          zIndex: 1,
        }}
        initial="initial"
        animate="animate"
        variants={fadeInUp}
        transition={{ duration: 0.8 }}
      >
        AffinityCRM
      </motion.h1>

      {/* 🌟 Tagline */}
      <motion.p
        style={{
          fontSize: "1.5rem",
          fontWeight: "500",
          color: "#555",
          position: "relative",
          zIndex: 1,
          marginBottom: "50px",
        }}
        initial="initial"
        animate="animate"
        variants={fadeInUp}
        transition={{ duration: 1.2, delay: 0.2 }}
      >
        Elevate Customer Engagement with AI-Powered Insights!
      </motion.p>

      {/* 📌 Buttons */}
      <Grid container spacing={3} justifyContent="center" sx={{ mb: 4, position: "relative", zIndex: 1 }}>
        <Grid item>
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Button variant="contained" sx={{ background: "#ff7eb3", color: "#fff" }} onClick={() => navigate("/customer-auth")}>
              Continue as Customer
            </Button>
          </motion.div>
        </Grid>
        <Grid item>
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Button variant="contained" sx={{ background: "#00c6ff", color: "#fff" }} onClick={() => navigate("/admin-auth")}>
              Continue as Admin
            </Button>
          </motion.div>
        </Grid>
      </Grid>

      {/* 🏆 Feature Cards */}
      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
        <Grid container spacing={3} justifyContent="center">
          {[
            { title: "Business Insights", icon: <Briefcase size={32} />, color: "#ffcc00", description: "Explore analytics to boost performance." },
            { title: "Customer Relationships", icon: <HeartHandshake size={32} />, color: "#ff7eb3", description: "Manage and nurture customer relationships." },
            { title: "Sales & Marketing", icon: <ShoppingBag size={32} />, color: "#00c6ff", description: "Enhance sales & marketing strategies." },
            { title: "Performance Tracking", icon: <TrendingUp size={32} />, color: "#66ff66", description: "Monitor and improve business growth." },
          ].map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <motion.div whileHover={{ scale: 1.05 }}>
                <Paper elevation={4} sx={{ padding: 3, border: `2px solid ${feature.color}` }}>
                  <Box sx={{ fontSize: "2rem", color: feature.color, mb: 1 }}>{feature.icon}</Box>
                  <Typography variant="h6" sx={{ fontWeight: "bold" }}>{feature.title}</Typography>
                  <Typography variant="body2" sx={{ color: "#555" }}>{feature.description}</Typography>
                </Paper>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* ⚡ Footer Section */}
      <Box
        sx={{
          width: "100%",
          background: "linear-gradient(135deg, #ff7eb3, #00c6ff)",
          color: "#fff",
          textAlign: "center",
          padding: "20px 10px",
          position: "relative",
          bottom: 0,
          mt: 4,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
          AffinityCRM © 2025
        </Typography>
        <Typography variant="body2">
          Designed with ❤️ to transform customer engagement.
        </Typography>
      </Box>
    </Box>
  );
};

export default Welcome;
