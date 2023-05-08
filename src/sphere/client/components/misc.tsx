/*
 * @file-created: 2023-03-22
 * @copyright 2023 - 2023, OneXas
 * @author: Dennis Chen
 */ 

import { fasEye, fasEyeSlash, FontAwesomeIcon } from '@onexas/sphere/client/icons';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import React from 'react';

export function VisibilityAdornment(props: { visibility: boolean; toggleVisibility: () => void }) {
    return (
        <InputAdornment position="end">
            <IconButton onClick={props.toggleVisibility} size="medium">
                <FontAwesomeIcon icon={props.visibility ? fasEye : fasEyeSlash} />
            </IconButton>
        </InputAdornment>
    );
}
