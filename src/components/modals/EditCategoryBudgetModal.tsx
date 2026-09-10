import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Target, DollarSign, X } from 'lucide-react';
import { Category } from '../../types';
import { CategoryIcon } from '../CategoryIcon';
import { sounds } from '../../utils/audio';

interface EditCategoryBudgetModalProps {
  category: Category | null;
  currentSpend: number;
  isOpen: boolean;
  onClose: () => void;
  onSave: (categoryId: string, newBudget: number) => void;
}

export const EditCategoryBudgetModal: React.FC<EditCategoryBudgetModalProps> = ({
  category,
  currentSpend,
  isOpen,
  onClose,
  onSave
}) => {
  const [budgetVal, setBudgetVal] = useState(category ? category.monthlyBudget.toString() : '0');

  React.useEffect(() => {
    if (category) {
      setBudgetVal(category.monthlyBudget.toString());
    }
  }, [category]);

  if (!isOpen || !category) return null;

  const parsedBudget = parseFloat(budgetVal) || 0;
  const newPercentage = parsedBudget > 0 ? Math.round((currentSpend / parsedBudget) * 100) : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedBudget < 0) return;
    sounds.playTap();
    onSave(category.id, parsedBudget);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="w-full max-w-[340px] bg-white rounded-3xl p-5 shadow-2xl border border-neutral-200"
        >
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                style={{ backgroundColor: category.color }}
              >
                <CategoryIcon name={category.icon} size={16} />
              </div>
              <h3 className="font-semibold text-neutral-900 text-sm">{category.name} Budget</h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100"
            >
              <X size={16} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="pt-4 space-y-4">
            <div>
              <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block mb-1.5">
                Monthly Target Limit
              </label>
              <div className="flex items-center bg-neutral-100 rounded-xl px-3 py-2 focus-within:ring-2 focus-within:ring-[#007AFF]">
                <DollarSign size={18} className="text-neutral-400" />
                <input
                  id="category-budget-input"
                  type="number"
                  step="10"
                  min="0"
                  value={budgetVal}
                  onChange={(e) => setBudgetVal(e.target.value)}
                  className="w-full bg-transparent text-lg font-bold text-neutral-900 outline-none ml-1"
                />
              </div>
            </div>

            {/* Live Impact Preview */}
            <div className="bg-neutral-50 rounded-xl p-3 border border-neutral-100 text-xs space-y-1.5">
              <div className="flex justify-between text-neutral-500">
                <span>Current Spent This Month:</span>
                <span className="font-semibold text-neutral-800">${currentSpend.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-neutral-500">
                <span>New Utilization:</span>
                <span
                  className={`font-bold ${
                    newPercentage >= 100
                      ? 'text-red-500'
                      : newPercentage >= 90
                      ? 'text-amber-600'
                      : newPercentage >= 75
                      ? 'text-yellow-600'
                      : 'text-emerald-600'
                  }`}
                >
                  {newPercentage}%
                </span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2 rounded-xl text-xs font-medium text-neutral-600 bg-neutral-100 hover:bg-neutral-200 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                id="save-category-budget-btn"
                className="flex-1 py-2 rounded-xl text-xs font-semibold text-white bg-[#007AFF] hover:bg-blue-600 transition shadow-xs"
              >
                Save Budget
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
