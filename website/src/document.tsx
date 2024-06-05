/********************************************************************************
 * Copyright (c) 2020 TypeFox and others
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *
 * SPDX-License-Identifier: EPL-2.0
 ********************************************************************************/

import React, { FunctionComponent, useContext, useEffect, useState } from 'react';
import { Box } from '@mui/material';
import { SanitizedMarkdown } from 'openvsx-webui/lib/components/sanitized-markdown';
import { DelayedLoadIndicator } from 'openvsx-webui/lib/components/delayed-load-indicator';
import { MainContext } from 'openvsx-webui/lib/context';

export const Document: FunctionComponent<DocumentProps> = props => {
    const [content, setContent] = useState<string>();
    const [loading, setLoading] = useState<boolean>(true);
    const context = useContext(MainContext);

    useEffect(() => {
        const abortController = new AbortController();
        context.service.getStaticContent(abortController, props.url)
            .then(content => setContent(content))
            .catch(err => context.handleError(err))
            .finally(() => setLoading(false));

        return () => abortController.abort();
    }, [props.url]);

    return <Box p={5} display='flex' width='100%' justifyContent='center'>
        <DelayedLoadIndicator loading={loading} />
        <Box maxWidth='1040px'>
            {
                content ?
                <SanitizedMarkdown content={content} />
                : null
            }
        </Box>
    </Box>;
};

export interface DocumentProps {
    url: string;
}
