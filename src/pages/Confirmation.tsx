import { motion } from 'framer-motion';
import { useLocation, Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { CheckCircle, Package, User, Phone, MapPin, DollarSign } from 'lucide-react';

export default function Confirmation() {
  const location = useLocation();
  const { t } = useLanguage();
  const { offer } = location.state || {};

  if (!offer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No offer data available</p>
          <Link to="/" className="text-green-600 hover:text-green-700 font-semibold">
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  const totalAmount = offer.offer_price * offer.quantity;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12 px-4">
      <div className="container mx-auto max-w-3xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-2xl p-8 md:p-12"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="flex justify-center mb-6"
          >
            <div className="bg-green-100 rounded-full p-6">
              <CheckCircle className="w-20 h-20 text-green-600" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              {t('congratulations')}
            </h1>
            <p className="text-xl text-gray-600">{t('dealAccepted')}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-6"
          >
            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Package className="w-6 h-6 text-green-600" />
                {t('dealDetails')}
              </h2>

              <div className="space-y-4">
                <DetailRow
                  icon={<Package className="w-5 h-5 text-gray-600" />}
                  label={t('productName')}
                  value={offer.product.name}
                />
                <DetailRow
                  icon={<User className="w-5 h-5 text-gray-600" />}
                  label={t('farmer')}
                  value={offer.farmer.full_name}
                />
                {offer.farmer.phone && (
                  <DetailRow
                    icon={<Phone className="w-5 h-5 text-gray-600" />}
                    label={t('phone')}
                    value={offer.farmer.phone}
                  />
                )}
                {offer.farmer.address && (
                  <DetailRow
                    icon={<MapPin className="w-5 h-5 text-gray-600" />}
                    label={t('address')}
                    value={offer.farmer.address}
                  />
                )}
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <DollarSign className="w-6 h-6 text-green-600" />
                Deal Summary
              </h3>
              <div className="bg-gray-50 rounded-lg p-6 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">{t('quantity')}</span>
                  <span className="font-semibold text-gray-800">
                    {offer.quantity} {offer.product.unit}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">{t('offerPrice')} ({t('perUnit')})</span>
                  <span className="font-semibold text-gray-800">₹{offer.offer_price}</span>
                </div>
                <div className="border-t border-gray-300 pt-3 flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-800">{t('total')}</span>
                  <span className="text-2xl font-bold text-green-600">
                    ₹{totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {offer.message && (
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-bold text-gray-800 mb-2">Your {t('message')}</h3>
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-gray-800">{offer.message}</p>
                </div>
              </div>
            )}

            {offer.response_message && (
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-bold text-gray-800 mb-2">
                  Farmer's {t('response')}
                </h3>
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-gray-800">{offer.response_message}</p>
                </div>
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-8 pt-6 border-t border-gray-200"
          >
            <p className="text-center text-gray-600 mb-6">
              Please contact the farmer directly to arrange delivery and payment.
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                to="/buyer-dashboard"
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
              >
                Back to Dashboard
              </Link>
              <Link
                to="/products"
                className="px-6 py-3 bg-white text-green-600 border-2 border-green-600 rounded-lg hover:bg-green-50 transition-colors font-semibold"
              >
                Browse More Products
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-1">{icon}</div>
      <div className="flex-1">
        <p className="text-sm text-gray-600 mb-1">{label}</p>
        <p className="font-semibold text-gray-800">{value}</p>
      </div>
    </div>
  );
}
