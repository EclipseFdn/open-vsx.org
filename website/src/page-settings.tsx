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
import { Helmet, HelmetTags } from 'react-helmet';
import { Link as RouteLink, Route } from 'react-router-dom';
import { PageSettings, Extension, NamespaceDetails, Styleable, ExtensionDetailComponent, NamespaceDetailComponent } from 'openvsx-webui';
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

    //---------- DOWNLOAD TERMS
    const downloadTerms: React.FunctionComponent = () =>
    <Box mt={1}>
        <Typography variant='body2'>
            By clicking download, you accept this website&apos;s&nbsp;
            <Link color='secondary' href='https://open-vsx.org/terms-of-use'>
                Terms of Use
            </Link>.
        </Typography>
    </Box>;

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

    //---------- HEAD TAGS
    const headTags: React.FunctionComponent<{title?: string, description?: string, keywords?: string, url?: string, imageUrl?: string, type?: string}> = (props) => {
        const handleChangeClientState = (newState: any, addedTags: HelmetTags, removedTags: HelmetTags): void => {
            if (addedTags.metaTags) {
                addedTags.metaTags.forEach((value: HTMLMetaElement) => {
                    if (!value.content) {
                        value.remove();
                    }
                });
            }
        };
    
        const twitterCard = props.imageUrl ? 'summary_large_image' : 'summary';
        const type = props.type || 'website';
        return <Helmet onChangeClientState={handleChangeClientState}>
            <title>{props.title}</title>
    
            {/* SEO Meta Tags */}
            <meta name='description' content={props.description}/>
            <meta name='keywords' content={props.keywords}/>
            <meta property='og:url' content={props.url}/>
            <meta property='og:type' content={type}/>
            <meta property='og:title' content={props.title}/>
            <meta property='og:description' content={props.description}/>
            <meta property='og:image' content={props.imageUrl}/>
    
            {/* Google Meta Tags */}
            <meta itemProp='name' content={props.title}/>
            <meta itemProp='description' content={props.description}/>
            <meta itemProp='image' content={props.imageUrl}/>
    
            {/* Twitter Meta Tags */}
            <meta name='twitter:card' content={twitterCard}/>
            <meta name='twitter:title' content={props.title}/>
            <meta name='twitter:description' content={props.description}/>
            <meta name='twitter:image' content={props.imageUrl}/>
        </Helmet>;
    };
    
    const mainHeadTags: React.FunctionComponent<{pageSettings: PageSettings}> = (props) => {
        const title = props.pageSettings.pageTitle;
        const description = 'Open VSX is an Eclipse open-source project and alternative to the Visual Studio Marketplace. It is deployed by the Eclipse Foundation at open-vsx.org.';
        const keywords = 'eclipse,ide,open source,development environment,development,vs code,visual studio code,extension,plugin,plug-in,registry,theia';
        const url = `${location.protocol}//${location.host}`;
        const imageUrl = url + '/openvsx-preview.png';
    
        return headTags({ title, description, keywords, url, imageUrl });
    };
    
    const extensionHeadTags: React.FunctionComponent<{extension?: Extension, params: ExtensionDetailComponent.Params, pageSettings: PageSettings}> = (props) => {
        let title = ` – ${props.pageSettings.pageTitle}`;
        let url = `${location.protocol}//${location.host}/extension/`;
        let description: string | undefined;
        let keywords: string | undefined;
        if (props.extension) {
            title = (props.extension.displayName || props.extension.name) + title;
            url += `${props.extension.namespace}/${props.extension.name}`;
            description = props.extension.description;
            // extension description can be up to 2048 characters, truncate it.
            if (description && description.length > 255) {
                let lastWordIndex = description.indexOf(' ', 255);
                lastWordIndex = lastWordIndex !== -1 ? lastWordIndex - 1 : 255;
                description = description.substring(0, lastWordIndex);
            }
            if (props.extension.tags) {
                keywords = props.extension.tags.join();
            }
        } else {
            title = props.params.name + title;
            url += `${props.params.namespace}/${props.params.name}`;
        }
    
        return headTags({ title, url, description, keywords });
    };
    
    const namespaceHeadTags: React.FunctionComponent<{namespaceDetails?: NamespaceDetails, params: NamespaceDetailComponent.Params, pageSettings: PageSettings}> = (props) => {
        let title = ` – ${props.pageSettings.pageTitle}`;
        let url = `${location.protocol}//${location.host}/namespace/`;
        let description: string | undefined;
        if (props.namespaceDetails) {
            title = (props.namespaceDetails.displayName || props.namespaceDetails.name) + title;
            url += props.namespaceDetails.name;
            description = props.namespaceDetails.description;
        } else {
            title = props.params.name + title;
            url += props.params.name;
        }
    
        return headTags({ title, url, description });
    };
    
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
            downloadTerms,
            additionalRoutes,
            reportAbuse,
            claimNamespace,
            mainHeadTags,
            extensionHeadTags,
            namespaceHeadTags
        },
        urls: {
            extensionDefaultIcon: '/default-icon.png',
            namespaceAccessInfo: 'https://github.com/eclipse/openvsx/wiki/Namespace-Access',
            publisherAgreement: '/documents/publisher-agreement-v1.0.md'
        }
    };
}
