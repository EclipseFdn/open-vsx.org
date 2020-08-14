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
import { DefaultMenuContent, MobileMenuContent } from './menu-content';
import OpenVSXRegistryLogo from './openvsx-registry-logo';
import About from './about';

export default function createPageSettings(theme: Theme, themeType: 'light' | 'dark'): PageSettings {
    const toolbarStyle = makeStyles({
        logo: {
            width: 'auto',
            height: '40px',
            marginTop: '8px'
        }
    });
    const toolbarContent = () => <RouteLink
            to={ExtensionListRoutes.MAIN} aria-label={`Home - Open VSX Registry`}>
            <OpenVSXRegistryLogo themeType={themeType} className={toolbarStyle().logo}/>
        </RouteLink>;
    
    const footerStyle = makeStyles({
        wrapper: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            [theme.breakpoints.down('sm')]: {
                flexDirection: 'column'
            }
        },
        group: {
            [theme.breakpoints.down('sm')]: {
                margin: `${theme.spacing(1)}px ${theme.spacing(1.5)}px 0 ${theme.spacing(1.5)}px`
            }
        },
        repositoryLink: {
            display: 'flex',
            alignItems: 'center',
            fontSize: '1.1rem'
        },
        legalLink: {
            marginLeft: theme.spacing(3),
            textDecoration: 'none',
            color: theme.palette.primary.main,
            '&:hover': {
                textDecoration: 'underline'
            },
            [theme.breakpoints.down('sm')]: {
                marginLeft: 0,
                marginTop: theme.spacing(0.5)
            }
        }
    });
    const footerContent = () => <Box className={footerStyle().wrapper}>
            <Link target='_blank' href='https://github.com/eclipse/openvsx' className={footerStyle().repositoryLink}>
                <GitHubIcon />&nbsp;eclipse/openvsx
            </Link>
            <Box display='flex'>
                <Box className={`${footerStyle().wrapper} ${footerStyle().group}`}>
                    <RouteLink to='/about' className={footerStyle().legalLink}>
                        About This Service
                    </RouteLink>
                    <Link href='https://www.eclipse.org/legal/privacy.php' className={footerStyle().legalLink}>
                        Privacy Policy
                    </Link>
                </Box>
                <Box className={`${footerStyle().wrapper} ${footerStyle().group}`}>
                    <Link href='https://www.eclipse.org/legal/termsofuse.php' className={footerStyle().legalLink}>
                        Terms of Use
                    </Link>
                    <Link href='https://www.eclipse.org/legal/copyright.php' className={footerStyle().legalLink}>
                        Copyright Agent
                    </Link>
                </Box>
            </Box>
        </Box>;

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
        themeType,
        elements: {
            defaultMenuContent: DefaultMenuContent,
            mobileMenuContent: MobileMenuContent,
            toolbarContent,
            footerContent,
            searchHeader,
            additionalRoutes,
            reportAbuse,
            claimNamespace,
        },
        metrics: {
            maxFooterHeight: 105
        },
        urls: {
            extensionDefaultIcon: '/default-icon.png',
            namespaceAccessInfo: 'https://github.com/eclipse/openvsx/wiki/Namespace-Access'
        }
    };
}
