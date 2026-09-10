import React, { useState } from 'react';
import { Search, Plus, Trash2, Filter, ArrowDownRight, ArrowUpRight, CreditCard, Tag } from 'lucide-react';
import { Category, Transaction, TransactionType } from '../../types';
import { CategoryIcon } from '../CategoryIcon';
import { sounds } from '../../utils/audio';

interface ExpensesViewProps {
  transactions: Transaction[];
  categories: Category[];
  onOpenAddModal: () => void;
  onDeleteTransaction: (id: string) => void;
}

export const ExpensesView: React.FC<ExpensesViewProps> = ({
  transactions,
  categories,
  onOpenAddModal,
  onDeleteTransaction
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<'all' | TransactionType>('all');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');

  // Filter transactions
  const filtered = transactions.filter((tx) => {
    const matchesSearch =
      tx.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tx.merchant && tx.merchant.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (tx.notes && tx.notes.toLowerCase().includes(searchQuery.toLowerCase())) ||
      tx.amount.toString().includes(searchQuery);

    const matchesType = selectedTypeFilter === 'all' || tx.type === selectedTypeFilter;
    const matchesCategory = selectedCategoryFilter === 'all' || tx.categoryId === selectedCategoryFilter;

    return matchesSearch && matchesType && matchesCategory;
  });

  const totalSpent = filtered
    .filter((t) => t.type === 'expense')
    .reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar pb-20 px-4 pt-1 space-y-3">
      {/* iOS Header */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
            Transactions
          </span>
          <h1 className="text-2xl font-extrabold text-neutral-900 tracking-tight">Activity</h1>
        </div>

        <button
          onClick={() => {
            sounds.playTap();
            onOpenAddModal();
          }}
          className="px-3 py-1.5 rounded-full bg-[#007AFF] text-white text-xs font-semibold flex items-center gap-1 shadow-xs hover:bg-blue-600 transition"
        >
          <Plus size={15} />
          Add
        </button>
      </div>

      {/* iOS Search Bar */}
      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
        <input
          id="search-transactions-input"
          type="text"
          placeholder="Search merchant, title, or amount..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-neutral-200/70 focus:bg-white text-xs text-neutral-900 rounded-xl pl-9 pr-3 py-2.5 outline-none transition border border-transparent focus:border-[#007AFF]"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 text-xs"
          >
            Clear
          </button>
        )}
      </div>

      {/* Type Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
        {[
          { id: 'all', label: 'All Activity' },
          { id: 'expense', label: 'Expenses' },
          { id: 'income', label: 'Income' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              sounds.playTap();
              setSelectedTypeFilter(tab.id as 'all' | TransactionType);
            }}
            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition ${
              selectedTypeFilter === tab.id
                ? 'bg-[#007AFF] text-white shadow-xs'
                : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Category Horizontal Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
        <button
          onClick={() => {
            sounds.playTap();
            setSelectedCategoryFilter('all');
          }}
          className={`px-2.5 py-0.5 rounded-lg text-[11px] font-medium whitespace-nowrap transition ${
            selectedCategoryFilter === 'all'
              ? 'bg-neutral-800 text-white'
              : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
          }`}
        >
          All Categories
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => {
              sounds.playTap();
              setSelectedCategoryFilter(cat.id);
            }}
            className={`px-2.5 py-0.5 rounded-lg text-[11px] font-medium whitespace-nowrap transition flex items-center gap-1 ${
              selectedCategoryFilter === cat.id
                ? 'bg-neutral-800 text-white'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
            {cat.name}
          </button>
        ))}
      </div>

      {/* Summary Stat */}
      <div className="flex items-center justify-between text-[11px] text-neutral-500 px-1 pt-1">
        <span>{filtered.length} entries found</span>
        <span>Filtered Total: <strong className="text-neutral-900">${totalSpent.toFixed(2)}</strong></span>
      </div>

      {/* Transactions List */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-neutral-200/70 text-neutral-400">
            <Tag size={32} className="mx-auto mb-2 opacity-40" />
            <p className="text-sm font-semibold text-neutral-700">No Transactions Found</p>
            <p className="text-xs mt-1">Try changing your filters or add a new transaction.</p>
          </div>
        ) : (
          filtered.map((tx) => {
            const cat = categories.find((c) => c.id === tx.categoryId);
            const isExpense = tx.type === 'expense';
            return (
              <div
                key={tx.id}
                className="bg-white rounded-2xl p-3.5 shadow-xs border border-neutral-200/70 flex items-center justify-between group transition hover:border-neutral-300"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0 shadow-xs"
                    style={{ backgroundColor: cat ? cat.color : '#8E8E93' }}
                  >
                    <CategoryIcon name={cat ? cat.icon : 'DollarSign'} size={18} />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-neutral-900 block truncate">
                      {tx.title}
                    </span>
                    <div className="flex items-center gap-1.5 text-[11px] text-neutral-500 mt-0.5">
                      <span className="font-medium text-neutral-700">{cat?.name || 'General'}</span>
                      <span>•</span>
                      <span>{tx.paymentMethod}</span>
                      <span>•</span>
                      <span>{tx.date}</span>
                    </div>
                    {tx.notes && (
                      <span className="text-[10px] text-neutral-400 italic block truncate mt-0.5">
                        "{tx.notes}"
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <div className="text-right">
                    <span
                      className={`text-sm font-extrabold tracking-tight ${
                        isExpense ? 'text-neutral-900' : 'text-[#34C759]'
                      }`}
                    >
                      {isExpense ? '-' : '+'}${tx.amount.toFixed(2)}
                    </span>
                    {tx.isRecurring && (
                      <span className="text-[9px] text-blue-500 font-bold block">Recurring</span>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      sounds.playTap();
                      onDeleteTransaction(tx.id);
                    }}
                    title="Delete Transaction"
                    className="p-1.5 text-neutral-300 hover:text-red-500 rounded-lg hover:bg-neutral-100 transition"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
