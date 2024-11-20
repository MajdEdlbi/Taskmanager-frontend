import React from "react";
import { CssBaseline, Container, Box, Typography } from "@mui/material";
import TaskList from "./components/TaskList";

function App() {
  return (
    <>
      <CssBaseline />
      <Box
        sx={{
          position: "relative",
          minHeight: "100vh",
          background: "linear-gradient(60deg, #E2E8F0, #ff9800, #221E4D, #B500FF)",
          backgroundSize: "300% 300%",
          animation: "gradientShift 25s ease infinite",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Container
          maxWidth="lg"
          sx={{
            textAlign: "center",
            borderRadius: "15px",
            padding: "3rem",
            color: "white",
            zIndex: 2,
            position: "relative",
          }}
        >
          <Box
            sx={{
              position: "relative",
              display: "inline-block",
              color: "white",
              fontSize: "20px",
              fontWeight: "800",
              px: 4,
              py: 2,
              mx: -4,
            }}
          >
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "#6e06f2",
                transform: "skewX(-12deg)", 
                zIndex: -1,  
              }}
            />
            Task Management
          </Box>

          <Typography
            variant="h6"
            gutterBottom
            sx={{ marginTop: 4, fontWeight: "bold", marginBottom: 6 }}
          >
            Stay organized by categorizing tasks with labels and powerful
            filtering options.
          </Typography>
          <TaskList />
        </Container>
        <Box
          sx={{
            position: "absolute",
            top: "30%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 250,
            height: 250,
            background: "radial-gradient(circle, #e91e63, #ff9800, transparent)",
            borderRadius: "50%",
            opacity: 0.3,
            filter: "blur(4rem)",
          }}
        />
      </Box>

      <style>
        {`
          @keyframes gradientShift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
        `}
      </style>
    </>
  );
}

export default App;
