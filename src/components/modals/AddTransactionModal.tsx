import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, Calendar, CreditCard, DollarSign, Repeat, Store, Tag } from 'lucide-react';
import { Category, Transaction, PaymentMethod, TransactionType } from '../../types';
import { CategoryIcon } from '../CategoryIcon';
import { sounds } from '../../utils/audio';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transactionData: Omit<Transaction, 'id' | 'createdAt'>) => void;
  categories: Category[];
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  categories
}) => {
  const [type, setType] = useState<TransactionType>('expense');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || 'food');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Apple Pay');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [merchant, setMerchant] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);

  if (!isOpen) return null;

  const filteredCategories = categories.filter((c) => c.type === type);

  const handleQuickAmount = (val: number) => {
    sounds.playTap();
    const current = parseFloat(amount) || 0;
    setAmount((current + val).toFixed(2));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;
    if (!title.trim()) return;

    sounds.playSuccess();
    sounds.vibrate(25);

    onSave({
      title: title.trim(),
      amount: parsedAmount,
      type,
      categoryId,
      date,
      paymentMethod,
      notes: notes.trim() || undefined,
      merchant: merchant.trim() || title.trim(),
      isRecurring
    });

    // Reset fields
    setTitle('');
    setAmount('');
    setNotes('');
    setMerchant('');
    onClose();
  };

  const paymentMethods: PaymentMethod[] = [
    'Apple Pay',
    'Credit Card',
    'Debit Card',
    'Cash',
    'Bank Transfer'
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-xs transition-opacity">
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 350 }}
          className="w-full max-w-[400px] max-h-[85vh] bg-[#F2F2F7] rounded-t-[32px] shadow-2xl flex flex-col overflow-hidden"
        >
          {/* iOS Grabber */}
          <div className="w-full pt-2.5 pb-1 flex items-center justify-center shrink-0">
            <div className="w-10 h-1.5 bg-neutral-300 rounded-full" />
          </div>

          {/* iOS Navigation Bar Header */}
          <div className="px-4 py-2 flex items-center justify-between border-b border-neutral-200/80 shrink-0">
            <button
              id="cancel-add-tx-btn"
              type="button"
              onClick={() => {
                sounds.playTap();
                onClose();
              }}
              className="text-[#007AFF] text-base font-normal hover:opacity-75"
            >
              Cancel
            </button>

            <span className="font-semibold text-neutral-900 text-base">New Transaction</span>

            <button
              id="save-tx-btn"
              type="button"
              onClick={handleSubmit}
              disabled={!amount || parseFloat(amount) <= 0 || !title.trim()}
              className="text-[#007AFF] text-base font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-75"
            >
              Add
            </button>
          </div>

          {/* Form Body */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
            {/* iOS Segmented Control: Expense vs Income */}
            <div className="bg-neutral-200/80 p-1 rounded-xl flex items-center">
              <button
                type="button"
                id="type-expense-btn"
                onClick={() => {
                  sounds.playTap();
                  setType('expense');
                  const firstExpenseCat = categories.find((c) => c.type === 'expense');
                  if (firstExpenseCat) setCategoryId(firstExpenseCat.id);
                }}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition ${
                  type === 'expense'
                    ? 'bg-white text-neutral-900 shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                Expense
              </button>
              <button
                type="button"
                id="type-income-btn"
                onClick={() => {
                  sounds.playTap();
                  setType('income');
                  const firstIncomeCat = categories.find((c) => c.type === 'income');
                  if (firstIncomeCat) setCategoryId(firstIncomeCat.id);
                }}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition ${
                  type === 'income'
                    ? 'bg-white text-neutral-900 shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                Income
              </button>
            </div>

            {/* Currency Input Box */}
            <div className="bg-white rounded-2xl p-4 shadow-xs border border-neutral-200/60 flex flex-col items-center">
              <span className="text-xs text-neutral-400 font-medium mb-1">
                {type === 'expense' ? 'Amount to Spend' : 'Amount Received'}
              </span>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-3xl font-bold text-neutral-400">$</span>
                <input
                  id="tx-amount-input"
                  type="number"
                  step="0.01"
                  autoFocus
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="text-4xl font-extrabold text-neutral-900 bg-transparent text-center outline-none w-48 tracking-tight"
                />
              </div>

              {/* Quick Amount Chips */}
              <div className="flex items-center gap-2 mt-3">
                {[10, 25, 50, 100].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleQuickAmount(val)}
                    className="px-2.5 py-1 text-xs font-medium rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition"
                  >
                    +${val}
                  </button>
                ))}
              </div>
            </div>

            {/* Title & Merchant Details */}
            <div className="bg-white rounded-2xl shadow-xs border border-neutral-200/60 divide-y divide-neutral-100 overflow-hidden">
              <div className="p-3 flex items-center gap-3">
                <Store size={18} className="text-neutral-400 shrink-0" />
                <input
                  id="tx-title-input"
                  type="text"
                  placeholder="Merchant or Title (e.g. Starbucks)"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-sm text-neutral-900 bg-transparent outline-none font-medium placeholder:text-neutral-400"
                />
              </div>

              <div className="p-3 flex items-center gap-3">
                <Calendar size={18} className="text-neutral-400 shrink-0" />
                <input
                  id="tx-date-input"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full text-sm text-neutral-800 bg-transparent outline-none font-medium"
                />
              </div>
            </div>

            {/* Category Selector */}
            <div className="bg-white rounded-2xl p-3 shadow-xs border border-neutral-200/60">
              <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block mb-2 px-1">
                Category
              </span>
              <div className="grid grid-cols-4 gap-2">
                {filteredCategories.map((cat) => {
                  const isSelected = categoryId === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      id={`select-cat-${cat.id}`}
                      onClick={() => {
                        sounds.playTap();
                        setCategoryId(cat.id);
                      }}
                      className={`flex flex-col items-center p-2 rounded-xl transition ${
                        isSelected
                          ? 'bg-blue-50 border-2 border-[#007AFF]'
                          : 'hover:bg-neutral-50 border border-transparent'
                      }`}
                    >
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center mb-1 text-white shadow-xs"
                        style={{ backgroundColor: cat.color }}
                      >
                        <CategoryIcon name={cat.icon} size={18} className="text-white" />
                      </div>
                      <span className="text-[10px] font-medium text-neutral-700 text-center line-clamp-1">
                        {cat.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="bg-white rounded-2xl p-3 shadow-xs border border-neutral-200/60">
              <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block mb-2 px-1">
                Payment Method
              </span>
              <div className="flex flex-wrap gap-1.5">
                {paymentMethods.map((pm) => {
                  const isSelected = paymentMethod === pm;
                  return (
                    <button
                      key={pm}
                      type="button"
                      onClick={() => {
                        sounds.playTap();
                        setPaymentMethod(pm);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-[#007AFF] text-white shadow-xs'
                          : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                      }`}
                    >
                      <CreditCard size={13} />
                      {pm}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Recurring & Notes */}
            <div className="bg-white rounded-2xl shadow-xs border border-neutral-200/60 divide-y divide-neutral-100 overflow-hidden">
              <div className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Repeat size={18} className="text-neutral-400" />
                  <span className="text-xs font-medium text-neutral-800">Recurring Monthly</span>
                </div>
                <input
                  id="tx-recurring-toggle"
                  type="checkbox"
                  checked={isRecurring}
                  onChange={(e) => setIsRecurring(e.target.checked)}
                  className="w-4 h-4 text-[#007AFF] rounded border-neutral-300 focus:ring-0 cursor-pointer"
                />
              </div>

              <div className="p-3 flex items-center gap-3">
                <Tag size={18} className="text-neutral-400 shrink-0" />
                <input
                  id="tx-notes-input"
                  type="text"
                  placeholder="Notes (optional receipt tags or memo)"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full text-xs text-neutral-700 bg-transparent outline-none placeholder:text-neutral-400"
                />
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
