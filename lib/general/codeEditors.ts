import { vscodeDark, vscodeLight } from '@uiw/codemirror-theme-vscode'

export const getTheme = (theme: string) => {
  if (theme === 'dark') {
    return vscodeDark
  } else {
    return vscodeLight
  }
}
