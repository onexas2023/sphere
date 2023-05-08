/*
 * @file-created: 2023-03-22
 * @copyright 2023 - 2023, OneXas
 * @author: Dennis Chen
 */ 

import { UOrganizationUser, UUser } from '@onexas/sphere/client/api';
import { Equals } from '@onexas/sphere/client/utils/app';

export const userEquals: Equals<UUser> = (o1: UUser, o2: UUser) => {
    return o1.aliasUid === o2.aliasUid;
};

export const organizationUserEquals: Equals<UOrganizationUser> = (
    o1: UOrganizationUser,
    o2: UOrganizationUser
) => {
    return o1.aliasUid === o2.aliasUid;
};
