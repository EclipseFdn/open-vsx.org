/********************************************************************************
 * Copyright (c) 2023 TypeFox and others
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *
 * SPDX-License-Identifier: EPL-2.0
 ********************************************************************************/

import * as React from 'react';
import { Container, Typography, Box, makeStyles, createStyles } from '@material-ui/core';
import MembersList from './components/members-list';

const useStyle = makeStyles((theme) => 
    createStyles({
        heading: {
            marginTop: theme.spacing(4)
        }
    })
);

const Members = () => {
    const classes = useStyle();

    return (
        <Container maxWidth='md'>
            <Typography 
                variant='h4' 
                className={classes.heading}
            >
                Members
            </Typography>
            <Box mb={4}>
                <MembersList collaborationId='open-vsx' level='SD' />
            </Box>
        </Container>
   );
}

export default Members;
