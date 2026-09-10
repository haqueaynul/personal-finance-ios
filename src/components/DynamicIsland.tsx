import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, CheckCircle2, Flame, BellRing, ChevronRight } from 'lucide-react';
import { BudgetAlert } from '../types';

interface DynamicIslandProps {
  activeNotification: BudgetAlert | null;
  onTapNotification?: () => void;
  onClearNotification?: () => void;
}

export const DynamicIsland: React.FC<DynamicIslandProps> = ({
  activeNotification,
  onTapNotification,
  onClearNotification
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (activeNotification) {
      setIsExpanded(true);
      const timer = setTimeout(() => {
        setIsExpanded(false);
        if (onClearNotification) {
          setTimeout(onClearNotification, 400);
        }
      }, 5500);
      return () => clearTimeout(timer);
    }
  }, [activeNotification, onClearNotification]);

  const getIcon = () => {
    if (!activeNotification) return null;
    if (activeNotification.severity === 'danger' || activeNotification.severity === 'critical') {
      return <AlertTriangle className="text-red-400 shrink-0" size={16} />;
    }
    if (activeNotification.type === 'velocity') {
      return <Flame className="text-amber-400 shrink-0" size={16} />;
    }
    if (activeNotification.severity === 'caution') {
      return <BellRing className="text-amber-300 shrink-0" size={16} />;
    }
    return <CheckCircle2 className="text-emerald-400 shrink-0" size={16} />;
  };

  return (
    <div className="absolute top-2.5 left-1/2 -translate-x-1/2 z-50 flex items-center justify-center pointer-events-auto">
      <motion.div
        layout
        transition={{ type: 'spring', stiffness: 420, damping: 28 }}
        className={`bg-black text-white rounded-[24px] cursor-pointer shadow-2xl border border-white/10 flex items-center overflow-hidden transition-all ${
          isExpanded
            ? 'w-[340px] px-3.5 py-2.5 min-h-[46px]'
            : 'w-[124px] h-[32px] px-3 justify-between'
        }`}
        onClick={() => {
          if (activeNotification && onTapNotification) {
            onTapNotification();
            setIsExpanded(false);
          } else {
            setIsExpanded(!isExpanded);
          }
        }}
      >
        <AnimatePresence mode="wait">
          {isExpanded && activeNotification ? (
            <motion.div
              key="expanded-content"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="flex items-center justify-between w-full gap-2.5"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                  {getIcon()}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-semibold text-white truncate leading-tight">
                    {activeNotification.title}
                  </span>
                  <span className="text-[10px] text-neutral-400 truncate leading-tight">
                    {activeNotification.categoryName || 'Automated Budget Alert'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {activeNotification.percentage && (
                  <span
                    className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full ${
                      activeNotification.percentage >= 100
                        ? 'bg-red-500/30 text-red-300'
                        : activeNotification.percentage >= 90
                        ? 'bg-amber-500/30 text-amber-300'
                        : 'bg-yellow-500/30 text-yellow-300'
                    }`}
                  >
                    {Math.round(activeNotification.percentage)}%
                  </span>
                )}
                <ChevronRight size={14} className="text-neutral-500" />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="compact-content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex items-center justify-between w-full"
            >
              {/* Camera sensor dot */}
              <div className="w-2.5 h-2.5 rounded-full bg-neutral-900 border border-neutral-800" />
              {/* FaceID / Lens reflection */}
              <div className="w-2.5 h-2.5 rounded-full bg-[#111936] flex items-center justify-center">
                <div className="w-1 h-1 rounded-full bg-blue-500/40" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
