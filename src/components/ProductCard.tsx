import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { FaArrowLeft } from '@react-icons/all-files/fa/FaArrowLeft';

interface ProductCardProps {
  id: string;
  name: string;
  image: string;
  images?: string[]; // Multiple images for random selection
  size?: string; // Legacy - Main size like "55""
  features?: string[]; // Max 4 features
  price?: {
    current: string;
    suggested?: string | null;
  };
  availableSizes?: string[];
  learn_more: string;
  onLearnMore: (product: any) => void;
  onCompare: (product: any) => void;
  isCompared: boolean;
  maxComparisonsReached: boolean;
  // Legacy props for compatibility
  specs?: { [key: string]: string };
  // Old format compatibility
  topFeatures?: string[];
  tvType?: string;
}

export default function ProductCard({
  id,
  name,
  image,
  images = [],
  size, // Legacy prop
  features = [],
  price,
  availableSizes = [],
  learn_more,
  onLearnMore,
  onCompare,
  isCompared,
  maxComparisonsReached,
  specs = {},
  // Legacy compatibility
  topFeatures = [],
  tvType,
}: ProductCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [backImage, setBackImage] = useState(image);
  
  // Fallback logic for backward compatibility
  const displayName = name || tvType || 'Samsung TV';
  const displayFeatures = features.length > 0 ? features.slice(0, 4) : topFeatures.slice(0, 4);
  const defaultImage = 'https://images.samsung.com/is/image/samsung/assets/us/tvs/default-samsung-tv.jpg';
  const displayImages = images && images.length > 0 
    ? images.filter(img => img && img.trim() !== '') 
    : [image || defaultImage];
  const displayAvailableSizes = availableSizes.length > 0 ? availableSizes.slice(0, 10) : ['55"'];
  
  // Handle price - support both old and new formats
  const displayPrice = price || {
    current: specs?.Price || '$999',
    suggested: null
  };
  
  // Get random image for back side
  const getRandomImage = () => {
    if (displayImages.length <= 1) {
      return displayImages[0] || image || defaultImage;
    }
    
    const availableImages = displayImages.filter(img => img && img.trim() !== '' && img !== image);
    if (availableImages.length === 0) {
      return displayImages[0] || image || defaultImage;
    }
    
    return availableImages[Math.floor(Math.random() * availableImages.length)];
  };

  const compareClass = isCompared
    ? 'text-green-600 opacity-100 cursor-pointer'
    : maxComparisonsReached
    ? 'opacity-0 pointer-events-none'
    : 'opacity-0 group-hover:opacity-100 cursor-pointer';
  
  const style = maxComparisonsReached && !isCompared ? { opacity: 0 } : {};

  const handleFlip = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isFlipped) {
      setBackImage(getRandomImage()); // Set random image only when flipping to back
    }
    setIsFlipped(!isFlipped);
  };

  // Check if current price is lower than suggested
  const hasDiscount = displayPrice.suggested && 
    parseFloat(displayPrice.current.replace(/[^0-9.]/g, '')) < parseFloat(displayPrice.suggested.replace(/[^0-9.]/g, ''));

  return (
    <div className="h-[650px] rounded-3xl overflow-hidden" style={{ perspective: '1000px' }}>
      <motion.div
        className="relative w-full h-full cursor-pointer"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        style={{ transformStyle: "preserve-3d" }}
        onClick={handleFlip}
      >
        {/* Front Side */}
        <motion.div
          className="absolute inset-0 bg-white text-black rounded-3xl flex flex-col relative group"
          style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1), 0 8px 32px rgba(0, 0, 0, 0.08)',
            backfaceVisibility: 'hidden',
            height: '650px',
          }}
          whileHover={!isFlipped ? {
            scale: 1.03,
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15), 0 10px 40px rgba(0, 0, 0, 0.12)',
          } : {}}
          transition={{ duration: 0.3 }}
        >
          {/* Compare Button */}
          <motion.div
            className={`absolute top-4 right-4 z-10 ${compareClass}`}
            style={style}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.stopPropagation();
              if (isCompared) {
                onCompare({ id, name: displayName, image, availableSizes: displayAvailableSizes, features: displayFeatures, price: displayPrice, learn_more, remove: true });
              } else if (!maxComparisonsReached) {
                onCompare({ id, name: displayName, image, availableSizes: displayAvailableSizes, features: displayFeatures, price: displayPrice, learn_more });
              }
            }}
          >
            <div className={`px-3 py-1 rounded-full font-semibold text-xs transition-all duration-200 ${
              isCompared 
                ? 'bg-green-100 text-green-700 border border-green-200' 
                : 'bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100'
            }`}>
              {isCompared ? '✓ Added' : '+ Compare'}
            </div>
          </motion.div>

          {/* Content Section */}
          <div className="flex flex-col h-full">
            {/* Hero Image Section */}
            <div className="relative w-full h-60 flex items-center justify-center p-6 bg-gradient-to-br from-gray-50 to-white">
              <img
                src={image || defaultImage}
                alt={displayName}
                className="w-full h-full object-contain"
                style={{ objectFit: 'contain' }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (target.src !== defaultImage) {
                    target.src = defaultImage;
                  }
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent pointer-events-none" />
            </div>

            {/* Content Layout */}
            <div className="flex-1 flex flex-col justify-between px-6 py-2 space-y-4">
              {/* Title and Description */}
              <div className="text-center">
                <h2 className="text-xl font-bold text-gray-900 leading-tight tracking-tight">
                  {displayName}
                </h2>
                <p className="text-sm text-gray-700 leading-relaxed line-clamp-2">
                  {learn_more}
                </p>
              </div>

              {/* Available Sizes */}
              {displayAvailableSizes.length > 0 && (
                <div className="flex justify-center">
                  <div className="grid grid-cols-5 gap-2">
                    {displayAvailableSizes.map((sizeOption, idx) => (
                      <div key={idx} className="group relative">
                        <div className="bg-white border border-gray-300 rounded-lg px-2 py-1 text-center transition-all duration-200 hover:bg-gray-900 hover:text-white">
                          <span className="text-sm font-medium">{sizeOption}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Features */}
              {displayFeatures.length > 0 && (
                <div className="flex justify-center">
                  <div className="grid grid-cols-2 gap-2">
                    {displayFeatures.map((feature, idx) => (
                      <span
                        key={idx}
                        className="w-50 h-8 bg-gradient-to-r from-gray-800 to-gray-900 text-white text-sm font-bold px-2 py-1 rounded-lg shadow-md text-center flex items-center justify-center line-clamp-1 overflow-hidden"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Price */}
              <div className="text-center">
                <div className="flex items-baseline gap-2 flex-wrap justify-center">
                  <span className="text-2xl font-black text-gray-900">{displayPrice.current}</span>
                  {hasDiscount && displayPrice.suggested && (
                    <>
                      <span className="text-sm text-gray-400 line-through font-medium">{displayPrice.suggested}</span>
                      <span className="bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold text-xs px-2 py-2 rounded-full">
                        SAVE ${(parseFloat(displayPrice.suggested.replace(/[^0-9.]/g, '')) - parseFloat(displayPrice.current.replace(/[^0-9.]/g, ''))).toFixed(0)}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Fixed Action Buttons */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 rounded-b-3xl">
              <div className="flex justify-center">
                <motion.button
                  className="bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl"
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log('Buy Now clicked for:', displayName);
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  BUY NOW
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Back Side */}
        <motion.div
          className="absolute inset-0 bg-white text-black rounded-3xl flex flex-col"
          style={{
            background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1), 0 8px 32px rgba(0, 0, 0, 0.08)',
            transform: 'rotateY(180deg)',
            backfaceVisibility: 'hidden',
            height: '650px',
          }}
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-100 bg-white">
            <h2 className="text-2xl font-bold text-gray-900 text-center">{displayName}</h2>
          </div>
          
          {/* Content */}
          <div className="flex-1 flex flex-col px-6">
            {/* Image */}
            <div className="relative w-full h-60 flex items-center justify-center p-6 bg-gradient-to-br from-gray-50 to-white">
              <img
                src={backImage || defaultImage}
                alt={displayName}
                className="w-full h-full object-contain"
                style={{ objectFit: 'contain' }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (target.src !== defaultImage) {
                    target.src = defaultImage;
                  }
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent pointer-events-none" />
            </div>

            {/* Product Details */}
            <div className="text-center overflow-y-auto max-h-[calc(650px-60px-60px-60px)]">
              <p className="text-lg text-gray-700 leading-relaxed">
                {learn_more}
              </p>
            </div>

            {/* Spacer to push button to bottom */}
            <div className="flex-1"></div>

            {/* Fixed Action Buttons */}
            <div className="py-4 bg-gray-50 border-t border-gray-100 rounded-b-3xl">
              <div className="flex justify-center">
                <motion.button
                  className="bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl"
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log('Buy Now clicked for:', displayName);
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  BUY NOW
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}