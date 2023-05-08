/*
 * @file-created: 2023-03-22
 * @copyright 2023 - 2023, OneXas
 * @author: Dennis Chen
 */

import Link from '@mui/material/Link';
import createStyles from '@mui/styles/createStyles';
import withStyles from '@mui/styles/withStyles';
import Typography from '@mui/material/Typography';
import {
    SITE_COPY_RIGHT,
    SITE_NAME,
    SITE_URL,
    SITE_VERSION,
    SUPPORT_URL,
} from '@onexas/sphere/client/config';
import { AppContext } from '@onexas/sphere/client/context';
import { CssClass, CssStyle, Theme } from '@onexas/sphere/client/types';
import clsx from 'clsx';
import Color from 'color';
import React from 'react';
import { farEnvelope, fasGlobeAmericas, FontAwesomeIcon } from '@onexas/sphere/client/icons';

type CssRules<P> = {
    root: P;
    title: P;
    hlayout: P;
    item: P;
    contact: P;
    icon: P;
    thin: P;
    cr: P;
    ver: P;
};
type CssStyles = CssRules<CssStyle>;
type CssClasses = CssRules<CssClass>;

function makeStyles(theme: Theme) {
    const style: CssStyles = {
        root: {
            margin: theme.spacing(10, 'auto', 1),
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            justifyContent: 'end',
            flexWrap: 'wrap',
            [theme.breakpoints.down('sm')]: {
                display: 'block',
            },
        },
        thin: {
            margin: theme.spacing(0.5, 'auto', 0.5),
        },
        item: {
            margin: theme.spacing(1, 1, 0),
            [theme.breakpoints.down('sm')]: {
                marginLeft: theme.spacing(1),
            },
        },
        contact: {
            [theme.breakpoints.down('sm')]: {
                marginLeft: theme.spacing(3),
            },
        },
        title: {
            paddingRight: theme.spacing(8),
            borderRight: '1px solid',
            [theme.breakpoints.down('sm')]: {
                borderRight: 'none',
                marginLeft: theme.spacing(1),
            },
        },
        hlayout: {
            display: 'flex',
            alignItems: 'center',
        },
        icon: {
            margin: theme.spacing(1),
        },
        cr: {

        },
        ver: {

        }
    };
    return createStyles(style);
}

interface FooterProps {
    classes?: CssClasses;
    bgColor?: string;
    textColor?: string;
    thin?: boolean;
}

class Footer extends React.PureComponent<FooterProps> {
    static contextType = AppContext;
    declare context: React.ContextType<typeof AppContext>;

    render() {
        const { classes, bgColor, thin, textColor } = this.props;
        const {
            config,
            i18n,
            appTheme: { classes: cssClasses },
        } = this.context;
        const siteVer = config.get(SITE_VERSION);
        const siteName = config.get(SITE_NAME, 'OneXas');
        const siteUrl = config.get(SITE_URL);
        const siteUrlName = config.get(SITE_NAME);
        const supportUrl = config.get(SUPPORT_URL);
        const siteCopyRight = config.get(SITE_COPY_RIGHT);
        return (
            <footer
                className={clsx(classes.root, thin && classes.thin)}
                style={{
                    backgroundColor: bgColor || 'inheirt',
                    color: textColor ||  'inheirt',
                }}
            >


                {supportUrl && (<>
                    <Typography
                        variant="subtitle1"
                        className={clsx(classes.item, classes.contact, classes.title)}
                    >
                        {i18n.t.l('footer.wecanhelp')}
                    </Typography>

                    <Typography variant="body2" className={clsx(classes.item, classes.contact)}>
                        <Link
                            color="inherit"
                            href={supportUrl}
                            className={clsx(classes.hlayout, cssClasses.pamaMr2)}
                            target="_blank"
                        >
                            <FontAwesomeIcon
                                icon={farEnvelope}
                                className={classes.icon}
                                size="lg"
                            />{' '}
                            {i18n.t.l('footer.support')}
                        </Link>
                    </Typography>
                </>
                )}

                {siteUrl && (
                    <Typography variant="body2" className={clsx(classes.item, classes.contact)}>
                        <Link
                            color="inherit"
                            href={siteUrl}
                            className={clsx(classes.hlayout, cssClasses.pamaMr2)}
                            target="_blank"
                        >
                            <FontAwesomeIcon
                                icon={fasGlobeAmericas}
                                className={classes.icon}
                                size="lg"
                            />{' '}
                            {siteUrlName || siteUrl}
                        </Link>
                    </Typography>
                )}

                <Typography variant="body2" className={clsx(classes.item, classes.ver)}>
                    {`${siteVer}`}
                </Typography>

                <Typography variant="body2" className={clsx(classes.item, classes.cr)}>
                    {siteCopyRight
                        ? siteCopyRight
                        : `© ${new Date().getFullYear()}. ${siteName}. All Right Reserved.`}
                </Typography>
                
            </footer>
        );
    }
}

export default withStyles(makeStyles)(Footer);
