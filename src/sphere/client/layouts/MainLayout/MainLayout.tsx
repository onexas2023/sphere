/*
 * @file-created: 2023-03-22
 * @copyright 2023 - 2023, OneXas
 * @author: Dennis Chen
 */ 

import { FlexContainer, FlexGrow } from '@onexas/sphere/client/components/FlexContainer';
import ApplicationBar from '@onexas/sphere/client/layouts/components/ApplicationBar';
import Breadcrumb from '@onexas/sphere/client/layouts/components/Breadcrumb';
import Footer from '@onexas/sphere/client/layouts/components/Footer';
import MenuSider from '@onexas/sphere/client/layouts/components/MenuSider';
import SnackbarMessage from '@onexas/sphere/client/layouts/components/SnackbarMessage';
import {
    SecureLayout,
    SecureLayoutProps,
    SecureLayoutState,
} from '@onexas/sphere/client/layouts/SecureLayout';
import { BreadcrumbStore, MenuStore } from '@onexas/sphere/client/stores';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import { observer } from 'mobx-react';
import React from 'react';

interface MainLayoutProps extends SecureLayoutProps {
    breadcrumbStore: BreadcrumbStore;
    menuStore: MenuStore;
}

@observer
export default class MainLayout extends SecureLayout<MainLayoutProps, SecureLayoutState> {
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
        const {
            children,
            workspaceStore,
            breadcrumbStore,
            breadcrumbStore: { crumbs },
            menuStore,
        } = this.props;
        const {
            appTheme: { classes },
        } = this.context;
        return (
            <div className={classes.layoutRoot}>
                <ApplicationBar workspaceStore={workspaceStore} menuStore={menuStore} />
                <SnackbarMessage workspaceStore={workspaceStore} />
                <MenuSider
                    workspaceStore={workspaceStore}
                    menuStore={menuStore}
                    breadcrumbStore={breadcrumbStore}
                />
                <div className={classes.layoutSkeleton}>
                    <FlexContainer maxWidth="lg">
                        <div className={classes.layoutAppBarSpacer} />
                        {crumbs && crumbs.length > 0 && (
                            <Breadcrumbs className={classes.layoutBreadcurmbs}>
                                {crumbs.map((c, i) => {
                                    return (
                                        <Breadcrumb
                                            key={i}
                                            breadcrumb={c}
                                            workspaceStore={workspaceStore}
                                        />
                                    );
                                })}
                            </Breadcrumbs>
                        )}
                        <main className={classes.layoutMain}>{children}</main>
                    </FlexContainer>
                    <FlexGrow />
                    <Footer />
                </div>
            </div>
        );
    }
}
