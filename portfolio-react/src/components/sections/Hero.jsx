import { lazy, Suspense } from 'react'
import { motion } from 'framer-motion'
import { personalInfo } from '../../config/siteData'

const SceneCanvas = lazy(() => import('../three/SceneCanvas'))

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.3 },
  },
}

const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
}

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* 3D Background */}
      <Suspense fallback={null}>
        <SceneCanvas />
      </Suspense>

      {/* Gradient overlay for light mode */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-navy dark:via-navy dark:to-navy-light" />

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-32">
        <motion.div variants={container} initial="hidden" animate="show">
          <motion.p
            variants={item}
            className="font-mono text-primary text-sm md:text-base mb-5"
          >
            Hi, my name is
          </motion.p>

          <motion.h1
            variants={item}
            className="text-4xl sm:text-5xl md:text-7xl font-extrabold text-slate-900 dark:text-lightest-slate leading-tight"
          >
            {personalInfo.name}.
          </motion.h1>

          <motion.h2
            variants={item}
            className="text-3xl sm:text-4xl md:text-6xl font-bold text-slate-500 dark:text-slate-text mt-2 leading-tight"
          >
            {personalInfo.subtitle}
          </motion.h2>

          <motion.p
            variants={item}
            className="max-w-xl text-slate-600 dark:text-slate-text mt-6 text-base md:text-lg leading-relaxed"
          >
            {personalInfo.description}
          </motion.p>

          <motion.div variants={item} className="mt-10 flex flex-wrap gap-4">
            <a
              href="#projects"
              className="px-8 py-3 border-2 border-primary text-primary font-mono text-sm rounded-lg hover:bg-primary/10 transition-colors"
            >
              Check out my work
            </a>
            <a
              href="#contact"
              className="px-8 py-3 bg-primary text-navy font-mono text-sm font-semibold rounded-lg hover:bg-primary-dark transition-colors"
            >
              Get in touch
            </a>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-5 h-8 border-2 border-slate-400 dark:border-light-slate rounded-full flex justify-center pt-1"
        >
          <div className="w-1 h-2 bg-primary rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  )
}
