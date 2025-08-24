import { motion } from 'framer-motion';
import { useState } from 'react';
import { FaArrowLeft } from '@react-icons/all-files/fa/FaArrowLeft';

interface ProductCardProps {
  id: string;
  name: string;
  image: string;
  specs: { [key: string]: string };
  learn_more: string;
  onLearnMore: (product: any) => void;
  onCompare: (product: any) => void;
  isCompared: boolean;
  maxComparisonsReached: boolean;
}

export default function ProductCard({
  id,
  name,
  image,
  specs,
  learn_more,
  onLearnMore,
  onCompare,
  isCompared,
  maxComparisonsReached
}: ProductCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [currentPrice, setCurrentPrice] = useState(() => {
    return Math.floor(Math.random() * (4500 - 999 + 1)) + 999;
  });
  const priceIncrease = Math.random() * 0.3 + 0.2; // 20-50% increase
  const beforePrice = Math.round(currentPrice * (1 + priceIncrease));
  const savings = beforePrice - currentPrice;

  const compareClass = isCompared
    ? 'text-green-600 opacity-100 cursor-pointer'
    : maxComparisonsReached
    ? 'opacity-0 pointer-events-none'
    : 'opacity-0 group-hover:opacity-100 cursor-pointer';
  
  const style = maxComparisonsReached && !isCompared ? { opacity: 0 } : {};

  const handleLearnMore = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFlipped(!isFlipped);
    // Don't call onLearnMore to prevent sheet from opening
  };

  const handleFlipBack = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFlipped(false);
  };

  return (
    <div className="h-full" style={{ perspective: '1000px' }}>
      <motion.div
        className="relative w-full h-full cursor-pointer"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Front Side */}
        <motion.div
          className="absolute inset-0 bg-white text-black p-8 rounded-3xl flex flex-col items-center text-center relative group border border-gray-300"
          style={{
            background: 'linear-gradient(145deg, #ffffff, #f8f9fa)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
            backfaceVisibility: 'hidden',
          }}
          whileHover={!isFlipped ? {
            scale: 1.02,
            background: 'linear-gradient(145deg, #f8f9fa, #e9ecef)',
          } : {}}
          transition={{ duration: 0.2 }}
        >
          <div className="w-full h-96 flex items-center justify-center mb-6 overflow-hidden relative mt-8">
            <img
              src={image}
              alt={name}
              className="w-full h-full object-contain rounded-xl"
              style={{ objectFit: 'contain' }}
            />
          </div>
          
          <span
            className={`absolute top-4 right-4 text-blue-600 text-base font-medium z-10 cursor-pointer ${compareClass}`}
            style={style}
            onClick={() => {
              if (isCompared) {
                onCompare({ id, name, image, specs, learn_more, remove: true });
              } else if (!maxComparisonsReached) {
                onCompare({ id, name, image, specs, learn_more });
              }
            }}
          >
            {isCompared ? '✓ Compare' : 'Compare'}
          </span>

          <h2 className="text-3xl font-extrabold mb-6 line-clamp-2 leading-tight text-black">{name}</h2>
          <p className="text-lg mb-8 text-black flex-grow leading-relaxed">
            {Object.entries(specs).map(([k, v]) => `${k}: ${v}`).join(' • ')}
          </p>

          <div className="flex flex-col items-center w-full">
            <div className="mb-4 text-center">
              <span className="text-black font-bold text-xl">${currentPrice.toFixed(2)}</span>
              {beforePrice > currentPrice && (
                <>
                  <span className="text-gray-500 text-sm line-through ml-2">${beforePrice.toFixed(2)}</span>
                  <span className="text-orange-500 font-semibold text-base ml-2">SAVE ${savings.toFixed(2)}</span>
                </>
              )}
            </div>
            <div className="flex justify-center items-center gap-6 w-full">
              <span
                className="text-blue-600 hover:text-blue-700 cursor-pointer font-semibold text-lg transition-colors duration-200"
                onClick={handleLearnMore}
              >
                Learn More
              </span>
              
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg py-3 px-6 rounded-xl transition-colors duration-200"
                onClick={(e) => {
                  e.stopPropagation();
                  console.log('Buy Now clicked for:', name);
                }}
              >
                BUY NOW
              </button>
            </div>
          </div>
        </motion.div>

        {/* Back Side */}
        <motion.div
          className="absolute inset-0 bg-gray-200 text-black p-6 rounded-3xl flex flex-col items-center text-center border-2 border-gray-400 overflow-y-auto"
          style={{
            background: 'linear-gradient(145deg, #f3f4f6, #e5e7eb)',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.15), 0 2px 10px rgba(0, 0, 0, 0.1)',
            transform: 'rotateY(180deg)',
            backfaceVisibility: 'hidden',
          }}
        >
          <div className="flex justify-end items-start w-full mb-4">
            {/* Removed top arrow button */}
          </div>
          
          <h2 className="text-3xl font-extrabold text-gray-900 mb-4">{name}</h2>
          
          <div className="w-full h-48 flex items-center justify-center mb-4 rounded-xl">
            <img
              src={image}
              alt={name}
              className="w-full h-full object-contain rounded-xl"
              style={{ objectFit: 'contain' }}
            />
          </div>

          <div className="flex-grow text-center space-y-3 w-full">
            <h3 className="text-xl font-extrabold text-gray-900 mb-3">Product Details</h3>
            <p className="text-lg text-gray-800 leading-relaxed mb-4 font-medium">
              {learn_more}
            </p>
            
            <div className="space-y-2">
              <h4 className="text-xl font-extrabold text-gray-800 mb-3">Specifications</h4>
              {Object.entries(specs).map(([key, value]) => (
                <div key={key} className="text-lg">
                  <span className="font-bold text-gray-700">{key}: </span>
                  <span className="text-gray-800 font-medium">{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-center w-full">
            <div className="mb-4 text-center">
              <span className="text-black font-bold text-xl">${currentPrice.toFixed(2)}</span>
              {beforePrice > currentPrice && (
                <>
                  <span className="text-gray-500 text-sm line-through ml-2">${beforePrice.toFixed(2)}</span>
                  <span className="text-orange-500 font-semibold text-base ml-2">SAVE ${savings.toFixed(2)}</span>
                </>
              )}
            </div>
            <div className="flex justify-center items-center gap-6 w-full">
              <span
                className="text-blue-600 hover:text-blue-700 cursor-pointer font-extrabold text-lg drop-shadow-[0_2px_2px_rgba(0,0,0,0.3)] transition-colors duration-200"
                onClick={handleFlipBack}
              >
                <FaArrowLeft className="w-6 h-6" />
              </span>
              
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg py-3 px-6 rounded-xl transition-colors duration-200"
                onClick={(e) => {
                  e.stopPropagation();
                  console.log('Buy Now clicked for:', name);
                }}
              >
                BUY NOW
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}