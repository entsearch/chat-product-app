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
}

export default function ChatResponse({ message, index, onLearnMore, onCompare, compareProducts }: ChatResponseProps) {
  return (
    <motion.div
      className="space-y-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="bg-gray-700 text-white p-4 rounded-tl-2xl rounded-tr-2xl rounded-br-2xl w-3/4">
        <p>{message.response_text}</p>
        {message.proactive_tip && (
          <p className="mt-2 italic text-blue-300">{message.proactive_tip}</p>
        )}
      </div>
      {message.cards?.length > 0 && (
        <div className="grid grid-cols-3 gap-6 max-w-6xl mx-auto">
          {message.cards.map((p: any) => (
            <ProductCard
              key={p.id}
              {...p}
              onLearnMore={onLearnMore}
              onCompare={onCompare}
              isCompared={compareProducts.some((cp: any) => cp.id === p.id)}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}
