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
  isLoading?: boolean; // Added loading prop
}

export default function ChatBar({ 
  input, 
  setInput, 
  handleSend, 
  compareProducts, 
  setCompareProducts, 
  setSheetProduct,
  isLoading = false // Default to false
}: ChatBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  
  const handleClearComparisons = () => {
    setCompareProducts([]);
    setSheetProduct(null);
  };
  
  const isCompareMode = compareProducts.length >= 1;
  const isDisabled = isLoading || (compareProducts.length >= 3);
  
  const getPlaceholderText = () => {
    if (isLoading) return 'AI is thinking...';
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
        background: 'rgba(30, 30, 30, 0.3)', // Darker grey for glass effect
        backdropFilter: 'blur(12px)', // Retained blur for frosted glass
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.2), 0 2px 10px rgba(0, 0, 255, 0.1)', // Soft shadow
        border: '1px solid rgba(255, 255, 255, 0.3)', // Light border
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
                  disabled={isLoading}
                >
                  ×
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        {compareProducts.length >= 2 && (
          <div
            className={`flex items-center px-5 py-2 rounded-full text-lg font-medium cursor-pointer transition-all duration-200 ${
              isLoading 
                ? 'bg-gray-500 text-gray-300 cursor-not-allowed' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
            style={{ marginRight: '5.5rem', marginBottom: '0.5rem'}}
            onClick={() => !isLoading && setSheetProduct({ comparison: true, tvs: compareProducts })}
          >
            <span>Compare Now</span>
            <button
              className={`ml-3 hover:text-gray-200 focus:outline-none text-lg transition-colors ${
                isLoading ? 'cursor-not-allowed opacity-50' : ''
              }`}
              onClick={(e) => {
                e.stopPropagation();
                if (!isLoading) {
                  handleClearComparisons();
                }
              }}
              disabled={isLoading}
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
          className={`flex-1 text-black px-4 py-3 rounded-2xl text-lg focus:outline-none focus:ring-2 focus:ring-blue-400 w-full transition-all duration-200 ${
            isDisabled 
              ? 'bg-white/60 cursor-not-allowed opacity-70' 
              : 'bg-white/95 hover:bg-white focus:bg-white'
          }`}
          style={{ backdropFilter: 'blur(8px)' }} // Subtle blur for input
          placeholder={getPlaceholderText()}
          disabled={isDisabled}
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
            {isLoading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-6 h-6 border-2 border-white border-t-transparent rounded-full"
              />
            ) : (
              <FiSend className="w-6 h-6" />
            )}
          </button>
          <button 
            className={`transition-colors ${
              isLoading 
                ? 'text-gray-400 cursor-not-allowed' 
                : 'text-white hover:text-blue-300'
            }`}
            disabled={isLoading}
          >
            <MdMic className="w-6 h-6" />
          </button>
        </div>
      </div>
      
      {/* Loading indicator bar */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            exit={{ opacity: 0, scaleX: 0 }}
            className="mt-2 h-1 bg-gradient-to-r from-blue-400 via-purple-500 to-blue-400 rounded-full"
            style={{
              background: 'linear-gradient(90deg, #60a5fa 0%, #a855f7 50%, #60a5fa 100%)',
              backgroundSize: '200% 100%',
              animation: 'gradient-shift 2s ease-in-out infinite'
            }}
          />
        )}
      </AnimatePresence>
      
      <style jsx>{`
        @keyframes gradient-shift {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
      `}</style>
    </div>
  );
}