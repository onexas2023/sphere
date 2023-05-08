/*
 * @file-created: 2023-03-22
 * @copyright 2023 - 2023, OneXas
 * @author: Dennis Chen
 */ 

import { ErrorPage, ERROR_CODE_404 } from '@onexas/sphere/client/components/ErrorPage';
import { PATH_HOME } from '@onexas/sphere/client/config';
import { AppContext } from '@onexas/sphere/client/context';
import { ViewProps } from '@onexas/sphere/client/types';
import Button from '@mui/material/Button';
import React from 'react';

export default class NotFoundView extends React.PureComponent<ViewProps> {
    static contextType = AppContext;
    declare context: React.ContextType<typeof AppContext>;
    onBackHome = () => {
        const { workspaceStore } = this.props;
        const { config } = this.context;
        workspaceStore.redirect(config.get(PATH_HOME));
    };

    render() {
        const { i18n } = this.context;
        return (
            <ErrorPage
                code={ERROR_CODE_404}
                title={i18n.l('msg.pageNotFound')}
                description={i18n.l('msg.pageNotFoundHint')}
            >
                <Button color="primary" onClick={this.onBackHome}>
                    {i18n.l('backHome')}
                </Button>
            </ErrorPage>
        );
    }
}
