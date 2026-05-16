import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { Sprout, Users, TrendingUp, ShoppingCart } from 'lucide-react';

export default function Home() {
  const { t } = useLanguage();
  const { user, profile } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="container mx-auto px-4 py-16"
      >
        <div className="text-center mb-16">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="inline-block mb-6"
          >
            <Sprout className="w-20 h-20 text-green-600" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-5xl md:text-6xl font-bold text-gray-800 mb-4"
          >
            {t('appName')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-xl md:text-2xl text-gray-600 mb-8"
          >
            {t('tagline')}
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap gap-4 justify-center"
          >
            {!user ? (
              <>
                <Link
                  to="/signup"
                  className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold text-lg shadow-lg hover:shadow-xl"
                >
                  {t('getStarted')}
                </Link>
                <Link
                  to="/login"
                  className="px-8 py-3 bg-white text-green-600 rounded-lg hover:bg-gray-50 transition-colors font-semibold text-lg shadow-lg hover:shadow-xl border-2 border-green-600"
                >
                  {t('login')}
                </Link>
              </>
            ) : (
              <Link
                to={profile?.role === 'farmer' ? '/farmer-dashboard' : '/buyer-dashboard'}
                className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold text-lg shadow-lg hover:shadow-xl"
              >
                {t('dashboard')}
              </Link>
            )}
          </motion.div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <FeatureCard
            icon={<Users className="w-12 h-12 text-green-600" />}
            title={t('farmer')}
            description="List your products and connect with buyers directly"
            delay={0.6}
          />
          <FeatureCard
            icon={<ShoppingCart className="w-12 h-12 text-blue-600" />}
            title={t('buyer')}
            description="Browse quality products and negotiate prices"
            delay={0.7}
          />
          <FeatureCard
            icon={<TrendingUp className="w-12 h-12 text-emerald-600" />}
            title="Fair Prices"
            description="Transparent pricing with direct negotiation"
            delay={0.8}
          />
        </div>
      </motion.div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  delay,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ y: -5, scale: 1.02 }}
      className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all"
    >
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </motion.div>
  );
}
