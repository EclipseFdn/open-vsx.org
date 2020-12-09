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
import { Link, Typography, Container, useTheme, makeStyles } from '@material-ui/core';

const About = () => {
    const theme = useTheme();
    const body1 = theme.typography.body1;
    const classes = makeStyles({
        heading: {
            marginTop: theme.spacing(4)
        },
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
        <Typography variant='h4' className={classes.heading}>About This Service</Typography>
        <Typography variant='body1' className={classes.paragraph}>
            Open VSX is an open-source registry for VS Code extensions.
            It can be used by any development environment that supports such extensions.
            See <Link color='secondary' href='https://www.eclipse.org/community/eclipse_newsletter/2020/march/1.php'>this article</Link> for
            more information.
        </Typography>
        <Typography variant='body1' className={classes.paragraph}>
            This service is operated by the <Link color='secondary' href='https://www.eclipse.org/'>Eclipse Foundation</Link>.
        </Typography>
        <Typography variant='body1' className={classes.paragraph}>
            The source code of Open VSX is managed by
            the <Link color='secondary' href='https://projects.eclipse.org/projects/ecd.openvsx'>Eclipse Open VSX</Link> project
            and is licensed under
            the <Link color='secondary' href='https://www.eclipse.org/legal/epl-2.0/'>Eclipse Public License v2.0</Link>.
            The code is split in two repositories:
        </Typography>
        <ul className={classes.adaptFont}>
            <li>
                <Link color='secondary' href='https://github.com/eclipse/openvsx'>eclipse/openvsx</Link> &ndash;
                main code with server, web UI and CLI. These components can be reused to deploy other registry instances
                (both public and private).
            </li>
            <li>
                <Link color='secondary' href='https://github.com/EclipseFdn/open-vsx.org'>EclipseFdn/open-vsx.org</Link> &ndash;
                additional code for this website.
            </li>
        </ul>

        <Typography variant='h5' className={classes.heading}>Publishing Extensions</Typography>
        <Typography variant='body1' className={classes.paragraph}>
            The publishing process is described in
            the <Link color='secondary' href='https://github.com/eclipse/openvsx/wiki/Publishing-Extensions#how-to-publish-an-extension'>openvsx Wiki</Link>.
        </Typography>
    </Container>;
}

export default About;
