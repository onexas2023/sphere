/*
 * @file-created: 2023-03-22
 * @copyright 2023 - 2023, OneXas
 * @author: Dennis Chen
 */ 

import FormText from '@onexas/sphere/client/components/FormText';
import { AppContext } from '@onexas/sphere/client/context';
import { AnOrganizationStore, WorkspaceStore } from '@onexas/sphere/client/stores';
import { typeOfObjectNotNull } from '@onexas/sphere/client/utils/object';
import { observer } from 'mobx-react';
import React from 'react';

interface SettingsProps {
    anOrganizationStore: AnOrganizationStore;
    workspaceStore: WorkspaceStore;
}

@observer
class Settings extends React.PureComponent<SettingsProps> {
    static contextType = AppContext;
    declare context: React.ContextType<typeof AppContext>;

    render() {
        const { anOrganizationStore } = this.props;
        const {
            appTheme: { classes },
            i18n,
        } = this.context;
        const { organization } = anOrganizationStore;

        if (!typeOfObjectNotNull(organization)) {
            return <span />;
        }

        const org = organization;
        return (
            <div className={classes.form}>
                <FormText required label={i18n.l('code')} value={org.code} />
                <FormText required label={i18n.l('name')} value={org.name} />
                <FormText label={i18n.l('description')} value={org.description} />
            </div>
        );
    }
}
export default Settings;
