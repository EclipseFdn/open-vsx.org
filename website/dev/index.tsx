/********************************************************************************
 * Copyright (c) 2020 TypeFox and others
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *
 * SPDX-License-Identifier: EPL-2.0
 ********************************************************************************/

import * as ReactDOM from 'react-dom';
import * as React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@material-ui/styles';
import { useMediaQuery } from '@material-ui/core';
import { Main } from 'openvsx-webui';
import createPageSettings from '../src/page-settings';
import createTheme from '../src/theme';
import { MockRegistryService } from './mock-service';

const App = () => {
    const prefersDarkScheme = useMediaQuery('(prefers-color-scheme: dark)');
    const themeType = prefersDarkScheme ? 'dark' : 'light';
    const theme = React.useMemo(() => createTheme(themeType), [themeType]);
    const service = new MockRegistryService();
    const pageSettings = createPageSettings(theme, themeType);

    return (
        <ThemeProvider theme={theme}>
            <Main
                service={service}
                pageSettings={pageSettings}
            />
        </ThemeProvider>
    );
}

const node = document.getElementById('main');
ReactDOM.render(<BrowserRouter>
    <App />
</BrowserRouter>, node);
