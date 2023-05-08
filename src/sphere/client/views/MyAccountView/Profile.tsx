/*
 * @file-created: 2023-03-22
 * @copyright 2023 - 2023, OneXas
 * @author: Dennis Chen
 */ 

import FormText from '@onexas/sphere/client/components/FormText';
import {
    PERMISSION_ACTION_MODIFY,
    PERMISSION_TARGET_COORDINATE_PROFILE,
} from '@onexas/sphere/client/constants';
import { AppContext } from '@onexas/sphere/client/context';
import { MyAccountStore, WorkspaceStore } from '@onexas/sphere/client/stores';
import {
    displayNameValidate,
    emailValidate,
} from '@onexas/sphere/client/stores/MyAccountStore';
import { checkPermissionGrants } from '@onexas/sphere/client/utils/security';
import { Ally, noSubmit } from '@onexas/sphere/client/utils/ui';
import { Validator } from '@onexas/sphere/client/utils/validator';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { observer } from 'mobx-react';
import React from 'react';

interface ProfileProps {
    myAccountStore: MyAccountStore;
    workspaceStore: WorkspaceStore;
}

@observer
class Profile extends React.PureComponent<ProfileProps> {
    static contextType = AppContext;
    declare context: React.ContextType<typeof AppContext>;

    private ally: Ally<ProfileProps>;
    private validator: Validator;

    constructor(props: ProfileProps) {
        super(props);
        this.ally = new Ally(this).errorHandler(props.workspaceStore.errorHandler);
    }

    componentDidMount() {
        const { myAccountStore } = this.props;
        this.validator = new Validator(myAccountStore.errors, this.context.i18n);
        if (!myAccountStore.account) {
            this.ally.withProgress(myAccountStore.fetchProfile());
        }
    }

    async validate() {
        const {
            myAccountStore: { displayName, email },
        } = this.props;

        const { validator } = this;

        validator.reset();

        validator.validate(displayNameValidate, displayName, 'displayName');
        validator.validate(emailValidate, email, 'email');

        return !validator.anyInvalid();
    }

    onSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        this.validate().then((res) => {
            if (res && this.ally.live) {
                const { workspaceStore, myAccountStore } = this.props;

                const { i18n } = this.context;
                this.ally.withProgress(
                    myAccountStore.updateProfile().then(() => {
                        workspaceStore.notify(
                            i18n.l('msg.updateSuccess', {
                                target: i18n.l('myAccount.profile'),
                            })
                        );
                    })
                );
            }
        });
    };

    onChangeDisplayName = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {
            validator,
            props: { myAccountStore },
        } = this;
        const { value } = e.target;
        validator.clear('displayName');
        myAccountStore.displayName = value;
    };

    onChangeEmail = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {
            validator,
            props: { myAccountStore },
        } = this;
        const { value } = e.target;
        validator.clear('email');
        myAccountStore.email = value;
    };

    render() {
        const {
            myAccountStore,
            myAccountStore: { updatingProfile: updating },
            workspaceStore: { authentication },
        } = this.props;
        const {
            appTheme: { classes },
            i18n,
        } = this.context;

        const profileApiGrant = checkPermissionGrants(
            [
                {
                    target: PERMISSION_TARGET_COORDINATE_PROFILE,
                    actions: [PERMISSION_ACTION_MODIFY],
                },
            ],
            authentication.permissions
        );

        return (
            <form
                className={classes.form}
                noValidate
                onSubmit={updating ? noSubmit : this.onSubmit}
            >
                <FormText required label={i18n.l('user.account')} value={myAccountStore.account} />

                <FormText required label={i18n.l('domain')} value={myAccountStore.domain} />

                {profileApiGrant ? (
                    <TextField
                        label={i18n.l('user.displayName')}
                        fullWidth
                        required
                        InputLabelProps={{
                            shrink: true,
                        }}
                        className={classes.formTextField}
                        error={!!myAccountStore.errors.displayName}
                        helperText={myAccountStore.errors.displayName}
                        value={myAccountStore.displayName}
                        onChange={this.onChangeDisplayName}
                        autoComplete="off"
                        disabled={updating}
                    />
                ) : (
                    <FormText
                        required
                        label={i18n.l('user.displayName')}
                        value={myAccountStore.displayName}
                    />
                )}
                {profileApiGrant ? (
                    <TextField
                        label={i18n.l('email')}
                        fullWidth
                        required
                        InputLabelProps={{
                            shrink: true,
                        }}
                        className={classes.formTextField}
                        error={!!myAccountStore.errors.email}
                        helperText={myAccountStore.errors.email}
                        value={myAccountStore.email}
                        onChange={this.onChangeEmail}
                        autoComplete="email"
                        disabled={updating}
                    />
                ) : (
                    <FormText required label={i18n.l('email')} value={myAccountStore.email} />
                )}
                {profileApiGrant && (
                    <Box className={classes.formBtnBox}>
                        <Button
                            color="primary"
                            variant="contained"
                            type="submit"
                            disabled={updating}
                        >
                            {i18n.l('action.update')}
                        </Button>
                    </Box>
                )}
            </form>
        );
    }
}

export default Profile;
