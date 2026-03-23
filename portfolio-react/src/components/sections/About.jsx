import { motion } from 'framer-motion'
import { aboutText } from '../../config/siteData'
import SectionHeading from '../ui/SectionHeading'
import AnimatedReveal from '../ui/AnimatedReveal'

export default function About() {
  const technologies = [
    'JavaScript (ES6+)',
    'HTML & CSS',
    'React',
    'Tailwind CSS',
    'Bootstrap 5',
    'C#',
    'Three.js',
    'Git',
  ]

  return (
    <section id="about" className="py-24 px-6">
      <div className="max-w-4xl mx-auto">
        <SectionHeading number="01" title="About Me" />

        <div className="grid md:grid-cols-3 gap-12">
          <div className="md:col-span-2 space-y-4">
            {aboutText.map((paragraph, i) => (
              <AnimatedReveal key={i} delay={i * 0.1}>
                <p className="text-slate-600 dark:text-slate-text leading-relaxed">
                  {paragraph}
                </p>
              </AnimatedReveal>
            ))}

            <AnimatedReveal delay={0.4}>
              <p className="text-slate-600 dark:text-slate-text leading-relaxed mt-4">
                Here are a few technologies I&apos;ve been working with recently:
              </p>
              <ul className="grid grid-cols-2 gap-2 mt-4">
                {technologies.map((tech) => (
                  <li
                    key={tech}
                    className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-text"
                  >
                    <span className="text-primary text-xs">▹</span>
                    {tech}
                  </li>
                ))}
              </ul>
            </AnimatedReveal>
          </div>

          <AnimatedReveal direction="right" delay={0.3}>
            <div className="relative group mx-auto md:mx-0 w-64 h-64">
              {/* Profile image placeholder */}
              <div className="relative z-10 w-full h-full rounded-xl overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5 border-2 border-primary/30 flex items-center justify-center">
                <motion.div
                  className="text-6xl font-bold font-mono text-primary/50"
                  whileHover={{ scale: 1.1 }}
                >
                  KN
                </motion.div>
              </div>
              {/* Decorative border */}
              <div className="absolute top-4 left-4 w-full h-full rounded-xl border-2 border-primary/50 z-0 group-hover:top-2 group-hover:left-2 transition-all duration-300" />
            </div>
          </AnimatedReveal>
        </div>
      </div>
    </section>
  )
}
