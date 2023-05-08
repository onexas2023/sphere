/*
 * @file-created: 2023-03-22
 * @copyright 2023 - 2023, OneXas
 * @author: Dennis Chen
 */
import { IconDefinition } from '@fortawesome/fontawesome-common-types';
import { AppContext } from '@onexas/sphere/client/context';
import { fasInfoCircle, FontAwesomeIcon } from '@onexas/sphere/client/icons';
import { CssClass, CssStyle, Theme } from '@onexas/sphere/client/types';
import createStyles from '@mui/styles/createStyles';
import withStyles from '@mui/styles/withStyles';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import clsx from 'clsx';
import React from 'react';

type CssRules<P> = {
    root: P;
};
type CssStyles = CssRules<CssStyle>;
type CssClasses = CssRules<CssClass>;

function makeStyles(theme: Theme) {
    const style: CssStyles = {
        root: {
            display: 'inline-flex',
            alignItems: 'center',
            flexDirection: 'row',
        },
    };
    return createStyles(style);
}

interface TooltipLabelProps {
    classes?: CssClasses;
    label: string;
    tooltip?: string;
    required?: boolean;
    icon?: IconDefinition;
}

class TooltipLabelInner extends React.PureComponent<TooltipLabelProps> {
    static contextType = AppContext;
    declare context: React.ContextType<typeof AppContext>;

    render() {
        const { tooltip, label, classes, icon } = this.props;
        return (
            <div className={clsx(classes.root)}>
                {label}
                {tooltip && (
                    <Tooltip title={tooltip}>
                        <FontAwesomeIcon icon={icon || fasInfoCircle} />
                    </Tooltip>
                )}
            </div>
        );
    }
}
const TooltipLabel = withStyles(makeStyles)(TooltipLabelInner);
export default TooltipLabel;
