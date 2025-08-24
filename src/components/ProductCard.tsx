import { motion } from 'framer-motion';
import { useState } from 'react';

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
          <div className="w-full h-72 flex items-center justify-center mb-6 overflow-hidden relative mt-8">
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

          <h2 className="text-2xl font-bold mb-4 line-clamp-2 leading-tight text-black">{name}</h2>
          <p className="text-base mb-6 text-black flex-grow leading-relaxed">
            {Object.entries(specs).map(([k, v]) => `${k}: ${v}`).join(' • ')}
          </p>

          <div className="flex justify-center items-center gap-6 mt-auto w-full">
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
          <div className="flex justify-end items-start w-full mb-2">
            <button
              className="text-black hover:text-gray-900 font-black text-4xl px-3 py-2 rounded-lg hover:bg-gray-300 transition-all duration-200 leading-none"
              onClick={handleLearnMore}
              style={{ lineHeight: '1' }}
            >
              ←
            </button>
          </div>
          
          <h2 className="text-2xl font-black text-gray-900 mb-3">{name}</h2>
          
          <div className="w-full h-28 flex items-center justify-center mb-3 rounded-xl">
            <img
              src={image}
              alt={name}
              className="w-full h-full object-contain rounded-xl"
              style={{ objectFit: 'contain' }}
            />
          </div>

          <div className="flex-grow text-center space-y-3 w-full">
            <h3 className="text-lg font-black text-gray-900 mb-2">Product Details</h3>
            <p className="text-base text-gray-800 leading-relaxed mb-3 font-medium">
              {learn_more}
            </p>
            
            <div className="space-y-2">
              <h4 className="text-lg font-black text-gray-800 mb-2">Specifications</h4>
              {Object.entries(specs).map(([key, value]) => (
                <div key={key} className="text-sm">
                  <span className="font-bold text-gray-700">{key}: </span>
                  <span className="text-gray-800 font-medium">{value}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg py-3 px-6 rounded-xl mt-3 transition-colors duration-200"
            onClick={(e) => {
              e.stopPropagation();
              console.log('Buy Now clicked for:', name);
            }}
          >
            BUY NOW
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}