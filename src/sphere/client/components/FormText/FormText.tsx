/*
 * @file-created: 2023-03-22
 * @copyright 2023 - 2023, OneXas
 * @author: Dennis Chen
 */

import InputLabel from '@mui/material/InputLabel';
import createStyles from '@mui/styles/createStyles';
import withStyles from '@mui/styles/withStyles';
import Typography from '@mui/material/Typography';
import { CssClass, CssStyle, Theme } from '@onexas/sphere/client/types';
import clsx from 'clsx';
import React from 'react';
import { typeOfString } from '@onexas/sphere/client/utils/object';
import FormHelperText from '@mui/material/FormHelperText';

type CssRules<P> = {
    root: P;
    dense: P;
    label: P;
    value: P;
    start: P;
    end: P;
    helperText: P;
};
type CssStyles = CssRules<CssStyle>;
type CssClasses = CssRules<CssClass>;

function makeStyles(theme: Theme) {
    const style: CssStyles = {
        root: {
            display: 'flex',
            alignItems: 'start',
            flexDirection: 'column',
            marginTop: theme.spacing(2),
            marginBottom: theme.spacing(2),
        },
        dense: {
            marginTop: theme.spacing(1),
            marginBottom: theme.spacing(1),
        },
        label: {},
        value: {
            display: 'flex',
            alignItems: 'center',
            flexDirection: 'row',
            marginTop: theme.spacing(0.8),
            paddingLeft: theme.spacing(1),
            paddingRight: theme.spacing(1),
            width: '100%',
        },
        start: {
            paddingRight: theme.spacing(1),
        },
        end: {
            paddingLeft: theme.spacing(1),
        },
        helperText: {
            height: 0,
            marginTop: 0,
        },
    };
    return createStyles(style);
}

interface Props {
    classes?: CssClasses;
    className?: string;
    style?: React.CSSProperties;
    label?: React.ReactNode;
    value?: React.ReactNode;
    required?: boolean;
    startIcon?: React.ReactNode;
    endIcon?: React.ReactNode;
    dense?: boolean;
    alignRight?: boolean;
    error?: boolean;
    helperText?: string;
    children?: React.ReactNode;
}

class FormText extends React.PureComponent<Props> {
    render() {
        const {
            classes,
            className,
            style,
            label,
            value,
            required,
            startIcon,
            dense,
            endIcon,
            alignRight,
            children,
            error,
            helperText,
        } = this.props;
        return (
            <div
                className={clsx(classes.root, dense ? classes.dense : '', className)}
                style={alignRight ? { alignItems: 'flex-end', ...style } : style}
            >
                {typeOfString(label) ? (
                    <InputLabel
                        shrink
                        required={required}
                        className={classes.label}
                        style={alignRight ? { transformOrigin: 'top right' } : {}}
                    >
                        {label}
                    </InputLabel>
                ) : (
                    label
                )}
                <div
                    className={classes.value}
                    style={alignRight ? { justifyContent: 'flex-end' } : {}}
                >
                    {startIcon && <div className={classes.start}>{startIcon}</div>}
                    {typeOfString(value) ? <Typography>{value}</Typography> : value}
                    {children}
                    {endIcon && <div className={classes.end}>{endIcon}</div>}
                </div>
                {helperText && (
                    <FormHelperText error={error} className={classes.helperText}>
                        {helperText}
                    </FormHelperText>
                )}
            </div>
        );
    }
}

export default withStyles(makeStyles)(FormText);
