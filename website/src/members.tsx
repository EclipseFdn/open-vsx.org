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
import { Container, Typography, Box, Button, makeStyles, createStyles } from '@material-ui/core';
import MembersList from './components/members-list';

const useStyle = makeStyles((theme) => 
    createStyles({
        heading: {
            marginTop: theme.spacing(4),
			marginBottom: theme.spacing(2),
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
            <Typography>
              The Open VSX Working Group aims to ensure the continued sustainability, integrity,
              evolution and adoption of the Open VSX Registry. In particular, it is formed to
              provide governance, guidance, and funding for the communities that support the
              implementation, deployment, maintenance and adoption of the Eclipse Foundation’s Open
              VSX Registry at open-vsx.org.
            </Typography>
            <Box my={4}>
                <MembersList collaborationId='open-vsx' level='SD' />
            </Box>
            <Box mb={4} textAlign='center'>
              <Button 
                  variant='contained' 
                  color='secondary' 
                  href='https://membership.eclipse.org/application'
              >
                Become a Member
              </Button>
            </Box>
        </Container>
   );
}

export default Members;
