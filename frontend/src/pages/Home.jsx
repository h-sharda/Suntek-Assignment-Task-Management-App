import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="max-w-3xl mx-auto text-center">
      <h1 className="text-4xl font-bold mb-8 text-text-primary">Task and Time Tracking App</h1>
      
      {isAuthenticated ? (
        <div>
          <h2 className="text-2xl mb-4 text-text-primary">Hello, {user?.name}!</h2>
          <p className="text-lg mb-6 text-text-secondary">
            {/* main content */}
          </p>
          <div className="flex justify-center space-x-4">
            <Link 
              to="/profile" 
              className="bg-button hover:bg-white hover:text-button border border-button text-white font-bold py-2 px-6 rounded-lg transition-colors duration-200"
            >
              Go to Profile
            </Link>
            <button className="bg-button hover:bg-white hover:text-button border border-button text-white font-bold py-2 px-6 rounded-lg transition-colors duration-200">
              Dashboard
            </button>
          </div>
        </div>
      ) : (
        <div>
          <p className="text-lg mb-6 text-text-secondary">
            Welcome to the Task and Time Tracking App. This app is designed to help you manage your tasks and time effectively. 
            You can use this app to create tasks, assign them to others, track time spent on tasks, and daily summaries.
          </p>
          <p className="mb-8 text-text-secondary">
            Sign up or sign in to get started.
          </p>
          <div className="flex justify-center space-x-4">
            <Link 
              to="/signup" 
              className="bg-button hover:bg-white hover:text-button border border-button text-white font-bold py-2 px-6 rounded-lg transition-colors duration-200"
            >
              Sign Up
            </Link>
            <Link 
              to="/signin" 
              className="bg-white text-button border border-button hover:bg-button hover:text-white font-bold py-2 px-6 rounded-lg transition-colors duration-200"
            >
              Sign In
            </Link>
          </div>
        </div>
      )}
      
      <div className="mt-16">
        <h3 className="text-xl font-semibold mb-4 text-text-primary">Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-overlay-white p-6 rounded-lg shadow-md">
            <h4 className="text-lg font-semibold mb-2 text-text-primary">Task Management</h4>
            <p className="text-text-secondary">Create, assign, and track tasks efficiently for yourself or your team.</p>
          </div>
          <div className="bg-overlay-white p-6 rounded-lg shadow-md">
            <h4 className="text-lg font-semibold mb-2 text-text-primary">Time Tracking</h4>
            <p className="text-text-secondary">Log your work hours, monitor productivity, and generate insightful reports.</p>
          </div>
          <div className="bg-overlay-white p-6 rounded-lg shadow-md">
            <h4 className="text-lg font-semibold mb-2 text-text-primary">Daily Summaries</h4>
            <p className="text-text-secondary">Get a daily summary of your tasks and time spent.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home; 