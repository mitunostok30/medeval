
import React from 'react';

interface RatingScaleProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  required?: boolean;
}

const RatingScale: React.FC<RatingScaleProps> = ({ label, value, onChange, required }) => {
  return (
    <div className="py-4 border-b border-slate-100 last:border-0">
      <p className="text-sm font-medium text-slate-700 mb-3">
        {label} {required && <span className="text-red-500">*</span>}
      </p>
      <div className="flex flex-wrap gap-2">
        {[1, 2, 3, 4, 5].map((num) => (
          <button
            key={num}
            type="button"
            onClick={() => onChange(num)}
            className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all
              ${value === num 
                ? 'bg-blue-600 text-white ring-2 ring-blue-600 ring-offset-2' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            {num}
          </button>
        ))}
        <span className="ml-4 text-xs text-slate-400 italic flex items-center">
          {value === 1 && "Never"}
          {value === 3 && "Sometimes"}
          {value === 5 && "Always"}
        </span>
      </div>
    </div>
  );
};

export default RatingScale;
