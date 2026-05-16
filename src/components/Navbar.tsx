import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Sprout, Menu, X, LogOut, Languages } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const { user, profile, signOut } = useAuth();
  const { t, toggleLanguage, language } = useLanguage();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    setMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl text-green-600">
            <Sprout className="w-8 h-8" />
            <span>{t('appName')}</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              className="text-gray-700 hover:text-green-600 transition-colors font-medium"
            >
              {t('home')}
            </Link>
            <Link
              to="/products"
              className="text-gray-700 hover:text-green-600 transition-colors font-medium"
            >
              {t('products')}
            </Link>

            {user && profile && (
              <Link
                to={profile.role === 'farmer' ? '/farmer-dashboard' : '/buyer-dashboard'}
                className="text-gray-700 hover:text-green-600 transition-colors font-medium"
              >
                {t('dashboard')}
              </Link>
            )}

            <button
              onClick={toggleLanguage}
              className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-green-600 transition-colors font-medium"
              title="Toggle Language"
            >
              <Languages className="w-5 h-5" />
              <span className="text-sm">{language === 'en' ? 'EN' : 'हि'}</span>
            </button>

            {user ? (
              <div className="flex items-center gap-4">
                <span className="text-gray-600 text-sm">
                  {profile?.full_name} ({t(profile?.role || '')})
                </span>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSignOut}
                  className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  {t('logout')}
                </motion.button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link
                  to="/login"
                  className="text-green-600 hover:text-green-700 transition-colors font-medium"
                >
                  {t('login')}
                </Link>
                <Link
                  to="/signup"
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  {t('signup')}
                </Link>
              </div>
            )}
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-700 hover:text-green-600 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden py-4 space-y-4 border-t border-gray-200"
          >
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-gray-700 hover:text-green-600 transition-colors font-medium"
            >
              {t('home')}
            </Link>
            <Link
              to="/products"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-gray-700 hover:text-green-600 transition-colors font-medium"
            >
              {t('products')}
            </Link>

            {user && profile && (
              <Link
                to={profile.role === 'farmer' ? '/farmer-dashboard' : '/buyer-dashboard'}
                onClick={() => setMobileMenuOpen(false)}
                className="block text-gray-700 hover:text-green-600 transition-colors font-medium"
              >
                {t('dashboard')}
              </Link>
            )}

            <button
              onClick={() => {
                toggleLanguage();
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 text-gray-700 hover:text-green-600 transition-colors font-medium"
            >
              <Languages className="w-5 h-5" />
              <span>{language === 'en' ? 'Switch to Hindi' : 'अंग्रेजी में बदलें'}</span>
            </button>

            {user ? (
              <div className="space-y-2 pt-2 border-t border-gray-200">
                <p className="text-gray-600 text-sm">
                  {profile?.full_name} ({t(profile?.role || '')})
                </p>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors w-full justify-center"
                >
                  <LogOut className="w-4 h-4" />
                  {t('logout')}
                </button>
              </div>
            ) : (
              <div className="space-y-2 pt-2 border-t border-gray-200">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-center text-green-600 hover:text-green-700 transition-colors font-medium"
                >
                  {t('login')}
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-center bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  {t('signup')}
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </nav>
  );
}
