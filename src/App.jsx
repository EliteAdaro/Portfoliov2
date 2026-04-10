import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { LanguageProvider } from './context/LanguageContext'
import Layout from './components/layout/Layout'
import HomePage from './pages/HomePage'
import NotFoundPage from './pages/NotFoundPage'
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/react"

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
        <LanguageProvider>
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
        <Analytics />
        <SpeedInsights />
        </LanguageProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
