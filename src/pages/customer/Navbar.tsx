import React from "react";
import { AppBar, Toolbar, Typography, Button } from "@mui/material";
import { logout } from "../../firebase/firebaseconfig";
import { useNavigate } from "react-router-dom";

const Navbar: React.FC = () => {
  const navigate = useNavigate();

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          AffinityCRM
        </Typography>
        <Button color="inherit" onClick={() => navigate("/customer-dashboard")}>
          Dashboard
        </Button>
        <Button color="inherit" onClick={() => logout().then(() => navigate("/"))}>
          Logout
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
