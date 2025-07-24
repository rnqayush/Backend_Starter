import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { 
  MagnifyingGlassIcon, 
  UserIcon, 
  Bars3Icon,
  XMarkIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import { 
  selectCurrentUser, 
  selectIsAuthenticated 
} from '../../store/slices/authSlice';
import { 
  selectMobileMenuOpen,
  toggleMobileMenu,
  setMobileMenuOpen 
} from '../../store/slices/uiSlice';
import { useLogoutMutation } from '../../store/api/authApi';
import { logout } from '../../store/slices/authSlice';
import SearchModal from '../search/SearchModal';

const Header = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const mobileMenuOpen = useSelector(selectMobileMenuOpen);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  
  const [logoutMutation] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      await logoutMutation().unwrap();
      dispatch(logout());
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
      // Force logout even if API call fails
      dispatch(logout());
      navigate('/');
    }
  };

  const categories = [
    { name: 'Hotels', href: '/hotels', icon: '🏨' },
    { name: 'Shopping', href: '/shop', icon: '🛒' },
    { name: 'Automobiles', href: '/automobiles', icon: '🚗' },
    { name: 'Weddings', href: '/weddings', icon: '💒' },
  ];

  return (
    <>
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">MV</span>
                </div>
                <span className="text-xl font-bold text-gray-900 hidden sm:block">
                  MultiVendor
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {categories.map((category) => (
                <Link
                  key={category.name}
                  to={category.href}
                  className="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium transition-colors duration-200"
                >
                  <span className="mr-1">{category.icon}</span>
                  {category.name}
                </Link>
              ))}
            </nav>

            {/* Search and User Actions */}
            <div className="flex items-center space-x-4">
              {/* Search Button */}
              <button
                onClick={() => setSearchModalOpen(true)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                aria-label="Search"
              >
                <MagnifyingGlassIcon className="w-5 h-5" />
              </button>

              {/* User Menu */}
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition-colors duration-200"
                  >
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                      <UserIcon className="w-4 h-4 text-primary-600" />
                    </div>
                    <span className="hidden sm:block text-sm font-medium">
                      {user?.name || 'User'}
                    </span>
                    <ChevronDownIcon className="w-4 h-4" />
                  </button>

                  {/* User Dropdown */}
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                      <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-200">
                        <p className="font-medium">{user?.name}</p>
                        <p className="text-gray-500">{user?.email}</p>
                      </div>
                      
                      {user?.role === 'vendor' && (
                        <Link
                          to={`/owner/${user.businessType || 'hotel'}`}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          Dashboard
                        </Link>
                      )}
                      
                      {user?.role === 'admin' && (
                        <Link
                          to="/admin"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          Admin Panel
                        </Link>
                      )}
                      
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        Profile
                      </Link>
                      
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link
                    to="/login"
                    className="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium transition-colors duration-200"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/register"
                    className="btn-primary btn-sm"
                  >
                    Sign up
                  </Link>
                </div>
              )}

              {/* Mobile menu button */}
              <button
                onClick={() => dispatch(toggleMobileMenu())}
                className="md:hidden p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <XMarkIcon className="w-6 h-6" />
                ) : (
                  <Bars3Icon className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {categories.map((category) => (
                <Link
                  key={category.name}
                  to={category.href}
                  className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md transition-colors duration-200"
                  onClick={() => dispatch(setMobileMenuOpen(false))}
                >
                  <span className="mr-2">{category.icon}</span>
                  {category.name}
                </Link>
              ))}
              
              {!isAuthenticated && (
                <div className="pt-4 border-t border-gray-200">
                  <Link
                    to="/login"
                    className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md"
                    onClick={() => dispatch(setMobileMenuOpen(false))}
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/register"
                    className="block px-3 py-2 text-base font-medium text-primary-600 hover:bg-gray-50 rounded-md"
                    onClick={() => dispatch(setMobileMenuOpen(false))}
                  >
                    Sign up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Search Modal */}
      <SearchModal 
        isOpen={searchModalOpen} 
        onClose={() => setSearchModalOpen(false)} 
      />
    </>
  );
};

export default Header;

