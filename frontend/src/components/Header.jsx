import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const Header = () => {
  const { isAuthenticated, user, setIsAuthenticated, setUser } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSignout = async () => {
    try {
      await axios.get('/api/auth/signout');
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
      setIsAuthenticated(false);
      setUser(null);
      toast.success('Signed out successfully');
      navigate('/');
    } catch (error) {
      toast.error('Error signing out');
    }
  };

  return (
    <header className="bg-bg-white text-text-primary sticky top-0 z-50">
      <div className="flex justify-between items-center px-6 py-5">
        <div className="flex items-center">
          <Link to="/" className="text-2xl font-normal flex items-center font-sans">
            <img src="/logo.png" alt="SUNTEK AI Logo" className="mr-3 h-10" />
            <span className="text-2xl text-text-primary font-sans font-normal tracking-wide">SUNTEK AI</span>
          </Link>
        </div>
        <nav>
          <ul className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <li>
                  <Link to="/" className="bg-white text-button border border-button hover:bg-button hover:text-white font-bold py-2 px-4 rounded transition-colors duration-200">
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/dashboard" className="bg-white text-button border border-button hover:bg-button hover:text-white font-bold py-2 px-4 rounded transition-colors duration-200">
                    Dashboard
                  </Link>
                </li>
                <li className="relative">
                  <button 
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="flex items-center space-x-1 bg-button hover:bg-white hover:text-button border border-button text-white font-bold py-2 px-4 rounded transition-colors duration-200"
                  >
                    <span>{user?.name}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {showDropdown && (
                    <div className="absolute right-0 mt-2 w-48 bg-overlay-white rounded-md shadow-lg py-1 z-10">
                      <button 
                        onClick={() => {
                          setShowDropdown(false);
                          navigate('/profile');
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-button bg-transparent border-0 hover:bg-transparent hover:text-button"
                      >
                        Profile
                      </button>
                      
                      <button 
                        onClick={() => {
                          setShowDropdown(false);
                          handleSignout();
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-button bg-transparent border-0 hover:bg-transparent hover:text-button"
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link to="/signup" className="bg-button hover:bg-white hover:text-button border border-button text-white font-bold py-2 px-4 rounded transition-colors duration-200">
                    Sign Up
                  </Link>
                </li>
                <li>
                  <Link to="/signin" className="bg-white text-button border border-button hover:bg-button hover:text-white font-bold py-2 px-4 rounded transition-colors duration-200">
                    Sign In
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>
      </div>
      <div 
        className={`fixed left-0 w-screen h-[1px] bg-text-primary transition-opacity duration-1000 ${
          isScrolled ? 'opacity-25' : 'opacity-0'
        }`} 
      />
    </header>
  );
};

export default Header; 
