/*
 * @file-created: 2023-03-22
 * @copyright 2023 - 2023, OneXas
 * @author: Dennis Chen
 */

import createStyles from '@mui/styles/createStyles';
import withStyles from '@mui/styles/withStyles';
import React from 'react';

// Fix : SyntaxError: Cannot use import statement outside a module
// import useTheme from '@mui/material/styles/useTheme';
import { useTheme } from '@mui/material/styles';

interface UITestSampleProps {
    variant?: 'info' | 'error';
    classes?: any;
    message: string;
    handleClose?(): void;
}

const makeStyles = () => {
    //have to use useTheme in MUIv5 + Test
    const theme = useTheme();
    return createStyles({
        error: {
            backgroundColor: theme.palette.secondary.main,
            background: theme.palette.secondary.main,
            padding: theme.spacing(2),
            color: theme.palette.common.white,
        },
        info: {
            backgroundColor: theme.palette.primary.main,
            background: theme.palette.primary.main,
            padding: theme.spacing(2),
            color: theme.palette.common.white,
        },
    });
}

class UITestSample extends React.PureComponent<UITestSampleProps> {
    render() {
        const { message, classes, variant = 'info' } = this.props;
        const color = classes[variant];
        return (
            <>
                <div className={color}>{message}</div>
            </>
        );
    }
}

export default withStyles(makeStyles)(UITestSample);
