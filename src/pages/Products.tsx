import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase, Product, Profile } from '../lib/supabase';
import { Package } from 'lucide-react';

export default function Products() {
  const { user, profile } = useAuth();
  const { t } = useLanguage();
  const [products, setProducts] = useState<(Product & { farmer: Profile })[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*, farmer:profiles!products_farmer_id_fkey(*)')
      .eq('status', 'available')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching products:', error);
    } else {
      setProducts(data || []);
    }
    setLoading(false);
  };

  const filteredProducts = products.filter((product) => {
    if (filter === 'all') return true;
    return product.unit === filter;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-800 mb-4 flex items-center gap-3">
            <Package className="w-10 h-10 text-green-600" />
            {t('products')}
          </h1>

          {!user && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-blue-100 border border-blue-300 text-blue-800 p-4 rounded-lg mb-6"
            >
              <p>
                {t('login')} or {t('signup')} to make offers on products.{' '}
                <Link to="/login" className="font-semibold underline">
                  {t('login')}
                </Link>{' '}
                |{' '}
                <Link to="/signup" className="font-semibold underline">
                  {t('signup')}
                </Link>
              </p>
            </motion.div>
          )}

          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'all'
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('kg')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'kg'
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Kg
            </button>
            <button
              onClick={() => setFilter('quintal')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'quintal'
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Quintal
            </button>
            <button
              onClick={() => setFilter('ton')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'ton'
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Ton
            </button>
          </div>
        </motion.div>

        {loading ? (
          <p className="text-gray-600">Loading...</p>
        ) : filteredProducts.length === 0 ? (
          <p className="text-gray-600">{t('noProducts')}</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} t={t} user={user} profile={profile} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ProductCard({
  product,
  index,
  t,
  user,
  profile,
}: {
  product: Product & { farmer: Profile };
  index: number;
  t: (key: string) => string;
  user: any;
  profile: any;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -5, scale: 1.02 }}
      className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all"
    >
      <div className="mb-4">
        <h3 className="text-xl font-bold text-gray-800 mb-2">{product.name}</h3>
        <p className="text-gray-600 text-sm mb-3">{product.description}</p>
        <div className="border-t border-gray-200 pt-3">
          <p className="text-sm text-gray-600 font-medium">{t('farmerContact')}:</p>
          <p className="text-sm text-gray-800">{product.farmer.full_name}</p>
          {product.farmer.phone && (
            <p className="text-sm text-gray-600">📞 {product.farmer.phone}</p>
          )}
          {product.farmer.address && (
            <p className="text-sm text-gray-600">📍 {product.farmer.address}</p>
          )}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-xs text-gray-600 mb-1">{t('quantity')}</p>
          <p className="font-bold text-gray-800">{product.quantity} {product.unit}</p>
        </div>
        <div className="bg-green-50 p-3 rounded-lg">
          <p className="text-xs text-gray-600 mb-1">{t('basePrice')}</p>
          <p className="font-bold text-green-600">₹{product.base_price}</p>
          <p className="text-xs text-gray-600">{t('perUnit')}</p>
        </div>
      </div>
      {user && profile?.role === 'buyer' && (
        <Link
          to="/buyer-dashboard"
          className="block w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold text-center"
        >
          {t('makeOffer')}
        </Link>
      )}
      {!user && (
        <Link
          to="/login"
          className="block w-full bg-gray-400 text-white px-4 py-3 rounded-lg hover:bg-gray-500 transition-colors font-semibold text-center"
        >
          {t('login')} to offer
        </Link>
      )}
    </motion.div>
  );
}
