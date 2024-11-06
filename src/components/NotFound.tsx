import React from 'react';
import { Link } from 'react-router-dom';
import { Home as HomeIcon } from 'lucide-react';

export function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl mb-8">Oops! Page not found</p>
        <Link 
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <HomeIcon className="w-5 h-5" />
          Go Home
        </Link>
      </div>
    </div>
  );
}