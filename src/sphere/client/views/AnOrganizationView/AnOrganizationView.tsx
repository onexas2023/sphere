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
import SkeletonContainer from '@onexas/sphere/client/components/SkeletonContainer';
import SkeletonTabs from '@onexas/sphere/client/components/SkeletonTabs';
import { MENU_LIST_SPHERE } from '@onexas/sphere/client/constants';
import { AppContext } from '@onexas/sphere/client/context';
import { buildPath, PATH_AN_ORGANIZATION, PATH_MY_ACCOUNT } from '@onexas/sphere/client/routes';
import { AnOrganizationStore } from '@onexas/sphere/client/stores';
import { Breadcrumb } from '@onexas/sphere/client/stores/BreadcrumbStore';
import { DynamicLabel, ViewProps } from '@onexas/sphere/client/types';
import { Ally } from '@onexas/sphere/client/utils/ui';
import { disposeOnUnmount, observer } from 'mobx-react';
import React from 'react';
import { PromiseProcess } from '@onexas/sphere/client/utils/app';
import Members from './Members';
import Settings from './Settings';
import { typeOfObjectNotNull } from '@onexas/sphere/client/utils/object';

interface AnOrganizationViewProps extends ViewProps {
    anOrganizationStore: AnOrganizationStore;
    organizationCode: string;
}

@observer
class AnOrganizationView extends React.PureComponent<AnOrganizationViewProps> {
    static contextType = AppContext;
    declare context: React.ContextType<typeof AppContext>;
    private ally: Ally<AnOrganizationViewProps>;

    constructor(props: AnOrganizationViewProps) {
        super(props);
        this.ally = new Ally(this).errorHandler(props.workspaceStore.errorHandler);
    }

    componentDidMount() {
        const {
            breadcrumbStore,
            anOrganizationStore,
            workspaceStore,
            menuStore,
        } = this.props;
        const title: DynamicLabel = (storeHolder, i18n) => {
            const {
                anOrganizationStore: { organization },
            } = this.props;
            let name = typeOfObjectNotNull(organization) && organization.name;
            return name
                ? i18n.l('organization.title', {
                      name,
                  })
                : 'organization';
        };
        const crumbTitle: DynamicLabel = (storeHolder, i18n) => {
            const {
                anOrganizationStore: { organization },
            } = this.props;
            let name = typeOfObjectNotNull(organization) && organization.name;
            return name || '';
        };

        workspaceStore.title = title;
        disposeOnUnmount(
            this,
            breadcrumbStore.push(
                new Breadcrumb('myAccount', buildPath(PATH_MY_ACCOUNT)),
                new Breadcrumb('organization', buildPath(PATH_MY_ACCOUNT, {}, 'tab=org')),
                new Breadcrumb(crumbTitle)
            )
        );
        disposeOnUnmount(this, anOrganizationStore.registerObserver());
        disposeOnUnmount(
            this,
            menuStore.push(
                ...this.context.menuFactory.build(MENU_LIST_SPHERE, this.context.storeHolder)
            )
        );
        this.initFetch();
    }
    componentDidUpdate() {
        this.initFetch();
    }

    private initFetch() {
        const { ally } = this;
        ally.initFetch(() => {
            const processes: PromiseProcess<any>[] = [];

            const { anOrganizationStore, organizationCode } = this.props;

            if (anOrganizationStore.code !== organizationCode) {
                anOrganizationStore.code = organizationCode;
                processes.push(() => anOrganizationStore.fetchOrganization());
            }

            return processes;
        });
    }

    onSelectTab = (event: React.ChangeEvent<{}>, value: string) => {
        const { workspaceStore, organizationCode } = this.props;
        if (workspaceStore.urlSearchParams.get('tab') === value) {
            return;
        }
        workspaceStore.reroute(
            buildPath(PATH_AN_ORGANIZATION, { organizationCode }, 'tab=' + value),
            event
        );
    };

    render() {
        const { anOrganizationStore, workspaceStore } = this.props;
        const {
            appTheme: { classes },
            i18n,
        } = this.context;

        const { organization } = anOrganizationStore;

        if (organization === 403) {
            return <NoPermissionPage i18n={i18n} />;
        } else if (organization === 404) {
            return <NotFoundPage i18n={i18n} />;
        } else if (!organization) {
            return (
                <>
                    <SkeletonTabs />
                    <SkeletonContainer />
                </>
            );
        }

        //currently no permission specificied
        const membersGrant = true;

        let selectedTab = workspaceStore.urlSearchParams.get('tab');
        selectedTab = selectedTab ? selectedTab : 'settings';

        switch (selectedTab) {
            case 'settings':
                break;
            case 'members':
                if (!membersGrant) {
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
                        <Tab label={i18n.l('settings')} value="settings" />
                        {membersGrant && (
                            <Tab label={i18n.l('organization.members')} value="members" />
                        )}
                    </Tabs>
                </AppBar>
                <Paper elevation={0} className={classes.tabPanels}>
                    {(() => {
                        switch (selectedTab) {
                            case 'settings':
                                return (
                                    <Settings
                                        anOrganizationStore={anOrganizationStore}
                                        workspaceStore={workspaceStore}
                                    />
                                );
                            case 'members':
                                return membersGrant ? (
                                    <Members
                                        anOrganizationStore={anOrganizationStore}
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

export default AnOrganizationView;
