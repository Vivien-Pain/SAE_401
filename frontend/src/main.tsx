import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./index.css";
import App from "./App.tsx"; 
import Home from "./components/Home/Home.tsx"; 
import AdminDashBoard from "./components/Admin/AdminDashBoard.tsx"; 


createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<App />} />  
        <Route path="/home" element={<Home />} /> 
        <Route path="/admin" element={<AdminDashBoard />} /> 
      </Routes>
    </Router>
  </StrictMode>
);
