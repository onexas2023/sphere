/*
 * @file-created: 2023-03-22
 * @copyright 2023 - 2023, OneXas
 * @author: Dennis Chen
 */

import { AppContext } from '@onexas/sphere/client/context';
import { CssClass, CssStyle, ViewProps } from '@onexas/sphere/client/types';
import { Ally } from '@onexas/sphere/client/utils/ui';
import { Validator } from '@onexas/sphere/client/utils/validator';



import { Theme } from '@mui/material/styles';
import createStyles from '@mui/styles/createStyles';
import withStyles from '@mui/styles/withStyles';
import { observer } from 'mobx-react';
import React, { CSSProperties } from 'react';

type CssRules<P> = {
    root: P;
};
type CssStyles = CssRules<CssStyle>;
type CssClasses = CssRules<CssClass>;

function makeStyles(theme: Theme) {
    const style: CssStyles = {
        root: {
            backgroundColor: '#f2f2f2',
            border: '10px solid #d9d9d9',
            padding: theme.spacing(10),
            width: '100%',
            height: '100%',
            overflow: 'auto'
        },
    };

    return createStyles(style);
}

interface LayoutDemoViewProps extends ViewProps {
    classes?: CssClasses;
}

@observer
class LayoutDemoView extends React.PureComponent<LayoutDemoViewProps> {
    static contextType = AppContext;
    declare context: React.ContextType<typeof AppContext>;

    private ally: Ally<LayoutDemoViewProps, any>;
    private validator: Validator;

    constructor(props: LayoutDemoViewProps) {
        super(props);
        this.ally = new Ally(this).errorHandler(props.workspaceStore.errorHandler);
    }

    componentDidMount() {
    }
    componentDidUpdate() {
    }

    onChangeLocale = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.context.i18n.changeLocale(e.target.value);
    };



    render() {
        const {
            classes,
            workspaceStore
        } = this.props;
        const {
            appTheme: { classes: cssClasses, theme },
            i18n,
            config,
        } = this.context;

        let style: CSSProperties = {};
        if (workspaceStore.urlSearchParams.get('height')) {
            style = { 'height': workspaceStore.urlSearchParams.get('height') }
        }

        return (
            <div className={classes.root}>
                <div style={style}>
                    The Layout Demo View
                </div>
            </div>
        );
    }
}

export default withStyles(makeStyles)(LayoutDemoView);
