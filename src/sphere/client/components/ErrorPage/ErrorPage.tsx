/*
 * @file-created: 2023-03-22
 * @copyright 2023 - 2023, OneXas
 * @author: Dennis Chen
 */

import { CssClass, CssStyle, I18n, Theme } from '@onexas/sphere/client/types';
// import { BackgroundDarkImage, BackgroundLightImage } from '@onexas/sphere/client/styles';
import Container from '@mui/material/Container';
import createStyles from '@mui/styles/createStyles';
import withStyles from '@mui/styles/withStyles';
import Typography from '@mui/material/Typography';
import React from 'react';

const Img401 = require('./401.png');
const Img403 = require('./403.png');
const Img404 = require('./404.png');
const Img500 = require('./500.png');

type CssRules<P> = {
    root: P;
    container: P;
    title: P;
    description: P;
    image: P;
};
type CssStyles = CssRules<CssStyle>;
type CssClasses = CssRules<CssClass>;

export function makeStyles(theme: Theme) {
    const sc: CssStyles = {
        root: {
            // background: `url(${
            //     theme.palette.mode === 'dark' ? BackgroundDarkImage : BackgroundLightImage
            // }) no-repeat top 0px left 0px`,
            backgroundSize: 'cover',
            minHeight: '50vh',
            width: '100%',
        },
        container: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            paddingTop: theme.spacing(20),
            paddingBottom: theme.spacing(20),
        },
        title: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: theme.spacing(4),
        },
        description: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '5px 0px',
            fontWeight: 400,
        },
        image: {},
    };
    return createStyles(sc);
}

export const ERROR_CODE_401 = 401;
export const ERROR_CODE_403 = 403;
export const ERROR_CODE_404 = 404;
export const ERROR_CODE_500 = 500;

interface ErrorPageProps {
    staticContext?: any;
    classes?: CssClasses;
    code: number;
    title: string;
    description: string;
    children?: React.ReactNode;
}

class ErrorPageInner extends React.PureComponent<ErrorPageProps> {
    // The picture is only temporarily placed, and it must be changed in the future.
    renderErrorImage = () => {
        const { code, classes } = this.props;
        if (code === 401) {
            return <img src={Img401} className={classes.image} />;
        } else if (code === 403) {
            return <img src={Img403} className={classes.image} />;
        } else if (code === 404) {
            return <img src={Img404} className={classes.image} />;
        } else if (code === 500) {
            return <img src={Img500} className={classes.image} />;
        } else {
            return;
        }
    };

    render() {
        const { title, description, classes, children } = this.props;
        return (
            <div className={classes.root}>
                <Container maxWidth="md" className={classes.container}>
                    {this.renderErrorImage()}
                    <Typography variant="h4" display="block" className={classes.title}>
                        {title}
                    </Typography>
                    <Typography variant="subtitle2" display="block" className={classes.description}>
                        {description}
                    </Typography>
                    {children}
                </Container>
            </div>
        );
    }
}
const ErrorPage = withStyles(makeStyles)(ErrorPageInner);
export default ErrorPage;

export function NoPermissionPage(props: { i18n: I18n; title?: string; description?: string }) {
    const { i18n, description, title } = props;
    return (
        <ErrorPage
            code={ERROR_CODE_403}
            title={title || i18n.l('msg.noPermission')}
            description={description || i18n.l('msg.noPermissionHint')}
        ></ErrorPage>
    );
}

export function NotFoundPage(props: { i18n: I18n; title?: string; description?: string }) {
    const { i18n, description, title } = props;
    return (
        <ErrorPage
            code={ERROR_CODE_404}
            title={title || i18n.l('msg.pageNotFound')}
            description={description || i18n.l('msg.pageNotFoundHint')}
        ></ErrorPage>
    );
}

export function InternalErrorPage(props: { i18n: I18n; title?: string; description?: string }) {
    const { i18n, description, title } = props;
    return (
        <ErrorPage
            code={ERROR_CODE_403}
            title={title || i18n.l('msg.internalError')}
            description={description || i18n.l('msg.internalErrorHint')}
        ></ErrorPage>
    );
}
