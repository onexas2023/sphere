/*
 * @file-created: 2023-03-22
 * @copyright 2023 - 2023, OneXas
 * @author: Dennis Chen
 */

import ButtonBase from '@mui/material/ButtonBase';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Popover from '@mui/material/Popover';
import { ICONDEF_PREFIX, Theme } from '@onexas/sphere/client/types';
import createStyles from '@mui/styles/createStyles';
import withStyles from '@mui/styles/withStyles';
import Typography from '@mui/material/Typography';
import { APPLINKS } from '@onexas/sphere/client/config';
import { AppContext } from '@onexas/sphere/client/context';
import { WorkspaceStore } from '@onexas/sphere/client/stores';
import { CssClass, CssStyle } from '@onexas/sphere/client/types';
import clsx from 'clsx';
import React from 'react';
import { Applinks } from './Applinks';
import Color from 'color';
import { FontAwesomeIcon } from '@onexas/sphere/client/icons';

type CssRules<P> = {
    container: P;
    paper: P;
    linkCard: P;
    linkName: P;
    linkImage: P;
    linkNoImage: P;
};
type CssStyles = CssRules<CssStyle>;
type CssClasses = CssRules<CssClass>;

function makeStyles(theme: Theme) {
    const bgColor = new Color(theme.sphere.appbar.bgColor);
    const bgLightenColor = bgColor.lighten(0.4).string();
    const { textColor } = theme.sphere.appbar;
    // const applinksPopoverWidth = theme.sphere.applinksPopover.width;
    const tilesSize = theme.sphere.applinksPopover.tilesSize;
    const imageSize = theme.sphere.applinksPopover.imageSize;
    const style: CssStyles = {
        container: {
            padding: theme.spacing(1),
            maxWidth: theme.breakpoints.values.sm,
            color: textColor,
            backgroundColor: bgColor.string()
        },
        paper: {
            padding: theme.spacing(1),
            backgroundColor: bgLightenColor
        },
        linkCard: {
            backgroundColor: 'transparent',
            width: tilesSize,
            height: tilesSize,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            margin: 0,
            padding: theme.spacing(1),
            cursor: 'pointer',
            '&:hover': {
                backgroundColor: bgLightenColor,
            },
        },
        linkImage: {
            width: imageSize,
            height: imageSize,
            color: textColor
        },
        linkNoImage: {
            backgroundColor: bgLightenColor,
        },
        linkName: {
            height: tilesSize - imageSize,
            margin: 0,
            padding: 0,
            marginTop: theme.spacing(0.5),
            width: '100%',
            overflow: 'hidden',
            color: textColor
        },
    };
    return createStyles(style);
}

interface ApplinksPopoverProps {
    classes?: CssClasses;
    open?: boolean;
    anchorElm?: null | Element | ((element: Element) => Element);
    onClose: () => void;
    workspaceStore: WorkspaceStore;
    applinks?: Applinks;
}

class ApplinksPopover extends React.PureComponent<ApplinksPopoverProps> {
    static contextType = AppContext;
    declare context: React.ContextType<typeof AppContext>;

    render() {
        const { classes, open, anchorElm, onClose, workspaceStore, applinks } = this.props;
        const { appTheme: { theme } } = this.context;
        const { imageSize } = theme.sphere.applinksPopover;
        const links = open ? applinks?.links || new Applinks(this.context).links : [];
        return open ? (
            <Popover
                classes={{
                    paper: classes.paper,
                }}
                open={true}
                anchorEl={anchorElm}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                }}
                onClose={onClose}
            >
                <Container className={classes.container}>
                    <Grid container spacing={1}>
                        {links.map((e, i, array) => {
                            let xs: any = 6,
                                sm: any = 3;
                            switch (array.length) {
                                case 1:
                                    xs = sm = 12;
                                    break;
                                case 2:
                                    sm = 6;
                                    break;
                                case 3:
                                    sm = 4;
                                    break;
                                default:
                            }
                            return (
                                <Grid container item xs={xs} sm={sm} key={i} justifyContent="space-around">
                                    <ButtonBase>
                                        <Paper
                                            className={classes.linkCard}
                                            elevation={0}
                                            onClick={e.href ? (evt: React.MouseEvent) => {
                                                if (e.href.startsWith('/')) {
                                                    workspaceStore.reroute(e.href, evt);
                                                } else {
                                                    workspaceStore.redirect(e.href, evt);
                                                }
                                            } : undefined}
                                        >

                                            {(() => {
                                                const { image } = e;
                                                if (image?.startsWith(ICONDEF_PREFIX)) {
                                                    try {
                                                        const definition = JSON.parse(image.substring(ICONDEF_PREFIX.length));
                                                        return <FontAwesomeIcon icon={definition} className={classes.linkImage} style={{ width: imageSize, height: imageSize }} />
                                                    } catch (e) {
                                                        console.error(e)
                                                    }
                                                }
                                                return <img
                                                    className={clsx(
                                                        classes.linkImage,
                                                        image ? '' : classes.linkNoImage
                                                    )}
                                                    src={image}
                                                />
                                            })()}
                                            <Typography
                                                color="textSecondary"
                                                className={classes.linkName}
                                                variant="body1"
                                            >
                                                {e.name}
                                            </Typography>
                                        </Paper>
                                    </ButtonBase>
                                </Grid>
                            );
                        })}
                    </Grid>
                </Container>
            </Popover>
        ) : (
            <span />
        );
    }
}

export default withStyles(makeStyles)(ApplinksPopover);
