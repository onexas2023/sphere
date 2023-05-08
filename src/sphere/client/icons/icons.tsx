/*
 * @file-created: 2023-03-22
 * @copyright 2023 - 2023, OneXas
 * @author: Dennis Chen
 */ 

import { IconDefinition, IconPack } from '@fortawesome/fontawesome-common-types';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faHome } from '@fortawesome/free-solid-svg-icons/faHome';

const prefix: any = 'sphere';
const cLigaturess: string[] = [];

export const homeAppLink: IconDefinition = {
    prefix,
    iconName: 'home-applink' as any,
    icon: faHome.icon,
};

export const spherePack: IconPack = {
    homeAppLink,
};

library.add(homeAppLink);
