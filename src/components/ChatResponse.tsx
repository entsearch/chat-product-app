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
  const queryRef = useRef<HTMLDivElement>(null); // Still needed for potential future use

  useEffect(() => {
    if (responseRef.current) {
      responseRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  return (
    <motion.div
      ref={responseRef}
      className="bg-gray-900 rounded-3xl p-6 w-full max-w-[95%] mx-auto mb-8 shadow-xl border border-gray-700"
      style={{
        background: 'linear-gradient(145deg, #1a1a1a, #2a2a2a)',
        backdropFilter: 'blur(10px)',
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {userQuery && (
        <div
          ref={queryRef}
          className="bg-gray-300 text-black p-6 rounded-3xl rounded-br-none flex flex-col shadow-lg mb-4 max-w-[50%] ml-auto relative"
        >
          <FaUser className="absolute top-3 right-3 text-gray-600 w-5 h-5" />
          <p className="text-wrap break-words text-lg leading-relaxed">{userQuery}</p>
        </div>
      )}
      <div 
        className="bg-gray-300 text-black p-6 rounded-3xl rounded-br-none flex flex-col shadow-lg mr-2 mt-1 max-w-[50%] relative"
      >
        <HiSparkles className="absolute top-3 right-3 text-purple-400 w-12 h-7" />
        <p className="text-wrap break-words text-lg leading-relaxed">{message.response_text}</p>
      </div>
      {message.cards && message.cards.length > 0 && (
        <div className="mt-8 mb-8 px-8">
          <div 
            className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 ${sheetOpen ? 'overflow-x-auto pb-4' : ''}`}
            style={sheetOpen ? { scrollbarWidth: 'thin' } : {}}
          >
            {message.cards.map((p: any) => (
              <ProductCard
                key={p.id}
                {...p}
                onLearnMore={onLearnMore}
                onCompare={onCompare}
                isCompared={compareProducts.some((cp: any) => cp.id === p.id)}
                maxComparisonsReached={compareProducts.length >= 3}
              />
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}