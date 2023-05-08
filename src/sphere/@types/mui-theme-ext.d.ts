import { Palette, PaletteColor, Theme } from '@mui/material/styles';
import Color from 'color';

declare module '@mui/material/styles' {
    export interface Theme {
        sphere: {
            portal: {
                bgColor: string;
                textColor: string;
            };
            appbar: {
                bgColor: string;
                textColor: string;
                iconSize: number;
                minHeight: number;
            };
            notificationSider: {
                width: number;
            };
            menuSider: {
                width: number;
                openWidth: number;
                itemPadding: number;
                iconSize: number;
            };
            applinksPopover: {
                tilesSize: number;
                imageSize: number;
            };
        };
    }
    export interface ThemeOptions {
        sphere?: {
            portal: {
                bgColor?: string;
                textColor?: string;
            };
            appbar: {
                bgColor?: string;
                textColor?: string;
                iconSize?: number;
                minHeight?: number;
            }
            notificationSider?: {
                width?: number;
            };
            menuSider?: {
                width?: number;
                openWidth?: number;
                itemPadding: number;
                iconSize: number;
            };
            applinksPopover: {
                tilesSize?: number;
                imageSize?: number;
            };
        };
    }
}

declare module '@mui/material/styles' {
    export interface Palette {
        success: PaletteColor;
        info: PaletteColor;
        warning: PaletteColor;
        unknown: PaletteColor;
    }
    export interface PaletteOptions {
        success?: PaletteColorOptions;
        info?: PaletteColorOptions;
        warning?: PaletteColorOptions;
        unknown?: PaletteColorOptions;
    }
}


declare module '@mui/styles/defaultTheme' {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    export interface DefaultTheme extends Theme { }
}