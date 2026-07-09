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
import { HeroSearch, CuratedSections, GetInvolved } from 'openvsx-webui';
import CallSplitIcon from '@mui/icons-material/CallSplit';
import GroupsIcon from '@mui/icons-material/Groups';
import MenuBookIcon from '@mui/icons-material/MenuBook';

const WIKI_URL = 'https://github.com/EclipseFdn/open-vsx.org/wiki';
const REPO_URL = 'https://github.com/eclipse-openvsx/openvsx';

// Hero copy rendered above the search field (badge, headline, tagline).
const SearchHeader: FunctionComponent = () => (
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
    <Typography sx={{ fontSize: '1.125rem', color: 'text.secondary', maxWidth: '35rem', mx: 'auto', lineHeight: 1.5 }}>
      Browse community-published extensions. <br />
      Free, open, and vendor-neutral.
    </Typography>
  </Box>
);

// The home page, composed from the library's exported sections. Each section
// boxes itself, so no width-constraining wrapper here.
export const Home: FunctionComponent = () => (
  <>
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
  </>
);
