import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import Layout from './components/layout/Layout'
import HomePage from './pages/HomePage'
import NotFoundPage from './pages/NotFoundPage'

// Easter eggs — lazy loaded to keep initial bundle small
import { lazy, Suspense } from 'react'
const ConsoleMessage = lazy(() => import('./components/eastereggs/ConsoleMessage'))
const KonamiCode = lazy(() => import('./components/eastereggs/KonamiCode'))
const HireMeDetector = lazy(() => import('./components/eastereggs/HireMeDetector'))
const CyberpunkMode = lazy(() => import('./components/eastereggs/CyberpunkMode'))
const LogoClickSecret = lazy(() => import('./components/eastereggs/LogoClickSecret'))
const CommandPalette = lazy(() => import('./components/eastereggs/CommandPalette'))

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Layout>

        {/* Easter eggs — render globally, lazy loaded */}
        <Suspense fallback={null}>
          <ConsoleMessage />
          <KonamiCode />
          <HireMeDetector />
          <CyberpunkMode />
          <LogoClickSecret />
          <CommandPalette />
        </Suspense>
      </ThemeProvider>
    </BrowserRouter>
  )
}
