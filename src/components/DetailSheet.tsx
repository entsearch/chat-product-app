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
          className="fixed right-8 top-[130px] h-[70vh] w-1/3 bg-gray-400 p-6 overflow-y-auto shadow-2xl border border-gray-400 rounded-3xl z-50"
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <button
            className="absolute top-3 right-3 text-xl text-gray-600 hover:text-black bg-gray-100 hover:bg-gray-200 w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-200"
            onClick={() => setSheetProduct(null)}
          >
            ×
          </button>
          {sheetProduct.comparison ? (
            <div className="space-y-4 mt-8 text-center">
              <h2 className="text-2xl font-bold text-black">Compare TVs</h2>
              
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm mx-auto">
                  <thead>
                    <tr>
                      <th className="text-center p-2 bg-gray-200 border-b-2 border-gray-400 font-semibold text-black text-xs">Spec</th>
                      {sheetProduct.tvs.map((tv: any) => (
                        <th key={tv.id} className="text-center p-2 bg-gray-200 border-b-2 border-gray-400">
                          <div className="flex flex-col items-center">
                            <img src={tv.image} alt={tv.name} className="w-12 h-12 object-contain rounded-lg mb-1" />
                            <span className="font-bold text-xs text-black">{tv.name}</span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-200">
                      <td className="p-2 font-medium text-black bg-gray-200 text-xs text-center">Screen Size</td>
                      {sheetProduct.tvs.map((tv: any) => (
                        <td key={tv.id} className="p-2 text-center text-black text-xs">55"</td>
                      ))}
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="p-2 font-medium text-black bg-gray-200 text-xs text-center">Display</td>
                      {sheetProduct.tvs.map((tv: any) => (
                        <td key={tv.id} className="p-2 text-center text-black text-xs">QLED</td>
                      ))}
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="p-2 font-medium text-black bg-gray-200 text-xs text-center">Resolution</td>
                      {sheetProduct.tvs.map((tv: any) => (
                        <td key={tv.id} className="p-2 text-center text-black text-xs">4K UHD</td>
                      ))}
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="p-2 font-medium text-black bg-gray-200 text-xs text-center">HDR</td>
                      {sheetProduct.tvs.map((tv: any) => (
                        <td key={tv.id} className="p-2 text-center text-black text-xs">HDR10+</td>
                      ))}
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="p-2 font-medium text-black bg-gray-200 text-xs text-center">Price</td>
                      {sheetProduct.tvs.map((tv: any) => (
                        <td key={tv.id} className="p-2 text-center text-black font-bold text-xs">$1,299</td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="space-y-4 mt-8 text-center">
              <h2 className="text-2xl font-bold text-black">{sheetProduct.name}</h2>
              <img src={sheetProduct.image} alt={sheetProduct.name} className="w-full h-[200px] object-contain rounded-lg" />
              <p className="text-base text-black leading-relaxed">{sheetProduct.learn_more}</p>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}