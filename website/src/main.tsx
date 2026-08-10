/********************************************************************************
 * Copyright (c) 2020 TypeFox and others
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *
 * SPDX-License-Identifier: EPL-2.0
 ********************************************************************************/

import '@fontsource-variable/geist/index.css';
import '@fontsource-variable/geist-mono/index.css';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import { createRoot } from 'react-dom/client';
import { FunctionComponent, useState, useMemo, useEffect, useCallback } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { BrowserRouter } from 'react-router';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import useMediaQuery from '@mui/material/useMediaQuery';
import { Main, ExtensionRegistryService } from 'openvsx-webui';
import createDeveloperPurpleTheme from './theme';
import createPageSettings from './page-settings';
import { createAbsoluteURL } from 'openvsx-webui/lib/utils';
import { ThemeContext, ThemeMode } from './theme-context';

const THEME_STORAGE_KEY = 'openvsx-theme';

const App: FunctionComponent = () => {
  const prefersDarkScheme = useMediaQuery('(prefers-color-scheme: dark)');

  const [mode, setModeState] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === 'light' || saved === 'dark') {
      return saved;
    }
    return prefersDarkScheme ? 'dark' : 'light';
  });

  // Keep system preference in sync if no saved preference exists
  useEffect(() => {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (!saved) {
      setModeState(prefersDarkScheme ? 'dark' : 'light');
    }
  }, [prefersDarkScheme]);

  // Synchronize document attribute and color-scheme for global CSS and webui components
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', mode);
    document.documentElement.style.colorScheme = mode;
  }, [mode]);

  const updateMode = useCallback((newMode: ThemeMode) => {
    const applyMode = () => {
      setModeState(newMode);
      localStorage.setItem(THEME_STORAGE_KEY, newMode);
      document.documentElement.setAttribute('data-theme', newMode);
      document.documentElement.style.colorScheme = newMode;
    };

    if (typeof document !== 'undefined' && 'startViewTransition' in document) {
      (document as any).startViewTransition(applyMode);
    } else {
      applyMode();
    }
  }, []);

  const toggleTheme = useCallback(() => {
    const nextMode = mode === 'dark' ? 'light' : 'dark';
    updateMode(nextMode);
  }, [mode, updateMode]);

  const theme = useMemo(() => createDeveloperPurpleTheme(mode), [mode]);
  const isDarkMode = mode === 'dark';

  let serverUrl = '';
  if (location.port === '3000') {
    // Localhost dev environment
    const serverHost = location.hostname + ':8080';
    serverUrl = `${location.protocol}//${serverHost}`;
  }
  const service = useMemo(() => new ExtensionRegistryService(serverUrl), [serverUrl]);
  const pageSettings = useMemo(() => createPageSettings(theme, isDarkMode), [theme, isDarkMode]);

  const themeContextValue = useMemo(
    () => ({
      mode,
      toggleTheme,
      setMode: updateMode
    }),
    [mode, toggleTheme, updateMode]
  );

  return (
    <HelmetProvider>
      <ThemeContext.Provider value={themeContextValue}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Main
            service={service}
            pageSettings={pageSettings}
            loginProviders={{ github: createAbsoluteURL([serverUrl, 'oauth2', 'authorization', 'github']) }}
          />
        </ThemeProvider>
      </ThemeContext.Provider>
    </HelmetProvider>
  );
};

const node = document.getElementById('main') as HTMLElement;
const root = createRoot(node);
root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
