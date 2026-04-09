// Translations for the portfolio. Add new keys here for both languages.
// Use via: const { t } = useLanguage(); t('hero.greeting')

export const translations = {
  en: {
    nav: {
      about: 'About',
      skills: 'Skills',
      projects: 'Projects',
      contact: 'Contact',
      resume: 'Resume',
    },
    hero: {
      greeting: 'Hi, my name is',
      subtitle: 'I build things for the web.',
      description:
        'I am a software development student based in Hengelo, Netherlands, specializing in building polished, accessible, and performant digital experiences. Currently studying ICT at ROC van Twente.',
      ctaWork: 'Check out my work',
      ctaContact: 'Get in touch',
    },
    about: {
      number: '01',
      title: 'About Me',
      paragraphs: [
        (age) =>
          `Hello! I'm Kayne, a passionate and energetic ${age}-year-old from Hengelo. In my daily life, I combine my part-time job at DHL with my studies at ROC van Twente, where I'm pursuing an ICT education. My interest in technology and problem-solving comes in handy in both my work and studies.`,
        "Outside of work and school, I love staying active. Walking in nature helps me clear my head, while I also enjoy spending time with friends — whether that's gaming at home or going out together. Gaming is one of my favorite ways to relax and explore new worlds.",
        'I also played field hockey for many years, a sport I practiced with great enthusiasm. Every Sunday I was on the field with my team, and after the match we enjoyed a social get-together to unwind and catch up.',
        "In short, I'm someone who likes to stay busy, both physically and mentally, and I find it important to maintain a good balance between work, studies, and relaxation.",
      ],
      techIntro: "Here are a few technologies I've been working with recently:",
    },
    skills: {
      number: '02',
      title: 'Skills & Experience',
      technical: 'Technical Skills',
      certificates: 'Certificates',
      learning: 'Currently Learning',
      categories: {
        Frontend: 'Frontend',
        Languages: 'Languages',
        'Tools & Other': 'Tools & Other',
      },
      certificateItems: {
        'HTML / CSS': 'HTML / CSS',
        JavaScript: 'JavaScript',
        Bootstrap: 'Bootstrap',
      },
    },
    projects: {
      number: '03',
      title: "Things I've Built",
      items: {
        'Bootstrap Website': {
          title: 'Bootstrap Website',
          description:
            'A responsive multi-section website built with Bootstrap 5, featuring a modern navbar, marketing hero section, and a responsive grid layout.',
        },
        'Tailwind Website': {
          title: 'Tailwind Website',
          description:
            'A clean, utility-first landing page built entirely with Tailwind CSS, showcasing responsive design without writing custom CSS.',
        },
        'Blog Platform': {
          title: 'Blog Platform',
          description:
            'A blog application with dynamic content cards, image carousels, user authentication modals, and tab-based navigation in the footer.',
        },
      },
    },
    contact: {
      number: '04',
      title: 'Get In Touch',
      intro:
        "I'm currently looking for new opportunities. Whether you have a question or just want to say hi, my inbox is always open!",
      name: 'Name',
      namePlaceholder: 'Your name',
      email: 'Email',
      emailPlaceholder: 'your@email.com',
      company: 'Company',
      optional: '(optional)',
      companyPlaceholder: 'Company name',
      message: 'Message',
      messagePlaceholder: 'Your message...',
      send: 'Send Message',
      sending: 'Sending...',
      sent: 'Message sent!',
      labels: {
        Location: 'Location',
        Phone: 'Phone',
        Email: 'Email',
      },
      openTitle: 'Open to opportunities',
      openBody:
        "I'm actively looking for internships and junior developer positions. Let's build something great together!",
    },
    footer: {
      built: 'Designed & Built by',
    },
    eastereggs: {
      achievement: 'Achievement unlocked!',
      foundSecret: "You found a secret! You're clearly someone who pays attention to detail.",
      funFact: 'Fun fact: This portfolio has 7 easter eggs. How many can you find?',
      almost: 'Almost there...',
    },
  },
  nl: {
    nav: {
      about: 'Over mij',
      skills: 'Vaardigheden',
      projects: 'Projecten',
      contact: 'Contact',
      resume: 'CV',
    },
    hero: {
      greeting: 'Hoi, mijn naam is',
      subtitle: 'Ik bouw dingen voor het web.',
      description:
        'Ik ben een software development student uit Hengelo, gespecialiseerd in het bouwen van gepolijste, toegankelijke en performante digitale ervaringen. Momenteel studeer ik ICT aan het ROC van Twente.',
      ctaWork: 'Bekijk mijn werk',
      ctaContact: 'Neem contact op',
    },
    about: {
      number: '01',
      title: 'Over mij',
      paragraphs: [
        (age) =>
          `Hallo! Ik ben Kayne, een gepassioneerde en energieke ${age}-jarige uit Hengelo. In mijn dagelijks leven combineer ik mijn parttime baan bij DHL met mijn studie aan het ROC van Twente, waar ik een ICT-opleiding volg. Mijn interesse in technologie en probleemoplossing komt zowel in mijn werk als studie goed van pas.`,
        'Buiten werk en school om hou ik ervan actief te blijven. Wandelen in de natuur helpt me mijn hoofd leeg te maken, en ik hou ook van tijd doorbrengen met vrienden — of dat nu thuis gamen is of samen uitgaan. Gamen is een van mijn favoriete manieren om te ontspannen en nieuwe werelden te verkennen.',
        'Ook heb ik jarenlang hockey gespeeld, een sport die ik met veel plezier beoefende. Elke zondag stond ik met mijn team op het veld, en na de wedstrijd gezellig een derde helft om bij te kletsen.',
        'Kortom, ik ben iemand die graag bezig is, zowel fysiek als mentaal, en ik vind het belangrijk om een goede balans te houden tussen werk, studie en ontspanning.',
      ],
      techIntro: 'Hier zijn een paar technologieën waar ik recent mee gewerkt heb:',
    },
    skills: {
      number: '02',
      title: 'Vaardigheden & Ervaring',
      technical: 'Technische vaardigheden',
      certificates: 'Certificaten',
      learning: 'Momenteel aan het leren',
      categories: {
        Frontend: 'Frontend',
        Languages: 'Talen',
        'Tools & Other': 'Tools & Overig',
      },
    },
    projects: {
      number: '03',
      title: 'Wat ik heb gebouwd',
      items: {
        'Bootstrap Website': {
          title: 'Bootstrap Website',
          description:
            'Een responsieve website met meerdere secties, gebouwd met Bootstrap 5. Bevat een moderne navbar, een marketing hero-sectie en een responsief grid-layout.',
        },
        'Tailwind Website': {
          title: 'Tailwind Website',
          description:
            'Een strakke utility-first landingspagina volledig gebouwd met Tailwind CSS, die responsief design laat zien zonder zelf CSS te schrijven.',
        },
        'Blog Platform': {
          title: 'Blog Platform',
          description:
            'Een blogapplicatie met dynamische contentkaarten, image carousels, login-modals en tab-gebaseerde navigatie in de footer.',
        },
      },
    },
    contact: {
      number: '04',
      title: 'Neem contact op',
      intro:
        'Ik ben momenteel op zoek naar nieuwe kansen. Of je nu een vraag hebt of gewoon hallo wilt zeggen, mijn inbox staat altijd open!',
      name: 'Naam',
      namePlaceholder: 'Je naam',
      email: 'E-mail',
      emailPlaceholder: 'jouw@email.nl',
      company: 'Bedrijf',
      optional: '(optioneel)',
      companyPlaceholder: 'Bedrijfsnaam',
      message: 'Bericht',
      messagePlaceholder: 'Je bericht...',
      send: 'Bericht versturen',
      sending: 'Versturen...',
      sent: 'Bericht verstuurd!',
      labels: {
        Location: 'Locatie',
        Phone: 'Telefoon',
        Email: 'E-mail',
      },
      openTitle: 'Open voor kansen',
      openBody:
        'Ik ben actief op zoek naar stages en junior developer functies. Laten we samen iets moois bouwen!',
    },
    footer: {
      built: 'Ontworpen & Gebouwd door',
    },
    eastereggs: {
      achievement: 'Prestatie ontgrendeld!',
      foundSecret: 'Je hebt een geheim gevonden! Je bent duidelijk iemand die op details let.',
      funFact: 'Wist je dat? Dit portfolio bevat 7 easter eggs. Hoeveel kun jij er vinden?',
      almost: 'Bijna...',
    },
  },
}

// Resolve a dotted key like "hero.greeting" against a translations object.
export function resolveKey(obj, key) {
  return key.split('.').reduce((acc, part) => (acc == null ? acc : acc[part]), obj)
}
