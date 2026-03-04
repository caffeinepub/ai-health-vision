import { Phone, Siren } from "lucide-react";
import { motion } from "motion/react";

export default function EmergencyBanner() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative overflow-hidden rounded-xl bg-red-50 border-2 border-red-500 p-4"
      data-ocid="analyze.error_state"
    >
      {/* Pulsing background */}
      <div className="absolute inset-0 bg-red-500/5 animate-pulse" />
      <div className="relative flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-500 flex items-center justify-center animate-bounce">
          <Siren size={20} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-red-700 leading-tight">
            ⚠️ Emergency Detected
          </h3>
          <p className="text-red-600 font-semibold mt-1">
            Please visit the nearest hospital immediately.
          </p>
          <p className="text-red-500 text-sm mt-1">
            This condition requires immediate medical attention. Do not delay.
          </p>
          <a
            href="tel:911"
            className="mt-3 inline-flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors"
          >
            <Phone size={14} />
            Call Emergency Services
          </a>
        </div>
      </div>
    </motion.div>
  );
}
