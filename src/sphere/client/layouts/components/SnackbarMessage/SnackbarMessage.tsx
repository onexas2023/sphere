/*
 * @file-created: 2023-03-22
 * @copyright 2023 - 2023, OneXas
 * @author: Dennis Chen
 */ 

import React from 'react';
import WorkspaceStore from '@onexas/sphere/client/stores/WorkspaceStore';
import { Message, MessageLevel } from '@onexas/sphere/client/types';
import { autorun } from 'mobx';
import { disposeOnUnmount } from 'mobx-react';
import { withSnackbar, SnackbarProvider, VariantType, WithSnackbarProps } from 'notistack';
import { SnackbarOrigin } from '@mui/material/Snackbar';
import IconButton from '@mui/material/IconButton';
import { farTimesCircle, FontAwesomeIcon } from '@onexas/sphere/client/icons';
import fscreen from 'fscreen';

const CFG_PREFIX = 'sphere.snackbarMessage.';
const CFG_HIDE_DURATION = CFG_PREFIX + 'autoHideDuration';
const CFG_ANCHOR_V = CFG_PREFIX + 'anchorOrigin.vertical';
const CFG_ANCHOR_H = CFG_PREFIX + 'anchorOrigin.horizontal';
const CFG_MAX_SNACK = CFG_PREFIX + 'maxSnack';

const toVariant = function (level: MessageLevel): VariantType {
    switch (level) {
        case MessageLevel.Error:
            return 'error';
        case MessageLevel.Info:
            return 'info';
        case MessageLevel.Success:
            return 'success';
        case MessageLevel.Warning:
            return 'warning';
        default:
            return 'default';
    }
};

const toAutoHideDuration = function (durations: number[], level: MessageLevel) {
    switch (level) {
        default:
        case MessageLevel.Info:
            return durations[0] * 1000;
        case MessageLevel.Success:
            return durations[1] * 1000;
        case MessageLevel.Warning:
            return durations[2] * 1000;
        case MessageLevel.Error:
            return durations[3] * 1000;
    }
};

interface EnqueueSnackbarProps extends WithSnackbarProps {
    workspaceStore: WorkspaceStore;
}

class EnqueueSnackbar extends React.PureComponent<EnqueueSnackbarProps> {
    anchorOrigin: SnackbarOrigin;
    autoHideDuration: number[];

    constructor(props: EnqueueSnackbarProps) {
        super(props);
        const {
            workspaceStore: { config },
        } = props;
        this.autoHideDuration = config
            .get(CFG_HIDE_DURATION, '2,2,3,4')
            .split(',')
            .map((e) => parseInt(e));
        const l = this.autoHideDuration.length;
        for (let i = l; i < 4; i++) {
            this.autoHideDuration[i] = this.autoHideDuration[l - 1];
        }
        this.anchorOrigin = {
            vertical: config.get(CFG_ANCHOR_V, 'bottom') as any,
            horizontal: config.get(CFG_ANCHOR_H, 'left') as any,
        };
    }
    componentDidMount() {
        /*
         * autorun when 1. immediate, 2. any reference change (track by 1 I guess)
         * dispose autorun when component willUmmount
         */
        disposeOnUnmount(
            this,
            autorun(() => {
                const { anchorOrigin, autoHideDuration } = this;
                const {
                    enqueueSnackbar,
                    closeSnackbar,
                    workspaceStore: { messages = [] },
                } = this.props;

                messages.forEach((message: Message) => {
                    if (message.shown > 0) return;
                    enqueueSnackbar(message.text, {
                        key: message.key,
                        variant: toVariant(message.level),
                        autoHideDuration: toAutoHideDuration(autoHideDuration, message.level),
                        anchorOrigin,
                        action: (key) => {
                            return (
                                <IconButton
                                    onClick={() => closeSnackbar(key)}
                                    style={{ color: 'inherit' }}
                                    size="small"
                                >
                                    <FontAwesomeIcon icon={farTimesCircle} />
                                </IconButton>
                            );
                        },
                    });
                    ++message.shown;
                });
            })
        );
    }

    render() {
        return <></>;
    }
}

const WithEnqueueSnackbar = withSnackbar(EnqueueSnackbar);

interface SnackbarMessagePrpos {
    workspaceStore: WorkspaceStore;
}

export default class SnackbarMessage extends React.PureComponent<SnackbarMessagePrpos> {
    maxSnack: number;
    constructor(props: SnackbarMessagePrpos) {
        super(props);
        const {
            workspaceStore: { config },
        } = props;

        this.maxSnack = config.getNumber(CFG_MAX_SNACK, 3);
    }

    componentDidMount() {
        fscreen.addEventListener('fullscreenchange', this.onFullscreenChange, false);
    }

    componentWillUnmount() {
        fscreen.removeEventListener('fullscreenchange', this.onFullscreenChange, false);
    }

    onFullscreenChange = () => {
        this.forceUpdate();
    };
    render() {
        const {
            maxSnack,
            props: { workspaceStore },
        } = this;

        return (
            <SnackbarProvider
                maxSnack={maxSnack}
                domRoot={fscreen.fullscreenElement && (fscreen.fullscreenElement as HTMLElement)}
            >
                <WithEnqueueSnackbar workspaceStore={workspaceStore} />
            </SnackbarProvider>
        );
    }
}

export { WithEnqueueSnackbar };
