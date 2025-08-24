import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';

interface DetailSheetProps {
  sheetProduct: any;
  setSheetProduct: (product: any) => void;
}

export default function DetailSheet({ sheetProduct, setSheetProduct }: DetailSheetProps) {
  const [selectedCriteria, setSelectedCriteria] = useState<string[]>([]);
  const [showRecommendation, setShowRecommendation] = useState(false);
  const [recommendedTV, setRecommendedTV] = useState<any>(null);
  const recommendationRef = useRef<HTMLDivElement>(null);
  const recommendButtonRef = useRef<HTMLDivElement>(null);

  // Reset state when sheetProduct changes (when sheet opens)
  useEffect(() => {
    setSelectedCriteria([]);
    setShowRecommendation(false);
    setRecommendedTV(null);
  }, [sheetProduct]);

  // Scroll to recommendation button when it appears
  useEffect(() => {
    if (selectedCriteria.length > 0) {
      setTimeout(() => {
        recommendButtonRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }, 300); // Delay to allow animation to complete
    }
  }, [selectedCriteria.length]);

  const handleCriteriaToggle = (criteria: string) => {
    setSelectedCriteria(prev => 
      prev.includes(criteria) 
        ? prev.filter(c => c !== criteria)
        : [...prev, criteria]
    );
  };

  const getRecommendation = () => {
    // Only show recommendation if user has made selections
    if (selectedCriteria.length === 0) {
      alert('Please select at least one criteria first!');
      return;
    }
    
    // Randomly select a TV from the comparison
    const randomTV = sheetProduct.tvs[Math.floor(Math.random() * sheetProduct.tvs.length)];
    setRecommendedTV(randomTV);
    setShowRecommendation(true);
    
    // Scroll to recommendation after a short delay to allow animation
    setTimeout(() => {
      recommendationRef.current?.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
    }, 100);
  };

  const getRecommendationText = (tv: any) => {
    const reasons = [
      "This TV offers the perfect balance of cutting-edge technology and exceptional value. With its stunning display quality and advanced features, it delivers an unmatched viewing experience that exceeds expectations.",
      "Based on your preferences, this model stands out for its superior performance and innovative features. It combines premium quality with smart functionality to give you the ultimate entertainment experience.",
      "This TV is our top recommendation for its outstanding picture quality and user-friendly interface. It's designed to deliver exceptional performance while offering great value for your investment."
    ];
    return reasons[Math.floor(Math.random() * reasons.length)];
  };

  return (
    <AnimatePresence>
      {sheetProduct && (
        <motion.div
          className="fixed right-20 top-[160px] h-[59vh] w-3/4 bg-gray-300 overflow-y-auto shadow-2xl border border-gray-300 rounded-3xl z-50"
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Fixed Close Button - stays in place when scrolling */}
          <button
            className="fixed top-[175px] right-[115px] text-xl text-gray-600 hover:text-black bg-gray-100 hover:bg-gray-200 w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-200 z-[60]"
            onClick={() => setSheetProduct(null)}
          >
            ×
          </button>
          
          <div className="p-6">
            {sheetProduct.comparison ? (
              <div className="space-y-6 mt-6">
                <div className="text-center">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">TV Showdown</h2>
                  <h3 className="text-xl font-bold">Select your criteria from left and Samsung will recommend the best TV for you!</h3>
                </div>
                
                {/* TV Cards Header */}
                <div className="grid gap-4" style={{ gridTemplateColumns: `150px repeat(${sheetProduct.tvs.length}, 1fr)` }}>
                  <div></div>
                  {sheetProduct.tvs.map((tv: any) => (
                    <motion.div
                      key={tv.id}
                      className="bg-white rounded-2xl p-4 shadow-lg border-2 border-blue-200"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="text-center">
                        <div className="w-20 h-20 mx-auto mb-3 rounded-xl overflow-hidden shadow-md">
                          <img 
                            src={tv.image} 
                            alt={tv.name} 
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <h3 className="font-bold text-lg text-gray-900 leading-tight">{tv.name}</h3>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Comparison Specs */}
                <div className="space-y-3">
                  {[
                    { label: 'Screen Size', values: ['55"', '65"', '75"'] },
                    { label: 'Display', values: ['QLED', 'OLED', 'Neo QLED'] },
                    { label: 'Resolution', values: ['4K UHD', '4K UHD', '8K UHD'] },
                    { label: 'HDR', values: ['HDR10+', 'Dolby Vision', 'HDR10+ & Dolby Vision'] },
                    { label: 'Price', values: ['$1,299', '$1,599', '$2,299'] }
                  ].map((spec, index) => (
                    <motion.div
                      key={spec.label}
                      className="grid gap-4 items-center"
                      style={{ gridTemplateColumns: `150px repeat(${sheetProduct.tvs.length}, 1fr)` }}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      {/* Clickable Spec Label */}
                      <button
                        onClick={() => handleCriteriaToggle(spec.label)}
                        className={`px-4 py-3 rounded-xl font-semibold text-sm shadow-md transition-all duration-200 text-center ${
                          selectedCriteria.includes(spec.label)
                            ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white scale-105 shadow-lg'
                            : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800'
                        }`}
                      >
                        {spec.label}
                      </button>
                      
                      {/* Spec Values */}
                      {spec.values.map((value, valueIndex) => (
                        <div
                          key={valueIndex}
                          className={`text-center py-3 px-2 rounded-xl font-medium text-sm ${
                            spec.label === 'Price'
                              ? 'bg-green-100 border-2 border-green-300 text-green-800 font-bold' 
                              : 'bg-gray-50 border border-gray-200 text-gray-800'
                          }`}
                        >
                          {value}
                        </div>
                      ))}
                    </motion.div>
                  ))}
                </div>

                {/* Recommendation Button - Only shown when criteria selected */}
                <AnimatePresence>
                  {selectedCriteria.length > 0 && (
                    <motion.div
                      ref={recommendButtonRef}
                      className="text-center"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <button
                        onClick={getRecommendation}
                        className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold text-lg py-4 px-8 rounded-2xl shadow-lg transition-all duration-200 hover:scale-105"
                      >
                        Recommend me the best TV based on my preferences
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Recommendation Result - Only shows when user clicks button AND has selections */}
                <AnimatePresence>
                  {showRecommendation && recommendedTV && (
                    <motion.div
                      ref={recommendationRef}
                      className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 rounded-2xl p-6 shadow-lg"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.4 }}
                    >
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-4">
                          <span className="text-3xl mr-2">🏆</span>
                          <h3 className="text-2xl font-bold text-gray-900">Our Recommendation</h3>
                        </div>
                        
                        <div className="mb-4">
                          <h4 className="text-xl font-bold text-blue-700 mb-2">{recommendedTV.name}</h4>
                          <p className="text-gray-700 leading-relaxed">
                            {getRecommendationText(recommendedTV)}
                          </p>
                        </div>
                        
                        <button
                          className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg py-3 px-8 rounded-xl shadow-md transition-colors duration-200"
                          onClick={() => console.log('Buy Now clicked for:', recommendedTV.name)}
                        >
                          BUY NOW
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="space-y-4 mt-8 text-center">
                <h2 className="text-2xl font-bold text-black">{sheetProduct.name}</h2>
                <img src={sheetProduct.image} alt={sheetProduct.name} className="w-full h-[200px] object-contain rounded-lg" />
                <p className="text-base text-black leading-relaxed">{sheetProduct.learn_more}</p>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}