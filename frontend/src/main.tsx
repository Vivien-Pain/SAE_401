import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./index.css";
import App from "./App.tsx"; 
import Home from "./components/Home/Home.tsx"; 
import AdminDashBoard from "./components/Admin/AdminDashBoard.tsx"; 
import ProfilePage from "./components/Profile/ProfilePage.tsx";


createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<App />} />  
        <Route path="/home" element={<Home />} /> 
        <Route path="/admin" element={<AdminDashBoard />} /> 
        <Route path="/profile/:username" element={<ProfilePage />} />
      </Routes>
    </Router>
  </StrictMode>
);
