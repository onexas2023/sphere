/*
 * @file-created: 2023-03-22
 * @copyright 2023 - 2023, OneXas
 * @author: Dennis Chen
 */

import Loadable from '@onexas/react-loadable';
import { createTheme, Theme } from '@mui/material/styles';
import withStyles from '@mui/styles/withStyles';
import { LoadingLanguage } from '@onexas/sphere/client/components/Loading';
import {
    DEFAULT_LOCALE,
    DEFAULT_THEME,
    PATH_HOME,
    SITE_NAME,
} from '@onexas/sphere/client/config';
import {
    COOKIE_NAME_LOCALE,
    COOKIE_NAME_THEME,
    WITH_STYLE_APP_IDX,
} from '@onexas/sphere/client/constants';
import { AppContextProvider } from '@onexas/sphere/client/context';
import { I18nLoaderRegister, I18nRegister } from '@onexas/sphere/client/i18n';
import { MenuRegister } from '@onexas/sphere/client/menus/menus';
import { RouteRegister } from '@onexas/sphere/client/routes/register';
import { BreadcrumbStore, MenuStore, WorkspaceStore } from '@onexas/sphere/client/stores';
import { StoreRegister } from '@onexas/sphere/client/stores/register';
import { CssClasses, makeStyles } from '@onexas/sphere/client/styles';
import { getThemeOptions, suggestThemeName } from '@onexas/sphere/client/themes';
import {
    AppTheme,
    Config,
    Cookies,
    Depot,
    hasWindow,
    I18n,
    StoreHolder,
} from '@onexas/sphere/client/types';
import { moment } from '@onexas/sphere/client/utils/datetime';
import { getLogger } from '@onexas/sphere/client/utils/logger';
import { typeOfFunction } from '@onexas/sphere/client/utils/object';
import NotFoundView from '@onexas/sphere/client/views/NotFoundView';
import UiErrorView from '@onexas/sphere/client/views/UiErrorView';
import CssBaseline from '@mui/material/CssBaseline';
import Fade from '@mui/material/Fade';
import { ThemeProvider, StyledEngineProvider } from '@mui/material/styles';
import clsx from 'clsx';
import { Action as HistoryAction, History, Location as HistoryLocation } from 'history';
import { autorun } from 'mobx';
import { disposeOnUnmount } from 'mobx-react';
import React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';


const logger = getLogger('route');

interface SwitchRouteProps {
    config: Config;
    routeRegister: RouteRegister;
    storeRegister: StoreRegister;
    i18nRegister: I18nRegister;
    menuRegister: MenuRegister;
    cookies: Cookies;
    localDepot: Depot;
    sessionDepot: Depot;
    history: History;
}
interface LoadedSwitchRouteProps {
    changeLocale: (locale: string) => void;
    changeTheme: (themeName: string) => void;
    config: Config;
    routeRegister: RouteRegister;
    storeHolder: StoreHolder;
    i18nRegister: I18nRegister;
    menuRegister: MenuRegister;
    cookies: Cookies;
    localDepot: Depot;
    sessionDepot: Depot;
    locale: string;
    themeName: string;
    history: History;
}

const i18nLoadableMap: Map<string, React.ElementType<LoadedSwitchRouteProps>> = new Map();

export function initI18nLoadable(i18nLoaderRegister: I18nLoaderRegister) {
    i18nLoaderRegister.loadersMap.forEach((ls, locale) => {
        const loaders: { [x: string]: () => Promise<any> } = {};
        const modules: string[] = [];
        ls.forEach((l, i) => {
            loaders[i] = function () {
                return new Promise<any>((resolve, reject) => {
                    l.loader()
                        .then((loaded) => {
                            resolve(loaded);
                        })
                        .catch((err) => {
                            reject(err);
                        });
                });
            };
            modules.push(...l.modules);
        });

        const loadable: React.ElementType<LoadedSwitchRouteProps> = Loadable.Map({
            loader: loaders,
            render: i18nLoadedSwitchRouteRender(locale),
            modules: modules,
            loading: LoadingLanguage,
        });
        logger.debug('Init locale loadable', locale);
        i18nLoadableMap.set(locale, loadable);
    });
}

function i18nLoadedSwitchRouteRender(
    locale: string
): (loaded: any, props: LoadedSwitchRouteProps) => React.ReactElement {
    return (loaded: any, props: LoadedSwitchRouteProps) => {
        const { config, i18nRegister } = props;
        let i = 0;
        while (loaded[i]) {
            const translation: any = loaded[i].default;
            i18nRegister.register(locale, translation);
            i++;
        }
        logger.debug('Loaded locale loadable', locale, i);

        //load default locale if it is not
        const defaultLocale: string = config.get(DEFAULT_LOCALE);
        let R: React.ElementType<LoadedSwitchRouteProps> = LoadedSwitchRoute;
        if (locale !== defaultLocale && !i18nRegister.has(defaultLocale)) {
            R = i18nLoadableMap.get(defaultLocale) || R;
        }
        return <R {...props} />;
    };
}

interface SwitchRouteState {
    locale: string;
    themeName: string;
}

type LocationData = {
    pathname: string;
    search: string;
};

export default class SwitchRoute extends React.PureComponent<SwitchRouteProps, SwitchRouteState> {
    defaultLocale: string;
    defaultThemeName: string;
    storeHolder: StoreHolder;
    locationData: LocationData;
    historyUnregister: () => void;

    constructor(props: SwitchRouteProps) {
        super(props);
        this.defaultLocale = props.config.get(DEFAULT_LOCALE);
        this.defaultThemeName = props.config.get(DEFAULT_THEME);
        const locale: string = props.cookies.get(COOKIE_NAME_LOCALE, this.defaultLocale);
        const themeName: string = props.cookies.get(COOKIE_NAME_THEME, this.defaultThemeName);

        this.storeHolder = props.storeRegister.create({
            config: props.config,
            cookies: props.cookies,
            history: props.history,
            localDepot: props.localDepot,
            sessionDepot: props.sessionDepot,
        });
        this.state = {
            locale,
            themeName,
        };
        this.locationData = {
            pathname: props.history.location.pathname,
            search: props.history.location.search,
        };
    }

    changeLocale = (locale: string) => {
        this.props.cookies.set(COOKIE_NAME_LOCALE, locale, {
            expires: moment().add(1, 'y').toDate(),
        });
        this.setState({ ...this.state, locale });
    };
    changeTheme = (themeName: string) => {
        this.props.cookies.set(COOKIE_NAME_THEME, themeName, {
            expires: moment().add(1, 'y').toDate(),
        });
        this.setState({ ...this.state, themeName });
    };

    onHistoryChange = (location: HistoryLocation, action: HistoryAction) => {
        const { locationData, storeHolder } = this;
        if (
            locationData.pathname !== location.pathname ||
            locationData.search !== location.search
        ) {
            storeHolder.get(WorkspaceStore).hintReroute();
            storeHolder.get(MenuStore).animate = false;
            this.locationData = {
                pathname: location.pathname,
                search: location.search,
            };
        }
    };

    componentDidMount() {
        this.historyUnregister = this.props.history.listen(this.onHistoryChange);
    }
    componentWillUnmount() {
        if (this.historyUnregister) {
            this.historyUnregister();
            this.historyUnregister = null;
        }
    }

    render() {
        const {
            storeHolder,
            state: { locale, themeName },
            props: {
                config,
                cookies,
                localDepot,
                sessionDepot,
                i18nRegister,
                routeRegister,
                menuRegister,
                history,
            },
        } = this;

        let R = i18nRegister.has(locale) ? null : i18nLoadableMap.get(locale);

        if (!R) {
            R = i18nRegister.has(locale) ? null : i18nLoadableMap.get(this.defaultLocale);
        }
        if (!R) {
            R = LoadedSwitchRoute;
        }
        const changeLocale = this.changeLocale;
        const changeTheme = this.changeTheme;
        const props: LoadedSwitchRouteProps = {
            config,
            i18nRegister,
            routeRegister,
            cookies,
            localDepot,
            sessionDepot,
            storeHolder,
            menuRegister,
            changeLocale,
            changeTheme,
            locale,
            themeName,
            history,
        };

        return <R {...props} />;
    }
}

class LoadedSwitchRoute extends React.PureComponent<LoadedSwitchRouteProps> {
    render() {
        let themeName = suggestThemeName(this.props.themeName);

        const themeOptions = getThemeOptions(themeName);
        const theme = createTheme(themeOptions);
        logger.debug('Use theme', themeName, themeOptions);
        return (
            <StyledEngineProvider injectFirst>
                <ThemeProvider theme={theme}>
                    <CssBaseline />
                    <CssClassesSwitch {...this.props} />
                </ThemeProvider>
            </StyledEngineProvider>
        );
    }
}

//forward ref for fade
const FirstRender = React.forwardRef((props: any, ref: any) => {
    const { children, ...rest } = props;
    return <div ref={ref} {...rest}>{children}</div>;
});

interface CssClassesSwitchProps extends LoadedSwitchRouteProps {
    classes?: CssClasses;
    theme?: Theme;
}

class CssClassesSwitchInner extends React.PureComponent<CssClassesSwitchProps> {
    latestI18n: I18n;
    everRendered: boolean;
    componentDidMount() {
        const siteName = this.props.config.get(SITE_NAME, 'OneXas');
        if (hasWindow) {
            disposeOnUnmount(
                this,
                autorun(() => {
                    let { title: workspaceTitle } = this.props.storeHolder.get(WorkspaceStore);
                    let title: string;
                    if (typeOfFunction(workspaceTitle)) {
                        title = workspaceTitle(this.props.storeHolder, this.latestI18n);
                    } else {
                        title = workspaceTitle as string;
                    }
                    title = this.latestI18n.l(title);
                    document.title = title ? title + ' | ' + siteName : siteName;
                })
            );
        }
    }
    render() {
        const {
            config,
            i18nRegister,
            routeRegister,
            menuRegister,
            cookies,
            storeHolder,
            changeLocale,
            changeTheme,
            locale,
            themeName,
            theme,
            classes,
        } = this.props;

        const i18n = (this.latestI18n = i18nRegister.create(config, cookies, locale, changeLocale));
        const appTheme: AppTheme = {
            themeName,
            theme,
            classes,
            changeTheme,
        };
        const routes: React.ReactNode[] = [];
        let i = 0;
        let rootMatched = false;
        const essentialStoreNames = [WorkspaceStore.NAME, BreadcrumbStore.NAME, MenuStore.NAME];
        const essentailStores = storeHolder.asProps(...essentialStoreNames);
        routeRegister.getEntries().forEach((entry) => {
            const { path, exact, strict, layout: Layout, view: View, storeNames } = entry;
            rootMatched = path === '/';
            routes.push(
                <Route
                    key={i++}
                    path={path}
                    exact={exact}
                    strict={strict}
                    render={(props) => {
                        const viewStores: any = storeHolder.asProps(
                            ...[...essentialStoreNames, ...(storeNames ? storeNames : [])]
                        );
                        const params = props.match ? props.match.params : {};

                        if (hasWindow && !config.production) {
                            let dev = {
                                config: config,
                                viewStores: viewStores,
                                i18n: i18n,
                                appTheme: appTheme,
                            } as any;

                            (window as any).__sphere = dev;
                        }

                        let component = (
                            <View entry={entry} {...props} {...params} {...viewStores} />
                        );
                        if (Layout) {
                            component = (
                                <Layout entry={entry} {...essentailStores}>
                                    {component}
                                </Layout>
                            );
                        }
                        if (!this.everRendered) {
                            this.everRendered = true;
                            //use fade effect for render first (to avoid some un-consitent animation blanking effect)
                            return (
                                <Fade in timeout={500}>
                                    <FirstRender>{component}</FirstRender>
                                </Fade>
                            );
                        }
                        return component;
                    }}
                />
            );
        });
        if (!rootMatched) {
            routes.push(<Redirect key={i++} path="/" exact={true} to={config.get(PATH_HOME)} />);
        }
        routes.push(
            <Route
                key={i++}
                render={() => (
                    <div className={classes.layoutRoot}>
                        <main className={clsx(classes.layoutMain, classes.layoutBackground)}>
                            <NotFoundView {...storeHolder.asProps(WorkspaceStore.NAME)} />
                        </main>
                    </div>
                )}
            />
        );
        return (
            <AppContextProvider
                value={{
                    config,
                    i18n,
                    appTheme,
                    storeHolder,
                    menuFactory: menuRegister,
                }}
            >
                <UiErrorCatcher storeHolder={storeHolder}>
                    <Switch>{routes}</Switch>
                </UiErrorCatcher>
            </AppContextProvider>
        );
    }
}

interface UiErrorCatacherProps {
    storeHolder: StoreHolder;
    children?: React.ReactNode;
}
interface UiErrorCatcherState {
    error?: any;
}
class UiErrorCatcher extends React.PureComponent<UiErrorCatacherProps, UiErrorCatcherState> {
    componentDidCatch(error: any) {
        this.setState({ error });
    }

    render() {
        const { storeHolder } = this.props;
        const { error } = this.state || {};
        return error ? (
            <UiErrorView error={error} {...storeHolder.asProps(WorkspaceStore.NAME)} />
        ) : (
            this.props.children
        );
    }
}

//the index is the style order, should great then mui, small than app inner
//https://cssinjs.org/jss-api/?v=v10.4.0#create-style-sheet
const CssClassesSwitch = withStyles(makeStyles, { withTheme: true, index: WITH_STYLE_APP_IDX })(
    CssClassesSwitchInner
);
