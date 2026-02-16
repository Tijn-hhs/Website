import { useState, useRef, useEffect } from 'react'
import type { CostSliderConfig } from '../lib/cityConfig'

interface CostSliderProps {
  config: CostSliderConfig
  value: number
  onChange: (value: number) => void
  id: string
}

export default function CostSlider({ config, value, onChange, id }: CostSliderProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(Number(e.target.value))
  }

  const handleValueClick = () => {
    setEditValue(value.toString())
    setIsEditing(true)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers
    const newValue = e.target.value.replace(/[^0-9]/g, '')
    setEditValue(newValue)
  }

  const handleInputBlur = () => {
    const numValue = Number(editValue)
    if (!isNaN(numValue) && editValue !== '') {
      // Allow any non-negative value
      const clampedValue = Math.max(0, numValue)
      onChange(clampedValue)
    }
    setIsEditing(false)
  }

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleInputBlur()
    } else if (e.key === 'Escape') {
      setIsEditing(false)
    }
  }

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const percentage = ((value - config.min) / (config.max - config.min)) * 100

  return (
    <div className="space-y-3">
      {/* Label en gekozen bedrag */}
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-sm font-semibold text-slate-900">
          {config.label}
        </label>
        {isEditing ? (
          <div className="flex items-center gap-1">
            <span className="text-lg font-semibold text-blue-700">€</span>
            <input
              ref={inputRef}
              type="text"
              value={editValue}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              onKeyDown={handleInputKeyDown}
              className="w-24 px-2 py-1 text-lg font-semibold text-blue-700 border-2 border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-sm font-normal text-slate-600">/month</span>
          </div>
        ) : (
          <button
            onClick={handleValueClick}
            className="text-lg font-semibold text-blue-700 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-2 py-1 transition-colors cursor-pointer"
            type="button"
            title="Click to edit amount"
          >
            €{value.toLocaleString('nl-NL')}
            <span className="text-sm font-normal text-slate-600">/month</span>
          </button>
        )}
      </div>

      {/* Slider */}
      <div className="relative">
        <input
          type="range"
          id={id}
          min={config.min}
          max={config.max}
          step={config.step}
          value={value}
          onChange={handleChange}
          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          style={{
            background: `linear-gradient(to right, #1d4ed8 0%, #1d4ed8 ${percentage}%, #e2e8f0 ${percentage}%, #e2e8f0 100%)`,
          }}
          aria-label={config.label}
          aria-valuemin={config.min}
          aria-valuemax={config.max}
          aria-valuenow={value}
          aria-valuetext={`€${value} per month`}
        />
        
        {/* Custom thumb styling via CSS */}
        <style>{`
          input[type="range"]::-webkit-slider-thumb {
            appearance: none;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: #1d4ed8;
            cursor: pointer;
            border: 3px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            transition: transform 0.15s ease;
          }
          input[type="range"]::-webkit-slider-thumb:hover {
            transform: scale(1.1);
          }
          input[type="range"]:focus::-webkit-slider-thumb {
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.5);
          }
          input[type="range"]::-moz-range-thumb {
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: #1d4ed8;
            cursor: pointer;
            border: 3px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            transition: transform 0.15s ease;
          }
          input[type="range"]::-moz-range-thumb:hover {
            transform: scale(1.1);
          }
          input[type="range"]:focus::-moz-range-thumb {
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.5);
          }
        `}</style>
      </div>

      {/* Min en max labels */}
      <div className="flex justify-between text-xs text-slate-500 px-1">
        <span>Low budget (€{config.min})</span>
        <span>High budget (€{config.max})</span>
      </div>

      {/* Uitleg - matches body text styling */}
      <div className="mt-2">
        <p className="text-sm text-slate-600">
          {config.description}
        </p>
      </div>
    </div>
  )
}
