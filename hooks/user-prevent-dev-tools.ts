// hooks/usePreventDevTools.ts
import { useEffect } from 'react'

export const usePreventDevTools = () => {
  useEffect(() => {
    // Função para desabilitar o clique direito
    const preventRightClick = (e: MouseEvent) => {
      e.preventDefault()
      return false
    }

    // Função para desabilitar atalhos de teclado comuns do DevTools
    const preventDevToolsShortcuts = (e: KeyboardEvent) => {
      // Ctrl+Shift+I ou F12
      if (
        (e.keyCode === 73 && e.ctrlKey && e.shiftKey) || // Ctrl+Shift+I
        (e.keyCode === 123) // F12
      ) {
        e.preventDefault()
        return false
      }

      // Ctrl+Shift+C
      if (e.keyCode === 67 && e.ctrlKey && e.shiftKey) {
        e.preventDefault()
        return false
      }

      // Ctrl+Shift+J
      if (e.keyCode === 74 && e.ctrlKey && e.shiftKey) {
        e.preventDefault()
        return false
      }

      // Ctrl+U (View Source)
      if (e.keyCode === 85 && e.ctrlKey) {
        e.preventDefault()
        return false
      }
    }

    // Detectar se DevTools está aberto
    const detectDevTools = () => {
      const threshold = 160
      const widthThreshold = window.outerWidth - window.innerWidth > threshold
      const heightThreshold = window.outerHeight - window.innerHeight > threshold

      if (widthThreshold || heightThreshold) {
        document.body.innerHTML = 'DevTools não é permitido nesta aplicação.'
      }
    }

    // Adicionar listeners
    window.addEventListener('contextmenu', preventRightClick)
    window.addEventListener('keydown', preventDevToolsShortcuts)
    window.addEventListener('resize', detectDevTools)

    // Desabilitar console em produção
    if (process.env.NODE_ENV === 'production') {
      console.log = () => {}
      console.error = () => {}
      console.debug = () => {}
      console.info = () => {}
    }

    return () => {
      // Remover listeners ao desmontar
      window.removeEventListener('contextmenu', preventRightClick)
      window.removeEventListener('keydown', preventDevToolsShortcuts)
      window.removeEventListener('resize', detectDevTools)
    }
  }, [])
}