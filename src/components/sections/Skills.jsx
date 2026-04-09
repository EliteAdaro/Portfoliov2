import { motion } from 'framer-motion'
import { skills, certificates } from '../../config/siteData'
import { useLanguage } from '../../context/LanguageContext'
import SectionHeading from '../ui/SectionHeading'
import AnimatedReveal from '../ui/AnimatedReveal'

function SkillGroup({ group, index }) {
  const { t } = useLanguage()
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <h4 className="font-mono text-primary text-xs mb-3 uppercase tracking-wider">
        {t(`skills.categories.${group.category}`)}
      </h4>
      <div className="flex flex-wrap gap-2">
        {group.items.map((item) => (
          <span
            key={item}
            className="px-3 py-1.5 text-xs font-mono rounded-md bg-slate-100 dark:bg-navy-light border border-slate-200 dark:border-navy-lighter text-slate-700 dark:text-light-slate hover:border-primary hover:text-primary transition-colors"
          >
            {item}
          </span>
        ))}
      </div>
    </motion.div>
  )
}

export default function Skills() {
  const { t } = useLanguage()
  return (
    <section id="skills" className="py-24 px-6">
      <div className="max-w-4xl mx-auto">
        <SectionHeading number="02" title={t('skills.title')} />

        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <AnimatedReveal>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-lightest-slate mb-6">
                {t('skills.technical')}
              </h3>
            </AnimatedReveal>
            <div className="space-y-6">
              {skills.map((group, i) => (
                <SkillGroup key={group.category} group={group} index={i} />
              ))}
            </div>
          </div>

          <div>
            <AnimatedReveal delay={0.2}>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-lightest-slate mb-6">
                {t('skills.certificates')}
              </h3>
            </AnimatedReveal>
            {certificates.map((cert) => (
              <AnimatedReveal key={cert.issuer} delay={0.3}>
                <div className="p-6 rounded-xl border border-slate-200 dark:border-navy-lighter bg-slate-50 dark:bg-navy-light">
                  <h4 className="font-mono text-primary text-sm mb-4">
                    {cert.issuer}
                  </h4>
                  <ul className="space-y-3">
                    {cert.items.map((item) => (
                      <li
                        key={item}
                        className="flex items-center gap-3 text-slate-600 dark:text-light-slate"
                      >
                        <span className="text-primary text-xs">▹</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </AnimatedReveal>
            ))}

            <AnimatedReveal delay={0.5}>
              <div className="mt-6 p-6 rounded-xl border border-slate-200 dark:border-navy-lighter bg-slate-50 dark:bg-navy-light">
                <h4 className="font-mono text-primary text-sm mb-4">
                  {t('skills.learning')}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {['React', 'Three.js', 'Tailwind CSS', 'TypeScript'].map(
                    (tech) => (
                      <span
                        key={tech}
                        className="px-3 py-1 text-xs font-mono rounded-full bg-primary/10 text-primary border border-primary/20"
                      >
                        {tech}
                      </span>
                    ),
                  )}
                </div>
              </div>
            </AnimatedReveal>
          </div>
        </div>
      </div>
    </section>
  )
}
