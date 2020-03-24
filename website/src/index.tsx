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
import { Main, ExtensionRegistryService, PageSettings, Extension } from 'openvsx-webui';

const theme = createMuiTheme({
    palette: {
        primary: { main: '#EEEEEE', contrastText: '#263238' },
        secondary: { main: '#42A5F5' }
    }
});

const service = new ExtensionRegistryService();

const node = document.getElementById('main');

const reportAbuseText = encodeURIComponent('<Please describe the issue>');
const extensionURL = (extension: Extension) => encodeURIComponent(
    `${location.protocol}//${location.hostname}/extension/${extension.namespace}/${extension.name}`);
const pageSettings: PageSettings = {
    pageTitle: 'Open VSX Registry',
    listHeaderTitle: 'Extensions for VS Code Compatible Editors',
    logoURL: '/openvsx-registry.svg',
    extensionDefaultIconURL: '/default-icon.png',
    namespaceAccessInfoURL: 'https://github.com/eclipse/openvsx/wiki/Namespace-Access',
    reportAbuseHref: extension => `mailto:open-vsx@typefox.io?subject=Report%20Abuse%20-%20${extension.namespace}.${extension.name}&Body=${reportAbuseText}%0A%0A${extensionURL(extension)}`,
    claimNamespaceHref: namespace => 'https://github.com/eclipse/open-vsx.org/issues/new/choose'
};

ReactDOM.render(<BrowserRouter>
    <ThemeProvider theme={theme}>
        <Main
            service={service}
            pageSettings={pageSettings}
        />
    </ThemeProvider>
</BrowserRouter>, node);
