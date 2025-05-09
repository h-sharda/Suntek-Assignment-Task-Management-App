import React from 'react';

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-300 bg-transparent py-4">
      <div className="flex justify-between items-center px-6">
        <p className="text-xs text-black">&copy; {year} Suntek AI All rights reserved.</p>
        <a
          href="https://www.linkedin.com/company/suntekai/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="linkedin"
          className="flex items-center justify-center w-8 h-8 border border-gray-400 rounded-full hover:bg-gray-100 transition-colors"
        >
          <svg
            aria-hidden="true"
            className="h-4 w-4 text-black"
            viewBox="0 0 448 512"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M100.28 448H7.4V148.9h92.88zM53.79 108.1C24.09 108.1 0 83.5 0 53.8a53.79 53.79 0 0 1 107.58 0c0 29.7-24.1 54.3-53.79 54.3zM447.9 448h-92.68V302.4c0-34.7-.7-79.2-48.29-79.2-48.29 0-55.69 37.7-55.69 76.7V448h-92.78V148.9h89.08v40.8h1.3c12.4-23.5 42.69-48.3 87.88-48.3 94 0 111.28 61.9 111.28 142.3V448z" />
          </svg>
        </a>
      </div>
    </footer>
  );
};

export default Footer;