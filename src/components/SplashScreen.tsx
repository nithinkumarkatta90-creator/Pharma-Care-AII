import { motion } from 'motion/react';
import { Shield } from 'lucide-react';

export default function SplashScreen() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0B1120]">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0, 0.71, 0.2, 1.01], scale: { type: 'spring', damping: 14, stiffness: 120 } }}
        className="relative"
      >
        <div className="w-24 h-24 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-[2rem] shadow-2xl shadow-teal-500/30 flex items-center justify-center">
          <Shield className="text-white w-12 h-12" />
        </div>
        <motion.div
          animate={{ scale: [1, 1.25, 1], opacity: [0.2, 0.45, 0.2] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-0 bg-teal-400/20 rounded-[2rem] blur-2xl -z-10"
        />
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.45, duration: 0.5 }}
        className="mt-8 text-center"
      >
        <h1 className="text-2xl font-black text-white tracking-tight">
          Pharma<span className="text-teal-400">Care</span>
        </h1>
        <p className="text-slate-400 text-sm font-medium mt-1">
          Evidence-Based Healthcare Reference
        </p>
      </motion.div>

      <div className="absolute bottom-12 flex flex-col items-center gap-4">
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ scale: [1, 1.6, 1], opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.22 }}
              className="w-1.5 h-1.5 bg-teal-500 rounded-full"
            />
          ))}
        </div>
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">
          Initializing Secure Environment
        </p>
      </div>
    </div>
  );
}
