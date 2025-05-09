import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const SignIn = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { setIsAuthenticated, setUser } = useAuth();

  const { email, password } = formData;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setLoading(true);
      try {
      const res = await axios.post('/api/auth/signin', {
        email,
        password
      });
      
      // Save token to localStorage
      localStorage.setItem('token', res.data.token);
      
      // Set auth header
      axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
      
      // Get user data
      const userRes = await axios.get('/api/auth/me');
      
      // Update auth context
      setIsAuthenticated(true);
      setUser(userRes.data.data);
      
      toast.success('Signed in successfully');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-3xl font-bold text-center mb-8 text-text-primary">Sign In</h1>
      
      <form onSubmit={handleSubmit} className="bg-overlay-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <div className="mb-4">
          <label className="block text-text-primary text-sm font-bold mb-2" htmlFor="email">
            Email
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-text-primary bg-field-white leading-tight focus:outline-none focus:shadow-outline"
            id="email"
            type="email"
            placeholder="Email"
            name="email"
            value={email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-6">
          <label className="block text-text-primary text-sm font-bold mb-2" htmlFor="password">
            Password
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-text-primary bg-field-white mb-3 leading-tight focus:outline-none focus:shadow-outline"
            id="password"
            type="password"
            placeholder="********"
            name="password"
            value={password}
            onChange={handleChange}
            required
          />
        </div>
        <div className="flex flex-col space-y-4">
          <button
            className="bg-button hover:bg-white hover:text-button border border-button text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full transition-colors duration-200"
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing In...
              </div>
            ) : (
              'Sign In'
            )}
          </button>
          
          <Link 
            to="/forgot-password" 
            className="text-button hover:text-button-hover text-center transition-colors duration-200"
          >
            Forgot Password?
          </Link>
          
          <div className="text-center">
            <span className="text-text-secondary">Don't have an account? </span>
            <Link 
              to="/signup" 
              className="text-button hover:text-button-hover transition-colors duration-200"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SignIn; 