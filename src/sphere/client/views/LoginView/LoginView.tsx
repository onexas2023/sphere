/*
 * @file-created: 2023-03-22
 * @copyright 2023 - 2023, OneXas
 * @author: Dennis Chen
 */
import { LoginLogo } from '@onexas/sphere/client/assets/images';
import { APP_NAME, PATH_HOME, URI_LOGIN_LOGO } from '@onexas/sphere/client/config';
import { PARAM_BACK_PATH } from '@onexas/sphere/client/constants';
import { AppContext } from '@onexas/sphere/client/context';
import { Footer } from '@onexas/sphere/client/layouts/components/Footer';
import { LoginStore } from '@onexas/sphere/client/stores';
import { CssClass, CssStyle, ViewProps } from '@onexas/sphere/client/types';
import { Ally, noSubmit } from '@onexas/sphere/client/utils/ui';
import { parseSearch } from '@onexas/sphere/client/utils/url';
import { RequiredValidate, Validator } from '@onexas/sphere/client/utils/validator';

import Button from '@mui/material/Button';
import Card from '@mui/material/Card';

import CardContent from '@mui/material/CardContent';

import FormHelperText from '@mui/material/FormHelperText';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import createStyles from '@mui/styles/createStyles';
import withStyles from '@mui/styles/withStyles';
import { Theme } from '@onexas/sphere/client/types';
import clsx from 'clsx';
import Color from 'color';
import { disposeOnUnmount, observer } from 'mobx-react';
import React from 'react';

type CssRules<P> = {
    root: P;
    card: P;
    sider: P;
    logo: P;
    loginto: P;
    form: P;
    error: P;
    footer: P;
    lang: P;

};
type CssStyles = CssRules<CssStyle>;
type CssClasses = CssRules<CssClass>;

function makeStyles(theme: Theme) {
    const pmainColor = Color(theme.palette.primary.main);
    const bgColor = theme.sphere.portal.bgColor;
    const textColor = Color(theme.sphere.portal.textColor);
    const style: CssStyles = {
        root: {
            minHeight: '100vh',
            width: '100%',
            flexDirection: 'column',
            display: 'flex',
            alignItems: 'center',
        },
        card: {
            marginTop: '20vh',
            padding: theme.spacing(2),
            backgroundColor: pmainColor.string(),
            borderRadius: 0,
            '& .MuiCardContent-root': {
                padding: 0,
                flexDirection: 'row',
                display: 'flex',
                alignItems: "stretch",
            },
        },
        sider: {
            width: 240,
            background: "#3f3f3f",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: theme.spacing(2, 1),
            color: '#fff',
        },
        logo: {
            display: "flex",
            paddingTop: theme.spacing(2),
            "& img": {
                maxWidth: 321,
            }
        },
        loginto: {
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center"
        },
        form: {
            alignItems: 'end',
            padding: theme.spacing(10, 10, 2),
            width: 480,
            backgroundColor: "#fffffffa"
        },
        error: {
            minHeight: 32,
        },
        footer: {
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
        },
        lang: {
            position: "absolute",
            left: theme.spacing(2),
            bottom: theme.spacing(1)
        },
    };

    return createStyles(style);
}

interface LoginViewProps extends ViewProps {
    classes?: CssClasses;
    loginStore: LoginStore;
}

@observer
class LoginView extends React.PureComponent<LoginViewProps> {
    static contextType = AppContext;
    declare context: React.ContextType<typeof AppContext>;

    private ally: Ally<LoginViewProps, any>;
    private validator: Validator;

    constructor(props: LoginViewProps) {
        super(props);
        this.ally = new Ally(this).errorHandler(props.workspaceStore.errorHandler);
    }

    componentDidMount() {
        let { workspaceStore, loginStore } = this.props;
        this.validator = new Validator(loginStore.errors, this.context.i18n);

        workspaceStore.title = this.context.i18n.l('login');

        disposeOnUnmount(this, loginStore.registerObserver());

        this.ally.withProgress(loginStore.fetchDomain());
    }
    componentDidUpdate() {
        //we allow to change lang in login, so, update title for the case of lang change
        this.props.workspaceStore.title = this.context.i18n.l('login');
        this.validator = new Validator(this.props.loginStore.errors, this.context.i18n);
    }

    onChangeLocale = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.context.i18n.changeLocale(e.target.value);
    };

    onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        this.validate().then((res) => {
            if (res && this.ally.live) {
                const { workspaceStore, loginStore } = this.props;
                this.ally.withProgress(
                    loginStore
                        .login()
                        .then(() => {
                            const backpath = parseSearch(location.search).get(PARAM_BACK_PATH);
                            workspaceStore.redirect(
                                backpath
                                    ? decodeURIComponent(backpath)
                                    : this.context.config.get(PATH_HOME)
                            );
                        })
                        .catch((err) => {
                            if (err.status === 401) {
                                this.validator.invalidate('result', 'msg.authenticationFail');
                                return;
                            }
                            throw err;
                        })
                );
            }
        });
    };

    async validate() {
        const {
            loginStore: { account, password },
        } = this.props;

        const { validator } = this;

        validator.reset();

        validator.validate(new RequiredValidate({ strict: false }), account, 'account');
        validator.validate(new RequiredValidate({ strict: false }), password, 'password');

        return !validator.anyInvalid();
    }

    onChangeAccount = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {
            validator,
            props: { loginStore },
        } = this;
        const { value } = e.target;

        validator.clear('result');
        validator.clear('account');
        loginStore.account = value;
    };

    onChangePassword = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {
            validator,
            props: { loginStore },
        } = this;
        const { value } = e.target;

        validator.clear('result');
        validator.clear('password');
        loginStore.password = value;
    };

    onChangeDomain = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {
            validator,
            props: { loginStore },
        } = this;
        const { value } = e.target;

        validator.clear('result');
        validator.clear('domain');
        loginStore.domain = value;
    };

    render() {
        const {
            classes,
            loginStore,
            workspaceStore,
            loginStore: { logining },
        } = this.props;
        const {
            appTheme: { classes: cssClasses, theme },
            i18n,
            config,
        } = this.context;

        const languages: any = i18n.l('languages', { returnObjects: true });

        const bgColor = theme.sphere.portal.bgColor;
        const textColor = theme.sphere.portal.textColor;
        const appName = i18n.l(config.get(APP_NAME));

        //"/public/images/logo-login.png"
        const logoImage = config.get(URI_LOGIN_LOGO) || LoginLogo;

        return (
            <div className={classes.root}>
                <Card className={classes.card} square={false}>
                    <CardContent>
                        <div className={classes.sider}>
                            <div className={classes.logo}>
                                <img src={logoImage} />
                            </div>
                            <div className={cssClasses.flexGrow} />
                            <div className={classes.loginto}>
                                <Typography variant='body2'>{i18n.l('login')}</Typography>
                                <Typography variant="h6">{appName}</Typography>
                            </div>
                        </div>
                        <div className={classes.form}>
                            <form
                                className={clsx(cssClasses.form)}
                                noValidate
                                onSubmit={logining ? noSubmit : this.onSubmit}
                            >

                                <TextField
                                    className={cssClasses.formTextField}
                                    variant="outlined"
                                    required
                                    fullWidth
                                    label={i18n.l('user.account')}
                                    autoComplete="username"
                                    autoFocus
                                    value={loginStore.account}
                                    error={!!loginStore.errors.account}
                                    helperText={loginStore.errors.account}
                                    onChange={this.onChangeAccount}
                                    disabled={logining}
                                />
                                <TextField
                                    className={cssClasses.formTextField}
                                    variant="outlined"
                                    required
                                    fullWidth
                                    label={i18n.l('user.password')}
                                    type="password"
                                    autoComplete="current-password"
                                    value={loginStore.password}
                                    error={!!loginStore.errors.password}
                                    helperText={loginStore.errors.password}
                                    onChange={this.onChangePassword}
                                    disabled={logining}
                                />
                                <TextField
                                    select
                                    className={cssClasses.formTextField}
                                    variant="outlined"
                                    required
                                    fullWidth
                                    label={i18n.l('domain')}
                                    value={loginStore.domain}
                                    onChange={this.onChangeDomain}
                                    disabled={logining || loginStore.domains.length === 0}
                                >
                                    {loginStore.domains.length === 0 ? (
                                        <MenuItem key={loginStore.domain} value={loginStore.domain}>
                                            {i18n.l('domain.' + loginStore.domain)}
                                        </MenuItem>
                                    ) : (
                                        loginStore.domains.map((domain) => {
                                            return (
                                                <MenuItem key={domain.code} value={domain.code}>
                                                    {domain.name}
                                                </MenuItem>
                                            );
                                        })
                                    )}
                                </TextField>
                                <FormHelperText
                                    error={!!loginStore.errors.result}
                                    className={classes.error}
                                >
                                    {loginStore.errors.result}
                                </FormHelperText>
                                <Button
                                    type="submit"
                                    fullWidth
                                    variant="contained"
                                    color="primary"
                                    disabled={logining}
                                >
                                    {i18n.l('login')}
                                </Button>
                            </form>
                        </div>
                    </CardContent>
                </Card>
                <div className={classes.footer}>
                    <Footer />
                    <div className={classes.lang}>
                        <TextField select value={i18n.locale} onChange={this.onChangeLocale}>
                            {workspaceStore.supportedLocales.map((locale: string) => {
                                return (
                                    <MenuItem key={locale} value={locale}>
                                        {languages[locale]}
                                    </MenuItem>
                                );
                            })}
                        </TextField>
                    </div>
                </div>
            </div>
        );
    }
}

export default withStyles(makeStyles)(LoginView);
