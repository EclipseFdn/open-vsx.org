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
            This service is operated by the <Link color='secondary' href='https://www.eclipse.org/'>Eclipse Foundation </Link> 
            under the responsibility of the Open VSX Working Group. The Open VSX Working Group ensures the continued sustainability, 
            integrity, evolution and adoption of the Open VSX Registry. It provides governance, guidance, and funding for the 
            communities that support its implementation, deployment and maintenance. If you're interested in joining the working group, 
            please <Link color='secondary' underline='hover' href='https://www.eclipse.org/membership/join-us/'>let us know</Link>.
        </Paragraph>
        <Paragraph variant='body1'>
            For information on using the registry, publishing extensions, its API, implementation 
            and deployment details, see our <Link color='secondary' underline='hover' href='https://github.com/EclipseFdn/open-vsx.org/wiki'>wiki</Link>.
        </Paragraph>

        <Heading variant='h5'>Contact Us</Heading>
        <Paragraph variant='body1'>
            To report malicious extensions, extensions with known vulnerabilities, or other urgent matters, connect with us  
            at <Link color='secondary' underline='hover' href='mailto:openvsx@eclipse-foundation.org'>openvsx@eclipse-foundation.org</Link>.
            For non-urgent questions, including managing namespaces or publishing extensions, please visit 
            our <Link color='secondary' underline='hover' href='https://github.com/EclipseFdn/open-vsx.org/wiki'>wiki</Link>
        </Paragraph>
        <Paragraph variant='body1'>
        We use Slack for instant messaging and general communication, 
        use this <Link color='secondary' underline='hover' href='https://join.slack.com/t/openvsxworkinggroup/shared_invite/zt-2y07y1ggy-ct3IfJljjGI6xWUQ9llv6A'>link</Link> to join our Slack workspace.
        </Paragraph>

    </Container>;
}

export default About;
