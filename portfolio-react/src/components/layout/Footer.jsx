import { Github, Linkedin, Mail } from 'lucide-react'
import { socialLinks, personalInfo } from '../../config/siteData'

export default function Footer() {
  return (
    <footer className="py-8 text-center border-t border-slate-200 dark:border-navy-lighter">
      <div className="flex justify-center gap-6 mb-4">
        <a
          href={socialLinks.github}
          target="_blank"
          rel="noopener noreferrer"
          className="text-slate-500 dark:text-slate-text hover:text-primary transition-colors"
          aria-label="GitHub"
        >
          <Github size={20} />
        </a>
        <a
          href={socialLinks.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="text-slate-500 dark:text-slate-text hover:text-primary transition-colors"
          aria-label="LinkedIn"
        >
          <Linkedin size={20} />
        </a>
        <a
          href={`mailto:${personalInfo.email}`}
          className="text-slate-500 dark:text-slate-text hover:text-primary transition-colors"
          aria-label="Email"
        >
          <Mail size={20} />
        </a>
      </div>
      <p className="text-sm font-mono text-slate-400 dark:text-slate-text">
        Designed & Built by {personalInfo.name}
      </p>
    </footer>
  )
}
