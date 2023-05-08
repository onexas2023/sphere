/*
 * @file-created: 2023-03-22
 * @copyright 2023 - 2023, OneXas
 * @author: Dennis Chen
 */ 

import { AppContext } from '@onexas/sphere/client/context';
import { WorkspaceStore } from '@onexas/sphere/client/stores';
import { Breadcrumb as Crumb } from '@onexas/sphere/client/stores/BreadcrumbStore';
import { typeOfFunction, typeOfString } from '@onexas/sphere/client/utils/object';
import Typography from '@mui/material/Typography';
import { observer } from 'mobx-react';
import React from 'react';

interface Props {
    workspaceStore: WorkspaceStore;
    breadcrumb: Crumb;
}

@observer
export default class Breadcrumb extends React.PureComponent<Props> {
    static contextType = AppContext;
    declare context: React.ContextType<typeof AppContext>;

    render() {
        const { breadcrumb, workspaceStore } = this.props;
        const {
            appTheme: { classes },
            i18n,
            storeHolder,
        } = this.context;

        let { label: breadcrumbLabel, action: breadcrumbAction } = breadcrumb;
        let action;
        if (typeOfFunction(breadcrumbAction)) {
            action = breadcrumbAction(storeHolder, i18n);
        } else {
            action = breadcrumbAction;
        }

        let label: string;
        let staticLabel = false;
        if (typeOfFunction(breadcrumbLabel)) {
            label = breadcrumbLabel(storeHolder, i18n);
        } else {
            label = breadcrumbLabel as string;
            staticLabel = true;
        }

        if (typeOfString(action)) {
            const path = action;
            action = (evt: React.MouseEvent) => {
                if (path.startsWith('/')) {
                    workspaceStore.reroute(path, evt);
                } else {
                    workspaceStore.redirect(path, evt);
                }
            };
        }
        return (
            <Typography
                variant="body1"
                onClick={action}
                className={action && classes.layoutActiveBreadcurmb}
            >
                {label ? (staticLabel ? i18n.l(label) : label) : '...'}
            </Typography>
        );
    }
}
