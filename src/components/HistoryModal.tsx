import React from 'react';
import { X, Clock, Trash2, ArrowRight, Package } from 'lucide-react';
import { SavedGeneration } from '../types';

interface HistoryModalProps {
  items: SavedGeneration[];
  onSelect: (item: SavedGeneration) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  items,
  onSelect,
  onDelete,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-[#FAF7F0] border border-[#E7E1D3] rounded-2xl max-w-lg w-full max-h-[85vh] shadow-2xl flex flex-col overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="bg-emerald-800 text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-700 flex items-center justify-center text-amber-300">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-heading text-lg font-bold">Aapka Generation History</h3>
              <p className="text-emerald-100 text-xs">Aakhri 10 product packs (sirf aapke browser mein saved)</p>
            </div>
          </div>
          <button onClick={onClose} className="text-emerald-200 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-3 grow">
          {items.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Package className="w-10 h-10 text-gray-400 mx-auto mb-2 opacity-50" />
              <p className="font-semibold text-sm">Abhi tak koi product generate nahi kiya gaya hai.</p>
              <p className="text-xs text-gray-400 mt-1">
                Pehla content pack generate karte hi yahan save ho jayega.
              </p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-[#E7E1D3] hover:border-emerald-500 rounded-xl p-3.5 flex items-center justify-between gap-3 shadow-2xs hover:shadow-sm transition-all group"
              >
                <div
                  className="grow cursor-pointer"
                  onClick={() => {
                    onSelect(item);
                    onClose();
                  }}
                >
                  <div className="flex items-center gap-2">
                    <h4 className="font-heading font-bold text-gray-900 text-sm group-hover:text-emerald-700 transition-colors line-clamp-1">
                      {item.productName}
                    </h4>
                    {item.category && (
                      <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.5 rounded-md font-semibold shrink-0">
                        {item.category}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">
                    {new Date(item.timestamp).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => {
                      onSelect(item);
                      onClose();
                    }}
                    className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded-lg text-xs font-semibold flex items-center gap-1"
                    title="Load this pack"
                  >
                    <span>Dekhein</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDelete(item.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete from history"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
