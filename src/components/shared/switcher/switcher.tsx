import useDarkSide from '@/hook/useDarkSide'
import { useState } from 'react'
import { DarkModeSwitch } from 'react-toggle-dark-mode'

export default function Switcher() {
  const [colorTheme, setTheme] = useDarkSide()
  const [darkSide, setDarkSide] = useState(colorTheme === 'dark')

  const toggleDarkMode = (checked) => {
    setTheme(colorTheme === 'light' ? 'dark' : 'light')
    setDarkSide(checked)
  }

  return (
    <div>
      <DarkModeSwitch
        checked={darkSide}
        onChange={toggleDarkMode}
        size={20}
        moonColor="white"
        sunColor="black"
      />
    </div>
  )
}
