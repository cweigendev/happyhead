'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ButtonCta } from './ui/ButtonCta';

interface HeaderProps {
  onProjectsClick?: () => void;
  onSaveClick?: () => void;
  isSaving?: boolean;
  canSave?: boolean;
}

const Header: React.FC<HeaderProps> = ({ onProjectsClick, onSaveClick, isSaving = false, canSave = false }) => {
  const pathname = usePathname();
  const isStudioPage = pathname === '/studio';
  
  return (
    <header className={`text-white ${isStudioPage ? 'pt-6 pb-2' : 'pt-16 pb-4'} px-6 relative z-50`}>
      <div className={`max-w-7xl mx-auto relative flex items-center ${isStudioPage ? 'h-24' : 'h-16'}`}>
        {/* Empty Left Side */}
        <div className="flex-1">
        </div>

        {/* Centered Navigation Menu */}
        <nav className="hidden md:flex items-center rounded-xl px-6 py-3 border shadow-lg absolute left-1/2 transform -translate-x-1/2" style={{ backgroundColor: '#09090b', borderColor: '#2e2e2e', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)' }}>
          <div className="flex items-center space-x-6">
            <Link href="/" className={`flex items-center space-x-2 transition-all duration-200 ease-out px-3 py-2 rounded-lg hover:scale-105 ${pathname === '/' ? 'text-[#df0e38]' : 'text-gray-400 hover:text-gray-300'}`}>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
              </svg>
              <span className="text-sm font-medium">Home</span>
            </Link>
            
            <Link href="/studio" className={`flex items-center space-x-2 transition-all duration-200 ease-out px-3 py-2 rounded-lg hover:scale-105 ${pathname === '/studio' ? 'text-[#df0e38]' : 'text-gray-400 hover:text-gray-300'}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
              </svg>
              <span className="text-sm font-medium">Studio</span>
            </Link>
            
{isStudioPage && onProjectsClick ? (
              <button
                onClick={onProjectsClick}
                className="flex items-center space-x-2 text-gray-400 hover:text-gray-300 transition-all duration-200 ease-out px-3 py-2 rounded-lg hover:scale-105"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
                </svg>
                <span className="text-sm font-medium">Projects</span>
              </button>
            ) : (
              <a href="#" className="flex items-center space-x-2 text-gray-400 hover:text-gray-300 transition-all duration-200 ease-out px-3 py-2 rounded-lg hover:scale-105">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
                </svg>
                <span className="text-sm font-medium">Projects</span>
              </a>
            )}
            
            <a href="#" className="flex items-center space-x-2 text-gray-400 hover:text-gray-300 transition-all duration-200 ease-out px-3 py-2 rounded-lg hover:scale-105">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
              <span className="text-sm font-medium">Contact</span>
            </a>
          </div>
        </nav>

        {/* Right Side - Save Button for Studio */}
        <div className="flex-1 flex justify-end">
          {isStudioPage && onSaveClick && (
            <div 
              className="flex items-center space-x-3"
              style={{
                position: 'fixed',
                top: '20px',
                right: '20px',
                zIndex: 60
              }}
            >
              <ButtonCta
                onClick={onSaveClick}
                label={isSaving ? "Saving..." : canSave ? "Save Project" : "Select Product"}
                disabled={isSaving || !canSave}
                className={`text-sm py-2 px-4 ${!canSave ? 'opacity-60' : ''}`}
                title={!canSave ? "Select a product first" : "Save current design"}
              />
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
