/*
 * @file-created: 2023-03-22
 * @copyright 2023 - 2023, OneXas
 * @author: Dennis Chen
 */

import { FontAwesomeIconProp } from '@onexas/sphere/client/icons';
import { Theme as MuiTheme } from '@mui/material/styles';
import { MenuGroup } from '@onexas/sphere/client/menus';
import { BreadcrumbStore, MenuStore, WorkspaceStore } from '@onexas/sphere/client/stores';
import { CssClasses } from '@onexas/sphere/client/styles';
import React from 'react';
import { CreateCSSProperties } from '@mui/styles';

const hasWindow = typeof window !== 'undefined';
export { hasWindow };

export type DynamicLabel = null | string | ((storeHolder: StoreHolder, i18n: I18n) => string);
export type DynamicAction =
    | null
    | string
    | ((storeHolder: StoreHolder, i18n: I18n) => null | string | (() => void));
export type DynamicIcon =
    | null
    | string
    | FontAwesomeIconProp
    | ((
          storeHolder: StoreHolder,
          i18n: I18n
      ) => null | string | FontAwesomeIconProp | React.ComponentType<{ className?: string }>);

export interface StoreClass<T> {
    new (...args: any[]): T;
    NAME: string;
}

export type DynamicString = string | (() => string);
export type DynamicBoolean = boolean | (() => boolean);
export type DynamicNumber = number | (() => number);

export interface Store {
    registerObserver(): Unregister;
}

export interface StoreHolder {
    put(name: string, store: Store): void;
    asProps(...name: string[]): any;
    get<S extends Store>(name: string | StoreClass<S>): S;
    getIfAny<S extends Store>(name: string | StoreClass<S>): S;
}

export interface FilterObserver {
    (filter: string): void;
}

export interface MenuFactory {
    build(name: string, storeHolder: StoreHolder): MenuGroup[];
}

export interface I18nTrackable {
    /**
     * use this object to tracker locale change by mobox on the fly in render()
     */
    l: (key: string, options?: any) => string;
    /**
     * use this method to check key exist or not
     */
    e: (key: string) => boolean;
}

export interface Config {
    /**
     * indicate the code base is build in production or not
     */
    readonly production: boolean;

    get(key: string, defaultVal?: string): string;
    getBoolean(key: string, defaultVal?: boolean): boolean;
    getNumber(key: string, defaultVal?: number): number;
    stringify(): string;
}

export type CookieSetOption = {
    path?: string;
    expires?: Date;
    maxAge?: number;
    domain?: string;
    secure?: boolean;
    httpOnly?: boolean;
    sameSite?: boolean | 'none' | 'lax' | 'strict';
};
export interface Cookies {
    get(key: string, defaultVal?: string): string;
    set(key: string, value: string, option?: CookieSetOption): void;
    remove(key: string, option?: CookieSetOption): void;
}
//an interface for Storage by another name to avoid conflict
export interface Depot {
    get(key: string, defaultVal?: string): string;
    set(key: string, value: string): void;
    remove(key: string): void;
    clear(): void;
}

//an interface for refreshWorkspace
export interface StateSyncer {
    sync(): void;
}

export interface I18n {
    /**
     * the current locale of i18n
     */
    readonly locale: string;
    /**
     * use this object to tracker locale change by mobox on the fly in render()
     */
    readonly t: I18nTrackable;
    /**
     * use this method to get label directly without tracking, usually in some action()
     */
    l: (key: string, options?: any) => string;

    /**
     * use this method check key exist or not without tracking, usually in some action()
     */
    e: (key: string) => boolean;

    /**
     * change the i18n locale
     */
    changeLocale(locale: string): void;
}

//fix   WARNING in ./src/sphere/client/types/types.ts 27:0-17
// "export 'Theme' was not found in '@mui/material/styles'
export interface Theme extends MuiTheme{
}

export interface AppTheme {
    readonly themeName: string;
    changeTheme(themeName: string): void;
    readonly theme: Theme;
    readonly classes: CssClasses;
}

export enum AuthMode {
    Must = 1,
    MustNot,
    NotCare,
}

export interface RouteEntry<EXT = any> {
    readonly path: string;
    readonly view: React.ComponentType<ViewProps<EXT> | any>;
    readonly layout?: React.ComponentType<LayoutProps<EXT>>;
    readonly authMode?: AuthMode;
    readonly grants?: PermissionGrants | PermissionGrant[];
    readonly exact?: boolean;
    readonly strict?: boolean;
    readonly storeNames?: string[];
    readonly extra?: EXT;
}

export interface PermissionGrants {
    readonly grants: PermissionGrant[];
    readonly matchAll?: boolean;
}
export interface PermissionGrant {
    readonly target: string;
    readonly actions: string | string[];
    readonly matchAll?: boolean;
}

export interface ViewProps<EXT = any> {
    workspaceStore: WorkspaceStore;
    breadcrumbStore: BreadcrumbStore;
    menuStore: MenuStore;
    readonly entry: RouteEntry<EXT>;
}

export interface LayoutProps<EXT = any> {
    workspaceStore: WorkspaceStore;
    breadcrumbStore: BreadcrumbStore;
    menuStore: MenuStore;
    readonly entry: RouteEntry<EXT>;
    children?: React.ReactNode;
}

export type Message = {
    readonly key: string;
    readonly text: string;
    readonly level: MessageLevel;
    readonly timestamp: number;
    shown: number;
};

export enum MessageLevel {
    Info = 1,
    Success,
    Warning,
    Error,
}

export interface Unregister {
    (): void;
}

//shortcut for CSS.Properties
export type CssStyle = CreateCSSProperties;
export type CssClass = string;

export const ICONDEF_PREFIX = "ICONDEF:"