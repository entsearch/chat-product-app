import { useRef } from 'react';
import { MdMic } from 'react-icons/md';
import { FiSend } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatBarProps {
  input: string;
  setInput: (value: string) => void;
  handleSend: () => void;
  compareProducts: any[];
  setCompareProducts: (products: any[]) => void;
  setSheetProduct: (product: any) => void;
}

export default function ChatBar({ input, setInput, handleSend, compareProducts, setCompareProducts, setSheetProduct }: ChatBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClearComparisons = () => {
    setCompareProducts([]);
    setSheetProduct(null);
  };

  const isCompareMode = compareProducts.length >= 1;

  return (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 w-3/4 bg-gray-800 border border-gray-700 rounded-3xl p-4 shadow-lg flex flex-col items-stretch">
      <div className="flex items-center justify-between mb-2" style={{ width: '100%', maxWidth: 'calc(100% - 2rem)' }}>
        <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap">
          <AnimatePresence>
            {compareProducts.map((tv, i) => (
              <motion.div
                key={tv.id}
                className="relative"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                transition={{ duration: 0.2 }}
              >
                <img
                  src={tv.image}
                  alt={tv.name}
                  className="w-10 h-10 rounded-full object-contain"
                />
                <button
                  className="absolute -top-1 -right-1 text-xs text-white bg-gray-600 rounded-full w-4 h-4 flex items-center justify-center"
                  onClick={() => setCompareProducts(compareProducts.filter((cp) => cp.id !== tv.id))}
                >
                  ×
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        {compareProducts.length > 0 && (
          <div
            className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              compareProducts.length >= 2 ? 'bg-blue-600 text-white cursor-pointer' : 'bg-gray-400 text-white opacity-70 cursor-not-allowed'
            }`}
            onClick={() => compareProducts.length >= 2 && setSheetProduct({ comparison: true, tvs: compareProducts })}
          >
            <span>Compare Now</span>
            <button
              className="ml-2 text-white hover:text-gray-200 focus:outline-none"
              onClick={(e) => {
                e.stopPropagation();
                handleClearComparisons();
              }}
            >
              ✖
            </button>
          </div>
        )}
      </div>
      <div className="flex items-center justify-between">
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          className="flex-1 bg-gray-700 text-white px-4 py-3 rounded-2xl text-lg focus:outline-none focus:ring-2 focus:ring-blue-400 w-full"
          placeholder={isCompareMode ? 'Max 3 TVs can be selected for comparison' : 'Ask about TVs (e.g., "add Samsung QLED TV to comparison")...'}
          disabled={compareProducts.length >= 3}
        />
        <div className="flex items-center ml-4 space-x-2">
          <button onClick={handleSend} className="text-blue-400 hover:text-blue-300">
            <FiSend className="w-6 h-6" />
          </button>
          <button className="text-blue-400 hover:text-blue-300">
            <MdMic className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}