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
    ? 'text-green-600 opacity-100 cursor-pointer'
    : maxComparisonsReached
    ? 'opacity-0 pointer-events-none'
    : 'opacity-0 group-hover:opacity-100 cursor-pointer';
  
  const style = maxComparisonsReached && !isCompared ? { opacity: 0 } : {};
  
  return (
    <motion.div
      className="bg-white text-black p-8 rounded-3xl flex flex-col items-center text-center h-full relative group border border-gray-300"
      style={{
        background: 'linear-gradient(145deg, #ffffff, #f8f9fa)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
      }}
      whileHover={{ 
        scale: 1.02,
        background: 'linear-gradient(145deg, #f8f9fa, #e9ecef)',
      }}
      transition={{ duration: 0.2 }}
    >
      <div className="w-full h-72 flex items-center justify-center mb-6 overflow-hidden relative mt-8">
        <img 
          src={image} 
          alt={name} 
          className="w-full h-full object-contain rounded-xl"
          style={{ objectFit: 'contain' }}
        />
      </div>
      
      <span
        className={`absolute top-4 right-4 text-blue-600 text-base font-medium z-10 cursor-pointer ${compareClass}`}
        style={style}
        onClick={() => {
          if (isCompared) {
            // Remove from comparison if already compared
            onCompare({ id, name, image, specs, learn_more, remove: true });
          } else if (!maxComparisonsReached) {
            // Add to comparison if not at max limit
            onCompare({ id, name, image, specs, learn_more });
          }
        }}
      >
        {isCompared ? '✓ Compare' : 'Compare'}
      </span>
      
      <h2 className="text-2xl font-bold mb-4 line-clamp-2 leading-tight text-black">{name}</h2>
      <p className="text-base mb-6 text-black flex-grow leading-relaxed">
        {Object.entries(specs).map(([k, v]) => `${k}: ${v}`).join(' • ')}
      </p>
      
      <div className="flex justify-center items-center gap-6 mt-auto w-full">
        <span
          className="text-blue-600 hover:text-blue-700 cursor-pointer font-semibold text-lg transition-colors duration-200"
          onClick={(e) => {
            e.stopPropagation();
            // Toggle sheet - if same product is already open, close it
            const currentProduct = { id, name, image, learn_more, specs };
            onLearnMore(currentProduct);
          }}
        >
          Learn More
        </span>
        
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg py-3 px-6 rounded-xl transition-colors duration-200"
          onClick={(e) => {
            e.stopPropagation();
            // Add your buy now functionality here
            console.log('Buy Now clicked for:', name);
          }}
        >
          BUY NOW
        </button>
      </div>
    </motion.div>
  );
}