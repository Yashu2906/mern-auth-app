import React, { useContext, useState, useRef } from "react";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

const ResetPasssword = () => {
  const { backendUrl } = useContext(AppContext);
  axios.defaults.withCredentials = true;

  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [otpInputs, setOtpInputs] = useState(Array(6).fill(""));
  const [isOtpSent, setIsOtpSent] = useState(false);

  const inputRefs = useRef([]);

  // Handle OTP input box changes
  const handleOtpInput = (e, index) => {
    const val = e.target.value.slice(-1);
    const newOtp = [...otpInputs];
    newOtp[index] = val;
    setOtpInputs(newOtp);
    if (val && index < 5) inputRefs.current[index + 1].focus();
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otpInputs[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    const paste = e.clipboardData.getData("text").slice(0, 6);
    const pasteArray = paste.split("");
    const newOtp = [...otpInputs];
    pasteArray.forEach((char, idx) => {
      newOtp[idx] = char;
      if (inputRefs.current[idx]) inputRefs.current[idx].value = char;
    });
    setOtpInputs(newOtp);
  };

  // Send OTP to email
  const sendOtp = async () => {
    if (!email) return toast.error("Please enter email first");
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/auth/send-reset-otp`,
        { email }
      );
      if (data.success) {
        toast.success(data.message);
        setIsOtpSent(true);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  // Submit form with email + otp + password
  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpCode = otpInputs.join("");

    if (!email || !otpCode || !newPassword) {
      return toast.error("Email, OTP and New Password are required");
    }

    try {
      const { data } = await axios.post(
        `${backendUrl}/api/auth/reset-password`,
        {
          email,
          otp: otpCode,
          newPassword,
        }
      );

      if (data.success) {
        toast.success(data.message);
        navigate("/login");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-6 sm:px-0 bg-gradient-to-r from-blue-200 to-purple-400">
      <img
        onClick={() => navigate("/")}
        src={assets.logo}
        alt=""
        className="absolute left-5 sm:left-20 top-5 w-28 sm:w-32 cursor-pointer"
      />

      <form
        onSubmit={handleSubmit}
        onPaste={handlePaste}
        className="bg-slate-900 p-8 rounded-lg shadow-md w-96 text-sm"
      >
        <h1 className="text-white text-2xl font-semibold text-center mb-4">
          Reset Password
        </h1>
        <p className="text-center mb-6 text-indigo-300">
          Enter your email, OTP, and new password
        </p>

        {/* Email Input */}
        <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]">
          <img src={assets.mail_icon} alt="" className="w-3 h-3" />
          <input
            type="email"
            placeholder="Email id"
            className="bg-transparent outline-none text-white w-full"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        {/* Send OTP Button */}
        <button
          type="button"
          onClick={sendOtp}
          className="w-full py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-900 text-white rounded-full mb-4"
        >
          Send OTP
        </button>

        {/* OTP Input Boxes */}
        <div className="flex justify-between mb-4">
          {otpInputs.map((val, idx) => (
            <input
              key={idx}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength="1"
              required
              className="appearance-none w-12 h-12 bg-[#333A5C] text-white text-center text-xl rounded-md"
              ref={(el) => (inputRefs.current[idx] = el)}
              value={val}
              onChange={(e) => handleOtpInput(e, idx)}
              onKeyDown={(e) => handleOtpKeyDown(e, idx)}
            />
          ))}
        </div>

        {/* New Password */}
        <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]">
          <img src={assets.lock_icon} alt="" className="w-3 h-3" />
          <input
            type="password"
            placeholder="New Password"
            className="bg-transparent outline-none text-white w-full"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </div>

        {/* Submit Button */}
        <button className="w-full py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-900 text-white rounded-full mt-3">
          Reset Password
        </button>
      </form>
    </div>
  );
};

export default ResetPasssword;
