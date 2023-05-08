/*
 * @file-created: 2023-03-22
 * @copyright 2023 - 2023, OneXas
 * @author: Dennis Chen
 */

import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import { Theme } from '@onexas/sphere/client/types';
import createStyles from '@mui/styles/createStyles';
import withStyles from '@mui/styles/withStyles';
import React from 'react';

type StylesClasses = {
    root: any;
};

function makeStyles(theme: Theme) {
    const sc: StylesClasses = {
        root: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            padding: theme.spacing(1),
        },
    };
    return createStyles(sc);
}

interface ProcessingProps {
    classes?: StylesClasses;
}

class Processing extends React.PureComponent<ProcessingProps> {
    render() {
        const { classes } = this.props;
        return (
            <Container maxWidth="md" className={classes.root}>
                <CircularProgress />
            </Container>
        );
    }
}

export default withStyles(makeStyles)(Processing);
