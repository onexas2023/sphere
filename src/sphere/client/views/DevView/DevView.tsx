/*
 * @file-created: 2023-09-20
 * @copyright 2023 - 2023, OneXas
 * @author: Dennis Chen
 */
import { LoginLogo } from '@onexas/sphere/client/assets/images';
import { APP_NAME, PATH_HOME, URI_LOGIN_LOGO } from '@onexas/sphere/client/config';
import { PARAM_BACK_PATH } from '@onexas/sphere/client/constants';
import { AppContext } from '@onexas/sphere/client/context';
import { Footer } from '@onexas/sphere/client/layouts/components/Footer';
import { LoginStore } from '@onexas/sphere/client/stores';
import { CssClass, CssStyle, ViewProps } from '@onexas/sphere/client/types';
import { Ally, noSubmit } from '@onexas/sphere/client/utils/ui';
import { parseSearch } from '@onexas/sphere/client/utils/url';
import { RequiredValidate, Validator } from '@onexas/sphere/client/utils/validator';

import Button from '@mui/material/Button';
import Card from '@mui/material/Card';

import CardContent from '@mui/material/CardContent';

import FormHelperText from '@mui/material/FormHelperText';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import createStyles from '@mui/styles/createStyles';
import withStyles from '@mui/styles/withStyles';
import { isDarkTheme } from '@onexas/sphere/client/styles';
import { Theme } from '@onexas/sphere/client/types';
import clsx from 'clsx';
import Color from 'color';
import { disposeOnUnmount, observer } from 'mobx-react';
import React from 'react';
import DropFile from '@onexas/sphere/client/components/DropFile';
import { read } from '@onexas/sphere/client/utils/file';

type CssRules<P> = {
    root: P;
};
type CssStyles = CssRules<CssStyle>;
type CssClasses = CssRules<CssClass>;

function makeStyles(theme: Theme) {
    const pmainColor = Color(theme.palette.primary.main);
    const dark = isDarkTheme(theme);
    const style: CssStyles = {
        root: {
            minHeight: '100vh',
            width: '100%',
            flexDirection: 'column',
            display: 'flex',
            alignItems: 'center',
        },
    };

    return createStyles(style);
}

interface DevViewProps extends ViewProps {
    classes?: CssClasses;
}

@observer
class DevView extends React.PureComponent<DevViewProps> {
    static contextType = AppContext;
    declare context: React.ContextType<typeof AppContext>;

    private ally: Ally<DevViewProps, any>;
    private validator: Validator;

    constructor(props: DevViewProps) {
        super(props);
        this.ally = new Ally(this).errorHandler(props.workspaceStore.errorHandler);
    }

    componentDidMount() {
    }
    componentDidUpdate() {
    }

    render() {
        const {
            classes,
            workspaceStore,
        } = this.props;
        const {
            appTheme: { classes: cssClasses, theme },
            i18n,
            config,
        } = this.context;

        const onSelectFile = (files: FileList) => {
            console.log(">>>", files);
            read(files[0], (file, content)=>{
                console.log(file);
                console.log(new TextDecoder().decode(content));
            });
        }
        return (
            <div className={classes.root}>
                <Typography variant='h3'>Dev View</Typography>
                <DropFile
                    picker
                    multiple
                    description='Upload or Drage files here'
                    onSelectFile={onSelectFile}
                >
                </DropFile>
                <DropFile style={{ height: 400, width: 600, border: '1px dashed #aaa' }}
                    onSelectFile={onSelectFile}
                ></DropFile>
                <DropFile
                    picker
                    multiple
                    onSelectFile={onSelectFile}
                >
                    <div style={{ height: 400, width: 600, border: '1px dashed #aaa' }}>
                        Upload or Drage files here 
                    </div>

                </DropFile>
            </div>
        );
    }
}

export default withStyles(makeStyles)(DevView);
