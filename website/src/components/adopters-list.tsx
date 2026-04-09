/********************************************************************************
 * Copyright (c) 2023 TypeFox and others
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *
 * SPDX-License-Identifier: EPL-2.0
 ********************************************************************************/

import { FunctionComponent, useState, useEffect, useContext, useRef } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { styled, Theme } from '@mui/material/styles';
import { MainContext } from 'openvsx-webui/lib/context';

interface Project {
  project_id: string;
  name: string;
  url: string;
  logo: string;
  adopters: Adopter[];
}

interface Adopter {
  name: string;
  logo: string;
  projects: string[];
  homepage_url: string;
  logo_white: string;
}

const AdoptersList: FunctionComponent = () => {
  const abortController = useRef<AbortController>(new AbortController());
  const [loaded, setLoaded] = useState(false);
  const [adopters, setAdopters] = useState<Adopter[]>([]);

  const loadAdopters = async () => {
    try {
      setLoaded(false);

      const res = await fetch(`https://api.eclipse.org/adopters/projects?working_group=cloud-development-tools`, {
        signal: abortController.current.signal
      });

      if (!res.ok) {
        throw new Error('Failed to fetch adopters');
      }

      const projects = (await res.json()) as Project[];
      const project = projects.find((p) => p.project_id == 'ecd.openvsx');
      if (project) {
        setAdopters(project.adopters);
      }
    } catch (err: any) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      console.error(`Error loading adopters: ${err}`);
    } finally {
      setLoaded(true);
    }
  };

  useEffect(() => {
    if (loaded) return;
    loadAdopters();
    return () => abortController.current.abort();
  }, [loaded]);

  if (!loaded) return <CircularProgress />;
  return (
    <Grid container spacing={3} mt={2}>
      {adopters.map((adopter) => (
        <AdopterItem
          key={adopter.name}
          name={adopter.name}
          logo={adopter.logo}
          logoWhite={adopter.logo_white}
          url={adopter.homepage_url}
        />
      ))}
    </Grid>
  );
};

export default AdoptersList;

interface AdopterItemProps {
  name: string;
  logo?: string;
  logoWhite?: string;
  url?: string;
}

const bordered = (theme: Theme) => {
  return {
    border: '1px solid',
    borderColor: theme.palette.mode === 'light' ? theme.palette.grey['300'] : theme.palette.grey['800']
  };
};

const HeaderBox = styled(Box)(({ theme }: { theme: Theme }) => ({
  ...bordered(theme),
  display: 'flex',
  alignItems: 'center',
  minHeight: '6rem',
  backgroundColor: theme.palette.mode === 'light' ? theme.palette.grey['300'] : theme.palette.grey['800']
}));

const BodyBox = styled(Box)(({ theme }: { theme: Theme }) => ({
  ...bordered(theme),
  display: 'flex',
  height: '100%',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: theme.palette.background.default
}));

const GridContainer = styled(Grid)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
  height: '18rem',
  textAlign: 'center'
});

const AdopterItem: FunctionComponent<AdopterItemProps> = ({ name, logo, logoWhite, url }) => {
  const { pageSettings } = useContext(MainContext);
  const styles = {
    heading: {
      width: '100%'
    },
    logoContainer: {
      width: '100%',
      maxWidth: '8rem',
      maxHeight: '8rem'
    },
    logo: {
      width: '100%',
      height: '100%',
      objectFit: 'contain'
    }
  };

  let logoUrl = pageSettings.themeType == 'dark' ? logoWhite : logo;
  if (logoUrl) {
    logoUrl = 'https://api.eclipse.org/adopters/assets/images/adopters/' + logoUrl;
  }

  return (
    <GridContainer item xs={12} md={4}>
      <HeaderBox p={2}>
        {url ? (
          <Link sx={styles.heading} href={url} variant='h6'>
            {name}
          </Link>
        ) : (
          <Typography sx={styles.heading} variant='h6'>
            {name}
          </Typography>
        )}
      </HeaderBox>
      <BodyBox p={2}>
        <Box sx={styles.logoContainer}>
          {logoUrl ? (
            <Box component='img' sx={styles.logo} src={logoUrl} alt='' />
          ) : (
            <Typography variant='h6'>{name}</Typography>
          )}
        </Box>
      </BodyBox>
    </GridContainer>
  );
};
