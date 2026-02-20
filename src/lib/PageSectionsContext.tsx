import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

export type PageSection = {
  id: string
  label: string
}

type PageSectionsContextValue = {
  sections: PageSection[]
  setSections: (sections: PageSection[]) => void
  clearSections: () => void
}

const PageSectionsContext = createContext<PageSectionsContextValue>({
  sections: [],
  setSections: () => {},
  clearSections: () => {},
})

export function PageSectionsProvider({ children }: { children: ReactNode }) {
  const [sections, setSectionsState] = useState<PageSection[]>([])

  const setSections = useCallback((s: PageSection[]) => setSectionsState(s), [])
  const clearSections = useCallback(() => setSectionsState([]), [])

  return (
    <PageSectionsContext.Provider value={{ sections, setSections, clearSections }}>
      {children}
    </PageSectionsContext.Provider>
  )
}

export function usePageSections() {
  return useContext(PageSectionsContext)
}
