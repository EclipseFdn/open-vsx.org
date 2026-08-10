import { FunctionComponent } from 'react';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { Theme } from '@mui/material/styles';
import { SxProps } from '@mui/system';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import { useThemeMode } from '../theme-context';

export const ThemeToggleButton: FunctionComponent<{ sx?: SxProps<Theme> }> = ({ sx }) => {
  const { mode, toggleTheme } = useThemeMode();
  const isDark = mode === 'dark';

  return (
    <Tooltip title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}>
      <IconButton
        onClick={toggleTheme}
        color="inherit"
        size="medium"
        aria-label="Toggle theme"
        sx={[
          {
            borderRadius: '50%',
            p: 1.1,
            transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), background-color 0.3s ease, border-color 0.3s ease',
            border: `1px solid ${isDark ? 'rgba(168, 85, 247, 0.3)' : 'rgba(139, 92, 246, 0.25)'}`,
            backgroundColor: isDark ? 'rgba(168, 85, 247, 0.12)' : 'rgba(139, 92, 246, 0.08)',
            '&:hover': {
              transform: 'rotate(180deg) scale(1.12)',
              backgroundColor: isDark ? 'rgba(168, 85, 247, 0.22)' : 'rgba(139, 92, 246, 0.16)',
              boxShadow: isDark ? '0 0 16px rgba(168, 85, 247, 0.4)' : '0 4px 14px rgba(139, 92, 246, 0.25)'
            },
            '&:active': {
              transform: 'scale(0.92)'
            }
          },
          ...(Array.isArray(sx) ? sx : [sx])
        ]}
      >
        {isDark ? (
          <LightModeIcon sx={{ fontSize: '1.25rem', color: '#fbbf24', transition: 'all 0.3s ease' }} />
        ) : (
          <DarkModeIcon sx={{ fontSize: '1.25rem', color: '#7c3aed', transition: 'all 0.3s ease' }} />
        )}
      </IconButton>
    </Tooltip>
  );
};
