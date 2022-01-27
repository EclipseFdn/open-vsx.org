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
import { Box } from '@material-ui/core';
import { SanitizedMarkdown } from 'openvsx-webui-staging/lib/components/sanitized-markdown';
import { DelayedLoadIndicator } from 'openvsx-webui-staging/lib/components/delayed-load-indicator';
import { MainContext } from 'openvsx-webui-staging/lib/context';

export class Document extends React.Component<Document.Props, Document.State> {

    static contextType = MainContext;
    declare context: MainContext;

    private _isMounted = false;

    constructor(props: Document.Props) {
        super(props);
        this.state = {
            loading: true
        };
    }

    async componentDidMount(): Promise<void> {
        this._isMounted = true;
        try {
            const content = await this.context.service.getStaticContent(this.props.url);
            if (!this._isMounted) {
                return;
            }
            this.setState({ content, loading: false });
        } catch (err) {
            this.context.handleError(err);
            this.setState({ loading: false });
        }
    }

    componentWillUnmount(): void {
        this._isMounted = false;
    }

    render(): React.ReactNode {
        return <Box p={5} display='flex' width='100%' justifyContent='center'>
            <DelayedLoadIndicator loading={this.state.loading} />
            <Box maxWidth='1040px'>
                {
                    this.state.content ?
                    <SanitizedMarkdown content={this.state.content} />
                    : null
                }
            </Box>
        </Box>;
    }
}

export namespace Document {
    export interface Props {
        url: string;
    }
    export interface State {
        content?: string;
        loading: boolean;
    }
}
