/********************************************************************************
 * Copyright (c) 2020 TypeFox and others
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *
 * SPDX-License-Identifier: EPL-2.0
 ********************************************************************************/

import { CSSProperties } from 'react';
import { createTheme, Theme } from '@mui/material/styles';

export const MONO_FONT = "'Geist Mono', monospace";
export const NAVBAR_HEIGHT = '3.875rem';
export const NAVBAR_HEIGHT_PX = parseFloat(NAVBAR_HEIGHT) * 16;

type Color = CSSProperties['color'];
interface StatusColors {
  dark: Color;
  light: Color;
}
interface NeutralColors {
  light: Color;
  dark: Color;
}
interface SelectedColors {
  border: Color;
  background: Color;
  backgroundHover: Color;
  hover: Color;
}
interface ScanBackgroundColors {
  default: Color;
  light: Color;
  dark: Color;
}
interface GrayColors {
  start: Color;
  middle: Color;
  end: Color;
  gradient: string;
}
interface UnenforcedColors {
  stripe: string;
}

declare module '@mui/material/styles' {
  interface Palette {
    neutral: NeutralColors;
    textHint: Color;
    checkboxUnchecked: Color;
    passed: StatusColors;
    quarantined: StatusColors;
    rejected: StatusColors;
    errorStatus: StatusColors;
    allowed: Color;
    blocked: Color;
    review: Color;
    selected: SelectedColors;
    scanBackground: ScanBackgroundColors;
    gray: GrayColors;
    unenforced: UnenforcedColors;
    surface2: string;
    surface3: string;
    border2: string;
    accentSoft: string;
    warningSoft: string;
    warningAccent: string;
    bg2: string;
  }
  interface PaletteOptions {
    neutral?: Partial<NeutralColors>;
    textHint?: Color;
    checkboxUnchecked?: Color;
    passed?: Partial<StatusColors>;
    quarantined?: Partial<StatusColors>;
    rejected?: Partial<StatusColors>;
    errorStatus?: Partial<StatusColors>;
    allowed?: Color;
    blocked?: Color;
    review?: Color;
    selected?: Partial<SelectedColors>;
    scanBackground?: Partial<ScanBackgroundColors>;
    gray?: Partial<GrayColors>;
    unenforced?: Partial<UnenforcedColors>;
    surface2?: string;
    surface3?: string;
    border2?: string;
    accentSoft?: string;
    warningSoft?: string;
    warningAccent?: string;
    bg2?: string;
  }
}

declare module '@mui/system/createTheme/shape' {
  interface Shape {
    borderRadiusCard: number;
    borderRadiusPill: number;
  }
}

const floatingPaper = (theme: Theme) => ({
  border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(168, 85, 247, 0.3)' : 'rgba(139, 92, 246, 0.2)'}`,
  boxShadow:
    theme.palette.mode === 'dark'
      ? '0 16px 48px -6px rgba(0, 0, 0, 0.95), 0 4px 24px -2px rgba(168, 85, 247, 0.25)'
      : '0 16px 40px -6px rgba(139, 92, 246, 0.15), 0 4px 16px -2px rgba(0, 0, 0, 0.05)',
  backgroundColor: theme.palette.mode === 'dark' ? '#090712' : '#ffffff',
  backgroundImage: 'none',
  backdropFilter: 'blur(16px)',
  '&.MuiPaper-rounded': { borderRadius: theme.shape.borderRadiusCard }
});

export default function createDeveloperPurpleTheme(themeType: 'light' | 'dark'): Theme {
  const dark = themeType === 'dark';
  return createTheme({
    typography: {
      fontFamily: "'Geist', 'Roboto', system-ui, -apple-system, sans-serif",
      button: {
        textTransform: 'none',
        fontWeight: 600,
        letterSpacing: '0.01em'
      }
    },
    shape: {
      borderRadius: 8,
      borderRadiusCard: 12,
      borderRadiusPill: 9999
    },
    mixins: {
      toolbar: { minHeight: NAVBAR_HEIGHT }
    },
    palette: {
      mode: themeType,
      background: {
        default: dark ? '#000000' : '#fcfbfe', // True AMOLED Pure Black
        paper: dark ? '#090712' : '#ffffff'
      },
      text: {
        primary: dark ? '#ffffff' : '#1c1330',
        secondary: dark ? '#c4b3e8' : '#5c4b78',
        disabled: dark ? '#8573a8' : '#8f7ea9'
      },
      divider: dark ? '#241846' : '#e4d8f5',
      primary: {
        main: dark ? '#ffffff' : '#1c1330',
        dark: dark ? '#ffffff' : '#0e081c'
      },
      secondary: {
        main: dark ? '#a855f7' : '#8b5cf6',
        dark: dark ? '#9333ea' : '#7c3aed',
        light: dark ? '#c084fc' : '#a78bfa',
        contrastText: '#ffffff'
      },
      bg2: dark ? '#05040a' : '#f8f4fe',
      surface2: dark ? '#120e24' : '#f4edfd',
      surface3: dark ? '#1c1536' : '#e9dcfa',
      border2: dark ? '#241846' : '#e6d8f7',
      accentSoft: dark ? '#281248' : '#f3e8fc',
      warningSoft: dark ? '#382512' : '#fef6e8',
      warningAccent: dark ? '#fbbf24' : '#d97706',
      neutral: {
        light: dark ? '#000000' : '#e6e6e6',
        dark: dark ? '#090712' : '#ffffff'
      },
      textHint: 'rgba(168, 85, 247, 0.45)',
      checkboxUnchecked: dark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.25)',
      passed: {
        dark: dark ? '#2e5c32' : '#4db052',
        light: dark ? '#a5d6a7' : '#c8e6c9'
      },
      quarantined: {
        dark: dark ? '#8e5518' : '#e09030',
        light: dark ? '#ffcc80' : '#ffe0b2'
      },
      rejected: {
        dark: dark ? '#7d2e2e' : '#d63c3c',
        light: dark ? '#ef9a9a' : '#ffcdd2'
      },
      errorStatus: {
        dark: dark ? '#5a5a5a' : '#8a8a8a',
        light: dark ? '#b0b0b0' : '#e0e0e0'
      },
      allowed: '#4caf50',
      blocked: '#f44336',
      review: '#e6a800',
      selected: {
        border: dark ? '#c084fc' : '#8b5cf6',
        background: dark ? '#281146' : '#efe2fc',
        backgroundHover: dark ? '#381661' : '#e4ceff',
        hover: dark ? 'rgba(168, 85, 247, 0.16)' : 'rgba(139, 92, 246, 0.09)'
      },
      scanBackground: {
        default: dark ? '#090712' : '#f4edfd',
        light: dark ? '#120e24' : '#e9dcfa',
        dark: dark ? '#000000' : '#fcfbfe'
      },
      gray: {
        start: '#8573a8',
        middle: '#c4b3e8',
        end: '#8573a8',
        gradient: 'linear-gradient(90deg, #8573a8 0%, #c4b3e8 50%, #8573a8 100%)'
      },
      unenforced: {
        stripe: dark
          ? 'repeating-linear-gradient(-45deg, transparent, transparent 4px, rgba(168, 85, 247, 0.18) 4px, rgba(168, 85, 247, 0.18) 8px)'
          : 'repeating-linear-gradient(-45deg, transparent, transparent 4px, rgba(139, 92, 246, 0.12) 4px, rgba(139, 92, 246, 0.12) 8px)'
      }
    },
    breakpoints: {
      values: { xs: 0, sm: 550, md: 800, lg: 1040, xl: 1320 }
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            transition: 'background-color 0.3s ease, color 0.3s ease'
          }
        }
      },
      MuiAppBar: {
        styleOverrides: {
          root: ({ theme }: { theme: Theme }) => ({
            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.85)' : 'rgba(252, 251, 254, 0.88)',
            backdropFilter: 'blur(16px)',
            borderBottom: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(168, 85, 247, 0.2)' : 'rgba(139, 92, 246, 0.15)'}`,
            boxShadow: theme.palette.mode === 'dark' ? '0 4px 20px rgba(0, 0, 0, 0.8)' : '0 4px 16px rgba(139, 92, 246, 0.08)'
          })
        }
      },
      MuiAccordion: {
        styleOverrides: {
          root: {
            border: 0,
            boxShadow: 'none',
            background: 'transparent',
            '&:before': { display: 'none' }
          }
        }
      },
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: ({ theme }: { theme: Theme }) => ({
            borderRadius: theme.shape.borderRadius,
            transition: 'all 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
            '&:hover': {
              transform: 'translateY(-2px)'
            },
            '&:active': {
              transform: 'translateY(0)'
            }
          }),
          containedSecondary: ({ theme }: { theme: Theme }) => ({
            background:
              theme.palette.mode === 'dark'
                ? 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)'
                : 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
            boxShadow:
              theme.palette.mode === 'dark'
                ? '0 4px 20px 0 rgba(168, 85, 247, 0.45)'
                : '0 4px 18px 0 rgba(139, 92, 246, 0.35)',
            '&:hover': {
              boxShadow:
                theme.palette.mode === 'dark'
                  ? '0 6px 28px 0 rgba(168, 85, 247, 0.65)'
                  : '0 6px 24px 0 rgba(139, 92, 246, 0.45)'
            }
          })
        }
      },
      MuiPaper: {
        styleOverrides: {
          root: ({ theme }: { theme: Theme }) => ({
            backgroundImage: 'none',
            transition: 'background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease',
            '&.MuiPaper-outlined': {
              borderColor: theme.palette.mode === 'dark' ? 'rgba(168, 85, 247, 0.28)' : 'rgba(139, 92, 246, 0.15)'
            }
          })
        }
      },
      MuiTableCell: {
        styleOverrides: {
          root: ({ theme }: { theme: Theme }) => ({ borderBottomColor: theme.palette.divider })
        }
      },
      MuiTabs: {
        styleOverrides: {
          indicator: ({ theme }: { theme: Theme }) => ({
            backgroundColor: theme.palette.secondary.main,
            height: '3px',
            borderRadius: '3px',
            boxShadow: `0 0 12px ${theme.palette.secondary.main}`
          })
        }
      },
      MuiTab: {
        styleOverrides: {
          root: ({ theme }: { theme: Theme }) => ({
            fontSize: '0.875rem',
            fontWeight: 500,
            textTransform: 'none',
            color: theme.palette.text.disabled,
            minHeight: '2.75rem',
            padding: '0.625rem 1rem',
            transition: 'all 0.2s ease',
            '&:hover': {
              color: theme.palette.secondary.main
            },
            '&.Mui-selected': { color: theme.palette.secondary.main, fontWeight: 700 }
          })
        }
      },
      MuiMenu: {
        styleOverrides: {
          paper: { marginTop: '0.375rem' },
          list: { padding: '0.375rem' }
        }
      },
      MuiMenuItem: {
        styleOverrides: {
          root: ({ theme }: { theme: Theme }) => ({
            borderRadius: theme.shape.borderRadius,
            fontSize: '0.8125rem',
            fontWeight: 500,
            minHeight: '2.125rem',
            transition: 'all 0.15s ease',
            '&:hover': {
              backgroundColor: theme.palette.selected ? theme.palette.selected.hover : 'rgba(168, 85, 247, 0.14)',
              transform: 'translateX(2px)'
            }
          })
        }
      },
      MuiTypography: {
        styleOverrides: {
          overline: {
            textTransform: 'none',
            letterSpacing: 0,
            lineHeight: 1.4
          }
        }
      },
      MuiPopover: {
        styleOverrides: {
          paper: ({ theme }: { theme: Theme }) => floatingPaper(theme)
        }
      },
      MuiDialog: {
        styleOverrides: {
          paper: ({ theme }: { theme: Theme }) => floatingPaper(theme)
        }
      },
      MuiDivider: {
        styleOverrides: {
          root: ({ theme }: { theme: Theme }) => ({ borderColor: theme.palette.divider })
        }
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: ({ theme }: { theme: Theme }) => ({
            borderRadius: theme.shape.borderRadiusCard,
            transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(9, 7, 18, 0.85)' : 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(12px)',
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: theme.palette.secondary.main
            },
            '&.Mui-focused': {
              boxShadow: `0 0 24px ${theme.palette.mode === 'dark' ? 'rgba(168, 85, 247, 0.35)' : 'rgba(139, 92, 246, 0.22)'}`
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: theme.palette.secondary.main,
              borderWidth: '2px'
            }
          }),
          notchedOutline: ({ theme }: { theme: Theme }) => ({
            borderColor: theme.palette.divider,
            transition: 'border-color 0.2s ease, border-width 0.2s ease'
          })
        }
      }
    }
  });
}
