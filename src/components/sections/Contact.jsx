import { useState } from 'react'
import { motion } from 'framer-motion'
import { Send, MapPin, Phone, Mail, CheckCircle } from 'lucide-react'
import { personalInfo } from '../../config/siteData'
import SectionHeading from '../ui/SectionHeading'
import AnimatedReveal from '../ui/AnimatedReveal'

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    message: '',
  })
  const [submitted, setSubmitted] = useState(false)
  const [sending, setSending] = useState(false)

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSending(true)

    // Opens the user's email client with pre-filled fields
    const subject = encodeURIComponent(`Portfolio Contact from ${formData.name}`)
    const body = encodeURIComponent(
      `Name: ${formData.name}\nEmail: ${formData.email}\nCompany: ${formData.company || 'N/A'}\n\nMessage:\n${formData.message}`
    )
    window.location.href = `mailto:${personalInfo.email}?subject=${subject}&body=${body}`

    setSubmitted(true)
    setSending(false)
    setFormData({ name: '', email: '', company: '', message: '' })
    setTimeout(() => setSubmitted(false), 5000)
  }

  const contactDetails = [
    {
      icon: MapPin,
      label: 'Location',
      value: personalInfo.location,
      href: `https://www.google.com/maps?q=Hengelo, Nederland`,
    },
    {
      icon: Phone,
      label: 'Phone',
      value: personalInfo.phone,
      href: null,
    },
    {
      icon: Mail,
      label: 'Email',
      value: personalInfo.email,
      href: `mailto:${personalInfo.email}`,
    },
  ]

  return (
    <section id="contact" className="py-24 px-6">
      <div className="max-w-4xl mx-auto">
        <SectionHeading number="04" title="Get In Touch" />

        <AnimatedReveal>
          <p className="text-center text-slate-600 dark:text-slate-text max-w-lg mx-auto mb-12">
            I&apos;m currently looking for new opportunities. Whether you have a
            question or just want to say hi, my inbox is always open!
          </p>
        </AnimatedReveal>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact Form */}
          <AnimatedReveal direction="left">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-slate-700 dark:text-light-slate mb-1"
                  >
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-navy-lighter bg-white dark:bg-navy-light text-slate-900 dark:text-lightest-slate focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-slate-700 dark:text-light-slate mb-1"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-navy-lighter bg-white dark:bg-navy-light text-slate-900 dark:text-lightest-slate focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="company"
                  className="block text-sm font-medium text-slate-700 dark:text-light-slate mb-1"
                >
                  Company{' '}
                  <span className="text-slate-400 dark:text-slate-text">
                    (optional)
                  </span>
                </label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-navy-lighter bg-white dark:bg-navy-light text-slate-900 dark:text-lightest-slate focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                  placeholder="Company name"
                />
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-slate-700 dark:text-light-slate mb-1"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-navy-lighter bg-white dark:bg-navy-light text-slate-900 dark:text-lightest-slate focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors resize-none"
                  placeholder="Your message..."
                />
              </div>

              <motion.button
                type="submit"
                disabled={sending}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary text-navy font-semibold font-mono text-sm rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
              >
                {submitted ? (
                  <>
                    <CheckCircle size={18} />
                    Message sent!
                  </>
                ) : sending ? (
                  'Sending...'
                ) : (
                  <>
                    <Send size={18} />
                    Send Message
                  </>
                )}
              </motion.button>
            </form>
          </AnimatedReveal>

          {/* Contact Details */}
          <AnimatedReveal direction="right" delay={0.2}>
            <div className="space-y-6">
              {contactDetails.map((detail) => {
                const Wrapper = detail.href ? 'a' : 'div'
                const wrapperProps = detail.href
                  ? {
                      href: detail.href,
                      target: detail.label === 'Location' ? '_blank' : undefined,
                      rel: detail.label === 'Location' ? 'noopener noreferrer' : undefined,
                    }
                  : {}

                return (
                  <Wrapper
                    key={detail.label}
                    {...wrapperProps}
                    className="flex items-start gap-4 p-4 rounded-xl border border-slate-200 dark:border-navy-lighter hover:border-primary/50 transition-all group"
                  >
                    <div className="p-3 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                      <detail.icon size={20} />
                    </div>
                    <div>
                      <p className="text-xs font-mono text-slate-400 dark:text-slate-text uppercase tracking-wider">
                        {detail.label}
                      </p>
                      <p className="text-slate-700 dark:text-lightest-slate font-medium mt-1">
                        {detail.value}
                      </p>
                    </div>
                  </Wrapper>
                )
              })}

              <div className="p-6 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20">
                <p className="font-mono text-primary text-sm mb-2">
                  Open to opportunities
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-text">
                  I&apos;m actively looking for internships and junior developer
                  positions. Let&apos;s build something great together!
                </p>
              </div>
            </div>
          </AnimatedReveal>
        </div>
      </div>
    </section>
  )
}
