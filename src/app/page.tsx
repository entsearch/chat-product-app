'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ChatResponse from '../components/ChatResponse';
import ChatBar from '../components/ChatBar';
import DetailSheet from '../components/DetailSheet';
import { HiSparkles } from 'react-icons/hi';

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
  title?: string;
  description?: string;
}

export default function Home() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sheetProduct, setSheetProduct] = useState<any>(null);
  const [compareProducts, setCompareProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<0 | 1 | 2 | 3>(0);
  const loadingTimersRef = useRef<number[]>([]);
  const loadingRef = useRef<HTMLDivElement | null>(null);

  // Samsung TV Carousel Images
  const carouselImages = [
    'https://images.samsung.com/is/image/samsung/assets/global/hq/vd/tvs/qled-tv/highlights/2025-neo-qled-tv-f01-5-samsung-vision-ai-color-booster-pro-pc.jpg?imbypass=true',
    'https://images.samsung.com/is/image/samsung/assets/global/hq/vd/tvs/qled-tv/highlights/2025-neo-qled-tv-f04-3-art-store-pc.jpg?imbypass=true',
    'https://stg-images.samsung.com/is/image/samsung/assets/global/hq/vd/lifestyle-tvs/the-frame/highlights/2025-the-frame-why-the-frame-f04-3-design-preview-pc.jpg?$1440_N_JPG$',
    'https://stg-images.samsung.com/is/image/samsung/assets/global/hq/vd/lifestyle-tvs/the-frame/highlights/2025-the-frame-why-the-frame-f05-3-art-preview-pc.jpg?$1440_N_JPG$',
    'https://stg-images.samsung.com/is/image/samsung/assets/global/hq/vd/lifestyle-tvs/the-frame/highlights/2025-the-frame-why-the-frame-f06-3-picture-quality-matte-display-pc.jpg?$1440_N_JPG$',
    'https://images.samsung.com/is/image/samsung/assets/us/televisions-home-theater/tvs/lifestyle-tvs/dt/2025_lifestyle_tvs_pcd_f06_the_frame_lifestyle_pc.jpg?$1440_N_JPG$',
    'https://images.samsung.com/is/image/samsung/assets/us/televisions-home-theater/tvs/lifestyle-tvs/dt/2025_lifestyle_tvs_pcd_f07_the_serif_lifestyle_pc.jpg?$1440_N_JPG$'
  ];

  // Function to convert API response to your existing card format
  const convertApiCardsToYourFormat = (apiCards: any[]) => {
    return apiCards.map((card, index) => {
      let mainSize = '55"';
      if (card.availableSizes && Array.isArray(card.availableSizes) && card.availableSizes.length > 0) {
        mainSize = card.availableSizes[0];
      }

      let features = [];
      if (card.topFeatures && Array.isArray(card.topFeatures)) {
        features = card.topFeatures.slice(0, 5);
      }

      let priceInfo = {
        current: '$999',
        suggested: null as string | null,
      };

      if (card.price) {
        if (typeof card.price === 'object') {
          priceInfo.current = card.price.current || '$999';
          priceInfo.suggested = card.price.suggested || null;
        } else if (typeof card.price === 'string') {
          priceInfo.current = card.price;
        }
      }

      let images = [card.frontImage || '/placeholder-tv.jpg'];
      if (card.images && Array.isArray(card.images)) {
        images = card.images.filter((img) => img);
      }
      if (images.length === 0) {
        images = ['/placeholder-tv.jpg'];
      }

      return {
        id: `tv-${Date.now()}-${index}`,
        name: card.tvType || 'Samsung TV',
        image: images[0],
        images: images,
        size: mainSize,
        features: features,
        price: priceInfo,
        availableSizes: card.availableSizes || [],
        learn_more: card.description || 'Great Samsung TV for your needs.',
        specs: {
          'Available Sizes': card.availableSizes?.join(', ') || mainSize,
          Price: priceInfo.current,
        },
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
      content: input.trim(),
    };

    setMessages((prevMessages) => [...prevMessages, userMessage]);
    const currentInput = input.trim();
    setInput('');
    setIsLoading(true);

    try {
      if (
        currentInput.toLowerCase().includes('add') &&
        currentInput.toLowerCase().includes('comparison')
      ) {
        const tvName = currentInput.match(
          /Neo OLED 4K|Samsung QLED TV|Neo QLED 4K|Vision AI Smart TV|QLED 4K QE1D|Crystal UHD U7900F/i
        )?.[0];
        if (tvName) {
          const allCards = messages.flatMap((msg) => msg.cards || []);
          const tv = allCards.find((t) => t.name === tvName || t.tvType === tvName);
          if (
            tv &&
            compareProducts.length < 3 &&
            !compareProducts.some((cp) => cp.id === tv.id)
          ) {
            setCompareProducts([...compareProducts, tv]);

            const responseMessage: ChatMessage = {
              role: 'assistant',
              response_text: `Added ${tvName} to your comparison list. You now have ${
                compareProducts.length + 1
              } TV(s) to compare.`,
              cards: [],
            };
            setMessages((prevMessages) => [...prevMessages, responseMessage]);
          }
        }
        setIsLoading(false);
        return;
      }

      if (
        currentInput.toLowerCase().includes('remove') &&
        currentInput.toLowerCase().includes('comparison')
      ) {
        const tvName = currentInput.match(
          /Neo OLED 4K|Samsung QLED TV|Neo QLED 4K|Vision AI Smart TV|QLED 4K QE1D|Crystal UHD U7900F/i
        )?.[0];
        if (tvName) {
          const newCompareProducts = compareProducts.filter(
            (cp) => cp.name !== tvName && cp.tvType !== tvName
          );
          setCompareProducts(newCompareProducts);

          const responseMessage: ChatMessage = {
            role: 'assistant',
            response_text: `Removed ${tvName} from your comparison list. You now have ${newCompareProducts.length} TV(s) to compare.`,
            cards: [],
          };
          setMessages((prevMessages) => [...prevMessages, responseMessage]);
        }
        setIsLoading(false);
        return;
      }

      if (currentInput.toLowerCase().includes('compare') && compareProducts.length >= 2) {
        setSheetProduct({ comparison: true, tvs: compareProducts });

        const responseMessage: ChatMessage = {
          role: 'assistant',
          response_text: `Opening comparison for ${compareProducts.length} TVs. Check the comparison sheet that just opened!`,
          cards: [],
        };
        setMessages((prevMessages) => [...prevMessages, responseMessage]);
        setIsLoading(false);
        return;
      }

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
        const convertedCards = convertApiCardsToYourFormat(data.productCards);

        const assistantMessage: ChatMessage = {
          role: 'assistant',
          response_text: data.chatResponse,
          cards: convertedCards,
          title: data.title, // Add dynamic title from LLM
          description: data.description, // Add dynamic description from LLM
          proactive_tip: `💡 Tip: You can add any of these TVs to comparison by saying "add [TV name] to comparison"`,
        };

        setMessages((prevMessages) => [...prevMessages, assistantMessage]);
      } else {
        throw new Error(data.error || 'Unknown error occurred');
      }
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: ChatMessage = {
        role: 'assistant',
        response_text:
          'Sorry, I encountered an error while processing your request. Please try again.',
        cards: [],
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
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
      setSheetProduct(null);
    } else {
      setSheetProduct(product);
    }
  };

  // Typing effect state for title only
  const [titleText, setTitleText] = useState('');
  const fullTitle = 'Samsung TV Storefront';

  useEffect(() => {
    let titleIndex = 0;
    const titleInterval = setInterval(() => {
      if (titleIndex < fullTitle.length) {
        setTitleText(fullTitle.slice(0, titleIndex + 1));
        titleIndex++;
      } else {
        clearInterval(titleInterval);
      }
    }, 80);

    return () => {
      clearInterval(titleInterval);
    };
  }, []);

  // Scroll to the latest response when new messages are added (after response is received)
  useEffect(() => {
    // Only scroll if we have messages, are not currently loading, and have assistant messages
    if (messages.length > 0 && !isLoading) {
      // Find the last assistant message (newest response)
      const lastAssistantMessage = [...messages].reverse().find(msg => msg.role === 'assistant');
      
      if (lastAssistantMessage) {
        // Multiple scroll attempts to find and scroll to the newest response
        const scrollTimeouts = [500, 800, 1200];
        const timers: NodeJS.Timeout[] = [];

        scrollTimeouts.forEach(delay => {
          const timer = setTimeout(() => {
            // Find the newest ChatResponse component by looking for the last one
            const allChatResponses = document.querySelectorAll('[data-chat-response]');
            const newestResponse = allChatResponses[allChatResponses.length - 1] as HTMLElement;
            
            if (newestResponse) {
              console.log(`Scrolling to newest response at ${delay}ms`);
              newestResponse.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start',
                inline: 'nearest'
              });
            }
          }, delay);
          timers.push(timer);
        });

        return () => {
          timers.forEach(timer => clearTimeout(timer));
        };
      }
    }
  }, [messages, isLoading]);

  // --- staged loader control ---
  useEffect(() => {
    const randDelay = () =>
      Math.floor(Math.random() * (4000 - 2000 + 1)) + 2000;

    const clearTimers = () => {
      loadingTimersRef.current.forEach((id) => clearTimeout(id));
      loadingTimersRef.current = [];
    };

    if (isLoading) {
      setLoadingStep(1);

      setTimeout(() => {
        if (typeof window !== 'undefined') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        const sc = document.querySelector('.scroll-container') as HTMLElement | null;
        sc?.scrollTo({ top: 0, behavior: 'smooth' });
        loadingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);

      const t1 = window.setTimeout(() => {
        setLoadingStep(2);

        const t2 = window.setTimeout(() => {
          setLoadingStep(3);
        }, randDelay());
        loadingTimersRef.current.push(t2);
      }, randDelay());
      loadingTimersRef.current.push(t1);
    } else {
      clearTimers();
      setLoadingStep(0);
    }

    return () => {
      clearTimers();
    };
  }, [isLoading]);

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
          id="ai-recommendations-header"
          className="text-lg text-gray-600 mt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: fullTitle.length * 0.08 + 0.2 }}
        >
          GenAI can make mistakes
        </motion.p>
      </div>

      {/* Samsung TV Images Carousel - Only show on initial load */}
      {messages.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          {/* Central Container/Viewport */}
          <div className="carousel-viewport">
            <div className="viewport-label">Spotlight Zone</div>
          </div>
          
          {/* Carousel Track - spans full page */}
          <div className="carousel-container-full">
            <div className="carousel-track">
              {/* First set of images */}
              {carouselImages.map((src, index) => (
                <div key={`first-${index}`} className="carousel-item">
                  <img
                    src={src}
                    alt={`Samsung TV ${index + 1}`}
                    className="carousel-image"
                  />
                </div>
              ))}
              {/* Duplicate set for infinite scroll */}
              {carouselImages.map((src, index) => (
                <div key={`second-${index}`} className="carousel-item">
                  <img
                    src={src}
                    alt={`Samsung TV ${index + 1}`}
                    className="carousel-image"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-8 space-y-8 pb-40 scroll-container">
        <AnimatePresence>
          {messages
            .reduce((acc: any[], msg, index) => {
              if (msg.role === 'user') {
                const nextMsg = messages[index + 1];
                if (nextMsg && nextMsg.role === 'assistant') {
                  acc.push({ userQuery: msg.content, assistant: nextMsg });
                }
                return acc;
              }
              return acc;
            }, [])
            .map((pair: any, pairIndex: number) => (
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

          {/* staged loader */}
          {isLoading && (
            <motion.div
              ref={loadingRef}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="relative bg-black rounded-2xl p-6 max-w-4xl w-full">
                <HiSparkles className="absolute top-3 right-3 text-purple-500" />
                <div className="space-y-3 text-gray-700">
                  {[
                    { step: 1, text: 'Analyzing your query' },
                    { step: 2, text: 'Thinking and Planning' },
                    { step: 3, text: 'Generating your unique storefront experience' },
                  ].map(({ step, text }) => {
                    const isActive = loadingStep === step;
                    const isPassed = loadingStep > step;
                    const base = 'flex items-center justify-start gap-3';
                    const active = 'text-blue-700 font-medium text-2xl';
                    const muted = 'text-gray-400';
                    return (
                      <div
                        key={step}
                        className={`${base} ${isActive ? active : muted}`}
                      >
                        <div className="min-w-2 min-h-2 flex items-center gap-1">
                          {isActive ? (
                            <>
                              <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                              <div
                                className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"
                                style={{ animationDelay: '0.15s' }}
                              />
                              <div
                                className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"
                                style={{ animationDelay: '0.3s' }}
                              />
                            </>
                          ) : (
                            <>
                              <div className="w-2 h-2 rounded-full" />
                              <div className="w-2 h-2 rounded-full" />
                              <div className="w-2 h-2 rounded-full" />
                            </>
                          )}
                        </div>
                        <span
                          className={
                            isPassed ? 'decoration-gray-300' : ''
                          }
                        >
                          {text}
                        </span>
                      </div>
                    );
                  })}
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

      {/* Carousel CSS Styles */}
      <style jsx>{`
        /* Central container - just a visual indicator */
        .carousel-viewport {
          width: 400px;
          height: 240px;
          border: 3px solid rgba(59, 130, 246, 0.6);
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          position: relative;
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
          z-index: 20;
          pointer-events: none;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .viewport-label {
          color: rgba(59, 130, 246, 0.7);
          font-size: 14px;
          font-weight: 500;
          text-align: center;
          opacity: 0.8;
        }

        /* Full-page carousel container */
        .carousel-container-full {
          position: absolute;
          width: 100vw;
          height: 200px;
          top: 50%;
          left: 0;
          transform: translateY(-50%);
          overflow: hidden;
          z-index: 10;
        }

        .carousel-track {
          display: flex;
          width: fit-content;
          animation: scrollFullPage 40s linear infinite;
          align-items: center;
          height: 100%;
          gap: 80px;
          padding-left: 100vw;
        }

        .carousel-item {
          flex: 0 0 auto;
          border-radius: 12px;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: magnifyInCenter 40s linear infinite;
        }

        /* Staggered delays for each image - 5.7s apart */
        .carousel-item:nth-child(1) { animation-delay: 0s; }
        .carousel-item:nth-child(2) { animation-delay: -5.7s; }
        .carousel-item:nth-child(3) { animation-delay: -11.4s; }
        .carousel-item:nth-child(4) { animation-delay: -17.1s; }
        .carousel-item:nth-child(5) { animation-delay: -22.8s; }
        .carousel-item:nth-child(6) { animation-delay: -28.5s; }
        .carousel-item:nth-child(7) { animation-delay: -34.2s; }
        .carousel-item:nth-child(8) { animation-delay: -5.7s; }
        .carousel-item:nth-child(9) { animation-delay: -11.4s; }
        .carousel-item:nth-child(10) { animation-delay: -17.1s; }
        .carousel-item:nth-child(11) { animation-delay: -22.8s; }
        .carousel-item:nth-child(12) { animation-delay: -28.5s; }
        .carousel-item:nth-child(13) { animation-delay: -34.2s; }
        .carousel-item:nth-child(14) { animation-delay: -40s; }

        .carousel-image {
          width: 160px;
          height: 110px;
          object-fit: cover;
          border-radius: 12px;
          box-shadow: 0 6px 25px rgba(0, 0, 0, 0.25);
          transition: all 0.3s ease;
        }

        @keyframes scrollFullPage {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-1680px); /* 7 images * 240px spacing */
          }
        }

        @keyframes magnifyInCenter {
          0% {
            transform: scale(1);
          }
          
          /* Approaching center */
          40% {
            transform: scale(1);
          }
          
          /* Enter center - magnify quickly */
          45% {
            transform: scale(2);
          }
          
          /* Stay magnified for 2 seconds */
          60% {
            transform: scale(2);
          }
          
          /* Leave center - back to normal */
          65% {
            transform: scale(1);
          }
          
          100% {
            transform: scale(1);
          }
        }

        /* Pause animation on hover */
        .carousel-container-full:hover .carousel-track,
        .carousel-container-full:hover .carousel-item {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}