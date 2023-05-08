/*
 * @file-created: 2023-03-22
 * @copyright 2023 - 2023, OneXas
 * @author: Dennis Chen
 */ 

import { MenuFactory, AppTheme, Config, I18n, StoreHolder } from '@onexas/sphere/client/types';
import React from 'react';

type AppContext = {
    config: Config;
    i18n: I18n;
    appTheme: AppTheme;
    storeHolder: StoreHolder;
    menuFactory: MenuFactory;
};

const appContext = React.createContext<Partial<AppContext>>({});
const AppContextProvider = appContext.Provider;
const AppContextConsumer = appContext.Consumer;

export { appContext as AppContext, AppContextProvider, AppContextConsumer };
