import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { Container } from "@mui/material";
import { HeaderBar } from "./HeaderBar";
import Top from "./Top";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Activity from "./Activity";
import Links from "./Links";
import Documents from "./Documents";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <BrowserRouter>
        <HeaderBar />
        <Container
          maxWidth="lg"
          sx={{
            mt: 5,
            display: "flex",
            flexDirection: "column",
            justifyContent: "start",
          }}
        >
          <Routes>
            <Route path="/" element={<Top />} />
            <Route path="/activity" element={<Activity />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/links" element={<Links />} />
            <></>
          </Routes>
        </Container>
      </BrowserRouter>
    </>
  );
}

export default App;
