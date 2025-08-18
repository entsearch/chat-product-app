'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { MdMic, MdThumbUp, MdThumbDown, MdRefresh } from 'react-icons/md';
import { FiSend } from 'react-icons/fi';

// ------------------- ProductCard -------------------
function ProductCard({ name, description, image, price, newPrice, large, learnMore, onLearnMore, compareProducts, setCompareProducts }: any) {
  const hasDiscount = newPrice && parseFloat(newPrice.replace('$', '')) < parseFloat(price.replace('$', ''));
  const isCompared = compareProducts.find((p: any) => p.name === name);
  const isDisabled = !isCompared && compareProducts.length >= 3;

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
        className={`w-full mb-2 rounded-lg object-contain ${large ? 'max-h-[400px]' : 'max-h-[250px]'}`}
      />
      <h2 className="text-xl font-bold mb-1">{name}</h2>
      <p className="text-sm mb-1">{description}</p>

      {/* Price display */}
      <div className="mb-2 flex items-center justify-center space-x-2">
        {hasDiscount ? (
          <>
            <span className="text-2xl font-bold text-blue-600">{newPrice}</span>
            <span className="text-sm line-through text-black/40">{price}</span>
          </>
        ) : (
          <span className="text-2xl font-bold text-blue-600">{price}</span>
        )}
      </div>

      <div className="flex space-x-2 mt-auto">
        <button
          className="bg-blue-600 text-white px-3 py-1 rounded-full font-semibold hover:bg-blue-700 transition"
          onClick={() =>
            onLearnMore({ name, description, image, learnMore, price: hasDiscount ? newPrice : price })
          }
        >
          Learn more
        </button>
        <button
          className={`px-3 py-1 rounded-full font-semibold transition ${
            isCompared ? 'bg-green-600 text-white' : isDisabled ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
          onClick={() => {
            if (isDisabled) return;
            setCompareProducts((prev: any[]) => {
              const exists = prev.find((p) => p.name === name);
              if (exists) return prev.filter((p) => p.name !== name);
              return [...prev, { name, description, image, price, newPrice }];
            });
          }}
        >
          {isCompared ? '✓ Compare' : 'Compare'}
        </button>
        <button className="bg-blue-600 text-white px-3 py-1 rounded-full font-semibold hover:bg-blue-700 transition">
          Add to cart
        </button>
      </div>
    </div>
  );
}

// ------------------- ProductGrid -------------------
function ProductGrid({ products, onLearnMore, compareProducts, setCompareProducts }: any) {
  return (
    <div className="p-6 rounded-3xl shadow-lg">
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          {products.slice(0, 2).map((p: any, i: number) => (
            <ProductCard
              key={i}
              {...p}
              onLearnMore={onLearnMore}
              compareProducts={compareProducts}
              setCompareProducts={setCompareProducts}
            />
          ))}
        </div>
        <div className="grid grid-cols-3 gap-6">
          {products.slice(2, 5).map((p: any, i: number) => (
            <ProductCard
              key={i + 2}
              {...p}
              onLearnMore={onLearnMore}
              compareProducts={compareProducts}
              setCompareProducts={setCompareProducts}
            />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-6 max-w-5xl mx-auto w-full">
          {products.slice(5, 6).map((p: any, i: number) => (
            <ProductCard
              key={i + 5}
              {...p}
              onLearnMore={onLearnMore}
              compareProducts={compareProducts}
              setCompareProducts={setCompareProducts}
              large
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ------------------- Home Component -------------------
export default function Home() {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content?: string; products?: any[] }[]>([]);
  const [input, setInput] = useState('');
  const [typedText, setTypedText] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const [storefrontData, setStorefrontData] = useState<any>(null);
  const [overlayProduct, setOverlayProduct] = useState<any>(null);
  const [compareProducts, setCompareProducts] = useState<any[]>([]);
  const [showCompareOverlay, setShowCompareOverlay] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isCompareMode, setIsCompareMode] = useState(false);

  const indexRef = useRef(0);
  const typingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingCompleteRef = useRef(false);

  // Load JSON
  useEffect(() => {
    fetch('/storefront.json')
      .then((res) => res.json())
      .then((data) => setStorefrontData(data));
  }, []);

  const stableStorefrontData = useMemo(() => storefrontData, [storefrontData]);

  // Typing effect
  useEffect(() => {
    if (!stableStorefrontData?.welcome?.text) return;
    if (!isTypingCompleteRef.current) {
      setTypedText('');
      setShowCursor(true);
      indexRef.current = 0;
    }

    const fullText = stableStorefrontData.welcome.text.replace(/^"|"$/g, '').replace(/\\/g, '').trim();

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
    setMessages([...messages, { role: 'user', content: input }, { role: 'assistant', products: stableStorefrontData?.products }]);
    setInput('');
  };

  if (!stableStorefrontData) return <div className="flex justify-center items-center h-screen">Loading...</div>;

  return (
    <div className="flex flex-col h-screen bg-white relative">
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
              <div key={index} className="space-y-6 relative">
                <div className="bg-black text-white rounded-2xl p-4 space-y-6 relative">
                  <div className="flex justify-end mt-0 mr-0">
                    <div className="bg-blue-500 text-white p-3 break-words flex items-center justify-center w-1/2 min-h-[4.5rem] rounded-tl-2xl rounded-tr-2xl rounded-br-2xl rounded-bl-none">
                      <p className="text-center m-0">{msg.content}</p>
                    </div>
                  </div>

                  <div className="text-white text-center text-5xl font-bold mt-10">{stableStorefrontData.blurb}</div>

                  {nextMsg.products?.length > 0 && (
                    <div className="p-2">
                      <ProductGrid
                        products={nextMsg.products}
                        onLearnMore={(product) => setOverlayProduct(product)}
                        compareProducts={compareProducts}
                        setCompareProducts={setCompareProducts}
                      />
                    </div>
                  )}

                  <div className="absolute bottom-2 left-2 flex space-x-4">
                    <MdThumbUp className="text-white text-2xl hover:text-green-400 cursor-pointer" />
                    <MdThumbDown className="text-white text-2xl hover:text-red-400 cursor-pointer" />
                    <MdRefresh className="text-white text-2xl hover:text-blue-400 cursor-pointer" />
                  </div>
                </div>
              </div>
            );
          }
          return null;
        })}
      </div>

      {/* Learn More Overlay */}
      {overlayProduct && (
        <div
          className="fixed inset-0 z-50 flex justify-center items-center bg-black/50 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && setOverlayProduct(null)}
        >
          <div className="bg-white rounded-xl p-6 max-w-3xl w-full relative">
            <button onClick={() => setOverlayProduct(null)} className="absolute top-4 right-4 text-black text-2xl font-bold hover:text-gray-500">×</button>
            <img src={overlayProduct.image} alt={overlayProduct.name} className="w-full mb-4 rounded-lg object-contain max-h-[400px]" />
            <h2 className="text-3xl font-bold mb-2 text-black">{overlayProduct.description}</h2>
            <p className="text-xl text-gray-700">{overlayProduct.learnMore}</p>
          </div>
        </div>
      )}

      {/* Comparison Overlay */}
      {showCompareOverlay && (
        <div className="fixed inset-0 z-50 flex justify-center items-center bg-black/50 backdrop-blur-sm" onClick={(e) => e.target === e.currentTarget && setShowCompareOverlay(false)}>
          <div className="bg-white rounded-xl p-6 max-w-6xl w-full relative">
            <button onClick={() => setShowCompareOverlay(false)} className="absolute top-4 right-4 text-black text-2xl font-bold hover:text-gray-500">×</button>
            <div className="flex space-x-6 overflow-x-auto">
              {compareProducts.map((p, i) => {
                const hasDiscount = p.newPrice && parseFloat(p.newPrice.replace('$', '')) < parseFloat(p.price.replace('$', ''));
                return (
                  <div key={i} className="bg-gray-50 rounded-xl p-4 min-w-[250px] flex flex-col items-center">
                    <img src={p.image} alt={p.name} className="w-full h-40 object-contain rounded-lg mb-2" />
                    <h2 className="text-xl font-bold mb-1">{p.name}</h2>
                    <p className="text-sm mb-1">{p.description}</p>
                    <div className="flex items-center space-x-2">
                      {hasDiscount ? (
                        <>
                          <span className="text-2xl font-bold text-blue-600">{p.newPrice}</span>
                          <span className="text-sm line-through text-black/40">{p.price}</span>
                        </>
                      ) : (
                        <span className="text-2xl font-bold text-blue-600">{p.price}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Floating Chat + Compare bar */}
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 w-[60%]">
        <div className="flex items-center bg-gray-700/30 backdrop-blur-md border border-white/20 rounded-3xl p-3 shadow-lg" style={{ minHeight: '5.2rem' }}>
          <div className="flex flex-1 items-center gap-2 bg-white rounded-2xl px-3 py-2">
            {compareProducts.map((p, i) => (
              <div key={i} tabIndex={0} className={`w-10 h-10 relative cursor-pointer rounded-lg border ${selectedIndex === i ? 'border-blue-500 border-2' : 'border-gray-300'}`}
                   onClick={() => setSelectedIndex(i)}
                   onKeyDown={(e) => {
                     if ((e.key === 'Delete' || e.key === 'Backspace') && selectedIndex === i) {
                       setCompareProducts((prev) => prev.filter((_, idx) => idx !== i));
                       setSelectedIndex(null);
                     }
                   }}>
                <img src={p.image} alt={p.name} className="w-full h-full object-contain rounded-lg" />
              </div>
            ))}

            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  if (isCompareMode && compareProducts.length >= 2) setShowCompareOverlay(true);
                  else handleSend();
                }
                if ((e.key === 'Delete' || e.key === 'Backspace') && !input && selectedIndex === null) {
                  setCompareProducts((prev) => prev.slice(0, -1));
                }
              }}
              rows={1}
              className="flex-1 resize-none focus:outline-none bg-transparent px-2 py-1 rounded-2xl"
              placeholder="Explore Samsung TVs..."
            />

            {/* Compare Now pill */}
            {compareProducts.length > 0 && (
              <div
                className="flex items-center px-3 py-1 rounded-full text-sm font-medium cursor-pointer bg-blue-600 text-white"
                onClick={() => {
                  // Launch overlay immediately
                  if (compareProducts.length >= 2) {
                    setShowCompareOverlay(true);
                  }
                  setIsCompareMode(true); // keep for state if needed
                }}
              >
                <span>Compare Now</span>
                <button
                  className="ml-2 text-white hover:text-gray-200 focus:outline-none"
                  onClick={(e) => {
                    e.stopPropagation(); // prevent overlay launch
                    setCompareProducts([]); // clear selection
                    setIsCompareMode(false); // exit compare mode
                    setShowCompareOverlay(false); // ensure overlay closed
                  }}
                >
                  ✖
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center ml-3 space-x-2">
            <button onClick={() => { if (isCompareMode && compareProducts.length >= 2) setShowCompareOverlay(true); else handleSend(); }} className="text-blue-500 hover:text-blue-700">
              <FiSend className="w-6 h-6" />
            </button>
            <button className="text-gray-600 hover:text-gray-800"><MdMic className="w-6 h-6" /></button>
          </div>
        </div>
      </div>
    </div> // closes main wrapper div
  ); // closes return
} // closes Home component
