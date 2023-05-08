/*
 * @file-created: 2023-03-22
 * @copyright 2023 - 2023, OneXas
 * @author: Dennis Chen
 */ 

import { ErrorPage, ERROR_CODE_500 } from '@onexas/sphere/client/components/ErrorPage';
import { PATH_HOME } from '@onexas/sphere/client/config';
import { AppContext } from '@onexas/sphere/client/context';
import { ViewProps } from '@onexas/sphere/client/types';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import React from 'react';

export default class UiErrorView extends React.PureComponent<ViewProps & { error?: any }> {
    static contextType = AppContext;
    declare context: React.ContextType<typeof AppContext>;

    onBackHome = () => {
        const { workspaceStore } = this.props;
        const { config } = this.context;
        workspaceStore.redirect(config.get(PATH_HOME));
    };

    render() {
        const { error } = this.props;
        const {
            i18n,
            appTheme: { classes },
        } = this.context;
        return (
            <ErrorPage
                code={ERROR_CODE_500}
                title={i18n.l('msg.uiError')}
                description={i18n.l('msg.uiErrorHint')}
            >
                <Button color="primary" onClick={this.onBackHome}>
                    {i18n.l('backHome')}
                </Button>

                {error && (
                    <>
                        <Divider className={classes.fullWidth} />
                        {error.message && <h6>{error.message}</h6>}
                        {error.stack && <pre>{error.stack}</pre>}
                    </>
                )}
            </ErrorPage>
        );
    }
}
