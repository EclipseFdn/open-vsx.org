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
import {
  HeroSearch,
  CuratedSections,
  GetInvolved,
  BrowseCategories,
  PageContainer,
  SectionStack,
  SectionSeparator
} from 'openvsx-webui';
import CallSplitIcon from '@mui/icons-material/CallSplit';
import GroupsIcon from '@mui/icons-material/Groups';
import MenuBookIcon from '@mui/icons-material/MenuBook';

const WIKI_URL = 'https://github.com/EclipseFdn/open-vsx.org/wiki';
const REPO_URL = 'https://github.com/eclipse-openvsx/openvsx';

// Hero copy rendered above the search field (gradient headline, tagline).
const SearchHeader: FunctionComponent = () => (
  <Box
    textAlign="center"
    className="animate-fade-in-up"
    sx={{ mb: 2, mx: 'auto', maxWidth: '48rem', position: 'relative' }}
  >
    {/* Hero Headline with Gradient Typography */}
    <Typography
      component="h1"
      sx={(theme) => ({
        fontSize: { xs: '2.25rem', sm: '3.25rem', md: '3.75rem' },
        lineHeight: 1.08,
        letterSpacing: '-0.03em',
        fontWeight: 800,
        mb: 2,
        background:
          theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, #ffffff 0%, #e9dcfc 40%, #c084fc 70%, #a855f7 100%)'
            : 'linear-gradient(135deg, #1c1330 0%, #4c1d95 40%, #6d28d9 75%, #8b5cf6 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent'
      })}
    >
      Extensions for modern developer tools.
    </Typography>

    {/* Subtitle */}
    <Typography
      sx={(theme) => ({
        fontSize: { xs: '1rem', sm: '1.2rem' },
        color: theme.palette.text.secondary,
        maxWidth: '38rem',
        mx: 'auto',
        lineHeight: 1.6,
        fontWeight: 400,
        mb: 1
      })}
    >
      Discover, publish, and manage extensions for VS Code-compatible editors, AI coding tools, cloud IDEs, and developer platforms.
    </Typography>
  </Box>
);

// The home page, composed from the library's exported sections. Each section
// boxes itself, so no width-constraining wrapper here.
export const Home: FunctionComponent = () => (
  <PageContainer fluid component="main" sx={{ animation: 'fadeIn .35s ease' }}>
    <SectionStack>
      <Box
        sx={(theme) => ({
          position: 'relative',
          pt: { xs: 2, md: 4 },
          pb: { xs: 2, md: 4 },
          px: { xs: 1, sm: 2 },
          borderRadius: 4,
          background:
            theme.palette.mode === 'dark'
              ? 'radial-gradient(ellipse at 50% 0%, rgba(168, 85, 247, 0.15) 0%, rgba(124, 58, 237, 0.05) 50%, transparent 80%)'
              : 'radial-gradient(ellipse at 50% 0%, rgba(139, 92, 246, 0.1) 0%, rgba(109, 40, 217, 0.03) 50%, transparent 80%)'
        })}
      >
        <HeroSearch
          searchHeader={SearchHeader}
          popularSearches={['python', 'git', 'docker', 'prettier', 'eslint', 'rust', 'java', 'typescript']}
        />
      </Box>

      <SectionSeparator />
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
        heading="Get Involved"
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
