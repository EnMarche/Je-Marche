import React, { FunctionComponent, useEffect, useState } from 'react'
import Theme from './Theme'
import { DefaultTheme, ThemeContext } from '.'
import RegionTheme from '../core/entities/RegionTheme'
import BlueTheme from './BlueTheme'
import YellowTheme from './YellowTheme'
import RedTheme from './RedTheme'
import OrangeTheme from './OrangeTheme'
import GreenTheme from './GreenTheme'
import PinkTheme from './PinkTheme'
import PurpleTheme from './PurpleTheme'
import { themeRepository } from '../di/DependencyProvider'

type Props = Readonly<{ children: any }>

const ThemeManager: FunctionComponent<Props> = ({ children }) => {
  const [themeState, setThemeState] = useState<Theme>(DefaultTheme)
  const setMode = (mode: RegionTheme) => {
    const theme = getTheme(mode)
    setThemeState(theme)
  }

  useEffect(() => {
    themeRepository.getRegionTheme().then((regionTheme) => {
      setMode(regionTheme)
    })
  }, [])

  return (
    <ThemeContext.Provider value={{ theme: themeState, setTheme: setMode }}>
      {children}
    </ThemeContext.Provider>
  )
}

function getTheme(theme: RegionTheme): Theme {
  switch (theme) {
    case RegionTheme.BLUE:
      return BlueTheme
    case RegionTheme.YELLOW:
      return YellowTheme
    case RegionTheme.RED:
      return RedTheme
    case RegionTheme.ORANGE:
      return OrangeTheme
    case RegionTheme.GREEN:
      return GreenTheme
    case RegionTheme.PINK:
      return PinkTheme
    case RegionTheme.PURPLE:
      return PurpleTheme
  }
}

export default ThemeManager
