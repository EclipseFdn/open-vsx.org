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
import { createMuiTheme } from '@material-ui/core';
import { Main } from 'openvsx-webui';
import createPageSettings from '../src/page-settings';
import { MockRegistryService } from './mock-service';

const theme = createMuiTheme({
    palette: {
        primary: { main: '#eeeeee', contrastText: '#3f3841', dark: '#565157' },
        secondary: { main: '#a60ee5', contrastText: '#edf5ea' }
    },
    breakpoints: {
        values: {
            xs: 340,
            sm: 550,
            md: 800,
            lg: 1040,
            xl: 1240
        }
    }
});

const service = new MockRegistryService();
const pageSettings = createPageSettings(theme);
const node = document.getElementById('main');
ReactDOM.render(<BrowserRouter>
    <ThemeProvider theme={theme}>
        <Main
            service={service}
            pageSettings={pageSettings}
        />
    </ThemeProvider>
</BrowserRouter>, node);
