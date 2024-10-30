/********************************************************************************
 * Copyright (c) 2020 TypeFox and others
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *
 * SPDX-License-Identifier: EPL-2.0
 ********************************************************************************/

import React, { FunctionComponent, ReactNode, Suspense, lazy } from 'react';
import { Link, Typography, Theme, Box, SxProps } from '@mui/material';
import { Helmet, HelmetTags } from 'react-helmet-async';
import { Link as RouteLink, Route, useParams } from 'react-router-dom';
import { PageSettings, Extension, NamespaceDetails } from 'openvsx-webui';
import { ExtensionListRoutes } from 'openvsx-webui/lib/pages/extension-list/extension-list-container';
import { DefaultMenuContent, MobileMenuContent } from './menu-content';
import InfoIcon from '@mui/icons-material/Info';
import OpenVSXLogo from './openvsx-registry-logo';
import footerContent from './footer-content';
import { Document } from './document';
import About from './about';
import Adopters from './adopters';
import Members from './members';

//---------- HEAD TAGS
const HeadTags: FunctionComponent<{title?: string, description?: string, keywords?: string, url?: string, imageUrl?: string, type?: string}> = (props) => {
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

const MainHeadTags: FunctionComponent<{pageSettings: PageSettings}> = (props) => {
    const title = props.pageSettings.pageTitle;
    const description = 'Open VSX is an Eclipse open-source project and alternative to the Visual Studio Marketplace. It is deployed by the Eclipse Foundation at open-vsx.org.';
    const keywords = 'eclipse,ide,open source,development environment,development,vs code,visual studio code,extension,plugin,plug-in,registry,theia';
    const url = `${location.protocol}//${location.host}`;
    const imageUrl = url + '/openvsx-preview.png';

    return (<HeadTags title={title} description={description} keywords={keywords} url={url} imageUrl={imageUrl}/>);
};

const ExtensionHeadTags: FunctionComponent<{extension?: Extension, pageSettings: PageSettings}> = (props) => {
    const { name, namespace } = useParams();
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
            keywords = props.extension.tags.filter(t => !t.startsWith('__')).join();
        }
    } else {
        title = name + title;
        url += `${namespace}/${name}`;
    }

    return(<HeadTags title={title} url={url} description={description} keywords={keywords}/>)
};

const NamespaceHeadTags: FunctionComponent<{namespaceDetails?: NamespaceDetails, pageSettings: PageSettings}> = (props) => {
    const { name } = useParams();
    const namespaceName = props.namespaceDetails?.displayName ?? props.namespaceDetails?.name ?? name
    const title = `${namespaceName} – ${props.pageSettings.pageTitle}`;
    const url = `${location.protocol}//${location.host}/namespace/${namespaceName}`;
    const description = props.namespaceDetails?.description
    return(<HeadTags title={title} url={url} description={description}/>)
};

export default function createPageSettings(theme: Theme, prefersDarkMode: boolean, serverVersionPromise: Promise<string>): PageSettings {    

    //---------- SERVER VERSION
    const ServerVersion = lazy(async () => {
        const version = await serverVersionPromise;
        return { default: () => <Typography variant='body2' sx={{ alignSelf: 'flex-start', fontSize: '0.8rem' }}>{version}</Typography> };
    });

    //---------- MAIN LOGO / TOOLBAR
    const toolbarContent: FunctionComponent = () =>
        <>
            <RouteLink to={ExtensionListRoutes.MAIN} aria-label={`Home - Open VSX Registry`}>
                <OpenVSXLogo width='auto' height='40px' marginTop='8px' prefersDarkMode={prefersDarkMode} />
            </RouteLink>
            <Suspense>
                <ServerVersion/>
            </Suspense>
        </>;

    //---------- ANNOUNCEMENT BANNER
    const bannerContent: FunctionComponent = () =>
        <Box display='flex' alignItems='center' pt={1} pb={1}>
            <Box mr={2}>
                <InfoIcon fontSize='large' />
            </Box>
            <Typography variant='body1'>
                Open VSX now supports deprecating extensions - see our <Link color='secondary' underline='hover' href="https://blogs.eclipse.org/post/john-kellerman/new-feature-open-vsx-deprecating-extensions">announcement</Link>.
            </Typography>
        </Box>;

    //---------- SEARCH HEADER
    const searchHeader: FunctionComponent = () =>
        <Typography variant='h4' sx={{ mb: 2, fontWeight: 'fontWeightLight', letterSpacing: 4, textAlign: 'center' }}>
            Extensions for VS Code Compatible Editors
        </Typography>;

    //---------- DOWNLOAD TERMS
    const downloadTerms: FunctionComponent = () =>
    <Box mt={1}>
        <Typography variant='body2'>
            By clicking download, you accept this website&apos;s&nbsp;
            <Link color='secondary' underline='hover' href='https://open-vsx.org/terms-of-use'>
                Terms of Use
            </Link>.
        </Typography>
    </Box>;

    //---------- ADDITIONAL PAGES
    const additionalRoutes: ReactNode = <>
        <Route path='/about' element={<About />} />
        <Route path='/terms-of-use' element={<Document url='/documents/terms-of-use.md' />} />
        <Route path='/publisher-agreement-v1.0' element={<Document url='/documents/publisher-agreement-v1.0.md' />} />
        <Route path='/members' element={<Members />} />
        <Route path='/adopters' element={<Adopters />} />
    </>;

    //---------- REPORT ABUSE LINK
    const reportAbuse: FunctionComponent<{ extension: Extension, sx: SxProps<Theme> }> = ({ extension, sx }) => {
        const reportAbuseText = encodeURIComponent('<Please describe the issue>');
        const extensionURL = encodeURIComponent(`${location.protocol}//${location.hostname}/extension/${extension.namespace}/${extension.name}`);
        return <Link
            href={`mailto:license@eclipse.org?subject=Report%20Abuse%20-%20${extension.namespace}.${extension.name}&Body=${reportAbuseText}%0A%0A${extensionURL}`}
            variant='body2' color='secondary' underline='hover' sx={sx} >
            Report Abuse
        </Link>;
    };

    //---------- CLAIM NAMESPACE LINK
    const claimNamespace: FunctionComponent<{ extension: Extension, sx: SxProps<Theme> }> = ({ sx }) => <Link
            href='https://github.com/EclipseFdn/open-vsx.org/issues/new/choose'
            target='_blank' variant='body2' color='secondary' underline='hover' sx={sx} >
            Claim Ownership
        </Link>;


    return {
        pageTitle: 'Open VSX Registry',
        themeType: prefersDarkMode ? 'dark' : 'light',
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
                    key: 'Extension-Deprecation',
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
            mainHeadTags: MainHeadTags,
            extensionHeadTags: ExtensionHeadTags,
            namespaceHeadTags: NamespaceHeadTags
        },
        urls: {
            extensionDefaultIcon: '/default-icon.png',
            namespaceAccessInfo: 'https://github.com/eclipse/openvsx/wiki/Namespace-Access',
            publisherAgreement: '/documents/publisher-agreement-v1.0.md'
        }
    };
}
