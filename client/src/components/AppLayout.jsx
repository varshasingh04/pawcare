import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'

export function AppLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children ?? <Outlet />}
      </main>
      <footer className="border-t border-sky-100/80 bg-white/60 backdrop-blur-sm py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-slate-500">
          <span className="font-display font-semibold text-slate-700">PawCare</span>
          <span>Pet health, simplified.</span>
        </div>
      </footer>
    </div>
  )
}
