import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X, ArrowRight, BookOpen, LayoutDashboard, Info, Sparkles } from 'lucide-react'
import { useSearch } from '../lib/SearchContext'
import { searchItems, allSearchItems, type SearchItem, type SearchResultType } from '../lib/searchData'

// ─── Type badge config ────────────────────────────────────────────────────────
const typeMeta: Record<SearchResultType, { label: string; icon: React.ReactNode; color: string }> = {
  step: {
    label: 'Step',
    icon: <LayoutDashboard size={12} />,
    color: 'bg-blue-100 text-blue-700',
  },
  blog: {
    label: 'Blog',
    icon: <BookOpen size={12} />,
    color: 'bg-violet-100 text-violet-700',
  },
  info: {
    label: 'Info',
    icon: <Info size={12} />,
    color: 'bg-emerald-100 text-emerald-700',
  },
}

// Default items shown when query is empty
const DEFAULT_ITEMS: SearchItem[] = allSearchItems.filter((item) => item.type === 'step').slice(0, 6)

export default function SearchModal() {
  const { isOpen, closeSearch } = useSearch()
  const navigate = useNavigate()

  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const activeItemRef = useRef<HTMLButtonElement>(null)

  const results = query.trim() ? searchItems(query) : DEFAULT_ITEMS

  // Group by category
  const grouped = results.reduce<Record<string, SearchItem[]>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = []
    acc[item.category].push(item)
    return acc
  }, {})

  const flatResults = Object.values(grouped).flat()

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setActiveIndex(0)
      setTimeout(() => inputRef.current?.focus(), 30)
    }
  }, [isOpen])

  // Keep active item in view
  useEffect(() => {
    activeItemRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [activeIndex])

  const handleSelect = useCallback(
    (item: SearchItem) => {
      navigate(item.path)
      closeSearch()
    },
    [navigate, closeSearch],
  )

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, flatResults.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (flatResults[activeIndex]) handleSelect(flatResults[activeIndex])
    } else if (e.key === 'Escape') {
      closeSearch()
    }
  }

  if (!isOpen) return null

  return (
    // ── Overlay ───────────────────────────────────────────────────────────────
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[12vh] px-4"
      role="dialog"
      aria-modal="true"
      aria-label="Search"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={closeSearch}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200/80 overflow-hidden flex flex-col"
        style={{ maxHeight: '70vh' }}
        onKeyDown={handleKeyDown}
      >
        {/* ── Search input row ──────────────────────────────────────────────── */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100">
          <Search size={18} className="text-slate-400 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setActiveIndex(0)
            }}
            placeholder="Search steps, guides, and articles…"
            className="flex-1 bg-transparent text-slate-900 placeholder-slate-400 text-sm outline-none leading-relaxed"
            autoComplete="off"
            spellCheck={false}
          />
          {/* AI hint badge – future integration point */}
          <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium text-slate-400 bg-slate-100 select-none">
            <Sparkles size={11} />
            AI ready
          </span>
          <button
            onClick={closeSearch}
            className="ml-1 p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Close search"
          >
            <X size={16} />
          </button>
        </div>

        {/* ── Results ──────────────────────────────────────────────────────── */}
        <div ref={listRef} className="overflow-y-auto overscroll-contain py-2">
          {flatResults.length === 0 ? (
            <div className="px-4 py-10 text-center">
              <p className="text-sm text-slate-500">No results for &ldquo;{query}&rdquo;</p>
              <p className="mt-1 text-xs text-slate-400">Try a different keyword, like &ldquo;visa&rdquo; or &ldquo;housing&rdquo;.</p>
            </div>
          ) : (
            Object.entries(grouped).map(([category, items]) => (
              <div key={category}>
                {/* Category heading */}
                <p className="px-4 pt-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  {category}
                </p>
                {items.map((item) => {
                  const globalIdx = flatResults.indexOf(item)
                  const isActive = globalIdx === activeIndex
                  const meta = typeMeta[item.type]

                  return (
                    <button
                      key={item.id}
                      ref={isActive ? activeItemRef : undefined}
                      onClick={() => handleSelect(item)}
                      onMouseEnter={() => setActiveIndex(globalIdx)}
                      className={`w-full flex items-start gap-3 px-4 py-2.5 text-left transition-colors duration-75 ${
                        isActive ? 'bg-blue-50' : 'hover:bg-slate-50'
                      }`}
                    >
                      {/* Type badge */}
                      <span
                        className={`inline-flex items-center gap-1 mt-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold flex-shrink-0 ${meta.color}`}
                      >
                        {meta.icon}
                        {meta.label}
                      </span>

                      {/* Text */}
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm font-medium truncate ${
                            isActive ? 'text-blue-700' : 'text-slate-800'
                          }`}
                        >
                          {item.title}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500 line-clamp-1">{item.description}</p>
                      </div>

                      {/* Arrow */}
                      <ArrowRight
                        size={14}
                        className={`flex-shrink-0 mt-1 transition-opacity ${
                          isActive ? 'opacity-100 text-blue-500' : 'opacity-0'
                        }`}
                      />
                    </button>
                  )
                })}
              </div>
            ))
          )}
        </div>

        {/* ── Footer ─────────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-4 px-4 py-2 border-t border-slate-100 bg-slate-50/60">
          <span className="text-[11px] text-slate-400 flex items-center gap-1">
            <kbd className="inline-flex items-center justify-center w-5 h-4 bg-white border border-slate-200 rounded text-[10px] font-medium text-slate-500 shadow-sm">↑</kbd>
            <kbd className="inline-flex items-center justify-center w-5 h-4 bg-white border border-slate-200 rounded text-[10px] font-medium text-slate-500 shadow-sm">↓</kbd>
            navigate
          </span>
          <span className="text-[11px] text-slate-400 flex items-center gap-1">
            <kbd className="inline-flex items-center justify-center px-1.5 h-4 bg-white border border-slate-200 rounded text-[10px] font-medium text-slate-500 shadow-sm">↵</kbd>
            open
          </span>
          <span className="text-[11px] text-slate-400 flex items-center gap-1">
            <kbd className="inline-flex items-center justify-center px-1.5 h-4 bg-white border border-slate-200 rounded text-[10px] font-medium text-slate-500 shadow-sm">esc</kbd>
            close
          </span>
          <span className="ml-auto text-[11px] text-slate-400">
            {flatResults.length} result{flatResults.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
    </div>
  )
}
