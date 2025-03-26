import React, { useEffect, useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  Avatar,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { db } from "../firebase";
import { collection, query, onSnapshot, orderBy } from "firebase/firestore";
import axios from "axios";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#FF6384"];

const AdminDashboard = () => {
  const [customerActions, setCustomerActions] = useState([]);
  const [activityData, setActivityData] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [assistanceRequests, setAssistanceRequests] = useState([]);

  useEffect(() => {
    // Fetch customer activity
    const customerQuery = query(collection(db, "customer_activity"), orderBy("timestamp", "desc"));
    onSnapshot(customerQuery, (snapshot) => {
      const activityCounts = {
        Browsing: 0,
        "Added to Cart": 0,
        Purchased: 0,
        Wishlist: 0,
      };

      const actions = snapshot.docs.map((doc) => {
        const data = doc.data();
        activityCounts[data.action] = (activityCounts[data.action] || 0) + 1;
        return { id: doc.id, ...data };
      });

      setCustomerActions(actions);
      setActivityData([
        { name: "Browsing", value: activityCounts.Browsing },
        { name: "Added to Cart", value: activityCounts["Added to Cart"] },
        { name: "Purchased", value: activityCounts.Purchased },
        { name: "Wishlist", value: activityCounts.Wishlist },
      ]);
    });

    // Fetch feedbacks
    const feedbackQuery = query(collection(db, "customer_feedback"), orderBy("timestamp", "desc"));
    onSnapshot(feedbackQuery, (snapshot) => {
      setFeedbacks(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      snapshot.docs.forEach((doc) => {
        const feedback = doc.data();
        if (feedback.type === "complaint") {
          sendApologyEmail(feedback.email, feedback.message);
        } else if (feedback.type === "review") {
          sendReviewResponseEmail(feedback.email, feedback.message);
        }
      });
    });

    // Fetch assistance requests
    const assistanceQuery = query(collection(db, "assistance_requests"), orderBy("timestamp", "desc"));
    onSnapshot(assistanceQuery, (snapshot) => {
      setAssistanceRequests(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      snapshot.docs.forEach((doc) => {
        const request = doc.data();
        sendAssistanceResponseEmail(request.email, request.issue);
      });
    });
  }, []);

  // Function to send apology email for complaints
  const sendApologyEmail = async (email: string, message: string) => {
    try {
      await axios.post("http://localhost:3001/send-email", {
        to: email,
        subject: "Apology for Your Experience",
        text: `Dear Customer,

We have received your complaint regarding: "${message}".

We sincerely apologize for any inconvenience caused. As a token of our apology, we are offering you a VIP discount code.

Best regards,
AffinityCRM Team`,
      });
      console.log("Apology email sent successfully!");
    } catch (error) {
      console.error("Error sending apology email:", error);
    }
  };

  // Function to send response for reviews
  const sendReviewResponseEmail = async (email: string, message: string) => {
    try {
      await axios.post("http://localhost:3001/send-email", {
        to: email,
        subject: "Thank You for Your Review",
        text: `Dear Customer,

Thank you for taking the time to share your review with us. Your feedback is invaluable, and we appreciate your support.

Best regards,
AffinityCRM Team`,
      });
      console.log("Review response email sent successfully!");
    } catch (error) {
      console.error("Error sending review response email:", error);
    }
  };

  // Function to send response for assistance requests
  const sendAssistanceResponseEmail = async (email: string, issue: string) => {
    try {
      await axios.post("http://localhost:3001/send-email", {
        to: email,
        subject: "Response to Your Assistance Request",
        text: `Dear Customer,

Thank you for reaching out regarding: "${issue}".

We are working on resolving your issue and will get back to you soon.

Best regards,
AffinityCRM Team`,
      });
      console.log("Assistance response email sent successfully!");
    } catch (error) {
      console.error("Error sending assistance response email:", error);
    }
  };

  return (
    <Box sx={{ backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
      {/* Navbar */}
      <AppBar position="static" sx={{ backgroundColor: "#4A90E2" }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            AI-Driven CRM + Smart E-Commerce
          </Typography>
          <Button variant="contained" sx={{ backgroundColor: "#ffffff", color: "#4A90E2" }}>
            Switch to Customer
          </Button>
          <Avatar sx={{ marginLeft: "10px", backgroundColor: "#ffffff", color: "#4A90E2" }}>A</Avatar>
        </Toolbar>
      </AppBar>


      {/* Dashboard Content */}
      <Box sx={{ padding: "20px", display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* Metrics Section */}
        <Grid container spacing={3}>
          <Grid item xs={4}>
            <Card>
              <CardContent>
                <Typography variant="h6">Active Visitors</Typography>
                <Typography variant="h4">24</Typography>
                <Typography variant="subtitle2" color="green">
                  ↑ 12% from yesterday
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={4}>
            <Card>
              <CardContent>
                <Typography variant="h6">Conversion Rate</Typography>
                <Typography variant="h4">3.8%</Typography>
                <Typography variant="subtitle2" color="green">
                  ↑ 0.5% from last week
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={4}>
            <Card>
              <CardContent>
                <Typography variant="h6">Cart Abandonment</Typography>
                <Typography variant="h4">21%</Typography>
                <Typography variant="subtitle2" color="red">
                  ↑ 2% from last week
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* High-Intent Customers & Live Customer Activity */}
        <Grid container spacing={3}>
          {/* High-Intent Customers */}
          <Grid item xs={6}>
            <Card sx={{ height: "100%" }}>
              <CardContent>
                <Typography variant="h6">High-Intent Customers</Typography>
                {customerActions.slice(0, 3).map((action) => (
                  <ListItem key={action.id}>
                    <ListItemText
                      primary={`${action.email}`}
                      secondary={`Intent Score: ${Math.floor(Math.random() * (95 - 75 + 1)) + 75}%`}
                    />
                  </ListItem>
                ))}
              </CardContent>
            </Card>
          </Grid>

          {/* Live Customer Activity */}
          <Grid item xs={6}>
            <Card sx={{ height: "100%" }}>
              <CardContent>
                <Typography variant="h6">Live Customer Activity</Typography>
                {customerActions.slice(0, 5).map((action) => (
                  <ListItem key={action.id}>
                    <ListItemText primary={`${action.email}`} secondary={`${action.action}`} />
                  </ListItem>
                ))}
              </CardContent>
            </Card>
          </Grid>

          {/* Products Added to Cart or Wishlist */}
          <Grid item xs={12}>
            <Card sx={{ height: "100%" }}>
              <CardContent>
                <Typography variant="h6">Products Added to Cart or Wishlist</Typography>
                {customerActions.filter(action => action.action === "Added to Cart" || action.action === "Added to Wishlist").map((action) => (
                  <ListItem key={action.id}>
                    <ListItemText primary={`${action.email}`} secondary={`Product: ${action.product?.name || "N/A"}`} />
                  </ListItem>
                ))}
              </CardContent>
            </Card>
          </Grid>

          {/* Pie Chart - Overall Analysis */}
          <Grid item xs={12}>
            <Card sx={{ paddingBottom: "20px" }}>
              <CardContent>
                <Typography variant="h6">Overall User Activity</Typography>
                {/* Pie Chart with Legend */}
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart width={400} height={400}>
                    <Pie data={activityData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={120}>
                      {activityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    {/* Tooltip for hover details */}
                    <Tooltip />
                    {/* Legend for denoting distribution */}
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* AI Engagement Suggestions */}
          <Grid item xs={12}>
            <Card sx={{ paddingBottom: "20px" }}>
              <CardContent>
                <Typography variant="h6">AI Engagement Suggestions</Typography>
                {/* Example Suggestions */}
                {["Send discount to cart abandoners", "Restock high-demand products"].map((suggestion, index) => (
                  <ListItem key={index}>
                    <ListItemText primary={`${suggestion}`} />
                  </ListItem>
                ))}
              </CardContent>
            </Card>
          </Grid>

        </Grid>

      </Box>

    </Box>
  );
};

export default AdminDashboard;
