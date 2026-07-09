/********************************************************************************
 * Copyright (c) 2020 TypeFox and others
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *
 * SPDX-License-Identifier: EPL-2.0
 ********************************************************************************/

import { FunctionComponent, ReactNode, Suspense, useContext } from 'react';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { Theme } from '@mui/material/styles/createTheme';
import { SxProps } from '@mui/system/styleFunctionSx/styleFunctionSx';
import { Helmet, HelmetTags } from 'react-helmet-async';
import { Link as RouteLink, Route, useParams } from 'react-router-dom';
import { PageSettings, Extension, NamespaceDetails, OpenVsxMark } from 'openvsx-webui';
import { ExtensionListRoutes } from 'openvsx-webui/lib/pages/extension-list/extension-list-routes';
import { DefaultMenuContent, MobileMenuContent } from './menu-content';
import OpenVSXLogo from './openvsx-registry-logo';
import { Document } from './document';
import About from './about';
import Adopters from './adopters';
import Members from './members';
import { MainContext } from 'openvsx-webui/lib/context';
import CallSplitIcon from '@mui/icons-material/CallSplit';
import GroupsIcon from '@mui/icons-material/Groups';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import XIcon from '@mui/icons-material/X';

const WIKI_URL = 'https://github.com/EclipseFdn/open-vsx.org/wiki';
const REPO_URL = 'https://github.com/eclipse-openvsx/openvsx';

//---------- HEAD TAGS
const HeadTags: FunctionComponent<{
  title?: string;
  description?: string;
  keywords?: string;
  url?: string;
  imageUrl?: string;
}> = (props) => {
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
  return (
    <Helmet onChangeClientState={handleChangeClientState}>
      <title>{props.title}</title>

      {/* SEO Meta Tags */}
      <meta name='description' content={props.description} />
      <meta name='keywords' content={props.keywords} />
      <meta property='og:url' content={props.url} />
      <meta property='og:type' content='website' />
      <meta property='og:title' content={props.title} />
      <meta property='og:description' content={props.description} />
      <meta property='og:image' content={props.imageUrl} />

      {/* Google Meta Tags */}
      <meta itemProp='name' content={props.title} />
      <meta itemProp='description' content={props.description} />
      <meta itemProp='image' content={props.imageUrl} />

      {/* Twitter Meta Tags */}
      <meta name='twitter:card' content={twitterCard} />
      <meta name='twitter:title' content={props.title} />
      <meta name='twitter:description' content={props.description} />
      <meta name='twitter:image' content={props.imageUrl} />
    </Helmet>
  );
};

const MainHeadTags: FunctionComponent<{ pageSettings: PageSettings }> = (props) => {
  const title = props.pageSettings.pageTitle;
  const description =
    'Open VSX is an Eclipse open-source project and alternative to the Visual Studio Marketplace. It is deployed by the Eclipse Foundation at open-vsx.org.';
  const keywords =
    'eclipse,ide,open source,development environment,development,vs code,visual studio code,extension,plugin,plug-in,registry,theia';
  const url = `${location.protocol}//${location.host}`;
  const imageUrl = url + '/openvsx-preview.png';

  return <HeadTags title={title} description={description} keywords={keywords} url={url} imageUrl={imageUrl} />;
};

const ExtensionHeadTags: FunctionComponent<{ extension?: Extension; pageSettings: PageSettings }> = (props) => {
  const { name, namespace } = useParams();
  let title = ` – ${props.pageSettings.pageTitle}`;
  let url = `${location.protocol}//${location.host}/extension/`;
  let description: string | undefined;
  let keywords: string | undefined;
  if (props.extension) {
    title = (props.extension.displayName ?? props.extension.name) + title;
    url += `${props.extension.namespace}/${props.extension.name}`;
    description = props.extension.description;
    // extension description can be up to 2048 characters, truncate it.
    if (description && description.length > 255) {
      let lastWordIndex = description.indexOf(' ', 255);
      lastWordIndex = lastWordIndex !== -1 ? lastWordIndex - 1 : 255;
      description = description.substring(0, lastWordIndex);
    }
    if (props.extension.tags) {
      keywords = props.extension.tags.filter((t) => !t.startsWith('__')).join();
    }
  } else {
    title = name + title;
    url += `${namespace}/${name}`;
  }

  return <HeadTags title={title} url={url} description={description} keywords={keywords} />;
};

const NamespaceHeadTags: FunctionComponent<{ namespaceDetails?: NamespaceDetails; pageSettings: PageSettings }> = (
  props
) => {
  const { name } = useParams();
  const namespaceName = props.namespaceDetails?.displayName ?? props.namespaceDetails?.name ?? name;
  const title = `${namespaceName} – ${props.pageSettings.pageTitle}`;
  const url = `${location.protocol}//${location.host}/namespace/${namespaceName}`;
  const description = props.namespaceDetails?.description;
  return <HeadTags title={title} url={url} description={description} />;
};

export default function createPageSettings(theme: Theme, prefersDarkMode: boolean): PageSettings {
  //---------- SERVER VERSION
  const ServerVersion: FunctionComponent = () => {
    const { version } = useContext(MainContext);
    if (!version) {
      return <div>Loading version...</div>;
    }
    return (
      <Typography variant='body2' sx={{ alignSelf: 'flex-start', fontSize: '0.8rem' }}>
        {version.version}
      </Typography>
    );
  };

  //---------- MAIN LOGO / TOOLBAR
  const toolbarContent: FunctionComponent = () => {
    const { user } = useContext(MainContext);

    return (
      <>
        <RouteLink
          to={ExtensionListRoutes.MAIN}
          aria-label={`Home - Open VSX Registry`}
          // A bare anchor leaks the browser's link color into the wordmark; color:inherit
          // lets the logo follow the navbar's content color, which is tinted on extension bands.
          style={{ display: 'flex', color: 'inherit' }}>
          <OpenVSXLogo width='auto' height='40px' marginTop='8px' />
        </RouteLink>
        {user?.role === 'admin' && (
          <Suspense>
            <ServerVersion />
          </Suspense>
        )}
      </>
    );
  };

  //---------- ANNOUNCEMENT BANNER
  const bannerContent: FunctionComponent = () => (
    <>
      <Box component='span' sx={{ fontWeight: 700 }}>
        Open VSX is growing.
      </Box>{' '}
      <Box component='span' sx={{ color: 'text.secondary' }}>
        To support reliable access as usage increases, we&apos;ve implemented rate limiting tiers that govern usage.
      </Box>{' '}
      <Link href='https://github.com/EclipseFdn/open-vsx.org/wiki/rate-limiting'>Learn more →</Link>
    </>
  );

  //---------- SEARCH HEADER
  const searchHeader: FunctionComponent = () => (
    <Box textAlign='center' sx={{ mb: 3, maxWidth: '43.75rem', mx: 'auto' }}>
      <Box
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          px: '0.8125rem',
          py: '0.375rem',
          borderRadius: '999px',
          bgcolor: 'accentSoft',
          color: 'secondary.light',
          fontSize: '0.75rem',
          fontWeight: 600,
          mb: 3
        }}>
        <Box
          component='span'
          sx={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            bgcolor: 'secondary.main',
            display: 'inline-block',
            flexShrink: 0
          }}
        />
        Open-source registry for VS Code–compatible editors
      </Box>
      <Typography
        component='h1'
        sx={{
          fontSize: { xs: '2.2rem', sm: '3rem', md: '3.375rem' },
          lineHeight: 1.04,
          letterSpacing: '-0.035em',
          fontWeight: 800,
          mb: 2
        }}>
        Find the right extension,
        <br />
        for any editor.
      </Typography>
      <Typography
        sx={{ fontSize: '1.125rem', color: 'text.secondary', maxWidth: '35rem', mx: 'auto', lineHeight: 1.5 }}>
        Browse community-published extensions. <br />
        Free, open, and vendor-neutral.
      </Typography>
    </Box>
  );

  //---------- DOWNLOAD TERMS
  const downloadTerms: FunctionComponent = () => (
    <Box mt={1}>
      <Typography variant='body2'>
        By clicking download, you accept this website&apos;s&nbsp;
        <Link color='secondary' underline='hover' href='https://open-vsx.org/terms-of-use'>
          Terms of Use
        </Link>
        .
      </Typography>
    </Box>
  );

  //---------- ADDITIONAL PAGES
  const additionalRoutes: ReactNode = (
    <>
      <Route path='/about' element={<About />} />
      <Route path='/terms-of-use' element={<Document url='/documents/terms-of-use.md' />} />
      <Route path='/publisher-agreement-v1.1' element={<Document url='/documents/publisher-agreement-v1.1.md' />} />
      <Route path='/members' element={<Members />} />
      <Route path='/adopters' element={<Adopters />} />
    </>
  );

  //---------- REPORT ABUSE LINK
  const reportAbuse: FunctionComponent<{ extension: Extension; sx: SxProps<Theme> }> = ({ extension, sx }) => {
    const reportAbuseText = encodeURIComponent('<Please describe the issue>');
    const extensionURL = encodeURIComponent(
      `${location.protocol}//${location.hostname}/extension/${extension.namespace}/${extension.name}`
    );
    return (
      <Link
        href={`mailto:security@open-vsx.org?subject=Report%20Abuse%20-%20${extension.namespace}.${extension.name}&Body=${reportAbuseText}%0A%0A${extensionURL}`}
        variant='body2'
        color='secondary'
        underline='hover'
        sx={sx}>
        Report Abuse
      </Link>
    );
  };

  //---------- CLAIM NAMESPACE LINK
  const claimNamespace: FunctionComponent<{ extension: Extension; sx: SxProps<Theme> }> = ({ sx, extension }) => {
    const title = `Claiming namespace \`${extension.namespace}\``;

    return (
      <>
        {!extension.verified && (
          <Link
            href={`https://github.com/EclipseFdn/open-vsx.org/issues/new?template=claim-namespace-ownership.yml&namespace=${encodeURIComponent(extension.namespace)}&title=${encodeURIComponent(title)}`}
            target='_blank'
            variant='body2'
            color='secondary'
            underline='hover'
            sx={sx}>
            Claim Ownership
          </Link>
        )}
      </>
    );
  };

  //---------- HOME
  const home: PageSettings['elements']['home'] = {
    popularSearches: ['python', 'git', 'docker', 'prettier', 'eslint', 'rust', 'java'],
    involvement: {
      heading: 'Get Involved',
      cards: [
        {
          icon: <CallSplitIcon />,
          title: 'Contribute',
          description: 'Open VSX is fully open source. Help build the registry the ecosystem depends on.',
          href: REPO_URL,
          label: 'View on GitHub →'
        },
        {
          icon: <GroupsIcon />,
          title: 'Join the Working Group',
          description: 'Shape the future of an open, vendor-neutral marketplace for extensions.',
          href: '/members',
          label: 'Learn more →'
        },

        {
          icon: <MenuBookIcon />,
          title: 'Read the docs',
          description: 'Learn how to publish, claim namespaces, and consume extensions via the API.',
          href: WIKI_URL,
          label: 'View documentation →'
        }
      ]
    }
  };

  //---------- FOOTER
  const footer: PageSettings['elements']['footer'] = {
    brand: {
      logo: <OpenVsxMark />,
      name: 'Open VSX Registry',
      description: 'An open-source, vendor-neutral registry for VS Code–compatible extensions.'
    },
    columns: [
      {
        heading: 'Resources',
        links: [
          { label: 'Documentation', href: WIKI_URL, external: true },
          { label: 'Status', href: 'https://status.open-vsx.org/', external: true },
          { label: 'Commercial Usage', href: 'https://managed.open-vsx.org/', external: true },
          { label: 'Report a Vulnerability', href: 'https://researcher-recognition.open-vsx.org', external: true },
          { label: 'Sponsor', href: 'https://www.eclipse.org/donate/openvsx/', external: true }
        ]
      },
      {
        heading: 'Community',
        links: [
          { label: 'About This Service', href: '/about' },
          { label: 'Members', href: '/members' },
          { label: 'Adopters', href: '/adopters' }
        ]
      },
      {
        heading: 'Legal',
        links: [
          { label: 'OSS Access', href: 'https://managed.open-vsx.org/contact', external: true },
          { label: 'Privacy Policy', href: 'https://www.eclipse.org/legal/privacy/', external: true },
          { label: 'Terms of Use', href: '/terms-of-use' },
          { label: 'Security Policy', href: '/security/' },
          { label: 'Compliance', href: 'https://www.eclipse.org/legal/compliance/', external: true },
          { label: 'Legal Resources', href: 'http://www.eclipse.org/legal/', external: true }
        ]
      }
    ],
    social: [
      { title: 'Open VSX on GitHub', href: REPO_URL, icon: <GitHubIcon sx={{ fontSize: '1rem' }} /> },
      {
        title: 'Open VSX on LinkedIn',
        href: 'https://www.linkedin.com/company/open-vsx/',
        icon: <LinkedInIcon sx={{ fontSize: '1rem' }} />
      },
      { title: 'Open VSX on X (Twitter)', href: 'https://x.com/openvsx', icon: <XIcon sx={{ fontSize: '1rem' }} /> }
    ],
    copyright: (
      <>
        Copyright &copy;{' '}
        <Link href='https://www.eclipse.org' color='inherit' underline='hover'>
          Eclipse Foundation, AISBL.
        </Link>{' '}
        All Rights Reserved.
      </>
    ),
    extra: (
      <Box
        component='span'
        className='toolbar-manage-cookies'
        sx={{
          cursor: 'pointer',
          fontSize: '0.75rem',
          color: 'text.disabled',
          '&:hover': { color: 'secondary.light' }
        }}>
        Manage Cookies
      </Box>
    )
  };

  return {
    pageTitle: 'Open VSX Registry',
    themeType: prefersDarkMode ? 'dark' : 'light',
    publisherAgreement: {
      name: 'Eclipse Foundation Open VSX',
      email: 'openvsx@eclipse-foundation.org'
    },
    elements: {
      defaultMenuContent: DefaultMenuContent,
      mobileMenuContent: MobileMenuContent,
      toolbarContent,
      banner: {
        content: bannerContent,
        props: {
          dismissButton: {
            show: true
          },
          color: 'info'
        },
        cookie: {
          key: 'Rate-Limit-Announcement',
          value: 'closed',
          path: '/'
        }
      },
      footer,
      home,
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
      namespaceAccessInfo: 'https://github.com/eclipse-openvsx/openvsx/wiki/Namespace-Access',
      publisherAgreement: '/documents/publisher-agreement-v1.1.md'
    }
  };
}
