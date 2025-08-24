'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ChatResponse from '../components/ChatResponse';
import ChatBar from '../components/ChatBar';
import DetailSheet from '../components/DetailSheet';
import { mockLLMResponse } from '../lib/llm';

export default function Home() {
  const [messages, setMessages] = useState<
    { role: 'user' | 'assistant'; content?: string; response_text?: string; cards?: any[]; proactive_tip?: string; comparison?: any[] }[]
  >([]);
  const [input, setInput] = useState('');
  const [sheetProduct, setSheetProduct] = useState<any>(null);
  const [compareProducts, setCompareProducts] = useState<any[]>([]);

  const handleSend = () => {
    if (!input.trim()) return;

    const llmResponse = mockLLMResponse(input);
    setMessages([
      ...messages,
      { role: 'user', content: input },
      { role: 'assistant', ...llmResponse } as any,
    ]);

    if (input.toLowerCase().includes('add') && input.toLowerCase().includes('comparison')) {
      const tvName = input.match(/Neo OLED 4K|Samsung QLED TV|Neo QLED 4K|Vision AI Smart TV|QLED 4K QE1D|Crystal UHD U7900F/i)?.[0];
      if (tvName) {
        const tv = mockLLMResponse('').cards.find((t) => t.name === tvName);
        if (tv && compareProducts.length < 3 && !compareProducts.some((cp) => cp.id === tv.id)) {
          setCompareProducts([...compareProducts, tv]);
        }
      }
    } else if (input.toLowerCase().includes('remove') && input.toLowerCase().includes('comparison')) {
      const tvName = input.match(/Neo OLED 4K|Samsung QLED TV|Neo QLED 4K|Vision AI Smart TV|QLED 4K QE1D|Crystal UHD U7900F/i)?.[0];
      if (tvName) {
        setCompareProducts(compareProducts.filter((cp) => cp.name !== tvName));
      }
    } else if (input.toLowerCase().includes('compare') && compareProducts.length >= 2) {
      setSheetProduct({ comparison: true, tvs: compareProducts });
    }

    setInput('');
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
          GenAI can make mistakes
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
              key={pairIndex}
              message={pair.assistant}
              userQuery={pair.userQuery}
              index={pairIndex}
              onLearnMore={handleLearnMore}
              onCompare={handleCompareToggle}
              compareProducts={compareProducts}
              sheetOpen={!!sheetProduct}
            />
          ))}
        </AnimatePresence>
      </div>

      <ChatBar
        input={input}
        setInput={setInput}
        handleSend={handleSend}
        compareProducts={compareProducts}
        setCompareProducts={setCompareProducts}
        setSheetProduct={setSheetProduct}
      />
      <DetailSheet sheetProduct={sheetProduct} setSheetProduct={setSheetProduct} />
    </div>
  );
}
