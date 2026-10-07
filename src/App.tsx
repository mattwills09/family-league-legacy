import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

import { Header } from './components/Header';
import { DashboardPage } from './components/pages/DashboardPage';

import './App.css';

type Theme = 'light' | 'dark';

function App() {
  const getInitialTheme = (): Theme => {
    const savedTheme = localStorage.getItem('theme') as Theme | null

    if (savedTheme) {
      return savedTheme
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light'
  }

  const [theme, setTheme] = useState<Theme>(getInitialTheme)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme((currentTheme) =>
      currentTheme === 'dark' ? 'light' : 'dark'
    )
  }

  return (
    <div className="app">
      <Header />

      <button
        className="theme-toggle"
        type="button"
        onClick={toggleTheme}
        aria-label={`Switch to ${
          theme === 'dark' ? 'light' : 'dark'
        } mode`}
      >
        {theme === 'dark' ? (
          <Sun className="icon" />
        ) : (
          <Moon className="icon" />
        )}
      </button>

      <DashboardPage />
    </div>
  )
}

export default App