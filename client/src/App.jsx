import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import EmailVerify from "./pages/EmailVerify";
import ResetPasssword from "./pages/ResetPasssword";
import { ToastContainer } from "react-toastify";

const App = () => {
  return (
    <div>
      <ToastContainer />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/emailverify" element={<EmailVerify />} />
        <Route path="/resetpassword" element={<ResetPasssword />} />
      </Routes>
    </div>
  );
};

export default App;
