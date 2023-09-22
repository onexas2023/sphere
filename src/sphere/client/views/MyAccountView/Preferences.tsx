/*
 * @file-created: 2023-03-22
 * @copyright 2023 - 2023, OneXas
 * @author: Dennis Chen
 */
import Autocomplete from '@mui/material/Autocomplete';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import FormText from '@onexas/sphere/client/components/FormText';
import { PREFS_PAGESIZES, SUPPORTED_THEMES } from '@onexas/sphere/client/config';
import {
    PERMISSION_ACTION_MODIFY,
    PERMISSION_TARGET_COORDINATE_PREFERENCE,
} from '@onexas/sphere/client/constants';
import { AppContext } from '@onexas/sphere/client/context';
import { MyAccountStore, WorkspaceStore } from '@onexas/sphere/client/stores';
import { moment } from '@onexas/sphere/client/utils/datetime';
import { checkPermissionGrants } from '@onexas/sphere/client/utils/security';
import { Ally } from '@onexas/sphere/client/utils/ui';
import { observer } from 'mobx-react';
import React from 'react';

interface PreferencesProps {
    myAccountStore: MyAccountStore;
    workspaceStore: WorkspaceStore;
}

@observer
class Preferences extends React.PureComponent<PreferencesProps> {
    static contextType = AppContext;
    declare context: React.ContextType<typeof AppContext>;

    private ally: Ally<PreferencesProps>;

    constructor(props: PreferencesProps) {
        super(props);
        this.ally = new Ally(this).errorHandler(props.workspaceStore.errorHandler);
    }

    onChangeLocale = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.context.i18n.changeLocale(e.target.value);
        this.ally.withProgress(this.props.workspaceStore.saveServerUserPreference());
    };
    onChangeTimezone = (e: React.SyntheticEvent, value: string) => {
        if (value) {
            this.props.workspaceStore.preferredTimezone = value;
            this.ally.withProgress(this.props.workspaceStore.saveServerUserPreference());
        }
    };
    onChangePageSize = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.props.workspaceStore.preferredPageSize = parseInt(e.target.value);
        this.ally.withProgress(this.props.workspaceStore.saveServerUserPreference());
    };
    onChangeTheme = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.context.appTheme.changeTheme(e.target.value);
        this.ally.withProgress(this.props.workspaceStore.saveServerUserPreference());
    };

    render() {
        const {
            workspaceStore,
            workspaceStore: {
                supportedTimezones,
                supportedLocales,
                preferredTimezone,
                preferredDateFormat,
                preferredTimeFormat,
                authentication
            },
        } = this.props;
        const {
            appTheme: { classes },
            i18n,
            appTheme,
            config,
        } = this.context;

        const preferenceApiGrant = checkPermissionGrants(
            [
                {
                    target: PERMISSION_TARGET_COORDINATE_PREFERENCE,
                    actions: [PERMISSION_ACTION_MODIFY],
                },
            ],
            authentication.permissions
        );

        const languages: any = i18n.l('languages', { returnObjects: true });
        const pageSizes: any = config.get(PREFS_PAGESIZES);
        const themes: any = config.get(SUPPORTED_THEMES);

        return (
            <div className={classes.form}>
                {preferenceApiGrant ?
                    <TextField
                        select
                        fullWidth
                        className={classes.formTextField}
                        InputLabelProps={{
                            shrink: true,
                        }}
                        value={i18n.locale}
                        onChange={this.onChangeLocale}
                        label={i18n.l('languages')}
                    >
                        {supportedLocales.map((locale: string) => {
                            return (
                                <MenuItem key={locale} value={locale}>
                                    {languages[locale]}
                                </MenuItem>
                            );
                        })}
                    </TextField> :
                    <FormText
                        required
                        label={i18n.l('user.displayName')}
                        value={languages[i18n.locale]}
                    />}
                {preferenceApiGrant ?
                    <Autocomplete
                        options={supportedTimezones}
                        value={preferredTimezone}
                        onChange={this.onChangeTimezone}
                        disableClearable
                        getOptionLabel={(option) => option}
                        renderOption={(props, option, state) => <Typography {...props}>{option}</Typography>}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                fullWidth
                                className={classes.formTextField}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                label={i18n.l('timezone')}
                                helperText={
                                    moment(new Date().getTime(), preferredTimezone, i18n).format(
                                        preferredDateFormat + ' ' + preferredTimeFormat
                                    ) +
                                    ' - ' +
                                    preferredTimezone
                                }
                            />
                        )}
                        noOptionsText={i18n.l('msg.noOptions')}
                    /> :
                    <FormText
                        required
                        label={i18n.l('timezone')}
                        value={preferredTimezone}
                    />}
                {preferenceApiGrant ?
                    <TextField
                        select
                        fullWidth
                        className={classes.formTextField}
                        InputLabelProps={{
                            shrink: true,
                        }}
                        value={workspaceStore.preferredPageSize}
                        onChange={this.onChangePageSize}
                        label={i18n.l('myAccount.pageSize')}
                    >
                        {pageSizes.split(',').map((p: string) => {
                            const i = parseInt(p);
                            return (
                                <MenuItem key={p} value={i}>
                                    {i}
                                </MenuItem>
                            );
                        })}
                    </TextField> :
                    <FormText
                        required
                        label={i18n.l('myAccount.pageSize')}
                        value={workspaceStore.preferredPageSize}
                    />}
                {preferenceApiGrant ?
                    <TextField
                        select
                        fullWidth
                        className={classes.formTextField}
                        InputLabelProps={{
                            shrink: true,
                        }}
                        value={appTheme.themeName}
                        onChange={this.onChangeTheme}
                        label={i18n.l('theme')}
                    >
                        {themes.split(',').map((t: string) => {
                            return (
                                <MenuItem key={t} value={t}>
                                    {i18n.l('theme.' + t)}
                                </MenuItem>
                            );
                        })}
                    </TextField> :
                    <FormText
                        required
                        label={i18n.l('theme')}
                        value={i18n.l('theme.' + appTheme.themeName)}
                    />}
            </div>
        );
    }
}

export default Preferences;
