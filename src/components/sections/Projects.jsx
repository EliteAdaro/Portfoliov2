import { motion } from 'framer-motion'
import { ExternalLink, Github, Folder } from 'lucide-react'
import { projects } from '../../config/siteData'
import SectionHeading from '../ui/SectionHeading'

function ProjectCard({ project, index }) {
  const Wrapper = project.liveUrl ? 'a' : 'div'
  const wrapperProps = project.liveUrl
    ? { href: project.liveUrl, target: '_blank', rel: 'noopener noreferrer' }
    : {}

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.15 }}
      className="group relative"
    >
      <Wrapper
        {...wrapperProps}
        className="block h-full p-6 md:p-8 rounded-xl border border-slate-200 dark:border-navy-lighter bg-white dark:bg-navy-light hover:border-primary/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-primary/5 no-underline"
      >
        <div className="flex items-center justify-between mb-6">
          <Folder size={40} className="text-primary" strokeWidth={1} />
          <div className="flex gap-3">
            {project.githubUrl && (
              <span
                onClick={(e) => {
                  e.preventDefault()
                  window.open(project.githubUrl, '_blank')
                }}
                className="text-slate-400 dark:text-light-slate hover:text-primary transition-colors cursor-pointer"
                aria-label={`${project.title} source code`}
              >
                <Github size={20} />
              </span>
            )}
            {project.liveUrl && (
              <span className="text-slate-400 dark:text-light-slate hover:text-primary transition-colors">
                <ExternalLink size={20} />
              </span>
            )}
          </div>
        </div>

        <h3 className="text-xl font-bold text-slate-900 dark:text-lightest-slate mb-3 group-hover:text-primary transition-colors">
          {project.title}
        </h3>

        <p className="text-slate-600 dark:text-slate-text text-sm leading-relaxed mb-6">
          {project.description}
        </p>

        <div className="flex flex-wrap gap-2 mt-auto">
          {project.tech.map((tech) => (
            <span
              key={tech}
              className="text-xs font-mono text-slate-500 dark:text-slate-text"
            >
              {tech}
            </span>
          ))}
        </div>
      </Wrapper>
    </motion.div>
  )
}

export default function Projects() {
  return (
    <section id="projects" className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <SectionHeading number="03" title="Things I've Built" />

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, i) => (
            <ProjectCard key={project.title} project={project} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
