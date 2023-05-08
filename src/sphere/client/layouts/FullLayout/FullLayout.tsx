/*
 * @file-created: 2023-03-22
 * @copyright 2023 - 2023, OneXas
 * @author: Dennis Chen
 */ 

import { FlexContainer } from '@onexas/sphere/client/components/FlexContainer';
import ApplicationBar from '@onexas/sphere/client/layouts/components/ApplicationBar';
import Footer from '@onexas/sphere/client/layouts/components/Footer';
import SnackbarMessage from '@onexas/sphere/client/layouts/components/SnackbarMessage';
import {
    SecureLayout,
    SecureLayoutProps,
    SecureLayoutState,
} from '@onexas/sphere/client/layouts/SecureLayout';
import { observer } from 'mobx-react';
import React from 'react';

interface FullLayoutProps extends SecureLayoutProps {}

@observer
export default class FullLayout extends SecureLayout<FullLayoutProps, SecureLayoutState> {
    componentDidMount() {
        super.componentDidMount();
        const { breadcrumbStore } = this.props;

        //Uncaught Error: [mobx-react] disposeOnUnmount only supports direct subclasses of
        this.unregisters.push(breadcrumbStore.registerObserver());
    }

    onMenuSiderOpen = (open: boolean) => {
        this.props.menuStore.open = open;
    };

    renderPassed() {
        const { children, workspaceStore, menuStore } = this.props;
        const {
            appTheme: { classes },
        } = this.context;
        return (
            <div className={classes.layoutRoot}>
                <ApplicationBar workspaceStore={workspaceStore} menuStore={menuStore} />
                <SnackbarMessage workspaceStore={workspaceStore} />
                <FlexContainer
                    className={classes.layoutSkeleton}
                    maxWidth={false}
                    style={{ padding: 0 }}
                >
                    <div className={classes.layoutAppBarSpacer} />
                    <main className={classes.layoutFull}>{children}</main>
                    <Footer thin />
                </FlexContainer>
            </div>
        );
    }
}
