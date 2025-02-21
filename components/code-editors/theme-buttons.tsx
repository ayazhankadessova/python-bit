import React from 'react'
import { Button } from '@/components/ui/button'
import { Sun, Moon } from 'lucide-react'

interface ThemeButtonsProps {
  theme:  'dark' | 'vscode';
  setTheme: (theme:  'dark' | 'vscode') => void;
}

const ThemeButtons: React.FC<ThemeButtonsProps> = ({ theme, setTheme }) => {
  return (
    <div className='flex items-center gap-2'>
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
        <Sun className='w-4 h-4' />
      </Button>
      <Button
        variant={theme === 'dark' ? 'default' : 'ghost'}
        size='sm'
        onClick={() => setTheme('dark')}
        className={
          theme === 'dark'
            ? 'bg-purple-500 text-white hover:bg-purple-600'
            : 'text-purple-500/90 hover:text-purple-500'
        }
      >
        <Moon className='w-4 h-4' />
      </Button>
    </div>
  )
}

export default ThemeButtons
