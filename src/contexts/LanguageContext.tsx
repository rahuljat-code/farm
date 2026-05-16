import { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'hi';

interface Translations {
  [key: string]: {
    en: string;
    hi: string;
  };
}

const translations: Translations = {
  appName: { en: 'Farm Connect', hi: 'फार्म कनेक्ट' },
  home: { en: 'Home', hi: 'होम' },
  products: { en: 'Products', hi: 'उत्पाद' },
  login: { en: 'Login', hi: 'लॉगिन' },
  signup: { en: 'Sign Up', hi: 'साइन अप' },
  logout: { en: 'Logout', hi: 'लॉगआउट' },
  dashboard: { en: 'Dashboard', hi: 'डैशबोर्ड' },

  tagline: { en: 'Connecting Farmers and Buyers Directly', hi: 'किसानों और खरीदारों को सीधे जोड़ना' },
  getStarted: { en: 'Get Started', hi: 'शुरू करें' },
  learnMore: { en: 'Learn More', hi: 'और जानें' },

  email: { en: 'Email', hi: 'ईमेल' },
  password: { en: 'Password', hi: 'पासवर्ड' },
  fullName: { en: 'Full Name', hi: 'पूरा नाम' },
  phone: { en: 'Phone Number', hi: 'फ़ोन नंबर' },
  address: { en: 'Address', hi: 'पता' },
  role: { en: 'Role', hi: 'भूमिका' },
  farmer: { en: 'Farmer', hi: 'किसान' },
  buyer: { en: 'Buyer', hi: 'खरीदार' },

  productName: { en: 'Product Name', hi: 'उत्पाद का नाम' },
  description: { en: 'Description', hi: 'विवरण' },
  quantity: { en: 'Quantity', hi: 'मात्रा' },
  unit: { en: 'Unit', hi: 'इकाई' },
  basePrice: { en: 'Base Price', hi: 'आधार मूल्य' },
  minimumPrice: { en: 'Minimum Price', hi: 'न्यूनतम मूल्य' },
  status: { en: 'Status', hi: 'स्थिति' },
  available: { en: 'Available', hi: 'उपलब्ध' },
  sold: { en: 'Sold', hi: 'बिक गया' },
  unavailable: { en: 'Unavailable', hi: 'अनुपलब्ध' },

  addProduct: { en: 'Add Product', hi: 'उत्पाद जोड़ें' },
  editProduct: { en: 'Edit Product', hi: 'उत्पाद संपादित करें' },
  deleteProduct: { en: 'Delete Product', hi: 'उत्पाद हटाएं' },
  myProducts: { en: 'My Products', hi: 'मेरे उत्पाद' },

  makeOffer: { en: 'Make Offer', hi: 'प्रस्ताव दें' },
  offerPrice: { en: 'Offer Price', hi: 'प्रस्ताव मूल्य' },
  sendOffer: { en: 'Send Offer', hi: 'प्रस्ताव भेजें' },
  myOffers: { en: 'My Offers', hi: 'मेरे प्रस्ताव' },
  receivedOffers: { en: 'Received Offers', hi: 'प्राप्त प्रस्ताव' },

  pending: { en: 'Pending', hi: 'लंबित' },
  accepted: { en: 'Accepted', hi: 'स्वीकृत' },
  rejected: { en: 'Rejected', hi: 'अस्वीकृत' },
  countered: { en: 'Countered', hi: 'काउंटर किया' },

  accept: { en: 'Accept', hi: 'स्वीकार करें' },
  reject: { en: 'Reject', hi: 'अस्वीकार करें' },
  counter: { en: 'Counter', hi: 'काउंटर करें' },
  counterPrice: { en: 'Counter Price', hi: 'काउंटर मूल्य' },

  message: { en: 'Message', hi: 'संदेश' },
  response: { en: 'Response', hi: 'जवाब' },

  confirmation: { en: 'Confirmation', hi: 'पुष्टि' },
  dealDetails: { en: 'Deal Details', hi: 'सौदे का विवरण' },
  congratulations: { en: 'Congratulations!', hi: 'बधाई हो!' },
  dealAccepted: { en: 'Your deal has been accepted', hi: 'आपका सौदा स्वीकार कर लिया गया है' },

  save: { en: 'Save', hi: 'सहेजें' },
  cancel: { en: 'Cancel', hi: 'रद्द करें' },
  submit: { en: 'Submit', hi: 'जमा करें' },
  close: { en: 'Close', hi: 'बंद करें' },

  noProducts: { en: 'No products available', hi: 'कोई उत्पाद उपलब्ध नहीं' },
  noOffers: { en: 'No offers yet', hi: 'अभी तक कोई प्रस्ताव नहीं' },

  farmerContact: { en: 'Farmer Contact', hi: 'किसान संपर्क' },
  buyerContact: { en: 'Buyer Contact', hi: 'खरीदार संपर्क' },

  dontHaveAccount: { en: "Don't have an account?", hi: 'खाता नहीं है?' },
  alreadyHaveAccount: { en: 'Already have an account?', hi: 'पहले से खाता है?' },

  welcomeBack: { en: 'Welcome Back', hi: 'वापसी पर स्वागत है' },
  createAccount: { en: 'Create Account', hi: 'खाता बनाएं' },

  perUnit: { en: 'per unit', hi: 'प्रति इकाई' },
  total: { en: 'Total', hi: 'कुल' },
};

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('en');

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'en' ? 'hi' : 'en'));
  };

  const t = (key: string): string => {
    return translations[key]?.[language] || key;
  };

  const value = {
    language,
    toggleLanguage,
    t,
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};
