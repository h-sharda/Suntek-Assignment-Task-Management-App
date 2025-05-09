import React, { useState } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';

const EmailVerificationModal = ({ 
  isOpen, 
  onClose, 
  userId, 
  onVerificationSuccess,
  title = "Email Verification",
  description = "Would you like to verify your email now?"
}) => {
  const [otp, setOtp] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [showOtpForm, setShowOtpForm] = useState(false);

  const startCountdown = () => {
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
  };

  const handleVerifyNow = async () => {
    setOtpLoading(true);
    try {
      await axios.post('/api/auth/resend-otp', {
        userId
      });
      
      startCountdown();
      setShowOtpForm(true);
      toast.success('OTP sent successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    
    if (!otp) {
      return toast.error('Please enter OTP');
    }
    
    setOtpLoading(true);
    
    try {
      const res = await axios.post('/api/auth/verify-email', {
        userId,
        otp
      });
      
      // Save token to localStorage
      localStorage.setItem('token', res.data.token);
      
      // Set auth header
      axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
      
      onVerificationSuccess(res.data.token);
      onClose();
      toast.success('Email verified successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'OTP verification failed');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;
    
    setOtpLoading(true);
    
    try {
      await axios.post('/api/auth/resend-otp', {
        userId
      });
      
      startCountdown();
      toast.success('OTP sent successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setOtpLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <h2 className="text-xl font-semibold mb-4">{title}</h2>
        
        {!showOtpForm ? (
          <>
            <p className="mb-4 text-gray-600">{description}</p>
            <div className="flex space-x-4">
              <button
                onClick={handleVerifyNow}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors duration-200"
                disabled={otpLoading}
              >
                {otpLoading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending OTP...
                  </div>
                ) : (
                  'Verify Now'
                )}
              </button>
              <button
                onClick={onClose}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors duration-200"
              >
                Verify Later
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="mb-4 text-gray-600">Enter the verification code sent to your email.</p>
            <form onSubmit={handleVerifyOtp}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="otp">
                  Verification Code
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="otp"
                  type="text"
                  placeholder="Enter verification code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                />
              </div>
              
              <div className="flex flex-col space-y-4">
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors duration-200"
                  type="submit"
                  disabled={otpLoading}
                >
                  {otpLoading ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Verifying...
                    </div>
                  ) : (
                    'Verify'
                  )}
                </button>
                
                <button
                  type="button"
                  className={`bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors duration-200 ${countdown > 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={handleResendOtp}
                  disabled={countdown > 0}
                >
                  {countdown > 0 ? `Resend OTP in ${countdown}s` : 'Resend OTP'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default EmailVerificationModal; 