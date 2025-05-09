import React, { useState } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import EmailVerificationModal from '../components/EmailVerificationModal';

const Profile = () => {
  const { user, setUser } = useAuth();
  
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Password change fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const handleUpdateName = async (e) => {
    e.preventDefault();
    
    if (!name) {
      return toast.error('Name cannot be empty');
    }
    
    setLoading(true);
    
    try {
      const res = await axios.put('/api/users/update-details', { name });
      
      setUser(res.data.data);
      setIsEditingName(false);
      toast.success('Name updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update name');
    } finally {
      setLoading(false);
    }
  };
  
  const handleUpdateEmail = async (e) => {
    e.preventDefault();
    
    if (!email) {
      return toast.error('Email cannot be empty');
    }
    
    setLoading(true);
    
    try {
      const res = await axios.post('/api/users/update-email', { email });
      
      setUserId(res.data.userId);
      setShowVerificationModal(true);
      setIsEditingEmail(false);
      toast.success('Please verify your new email');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update email');
    } finally {
      setLoading(false);
    }
  };
  
  const handleVerificationSuccess = async (token) => {
    // Get updated user data
    const userRes = await axios.get('/api/auth/me');
    setUser(userRes.data.data);
    setShowVerificationModal(false);
  };
  
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      return toast.error('Passwords do not match');
    }
    
    if (newPassword.length < 6) {
      return toast.error('Password must be at least 6 characters');
    }
    
    setLoading(true);
    
    try {
      await axios.put('/api/users/update-password', {
        currentPassword,
        newPassword
      });
      
      setIsEditingPassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast.success('Password updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-8">Profile</h1>
      
      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-semibold">Personal Information</h2>
          </div>
          
          <div className="border-t border-gray-200 pt-4">
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-gray-700 text-sm font-bold">Name</label>
                <button
                  type="button"
                  className="bg-white text-button border border-button hover:bg-button hover:text-white text-sm transition-colors duration-200"
                  onClick={() => setIsEditingName(!isEditingName)}
                >
                  {isEditingName ? 'Cancel' : 'Edit'}
                </button>
              </div>
              
              {isEditingName ? (
                <form onSubmit={handleUpdateName} className="mt-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      required
                    />
                    <button
                      type="submit"
                      className="bg-button hover:bg-white hover:text-button border border-button text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors duration-200"
                      disabled={loading}
                    >
                      {loading ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </form>
              ) : (
                <p className="text-gray-700">{user?.name}</p>
              )}
            </div>
            
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-gray-700 text-sm font-bold">Email</label>
                <div className="flex items-center">
                  {user?.isVerified && (
                    <span className="text-green-500 text-xs mr-2">Verified</span>
                  )}
                  <button
                    type="button"
                    className="bg-white text-button border border-button hover:bg-button hover:text-white text-sm transition-colors duration-200"
                    onClick={() => setIsEditingEmail(!isEditingEmail)}
                  >
                    {isEditingEmail ? 'Cancel' : 'Edit'}
                  </button>
                </div>
              </div>
              
              {isEditingEmail ? (
                <form onSubmit={handleUpdateEmail} className="mt-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      required
                    />
                    <button
                      type="submit"
                      className="bg-button hover:bg-white hover:text-button border border-button text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors duration-200"
                      disabled={loading}
                    >
                      {loading ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </form>
              ) : (
                <p className="text-gray-700">{user?.email}</p>
              )}
            </div>
          </div>
        </div>
        
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-semibold">Security</h2>
          </div>
          
          <div className="border-t border-gray-200 pt-4">
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-gray-700 text-sm font-bold">Password</label>
                <button
                  type="button"
                  className="bg-white text-button border border-button hover:bg-button hover:text-white text-sm transition-colors duration-200"
                  onClick={() => setIsEditingPassword(!isEditingPassword)}
                >
                  {isEditingPassword ? 'Cancel' : 'Change Password'}
                </button>
              </div>
              
              {isEditingPassword && (
                <form onSubmit={handleUpdatePassword} className="mt-4 space-y-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="currentPassword">
                      Current Password
                    </label>
                    <input
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      id="currentPassword"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="newPassword">
                      New Password
                    </label>
                    <input
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="confirmPassword">
                      Confirm New Password
                    </label>
                    <input
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="flex flex-col space-y-2">
                    <button
                      type="submit"
                      className="bg-button hover:bg-white hover:text-button border border-button text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors duration-200"
                      disabled={loading}
                    >
                      {loading ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Updating...
                        </span>
                      ) : (
                        'Update Password'
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      <EmailVerificationModal
        isOpen={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
        userId={userId}
        onVerificationSuccess={handleVerificationSuccess}
        title="Verify Your New Email"
        description="Please enter the verification code sent to your new email address."
      />
    </div>
  );
};

export default Profile;