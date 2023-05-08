/*
 * @file-created: 2023-03-22
 * @copyright 2023 - 2023, OneXas
 * @author: Dennis Chen
 */

import AppBar from '@mui/material/AppBar';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import createStyles from '@mui/styles/createStyles';
import withStyles from '@mui/styles/withStyles';
import { FlexGrow } from '@onexas/sphere/client/components/FlexContainer';
import { AppContext } from '@onexas/sphere/client/context';
import {
    fasCheckCircle,
    fasExclamationCircle,
    fasExclamationTriangle,
    fasIdCard,
    fasInfoCircle, fasSignInAlt, fasSignOutAlt, FontAwesomeIcon
} from '@onexas/sphere/client/icons';
import { PATH_LOGIN, PATH_MY_ACCOUNT } from '@onexas/sphere/client/routes';
import { WorkspaceStore } from '@onexas/sphere/client/stores';
import { CssClass, CssStyle, MessageLevel, Theme } from '@onexas/sphere/client/types';
import { fromNow } from '@onexas/sphere/client/utils/datetime';
import clsx from 'clsx';
import Color from 'color';
import { observer } from 'mobx-react';
import React from 'react';

type CssRules<P> = {
    root: P;
    appbar: P;
    toolbar: P;
    drawerPaper: P;
    drawerPaperClose: P;
    container: P;
    msgIcon: P;
    msgText: P;
};
type CssStyles = CssRules<CssStyle>;
type CssClasses = CssRules<CssClass>;

function makeStyles(theme: Theme) {
    const dark = theme.palette.mode === 'dark';
    const bgColor = new Color(theme.sphere.portal.bgColor);
    const siderWidth = theme.sphere.notificationSider.width;
    const { minHeight } = theme.sphere.appbar;
    const style: CssStyles = {
        root: {},
        appbar: {
            position: 'relative',
            backgroundColor: theme.palette.secondary.main,
            color: theme.palette.secondary.contrastText,
        },
        toolbar: {
            paddingLeft: theme.spacing(1),
            paddingRight: theme.spacing(1),
            minHeight: minHeight,
            '& .MuiTypography-root': {
                margin: theme.spacing(0, 1),
            },
        },
        drawerPaper: {
            zIndex: theme.zIndex.drawer + 2,//higher than appbar
            whiteSpace: 'nowrap',
            width: siderWidth,
            backgroundColor: dark ? '#000' : '#fff',
            transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
            }),
        },
        drawerPaperClose: {
            overflowX: 'hidden',
            transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
            }),
            width: 0,
        },
        container: {
            backgroundColor: bgColor.string(),
            height: '100%'
        },
        msgIcon: {
            minWidth: 32,
            alignSelf: 'start',
        },
        msgText: {
            alignSelf: 'start',
            overflow: 'hidden',
            marginTop: 0,
            '&:hover': {
                whiteSpace: 'normal',
                overflow: 'normal',
            },
        },
    };
    return createStyles(style);
}

interface NotificationSiderProps {
    classes?: CssClasses;
    open: boolean;
    onClose: () => void;
    workspaceStore: WorkspaceStore;
}

@observer
class NotificationSider extends React.PureComponent<NotificationSiderProps> {
    static contextType = AppContext;
    declare context: React.ContextType<typeof AppContext>;

    onClickMyAccount = (evt: React.MouseEvent) => {
        this.props.onClose();
        this.props.workspaceStore.reroute(PATH_MY_ACCOUNT, evt);
    };

    onClickLogin = (evt: React.MouseEvent) => {
        this.props.onClose();
        this.props.workspaceStore.reroute(PATH_LOGIN, evt);
    };

    onClickLogout = (evt: React.MouseEvent) => {
        this.props.workspaceStore.logout();
    };

    render() {
        const {
            classes,
            open,
            onClose,
            workspaceStore: {
                authentication,
                messages,
                preferredTimezone,
                preferredTimeFormat,
                preferredDateFormat,
            },
        } = this.props;
        const {
            i18n,
            appTheme: { classes: cssClasses },
        } = this.context;
        return open ? (
            <Drawer
                anchor="right"
                classes={{
                    paper: clsx(classes.drawerPaper, !open && classes.drawerPaperClose),
                }}
                className={classes.root}
                open
                onClose={onClose}
            >
                <div className={classes.container}>
                    <AppBar elevation={0} className={classes.appbar}>
                        <Toolbar className={classes.toolbar}>
                            <FlexGrow />
                            {authentication && (
                                <Typography variant="body1">
                                    {i18n.l('msg.sayHi', {
                                        name: authentication.displayName,
                                    })}
                                </Typography>
                            )}
                        </Toolbar>
                    </AppBar>
                    <Divider />
                    <List>
                        {authentication && <><ListItem button onClick={this.onClickMyAccount}>
                            <ListItemIcon>
                                <FontAwesomeIcon icon={fasIdCard} size="lg" />
                            </ListItemIcon>
                            <ListItemText primary={i18n.l('myAccount')} />
                        </ListItem>
                            <ListItem button onClick={this.onClickLogout}>
                                <ListItemIcon>
                                    <FontAwesomeIcon icon={fasSignOutAlt} size="lg" />
                                </ListItemIcon>
                                <ListItemText primary={i18n.l('logout')} />
                            </ListItem></>}
                        {!authentication && <ListItem button onClick={this.onClickLogin}>
                            <ListItemIcon>
                                <FontAwesomeIcon icon={fasSignInAlt} size="lg" />
                            </ListItemIcon>
                            <ListItemText primary={i18n.l('login')} />
                        </ListItem>
                        }
                    </List>
                    <Divider />
                    <List dense={true}>
                        <ListSubheader>{i18n.l('recentMessages')}</ListSubheader>
                        {messages
                            .slice()
                            .reverse()
                            .map((m, i) => {
                                let clz = cssClasses.statusUnknown;
                                switch (m.level) {
                                    case MessageLevel.Info:
                                        clz = cssClasses.statusInfo;
                                        break;
                                    case MessageLevel.Success:
                                        clz = cssClasses.statusPassed;
                                        break;
                                    case MessageLevel.Warning:
                                        clz = cssClasses.statusWarn;
                                        break;
                                    case MessageLevel.Error:
                                        clz = cssClasses.statusError;
                                        break;
                                }
                                return (
                                    <ListItem button key={i}>
                                        <ListItemIcon className={clsx(classes.msgIcon, clz)}>
                                            <FontAwesomeIcon
                                                size="lg"
                                                icon={(() => {
                                                    switch (m.level) {
                                                        case MessageLevel.Info:
                                                            return fasInfoCircle;
                                                        case MessageLevel.Success:
                                                            return fasCheckCircle;
                                                        case MessageLevel.Warning:
                                                            return fasExclamationTriangle;
                                                        case MessageLevel.Error:
                                                            return fasExclamationCircle;
                                                    }
                                                })()}
                                            />
                                        </ListItemIcon>
                                        <ListItemText
                                            className={classes.msgText}
                                            primary={m.text}
                                            secondary={fromNow(
                                                m.timestamp,
                                                preferredTimeFormat,
                                                preferredDateFormat,
                                                preferredTimezone,
                                                i18n
                                            )}
                                        />
                                    </ListItem>
                                );
                            })}
                    </List>
                </div>
            </Drawer>
        ) : (
            <div />
        );
    }
}

export default withStyles(makeStyles)(NotificationSider);
