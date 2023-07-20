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
import { CircularProgress, Grid, Box, Link, Typography } from '@material-ui/core';

type MembershipLevel = 'SD' | 'AP' | 'AS';

interface Member {
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
    const [members, setMembers] = useState<Member[]>([]);

    useEffect(() => {
        fetch(`https://membership.eclipse.org/api/organizations?working_group=${collaborationId}`)
            .then(res => res.ok 
                ? res.json() 
                : Promise.reject()
            )
            .then(data => setMembers(data))
    }, [members]);

    if (members.length === 0) return <CircularProgress />;

    return (
        <Grid container spacing={3}>
            { members.map(member => 
                <MemberItem 
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
    return (
        <Grid item xs={12} md={3}>
            <Box>
                <Link href={url}>{name}</Link>
            </Box>
            <Box>
                { logo 
                    ? <img src={logo} alt='' />
                    : <Typography variant='h5'>{name}</Typography>
                }
            </Box>
        </Grid>
    );
};
