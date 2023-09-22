/*
 * @file-created: 2023-03-22
 * @copyright 2023 - 2023, OneXas
 * @author: Dennis Chen
 */ 

import { COORDINATE_API_BASE_PATH } from '@onexas/sphere/client/config';
import { WorkspaceStore } from '@onexas/sphere/client/stores';
import { StoreHolder } from '@onexas/sphere/client/types';
import { CoordinateAuthApi } from '@onexas/coordinate-api-sdk-typescript/dist/apis/CoordinateAuthApi';
import { CoordinateMetainfoApi } from '@onexas/coordinate-api-sdk-typescript/dist/apis/CoordinateMetainfoApi';
import { CoordinateOrganizationApi } from '@onexas/coordinate-api-sdk-typescript/dist/apis/CoordinateOrganizationApi';
import { CoordinateProfileApi } from '@onexas/coordinate-api-sdk-typescript/dist/apis/CoordinateProfileApi';
import { CoordinateUserApi } from '@onexas/coordinate-api-sdk-typescript/dist/apis/CoordinateUserApi';
import { CoordinateJobApi } from '@onexas/coordinate-api-sdk-typescript/dist/apis/CoordinateJobApi';
import { CoordinatePreferenceApi } from '@onexas/coordinate-api-sdk-typescript/dist/apis/CoordinatePreferenceApi';
import { Authentication } from '@onexas/coordinate-api-sdk-typescript/dist/models/Authentication';
import { AuthenticationRequest } from '@onexas/coordinate-api-sdk-typescript/dist/models/AuthenticationRequest';
import { OrganizationUserRelationType } from '@onexas/coordinate-api-sdk-typescript/dist/models/OrganizationUserRelationType';
import { Response } from '@onexas/coordinate-api-sdk-typescript/dist/models/Response';
import { UDomain } from '@onexas/coordinate-api-sdk-typescript/dist/models/UDomain';
import { UOrganizationUser } from '@onexas/coordinate-api-sdk-typescript/dist/models/UOrganizationUser';
import { UOrganizationUserFilter } from '@onexas/coordinate-api-sdk-typescript/dist/models/UOrganizationUserFilter';
import { UOrganizationUserListPage } from '@onexas/coordinate-api-sdk-typescript/dist/models/UOrganizationUserListPage';
import { UOrganizationUserRelation } from '@onexas/coordinate-api-sdk-typescript/dist/models/UOrganizationUserRelation';
import { UPasswordUpdate } from '@onexas/coordinate-api-sdk-typescript/dist/models/UPasswordUpdate';
import { UPrincipalPermission } from '@onexas/coordinate-api-sdk-typescript/dist/models/UPrincipalPermission';
import { UProfile } from '@onexas/coordinate-api-sdk-typescript/dist/models/UProfile';
import { UJob } from '@onexas/coordinate-api-sdk-typescript/dist/models/UJob';
import { UProfileUpdate } from '@onexas/coordinate-api-sdk-typescript/dist/models/UProfileUpdate';
import { UUser } from '@onexas/coordinate-api-sdk-typescript/dist/models/UUser';
import { UUserFilter } from '@onexas/coordinate-api-sdk-typescript/dist/models/UUserFilter';
import { UUserListPage } from '@onexas/coordinate-api-sdk-typescript/dist/models/UUserListPage';
import { UUserOrganization } from '@onexas/coordinate-api-sdk-typescript/dist/models/UUserOrganization';
import { Configuration } from '@onexas/coordinate-api-sdk-typescript/dist/runtime';
export * from '@onexas/coordinate-api-sdk-typescript/dist/constants';
export {
    CoordinateAuthApi,
    CoordinateProfileApi,
    CoordinateMetainfoApi,
    CoordinateOrganizationApi,
    CoordinateJobApi,
    CoordinatePreferenceApi,
    AuthenticationRequest,
    Authentication,
    UJob,
    UDomain,
    UProfile,
    Configuration,
    UPrincipalPermission,
    UProfileUpdate,
    UPasswordUpdate,
    UUserOrganization,
    UOrganizationUser,
    UOrganizationUserFilter,
    OrganizationUserRelationType,
    UOrganizationUserListPage,
    UUserListPage,
    UUserFilter,
    CoordinateUserApi,
    UUser,
    Response,
    UOrganizationUserRelation,
};

export function buildApiConfiguration(storeHolder: StoreHolder | WorkspaceStore) {
    let workspaceStore: WorkspaceStore;
    if (storeHolder instanceof WorkspaceStore) {
        workspaceStore = storeHolder;
    } else {
        workspaceStore = storeHolder.get(WorkspaceStore);
    }
    const basePath: string = workspaceStore.config.get(COORDINATE_API_BASE_PATH);
    const apiKey = workspaceStore.authentication && workspaceStore.authentication.token;

    let fetchApi: any = null;
    if (typeof __FETCH_API === 'function') {
        // eslint-disable-next-line no-undef
        fetchApi = __FETCH_API;
    }

    return new Configuration({
        basePath,
        apiKey,
        fetchApi,
    });
}
