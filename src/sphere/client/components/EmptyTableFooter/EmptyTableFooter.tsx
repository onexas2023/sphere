/*
 * @file-created: 2023-03-22
 * @copyright 2023 - 2023, OneXas
 * @author: Dennis Chen
 */ 

import TableCell from '@mui/material/TableCell';
import TableFooter from '@mui/material/TableFooter';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { AppContext } from '@onexas/sphere/client/context';
import React from 'react';

interface EmptyTableFooterProps {
    colSpan?: number;
    msg?: string;
}

export default class EmptyTableFooter extends React.PureComponent<EmptyTableFooterProps> {
    static contextType = AppContext;
    declare context: React.ContextType<typeof AppContext>;
    render() {
        const { i18n } = this.context;
        const { colSpan = 1, msg = i18n.l('msg.emptyList') } = this.props;
        return (
            <TableFooter>
                <TableRow>
                    <TableCell colSpan={colSpan}>
                        <Typography variant="body2">{msg}</Typography>
                    </TableCell>
                </TableRow>
            </TableFooter>
        );
    }
}
