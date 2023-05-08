/*
 * @file-created: 2023-03-22
 * @copyright 2023 - 2023, OneXas
 * @author: Dennis Chen
 */ 

import Fade from '@mui/material/Fade';
import Skeleton from '@mui/material/Skeleton';
import FlexContainer from '@onexas/sphere/client/components/FlexContainer';
import { DEFAULT_SKELETON_DEFERRED } from '@onexas/sphere/client/constants';
import { AppContext } from '@onexas/sphere/client/context';
import React from 'react';

export default class SkeletonTabs extends React.PureComponent<{
    timeout?: number;
}> {
    static contextType = AppContext;
    declare context: React.ContextType<typeof AppContext>;
    render() {
        const {
            appTheme: { classes },
        } = this.context;
        const { timeout = DEFAULT_SKELETON_DEFERRED } = this.props;
        return (
            <Fade in timeout={timeout}>
                <FlexContainer>
                    <Skeleton className={classes.skeletonTabs} variant="rectangular" />
                </FlexContainer>
            </Fade>
        );
    }
}
