'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { MdMic } from 'react-icons/md';
import { FiSend } from 'react-icons/fi';

function getRandomPrice() {
  return `$${Math.floor(Math.random() * (4000 - 800 + 1) + 800)}`;
}

function generateBlurb(query: string): string {
  const lowerQuery = query.toLowerCase();
  let blurb = "Here are awesome products matching your request";
  if (lowerQuery.includes('8k')) blurb = "Here are awesome 8K TVs !!!";
  if (lowerQuery.includes('under') && lowerQuery.includes('$')) {
    blurb += ` under ${lowerQuery.match(/under\s*\$\d+/i)?.[0] || '$1000'}`;
  }
  return blurb;
}

export default function Home() {
  const [messages, setMessages] = useState<
    { role: 'user' | 'assistant'; content?: string; products?: any[] }[]
  >([]);
  const [input, setInput] = useState('');
  const [typedText, setTypedText] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const [storefrontData, setStorefrontData] = useState<any>(null);
  const indexRef = useRef(0);
  const typingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingCompleteRef = useRef(false);

  // Load JSON
  useEffect(() => {
    fetch('/storefront.json')
      .then((res) => res.json())
      .then((data) => {
        setStorefrontData(data);
      });
  }, []);

  const stableStorefrontData = useMemo(() => storefrontData, [storefrontData]);

  // Typing effect for welcome
  useEffect(() => {
    if (!stableStorefrontData?.welcome?.text) return;

    if (!isTypingCompleteRef.current) {
      setTypedText('');
      setShowCursor(true);
      indexRef.current = 0;
    }

    const fullText = stableStorefrontData.welcome.text
      .replace(/^"|"$/g, '')
      .replace(/\\/g, '')
      .trim();

    if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);

    typingIntervalRef.current = setInterval(() => {
      if (indexRef.current < fullText.length) {
        const char = fullText[indexRef.current];
        setTypedText((prev) => prev + char);
        indexRef.current++;
        if (indexRef.current === fullText.length) {
          setShowCursor(false);
          isTypingCompleteRef.current = true;
          clearInterval(typingIntervalRef.current!);
        }
      }
    }, 100);

    return () => {
      if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
    };
  }, [stableStorefrontData]);

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages([
      ...messages,
      { role: 'user', content: input },
      { role: 'assistant', products: stableStorefrontData?.products },
    ]);
    setInput('');
  };

  if (!stableStorefrontData)
    return <div className="flex justify-center items-center h-screen">Loading...</div>;

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Welcome message */}
      <div className="text-center mt-12">
        <h1 className="text-4xl font-bold text-blue-600">
          {typedText}
          {showCursor && <span className="inline-block animate-pulse">|</span>}
        </h1>
        {stableStorefrontData.welcome && (
          <p className="text-sm text-gray-500 mt-2">
            {stableStorefrontData.welcome.subtext}
          </p>
        )}
      </div>

      {/* Scrollable messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 pb-40 mt-6">
        {messages.map((msg, index) => {
          const isUserQuery = msg.role === 'user';
          const nextMsg = messages[index + 1];
          const isAssistantResponse = nextMsg && nextMsg.role === 'assistant';

          if (isUserQuery && isAssistantResponse) {
            return (
              <div key={index} className="space-y-6">
                <div className="bg-black text-white rounded-2xl p-1 space-y-6">
                  {/* User bubble */}
                  <div className="flex justify-end mt-0 mr-0">
                    <div
                      className="
                        bg-blue-500 text-white p-3 break-words flex items-center justify-center
                        w-1/2
                        min-h-[4.5rem]
                        rounded-tl-2xl rounded-tr-2xl rounded-br-2xl rounded-bl-none
                      "
                    >
                      <p className="text-center m-0">{msg.content}</p>
                    </div>
                  </div>


                  {/* Blurb */}
                  <div className="text-white text-center text-5xl font-bold mt-10">
                    {generateBlurb(msg.content)}
                  </div>

                  {/* Products */}
                  {nextMsg.products?.length > 0 && (
                    <div className="p-2">
                      <ProductGrid products={nextMsg.products} />
                    </div>
                  )}
                </div>
              </div>
            );
          }
          return null;
        })}
      </div>

      {/* Floating Chat box */}
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 w-[50%]">
        <div className="flex items-center bg-gray-700/30 backdrop-blur-md border border-white/20 rounded-3xl p-4 shadow-lg">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            rows={1}
            className="flex-1 px-4 py-3 rounded-2xl resize-none focus:outline-none bg-white"
            placeholder="Explore Samsung TVs..."
          />
          <button onClick={handleSend} className="ml-3 text-blue-500 hover:text-blue-700">
            <FiSend className="w-6 h-6" />
          </button>
          <button className="ml-3 text-gray-600 hover:text-gray-800">
            <MdMic className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}

function ProductGrid({ products }: { products: any[] }) {
  return (
    <div className="p-6 rounded-3xl shadow-lg">
      <div className="space-y-6">
        {/* First row (2 cards) */}
        <div className="grid grid-cols-2 gap-6">
          {products.slice(0, 2).map((p, i) => (
            <ProductCard key={i} {...p} />
          ))}
        </div>

        {/* Second row (3 cards) */}
        <div className="grid grid-cols-3 gap-6">
          {products.slice(2, 5).map((p, i) => (
            <ProductCard key={i + 2} {...p} />
          ))}
        </div>

        {/* Third row (1 large card, centered with safe margins) */}
        <div className="grid grid-cols-1 gap-6 max-w-5xl mx-auto w-full">
          {products.slice(5, 6).map((p, i) => (
            <ProductCard key={i + 5} {...p} large />
          ))}
        </div>
      </div>
    </div>
  );
}

function ProductCard({ name, description, image, large }: any) {
  const price = getRandomPrice();
  return (
    <div
      className={`
        bg-white text-black p-4 flex flex-col items-center text-center
        shadow-md rounded-xl h-full
        transform transition-transform duration-200
        hover:scale-105 hover:shadow-2xl
      `}
    >
      <img
        src={image}
        alt={name}
        className={`w-full mb-2 rounded-lg object-contain ${
          large ? 'max-h-[400px]' : 'max-h-[250px]'
        }`}
      />
      <h2 className="text-xl font-bold mb-1">{name}</h2>
      <p className="text-sm mb-1">{description}</p>
      <p className="text-md font-semibold text-blue-600 mb-2">{price}</p>
      <div className="flex space-x-2 mt-auto">
        <button className="bg-blue-600 text-white px-3 py-1 rounded-full font-semibold hover:bg-blue-700 transition">
          Learn more
        </button>
        <button className="bg-blue-600 text-white px-3 py-1 rounded-full font-semibold hover:bg-blue-700 transition">
          Compare
        </button>
        <button className="bg-blue-600 text-white px-3 py-1 rounded-full font-semibold hover:bg-blue-700 transition">
          Add to cart
        </button>
      </div>
    </div>
  );
}
