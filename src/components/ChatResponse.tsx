import { motion, AnimatePresence } from 'framer-motion';
import ProductCard from './ProductCard';

interface ChatResponseProps {
  message: {
    response_text: string;
    cards?: any[];
    proactive_tip?: string;
  };
  index: number;
  onLearnMore: (product: any) => void;
  onCompare: (product: any) => void;
  compareProducts: any[];
  sheetOpen?: boolean;
}

export default function ChatResponse({ message, index, onLearnMore, onCompare, compareProducts, sheetOpen }: ChatResponseProps) {
  return (
    <motion.div
      className="bg-gray-900 rounded-3xl p-6 w-full max-w-[95%] mx-auto mb-8 shadow-xl border border-gray-700"
      style={{
        background: 'linear-gradient(145deg, #1a1a1a, #2a2a2a)',
        backdropFilter: 'blur(10px)',
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div 
        className="bg-blue-600 text-white p-6 rounded-3xl flex flex-col shadow-lg mr-2 mt-1 max-w-[50%]"
      >
        <p className="text-wrap break-words text-lg leading-relaxed">{message.response_text}</p>
        {message.proactive_tip && (
          <p className="mt-3 italic text-blue-100 text-wrap break-words text-base">{message.proactive_tip}</p>
        )}
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