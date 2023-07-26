/********************************************************************************
 * Copyright (c) 2023 TypeFox and others
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *
 * SPDX-License-Identifier: EPL-2.0
 ********************************************************************************/

import React, { useState, useEffect } from 'react';
import { CircularProgress, Grid, Box, Link, Typography, createStyles, makeStyles } from '@material-ui/core';

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

const MembersList: React.FC<MembersListProps> = ({ collaborationId }) => {
    const [loaded, setLoaded] = useState(false);
    const [members, setMembers] = useState<Member[]>([]);

    useEffect(() => {
        if (loaded) return;

        const abortController = new AbortController();

        fetch(`https://membership.eclipse.org/api/organizations?working_group=${collaborationId}`, { 
            cache: 'force-cache',
            signal: abortController.signal,
        })
            .then(async (res) => {
                if (!res.ok) throw new Error('Failed to fetch members');
            
                const data = await res.json();
                setMembers(data);
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

const MemberItem: React.FC<MemberItemProps> = ({ name, logo, url }) => {
    const classes = useStyles();

    return (
        <Grid className={classes.container} item xs={12} md={4}>
            <Box p={2} className={classes.bordered + ' ' + classes.header}>
                <Link className={classes.heading} href={url} variant="h6">{name}</Link>
            </Box>
            <Box className={classes.bordered + ' ' + classes.body} p={2}>
                <Box className={classes.logoContainer}>
                    { logo 
                        ? <img className={classes.logo} src={logo} alt='' />
                        : <Typography variant='h6'>{name}</Typography>
                    }
                </Box>
            </Box>
        </Grid>
    );
};

const useStyles = makeStyles(() => 
    createStyles({
        container: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch',
            height: '18rem',
			textAlign: 'center',
        },
        bordered: {
            border: '#424242 1px solid',            
        },
        header: {
            display: 'flex',
            alignItems: 'center',
            minHeight: '6rem',
            backgroundColor: '#424242',
        },
        heading: {
            width: '100%',
        },
        body: {
            display: 'flex',
            height: '100%',
            alignItems: 'center',
			justifyContent: 'center',
            backgroundColor: '#363636',
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
        },
    })
);
