import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh]">
      <h1 className="text-6xl font-bold text-text-primary mb-4">404</h1>
      <h2 className="text-3xl font-semibold text-text-secondary mb-6">Page Not Found</h2>
      <p className="text-lg text-text-secondary mb-8">
        The page you are looking for doesn't exist.
      </p>
      <Link
        to="/"
        className="bg-button hover:bg-white hover:text-button border border-button text-white font-bold py-2 px-6 rounded-lg transition-colors duration-200"
      >
        Go Home
      </Link>
    </div>
  );
};

export default NotFound; 