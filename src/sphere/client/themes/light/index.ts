import { ThemeOptions } from '@mui/material/styles';
import defaultThemeOptions from '@onexas/sphere/client/themes/default-theme-options';
import deepmerge from 'deepmerge';

const themeOptions: ThemeOptions = deepmerge(defaultThemeOptions, {
    palette: {
        mode: 'light',
    },
});

export default themeOptions;
