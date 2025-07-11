import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, User, LogOut, Sun, Moon, TrendingUp, TrendingDown, Wallet, Menu } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { stocksData } from '../data/stocksData';

const Navbar = ({ sidebarOpen, setSidebarOpen }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const navigate = useNavigate();
  const [showProfile, setShowProfile] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const searchRef = useRef(null);
  const mobileSearchRef = useRef(null);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Search functionality
  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = stocksData.filter(stock =>
        stock.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stock.sector.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 8);
      setSearchResults(filtered);
      setShowSearchResults(true);
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  }, [searchQuery]);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Don't close if clicking on search results
      if (event.target.closest('.search-result-item')) {
        return;
      }

      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }

      // For mobile search, only close if clicking outside the entire mobile search overlay
      if (showMobileSearch && !event.target.closest('.mobile-search-overlay')) {
        setShowMobileSearch(false);
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMobileSearch]);

  const handleSearchSelect = (stock) => {
    console.log('Navigating to stock:', stock.symbol); // Debug log
    try {
      navigate(`/stocks/${stock.symbol}`);
      setSearchQuery('');
      setShowSearchResults(false);
      setShowMobileSearch(false);
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchResults.length > 0) {
      handleSearchSelect(searchResults[0]);
    }
  };

  return (
    <nav className="navbar fixed top-0 left-0 right-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 z-50 h-16">
      <div className="px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Hamburger Menu Button - Mobile Only */}
            {isMobile && (
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 md:hidden min-h-[44px] min-w-[44px]"
              >
                <Menu className="w-6 h-6" />
              </button>
            )}

            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity min-h-[44px]"
            >
              <div className="w-8 h-8 bg-groww-primary rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-sm">G</span>
              </div>
              <span className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white hidden xs:inline">Groww</span>
            </button>
            
            <div className="navbar-search-container relative w-full max-w-md sm:max-w-lg md:max-w-xl lg:w-96 hidden sm:block z-50" ref={searchRef}>
              <form onSubmit={handleSearchSubmit}>
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search stocks, sectors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchQuery && setShowSearchResults(true)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-groww-primary focus:border-transparent min-h-[44px]"
                />
              </form>

              {/* Search Results Dropdown */}
              {showSearchResults && searchResults.length > 0 && (
                <div className="search-dropdown search-results bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-96 overflow-y-auto">
                  {searchResults.map((stock) => (
                    <button
                      key={stock.symbol}
                      onClick={() => handleSearchSelect(stock)}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-b-0 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <img
                            src={stock.logo}
                            alt={stock.name}
                            className="w-8 h-8 rounded-lg object-cover"
                          />
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{stock.symbol}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{stock.name}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900 dark:text-white">₹{stock.price.toLocaleString()}</p>
                          <div className={`flex items-center space-x-1 text-sm ${
                            stock.change >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {stock.change >= 0 ? (
                              <TrendingUp className="w-3 h-3" />
                            ) : (
                              <TrendingDown className="w-3 h-3" />
                            )}
                            <span>{stock.changePercent.toFixed(2)}%</span>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                  {searchQuery && searchResults.length === 0 && (
                    <div className="px-4 py-3 text-center text-gray-500 dark:text-gray-400">
                      No stocks found for "{searchQuery}"
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-4">
            {/* Mobile Search Button */}
            <button
              onClick={() => setShowMobileSearch(!showMobileSearch)}
              className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors sm:hidden min-h-[44px] min-w-[44px]"
              title="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Wallet Balance */}
            <button
              onClick={() => navigate('/wallet')}
              className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-2 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors min-h-[44px]"
              title="View Wallet"
            >
              <Wallet className="w-4 h-4 text-groww-primary flex-shrink-0" />
              <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white hidden xs:inline">
                ₹{user?.balance?.toLocaleString() || '0'}
              </span>
            </button>

            {/* Theme Toggle - Always visible */}
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors min-h-[44px] min-w-[44px]"
              title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Notifications - Hidden on mobile */}
            <button className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors min-h-[44px] min-w-[44px] hidden sm:flex">
              <Bell className="w-5 h-5" />
            </button>

            <div className="relative">
              <button
                onClick={() => setShowProfile(!showProfile)}
                className="flex items-center space-x-1 sm:space-x-2 p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors min-h-[44px]"
              >
                <User className="w-5 h-5 flex-shrink-0" />
                <span className="text-xs sm:text-sm font-medium hidden sm:inline max-w-[80px] truncate">{user?.name}</span>
              </button>
              
              {showProfile && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 py-2">
                  <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-600">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Search Overlay */}
      {showMobileSearch && (
        <div className="mobile-search-overlay fixed inset-0 bg-white dark:bg-gray-900 z-[60] sm:hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => {
                  setShowMobileSearch(false);
                  setSearchQuery('');
                  setShowSearchResults(false);
                }}
                className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div className="flex-1 relative" ref={mobileSearchRef}>
                <form onSubmit={handleSearchSubmit}>
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search stocks, sectors..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      if (e.target.value.trim()) {
                        setShowSearchResults(true);
                      }
                    }}
                    onFocus={() => {
                      if (searchQuery.trim()) {
                        setShowSearchResults(true);
                      }
                    }}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-groww-primary focus:border-transparent min-h-[44px]"
                    autoFocus
                  />
                </form>
              </div>
            </div>
          </div>

          {/* Mobile Search Results */}
          <div className="flex-1 overflow-y-auto">
            {searchResults.length > 0 && (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {searchResults.map((stock) => (
                  <button
                    key={stock.symbol}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('Mobile search result clicked:', stock.symbol);
                      handleSearchSelect(stock);
                    }}
                    className="search-result-item w-full px-4 py-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors active:bg-gray-100 dark:active:bg-gray-700"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <img
                          src={stock.logo}
                          alt={stock.name}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{stock.symbol}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{stock.name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900 dark:text-white">₹{stock.price.toLocaleString()}</p>
                        <div className={`flex items-center space-x-1 text-sm ${
                          stock.change >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {stock.change >= 0 ? (
                            <TrendingUp className="w-3 h-3" />
                          ) : (
                            <TrendingDown className="w-3 h-3" />
                          )}
                          <span>{stock.changePercent.toFixed(2)}%</span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
            {searchQuery && searchResults.length === 0 && (
              <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                No stocks found for "{searchQuery}"
              </div>
            )}
            {!searchQuery && (
              <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                Start typing to search for stocks...
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;