/********************************************************************************
 * Copyright (c) 2023 TypeFox and others
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *
 * SPDX-License-Identifier: EPL-2.0
 ********************************************************************************/

import React, { FunctionComponent, useState, useEffect } from 'react';
import { CircularProgress, Grid, Box, Link, Typography } from '@mui/material';
import { styled, Theme } from '@mui/material/styles';

type MembershipLevel = 'SD' | 'AP' | 'AS';

interface Member {
    organization_id: number;
    name: string;
    logos: {
        web: string | null
    };
    website: string;
    levels: {
        level: MembershipLevel;
        description: string;
        sort_order: string;
    }[];
}

interface MembersListProps {
    collaborationId: string;
    level: MembershipLevel;
}

const MembersList: FunctionComponent<MembersListProps> = ({ collaborationId, level }) => {
    const [loaded, setLoaded] = useState(false);
    const [members, setMembers] = useState<Member[]>([]);

    useEffect(() => {
        if (loaded) return;

        const abortController = new AbortController();

        fetch(`https://membership.eclipse.org/api/organizations?working_group=${collaborationId}`, { 
            signal: abortController.signal,
        })
            .then(async (res) => {
                if (!res.ok) throw new Error('Failed to fetch members');
            
                const data = await res.json() as Member[];

                setMembers(
                  data.filter((member) => 
                    member.levels.some((l) => l.level === level)
                  )
                );
            })
            .catch((err) => {
                if (err instanceof DOMException && err.name === 'AbortError') return;
                console.error(err);
            })
            .finally(() => abortController.signal.aborted || setLoaded(true));

        return () => abortController.abort();
    }, [members, loaded]);

    if (members.length === 0) return <CircularProgress />;

    return (
        <Grid container spacing={3}>
            { members.map(member => 
                <MemberItem 
                    key={member.organization_id}
                    name={member.name}
                    logo={member.logos.web}
                    url={member.website}
                />
            )}
        </Grid>
    );
};

export default MembersList;

interface MemberItemProps {
    name: string;
    logo?: string | null;
    url: string;
}

const bordered = (theme: Theme) => {
    return {
        border: '1px solid',            
        borderColor: theme.palette.mode === 'light' 
            ? theme.palette.grey['300'] 
            : theme.palette.grey['800']
    };
};

const HeaderBox = styled(Box)(({ theme }: { theme: Theme }) => ({
    ...bordered(theme),
    display: 'flex',
    alignItems: 'center',
    minHeight: '6rem',
    backgroundColor: theme.palette.mode === 'light' 
        ? theme.palette.grey['300'] 
        : theme.palette.grey['800']
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
    textAlign: 'center',
});

const MemberItem: FunctionComponent<MemberItemProps> = ({ name, logo, url }) => {
    const styles = {
        heading: {
            width: '100%',
        },
        logoContainer: {
            width: '100%',	
            maxWidth: '8rem',
            maxHeight: '8rem',
        },
        logo: {
            width: '100%',
            height: '100%',
            objectFit: 'contain',
        }
    };

    return (
        <GridContainer item xs={12} md={4}>
            <HeaderBox p={2}>
                { url 
                    ? <Link sx={styles.heading} href={url} variant="h6">{name}</Link>
                    : <Typography sx={styles.heading} variant="h6">{name}</Typography>
                }
            </HeaderBox>
            <BodyBox p={2}>
                <Box sx={styles.logoContainer}>
                    { logo 
                        ? <Box component='img' sx={styles.logo} src={logo} alt='' />
                        : <Typography variant='h6'>{name}</Typography>
                    }
                </Box>
            </BodyBox>
        </GridContainer>
    );
};