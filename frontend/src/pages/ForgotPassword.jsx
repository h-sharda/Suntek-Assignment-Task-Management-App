import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [verificationStep, setVerificationStep] = useState(false);
  const [resetStep, setResetStep] = useState(false);
  const [userId, setUserId] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      return toast.error('Please enter your email');
    }
    
    setLoading(true);
    
    try {
      const res = await axios.post('/api/auth/forgot-password', { email });
      
      setUserId(res.data.userId);
      setVerificationStep(true);
      toast.success('OTP sent to your email');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    
    if (!otp) {
      return toast.error('Please enter OTP');
    }
    
    setOtpLoading(true);
    
    try {
      // Just verify the OTP is valid, but don't reset password yet
      await axios.post('/api/auth/verify-email', {
        userId,
        otp
      });
      
      setResetStep(true);
      setVerificationStep(false);
      toast.success('OTP verified successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid OTP');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      return toast.error('Passwords do not match');
    }
    
    if (password.length < 6) {
      return toast.error('Password must be at least 6 characters');
    }
    
    setLoading(true);
    
    try {
      await axios.put('/api/auth/reset-password', {
        userId,
        otp,
        password
      });
      
      toast.success('Password reset successfully');
      navigate('/signin');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;
    
    setOtpLoading(true);
    
    try {
      await axios.post('/api/auth/resend-otp', {
        email
      });
      
      // Start countdown
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      toast.success('OTP sent successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setOtpLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-3xl font-bold text-center mb-8 text-text-primary">Forgot Password</h1>
      
      <div className="bg-overlay-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        {!verificationStep && !resetStep ? (
          <div>
            <p className="mb-4 text-text-secondary">Enter your email address and we'll send you a verification code to reset your password.</p>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-text-primary text-sm font-bold mb-2" htmlFor="email">
                  Email
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-text-primary bg-field-white leading-tight focus:outline-none focus:shadow-outline"
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <button
                type="submit"
                className="bg-button hover:bg-white hover:text-button border border-button text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full transition-colors duration-200"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </div>
                ) : (
                  'Send Reset Link'
                )}
              </button>
            </form>
          </div>
        ) : verificationStep ? (
          <div>
            <h2 className="text-xl font-semibold mb-4 text-text-primary">Verify Your Email</h2>
            <p className="mb-4 text-text-secondary">We've sent a verification code to your email. Please enter it below.</p>
            
            <form onSubmit={handleVerifyOtp}>
              <div className="mb-4">
                <label className="block text-text-primary text-sm font-bold mb-2" htmlFor="otp">
                  Verification Code
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-text-primary bg-field-white leading-tight focus:outline-none focus:shadow-outline"
                  id="otp"
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                />
              </div>
              
              <div className="flex flex-col space-y-4">
                <button
                  className="bg-button hover:bg-white hover:text-button border border-button text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors duration-200"
                  type="submit"
                  disabled={otpLoading}
                >
                  {otpLoading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Verifying...
                    </span>
                  ) : (
                    'Verify'
                  )}
                </button>
                
                <button
                  type="button"
                  className={`text-button hover:text-button-hover font-medium transition-colors duration-200 ${countdown > 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={handleResendOtp}
                  disabled={countdown > 0}
                >
                  {countdown > 0 ? `Resend OTP in ${countdown}s` : 'Resend OTP'}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <form onSubmit={handleResetPassword}>
            <h2 className="text-xl font-semibold mb-4 text-text-primary">Reset Your Password</h2>
            
            <div className="mb-4">
              <label className="block text-text-primary text-sm font-bold mb-2" htmlFor="password">
                New Password
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-text-primary bg-field-white leading-tight focus:outline-none focus:shadow-outline"
                id="password"
                type="password"
                placeholder="New Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-text-primary text-sm font-bold mb-2" htmlFor="confirmPassword">
                Confirm New Password
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-text-primary bg-field-white leading-tight focus:outline-none focus:shadow-outline"
                id="confirmPassword"
                type="password"
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            
            <button
              className="bg-button hover:bg-white hover:text-button border border-button text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full transition-colors duration-200"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Resetting...
                </span>
              ) : (
                'Reset Password'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword; 