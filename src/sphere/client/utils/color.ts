/*
 * @file-created: 2023-03-22
 * @copyright 2023 - 2023, OneXas
 * @author: Dennis Chen
 */ 

import Color from 'color';
import { typeOfString } from '@onexas/sphere/client/utils/object';

export function contrast(
    inColor: string | Color,
    color: string | Color,
    ratio: number = 0.5
): Color {
    if (typeOfString(inColor)) {
        inColor = Color(inColor);
    }
    if (typeOfString(color)) {
        color = Color(color);
    }
    if (inColor.isLight()) {
        color = color.darken(ratio);
    } else {
        color = color.lighten(ratio);
    }
    return color;
}
