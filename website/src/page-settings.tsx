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
import GitHubIcon from '@material-ui/icons/GitHub';
import { PageSettings, Extension, Styleable } from 'openvsx-webui';
import { ExtensionListRoutes } from 'openvsx-webui/lib/pages/extension-list/extension-list-container';
import About from './about';

export default function createPageSettings(theme: Theme): PageSettings {
    const toolbarStyle = makeStyles({
        logo: {
            width: 'auto',
            height: '40px',
            marginTop: '7px'
        }
    });
    const toolbarContent = () => <RouteLink
            to={ExtensionListRoutes.MAIN} aria-label={`Home - Open VSX Registry`}>
            <img src='/openvsx-registry.svg'
                className={toolbarStyle().logo}
                alt='Open VSX Registry' />
        </RouteLink>;
    
    const footerStyle = makeStyles({
        repositoryLink: {
            display: 'flex',
            alignItems: 'center',
            fontSize: '1.1rem',
            [theme.breakpoints.down('sm')]: {
                display: 'none'
            }
        },
        legalLink: {
            marginLeft: theme.spacing(3),
            textDecoration: 'none',
            color: theme.palette.primary.main,
            '&:hover': {
                textDecoration: 'underline'
            },
            [theme.breakpoints.down('sm')]: {
                marginLeft: theme.spacing(1.5)
            }
        },
        group: {
            display: 'flex',
            [theme.breakpoints.down('sm')]: {
                fontSize: '80%'
            }
        }
    });
    const footerContent = () => <React.Fragment>
            <Link target='_blank' href='https://github.com/eclipse/openvsx' className={footerStyle().repositoryLink}>
                <GitHubIcon />&nbsp;eclipse/openvsx
            </Link>
            <Box className={footerStyle().group}>
                <RouteLink to='/about' className={footerStyle().legalLink}>
                    About this Service
                </RouteLink>
                <Link href='https://www.eclipse.org/legal/privacy.php' className={footerStyle().legalLink}>
                    Privacy Policy
                </Link>
                <Link href='https://www.eclipse.org/legal/termsofuse.php' className={footerStyle().legalLink}>
                    Terms of Use
                </Link>
                <Link href='https://www.eclipse.org/legal/copyright.php' className={footerStyle().legalLink}>
                    Copyright Agent
                </Link>
            </Box>
        </React.Fragment>;

    const searchStyle = makeStyles({
        typography: {
            marginBottom: theme.spacing(2),
            fontWeight: theme.typography.fontWeightLight,
            letterSpacing: 4,
            textAlign: 'center'
        }
    });
    const searchHeader = () => <Typography variant='h4' classes={{ root: searchStyle().typography }}>
            Extensions for VS Code Compatible Editors
        </Typography>;

    const additionalRoutes = () => <Route path='/about' render={() => <About />} />

    const reportAbuse: React.FunctionComponent<{ extension: Extension } & Styleable> = ({ extension, className }) => {
        const reportAbuseText = encodeURIComponent('<Please describe the issue>');
        const extensionURL = encodeURIComponent(`${location.protocol}//${location.hostname}/extension/${extension.namespace}/${extension.name}`);
        return <Link
            href={`mailto:open-vsx@typefox.io?subject=Report%20Abuse%20-%20${extension.namespace}.${extension.name}&Body=${reportAbuseText}%0A%0A${extensionURL}`}
            variant='body2' color='secondary' className={className} >
            Report Abuse
        </Link>;
    };

    const claimNamespace: React.FunctionComponent<{ extension: Extension } & Styleable> = ({ className }) => <Link
            href='https://github.com/eclipse/open-vsx.org/issues/new/choose'
            target='_blank' variant='body2' color='secondary' className={className} >
            Claim Ownership
        </Link>;

    return {
        pageTitle: 'Open VSX Registry',
        toolbarContent,
        footerContent,
        searchHeader,
        additionalRoutes,
        reportAbuse,
        claimNamespace,
        extensionDefaultIconURL: '/default-icon.png',
        namespaceAccessInfoURL: 'https://github.com/eclipse/openvsx/wiki/Namespace-Access'
    };
}
