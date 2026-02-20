import type { ReactNode } from 'react'
import Footer from './Footer'
import SearchModal from './SearchModal'
import { SearchProvider } from '../lib/SearchContext'
import { PageSectionsProvider } from '../lib/PageSectionsContext'

type AppLayoutProps = {
  children: ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <PageSectionsProvider>
    <SearchProvider>
      <div className="flex flex-col min-h-screen">
        <div className="flex-1">{children}</div>
        <Footer />
      </div>
      <SearchModal />
    </SearchProvider>
    </PageSectionsProvider>
  )
}
