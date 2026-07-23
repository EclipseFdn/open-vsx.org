/******************************************************************************
 * Copyright (c) 2026 Contributors to the Eclipse Foundation.
 *
 * See the NOTICE file(s) distributed with this work for additional
 * information regarding copyright ownership.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License 2.0 which is available at
 * https://www.eclipse.org/legal/epl-2.0.
 *
 * SPDX-License-Identifier: EPL-2.0
 *****************************************************************************/

import { FunctionComponent } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { HeroSearch, CuratedSections, GetInvolved, BrowseCategories, PageContainer, SectionStack } from 'openvsx-webui';
import CallSplitIcon from '@mui/icons-material/CallSplit';
import GroupsIcon from '@mui/icons-material/Groups';
import MenuBookIcon from '@mui/icons-material/MenuBook';

const WIKI_URL = 'https://github.com/EclipseFdn/open-vsx.org/wiki';
const REPO_URL = 'https://github.com/eclipse-openvsx/openvsx';

// Hero copy rendered above the search field (badge, headline, tagline).
const SearchHeader: FunctionComponent = () => (
  <Box textAlign='center' sx={{ mb: 3, mx: 'auto' }}>
    <Typography
      component='h1'
      sx={{
        fontSize: { xs: '2.2rem', sm: '3rem', md: '3.375rem' },
        lineHeight: 1.04,
        letterSpacing: '-0.035em',
        fontWeight: 800,
        mb: 2
      }}>
      Extensions for modern developer tools.
    </Typography>
    <Typography sx={{ fontSize: '1.125rem', color: 'text.secondary', mx: 'auto', lineHeight: 1.5 }}>
      Discover extensions for VS Code-compatible editors, AI coding tools, cloud IDEs, and developer platforms.
    </Typography>
  </Box>
);

// The home page, composed from the library's exported sections. Each section
// boxes itself, so no width-constraining wrapper here.
export const Home: FunctionComponent = () => (
  <PageContainer fluid component='main' sx={{ animation: 'fadeIn .25s ease' }}>
    <SectionStack>
      <HeroSearch
        searchHeader={SearchHeader}
        popularSearches={['python', 'git', 'docker', 'prettier', 'eslint', 'rust', 'java']}
      />
      <CuratedSections
        sections={[
          { title: 'Featured', subtitle: 'Top picks ranked by relevance', sortBy: 'relevance' },
          {
            title: 'Most downloaded',
            subtitle: 'The extensions developers rely on every day',
            sortBy: 'downloadCount'
          },
          { title: 'Recently updated', subtitle: 'Fresh releases from publishers this week', sortBy: 'timestamp' }
        ]}
      />
      <BrowseCategories />
      <GetInvolved
        heading='Get Involved'
        cards={[
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
        ]}
      />
    </SectionStack>
  </PageContainer>
);
