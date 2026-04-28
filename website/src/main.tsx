/********************************************************************************
 * Copyright (c) 2020 TypeFox and others
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *
 * SPDX-License-Identifier: EPL-2.0
 ********************************************************************************/

import { createRoot } from 'react-dom/client';
import { FunctionComponent, useMemo } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { Main, ExtensionRegistryService } from 'openvsx-webui';
import createDefaultTheme from 'openvsx-webui/lib/default/theme';
import createPageSettings from './page-settings';
import { createAbsoluteURL } from 'openvsx-webui/lib/utils';

const App: FunctionComponent = () => {
  const prefersDarkScheme = useMediaQuery('(prefers-color-scheme: dark)');
  const themeType = prefersDarkScheme ? 'dark' : 'light';
  const theme = useMemo(() => createDefaultTheme(themeType), [themeType]);

  let serverUrl = '';
  if (location.port === '3000') {
    // Localhost dev environment
    const serverHost = location.hostname + ':8080';
    serverUrl = `${location.protocol}//${serverHost}`;
  }
  const service = new ExtensionRegistryService(serverUrl);

  const getServerVersion = async (): Promise<string> => {
    const abortController = new AbortController();
    try {
      const result = await service.getRegistryVersion(abortController);
      return result.version;
    } catch {
      console.error('Could not determine server version');
      return 'unknown';
    }
  };

  const pageSettings = createPageSettings(theme, prefersDarkScheme, getServerVersion());

  return (
    <HelmetProvider>
      <ThemeProvider theme={theme}>
        <Main
          service={service}
          pageSettings={pageSettings}
          loginProviders={{ github: createAbsoluteURL([serverUrl, 'oauth2', 'authorization', 'github']) }}
        />
      </ThemeProvider>
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
