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
  isLoading?: boolean;
}

export default function ChatBar({ 
  input, 
  setInput, 
  handleSend, 
  compareProducts, 
  setCompareProducts, 
  setSheetProduct,
  isLoading = false
}: ChatBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  
  const handleClearComparisons = () => {
    setCompareProducts([]);
    setSheetProduct(null);
  };
  
  const isCompareMode = compareProducts.length >= 1;
  
  const getPlaceholderText = () => {
    if (isCompareMode) return 'Max 3 TVs can be selected for comparison';
    return 'Discover Your Perfect TV ...';
  };

  const handleSendClick = () => {
    if (!isLoading && input.trim()) {
      handleSend();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading && input.trim()) {
      handleSend();
    }
  };
  
  return (
    <div 
      className="fixed z-50 bottom-8 left-1/2 transform -translate-x-1/2 w-3/4 rounded-3xl p-6 flex flex-col items-stretch"
      style={{
        background: 'rgba(30, 30, 30, 0.3)',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.2), 0 2px 10px rgba(0, 0, 255, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
      }}
    >
      <div className="flex items-center justify-between mb-2 -mx-2">
        <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap pl-4">
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
                  src={tv.image || tv.frontImage}
                  alt={tv.name}
                  className="w-10 h-10 rounded-full object-contain"
                />
                <button
                  className="absolute -top-1 -right-1 text-xs text-white bg-gray-600 rounded-full w-4 h-4 flex items-center justify-center hover:bg-gray-700 transition-colors"
                  onClick={() => setCompareProducts(compareProducts.filter((cp) => cp.id !== tv.id))}
                >
                  ×
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        {compareProducts.length >= 2 && (
          <div
            className="flex items-center px-5 py-2 rounded-full text-lg font-medium cursor-pointer transition-all duration-200 bg-blue-600 text-white hover:bg-blue-700"
            style={{ marginRight: '5.5rem', marginBottom: '0.5rem'}}
            onClick={() => setSheetProduct({ comparison: true, tvs: compareProducts })}
          >
            <span>Compare Now</span>
            <button
              className="ml-3 hover:text-gray-200 focus:outline-none text-lg transition-colors"
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
          onKeyDown={handleKeyDown}
          className="flex-1 text-black px-4 py-3 rounded-2xl text-lg focus:outline-none focus:ring-2 focus:ring-blue-400 w-full transition-all duration-200 bg-white/95 hover:bg-white focus:bg-white"
          style={{ backdropFilter: 'blur(8px)' }}
          placeholder={getPlaceholderText()}
        />
        <div className="flex items-center ml-4 space-x-2">
          <button 
            onClick={handleSendClick} 
            className={`transition-all duration-200 ${
              isLoading || !input.trim()
                ? 'text-gray-400 cursor-not-allowed' 
                : 'text-white hover:text-blue-300 hover:scale-110'
            }`}
            disabled={isLoading || !input.trim()}
          >
            <FiSend className="w-6 h-6" />
          </button>
          <button className="text-white hover:text-blue-300 transition-colors">
            <MdMic className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}