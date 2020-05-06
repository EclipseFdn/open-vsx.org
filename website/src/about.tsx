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
import { Link, Box, Typography, Container, useTheme, makeStyles } from '@material-ui/core';

const About = () => {
    const theme = useTheme();
    const body1 = theme.typography.body1;
    const classes = makeStyles({
        paragraph: {
            marginTop: theme.spacing(2)
        },
        adaptFont: {
            fontSize: body1.fontSize,
            fontFamily: body1.fontFamily,
            fontWeight: body1.fontWeight,
            lineHeight: body1.lineHeight
        }
    })();
    return <Container maxWidth='md'>
        <Box mt={4}>
            <Typography variant='h4'>About This Service</Typography>
            <Typography variant='body1' className={classes.paragraph}>
                Open VSX is an open-source registry for VS Code extensions.
                It can be used by any development environment that supports such extensions.
                See <Link color='secondary' href='https://www.eclipse.org/community/eclipse_newsletter/2020/march/1.php'>this article</Link> for
                more information.
            </Typography>
            <Typography variant='body1' className={classes.paragraph}>
                This website is currently operated by <Link color='secondary' href='https://www.typefox.io/'>TypeFox</Link>,
                but it will soon be transferred to the <Link color='secondary' href='https://www.eclipse.org/'>Eclipse Foundation</Link>.
            </Typography>
            <Typography variant='body1' className={classes.paragraph}>
                The source code of this website is managed by
                the <Link color='secondary' href='https://projects.eclipse.org/projects/ecd.openvsx'>Eclipse Open VSX</Link> project
                and is licensed under
                the <Link color='secondary' href='https://www.eclipse.org/legal/epl-2.0/'>Eclipse Public License v2.0</Link>.
                The code split in two repositories:
            </Typography>
            <ul className={classes.adaptFont}>
                <li>
                    <Link color='secondary' href='https://github.com/eclipse/openvsx'>eclipse/openvsx</Link> &ndash;
                    main code with server, web UI and CLI. These components can be reused to deploy other registry instances
                    (both public and private).
                </li>
                <li>
                    <Link color='secondary' href='https://github.com/eclipse/open-vsx.org'>eclipse/open-vsx.org</Link> &ndash;
                    additional code for this website.
                </li>
            </ul>
        </Box>
    </Container>;
}

export default About;
