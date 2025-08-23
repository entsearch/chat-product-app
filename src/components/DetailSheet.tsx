import { motion, AnimatePresence } from 'framer-motion';

interface DetailSheetProps {
  sheetProduct: any;
  setSheetProduct: (product: any) => void;
}

export default function DetailSheet({ sheetProduct, setSheetProduct }: DetailSheetProps) {
  return (
    <AnimatePresence>
      {sheetProduct && (
        <motion.div
          className="fixed top-0 right-0 h-full w-1/3 bg-gray-800 p-6 overflow-y-auto shadow-2xl"
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ duration: 0.3 }}
        >
          <button
            className="absolute top-4 right-4 text-2xl text-gray-400 hover:text-white"
            onClick={() => setSheetProduct(null)}
          >
            ×
          </button>
          {sheetProduct.comparison ? (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold">Compare TVs</h2>
              <div className="grid grid-cols-2 gap-4">
                {sheetProduct.tvs.map((tv: any) => (
                  <div key={tv.id} className="bg-gray-700 p-4 rounded-xl">
                    <img src={tv.image} alt={tv.name} className="w-full h-[200px] object-contain rounded-lg mb-2" />
                    <h3 className="text-xl font-bold">{tv.name}</h3>
                    <p className="text-sm">{Object.entries(tv.specs).map(([k, v]) => `${k}: ${v}`).join(' • ')}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold">{sheetProduct.name}</h2>
              <img src={sheetProduct.image} alt={sheetProduct.name} className="w-full h-[400px] object-contain rounded-lg" />
              <p className="text-lg">{sheetProduct.learn_more}</p>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
