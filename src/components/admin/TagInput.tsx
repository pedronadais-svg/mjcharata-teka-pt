'use client';

import { useState, type KeyboardEvent } from 'react';
import { X } from 'lucide-react';

interface TagInputProps {
  label: string;
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}

export function TagInput({ label, tags, onChange, placeholder = 'Adicionar tag...' }: TagInputProps) {
  const [input, setInput] = useState('');

  function addTag(value: string) {
    const tag = value.trim();
    if (tag && !tags.includes(tag)) {
      onChange([...tags, tag]);
    }
    setInput('');
  }

  function removeTag(index: number) {
    onChange(tags.filter((_, i) => i !== index));
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(input);
    }
    if (e.key === 'Backspace' && !input && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  }

  return (
    <div>
      <label className="block text-sm font-medium text-teka-dark mb-1">{label}</label>
      <div className="flex flex-wrap gap-1.5 p-2 rounded border border-gray-300 bg-white min-h-[42px] focus-within:ring-2 focus-within:ring-teka-red/30 focus-within:border-teka-red">
        {tags.map((tag, i) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-sm rounded text-teka-dark"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(i)}
              className="text-gray-400 hover:text-red-500"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => input && addTag(input)}
          placeholder={tags.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[100px] text-sm outline-none bg-transparent"
        />
      </div>
      <p className="text-xs text-gray-400 mt-1">Pressione Enter ou , para adicionar</p>
    </div>
  );
}
