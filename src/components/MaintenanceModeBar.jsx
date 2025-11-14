import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

const MaintenanceModeBar = () => {
  return (
    <motion.div
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="bg-yellow-500 text-white py-2 px-4 text-center text-sm font-medium fixed top-0 left-0 right-0 z-[100] shadow-md"
    >
      <div className="container mx-auto flex items-center justify-center gap-2">
        <AlertTriangle className="h-4 w-4" />
        <span>الموقع قيد الصيانة حالياً. نعتذر عن الإزعاج.</span>
      </div>
    </motion.div>
  );
};

export default MaintenanceModeBar;

