'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ChatResponse from '../components/ChatResponse';
import ChatBar from '../components/ChatBar';
import DetailSheet from '../components/DetailSheet';

interface ProductCard {
  id: string;
  name: string;
  frontImage: string;
  tvType: string;
  topFeatures: string[];
  price: {
    current: string;
    suggested: string;
  } | string;
  availableSizes: string[];
  description: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content?: string;
  response_text?: string;
  cards?: ProductCard[];
  proactive_tip?: string;
  comparison?: any[];
}

export default function Home() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sheetProduct, setSheetProduct] = useState<any>(null);
  const [compareProducts, setCompareProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Function to convert API response to your existing card format
  const convertApiCardsToYourFormat = (apiCards: any[]) => {
    return apiCards.map((card, index) => {
      // Extract main size (first available size or most common)
      let mainSize = '55"'; // default
      if (card.availableSizes && Array.isArray(card.availableSizes) && card.availableSizes.length > 0) {
        mainSize = card.availableSizes[0];
      }
      
      // Extract features (max 5)
      let features = [];
      if (card.topFeatures && Array.isArray(card.topFeatures)) {
        features = card.topFeatures.slice(0, 5);
      }
      
      // Handle price properly
      let priceInfo = {
        current: '$999',
        suggested: null
      };
      
      if (card.price) {
        if (typeof card.price === 'object') {
          priceInfo.current = card.price.current || '$999';
          priceInfo.suggested = card.price.suggested || null;
        } else if (typeof card.price === 'string') {
          priceInfo.current = card.price;
        }
      }
      
      // Handle multiple images
      let images = [card.frontImage || '/placeholder-tv.jpg'];
      if (card.images && Array.isArray(card.images)) {
        images = card.images.filter(img => img); // Remove empty images
      }
      if (images.length === 0) {
        images = ['/placeholder-tv.jpg'];
      }
      
      return {
        id: `tv-${Date.now()}-${index}`,
        name: card.tvType || 'Samsung TV',
        image: images[0], // Main image
        images: images, // All images for random selection
        size: mainSize,
        features: features,
        price: priceInfo,
        availableSizes: card.availableSizes || [],
        learn_more: card.description || 'Great Samsung TV for your needs.',
        
        // Legacy format for compatibility (if needed)
        specs: {
          'Available Sizes': card.availableSizes?.join(', ') || mainSize,
          'Price': priceInfo.current
        },
        // Keep original API data
        frontImage: card.frontImage,
        tvType: card.tvType,
        topFeatures: card.topFeatures || [],
        description: card.description || '',
      };
    });
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: input.trim()
    };

    // Add user message immediately
    setMessages(prevMessages => [...prevMessages, userMessage]);
    const currentInput = input.trim();
    setInput(''); // Clear input immediately for better UX
    setIsLoading(true);

    try {
      // Handle comparison commands first (your existing logic)
      if (currentInput.toLowerCase().includes('add') && currentInput.toLowerCase().includes('comparison')) {
        const tvName = currentInput.match(/Neo OLED 4K|Samsung QLED TV|Neo QLED 4K|Vision AI Smart TV|QLED 4K QE1D|Crystal UHD U7900F/i)?.[0];
        if (tvName) {
          // Find TV from existing messages
          const allCards = messages.flatMap(msg => msg.cards || []);
          const tv = allCards.find((t) => t.name === tvName || t.tvType === tvName);
          if (tv && compareProducts.length < 3 && !compareProducts.some((cp) => cp.id === tv.id)) {
            setCompareProducts([...compareProducts, tv]);
            
            // Add a simple response message
            const responseMessage: ChatMessage = {
              role: 'assistant',
              response_text: `Added ${tvName} to your comparison list. You now have ${compareProducts.length + 1} TV(s) to compare.`,
              cards: []
            };
            setMessages(prevMessages => [...prevMessages, responseMessage]);
          }
        }
        setIsLoading(false);
        return;
      }

      if (currentInput.toLowerCase().includes('remove') && currentInput.toLowerCase().includes('comparison')) {
        const tvName = currentInput.match(/Neo OLED 4K|Samsung QLED TV|Neo QLED 4K|Vision AI Smart TV|QLED 4K QE1D|Crystal UHD U7900F/i)?.[0];
        if (tvName) {
          const newCompareProducts = compareProducts.filter((cp) => cp.name !== tvName && cp.tvType !== tvName);
          setCompareProducts(newCompareProducts);
          
          // Add a simple response message
          const responseMessage: ChatMessage = {
            role: 'assistant',
            response_text: `Removed ${tvName} from your comparison list. You now have ${newCompareProducts.length} TV(s) to compare.`,
            cards: []
          };
          setMessages(prevMessages => [...prevMessages, responseMessage]);
        }
        setIsLoading(false);
        return;
      }

      if (currentInput.toLowerCase().includes('compare') && compareProducts.length >= 2) {
        setSheetProduct({ comparison: true, tvs: compareProducts });
        
        // Add a simple response message
        const responseMessage: ChatMessage = {
          role: 'assistant',
          response_text: `Opening comparison for ${compareProducts.length} TVs. Check the comparison sheet that just opened!`,
          cards: []
        };
        setMessages(prevMessages => [...prevMessages, responseMessage]);
        setIsLoading(false);
        return;
      }

      // Make API call for product recommendations
      const response = await fetch('/api/generate-products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: currentInput }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch recommendations');
      }

      const data = await response.json();

      if (data.success) {
        // Convert API response to your existing format
        const convertedCards = convertApiCardsToYourFormat(data.productCards);
        
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          response_text: data.chatResponse,
          cards: convertedCards,
          proactive_tip: `💡 Tip: You can add any of these TVs to comparison by saying "add [TV name] to comparison"`
        };

        setMessages(prevMessages => [...prevMessages, assistantMessage]);
      } else {
        throw new Error(data.error || 'Unknown error occurred');
      }
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: ChatMessage = {
        role: 'assistant',
        response_text: 'Sorry, I encountered an error while processing your request. Please try again.',
        cards: []
      };
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompareToggle = (product: any) => {
    if (compareProducts.some((cp) => cp.id === product.id)) {
      setCompareProducts(compareProducts.filter((cp) => cp.id !== product.id));
    } else if (compareProducts.length < 3) {
      setCompareProducts([...compareProducts, product]);
    }
  };

  const handleLearnMore = (product: any) => {
    if (sheetProduct && sheetProduct.id === product.id && !sheetProduct.comparison) {
      setSheetProduct(null); // Close if same product is already open
    } else {
      setSheetProduct(product); // Open new product
    }
  };

  // Typing effect state for title only
  const [titleText, setTitleText] = useState('');
  const fullTitle = 'Samsung TV Storefront';

  useEffect(() => {
    // Typing effect for title
    let titleIndex = 0;
    const titleInterval = setInterval(() => {
      if (titleIndex < fullTitle.length) {
        setTitleText(fullTitle.slice(0, titleIndex + 1));
        titleIndex++;
      } else {
        clearInterval(titleInterval);
      }
    }, 80); // Typing speed for title

    return () => {
      clearInterval(titleInterval);
    };
  }, []);

  return (
    <div className="flex flex-col h-screen bg-white text-black">
      <div className="text-center mt-12">
        <motion.h1
          className="text-5xl font-bold text-blue-600"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {titleText}
        </motion.h1>
        <motion.p
          className="text-lg text-gray-600 mt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: fullTitle.length * 0.08 + 0.2 }}
        >
          AI-Powered TV Recommendations
        </motion.p>
      </div>

      <div className="flex-1 overflow-y-auto p-8 space-y-8 pb-40 scroll-container">
        <AnimatePresence>
          {messages.reduce((acc: any[], msg, index) => {
            if (msg.role === 'user') {
              const nextMsg = messages[index + 1];
              if (nextMsg && nextMsg.role === 'assistant') {
                acc.push({ userQuery: msg.content, assistant: nextMsg });
              }
              return acc;
            }
            return acc;
          }, []).map((pair: any, pairIndex: number) => (
            <ChatResponse
              key={`${pairIndex}-${pair.userQuery}`}
              message={pair.assistant}
              userQuery={pair.userQuery}
              index={pairIndex}
              onLearnMore={handleLearnMore}
              onCompare={handleCompareToggle}
              compareProducts={compareProducts}
              sheetOpen={!!sheetProduct}
            />
          ))}
          
          {/* Show loading indicator for the latest message */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="bg-gray-100 rounded-2xl p-6 max-w-4xl">
                <div className="flex items-center space-x-3 text-gray-600">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span>Finding the perfect TVs for you...</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <ChatBar
        input={input}
        setInput={setInput}
        handleSend={handleSend}
        compareProducts={compareProducts}
        setCompareProducts={setCompareProducts}
        setSheetProduct={setSheetProduct}
        isLoading={isLoading}
      />
      <DetailSheet sheetProduct={sheetProduct} setSheetProduct={setSheetProduct} />
    </div>
  );
}