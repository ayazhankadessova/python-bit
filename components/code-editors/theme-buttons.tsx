import React from 'react'
import { Button } from '@/components/ui/button'
import { Sun, Moon, Code2 } from 'lucide-react'

interface ThemeButtonsProps {
  theme: 'light' | 'dark' | 'vscode';
  setTheme: (theme: 'light' | 'dark' | 'vscode') => void;
}

const ThemeButtons: React.FC<ThemeButtonsProps> = ({ theme, setTheme }) => {
  return (
    <div className='flex items-center gap-2'>
      <Button
        variant={theme === 'light' ? 'default' : 'ghost'}
        size='sm'
        onClick={() => setTheme('light')}
        className={
          theme === 'light'
            ? 'bg-amber-500 text-white hover:bg-amber-600'
            : 'text-amber-500/90 hover:text-amber-500'
        }
      >
        <Sun className='w-4 h-4' />
      </Button>
      <Button
        variant={theme === 'dark' ? 'default' : 'ghost'}
        size='sm'
        onClick={() => setTheme('dark')}
        className={
          theme === 'dark'
            ? 'bg-blue-500 text-white hover:bg-blue-600'
            : 'text-blue-500/90 hover:text-blue-500'
        }
      >
        <Moon className='w-4 h-4' />
      </Button>
      <Button
        variant={theme === 'vscode' ? 'default' : 'ghost'}
        size='sm'
        onClick={() => setTheme('vscode')}
        className={
          theme === 'vscode'
            ? 'bg-purple-500 text-white hover:bg-purple-600'
            : 'text-purple-500/90 hover:text-purple-500'
        }
      >
        <Code2 className='w-4 h-4' />
      </Button>
    </div>
  )
}

export default ThemeButtons
