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
  if (lowerQuery.includes('8k')) blurb = "Here are awesome 8K TVs";
  if (lowerQuery.includes('under') && lowerQuery.includes('$')) blurb += ` under ${lowerQuery.match(/under\s*\$\d+/i)?.[0] || '$1000'}`;
  return blurb;
}

export default function Home() {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content?: string; products?: any[] }[]>([]);
  const [input, setInput] = useState('');
  const [typedText, setTypedText] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const [storefrontData, setStorefrontData] = useState<any>(null);
  const indexRef = useRef(0);
  const typingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingCompleteRef = useRef(false); // Track if typing is complete

  // Load JSON
  useEffect(() => {
    fetch('/storefront.json')
      .then((res) => res.json())
      .then((data) => {
        console.log("Fetched storefrontData:", JSON.stringify(data));
        setStorefrontData(data);
      });
  }, []);

  // Memoize storefrontData to prevent unnecessary re-runs
  const stableStorefrontData = useMemo(() => storefrontData, [storefrontData]);

  // Typing effect
  useEffect(() => {
    if (!stableStorefrontData || !stableStorefrontData.welcome || !stableStorefrontData.welcome.text) {
      console.log("storefrontData is invalid:", stableStorefrontData);
      return;
    }

    console.log("useEffect running with storefrontData:", JSON.stringify(stableStorefrontData));
    console.log("Raw storefrontData.welcome.text:", stableStorefrontData.welcome.text);

    // Only reset if typing hasn't completed
    if (!isTypingCompleteRef.current) {
      setTypedText('');
      setShowCursor(true);
      indexRef.current = 0;
    }

    const fullText = stableStorefrontData.welcome.text.replace(/^"|"$/g, '').replace(/\\/g, '').trim();

    // Clear any existing interval
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
    }

    typingIntervalRef.current = setInterval(() => {
      if (indexRef.current < fullText.length && fullText[indexRef.current] !== undefined) {
        const currentIndex = indexRef.current;
        console.log(`Index: ${currentIndex}, Char: ${fullText[currentIndex]}`);
        setTypedText((prev) => {
          const newText = prev + fullText[currentIndex];
          console.log("typedText:", newText);
          if (currentIndex === fullText.length - 1) {
            console.log("Final typedText:", newText);
            setShowCursor(false);
            console.log("showCursor set to:", false);
            isTypingCompleteRef.current = true; // Mark typing as complete
            if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
          }
          return newText;
        });
        indexRef.current++;
      } else {
        console.log("Typing complete, hiding cursor");
        console.log("Final typedText:", typedText);
        setShowCursor(false);
        console.log("showCursor set to:", false);
        isTypingCompleteRef.current = true;
        if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
      }
    }, 100); // 100ms for typing speed; change to 50 for faster

    return () => {
      console.log("Cleaning up intervals");
      if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
    };
  }, [stableStorefrontData]);

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages([...messages, { role: 'user', content: input }, { role: 'assistant', products: stableStorefrontData?.products }]);
    setInput('');
  };

  if (!stableStorefrontData) return <div className="flex justify-center items-center h-screen">Loading...</div>;

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Welcome message */}
      <div className="text-center mt-12">
        <h1 className="text-4xl font-bold text-blue-600">
          {typedText}
          {showCursor && <span className="inline-block animate-pulse">|</span>}
        </h1>
        {stableStorefrontData.welcome && <p className="text-sm text-gray-500 mt-2">{stableStorefrontData.welcome.subtext}</p>}
      </div>

      {/* Scrollable messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 pb-40 mt-6">
        {messages.map((msg, index) => {
          const isUserQuery = msg.role === 'user';
          const nextMsg = messages[index + 1];
          const isAssistantResponse = nextMsg && nextMsg.role === 'assistant';

          if (isUserQuery && isAssistantResponse) {
            return (
              <div key={index} className="space-y-4">
                <div className="bg-black text-white rounded-2xl relative p-0">
                  <div className="absolute top-0 right-0 mt-1 mr-1 w-1/2">
                    <div className="bg-blue-500 text-white p-3 break-words flex items-center justify-center min-h-[4.5rem] min-w-[40%] max-w-[100%] rounded-tl-2xl rounded-tr-2xl rounded-br-2xl rounded-bl-none">
                      <p className="text-center">{msg.content}</p>
                    </div>
                  </div>
                  <div className="mt-4 pt-24 text-white text-center text-5xl font-bold">
                    {generateBlurb(msg.content)}
                  </div>
                  <div className="mt-4 mb-4 p-4">
                    <ProductGrid products={nextMsg.products || []} />
                  </div>
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
    <div className="p-2 rounded-3xl shadow-lg">
      <div className="grid gap-4">
        <div className="grid grid-cols-2 gap-4">
          {products.slice(0, 2).map((p, i) => <ProductCard key={i} {...p} />)}
        </div>
        <div className="grid grid-cols-3 gap-4">
          {products.slice(2, 5).map((p, i) => <ProductCard key={i + 2} {...p} />)}
        </div>
        <div className="grid grid-cols-1">
          {products.slice(5, 6).map((p, i) => <ProductCard key={i + 5} {...p} large />)}
        </div>
      </div>
    </div>
  );
}

function ProductCard({ name, description, image, large }: any) {
  const price = getRandomPrice();
  return (
    <div className={`bg-white text-black p-4 flex flex-col items-center text-center shadow-md transform transition-transform hover:scale-105 hover:shadow-2xl rounded-xl ${large ? 'w-full' : ''}`}>
      <img src={image} alt={name} className={`w-full ${large ? 'max-w-full' : 'max-w-lg'} mb-1 rounded-lg object-contain`} />
      <h2 className="text-xl font-bold mb-0.5">{name}</h2>
      <p className="text-sm mb-0.5">{description}</p>
      <p className="text-md font-semibold text-blue-600 mb-1">{price}</p>
      <div className="flex space-x-2 mt-1">
        <button className="bg-blue-600 text-white px-3 py-1 rounded-full font-semibold hover:bg-blue-700 transition">Learn more</button>
        <button className="bg-blue-600 text-white px-3 py-1 rounded-full font-semibold hover:bg-blue-700 transition">Compare</button>
        <button className="bg-blue-600 text-white px-3 py-1 rounded-full font-semibold hover:bg-blue-700 transition">Add to cart</button>
      </div>
    </div>
  );
}