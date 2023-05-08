/*
 * @file-created: 2023-03-22
 * @copyright 2023 - 2023, OneXas
 * @author: Dennis Chen
 */ 

import {
    buildApiConfiguration,
    OrganizationUserRelationType,
    CoordinateOrganizationApi,
} from '@onexas/sphere/client/api';
import { StoreHolder } from '@onexas/sphere/client/types';

const orRelationCompareMap = new Map<string, number>();
orRelationCompareMap.set(OrganizationUserRelationType.MEMBER, 1);
orRelationCompareMap.set(OrganizationUserRelationType.ADVANCED_MEMBER, 2);
orRelationCompareMap.set(OrganizationUserRelationType.SUPERVISOR, 3);

export function organizationUserRelationComparator(
    type1: OrganizationUserRelationType,
    type2: OrganizationUserRelationType
): number {
    return orRelationCompareMap.get(type1) - orRelationCompareMap.get(type2);
}

export async function fetchOrganization(storeHolder: StoreHolder, code: string) {
    return new CoordinateOrganizationApi(buildApiConfiguration(storeHolder)).getOrganization({
        code,
    });
}

export async function fetchOrganizations(storeHolder: StoreHolder) {
    return new CoordinateOrganizationApi(buildApiConfiguration(storeHolder)).listOrganization();
}
