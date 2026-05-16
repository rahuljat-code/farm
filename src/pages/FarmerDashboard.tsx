import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase, Product, Offer, Profile } from '../lib/supabase';
import { Plus, Edit2, Trash2, Package, X } from 'lucide-react';

export default function FarmerDashboard() {
  const { profile } = useAuth();
  const { t } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [offers, setOffers] = useState<(Offer & { product: Product; buyer: Profile })[]>([]);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
    fetchOffers();
  }, [profile]);

  const fetchProducts = async () => {
    if (!profile) return;

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('farmer_id', profile.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching products:', error);
    } else {
      setProducts(data || []);
    }
    setLoading(false);
  };

  const fetchOffers = async () => {
    if (!profile) return;

    const { data, error } = await supabase
      .from('offers')
      .select('*, product:products(*), buyer:profiles!offers_buyer_id_fkey(*)')
      .eq('farmer_id', profile.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching offers:', error);
    } else {
      setOffers(data || []);
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    const { error } = await supabase.from('products').delete().eq('id', id);

    if (error) {
      console.error('Error deleting product:', error);
    } else {
      fetchProducts();
    }
  };

  const handleOfferResponse = async (offerId: string, status: 'accepted' | 'rejected', counterPrice?: number, responseMessage?: string) => {
    const updateData: any = { status };
    if (counterPrice) updateData.counter_price = counterPrice;
    if (responseMessage) updateData.response_message = responseMessage;

    const { error } = await supabase
      .from('offers')
      .update(updateData)
      .eq('id', offerId);

    if (error) {
      console.error('Error updating offer:', error);
    } else {
      fetchOffers();
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
          <h1 className="text-4xl font-bold text-gray-800 mb-2">{t('farmer')} {t('dashboard')}</h1>
          <p className="text-gray-600">Welcome, {profile?.full_name}</p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Package className="w-6 h-6" />
                {t('myProducts')}
              </h2>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setEditingProduct(null);
                  setShowProductForm(true);
                }}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 shadow-lg"
              >
                <Plus className="w-5 h-5" />
                {t('addProduct')}
              </motion.button>
            </div>

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
                    onEdit={() => {
                      setEditingProduct(product);
                      setShowProductForm(true);
                    }}
                    onDelete={() => deleteProduct(product.id)}
                    t={t}
                  />
                ))
              )}
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">{t('receivedOffers')}</h2>
            <div className="space-y-4">
              {offers.length === 0 ? (
                <p className="text-gray-600">{t('noOffers')}</p>
              ) : (
                offers.map((offer, index) => (
                  <OfferCard
                    key={offer.id}
                    offer={offer}
                    index={index}
                    onRespond={handleOfferResponse}
                    t={t}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showProductForm && (
          <ProductFormModal
            product={editingProduct}
            onClose={() => {
              setShowProductForm(false);
              setEditingProduct(null);
            }}
            onSave={() => {
              setShowProductForm(false);
              setEditingProduct(null);
              fetchProducts();
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
  onEdit,
  onDelete,
  t,
}: {
  product: Product;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
  t: (key: string) => string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white rounded-lg shadow-lg p-6"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-800">{product.name}</h3>
          <p className="text-gray-600 text-sm">{product.description}</p>
        </div>
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onEdit}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Edit2 className="w-5 h-5" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onDelete}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-gray-600">{t('quantity')}</p>
          <p className="font-semibold">{product.quantity} {product.unit}</p>
        </div>
        <div>
          <p className="text-gray-600">{t('basePrice')}</p>
          <p className="font-semibold">₹{product.base_price}/{product.unit}</p>
        </div>
        <div>
          <p className="text-gray-600">{t('minimumPrice')}</p>
          <p className="font-semibold">₹{product.minimum_price}/{product.unit}</p>
        </div>
        <div>
          <p className="text-gray-600">{t('status')}</p>
          <span
            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
              product.status === 'available'
                ? 'bg-green-100 text-green-800'
                : product.status === 'sold'
                ? 'bg-gray-100 text-gray-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {t(product.status)}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

function OfferCard({
  offer,
  index,
  onRespond,
  t,
}: {
  offer: Offer & { product: Product; buyer: Profile };
  index: number;
  onRespond: (offerId: string, status: 'accepted' | 'rejected', counterPrice?: number, responseMessage?: string) => void;
  t: (key: string) => string;
}) {
  const [showCounterForm, setShowCounterForm] = useState(false);
  const [counterPrice, setCounterPrice] = useState(offer.product.base_price);
  const [responseMessage, setResponseMessage] = useState('');

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white rounded-lg shadow-lg p-6"
    >
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-800">{offer.product.name}</h3>
        <p className="text-sm text-gray-600">{t('buyer')}: {offer.buyer.full_name}</p>
        {offer.buyer.phone && <p className="text-sm text-gray-600">Phone: {offer.buyer.phone}</p>}
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
      {offer.status === 'pending' && !showCounterForm && (
        <div className="flex gap-2">
          <button
            onClick={() => onRespond(offer.id, 'accepted')}
            className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-semibold"
          >
            {t('accept')}
          </button>
          <button
            onClick={() => setShowCounterForm(true)}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold"
          >
            {t('counter')}
          </button>
          <button
            onClick={() => onRespond(offer.id, 'rejected')}
            className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-semibold"
          >
            {t('reject')}
          </button>
        </div>
      )}
      {showCounterForm && (
        <div className="mt-4 space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('counterPrice')}
            </label>
            <input
              type="number"
              value={counterPrice}
              onChange={(e) => setCounterPrice(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('response')}
            </label>
            <textarea
              value={responseMessage}
              onChange={(e) => setResponseMessage(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                onRespond(offer.id, 'countered', counterPrice, responseMessage);
                setShowCounterForm(false);
              }}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold"
            >
              {t('submit')}
            </button>
            <button
              onClick={() => setShowCounterForm(false)}
              className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors text-sm font-semibold"
            >
              {t('cancel')}
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}

function ProductFormModal({
  product,
  onClose,
  onSave,
  t,
}: {
  product: Product | null;
  onClose: () => void;
  onSave: () => void;
  t: (key: string) => string;
}) {
  const { profile } = useAuth();
  const [name, setName] = useState(product?.name || '');
  const [description, setDescription] = useState(product?.description || '');
  const [quantity, setQuantity] = useState(product?.quantity || 0);
  const [unit, setUnit] = useState(product?.unit || 'kg');
  const [basePrice, setBasePrice] = useState(product?.base_price || 0);
  const [minimumPrice, setMinimumPrice] = useState(product?.minimum_price || 0);
  const [status, setStatus] = useState(product?.status || 'available');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const productData = {
      name,
      description,
      quantity,
      unit,
      base_price: basePrice,
      minimum_price: minimumPrice,
      status,
      farmer_id: profile!.id,
    };

    if (product) {
      const { error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', product.id);

      if (error) console.error('Error updating product:', error);
      else onSave();
    } else {
      const { error } = await supabase.from('products').insert(productData);

      if (error) console.error('Error creating product:', error);
      else onSave();
    }
  };

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
        className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {product ? t('editProduct') : t('addProduct')}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('productName')}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('description')}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('quantity')}
              </label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                required
                min="0"
                step="0.01"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('unit')}
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="kg">kg</option>
                <option value="quintal">quintal</option>
                <option value="ton">ton</option>
                <option value="piece">piece</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('basePrice')} (₹)
              </label>
              <input
                type="number"
                value={basePrice}
                onChange={(e) => setBasePrice(Number(e.target.value))}
                required
                min="0"
                step="0.01"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('minimumPrice')} (₹)
              </label>
              <input
                type="number"
                value={minimumPrice}
                onChange={(e) => setMinimumPrice(Number(e.target.value))}
                required
                min="0"
                step="0.01"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('status')}
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="available">{t('available')}</option>
              <option value="unavailable">{t('unavailable')}</option>
              <option value="sold">{t('sold')}</option>
            </select>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold"
            >
              {t('save')}
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
