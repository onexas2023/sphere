/*
 * @file-created: 2023-03-22
 * @copyright 2023 - 2023, OneXas
 * @author: Dennis Chen
 */ 

import SnackbarMessage from '@onexas/sphere/client/layouts/components/SnackbarMessage';
import {
    SecureLayout,
    SecureLayoutProps,
    SecureLayoutState,
} from '@onexas/sphere/client/layouts/SecureLayout';
import { observer } from 'mobx-react';
import React from 'react';

@observer
class EmptyLayout extends SecureLayout<SecureLayoutProps, SecureLayoutState> {
    renderPassed() {
        const { workspaceStore } = this.props;
        const {
            appTheme: { classes },
        } = this.context;
        return (
            <div className={classes.layoutRoot}>
                <main className={classes.layoutMain}>
                    <SnackbarMessage workspaceStore={workspaceStore} />
                    {this.props.children}
                </main>
            </div>
        );
    }
}

export default EmptyLayout;
