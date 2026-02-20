import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from 'react'
import { getCurrentUser } from 'aws-amplify/auth'

type SearchContextType = {
  isOpen: boolean
  openSearch: () => void
  closeSearch: () => void
  toggleSearch: () => void
}

const SearchContext = createContext<SearchContextType>({
  isOpen: false,
  openSearch: () => {},
  closeSearch: () => {},
  toggleSearch: () => {},
})

export function SearchProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const isAuthenticatedRef = useRef(false)

  // Check auth status once on mount
  useEffect(() => {
    getCurrentUser()
      .then(() => { isAuthenticatedRef.current = true })
      .catch(() => { isAuthenticatedRef.current = false })
  }, [])

  const openSearch = () => { if (isAuthenticatedRef.current) setIsOpen(true) }
  const closeSearch = () => setIsOpen(false)
  const toggleSearch = () => { if (isAuthenticatedRef.current) setIsOpen((v) => !v) }

  // Global Cmd+K / Ctrl+K shortcut — only when authenticated
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        if (isAuthenticatedRef.current) setIsOpen((v) => !v)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <SearchContext.Provider value={{ isOpen, openSearch, closeSearch, toggleSearch }}>
      {children}
    </SearchContext.Provider>
  )
}

export function useSearch() {
  return useContext(SearchContext)
}
