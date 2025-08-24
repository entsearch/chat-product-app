import { motion } from 'framer-motion';

interface ProductCardProps {
  id: string;
  name: string;
  image: string;
  specs: { [key: string]: string };
  learn_more: string;
  onLearnMore: (product: any) => void;
  onCompare: (product: any) => void;
  isCompared: boolean;
  maxComparisonsReached: boolean;
}

export default function ProductCard({ 
  id, 
  name, 
  image, 
  specs, 
  learn_more, 
  onLearnMore, 
  onCompare, 
  isCompared, 
  maxComparisonsReached 
}: ProductCardProps) {
  const compareClass = isCompared
    ? 'text-green-500 opacity-100 cursor-pointer'
    : maxComparisonsReached
    ? 'opacity-0 pointer-events-none'
    : 'opacity-0 group-hover:opacity-100 cursor-pointer';
  
  const style = maxComparisonsReached && !isCompared ? { opacity: 0 } : {};

  return (
    <motion.div
      className="bg-white text-black p-8 rounded-3xl flex flex-col items-center text-center h-full relative group border-2 border-blue-200"
      style={{
        background: 'linear-gradient(145deg, #ffffff, #f0f4ff)',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.15), 0 2px 10px rgba(0, 0, 255, 0.1)',
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ 
        scale: 1.04, // Reduced from 1.08
        boxShadow: '0 14px 45px rgba(0, 0, 0, 0.25), 0 4px 15px rgba(0, 0, 255, 0.25)',
        background: 'linear-gradient(145deg, #f0f4ff, #e6e9ff)',
      }}
      transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
    >
      <div className="w-full h-72 flex items-center justify-center mb-6 overflow-hidden relative mt-8 rounded-xl">
        <motion.img 
          src={image} 
          alt={name} 
          className="w-full h-full object-contain rounded-xl"
          style={{ objectFit: 'contain' }}
          whileHover={{ scale: 1.08 }} // Reduced from 1.15
          transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
        />
      </div>
      
      <span
        className={`absolute top-4 right-4 text-blue-600 text-base font-semibold z-10 cursor-pointer ${compareClass}`}
        style={style}
        onClick={() => {
          if (isCompared) {
            onCompare({ id, name, image, specs, learn_more, remove: true });
          } else if (!maxComparisonsReached) {
            onCompare({ id, name, image, specs, learn_more });
          }
        }}
      >
        {isCompared ? '✓ Compared' : 'Compare'}
      </span>
      
      <h2 className="text-2xl font-extrabold mb-4 line-clamp-2 leading-tight text-gray-900">{name}</h2>
      <p className="text-base mb-6 text-gray-700 flex-grow leading-relaxed font-medium">
        {Object.entries(specs).map(([k, v]) => `${k}: ${v}`).join(' • ')}
      </p>
      
      <div className="flex justify-center items-center gap-6 mt-auto w-full">
        <motion.span
          className="text-blue-600 hover:text-blue-800 cursor-pointer font-semibold text-lg"
          onClick={(e) => {
            e.stopPropagation();
            const currentProduct = { id, name, image, learn_more, specs };
            onLearnMore(currentProduct);
          }}
          whileHover={{ scale: 1.08 }} // Reduced from 1.15
          transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
        >
          Learn More
        </motion.span>
        
        <motion.button
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg py-3 px-8 rounded-xl shadow-md"
          onClick={(e) => {
            e.stopPropagation();
            console.log('Buy Now clicked for:', name);
          }}
          whileHover={{ scale: 1.05 }} // Reduced from 1.1
          transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
        >
          BUY NOW
        </motion.button>
      </div>
    </motion.div>
  );
}