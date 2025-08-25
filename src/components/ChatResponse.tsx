import { motion } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import ProductCard from './ProductCard';
import { FaUser } from 'react-icons/fa';
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

export default function ChatResponse({
  message,
  userQuery,
  index,
  onLearnMore,
  onCompare,
  compareProducts,
  sheetOpen
}: ChatResponseProps) {
  const responseRef = useRef<HTMLDivElement>(null);
  const queryRef = useRef<HTMLDivElement>(null);

  const backgroundImages = [
    'https://images.samsung.com/is/image/samsung/assets/global/hq/vd/tvs/vision-ai-tv/2025-vision-ai-tv-f07-petcare-2-dog-pc.png?imbypass=true',
    'https://images.samsung.com/is/image/samsung/assets/global/hq/vd/tvs/vision-ai-tv/2025-vision-ai-tv-f08-universal-gestures-1-tv-pc.png?imbypass=true',
    'https://images.samsung.com/is/image/samsung/p6pim/us/feature/165878546/us-feature-intelligently-enhanced-color-expression-546018666?$ORIGIN_IMG$',
    'https://images.samsung.com/is/image/samsung/p6pim/us/feature/165878561/us-feature-experience-4k-with-richer-colors-and-more-nuanced-details-546018668?$ORIGIN_IMG$',
    'https://images.samsung.com/is/image/samsung/p6pim/us/feature/165878542/us-feature-enhances-content-to-hdr-like-picture-quality-546018670?$ORIGIN_IMG$',
    'https://images.samsung.com/is/image/samsung/p6pim/us/feature/165878555/us-feature-enjoy-a-full-range-of-authentic-colors-546018674?$ORIGIN_IMG$'
  ];

  const [selectedBackground, setSelectedBackground] = useState(
    () => backgroundImages[Math.floor(Math.random() * backgroundImages.length)]
  );

  useEffect(() => {
    if (userQuery) {
      setSelectedBackground(backgroundImages[Math.floor(Math.random() * backgroundImages.length)]);
    }

    // Wait for animations and content to render
    const scrollTimer = setTimeout(() => {
      if (responseRef.current) {
        if (userQuery && queryRef.current) {
          // Calculate positions for optimal viewing
          const queryRect = queryRef.current.getBoundingClientRect();
          const responseRect = responseRef.current.getBoundingClientRect();
          
          // Get absolute positions
          const queryTop = queryRect.top + window.scrollY;
          const responseBottom = responseRect.bottom + window.scrollY;
          
          // Calculate if the full response container fits in viewport
          const viewportHeight = window.innerHeight;
          const containerHeight = responseBottom - queryTop;
          
          let targetScrollPosition;
          
          if (containerHeight <= viewportHeight * 0.9) {
            // If content fits in 90% of viewport, center it
            const centerOffset = (viewportHeight - containerHeight) / 4;
            targetScrollPosition = queryTop - centerOffset;
          } else {
            // If content is taller, position query at top with small offset
            targetScrollPosition = queryTop - 20;
          }
          
          window.scrollTo({
            top: Math.max(0, targetScrollPosition),
            behavior: 'smooth'
          });
        } else {
          // No user query - scroll response container to optimal position
          const responseRect = responseRef.current.getBoundingClientRect();
          const responseTop = responseRect.top + window.scrollY;
          const responseHeight = responseRect.height;
          const viewportHeight = window.innerHeight;
          
          let targetScrollPosition;
          
          if (responseHeight <= viewportHeight * 0.9) {
            // Center the response if it fits
            const centerOffset = (viewportHeight - responseHeight) / 4;
            targetScrollPosition = responseTop - centerOffset;
          } else {
            // Position at top with small margin
            targetScrollPosition = responseTop - 20;
          }
          
          window.scrollTo({
            top: Math.max(0, targetScrollPosition),
            behavior: 'smooth'
          });
        }
      }
    }, 200); // Wait for animations to settle

    return () => clearTimeout(scrollTimer);
  }, [userQuery, message.cards]);

  return (
    <div
      ref={responseRef}
      data-chat-response
      className="w-full max-w-[95%] mx-auto mb-8 relative z-10 scroll-mt-20"
    >
      {/* User Query Bubble */}
      {userQuery && (
        <motion.div
          ref={queryRef}
          className="bg-gray-300 text-black p-6 rounded-3xl rounded-br-none flex flex-col shadow-lg mb-6 max-w-[50%] ml-auto relative"
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
        {/* Sparkles icon - slightly larger, top-right */}
        <HiSparkles className="absolute top-2 right-2 text-purple-500 w-10 h-8 z-20 drop-shadow-lg" />

        {message.cards && message.cards.length > 0 && (
          <motion.div
            className="bg-black rounded-3xl shadow-2xl overflow-hidden border border-gray-800 relative z-10"
            style={{ marginTop: '-12px' }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {/* Samsung TV Background Image Section */}
            <div className="relative w-full h-[400px] overflow-hidden">
              <div
                className="absolute inset-0 bg-contain bg-center bg-gray-800"
                style={{
                  backgroundImage: `url('${selectedBackground}')`,
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  aspectRatio: '16 / 9',
                }}
              />
              <div className="absolute inset-0 bg-black/60" />

              <div className="absolute inset-0 flex flex-col justify-center px-8">
                <motion.h2
                  className="text-4xl font-bold text-white mb-4 drop-shadow-[0_4px_6px_rgba(0,0,0,0.5)]"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  Transform Your Home with Samsung
                </motion.h2>
                <motion.p
                  className="text-xl text-gray-200 max-w-3xl leading-relaxed drop-shadow-[0_4px_6px_rgba(0,0,0,0.5)]"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  Explore the latest in smart home technology with Samsung's
                  innovative TVs and cutting-edge features.
                </motion.p>
              </div>
            </div>

            {/* Content Section */}
            <div className="bg-black p-8">
              <motion.div
                className="flex flex-wrap gap-4 mb-10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              />

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
                    transition={{ duration: 0.5, delay: 0.8 + cardIndex * 0.1 }}
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