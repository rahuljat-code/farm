import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase, Product, Offer, Profile } from '../lib/supabase';
import { ShoppingCart, Send, X } from 'lucide-react';

export default function BuyerDashboard() {
  const { profile } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [products, setProducts] = useState<(Product & { farmer: Profile })[]>([]);
  const [myOffers, setMyOffers] = useState<(Offer & { product: Product; farmer: Profile })[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product & { farmer: Profile } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
    fetchMyOffers();
  }, [profile]);

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

  const fetchMyOffers = async () => {
    if (!profile) return;

    const { data, error } = await supabase
      .from('offers')
      .select('*, product:products(*), farmer:profiles!offers_farmer_id_fkey(*)')
      .eq('buyer_id', profile.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching offers:', error);
    } else {
      setMyOffers(data || []);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8 px-4">
      <div className="container mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-800 mb-2">{t('buyer')} {t('dashboard')}</h1>
          <p className="text-gray-600">Welcome, {profile?.full_name}</p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <ShoppingCart className="w-6 h-6" />
              {t('products')}
            </h2>
            <div className="space-y-4">
              {loading ? (
                <p className="text-gray-600">Loading...</p>
              ) : products.length === 0 ? (
                <p className="text-gray-600">{t('noProducts')}</p>
              ) : (
                products.map((product, index) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    index={index}
                    onMakeOffer={() => setSelectedProduct(product)}
                    t={t}
                  />
                ))
              )}
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">{t('myOffers')}</h2>
            <div className="space-y-4">
              {myOffers.length === 0 ? (
                <p className="text-gray-600">{t('noOffers')}</p>
              ) : (
                myOffers.map((offer, index) => (
                  <MyOfferCard
                    key={offer.id}
                    offer={offer}
                    index={index}
                    navigate={navigate}
                    t={t}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selectedProduct && (
          <OfferModal
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
            onSuccess={() => {
              setSelectedProduct(null);
              fetchMyOffers();
            }}
            t={t}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function ProductCard({
  product,
  index,
  onMakeOffer,
  t,
}: {
  product: Product & { farmer: Profile };
  index: number;
  onMakeOffer: () => void;
  t: (key: string) => string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white rounded-lg shadow-lg p-6"
    >
      <div className="mb-4">
        <h3 className="text-xl font-bold text-gray-800">{product.name}</h3>
        <p className="text-gray-600 text-sm">{product.description}</p>
        <p className="text-sm text-gray-600 mt-2">
          {t('farmer')}: {product.farmer.full_name}
        </p>
        {product.farmer.phone && (
          <p className="text-sm text-gray-600">Phone: {product.farmer.phone}</p>
        )}
        {product.farmer.address && (
          <p className="text-sm text-gray-600">Address: {product.farmer.address}</p>
        )}
      </div>
      <div className="grid grid-cols-2 gap-4 text-sm mb-4">
        <div>
          <p className="text-gray-600">{t('quantity')}</p>
          <p className="font-semibold">{product.quantity} {product.unit}</p>
        </div>
        <div>
          <p className="text-gray-600">{t('basePrice')}</p>
          <p className="font-semibold text-green-600 text-lg">₹{product.base_price}/{product.unit}</p>
        </div>
      </div>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onMakeOffer}
        className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center justify-center gap-2 shadow-lg"
      >
        <Send className="w-5 h-5" />
        {t('makeOffer')}
      </motion.button>
    </motion.div>
  );
}

function MyOfferCard({
  offer,
  index,
  navigate,
  t,
}: {
  offer: Offer & { product: Product; farmer: Profile };
  index: number;
  navigate: any;
  t: (key: string) => string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white rounded-lg shadow-lg p-6"
    >
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-800">{offer.product.name}</h3>
        <p className="text-sm text-gray-600">{t('farmer')}: {offer.farmer.full_name}</p>
      </div>
      <div className="grid grid-cols-2 gap-4 text-sm mb-4">
        <div>
          <p className="text-gray-600">{t('offerPrice')}</p>
          <p className="font-semibold">₹{offer.offer_price}/{offer.product.unit}</p>
        </div>
        <div>
          <p className="text-gray-600">{t('quantity')}</p>
          <p className="font-semibold">{offer.quantity} {offer.product.unit}</p>
        </div>
      </div>
      {offer.message && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 font-medium">{t('message')}:</p>
          <p className="text-sm text-gray-800">{offer.message}</p>
        </div>
      )}
      {offer.response_message && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-600 font-medium">{t('response')}:</p>
          <p className="text-sm text-gray-800">{offer.response_message}</p>
        </div>
      )}
      <div className="flex items-center gap-2 mb-4">
        <span
          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
            offer.status === 'pending'
              ? 'bg-yellow-100 text-yellow-800'
              : offer.status === 'accepted'
              ? 'bg-green-100 text-green-800'
              : offer.status === 'rejected'
              ? 'bg-red-100 text-red-800'
              : 'bg-blue-100 text-blue-800'
          }`}
        >
          {t(offer.status)}
        </span>
        {offer.counter_price && (
          <span className="text-sm text-gray-600">
            {t('counterPrice')}: ₹{offer.counter_price}
          </span>
        )}
      </div>
      {offer.status === 'accepted' && (
        <button
          onClick={() => navigate('/confirmation', { state: { offer } })}
          className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-semibold"
        >
          {t('confirmation')}
        </button>
      )}
    </motion.div>
  );
}

function OfferModal({
  product,
  onClose,
  onSuccess,
  t,
}: {
  product: Product & { farmer: Profile };
  onClose: () => void;
  onSuccess: () => void;
  t: (key: string) => string;
}) {
  const { profile } = useAuth();
  const [offerPrice, setOfferPrice] = useState(product.base_price);
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.from('offers').insert({
      product_id: product.id,
      buyer_id: profile!.id,
      farmer_id: product.farmer_id,
      offer_price: offerPrice,
      quantity,
      message,
    });

    if (error) {
      console.error('Error creating offer:', error);
      alert('Failed to send offer');
    } else {
      onSuccess();
    }
    setLoading(false);
  };

  const totalPrice = offerPrice * quantity;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">{t('makeOffer')}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-bold text-gray-800 mb-2">{product.name}</h3>
          <p className="text-sm text-gray-600 mb-1">{product.description}</p>
          <p className="text-sm text-gray-600">
            {t('farmer')}: {product.farmer.full_name}
          </p>
          <p className="text-sm text-gray-600">
            {t('basePrice')}: ₹{product.base_price}/{product.unit}
          </p>
          <p className="text-sm text-gray-600">
            {t('quantity')} {t('available')}: {product.quantity} {product.unit}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('offerPrice')} (₹ {t('perUnit')})
            </label>
            <input
              type="number"
              value={offerPrice}
              onChange={(e) => setOfferPrice(Number(e.target.value))}
              required
              min="0"
              step="0.01"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('quantity')} ({product.unit})
            </label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              required
              min="1"
              max={product.quantity}
              step="0.01"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('message')}
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              placeholder="Optional message to the farmer"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600">{t('total')} {t('offerPrice')}:</p>
            <p className="text-2xl font-bold text-blue-600">₹{totalPrice.toFixed(2)}</p>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending...' : t('sendOffer')}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 transition-colors font-semibold"
            >
              {t('cancel')}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
