import { motion, AnimatePresence } from 'framer-motion';
import { useRef, useEffect } from 'react';
import ProductCard from './ProductCard';
import { FaUser} from 'react-icons/fa';
import { HiSparkles } from "react-icons/hi";

interface ChatResponseProps {
  message: {
    response_text: string;
    cards?: any[];
    proactive_tip?: string;
  };
  userQuery?: string;
  index: number;
  onLearnMore: (product: any) => void;
  onCompare: (product: any) => void;
  compareProducts: any[];
  sheetOpen?: boolean;
}

export default function ChatResponse({ message, userQuery, index, onLearnMore, onCompare, compareProducts, sheetOpen }: ChatResponseProps) {
  const responseRef = useRef<HTMLDivElement>(null);
  const queryRef = useRef<HTMLDivElement>(null);

  // Samsung TV background images
  const backgroundImages = [
    'https://images.samsung.com/is/image/samsung/assets/global/hq/vd/tvs/vision-ai-tv/2025-vision-ai-tv-f07-petcare-2-dog-pc.png?imbypass=true',
    'https://images.samsung.com/is/image/samsung/assets/global/hq/vd/tvs/vision-ai-tv/2025-vision-ai-tv-f08-universal-gestures-1-tv-pc.png?imbypass=true',
    'https://images.samsung.com/is/image/samsung/p6pim/us/feature/165878546/us-feature-intelligently-enhanced-color-expression-546018666?$ORIGIN_IMG$',
    'https://images.samsung.com/is/image/samsung/p6pim/us/feature/165878561/us-feature-experience-4k-with-richer-colors-and-more-nuanced-details-546018668?$ORIGIN_IMG$',
    'https://images.samsung.com/is/image/samsung/p6pim/us/feature/165878542/us-feature-enhances-content-to-hdr-like-picture-quality-546018670?$ORIGIN_IMG$',
    'https://images.samsung.com/is/image/samsung/p6pim/us/feature/165878555/us-feature-enjoy-a-full-range-of-authentic-colors-546018674?$ORIGIN_IMG$'
  ];

  // Randomly select a background image
  const selectedBackground = backgroundImages[Math.floor(Math.random() * backgroundImages.length)];

  useEffect(() => {
    if (responseRef.current) {
      responseRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  return (
    <div ref={responseRef} className="w-full max-w-[95%] mx-auto mb-8 relative z-10">
      {/* User Query Bubble */}
      {userQuery && (
        <motion.div
          ref={queryRef}
          className="bg-gray-300 text-black p-6 rounded-3xl rounded-br-none flex flex-col shadow-lg mb-4 max-w-[50%] ml-auto relative"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <FaUser className="absolute top-3 right-3 text-gray-600 w-5 h-5" />
          <p className="text-wrap break-words text-lg leading-relaxed">{userQuery}</p>
        </motion.div>
      )}

      {/* Main Content Container */}
      <div className="relative">
        {/* AI Response Bubble */}
        <motion.div
          className="bg-black text-white p-6 rounded-3xl rounded-br-3xl flex flex-col shadow-lg max-w-[65%] relative z-20 mb-4"
          style={{
            background: 'linear-gradient(135deg, #000000, #1a1a1a)',
            borderBottomRightRadius: '12px',
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <HiSparkles className="absolute top-3 right-3 text-purple-400 w-6 h-6" />
          <p className="text-wrap break-words text-lg leading-relaxed">{message.response_text}</p>
        </motion.div>

        {/* Main Content Area with Samsung TV Background */}
        {message.cards && message.cards.length > 0 && (
          <motion.div
            className="bg-black rounded-3xl shadow-2xl overflow-hidden border border-gray-800 relative"
            style={{ marginTop: '-12px' }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {/* Samsung TV Background Image Section - Visible at top */}
            <div className="relative h-64 overflow-hidden">
              <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: `url('${selectedBackground}')`,
                  backgroundPosition: 'center',
                  backgroundSize: 'cover',
                }}
              />
              {/* Subtle dark overlay for text readability */}
              <div className="absolute inset-0 bg-black/30" />
              
              {/* Hero Text Over Image */}
              <div className="absolute inset-0 flex flex-col justify-center px-8">
                <motion.h2 
                  className="text-4xl font-bold text-white mb-4 drop-shadow-lg"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  Transform Your Home with Samsung
                </motion.h2>
                <motion.p 
                  className="text-xl text-gray-200 max-w-3xl leading-relaxed drop-shadow-md"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  Explore the latest in smart home technology with Samsung's 
                  innovative TVs and cutting-edge features.
                </motion.p>
              </div>
            </div>

            {/* Content Section - Pure black background */}
            <div className="bg-black p-8">
              {/* Feature Tags */}
              <motion.div 
                className="flex flex-wrap gap-4 mb-10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <span className="bg-gray-800/80 border border-gray-600/30 text-white px-6 py-2 rounded-full font-medium">
                  Vision AI Technology
                </span>
                <span className="bg-gray-800/80 border border-gray-600/30 text-white px-6 py-2 rounded-full font-medium">
                  Smart Hub
                </span>
                <span className="bg-gray-800/80 border border-gray-600/30 text-white px-6 py-2 rounded-full font-medium">
                  8K AI Upscaling
                </span>
              </motion.div>

              {/* Product Cards Grid */}
              <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.7 }}
              >
                {message.cards.map((p: any, cardIndex: number) => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ 
                      duration: 0.5, 
                      delay: 0.8 + (cardIndex * 0.1) 
                    }}
                  >
                    <ProductCard
                      {...p}
                      onLearnMore={onLearnMore}
                      onCompare={onCompare}
                      isCompared={compareProducts.some((cp: any) => cp.id === p.id)}
                      maxComparisonsReached={compareProducts.length >= 3}
                    />
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}