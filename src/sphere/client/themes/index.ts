import { ThemeOptions } from '@mui/material/styles';
import dark from './dark';
import light from './light';

export const themeOptions = {
    light,
    dark,
};

export const defaultThemeName = 'light';

export function getThemeOptions(name: string = defaultThemeName): ThemeOptions {
    let t = (themeOptions as any)[name];
    if (!t) {
        t = light;
    }
    return t;
}

export function suggestThemeName(name: string) {
    return (themeOptions as any)[name] ? name : defaultThemeName;
}

