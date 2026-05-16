import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import "../css/ForgotPassword.css";

const ForgotPassword = () => {

  const BASE_URL =
    import.meta.env.VITE_SPRING_API_BASE_URL;

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [otpSent, setOtpSent] = useState(false);

  const [otpVerified, setOtpVerified] =
    useState(false);

  const [otpLoading, setOtpLoading] =
    useState(false);

  const [resetLoading, setResetLoading] =
    useState(false);

  const [count, setCount] = useState(null);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  /* ---------------------------------- */
  /* GENERATE OTP */
  /* ---------------------------------- */

  const handleGenerateOTP = async () => {

    setError("");
    setSuccess("");

    setOtpLoading(true);

    try {

      const response = await fetch(
        `${BASE_URL}/api/generate-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            resetting: true,
          }),
        }
      );

      const message = await response.text();

      if (!response.ok) {
        throw new Error(message);
      }

      setOtpSent(true);

      setSuccess("OTP sent successfully");

    } catch (err) {

      setError(err.message);

    } finally {

      setOtpLoading(false);
    }
  };

  /* ---------------------------------- */
  /* VALIDATE OTP */
  /* ---------------------------------- */

  const handleValidateOTP = async () => {

    setError("");
    setSuccess("");

    try {

      const response = await fetch(
        `${BASE_URL}/api/validate-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            otp,
          }),
        }
      );

      const valid = await response.json();

      if (!valid) {
        throw new Error("Invalid OTP");
      }

      setOtpVerified(true);

      setSuccess("OTP verified successfully");

    } catch (err) {

      setError(err.message);
    }
  };

  /* ---------------------------------- */
  /* UPDATE PASSWORD */
  /* ---------------------------------- */

  const handleUpdatePassword = async (e) => {

    e.preventDefault();

    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {

      setError("Passwords do not match");

      return;
    }

    setResetLoading(true);

    try {

      const response = await fetch(
        `${BASE_URL}/api/update-forgotten-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password: newPassword,
          }),
        }
      );

      const message = await response.text();

      if (!response.ok) {
        throw new Error(message);
      }

      setSuccess(
        "Password updated successfully"
      );

      setCount(3);

      const interval = setInterval(() => {

        setCount((prev) => {

          if (prev === 1) {

            clearInterval(interval);

            navigate("/");

            return null;
          }

          return prev - 1;
        });

      }, 1000);

    } catch (err) {

      setError(err.message);

    } finally {

      setResetLoading(false);
    }
  };

  return (

    <div className="forgot-page">

      <div className="forgot-box">

        <div className="forgot-left">
            <button
                type="button"
                className="big-back-btn"
                onClick={() => navigate("/")}
                >
                ←
            </button>

          <div className="forgot-brand">

            <h1>AutoHire AI</h1>

            <p>
              Secure Password Recovery
            </p>

          </div>

        </div>

        <div className="forgot-right">
            {/* <button
                type="button"
                className="back-btn"
                onClick={() => navigate("/")}
                >
                ← Back
            </button> */}
          <form
            className="forgot-form"
            onSubmit={handleUpdatePassword}
          >

            <h2>Forgot Password</h2>

            <input
              type="email"
              placeholder="Enter Email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              required
            />

            <div className="otp-container">

              <button
                type="button"
                onClick={handleGenerateOTP}
                disabled={
                  !email ||
                  otpLoading ||
                  otpSent
                }
              >

                {
                  otpLoading
                    ? "Sending OTP..."
                    : otpSent
                    ? "OTP Sent"
                    : "Generate OTP"
                }

              </button>

              {otpSent && (

                <>

                  <input
                    type="text"
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) =>
                      setOtp(e.target.value)
                    }
                  />

                  <button
                    type="button"
                    onClick={handleValidateOTP}
                    disabled={otpVerified}
                  >

                    {
                      otpVerified
                        ? "OTP Verified"
                        : "Validate OTP"
                    }

                  </button>

                </>
              )}

            </div>

            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) =>
                setNewPassword(e.target.value)
              }
              disabled={!otpVerified}
              required
            />

            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(
                  e.target.value
                )
              }
              disabled={!otpVerified}
              required
            />

            <button
              type="submit"
              disabled={
                !otpSent ||
                !otpVerified ||
                resetLoading
              }
            >

              {
                count !== null
                  ? `Redirecting in ${count}s...`
                  : resetLoading
                  ? "Updating Password..."
                  : "Update Password"
              }

            </button>

            {error && (
              <p className="forgot-error">
                {error}
              </p>
            )}

            {success && (
              <p className="forgot-success">
                {success}
              </p>
            )}

          </form>

        </div>

      </div>

    </div>
  );
};

export default ForgotPassword;