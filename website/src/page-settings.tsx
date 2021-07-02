/********************************************************************************
 * Copyright (c) 2020 TypeFox and others
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *
 * SPDX-License-Identifier: EPL-2.0
 ********************************************************************************/

import * as React from 'react';
import { makeStyles } from '@material-ui/styles';
import { Link, Typography, Theme, Box } from '@material-ui/core';
import { Link as RouteLink, Route } from 'react-router-dom';
import { PageSettings, Extension, Styleable } from 'openvsx-webui';
import { ExtensionListRoutes } from 'openvsx-webui/lib/pages/extension-list/extension-list-container';
import { DefaultMenuContent, MobileMenuContent } from './menu-content';
import InfoIcon from '@material-ui/icons/Info';
import OpenVSXRegistryLogo from './openvsx-registry-logo';
import footerContent from './footer-content';
import { Document } from './document';
import About from './about';

export default function createPageSettings(theme: Theme, themeType: 'light' | 'dark'): PageSettings {
    //---------- MAIN LOGO / TOOLBAR
    const toolbarStyle = makeStyles({
        logo: {
            width: 'auto',
            height: '40px',
            marginTop: '8px'
        }
    });
    const toolbarContent: React.FunctionComponent = () =>
        <RouteLink
            to={ExtensionListRoutes.MAIN} aria-label={`Home - Open VSX Registry`}>
            <OpenVSXRegistryLogo themeType={themeType} className={toolbarStyle().logo}/>
        </RouteLink>;

    //---------- ANNOUNCEMENT BANNER
    const bannerContent: React.FunctionComponent = () =>
        <Box display='flex' alignItems='center' pt={1} pb={1}>
            <Box mr={2}>
                <InfoIcon fontSize='large' />
            </Box>
            <Typography variant='body1'>
                Download this FREE white paper to learn more about Open VSX and why open source tools to 
                support VS Code extensions are gaining in 
                popularity. <Link color='secondary' href="https://outreach.eclipse.foundation/openvsx">Open VSX Registry: A Vendor Neutral, Open Source Marketplace for VS Code Extensions</Link>.
            </Typography>
        </Box>;

    //---------- SEARCH HEADER
    const searchStyle = makeStyles({
        typography: {
            marginBottom: theme.spacing(2),
            fontWeight: theme.typography.fontWeightLight,
            letterSpacing: 4,
            textAlign: 'center'
        }
    });
    const searchHeader: React.FunctionComponent = () =>
        <Typography variant='h4' classes={{ root: searchStyle().typography }}>
            Extensions for VS Code Compatible Editors
        </Typography>;

    //---------- ADDITIONAL PAGES
    const additionalRoutes: React.FunctionComponent = () =>
        <>
            <Route path='/about' render={() => <About />} />
            <Route path='/terms-of-use' render={() => <Document url='/documents/terms-of-use.md' />} />
            <Route path='/publisher-agreement-v1.0' render={() =>
                <Document url='/documents/publisher-agreement-v1.0.md' />
            } />
        </>;

    //---------- REPORT ABUSE LINK
    const reportAbuse: React.FunctionComponent<{ extension: Extension } & Styleable> = ({ extension, className }) => {
        const reportAbuseText = encodeURIComponent('<Please describe the issue>');
        const extensionURL = encodeURIComponent(`${location.protocol}//${location.hostname}/extension/${extension.namespace}/${extension.name}`);
        return <Link
            href={`mailto:license@eclipse.org?subject=Report%20Abuse%20-%20${extension.namespace}.${extension.name}&Body=${reportAbuseText}%0A%0A${extensionURL}`}
            variant='body2' color='secondary' className={className} >
            Report Abuse
        </Link>;
    };

    //---------- CLAIM NAMESPACE LINK
    const claimNamespace: React.FunctionComponent<{ extension: Extension } & Styleable> = ({ className }) => <Link
            href='https://github.com/EclipseFdn/open-vsx.org/issues/new/choose'
            target='_blank' variant='body2' color='secondary' className={className} >
            Claim Ownership
        </Link>;

    return {
        pageTitle: 'Open VSX Registry',
        themeType,
        elements: {
            defaultMenuContent: DefaultMenuContent,
            mobileMenuContent: MobileMenuContent,
            toolbarContent,
            banner: {
                content: bannerContent,
                props: {
                    dismissButton: {
                        show: true,
                        label: 'Got It'
                    },
                    color: 'info'
                },
                cookie: {
                    key: 'open-vsx-whitepaper',
                    value: 'closed',
                    path: '/'
                }
            },
            footer: {
                content: footerContent,
                props: {
                    footerHeight: 45
                }
            },
            searchHeader,
            additionalRoutes,
            reportAbuse,
            claimNamespace,
        },
        urls: {
            extensionDefaultIcon: '/default-icon.png',
            namespaceAccessInfo: 'https://github.com/eclipse/openvsx/wiki/Namespace-Access',
            publisherAgreement: '/documents/publisher-agreement-v1.0.md'
        }
    };
}
