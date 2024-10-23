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
import { Container, Typography, Box, Button } from '@mui/material';
import { styled, Theme } from '@mui/material/styles';
import MembersList from './components/members-list';

const Heading = styled(Typography)(({ theme }: { theme: Theme }) => ({
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(2)
}));

const Members = () => {
    return (
        <Container maxWidth='md'>
            <Heading variant='h4'>
                Members
            </Heading>
            <Typography>
                The Open VSX Working Group aims to ensure the continued sustainability, integrity,
                evolution and adoption of the Open VSX Registry. In particular, it is formed to
                provide governance, guidance, and funding for the communities that support the
                implementation, deployment, maintenance and adoption of the Eclipse Foundation’s Open
                VSX Registry at open-vsx.org.
            </Typography>

            <Box display="flex" gap={1} my={4} justifyContent="center" textAlign="center" >
              <Button 
                  variant='contained' 
                  color='secondary' 
                  href='https://www.eclipse.org/membership/join-us/'
              >
                Contact Us About Membership
              </Button>
              <Button 
                  variant='contained' 
                  color='secondary' 
                  href='https://membership.eclipse.org/application/ready-to-join'
              >
                My Organisation Is Ready to Join Now
              </Button>
            </Box>

            <MembersList collaborationId='open-vsx' />
        </Container>
   );
}

export default Members;
