import { useEffect } from 'react'

export default function ConsoleMessage() {
  useEffect(() => {
    const styles = [
      'color: #64ffda; font-size: 14px; font-weight: bold;',
      'color: #8892b0; font-size: 12px;',
      'color: #ccd6f6; font-size: 11px;',
    ]

    console.log(
      `%c
  ╔═══════════════════════════════════════════╗
  ║                                           ║
  ║     Hey there, curious developer! 👀      ║
  ║                                           ║
  ╚═══════════════════════════════════════════╝
      `,
      styles[0],
    )
    console.log(
      "%cYou're inspecting my portfolio? I like your style.",
      styles[1],
    )
    console.log(
      '%cTry these easter eggs on the site:',
      styles[2],
    )
    console.log(
      '%c  ↑↑↓↓←→←→BA  — Konami Code\n  Click the KN logo 7 times\n  Type "hire me" anywhere\n  Rapidly click the theme toggle 5x\n  Press Ctrl+K for a surprise',
      styles[2],
    )
    console.log(
      "%c\nLet's connect! → kayne.99@hotmail.com",
      styles[0],
    )
  }, [])

  return null
}
