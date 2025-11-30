export type ThemeType = 'halloween' | 'christmas'

export interface ThemeConfig {
  name: string
  colors: {
    primary: string
    secondary: string
    accent: string
    gradient: string
  }
  icons: {
    main: string
    rating1: string
    rating2: string
  }
  labels: {
    rating1: string
    rating2: string
    rating1Descriptions: Record<number, string>
    rating2Descriptions: Record<number, string>
  }
}

export const THEMES: Record<ThemeType, ThemeConfig> = {
  halloween: {
    name: 'Halloween',
    colors: {
      primary: 'orange',
      secondary: 'purple',
      accent: 'orange',
      gradient: 'from-orange-500 to-purple-600',
    },
    icons: {
      main: '🎃',
      rating1: '🍬',
      rating2: '✨',
    },
    labels: {
      rating1: 'Candy Quality',
      rating2: 'Decorations',
      rating1Descriptions: {
        1: '😕 Not great',
        2: '🍬 Okay',
        3: '🍭 Good candy',
        4: '🍫 Great stuff!',
        5: '🎃 Full size bars!',
      },
      rating2Descriptions: {
        1: '👻 Minimal effort',
        2: '🎃 Some decorations',
        3: '🦇 Pretty festive',
        4: '🕷️ Very spooky!',
        5: '💀 Amazing setup!',
      },
    },
  },
  christmas: {
    name: 'Christmas',
    colors: {
      primary: 'red',
      secondary: 'green',
      accent: 'red',
      gradient: 'from-red-500 to-green-600',
    },
    icons: {
      main: '🎄',
      rating1: '💡',
      rating2: '🎁',
    },
    labels: {
      rating1: 'Christmas Lights',
      rating2: 'Decorations',
      rating1Descriptions: {
        1: '💡 Barely lit',
        2: '✨ Some lights',
        3: '🌟 Nice display',
        4: '⭐ Bright & beautiful',
        5: '💫 Spectacular show!',
      },
      rating2Descriptions: {
        1: '🎄 Minimal effort',
        2: '⛄ Some decorations',
        3: '🎅 Pretty festive',
        4: '🦌 Very merry!',
        5: '🎁 Amazing setup!',
      },
    },
  },
}
