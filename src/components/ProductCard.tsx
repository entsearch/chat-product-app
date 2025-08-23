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

export default function ProductCard({ id, name, image, specs, learn_more, onLearnMore, onCompare, isCompared, maxComparisonsReached }: ProductCardProps) {
  const compareClass = isCompared
    ? 'text-green-400 opacity-100 cursor-pointer'
    : maxComparisonsReached
    ? 'opacity-0 pointer-events-none'
    : 'opacity-0 hover:opacity-100';

  const style = maxComparisonsReached && !isCompared ? { opacity: 0 } : {};

  return (
    <motion.div
      className="bg-gray-800 text-white p-6 rounded-xl flex flex-col items-center text-center h-full relative group"
      whileHover={{ scale: 1.05, boxShadow: '0 10px 20px rgba(0, 122, 255, 0.3)' }}
      transition={{ duration: 0.2 }}
    >
      <span
        className={`absolute top-2 right-2 text-blue-400 ${compareClass}`}
        style={style}
        onClick={() => !maxComparisonsReached && !isCompared && onCompare({ id, name, image, specs, learn_more })}
      >
        {isCompared ? '✓ Compare' : 'Compare'}
      </span>
      <img src={image} alt={name} className="w-full h-[300px] object-contain rounded-lg mb-4" />
      <h2 className="text-2xl font-bold mb-2">{name}</h2>
      <p className="text-sm mb-2">{Object.entries(specs).map(([k, v]) => `${k}: ${v}`).join(' • ')}</p>
      <span
        className="text-blue-400 hover:text-blue-300 cursor-pointer font-semibold text-lg"
        onClick={() => onLearnMore({ id, name, image, learn_more, specs })}
      >
        Learn More
      </span>
    </motion.div>
  );
}