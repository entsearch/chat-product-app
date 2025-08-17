'use client';

import { useState, useEffect } from 'react';
import { MdMic } from 'react-icons/md';
import { FiSend } from 'react-icons/fi';

const mockProducts = [
  {
    name: 'Neo OLED 4K',
    description: 'Experience stunning picture quality with advanced processing.',
    image: 'https://images.samsung.com/is/image/samsung/p6pim/us/qn75qn1efafxza/gallery/us-neo-qled-qn75qn1efafxza-front-black-546228291?$product-details-jpg$',
  },
  {
    name: 'Samsung QLED TV',
    description: 'Vibrant colors, deep blacks, and smart features.',
    image: 'https://image-us.samsung.com/SamsungUS/home/television-home-theater/tvs/the-terrace/08272024/QN55LST7DAFXZA_007_Front3_Titan_Black_Scom_1600x1200.jpg?$product-details-jpg$',
  },
  {
    name: 'Neo QLED 4K',
    description: 'Perfect blacks, infinite contrast, and cinematic sound.',
    image: 'https://image-us.samsung.com/SamsungUS/home/television-home-theater/tvs/the-terrace/08262024/QN55LST7DAFXZA_007_Front3_Titan_Black_Scom_1600x1200.jpg?$product-details-jpg$',
  },
  {
    name: 'Vision AI Smart TV',
    description: 'High brightness and incredible HDR for every scene.',
    image: 'https://images.samsung.com/is/image/samsung/p6pim/us/qn75qef1afxza/gallery/us-qled-qef1-548500-qn75qef1afxza-547033885?$product-details-jpg$',
  },
  {
    name: 'QLED 4K QE1D',
    description: 'Reliable performance with stunning clarity.',
    image: 'https://image-us.samsung.com/SamsungUS/home/television-home-theater/tvs/qled-4k-tvs/0715202439102/70_65-S.COM_Version_1_V01.jpg?$product-details-jpg$',
  },
  {
    name: 'Crystal UHD U7900F',
    description: 'Affordable brilliance with Dolby Vision.',
    image: 'https://images.samsung.com/is/image/samsung/p6pim/us/un58u7900ffxza/gallery/us-uhd-4k-tv-un58u7900ffxza-front-black-548283704?$product-details-jpg$',
  },
];

function getRandomPrice() {
  return `$${Math.floor(Math.random() * (4000 - 800 + 1) + 800)}`;
}

export default function Home() {
  const [messages, setMessages] = useState<
    { role: 'user' | 'assistant'; content?: string; products?: typeof mockProducts }[]
  >([]);
  const [input, setInput] = useState('');

  const [typedText, setTypedText] = useState('');
  const fullText = 'Welcome to Samsung TV Storefront';
  const [showCursor, setShowCursor] = useState(true);

  // Typing effect
  useEffect(() => {
    let i = 0;
    const typingInterval = setInterval(() => {
      if (i < fullText.length) {
        setTypedText(fullText.slice(0, i + 1));
        i++;
      } else {
        clearInterval(typingInterval);
      }
    }, 100);

    const cursorInterval = setInterval(() => setShowCursor((prev) => !prev), 500);
    return () => {
      clearInterval(typingInterval);
      clearInterval(cursorInterval);
    };
  }, []);

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages([
      ...messages,
      { role: 'user', content: input },
      { role: 'assistant', products: mockProducts },
    ]);
    setInput('');
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Welcome message */}
      <div className="text-center mt-12">
        <h1 className="text-4xl font-bold text-blue-600">
          {typedText}
          {!typedText || typedText.length < fullText.length ? (
            <span className="inline-block animate-pulse">|</span>
          ) : null}
        </h1>
        <p className="text-sm text-gray-500 mt-2">(GenAI can make mistakes)</p>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 pb-40 mt-6">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`p-4 ${
                msg.role === 'user'
                  ? 'bg-blue-500 text-white min-w-[50%] text-center rounded-tl-xl rounded-tr-xl rounded-br-xl rounded-bl-none'
                  : 'bg-black text-white rounded-2xl'
              }`}
            >
              {msg.role === 'user' ? (
                <p>{msg.content}</p>
              ) : (
                <ProductGrid products={msg.products || []} />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Floating chatbox */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 w-[555px] md:w-[720px] bg-gray-400 rounded-3xl p-4 shadow-lg flex items-center space-x-2">
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
          placeholder="Explore Samsung TVs..."
          className="flex-1 px-4 py-2 resize-none rounded-2xl focus:outline-none bg-gray-200"
        />
        <button onClick={handleSend} className="text-white hover:text-blue-200">
          <FiSend className="w-6 h-6" />
        </button>
        <button className="text-white hover:text-blue-200">
          <MdMic className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}

function ProductGrid({ products }: { products: typeof mockProducts }) {
  return (
    <div className="p-6 rounded-3xl shadow-lg">
      <div className="grid gap-8">
        <div className="grid grid-cols-2 gap-8">
          {products.slice(0, 2).map((p, i) => (
            <ProductCard key={i} {...p} />
          ))}
        </div>
        <div className="grid grid-cols-3 gap-8">
          {products.slice(2, 5).map((p, i) => (
            <ProductCard key={i + 2} {...p} />
          ))}
        </div>
        <div className="flex justify-center">
          {products.slice(5, 6).map((p, i) => (
            <ProductCard key={i + 5} {...p} large />
          ))}
        </div>
      </div>
    </div>
  );
}

function ProductCard({
  name,
  description,
  image,
  large,
}: {
  name: string;
  description: string;
  image: string;
  large?: boolean;
}) {
  const price = getRandomPrice();

  return (
    <div
      className={`bg-white text-black p-6 rounded-3xl flex flex-col items-center text-center shadow-md transform transition-transform hover:scale-105 hover:shadow-2xl ${
        large ? 'w-2/3' : ''
      }`}
      style={{ minHeight: '500px' }} // uniform card height
    >
      {/* Top content: image + text */}
      <div className="flex flex-col items-center flex-1 w-full">
        <img
          src={image}
          alt={name}
          className={`w-full ${large ? 'max-w-2xl' : 'max-w-sm'} mb-4 rounded-lg object-contain`}
        />
        <h2 className="text-2xl font-bold mb-2">{name}</h2>
        <p className="text-base">{description}</p>
      </div>

      {/* Price */}
      <p className="text-lg font-semibold text-blue-600 mt-4 mb-2">{price}</p>

      {/* Buttons */}
      <div className="flex space-x-4">
        <button className="bg-blue-600 text-white px-5 py-2 rounded-full font-semibold hover:bg-blue-700 transition">
          Learn more
        </button>
        <button className="bg-blue-600 text-white px-5 py-2 rounded-full font-semibold hover:bg-blue-700 transition">
          Compare
        </button>
        <button className="bg-blue-600 text-white px-5 py-2 rounded-full font-semibold hover:bg-blue-700 transition">
          Add to cart
        </button>
      </div>
    </div>
  );
}


