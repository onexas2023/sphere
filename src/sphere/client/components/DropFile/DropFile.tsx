/*
 * @file-created: 2023-09-20
 * @copyright 2023 - 2023, OneXas
 * @author: Dennis Chen
 */

import Typography from '@mui/material/Typography';
import createStyles from '@mui/styles/createStyles';
import withStyles from '@mui/styles/withStyles';
import { isDarkTheme } from '@onexas/sphere/client/styles';
import { CssClass, CssStyle, Theme } from '@onexas/sphere/client/types';
import { uid } from '@onexas/sphere/client/utils/uid';
import clsx from 'clsx';
import React, { CSSProperties } from 'react';

type CssRules<P> = {
    root: P;
    fullcenter: P;
    form: P;
    mask: P;
    dragging: P;
    picker: P;
};
type CssStyles = CssRules<CssStyle>;
type CssClasses = CssRules<CssClass>;

function makeStyles(theme: Theme) {
    const dark = isDarkTheme(theme);
    const style: CssStyles = {
        root: {
        },
        form: {
            position: 'relative'
        },
        fullcenter: {
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
        },
        mask: {
            position: 'absolute',
            pointerEvents: 'none'
        },
        dragging: {
            backgroundColor: dark ? 'rgba(255,255,255, 0.05)' : 'rgba(0,0,0, 0.05)',
        },
        picker: {
            cursor: 'pointer'
        }
    };
    return createStyles(style);
}

interface Props {
    classes?: CssClasses;
    children?: React.ReactNode;

    className?: string;
    style?: CSSProperties;
    multiple?: boolean;
    picker?: boolean;
    description?: string;

    onSelectFile?: (files: FileList) => void
}

interface State {
    dragging: boolean
}

class DropFile extends React.PureComponent<Props, State> {

    uid: string;

    //determinate dragenter/over in children
    dragCounter = 0;

    constructor(props: Props) {
        super(props);
        this.uid = uid();
    }

    onChangeInput = (evt: React.ChangeEvent<HTMLInputElement>) => {
        evt.stopPropagation();
        const input = evt.target;
        if (input.files && input.files.length > 0 && this.props.onSelectFile) {
            this.props.onSelectFile(input.files);
        }
        //fix for trigger change for upload same file again.
        evt.target.value = '';
    }

    onDrag = (evt: React.DragEvent) => {
        evt.stopPropagation();
        
        if (!evt.dataTransfer?.types?.some((t) => t === 'Files')) {
            return;
        }
        //preventDefault to allow drop
        evt.preventDefault();


        switch (evt.type) {
            case "dragenter":
                this.dragCounter++;
            case "dragover":
                if (!this.state || !this.state.dragging) {
                    this.setState({ ...this.state, dragging: true })
                }
                break;
            case "dragleave":
                this.dragCounter--;
                if ((!this.state || this.state.dragging) && this.dragCounter === 0) {
                    this.setState({ ...this.state, dragging: false })
                }
                break;
        }
    }
    onDrop = (evt: React.DragEvent) => {
        evt.stopPropagation();
        evt.preventDefault();
        if (!evt.dataTransfer?.files || !evt.dataTransfer?.files?.length) {
            return;
        }

        this.dragCounter = 0;
        this.setState({ ...this.state, dragging: false });

        if (this.props.onSelectFile) {
            this.props.onSelectFile(evt.dataTransfer?.files);
        }
    }


    render() {
        const {
            classes,
            style,
            className,
            picker,
            description,
            children
        } = this.props;

        const { uid } = this;
        const { multiple } = this.props;
        const { dragging } = this.state || {};
        return <div className={clsx(className, classes.root)} style={style}>
            <form className={clsx(classes.form, classes.fullcenter,)} onDragEnter={this.onDrag} onDragOver={this.onDrag} onDragLeave={this.onDrag} onDrop={this.onDrop} onSubmit={(e) => e.preventDefault()}>
                {picker && <input id={uid} type="file" hidden multiple={!!multiple} onChange={this.onChangeInput} />}
                <label htmlFor={uid} className={clsx(classes.fullcenter, picker && classes.picker)}>
                    {description && <Typography>{description}</Typography>}
                    {children}
                    {!description && !children &&
                        <Typography>{'Drag and drop your file here' + (picker ? 'or click to select your file.' : '.')}</Typography>}
                </label>
                <div className={clsx(classes.mask, classes.fullcenter, dragging && classes.dragging)} />
            </form>
        </div>
    }
}

export default withStyles(makeStyles)(DropFile);