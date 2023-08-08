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
import React, { FunctionComponent, useMemo } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';
import { Main, ExtensionRegistryService } from 'openvsx-webui';
import createDefaultTheme from 'openvsx-webui/lib/default/theme';
import createPageSettings from './page-settings';

const App: FunctionComponent = () => {
    const prefersDarkScheme = useMediaQuery('(prefers-color-scheme: dark)');
    const themeType = prefersDarkScheme ? 'dark' : 'light';
    const theme = useMemo(() => createDefaultTheme(themeType), [themeType]);
    const service = new ExtensionRegistryService();
    const pageSettings = createPageSettings(theme, prefersDarkScheme);

    return (
        <HelmetProvider>
            <ThemeProvider theme={theme}>
                <Main
                    service={service}
                    pageSettings={pageSettings}
                />
            </ThemeProvider>
        </HelmetProvider>
    );
}

const node = document.getElementById('main') as HTMLElement;
const root = createRoot(node);
root.render(<BrowserRouter>
    <App />
</BrowserRouter>);
