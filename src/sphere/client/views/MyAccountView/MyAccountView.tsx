/*
 * @file-created: 2023-03-22
 * @copyright 2023 - 2023, OneXas
 * @author: Dennis Chen
 */ 

import AppBar from '@mui/material/AppBar';
import Paper from '@mui/material/Paper';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import { NoPermissionPage, NotFoundPage } from '@onexas/sphere/client/components/ErrorPage';
import {
    MENU_LIST_SPHERE,
    PERMISSION_ACTION_ANY,
    PERMISSION_TARGET_COORDINATE_ORGANIZATION,
} from '@onexas/sphere/client/constants';
import { AppContext } from '@onexas/sphere/client/context';
import { buildPath, PATH_MY_ACCOUNT } from '@onexas/sphere/client/routes';
import { MyAccountStore } from '@onexas/sphere/client/stores';
import { ViewProps } from '@onexas/sphere/client/types';
import { disposeOnUnmount, observer } from 'mobx-react';
import React from 'react';
import Organizations from './Organizations';
import Password from './Password';
import Preferences from './Preferences';
import Profile from './Profile';

interface MyAccountViewProps extends ViewProps {
    myAccountStore: MyAccountStore;
}

@observer
class MyAccountView extends React.PureComponent<MyAccountViewProps> {
    static contextType = AppContext;
    declare context: React.ContextType<typeof AppContext>;

    componentDidMount() {
        const { workspaceStore, menuStore, myAccountStore } = this.props;
        const title = this.context.i18n.l('myAccount');
        workspaceStore.title = title;
        disposeOnUnmount(this, myAccountStore.registerObserver());
        disposeOnUnmount(
            this,
            menuStore.push(
                ...this.context.menuFactory.build(MENU_LIST_SPHERE, this.context.storeHolder)
            )
        );
    }
    componentDidUpdate() {
        //we allow to change lang in myaccount, so, update title for the case of lang change
        const title = this.context.i18n.l('myAccount');
        this.props.workspaceStore.title = title;
    }

    onSelectTab = (event: React.ChangeEvent<{}>, value: string) => {
        const { workspaceStore } = this.props;
        if (workspaceStore.urlSearchParams.get('tab') === value) {
            return;
        }
        workspaceStore.reroute(buildPath(PATH_MY_ACCOUNT, {}, 'tab=' + value), event);
    };

    render() {
        const { myAccountStore, workspaceStore } = this.props;
        const {
            i18n,
            appTheme: { classes },
        } = this.context;

        const orgGrant = workspaceStore.checkPermissionGrants([
            {
                target: PERMISSION_TARGET_COORDINATE_ORGANIZATION,
                actions: PERMISSION_ACTION_ANY,
            },
        ]);
        let selectedTab = workspaceStore.urlSearchParams.get('tab');
        selectedTab = selectedTab ? selectedTab : 'profile';

        switch (selectedTab) {
            case 'profile':
            case 'password':
            case 'prefs':
                break;
            case 'org':
                if (!orgGrant) {
                    selectedTab = '';
                }
                break;
            default:
                selectedTab = '';
        }
        return (
            <>
                <AppBar
                    position="static"
                    elevation={0}
                    color="default"
                    className={classes.appntabbar}
                >
                    <Tabs
                        className={classes.tabs}
                        onChange={this.onSelectTab}
                        indicatorColor="primary"
                        textColor="primary"
                        variant="scrollable"
                        scrollButtons="auto"
                        value={selectedTab ? selectedTab : false}
                    >
                        <Tab label={i18n.l('myAccount.profile')} value="profile" />
                        {orgGrant && <Tab label={i18n.l('organization')} value="org" />}
                        <Tab label={i18n.l('myAccount.preferences')} value="prefs" />
                        <Tab label={i18n.l('user.password')} value="password" />
                    </Tabs>
                </AppBar>
                <Paper elevation={0} className={classes.tabPanels}>
                    {(() => {
                        switch (selectedTab) {
                            case 'profile':
                                return (
                                    <Profile
                                        myAccountStore={myAccountStore}
                                        workspaceStore={workspaceStore}
                                    />
                                );
                            case 'password':
                                return (
                                    <Password
                                        myAccountStore={myAccountStore}
                                        workspaceStore={workspaceStore}
                                    />
                                );
                            case 'prefs':
                                return (
                                    <Preferences
                                        myAccountStore={myAccountStore}
                                        workspaceStore={workspaceStore}
                                    />
                                );
                            case 'org':
                                return orgGrant ? (
                                    <Organizations
                                        myAccountStore={myAccountStore}
                                        workspaceStore={workspaceStore}
                                    />
                                ) : (
                                    <NoPermissionPage i18n={i18n} />
                                );
                            default:
                                return <NotFoundPage i18n={i18n} />;
                        }
                    })()}
                </Paper>
            </>
        );
    }
}

export default MyAccountView;
