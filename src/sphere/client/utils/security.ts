/*
 * @file-created: 2023-03-22
 * @copyright 2023 - 2023, OneXas
 * @author: Dennis Chen
 */ 

import { PermissionGrants, PermissionGrant } from '@onexas/sphere/client/types';
import { UPrincipalPermission } from '@onexas/sphere/client/api/coordinate-api';
import { typeOfString } from '@onexas/sphere/client/utils/object';

export function checkPermissionGrants(
    grants: PermissionGrants | PermissionGrant[],
    principalPermissions: UPrincipalPermission[]
): boolean {
    if (!grants) {
        return true;
    }
    const grantArray: PermissionGrant[] = Array.isArray(grants) ? grants : grants.grants;
    if (!grantArray || grantArray.length === 0) {
        return true;
    }
    if (!principalPermissions || principalPermissions.length === 0) {
        return false;
    }

    const grantMatchAll: boolean = Array.isArray(grants) ? false : grants.matchAll;

    const permissionGrantMatch = (grant: PermissionGrant): boolean => {
        const actions = typeOfString(grant.actions) ? [grant.actions] : grant.actions;
        return principalPermissions.some((principalPermission) => {
            if (
                principalPermission.target === '*' ||
                grant.target === '*' ||
                principalPermission.target === grant.target
            ) {
                const principalAction = principalPermission.action;
                const actionGrantMatch = (grantAction: string): boolean => {
                    return (
                        principalAction === '*' ||
                        grantAction === '*' ||
                        principalAction === grantAction
                    );
                };
                if (grant.matchAll) {
                    return actions.every(actionGrantMatch);
                } else {
                    return actions.some(actionGrantMatch);
                }
            }
        });
    };
    if (grantMatchAll) {
        return grantArray.every(permissionGrantMatch);
    } else {
        return grantArray.some(permissionGrantMatch);
    }
}
