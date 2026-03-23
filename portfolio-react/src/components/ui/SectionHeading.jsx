import { motion } from 'framer-motion'

export default function SectionHeading({ number, title }) {
  return (
    <motion.h2
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="flex items-center gap-3 text-2xl md:text-3xl font-bold mb-10 text-slate-900 dark:text-lightest-slate"
    >
      <span className="font-mono text-primary text-lg md:text-xl font-normal">
        {number}.
      </span>
      {title}
      <span className="hidden sm:block h-px flex-1 bg-slate-200 dark:bg-navy-lighter ml-4" />
    </motion.h2>
  )
}
