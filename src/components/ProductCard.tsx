import { motion } from 'framer-motion';
import { useState } from 'react';
import { FaArrowLeft } from '@react-icons/all-files/fa/FaArrowLeft';

interface ProductCardProps {
  id: string;
  name: string;
  image: string;
  images?: string[]; // Multiple images for random selection
  size?: string; // Legacy - Main size like "55""
  features?: string[]; // Max 5 features
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
  
  // Fallback logic for backward compatibility
  const displayName = name || tvType || 'Samsung TV';
  const displayFeatures = features.length > 0 ? features : topFeatures.slice(0, 5);
  const defaultImage = 'https://images.samsung.com/is/image/samsung/assets/us/tvs/default-samsung-tv.jpg';
  const displayImages = images && images.length > 0 
    ? images.filter(img => img && img.trim() !== '') 
    : [image || defaultImage];
  const displayAvailableSizes = availableSizes.length > 0 ? availableSizes : ['55"'];
  
  // Handle price - support both old and new formats
  const displayPrice = price || {
    current: specs?.Price || '$999',
    suggested: null
  };
  
  // Get random image for back side
  const getRandomImage = () => {
    const defaultImage = 'https://images.samsung.com/is/image/samsung/assets/us/tvs/default-samsung-tv.jpg';
    
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

  const handleLearnMore = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFlipped(!isFlipped);
  };

  const handleFlipBack = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFlipped(false);
  };

  // Check if current price is lower than suggested
  const hasDiscount = displayPrice.suggested && 
    parseFloat(displayPrice.current.replace(/[^0-9.]/g, '')) < parseFloat(displayPrice.suggested.replace(/[^0-9.]/g, ''));

  return (
    <div className="h-[600px]" style={{ perspective: '1000px' }}> {/* Fixed height */}
      <motion.div
        className="relative w-full h-full cursor-pointer"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Front Side */}
        <motion.div
          className="absolute inset-0 bg-white text-black p-4 rounded-3xl flex flex-col relative group border border-gray-300"
          style={{
            background: 'linear-gradient(145deg, #ffffff, #f8f9fa)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
            backfaceVisibility: 'hidden',
            height: '600px', // Fixed height
          }}
          whileHover={!isFlipped ? {
            scale: 1.02,
            background: 'linear-gradient(145deg, #f8f9fa, #e9ecef)',
          } : {}}
          transition={{ duration: 0.2 }}
        >
          {/* Compare button - Fixed position */}
          <span
            className={`absolute top-4 right-4 text-blue-600 text-base font-medium z-10 cursor-pointer ${compareClass}`}
            style={style}
            onClick={() => {
              if (isCompared) {
                onCompare({ id, name: displayName, image, availableSizes: displayAvailableSizes, features: displayFeatures, price: displayPrice, learn_more, remove: true });
              } else if (!maxComparisonsReached) {
                onCompare({ id, name: displayName, image, availableSizes: displayAvailableSizes, features: displayFeatures, price: displayPrice, learn_more });
              }
            }}
          >
            {isCompared ? '✓ Compare' : 'Compare'}
          </span>

          {/* Fixed Image Section */}
          <div className="w-full h-48 flex items-center justify-center mb-3 overflow-hidden flex-shrink-0">
            <img
              src={image || defaultImage}
              alt={displayName}
              className="w-full h-full object-contain rounded-xl"
              style={{ objectFit: 'contain' }}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (target.src !== defaultImage) {
                  target.src = defaultImage;
                }
              }}
            />
          </div>

          {/* Fixed TV Name */}
          <h2 className="text-xl font-bold mb-2 line-clamp-2 leading-tight text-black text-center flex-shrink-0">
            {displayName}
          </h2>

          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden mb-3 flex flex-col items-center">
            {/* Available Sizes */}
            {displayAvailableSizes.length > 0 && (
              <div className="mb-3 w-full">
                <p className="text-sm text-gray-700 mb-2 font-medium text-center">Available Sizes</p>
                <div className="flex flex-wrap justify-center gap-1">
                  {displayAvailableSizes.map((sizeOption, idx) => (
                    <div key={idx} className="bg-white border-2 border-black rounded-lg px-2 py-1">
                      <span className="text-black font-bold text-sm">{sizeOption}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Features Pills */}
            {displayFeatures.length > 0 && (
              <div className="mb-3 w-full">
                <div className="flex flex-wrap justify-center gap-1">
                  {displayFeatures.slice(0, 5).map((feature, idx) => (
                    <span
                      key={idx}
                      className="bg-gray-700 text-white text-xs font-medium px-2 py-1 rounded-full"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Price Section */}
            <div className="text-center w-full">
              <div className="flex items-center justify-center gap-2 flex-wrap">
                <span className="text-black font-bold text-lg">{displayPrice.current}</span>
                {hasDiscount && displayPrice.suggested && (
                  <>
                    <span className="text-gray-500 text-sm line-through">{displayPrice.suggested}</span>
                    <span className="text-orange-500 font-semibold text-sm">
                      SAVE ${(parseFloat(displayPrice.suggested.replace(/[^0-9.]/g, '')) - parseFloat(displayPrice.current.replace(/[^0-9.]/g, ''))).toFixed(0)}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Fixed Bottom Buttons */}
          <div className="flex justify-center items-center gap-4 w-full flex-shrink-0 pt-2">
            <span
              className="text-blue-600 hover:text-blue-700 cursor-pointer font-semibold text-base transition-colors duration-200"
              onClick={handleLearnMore}
            >
              Learn More
            </span>
            
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base py-2 px-4 rounded-xl transition-colors duration-200"
              onClick={(e) => {
                e.stopPropagation();
                console.log('Buy Now clicked for:', displayName);
              }}
            >
              BUY NOW
            </button>
          </div>
        </motion.div>

        {/* Back Side */}
        <motion.div
          className="absolute inset-0 bg-gray-200 text-black p-4 rounded-3xl flex flex-col border-2 border-gray-400"
          style={{
            background: 'linear-gradient(145deg, #f3f4f6, #e5e7eb)',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.15), 0 2px 10px rgba(0, 0, 0, 0.1)',
            transform: 'rotateY(180deg)',
            backfaceVisibility: 'hidden',
            height: '600px', // Fixed height
          }}
        >
          {/* Fixed TV Name */}
          <h2 className="text-xl font-bold text-gray-900 mb-3 text-center flex-shrink-0">{displayName}</h2>
          
          {/* Fixed Smaller Image */}
          <div className="w-full h-32 flex items-center justify-center mb-4 rounded-xl flex-shrink-0">
            <img
              src={getRandomImage()}
              alt={displayName}
              className="w-full h-full object-contain rounded-xl"
              style={{ objectFit: 'contain' }}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (target.src !== defaultImage) {
                  target.src = defaultImage;
                }
              }}
            />
          </div>

          {/* Scrollable Description Area */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden mb-4">
            <div className="text-center w-full h-full flex items-center justify-center">
              <p className="text-lg text-gray-800 leading-relaxed font-medium px-2">
                {learn_more}
              </p>
            </div>
          </div>

          {/* Fixed Bottom Buttons */}
          <div className="flex justify-center items-center gap-4 w-full flex-shrink-0">
            <span
              className="text-blue-600 hover:text-blue-700 cursor-pointer font-bold text-base transition-colors duration-200"
              onClick={handleFlipBack}
            >
              <FaArrowLeft className="w-5 h-5" />
            </span>
            
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base py-2 px-4 rounded-xl transition-colors duration-200"
              onClick={(e) => {
                e.stopPropagation();
                console.log('Buy Now clicked for:', displayName);
              }}
            >
              BUY NOW
            </button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}