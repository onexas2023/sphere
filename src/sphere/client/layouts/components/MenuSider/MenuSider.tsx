/*
 * @file-created: 2023-03-22
 * @copyright 2023 - 2023, OneXas
 * @author: Dennis Chen
 */
import MenuIcon from '@mui/icons-material/Menu';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import AppBar from '@mui/material/AppBar';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import createStyles from '@mui/styles/createStyles';
import withStyles from '@mui/styles/withStyles';
import { AppContext } from '@onexas/sphere/client/context';
import { FontAwesomeIcon, FontAwesomeIconProp } from '@onexas/sphere/client/icons';
import { Menu } from '@onexas/sphere/client/menus';
import { BreadcrumbStore, MenuStore, WorkspaceStore } from '@onexas/sphere/client/stores';
import { isDarkTheme, isWidthDown } from '@onexas/sphere/client/styles';
import { CssClass, CssStyle, hasWindow, Theme } from '@onexas/sphere/client/types';
import { typeOfFunction, typeOfString } from '@onexas/sphere/client/utils/object';
import clsx from 'clsx';
import Color from 'color';
import { observer } from 'mobx-react';
import React from 'react';

type CssRules<P> = {
    root: P;
    drawerPaper: P;
    drawerPaperShift: P;
    container: P;
    appbar: P;
    toolbar: P;
    toolbarButtonIcon: P;
    menuButton: P;
    list: P;
};
type CssStyles = CssRules<CssStyle>;
type CssClasses = CssRules<CssClass>;

function makeStyles(theme: Theme) {
    const {
        width: siderWidth,
        openWidth: siderOpenWidth,
        iconSize,
        itemPadding,
    } = theme.sphere.menuSider;
    const bgColor = new Color(theme.sphere.portal.bgColor);
    const pmColor = new Color(theme.palette.primary.main);
    const { textColor: appbarTextColor, iconSize: appbarIconSize, minHeight: appbarMinHeight } = theme.sphere.appbar;
    const appbarBgColor = new Color(theme.sphere.appbar.bgColor);

    const dark = isDarkTheme(theme);

    const style: CssStyles = {
        root: {
        },
        drawerPaper: {
            position: 'relative',
            overflowX: 'hidden',
            whiteSpace: 'nowrap',
            backgroundColor: dark ? '#000' : '#fff',
            [theme.breakpoints.up('sm')]: {
                zIndex: theme.zIndex.drawer - 2,
            },
            transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
            }),
            width: siderWidth,
            minHeight: '100vh',
            '& .MuiDivider-root': {
                height: '1px',
            },
        },
        drawerPaperShift: {
            width: siderOpenWidth,
            transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
            })
        },
        container: {
            backgroundColor: bgColor.string(),
            height: '100%'
        },
        appbar: {
            position: 'relative',
            color: appbarTextColor,
            backgroundColor: appbarBgColor.string(),
            borderBottom: `1px solid ${appbarBgColor.lighten(0.4)}`
        },
        toolbar: {
            paddingRight: 0,
            paddingLeft: 0,
            minHeight: appbarMinHeight,
        },
        toolbarButtonIcon: {
            width: appbarIconSize,
            height: appbarIconSize,
            color: appbarTextColor
        },
        menuButton: {
            color: appbarTextColor,
            padding: theme.spacing(2),
            '&:hover': {
                backgroundColor: bgColor.lighten(0.2).string()
            }
        },
        list: {
            padding: theme.spacing(0.5, 0, 0.5),
            '&.open': {
                paddingBottom: 0,
                '& .MuiListItemIcon-root': {
                    minWidth: theme.spacing(7),
                }
            },
            '& .MuiListSubheader-root': {
                lineHeight: theme.spacing(6),
                backgroundColor: dark ? '#ffffff10' : '#00000010'
            },
            '& .MuiListItem-root': {
                paddingLeft: itemPadding,
                paddingRight: itemPadding
            },
            '& .MuiListItemIcon-root': {
                minWidth: 0,
                '& svg': {
                    fontSize: iconSize,
                },
            },
            '& .MuiListItem-root .MuiListItemIcon-root': {
                color: theme.palette.text.primary,
            },
            '& .MuiListItem-root:hover': {
                color: theme.sphere.portal.textColor,
                backgroundColor: pmColor.lighten(0.2).string(),
            },
            '& .MuiListItem-root:hover .MuiListItemIcon-root': {
                color: 'inherit',
            },
            '& .MuiListItem-root.Mui-selected': {
                backgroundColor: pmColor.string(),
                color: theme.palette.text.primary,
            },
            '& .MuiListItem-root.Mui-selected .MuiListItemIcon-root': {
                color: 'inherit',
            },
            '& .MuiListItem-root.Mui-selected:hover': {
                backgroundColor: pmColor.darken(0.2).string(),
            },
        }
    };
    return createStyles(style);
}

interface MenuSiderProps {
    classes?: CssClasses;
    workspaceStore: WorkspaceStore;
    menuStore: MenuStore;
    breadcrumbStore: BreadcrumbStore;
}

@observer
class MenuSider extends React.PureComponent<MenuSiderProps> {
    static contextType = AppContext;
    declare context: React.ContextType<typeof AppContext>;

    private paperRef: React.RefObject<any>;
    private mo: MutationObserver;

    constructor(props: MenuSiderProps) {
        super(props);
        this.paperRef = React.createRef();
    }

    componentDidMount() {
        if (hasWindow) {
            window.addEventListener('scroll', this.onCalculateHeight);
            window.addEventListener('resize', this.onCalculateHeight);
            const doms = document.getElementsByClassName(this.context.appTheme.classes.layoutMain);
            const dom = doms && doms.length && (doms[0] as any).parentElement;
            if (MutationObserver && dom) {
                this.mo = new MutationObserver((m) => {
                    this.onCalculateHeight();
                });
                this.mo.observe(dom, {
                    childList: true,
                    subtree: true,
                });
            } else {
                window.addEventListener('DOMSubtreeModified', this.onCalculateHeight);
            }
        }
    }

    componentWillUnmount() {
        if (hasWindow) {
            window.removeEventListener('scroll', this.onCalculateHeight);
            window.removeEventListener('resize', this.onCalculateHeight);
            if (this.mo) {
                this.mo.disconnect();
                this.mo = null;
            } else {
                window.removeEventListener('DOMSubtreeModified', this.onCalculateHeight);
            }
        }
    }

    onOpen = () => {
        this.props.menuStore.open = true;
        this.props.menuStore.animate = true;
    };
    onClose = () => {
        let { menuStore } = this.props;
        menuStore.open = false;
        menuStore.animate = true;
    };
    onToggleMenu = () => {
        let { menuStore } = this.props;
        menuStore.open = !menuStore.open;
        menuStore.animate = true;
    };

    onCalculateHeight = () => {
        if (this.paperRef.current !== null) {
            const doms = document.getElementsByClassName(this.context.appTheme.classes.layoutSkeleton);
            if (doms && doms.length) {
                let dom = (doms[0] as any);
                if (dom && dom.scrollHeight) {
                    if (document.body.offsetHeight > dom.scrollHeight) {
                        this.paperRef.current.style.height = null;
                    } else {
                        this.paperRef.current.style.height = dom.scrollHeight + 'px';
                    }
                }
            }
        }
        this.props.menuStore.scrolled = document.documentElement.scrollTop > 0;
    };

    render() {
        const {
            classes,
            menuStore: { mergedGroups, open, visible, scrolled },
            workspaceStore,
            breadcrumbStore: { crumbs },
        } = this.props;
        const {
            i18n,
            storeHolder,
            appTheme: { classes: cssClasses, theme },
        } = this.context;
        let anyGroupOut = false;
        let smDown = isWidthDown('sm', theme);
        let locationPath = hasWindow && window.location.pathname;

        //find best path match
        let bestPathMatch: string;
        const curmbsPaths = new Set<string>(
            crumbs
                .map((c) => {
                    let { action: crumbsAction } = c;
                    let action: any;
                    if (typeOfFunction(crumbsAction)) {
                        action = crumbsAction(storeHolder, i18n);
                    } else {
                        action = crumbsAction;
                    }
                    if (typeOfString(action)) {
                        return action;
                    }
                })
                .filter((a) => a)
        );
        if (locationPath || curmbsPaths.size > 0) {
            mergedGroups.forEach((group) => {
                const { menus } = group;
                if (menus) {
                    const staticMenus: Menu[] = [];
                    menus.forEach((m) => {
                        if (typeOfFunction(m)) {
                            staticMenus.push(...m(storeHolder, i18n));
                        } else {
                            staticMenus.push(m);
                        }
                    });
                    staticMenus.forEach((menu) => {
                        let { action: menuAction } = menu;
                        let action: any;
                        if (typeOfFunction(menuAction)) {
                            action = menuAction(storeHolder, i18n);
                        } else {
                            action = menuAction;
                        }
                        if (typeOfString(action)) {
                            const path = action;
                            if (
                                (locationPath.startsWith(path) || curmbsPaths.has(path)) &&
                                (!bestPathMatch || bestPathMatch.length < path.length)
                            ) {
                                bestPathMatch = path;
                            }
                        }
                    });
                }
            });
        }
        return (
            <nav>
                {!visible ? (
                    <span />
                ) : (
                    <Drawer
                        variant={smDown ? 'temporary' : 'permanent'}
                        className={classes.root}
                        PaperProps={{ ref: this.paperRef }}
                        classes={{
                            paper: clsx(classes.drawerPaper, open && classes.drawerPaperShift),
                        }}
                        open={open}
                        onClose={smDown ? this.onClose : null}
                    >
                        <div className={classes.container}>
                            <AppBar elevation={0} className={classes.appbar}>
                                <Toolbar className={classes.toolbar}>
                                    <IconButton className={classes.menuButton} onClick={this.onToggleMenu} size="large">
                                        {open ? <MenuOpenIcon fontSize='inherit' className={classes.toolbarButtonIcon} /> : <MenuIcon fontSize='inherit' className={classes.toolbarButtonIcon} />}
                                    </IconButton>
                                </Toolbar>
                            </AppBar>



                            {mergedGroups.map((group, index, groups) => {
                                const { name, label: groupLabel, menus } = group;
                                if (!menus || menus.length === 0) {
                                    return null;
                                }
                                return (() => {
                                    const staticMenus: Menu[] = [];
                                    menus.forEach((m) => {
                                        if (typeOfFunction(m)) {
                                            staticMenus.push(...m(storeHolder, i18n));
                                        } else {
                                            staticMenus.push(m);
                                        }
                                    });

                                    const menuItems = staticMenus
                                        .map((menu, index) => {
                                            let menuIconComponent = menu.IconComponent;
                                            let iconComponent: any;
                                            if (typeOfFunction(menuIconComponent)) {
                                                iconComponent = menuIconComponent(storeHolder, i18n);
                                            } else {
                                                iconComponent = menuIconComponent;
                                            }

                                            let visible = menu.visible;
                                            if (!open && !iconComponent) {
                                                return null;
                                            }
                                            if (typeOfFunction(visible)) {
                                                visible = visible();
                                            }

                                            let { action: menuAction } = menu;
                                            let action: any;
                                            if (typeOfFunction(menuAction)) {
                                                action = (menuAction as Function)(storeHolder, i18n);
                                            } else {
                                                action = menuAction;
                                            }

                                            if (!visible || !action) {
                                                return null;
                                            }

                                            let icon = null;
                                            if (iconComponent) {
                                                if (typeOfString(iconComponent)) {
                                                    //TODO support image
                                                } else {
                                                    if (
                                                        iconComponent['prefix'] &&
                                                        iconComponent['iconName'] &&
                                                        iconComponent['icon']
                                                    ) {
                                                        let definition = iconComponent as FontAwesomeIconProp;
                                                        icon = (
                                                            <FontAwesomeIcon
                                                                icon={definition}
                                                                size="lg"
                                                            />
                                                        );
                                                    } else {
                                                        let Icon = iconComponent as React.ComponentType;
                                                        icon = <Icon />;
                                                    }
                                                }
                                            }
                                            let selected = false;

                                            if (typeOfString(action)) {
                                                const path = action;
                                                if (bestPathMatch === path) {
                                                    selected = true;
                                                }
                                                action = () => {
                                                    return path;
                                                };
                                            }

                                            const onClick = (evt: React.MouseEvent) => {
                                                const path = (action as Function)();
                                                if (smDown) {
                                                    this.onClose();
                                                }
                                                if (typeOfString(path)) {
                                                    if (path.startsWith('/')) {
                                                        workspaceStore.reroute(path, evt);
                                                    } else {
                                                        workspaceStore.redirect(path, evt);
                                                    }
                                                }
                                            };
                                            let { label: menuLabel } = menu;
                                            let label: any;
                                            if (typeOfFunction(menuLabel)) {
                                                label = menuLabel(storeHolder, i18n);
                                            } else {
                                                label = menuLabel;
                                            }

                                            label = i18n.l(label);

                                            const item = (
                                                <ListItem
                                                    button
                                                    key={index}
                                                    onClick={onClick}
                                                    selected={selected}
                                                >
                                                    <ListItemIcon>{icon}</ListItemIcon>
                                                    {open && <ListItemText
                                                        primary={label}
                                                        primaryTypographyProps={{
                                                            className: cssClasses.textEllipsis,
                                                        }}
                                                    />}
                                                </ListItem>
                                            );

                                            return open ? (
                                                item
                                            ) : (
                                                <Tooltip key={index} title={label} placement="right">
                                                    {item}
                                                </Tooltip>
                                            );
                                        })
                                        .filter((i) => i);

                                    if (menuItems.length === 0) {
                                        return null;
                                    }

                                    const ago = anyGroupOut;
                                    anyGroupOut = true;

                                    let label: any;
                                    if (typeOfFunction(groupLabel)) {
                                        label = groupLabel(storeHolder, i18n);
                                    } else {
                                        label = groupLabel;
                                    }

                                    return (
                                        <React.Fragment key={name}>
                                            {!open && ago && <Divider />}
                                            <List className={clsx(classes.list, open && 'open')} disablePadding>
                                                {open && label && (
                                                    <ListSubheader className={cssClasses.textEllipsis}>
                                                        {i18n.l(label)}
                                                    </ListSubheader>
                                                )}
                                                {menuItems}
                                            </List>
                                        </React.Fragment>
                                    );
                                })();
                            })}
                        </div>
                    </Drawer>
                )}
            </nav>
        );
    }
}
export default withStyles(makeStyles)(MenuSider);
