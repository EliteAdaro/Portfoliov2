import { motion } from 'framer-motion'
import { skills, certificates } from '../../config/siteData'
import SectionHeading from '../ui/SectionHeading'
import AnimatedReveal from '../ui/AnimatedReveal'

function SkillBar({ skill, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group"
    >
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-semibold text-slate-700 dark:text-light-slate group-hover:text-primary transition-colors">
          {skill.name}
        </span>
        <span className="text-xs font-mono text-primary">{skill.level}%</span>
      </div>
      <div className="h-2 bg-slate-200 dark:bg-navy-lighter rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${skill.level}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.3 + index * 0.1, ease: 'easeOut' }}
          className="h-full rounded-full bg-gradient-to-r from-primary/80 to-primary"
        />
      </div>
    </motion.div>
  )
}

export default function Skills() {
  return (
    <section id="skills" className="py-24 px-6">
      <div className="max-w-4xl mx-auto">
        <SectionHeading number="02" title="Skills & Experience" />

        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <AnimatedReveal>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-lightest-slate mb-6">
                Technical Skills
              </h3>
            </AnimatedReveal>
            <div className="space-y-5">
              {skills.map((skill, i) => (
                <SkillBar key={skill.name} skill={skill} index={i} />
              ))}
            </div>
          </div>

          <div>
            <AnimatedReveal delay={0.2}>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-lightest-slate mb-6">
                Certificates
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
                  Currently Learning
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
