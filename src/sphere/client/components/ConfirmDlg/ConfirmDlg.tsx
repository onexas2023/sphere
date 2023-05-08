/*
 * @file-created: 2023-03-22
 * @copyright 2023 - 2023, OneXas
 * @author: Dennis Chen
 */

import { AppContext } from '@onexas/sphere/client/context';
import { CssClass, CssStyle, Theme } from '@onexas/sphere/client/types';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import createStyles from '@mui/styles/createStyles';
import withStyles from '@mui/styles/withStyles';
import Typography from '@mui/material/Typography';
import React from 'react';

type CssRules<P> = {
    root: P;
    title: P;
    description: P;
    form: P;
};
type CssStyles = CssRules<CssStyle>;
type CssClasses = CssRules<CssClass>;

function makeStyles(theme: Theme) {
    const style: CssStyles = {
        root: {},
        title: {},
        description: {
            minWidth: theme.spacing(50),
            minHeight: theme.spacing(6),
            display: 'flex',
            alignItems: 'center'

        },
        form: {},
    };
    return createStyles(style);
}

interface ConfirmDlgProps {
    classes?: CssClasses;
    title?: string;
    description?: string;
    open: boolean;
    onOk: () => void;
    onCancel?: () => void;
    disableBackdropClick?:boolean;
    disableEscapeKeyDown?: boolean;
    enableFormSubmitOk?: boolean;
    disableButtonAutoFocus?: boolean;
    okLabel?: string;
    cancelLabel?: string;
    children?: React.ReactNode;
}

class ConfirmDlgInner extends React.PureComponent<ConfirmDlgProps> {
    static contextType = AppContext;
    declare context: React.ContextType<typeof AppContext>;

    render() {
        const {
            title,
            open,
            description,
            classes,
            onOk,
            onCancel,
            disableEscapeKeyDown,
            enableFormSubmitOk,
            children,
            okLabel,
            cancelLabel,
            disableBackdropClick,
            disableButtonAutoFocus,
        } = this.props;
        if (!open) {
            return <span />;
        }
        const { i18n } = this.context;
        return (
            <Dialog
                className={classes.root}
                disableEscapeKeyDown={disableEscapeKeyDown}
                open
                onClose={(evt, reason)=>{
                    if(disableBackdropClick && reason==='backdropClick'){
                        return;
                    }
                    if(disableEscapeKeyDown && reason==='escapeKeyDown'){
                        return;
                    }
                    onCancel()
                }}>
                {title && <DialogTitle className={classes.title}>{title}</DialogTitle>}
                <DialogContent dividers>
                    {description && (
                        <Typography variant="body1" className={classes.description}>
                            {description}
                        </Typography>
                    )}
                    {enableFormSubmitOk ? (
                        <form
                            className={classes.form}
                            onSubmit={(evt) => {
                                evt.preventDefault();
                                onOk();
                            }}
                        >
                            {children}
                        </form>
                    ) : (
                        children
                    )}
                </DialogContent>
                <DialogActions>
                    {!!onCancel && (
                        <Button autoFocus={!disableButtonAutoFocus} onClick={onCancel}>
                            {i18n.l(cancelLabel || 'action.cancel')}
                        </Button>
                    )}
                    <Button
                        onClick={onOk}
                        variant="contained"
                        color="primary"
                        {...(!onCancel ? { autoFocus: !disableButtonAutoFocus } : {})}
                    >
                        {i18n.l(okLabel || 'action.ok')}
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }
}
const ConfirmDlg = withStyles(makeStyles)(ConfirmDlgInner);
export default ConfirmDlg;
