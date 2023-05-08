/*
 * @file-created: 2023-03-22
 * @copyright 2023 - 2023, OneXas
 * @author: Dennis Chen
 */ 

import { Theme } from '@onexas/sphere/client/types';
import Color from 'color';
import { contrast } from './color';

export function contrastBg(theme: Theme, color: string | Color, ratio: number = 0.5): Color {
    return contrast(theme.palette.background.default, color);
}

export function contrastPaper(theme: Theme, color: string | Color, ratio: number = 0.5): Color {
    return contrast(theme.palette.background.paper, color);
}
