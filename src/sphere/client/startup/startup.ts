/*
 * @file-created: 2023-03-22
 * @copyright 2023 - 2023, OneXas
 * @author: Dennis Chen
 */ 

import { LoadingModule } from '@onexas/sphere/client/components/Loading';
import { setGlobalDefault as setGlobalDefaultConfig } from '@onexas/sphere/client/config';
import { defaultConfig } from '@onexas/sphere/client/config/config';
import {
    MENU_GROUP_MAIN,
    MENU_LIST_SPHERE,
    PERMISSION_ACTION_ANY,
    PERMISSION_TARGET_COORDINATE_ORGANIZATION,
} from '@onexas/sphere/client/constants';
import { I18nLoaderRegister, I18nRegister } from '@onexas/sphere/client/i18n';
import EmptyLayout from '@onexas/sphere/client/layouts/EmptyLayout';
import MainLayout from '@onexas/sphere/client/layouts/MainLayout';
import FullLayout from '@onexas/sphere/client/layouts/FullLayout';
import { MenuGroup, MenuRegister } from '@onexas/sphere/client/menus/menus';
import { RouteRegister } from '@onexas/sphere/client/routes';
import {
    PATH_AN_ORGANIZATION,
    PATH_LOGIN,
    PATH_MY_ACCOUNT,
} from '@onexas/sphere/client/routes/paths';
import {
    AnOrganizationStore,
    BreadcrumbStore,
    LoginStore,
    MenuStore,
    MyAccountStore,
    StoreCreateContext,
    StoreRegister,
    WorkspaceStore,
} from '@onexas/sphere/client/stores';
import { VERSION } from '@onexas/sphere/client/ver';
import { AuthMode, Config } from '@onexas/sphere/client/types';
import { getLogger } from '@onexas/sphere/client/utils/logger';
import Loadable from '@onexas/react-loadable';
import { configure as mobxConfigure } from 'mobx';

/**
 * The MobX default configuration has become more strict. We recommend to adopt the new defaults after completing the upgrade,
 * check out the Configuration section. During migration, we recommend to configure MobX in the same way as it would be in v4/v5 out of the box:
 * import {configure} from "mobx"; configure({ enforceActions: "never" });. After finishing the entire migration process and validating that your
 * project works as expected, consider enabling the flags computedRequiresReaction, reactionRequiresObservable and observableRequiresReaction and enforceActions: "observed"
 * to write more idiomatic MobX code.
 */
/**
 * we need this (strict off mode) to shorter our code for too many @computed , property geter/seter and @action every where
 */
mobxConfigure({ enforceActions: 'never' });

const logger = getLogger('startup');

// const LayoutDemoView = Loadable({
//     loader: () =>
//         import(
//             /* webpackChunkName: "loadable-demo" */ '@onexas/sphere/client/views/LayoutDemoView'
//         ),
//     loading: LoadingModule,
//     modules: ['@onexas/sphere/client/views/LayoutDemoView'],
// });

const LoginView = Loadable({
    loader: () =>
        import(
            /* webpackChunkName: "loadable-login" */ '@onexas/sphere/client/views/LoginView'
        ),
    loading: LoadingModule,
    modules: ['@onexas/sphere/client/views/LoginView'],
});

const MyAccountView = Loadable({
    loader: () =>
        import(
            /* webpackChunkName: "loadable-myaccount" */ '@onexas/sphere/client/views/MyAccountView'
        ),
    loading: LoadingModule,
    modules: ['@onexas/sphere/client/views/MyAccountView'],
});

const AnOrganizationView = Loadable({
    loader: () =>
        import(
            /* webpackChunkName: "loadable-organization" */ '@onexas/sphere/client/views/AnOrganizationView'
        ),
    loading: LoadingModule,
    modules: ['@onexas/sphere/client/views/AnOrganizationView'],
});

const enLoader = {
    loader: () =>
        import(/* webpackChunkName: "loadable-i18n-en" */ '@onexas/sphere/client/i18n/en'),
    modules: ['@onexas/sphere/client/i18n/en'],
};
const zhTWLoader = {
    loader: () =>
        import(
            /* webpackChunkName: "loadable-i18n-zh-TW" */ '@onexas/sphere/client/i18n/zh-TW'
        ),
    modules: ['@onexas/sphere/client/i18n/zh-TW'],
};

export type StartupContext = {
    i18nRegister: I18nRegister;
    i18nLoaderRegister: I18nLoaderRegister;
    storeRegister: StoreRegister;
    routeRegister: RouteRegister;
    menuRegister: MenuRegister;
    config: Config;
};

export function newStartupContext(config: Config): StartupContext {
    const i18nRegister = new I18nRegister();
    const i18nLoaderRegister = new I18nLoaderRegister();
    const storeRegister = new StoreRegister();
    const routeRegister = new RouteRegister();
    const menuRegister = new MenuRegister();
    return {
        i18nRegister,
        i18nLoaderRegister,
        storeRegister,
        routeRegister,
        menuRegister,
        config,
    };
}

export interface StartupContextContributor {
    (startupContext: StartupContext): StartupContext;
}

export type StartupOption = {
    configures?: Configure[];
    startups?: Startup[];
    contextContributors?: StartupContextContributor[];
};

export interface Startup {
    (context: StartupContext): void;
}

export interface Configure {
    (): void;
}

export const configure: Configure = function (){
    setGlobalDefaultConfig(defaultConfig);
}

export const startup: Startup = function (context: StartupContext) {
    logger.debug('sphere client startup script starting up...');

    const { i18nLoaderRegister, storeRegister, routeRegister, menuRegister } = context;

    i18nLoaderRegister.register('en', enLoader);
    i18nLoaderRegister.register('zh-TW', zhTWLoader);

    storeRegister.register({
        name: WorkspaceStore.NAME,
        create: (ctx: StoreCreateContext) => {
            return new WorkspaceStore(ctx);
        },
    });
    storeRegister.register({
        name: BreadcrumbStore.NAME,
        create: (ctx: StoreCreateContext) => {
            return new BreadcrumbStore(ctx);
        },
    });
    storeRegister.register({
        name: MenuStore.NAME,
        create: (ctx: StoreCreateContext) => {
            return new MenuStore(ctx);
        },
    });
    storeRegister.register({
        name: LoginStore.NAME,
        create: (ctx: StoreCreateContext) => {
            return new LoginStore(ctx);
        },
    });
    storeRegister.register({
        name: MyAccountStore.NAME,
        create: (ctx: StoreCreateContext) => {
            return new MyAccountStore(ctx);
        },
    });
    storeRegister.register({
        name: AnOrganizationStore.NAME,
        create: (ctx: StoreCreateContext) => {
            return new AnOrganizationStore(ctx);
        },
    });

    //layout-demo
    // routeRegister.register({
    //     path: '/layout-demo-empty',
    //     exact: true,
    //     view: LayoutDemoView,
    //     layout: EmptyLayout,
    //     authMode: AuthMode.NotCare,
    //     storeNames: [],
    // });
    // routeRegister.register({
    //     path: '/layout-demo-main',
    //     exact: true,
    //     view: LayoutDemoView,
    //     layout: MainLayout,
    //     authMode: AuthMode.NotCare,
    //     storeNames: [],
    // });
    // routeRegister.register({
    //     path: '/layout-demo-full',
    //     exact: true,
    //     view: LayoutDemoView,
    //     layout: FullLayout,
    //     authMode: AuthMode.NotCare,
    //     storeNames: [],
    // });

    routeRegister.register({
        path: PATH_LOGIN,
        exact: true,
        view: LoginView,
        layout: EmptyLayout,
        authMode: AuthMode.MustNot,
        storeNames: [LoginStore.NAME],
    });
    routeRegister.register({
        path: PATH_MY_ACCOUNT,
        exact: true,
        view: MyAccountView,
        layout: MainLayout,
        authMode: AuthMode.Must,
        storeNames: [MyAccountStore.NAME],
    });
    routeRegister.register({
        path: PATH_AN_ORGANIZATION,
        exact: true,
        view: AnOrganizationView,
        layout: MainLayout,
        authMode: AuthMode.Must,
        storeNames: [AnOrganizationStore.NAME],
        grants: [
            {
                target: PERMISSION_TARGET_COORDINATE_ORGANIZATION,
                actions: [PERMISSION_ACTION_ANY],
            },
        ],
    });

    menuRegister.register(MENU_LIST_SPHERE, (holder) => {
        const group = new MenuGroup(MENU_GROUP_MAIN);
        // group.push(new Menu(null, 'myAccount', buildPath(PATH_MY_ACCOUNT), faUserCog));

        return [group];
    });

    logger.info(`Sphere loaded, version ${VERSION}`);
};
