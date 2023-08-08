/********************************************************************************
 * Copyright (c) 2020 TypeFox and others
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *
 * SPDX-License-Identifier: EPL-2.0
 ********************************************************************************/

import * as React from 'react';
import { Link, Typography, Container } from '@mui/material';
import { styled, Theme } from '@mui/material/styles';

const Heading = styled(Typography)(({ theme }: { theme: Theme }) => ({
    marginTop: theme.spacing(4)
}));

const Paragraph = styled(Typography)(({ theme }: { theme: Theme }) => ({
    marginTop: theme.spacing(2)
}));

const RepositoryList = styled('ul')(({ theme }: { theme: Theme }) => ({
    fontSize: theme.typography.body1.fontSize,
    fontFamily: theme.typography.body1.fontFamily,
    fontWeight: theme.typography.body1.fontWeight,
    lineHeight: theme.typography.body1.lineHeight
}));

const About = () => {
    return <Container maxWidth='md'>
        <Heading variant='h4'>About This Service</Heading>
        <Paragraph variant='body1'>
            Open VSX is an open-source registry for VS Code extensions.
            It can be used by any development environment that supports such extensions.
            See <Link color='secondary' underline='hover' href='https://www.eclipse.org/community/eclipse_newsletter/2020/march/1.php'>this article</Link> for
            more information.
        </Paragraph>
        <Paragraph variant='body1'>
            This service is operated by the <Link color='secondary' href='https://www.eclipse.org/'>Eclipse Foundation</Link>.
        </Paragraph>
        <Paragraph variant='body1'>
            The source code of Open VSX is managed by
            the <Link color='secondary' underline='hover' href='https://projects.eclipse.org/projects/ecd.openvsx'>Eclipse Open VSX</Link> project
            and is licensed under
            the <Link color='secondary' underline='hover' href='https://www.eclipse.org/legal/epl-2.0/'>Eclipse Public License v2.0</Link>.
            The code is split in two repositories:
        </Paragraph>
        <RepositoryList>
            <li>
                <Link color='secondary' underline='hover' href='https://github.com/eclipse/openvsx'>eclipse/openvsx</Link> &ndash;
                main code with server, web UI and CLI. These components can be reused to deploy other registry instances
                (both public and private).
            </li>
            <li>
                <Link color='secondary' underline='hover' href='https://github.com/EclipseFdn/open-vsx.org'>EclipseFdn/open-vsx.org</Link> &ndash;
                additional code for this website.
            </li>
        </RepositoryList>

        <Heading variant='h5'>Publishing Extensions</Heading>
        <Paragraph variant='body1'>
            The publishing process is described in
            the <Link color='secondary' underline='hover' href='https://github.com/eclipse/openvsx/wiki/Publishing-Extensions#how-to-publish-an-extension'>openvsx Wiki</Link>.
        </Paragraph>
    </Container>;
}

export default About;
