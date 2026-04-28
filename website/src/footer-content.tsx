/********************************************************************************
 * Copyright (c) 2020 TypeFox and others
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *
 * SPDX-License-Identifier: EPL-2.0
 ********************************************************************************/

import { FunctionComponent, useState } from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import useMediaQuery from '@mui/material/useMediaQuery';
import { Link as RouteLink } from 'react-router-dom';
import { Theme } from '@mui/material/styles/createTheme';
import useTheme from '@mui/material/styles/useTheme';
import GitHubIcon from '@mui/icons-material/GitHub';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const styles = {
  link: (theme: Theme) => ({
    color: theme.palette.text.primary,
    textDecoration: 'none',
    '&:hover': {
      color: theme.palette.secondary.main,
      textDecoration: 'none'
    }
  }),
  repositoryLink: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '1.1rem'
  },
  legalText: {
    fontWeight: 'fontWeightLight'
  },
  cookieText: {
    cursor: 'pointer',
    fontWeight: 300
  }
};

const LegalLink = styled(RouteLink)(({ theme }: { theme: Theme }) => ({
  ...styles.link(theme),
  fontWeight: theme.typography.fontWeightLight
}));

interface MainFooterProps {
  isSmallDisplay: boolean;
  isLargeDisplay: boolean;
  expanded: boolean;
  toggleExpanded: () => void;
}

const MainFooter = ({ isSmallDisplay, isLargeDisplay, expanded, toggleExpanded }: MainFooterProps) => {
  const itemSpacing = 2.5;
  return (
    <Box display='flex' justifyContent='space-between' alignItems='center'>
      {isSmallDisplay ? null : repositoryLink()}
      {isLargeDisplay ? (
        <Box display='flex'>
          <Box>{ossAccess()}</Box>
          <Box ml={itemSpacing}>{privacyPolicy()}</Box>
          <Box ml={itemSpacing}>{securityPolicy()}</Box>
          <Box ml={itemSpacing}>{termsOfUse()}</Box>
          <Box ml={itemSpacing}>{compliance()}</Box>
          <Box ml={itemSpacing}>{legalResources(false)}</Box>
          <Box ml={itemSpacing}>{manageCookies()}</Box>
          <Box ml={itemSpacing}>{copyrightText()}</Box>
          <Box ml={itemSpacing}>{rightsReservedText()}</Box>
        </Box>
      ) : (
        <>
          {copyrightText()}
          <Box display='flex' alignItems='center'>
            {legalResources(true)}
            {expanded ? (
              <ExpandMoreIcon onClick={() => toggleExpanded()} />
            ) : (
              <ExpandLessIcon onClick={() => toggleExpanded()} />
            )}
          </Box>
        </>
      )}
    </Box>
  );
};

const FooterContent: FunctionComponent<{ expanded: boolean }> = ({ expanded }) => {
  const theme = useTheme();
  const isSmallDisplay = useMediaQuery(theme.breakpoints.down('sm'));
  const isLargeDisplay = useMediaQuery(theme.breakpoints.up('xl'));
  const [expandedFooter, setExpandedFooter] = useState(false);

  const toggleExpandedFooter = () => {
    setExpandedFooter(!expandedFooter);
  };

  if (expandedFooter && !isLargeDisplay) {
    const itemSpacing = 1;
    return (
      <Box display='flex' flexDirection='column' alignItems='stretch'>
        <Box display='flex' flexDirection='column' alignItems='flex-end'>
          <Box mb={itemSpacing}>{ossAccess()}</Box>
          <Box mb={itemSpacing}>{privacyPolicy()}</Box>
          <Box mb={itemSpacing}>{securityPolicy()}</Box>
          <Box mb={itemSpacing}>{termsOfUse()}</Box>
          <Box mb={itemSpacing}>{compliance()}</Box>
          <Box mb={itemSpacing}>{legalResources(isSmallDisplay)}</Box>
          <Box mb={itemSpacing + 1}>{manageCookies()}</Box>
        </Box>
        <MainFooter
          isSmallDisplay={isSmallDisplay}
          isLargeDisplay={isLargeDisplay}
          expanded={expandedFooter}
          toggleExpanded={toggleExpandedFooter}
        />
      </Box>
    );
  } else {
    return (
      <MainFooter
        isSmallDisplay={isSmallDisplay}
        isLargeDisplay={isLargeDisplay}
        expanded={expandedFooter}
        toggleExpanded={toggleExpandedFooter}
      />
    );
  }
};

const repositoryLink = () => (
  <Link target='_blank' href='https://github.com/eclipse-openvsx/openvsx' sx={[styles.link, styles.repositoryLink]}>
    <GitHubIcon />
    &nbsp;eclipse-openvsx/openvsx
  </Link>
);

const ossAccess = () => (
  <Link href='https://managed.open-vsx.org/contact' sx={[styles.link, styles.legalText]}>
    OSS Access
  </Link>
);

const privacyPolicy = () => (
  <Link href='https://www.eclipse.org/legal/privacy/' sx={[styles.link, styles.legalText]}>
    Privacy Policy
  </Link>
);

const securityPolicy = () => (
  <Link href='/security/' sx={[styles.link, styles.legalText]}>
    Security Policy
  </Link>
);

const termsOfUse = () => <LegalLink to='/terms-of-use'>Terms of Use</LegalLink>;

const compliance = () => (
  <Link href='https://www.eclipse.org/legal/compliance/' sx={[styles.link, styles.legalText]}>
    Compliance
  </Link>
);

const legalResources = (isSmallDisplay: boolean) => (
  <Link href='http://www.eclipse.org/legal/' sx={[styles.link, styles.legalText]}>
    Legal {!isSmallDisplay && 'Resources'}
  </Link>
);

const copyrightText = () => (
  <Box sx={styles.legalText}>
    Copyright &copy;{' '}
    <Link href='https://www.eclipse.org' sx={styles.link}>
      Eclipse Foundation, AISBL.
    </Link>
  </Box>
);

const rightsReservedText = () => <Box sx={styles.legalText}>All Rights Reserved.</Box>;

const manageCookies = () => (
  <Box sx={[styles.link, styles.cookieText]} className='toolbar-manage-cookies'>
    Manage Cookies
  </Box>
);
export default FooterContent;
