import Navbar from './Navbar'
import Footer from './Footer'

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-white dark:bg-navy text-slate-900 dark:text-lightest-slate transition-colors duration-300">
      <Navbar />
      <main>{children}</main>
      <Footer />
    </div>
  )
}
