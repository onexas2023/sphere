/*
 * @file-created: 2023-03-22
 * @copyright 2023 - 2023, OneXas
 * @author: Dennis Chen
 */

import {
    ContainerClassKey,
    ContainerProps,
    default as Container,
} from '@mui/material/Container';
import { Theme } from '@onexas/sphere/client/types';
import createStyles from '@mui/styles/createStyles';
import withStyles from '@mui/styles/withStyles';
import { CssClass, CssStyle } from '@onexas/sphere/client/types';
import clsx from 'clsx';
import React from 'react';

type CssRules<P> = {
    root: P;
};
type CssStyles = CssRules<CssStyle>;
type CssClasses = CssRules<CssClass> & Partial<Record<ContainerClassKey, string>>;

function makeStyles(theme: Theme) {
    const style: CssStyles = {
        root: {
            display: 'flex',
            alignItems: 'center',
        },
    };
    return createStyles(style);
}

interface FlexContainerProps extends ContainerProps {
    classes?: CssClasses;
    direction?: 'row' | 'column';
    style?: React.CSSProperties;
    children?: React.ReactNode;
}

const FlexContainer = React.forwardRef((props: FlexContainerProps, ref: any) => {
    const { classes, className, children, direction = 'column', style, ...other } = props;
    let ss = { flexDirection: direction, ...style };
    return (
        <Container
            {...other}
            className={clsx(classes.root, className)}
            style={ss}
            ref={ref}
        >
            {children}
        </Container>
    );
});

export default withStyles(makeStyles)(FlexContainer);

interface FlexGrowProps {
    style?: React.CSSProperties;
    className?: string;
}

export class FlexGrow extends React.PureComponent<FlexGrowProps> {
    render() {
        const { style, className } = this.props;
        return <div style={{ flexGrow: 1, ...style }} className={className} />;
    }
}
