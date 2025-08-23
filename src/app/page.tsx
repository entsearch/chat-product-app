'use client';
import { useState } from 'react';
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

  return (
    <div className="flex flex-col h-screen bg-white text-black">
      <div className="text-center mt-12">
        <h1 className="text-5xl font-bold text-blue-600">Discover Your Perfect TV</h1>
        <p className="text-lg text-gray-600 mt-2">Ask anything about TVs—I'm here to help!</p>
      </div>

      <div className="flex-1 overflow-y-auto p-8 space-y-8 pb-40">
        <AnimatePresence>
          {messages.map((msg, index) => (
            msg.role === 'user' ? (
              <motion.div
                key={index}
                className="flex justify-end pr-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="bg-blue-600 text-white p-6 rounded-3xl w-[50%] shadow-lg">
                  <p className="text-lg leading-relaxed">{msg.content}</p>
                </div>
              </motion.div>
            ) : (
              <ChatResponse
                key={index}
                message={msg as any}
                index={index}
                onLearnMore={handleLearnMore}
                onCompare={handleCompareToggle}
                compareProducts={compareProducts}
                sheetOpen={!!sheetProduct}
              />
            )
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