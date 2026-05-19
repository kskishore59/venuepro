import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, ArrowLeft, Search } from 'lucide-react';
import { SEO } from '../components/ui/SEO';

export const NotFound: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <SEO title="Page Not Found" description="The requested page could not be found." />
      <div className="max-w-md w-full text-center space-y-6">
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-primary/10 rounded-full blur-2xl animate-pulse"></div>
          <div className="relative bg-white border border-slate-100 shadow-xl rounded-full w-24 h-24 flex items-center justify-center mx-auto text-primary">
            <Search className="w-10 h-10" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">404</h1>
          <h2 className="text-xl font-bold text-slate-800">Page not found</h2>
          <p className="text-slate-500 text-sm">
            We couldn't find the page you were looking for. It might have been moved, deleted, or never existed.
          </p>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button 
            onClick={() => navigate(-1)} 
            className="w-full sm:w-auto px-5 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold text-sm rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-colors flex items-center justify-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Go Back
          </button>
          
          <Link 
            to={user ? "/dashboard" : "/"} 
            className="w-full sm:w-auto px-5 py-2.5 btn-brand font-bold text-sm rounded-xl flex items-center justify-center"
          >
            <Home className="w-4 h-4 mr-2" /> Go to {user ? 'Dashboard' : 'Home'}
          </Link>
        </div>
      </div>
    </div>
  );
};
