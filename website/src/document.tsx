/********************************************************************************
 * Copyright (c) 2020 TypeFox and others
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *
 * SPDX-License-Identifier: EPL-2.0
 ********************************************************************************/

import { FunctionComponent, useContext, useEffect, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import { SanitizedMarkdown } from 'openvsx-webui/lib/components/sanitized-markdown';
import { DelayedLoadIndicator } from 'openvsx-webui/lib/components/delayed-load-indicator';
import { MainContext } from 'openvsx-webui/lib/context';

export const Document: FunctionComponent<DocumentProps> = (props) => {
  const abortController = useRef<AbortController>(new AbortController());
  const [content, setContent] = useState<string>();
  const [loading, setLoading] = useState<boolean>(true);
  const context = useContext(MainContext);

  const loadDocument = async () => {
    try {
      setLoading(true);
      const data = await context.service.getStaticContent(abortController.current, props.url);
      setContent(data);
    } catch (err: any) {
      context.handleError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocument();
    return () => abortController.current.abort();
  }, [props.url]);

  return (
    <Box p={5} display='flex' width='100%' justifyContent='center'>
      <DelayedLoadIndicator loading={loading} />
      <Box maxWidth='1040px'>{content ? <SanitizedMarkdown content={content} /> : null}</Box>
    </Box>
  );
};

export interface DocumentProps {
  url: string;
}
