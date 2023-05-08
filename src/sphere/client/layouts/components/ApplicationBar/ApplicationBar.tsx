/*
 * @file-created: 2023-03-22
 * @copyright 2023 - 2023, OneXas
 * @author: Dennis Chen
 */

import AppsIcon from '@mui/icons-material/Apps';
import FilterListIcon from '@mui/icons-material/FilterList';
import MenuIcon from '@mui/icons-material/Menu';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import PersonIcon from '@mui/icons-material/Person';
import AppBar from '@mui/material/AppBar';
import Fade from '@mui/material/Fade';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import createStyles from '@mui/styles/createStyles';
import withStyles from '@mui/styles/withStyles';
import { MenuLogo } from '@onexas/sphere/client/assets/images';
import { FlexGrow } from '@onexas/sphere/client/components/FlexContainer';
import { APP_NAME } from '@onexas/sphere/client/config';
import { AppContext } from '@onexas/sphere/client/context';
import { FontAwesomeIcon } from '@onexas/sphere/client/icons';
import ApplinksPopover, { Applinks } from '@onexas/sphere/client/layouts/components/ApplinksPopover';
import NotificationSider from '@onexas/sphere/client/layouts/components/NotificationSider';
import { MenuStore, WorkspaceStore } from '@onexas/sphere/client/stores';
import { isWidthDown } from '@onexas/sphere/client/styles';
import { CssClass, CssStyle, ICONDEF_PREFIX, Theme } from '@onexas/sphere/client/types';
import clsx from 'clsx';
import Color from 'color';
import { makeObservable, observable } from 'mobx';
import { observer } from 'mobx-react';
import React from 'react';

type CssRules<P> = {
    appbar: P;
    appbarAnimate: P;
    appbarShift: P;
    appbarShiftAnimate: P;

    toolbar: P;
    title: P;

    menuButton: P;
    button: P;
    linkButton: P;
    buttonIcon: P;

    logo: P;

    searchField: P;

    applinksPopover: P;
    modulePaper: P;

    menuScrolledMask: P;
};
type CssStyles = CssRules<CssStyle>;
type CssClasses = CssRules<CssClass>;

function makeStyles(theme: Theme) {
    const { main: pmainColor, dark: pdarkColor } = theme.palette.primary;
    const { textColor, iconSize, minHeight } = theme.sphere.appbar;
    const bgColor = new Color(theme.sphere.appbar.bgColor);
    const { width: siderWidth, openWidth: siderOpenWidth, itemPadding } = theme.sphere.menuSider;
    const style: CssStyles = {
        appbar: {
            zIndex: theme.zIndex.drawer - 1,
            color: textColor,
            backgroundColor: bgColor.string(),
            borderBottom: `1px solid ${bgColor.lighten(0.4)}`
        },
        appbarAnimate: {
            // transition: theme.transitions.create(['width', 'margin'], {
            //     easing: theme.transitions.easing.sharp,
            //     duration: theme.transitions.duration.leavingScreen,
            // }),
        },
        appbarShift: {
            // marginLeft: siderOpenWidth,
            // width: `calc(100% - ${siderOpenWidth})`,
        },
        appbarShiftAnimate: {
            // transition: theme.transitions.create(['width', 'margin'], {
            //     easing: theme.transitions.easing.sharp,
            //     duration: theme.transitions.duration.enteringScreen,
            // }),
        },
        toolbar: {
            paddingRight: 0,
            paddingLeft: 0,
            minHeight: minHeight
        },
        title: {
            padding: theme.spacing(0, 3, 0, 1),
            [theme.breakpoints.down('sm')]: {
                display: 'none',
            },
            color: theme.palette.primary.main,
        },
        menuButton: {
            color: textColor,
            padding: theme.spacing(2),
            '&:hover': {
                backgroundColor: bgColor.lighten(0.2).string()
            }
        },
        button: {
            color: textColor,
            padding: theme.spacing(2),
            '&:hover': {
                backgroundColor: bgColor.lighten(0.2).string()
            }
        },
        linkButton: {
            color: textColor,
            position: "relative",
            minHeight: minHeight,
            paddingLeft: theme.spacing(0.5),
            paddingRight: theme.spacing(0.5),
            display: "flex",
            '&:hover': {
                backgroundColor: pmainColor
            },
            '& .MuiIconButton-root:hover': {
                backgroundColor: 'transparent'
            },
            '&.selected': {
                backgroundColor: pdarkColor,
                '&::after': {
                    borderTop: `7px solid ${textColor}`,
                }
            },
            '&::after': {
                borderLeft: "7px solid transparent",
                borderRight: "7px solid transparent",
                width: 0,
                height: 0,
                position: "absolute",
                left: "50%",
                top: 0,
                transform: "translate(-50%, 0%)",
                content: "\"\""
            },

        },
        buttonIcon: {
            width: iconSize,
            height: iconSize,
            color: textColor
        },
        logo: {
            height: iconSize,
            minWidth: iconSize,
            margin: theme.spacing(0, 2),
            backgroundImage: `url(${MenuLogo})`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            backgroundSize: 'contain',

        },
        searchField: {
            margin: theme.spacing(1),
            '& input': {
                padding: theme.spacing(1),
            },
            backgroundColor: theme.palette.background.default,
            [theme.breakpoints.down('sm')]: {
                width: theme.spacing(18),
            },
        },
        applinksPopover: {},
        modulePaper: {
            padding: theme.spacing(2),
        },
        menuScrolledMask: {
            position: 'absolute',
            top: 0,
            left: 0,
            backgroundColor: new Color("#fff").alpha(0.2).string(),
            height: '100%',
            width: '100%',
            //allow click through
            pointerEvents: "none"
        },
    };
    return createStyles(style);
}

interface ApplicationBarProps {
    classes?: CssClasses;
    title?: string;
    workspaceStore: WorkspaceStore;
    menuStore: MenuStore;
}

@observer
class ApplicationBar extends React.PureComponent<ApplicationBarProps> {
    static contextType = AppContext;
    declare context: React.ContextType<typeof AppContext>;

    private applinksPopoverAnchorElm: HTMLElement;

    @observable
    notificationSiderOpen?: boolean;

    @observable
    applinksPopoverOpen?: boolean;


    applinks: Applinks;

    constructor(props: ApplicationBarProps) {
        super(props);
        makeObservable(this);
    }

    onToggleNotificationSider = () => {
        this.notificationSiderOpen = !this.notificationSiderOpen;
    };

    onCloseNotificationSider = () => {
        this.notificationSiderOpen = false;
    };

    onOpenApplinksPopover = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
        this.applinksPopoverAnchorElm = event.currentTarget;
        this.applinksPopoverOpen = true;
    };

    onCloseApplinksPopover = () => {
        this.applinksPopoverAnchorElm = null;
        this.applinksPopoverOpen = false;
    };

    onToggleMenu = () => {
        let { menuStore } = this.props;
        menuStore.open = !menuStore.open;
        menuStore.animate = true;
    };

    render() {
        const {
            classes,
            menuStore: {
                open: menuOpen,
                scrolled: menuScrolled,
                visible: menuVisible,
                animate: menuAnimate,
            },
            workspaceStore,
        } = this.props;

        const { i18n, storeHolder, config, appTheme: { theme } } = this.context;

        const { applinksPopoverAnchorElm } = this;
        const { applinksPopoverOpen, notificationSiderOpen } = this;
        let { applinks } = this;

        let title = this.props.title;

        if (!title) {
            title = i18n.l(config.get(APP_NAME));
        }

        let smDown = isWidthDown('sm', theme);

        if (!applinks) {
            this.applinks = applinks = new Applinks(this.context);
        }
        const { iconSize } = theme.sphere.appbar;

        const location = workspaceStore.windowLocation;

        let hitLink = applinks.onbarLinks.reduce((pre, curr) => {
            if (curr.href && location?.pathname && (location.pathname.startsWith(curr.href) || curr.altHerfs?.some((href) => location.pathname.startsWith(href)))) {
                if (!pre || pre.href.length < curr.href.length) {
                    return curr;
                }
            }
            return pre;
        }, undefined)
        return <>
            <AppBar
                elevation={0}
                className={clsx(
                    clsx(classes.appbar, menuAnimate && classes.appbarAnimate),
                    menuVisible &&
                    menuOpen &&
                    !smDown &&
                    clsx(classes.appbarShift, menuAnimate && classes.appbarShiftAnimate)
                )}
            >
                <Toolbar className={classes.toolbar}>
                    {menuVisible &&
                        <IconButton className={classes.menuButton} onClick={this.onToggleMenu} size="large">
                            {menuOpen ? <MenuOpenIcon fontSize='inherit' className={classes.buttonIcon} /> : <MenuIcon fontSize='inherit' className={classes.buttonIcon} />}
                        </IconButton>
                    }
                    <div className={classes.logo} />
                    <Typography variant="h6" noWrap className={classes.title}>
                        {i18n.l(title)}
                    </Typography>
                    {applinks.onbarLinks.map((e, idx) => {
                        return (
                            <div key={idx} className={clsx(classes.linkButton, hitLink === e ? "selected" : '')}>
                                <IconButton
                                    title={e.name}
                                    onClick={(evt) => {
                                        if (e.href.startsWith('/')) {
                                            workspaceStore.reroute(e.href, evt);
                                        } else {
                                            workspaceStore.redirect(e.href, evt);
                                        }
                                    }}
                                    size="large">
                                    {(() => {
                                        const { image } = e;
                                        if (image.startsWith(ICONDEF_PREFIX)) {
                                            try {
                                                const definition = JSON.parse(image.substring(ICONDEF_PREFIX.length));
                                                return <FontAwesomeIcon icon={definition} className={classes.buttonIcon} style={{ width: iconSize, height: iconSize }} />
                                            } catch (e) {
                                                console.error(e)
                                            }
                                        }
                                        return <img className={classes.buttonIcon} src={e.image} />
                                    })()}
                                </IconButton>
                            </div>
                        );
                    })}
                    <FlexGrow />
                    <Fade in={workspaceStore.anyFilterObserver} unmountOnExit>
                        <TextField
                            placeholder={i18n.l('filter')}
                            type="search"
                            variant="outlined"
                            margin="dense"
                            className={classes.searchField}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <FilterListIcon />
                                    </InputAdornment>
                                ),
                            }}
                            value={workspaceStore.filter}
                            onChange={(e) => {
                                workspaceStore.filter = e.target.value;
                            }}
                            autoComplete="off"
                        />
                    </Fade>
                    {applinks.links.length > applinks.onbarLinks.length && <IconButton
                        className={classes.button}
                        onClick={this.onOpenApplinksPopover}
                        size="large">
                        <AppsIcon fontSize='inherit' />
                    </IconButton>}
                    <IconButton
                        className={classes.button}
                        onClick={this.onToggleNotificationSider}
                        size="large">
                        <PersonIcon fontSize='inherit' />
                    </IconButton>
                    {menuScrolled && (
                        <div className={classes.menuScrolledMask}></div>
                    )}
                </Toolbar>
                <ApplinksPopover
                    open={applinksPopoverOpen}
                    anchorElm={applinksPopoverAnchorElm}
                    onClose={this.onCloseApplinksPopover}
                    workspaceStore={workspaceStore}
                ></ApplinksPopover>
            </AppBar>
            <NotificationSider
                open={notificationSiderOpen}
                onClose={this.onCloseNotificationSider}
                workspaceStore={workspaceStore}
            />
        </>;
    }
}
export default withStyles(makeStyles)(ApplicationBar);
