/*
 * @file-created: 2023-03-22
 * @copyright 2023 - 2023, OneXas
 * @author: Dennis Chen
 */ 

import { VisibilityAdornment } from '@onexas/sphere/client/components/misc';
import { AppContext } from '@onexas/sphere/client/context';
import { MyAccountStore, WorkspaceStore } from '@onexas/sphere/client/stores';
import { passwordValidate } from '@onexas/sphere/client/stores/MyAccountStore';
import { MessageLevel } from '@onexas/sphere/client/types';
import { Ally, noSubmit } from '@onexas/sphere/client/utils/ui';
import {
    ReuqiredNotStrict,
    TrueValidate,
    Validator,
} from '@onexas/sphere/client/utils/validator';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { makeObservable, observable } from 'mobx';
import { observer } from 'mobx-react';
import React from 'react';

interface PasswordProps {
    myAccountStore: MyAccountStore;
    workspaceStore: WorkspaceStore;
}

@observer
class Password extends React.PureComponent<PasswordProps> {
    static contextType = AppContext;
    declare context: React.ContextType<typeof AppContext>;

    private ally: Ally<PasswordProps>;
    private validator: Validator;

    @observable
    newPasswordVisible?: boolean;
    @observable
    oldPasswordVisible?: boolean;

    constructor(props: PasswordProps) {
        super(props);
        this.ally = new Ally(this).errorHandler(props.workspaceStore.errorHandler);

        makeObservable(this);
    }

    componentDidMount() {
        const { myAccountStore } = this.props;

        this.validator = new Validator(myAccountStore.errors, this.context.i18n);

        if (!myAccountStore.account) {
            this.ally.withProgress(myAccountStore.fetchProfile());
        }
    }

    onToggleOldPasswordVisibility = () => {
        this.oldPasswordVisible = !this.oldPasswordVisible;
    };
    onToggleNewPasswordVisibility = () => {
        this.newPasswordVisible = !this.newPasswordVisible;
    };

    async validate() {
        const {
            myAccountStore: { oldPassword, newPassword, newPasswordConfirmation },
        } = this.props;
        const { validator } = this;

        validator.reset();
        validator.validate(ReuqiredNotStrict, oldPassword, 'oldPassword');

        if (validator.validate(passwordValidate, newPassword, 'newPassword')) {
            validator.validate(
                new TrueValidate({ msg: 'myAccount.validator.inconsistentPassword' }),
                newPassword === newPasswordConfirmation,
                'newPasswordConfirmation'
            );
        }

        return !validator.anyInvalid();
    }

    onSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        this.validate().then((res) => {
            if (res && this.ally.live) {
                const { workspaceStore, myAccountStore } = this.props;
                const { i18n } = this.context;

                this.ally.withProgress(
                    myAccountStore
                        .updatePassword()
                        .then(() => {
                            workspaceStore.notify(
                                i18n.l('msg.updateSuccess', {
                                    target: i18n.l('user.password'),
                                })
                            );
                        })
                        .catch((err) => {
                            if (err.status === 403) {
                                workspaceStore.notify(
                                    i18n.l('myAccount.msg.updatePasswordNoPermission'),
                                    MessageLevel.Error
                                );
                                return;
                            }
                            throw err;
                        })
                );
            }
        });
    };

    onChangeOldPassword = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {
            validator,
            props: { myAccountStore },
        } = this;
        const { value } = e.target;
        validator.clear('oldPassword');
        myAccountStore.oldPassword = value;
    };
    onChangeNewPassword = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {
            validator,
            props: { myAccountStore },
        } = this;
        const { value } = e.target;
        validator.clear('newPassword');
        myAccountStore.newPassword = value;
    };
    onChangeNewPasswordConfirmation = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {
            validator,
            props: { myAccountStore },
        } = this;
        const { value } = e.target;
        validator.clear('newPasswordConfirmation');
        myAccountStore.newPasswordConfirmation = value;
    };

    render() {
        const {
            myAccountStore,
            myAccountStore: { updatingPassword: updating },
        } = this.props;
        const {
            appTheme: { classes },
            i18n,
        } = this.context;
        const { newPasswordVisible, oldPasswordVisible } = this;
        return (
            <form
                className={classes.form}
                noValidate
                onSubmit={updating ? noSubmit : this.onSubmit}
            >
                <input
                    type="text"
                    autoComplete="username"
                    defaultValue={myAccountStore.account}
                    style={{ display: 'none' }}
                />
                <TextField
                    type={oldPasswordVisible ? 'text' : 'password'}
                    label={i18n.l('myAccount.oldPassword')}
                    fullWidth
                    required
                    className={classes.formTextField}
                    error={!!myAccountStore.errors.oldPassword}
                    helperText={myAccountStore.errors.oldPassword}
                    autoComplete="current-password"
                    value={myAccountStore.oldPassword}
                    onChange={this.onChangeOldPassword}
                    InputProps={{
                        endAdornment: (
                            <VisibilityAdornment
                                visibility={oldPasswordVisible}
                                toggleVisibility={this.onToggleOldPasswordVisibility}
                            />
                        ),
                    }}
                />
                <TextField
                    type={newPasswordVisible ? 'text' : 'password'}
                    label={i18n.l('myAccount.newPassword')}
                    fullWidth
                    required
                    className={classes.formTextField}
                    autoComplete="new-password"
                    error={!!myAccountStore.errors.newPassword}
                    helperText={myAccountStore.errors.newPassword}
                    value={myAccountStore.newPassword}
                    onChange={this.onChangeNewPassword}
                    InputProps={{
                        endAdornment: (
                            <VisibilityAdornment
                                visibility={newPasswordVisible}
                                toggleVisibility={this.onToggleNewPasswordVisibility}
                            />
                        ),
                    }}
                />
                <TextField
                    type={newPasswordVisible ? 'text' : 'password'}
                    label={i18n.l('myAccount.newPasswordConfirmation')}
                    fullWidth
                    required
                    className={classes.formTextField}
                    autoComplete="off"
                    error={!!myAccountStore.errors.newPasswordConfirmation}
                    helperText={myAccountStore.errors.newPasswordConfirmation}
                    value={myAccountStore.newPasswordConfirmation}
                    onChange={this.onChangeNewPasswordConfirmation}
                />
                <Box className={classes.formBtnBox}>
                    <Button color="primary" variant="contained" type="submit" disabled={updating}>
                        {i18n.l('action.update')}
                    </Button>
                </Box>
            </form>
        );
    }
}

export default Password;
