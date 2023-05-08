/*
 * @file-created: 2023-03-22
 * @copyright 2023 - 2023, OneXas
 * @author: Dennis Chen
 */ 

import { ErrorPage, ERROR_CODE_403 } from '@onexas/sphere/client/components/ErrorPage';
import FlexContainer, { FlexGrow } from '@onexas/sphere/client/components/FlexContainer';
import SkeletonContainer from '@onexas/sphere/client/components/SkeletonContainer';
import { PATH_HOME, PATH_LOGIN } from '@onexas/sphere/client/config';
import { PARAM_BACK_PATH } from '@onexas/sphere/client/constants';
import { AppContext } from '@onexas/sphere/client/context';
import ApplicationBar from '@onexas/sphere/client/layouts/components/ApplicationBar';
import Footer from '@onexas/sphere/client/layouts/components/Footer';
import SnackbarMessage from '@onexas/sphere/client/layouts/components/SnackbarMessage';
import { MenuStore } from '@onexas/sphere/client/stores';
import WorkspaceStore from '@onexas/sphere/client/stores/WorkspaceStore';
import { AuthMode, hasWindow, LayoutProps, Unregister } from '@onexas/sphere/client/types';
import { checkPermissionGrants } from '@onexas/sphere/client/utils/security';
import { Ally } from '@onexas/sphere/client/utils/ui';
import Button from '@mui/material/Button';
import React from 'react';
import clsx from 'clsx';

export interface SecureLayoutProps extends LayoutProps {
    workspaceStore: WorkspaceStore;
    menuStore: MenuStore;
}

export interface SecureLayoutState {
    phase?: Phase;
}

enum Phase {
    Init = 1,
    Authenticating = 2,
    NoPermission = 3,
    Passed = 4,
    Stopped = 5,
}

export default abstract class SecureLayout<
    P extends SecureLayoutProps,
    S extends SecureLayoutState
> extends React.Component<P, S> {
    static contextType = AppContext;
    declare context: React.ContextType<typeof AppContext>;
    protected unregisters: Unregister[] = [];

    protected ally: Ally<P, S>;

    constructor(props: P, context: any) {
        //to use context in constructor, we have to use legacy way
        super(props, context);
        const state: SecureLayoutState = {
            phase: Phase.Init,
        };
        const { workspaceStore, entry } = props;
        const { authMode = AuthMode.NotCare } = entry;
        const { config } = this.context;

        const autheable = workspaceStore.authenticatable;
        if (authMode === AuthMode.NotCare || (authMode === AuthMode.MustNot && !autheable)) {
            state.phase = Phase.Passed;
        } else if (authMode === AuthMode.Must && !autheable) {
            state.phase = Phase.Stopped;
            if (hasWindow) {
                workspaceStore.redirect(
                    config.get(PATH_LOGIN) +
                        '?' +
                        PARAM_BACK_PATH +
                        '=' +
                        encodeURIComponent(location.pathname + location.search)
                );
            }
        } else if (authMode === AuthMode.MustNot && autheable) {
            state.phase = Phase.Stopped;
            if (hasWindow) {
                workspaceStore.redirect(config.get(PATH_HOME));
            }
        }

        this.ally = new Ally(this, state as Readonly<S>).errorHandler(
            props.workspaceStore.errorHandler
        );
    }

    componentDidMount() {
        const { phase } = this.state;
        const { workspaceStore, entry } = this.props;

        //Uncaught Error: [mobx-react] disposeOnUnmount only supports direct subclasses of
        this.unregisters.push(workspaceStore.registerObserver());

        if (phase === Phase.Passed || phase === Phase.Stopped) {
            //a quick ignore
            return;
        }
        const { authMode = AuthMode.NotCare, grants } = entry;

        //otherwise, follow the stat processing
        if (authMode === AuthMode.NotCare || authMode === AuthMode.MustNot) {
            this.setState({
                phase: Phase.Passed,
            });
        } else if (workspaceStore.authentication) {
            this.setState({
                phase: checkPermissionGrants(grants, workspaceStore.authentication.permissions)
                    ? Phase.Passed
                    : Phase.NoPermission,
            });
        } else {
            this.setState({
                phase: Phase.Authenticating,
            });
            workspaceStore
                .authenticate()
                .then((res) => {
                    if (this.ally.live) {
                        this.setState({
                            ...this.state,
                            phase: checkPermissionGrants(
                                grants,
                                workspaceStore.authentication.permissions
                            )
                                ? Phase.Passed
                                : Phase.NoPermission,
                        });
                    }
                    return res;
                })
                .catch((err) => {
                    workspaceStore.logout(
                        hasWindow && encodeURIComponent(location.pathname + location.search)
                    );
                });
        }
    }

    componentWillUnmount() {
        if (this.unregisters) {
            this.unregisters.forEach((r) => {
                r();
            });
            this.unregisters = [];
        }
    }

    onBackHome = () => {
        const { workspaceStore } = this.props;
        const { config } = this.context;
        workspaceStore.redirect(config.get(PATH_HOME));
    };

    render() {
        const { workspaceStore, entry } = this.props;
        const { phase } = this.state;
        const { authMode = AuthMode.NotCare } = entry;
        if (
            phase === Phase.Passed &&
            authMode === AuthMode.Must &&
            !workspaceStore.authentication
        ) {
            return this.renderLostAuthentication();
        } else {
            switch (phase) {
                case Phase.Passed:
                    return this.renderPassed();
                case Phase.Authenticating:
                    return this.renderAuthenticating();
                case Phase.NoPermission:
                    return this.renderNoPermission();
                case Phase.Init:
                    return this.renderInit();
                default:
                    return null;
            }
        }
    }

    renderInit(): React.ReactNode {
        return null;
    }
    renderAuthenticating(): React.ReactNode {
        return <SkeletonContainer />;
    }
    renderNoPermission(): React.ReactNode {
        const {
            i18n,
            appTheme: { classes },
        } = this.context;
        const { workspaceStore, menuStore } = this.props;
        return (
            <div className={classes.layoutRoot}>
                <ApplicationBar
                    workspaceStore={workspaceStore}
                    menuStore={menuStore}
                    title={i18n.l('msg.noPermission')}
                />
                <SnackbarMessage workspaceStore={workspaceStore} />
                <FlexContainer maxWidth="lg" className={classes.layoutSkeleton}>
                    <main className={clsx(classes.layoutMain, classes.layoutBackground)}>
                        <div className={classes.pamaMb4} />
                        <ErrorPage
                            code={ERROR_CODE_403}
                            title={i18n.l('msg.noPermission')}
                            description={i18n.l('msg.noPermissionHint')}
                        >
                            <Button color="primary" onClick={this.onBackHome}>
                                {i18n.l('backHome')}
                            </Button>
                        </ErrorPage>
                    </main>
                    <FlexGrow />
                    <Footer />
                </FlexContainer>
            </div>
        );
    }
    renderLostAuthentication(): React.ReactNode {
        const { i18n } = this.context;
        return (
            <ErrorPage
                code={ERROR_CODE_403}
                title={i18n.l('msg.lostAuthentication')}
                description={i18n.l('msg.lostAuthenticationHint')}
            >
                <Button color="primary" onClick={this.onBackHome}>
                    {i18n.l('backHome')}
                </Button>
            </ErrorPage>
        );
    }

    abstract renderPassed(): React.ReactNode;
}
