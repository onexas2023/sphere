/*
 * @file-created: 2023-03-22
 * @copyright 2023 - 2023, OneXas
 * @author: Dennis Chen
 */

import { Breakpoint } from '@mui/system/createTheme';
import createStyles from '@mui/styles/createStyles';
import { CssClass, CssStyle, Theme } from '@onexas/sphere/client/types';
import Color from 'color';

// export const BackgroundLightImage = require('./bg-light.png');
// export const BackgroundDarkImage = require('./bg-dark.png');

type DlgCssRules<P> = {
    dlg: P;
    dlgFullscreen: P;
    dlgDividersTop: P;
    dlgDividersBottom: P;
};

export type DlgCssStyles = DlgCssRules<CssStyle>;
export type DlgCssClasses = DlgCssRules<CssClass>;

export function getDlgStyles(theme: Theme) {
    const sc: DlgCssStyles = {
        dlg: {
            '& .MuiPaper-root': {},
            '& .MuiDialogTitle-root, .MuiDialogActions-root, .MuiDialogContent-root': {},
            '& .MuiDialogTitle-root': {},
            '& .MuiDialogContent-root': {
                padding: 0,
            },
            '& .MuiDialogActions-root': {
                '& .MuiToolbar-root': {
                    minHeight: 0,
                    '& .MuiIconButton-root': {
                        paddingTop: 0,
                        paddingBottom: 0,
                    },
                },
                '& .MuiTablePagination-toolbar': {
                    paddingLeft: 0,
                    paddingRight: 0,
                },
                '& .MuiTablePagination-actions': {
                    marginLeft: theme.spacing(1),
                },
            },
        },
        dlgFullscreen: {
            '& .MuiDialogTitle-root': {
                backgroundColor: theme.palette.secondary.main,
            },
        },
        dlgDividersTop: {
            borderBottom: '0px none',
        },
        dlgDividersBottom: {
            borderTop: '0px none',
        },
    };
    return sc;
}

type LayoutCssRules<P> = {
    layoutRoot: P;
    layoutAppBarSpacer: P;
    layoutSkeleton: P;
    layoutMain: P;
    layoutFull: P;
    layoutBackground: P;
    layoutBreadcurmbs: P;
    layoutActiveBreadcurmb: P;
};

export type LayoutCssStyles = LayoutCssRules<CssStyle>;
export type LayoutCssClasses = LayoutCssRules<CssClass>;

export function getLayoutStyles(theme: Theme) {
    const sc: LayoutCssStyles = {
        layoutRoot: {
            display: 'flex',
        },
        layoutAppBarSpacer: theme.mixins.toolbar,
        layoutSkeleton: {
            paddingTop: theme.spacing(1),
            paddingBottom: theme.spacing(0),
            flexGrow: 1,
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            flexDirection: 'column',
        },
        layoutMain: {
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative',
        },
        layoutFull: {
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative',
            flexGrow: 1,
            overflow: 'hidden',
        },
        layoutBackground: {
            // background: `url(${
            //     isDarkTheme(theme) ? BackgroundDarkImage : BackgroundLightImage
            // }) no-repeat top 0px left 0px`,
            // backgroundSize: 'cover',
            minHeight: '60vh',
        },
        layoutBreadcurmbs: {
            alignSelf: 'start',
            marginBottom: theme.spacing(1),
            '& .MuiBreadcrumbs-li': {
                padding: theme.spacing(0, 1)
            }
        },
        layoutActiveBreadcurmb: {
            cursor: 'pointer',
            color: theme.palette.text.primary,
            '&:hover':{
                color: theme.palette.primary.main
            }
        }
    };
    return sc;
}

type TableCssRules<P> = {
    tableScrollable: P;
    tableSelectable: P;
    tableClickable: P;
    tableLoading: P;
    tableTextFieldSelect: P;
    tableToolbarCell: P;
    tableTextField: P;
    tableNoBorderCell: P;
    tableNoBorderRow: P;
    tableIconCell: P;
};
export type TableCssStyles = TableCssRules<CssStyle>;
export type TableCssClasses = TableCssRules<CssClass>;
export function getTableStyles(theme: Theme) {
    const sc: TableCssStyles = {
        tableScrollable: {
            display: 'flex',
            flexDirection: 'column',
            maxHeight: 400,
            '& thead': {
                flex: '0 0 auto',
                width: 'calc(100% - 0.9em)',
            },
            '& tbody': {
                flex: '1 1 auto',
                display: 'block',
                overflowY: 'scroll',
            },
            '& tr': {
                width: '100%',
                display: 'table',
                tableLayout: 'fixed',
            },
        },
        tableSelectable: {
            '& tbody tr': {
                cursor: 'pointer',
            },
        },
        tableClickable: {
            '& tbody tr': {
                cursor: 'pointer',
            },
        },
        tableLoading: {
            cursor: 'wait',
        },
        tableTextFieldSelect: {
            '& .MuiInput-underline:before': {
                borderBottom: 'none',
            },
        },
        tableToolbarCell: {
            position: 'relative',
            '& .MuiToolbar-root': {
                position: 'absolute',
                top: 0,
                right: 0,
                height: '100%',
                minHeight: 'auto',
                padding: 0,
            },
        },
        tableTextField: {
            '& .MuiInputBase-input': {
                padding: theme.spacing(1, 1),
                '&::placeholder': {
                    fontSize: '0.8rem',
                },
            },
        },
        tableNoBorderCell: {
            borderBottom: 'none',
        },
        tableNoBorderRow: {
            '& > .MuiTableCell-root': {
                borderBottom: 'none',
            },
        },
        tableIconCell: {
            textAlign: 'center',
        },
    };
    return sc;
}

type ToolbarCssRules<P> = {
    appntoolbar: P;
    appntabbar: P;
    toolbar: P;
};
export type ToolbarCssStyles = ToolbarCssRules<CssStyle>;
export type ToolbarCssClasses = ToolbarCssRules<CssClass>;
export function getToolbarStyles(theme: Theme) {
    const sc: ToolbarCssStyles = {
        appntoolbar: {
            backgroundColor: 'rgba(0,0,0,0)',
            '& .MuiToolbar-root': {
                paddingLeft: 0,
                paddingRight: 0,
            },
        },
        appntabbar: {
            backgroundColor: 'rgba(0,0,0,0)',
            flexDirection: 'row',
            position: 'relative',
            justifyContent: 'space-between',
            '& .MuiToolbar-root': {
                minHeight: 0,
            },
        },
        toolbar: {
            paddingLeft: 0,
            paddingRight: 0,
            minHeight: 0,
        },
    };
    return sc;
}

type TextCssRules<P> = {
    textTitle: P;
    textSubtitle: P;
    text: P;
    textSmall: P;
    textCenter: P;
    textColorPrimary: P;
    textColorSecondary: P;
    textEllipsis: P;
};
export type TextCssStyles = TextCssRules<CssStyle>;
export type TextCssClasses = TextCssRules<CssClass>;
export function getTextStyles(theme: Theme) {
    const sc: TextCssStyles = {
        textTitle: {
            ...theme.typography.h5,
            alignSelf: 'start',
            paddingTop: theme.spacing(4),
            paddingBottom: theme.spacing(1),
            alignItems: 'center',
            display: 'flex',
            '&:first-child': {
                paddingTop: theme.spacing(0),
            },
        },
        textSubtitle: {
            ...theme.typography.h6,
            alignSelf: 'start',
            paddingTop: theme.spacing(2),
            paddingBottom: theme.spacing(1),
            alignItems: 'center',
            display: 'flex',
            '&:first-child': {
                paddingTop: theme.spacing(0),
            },
        },
        text: {
            ...theme.typography.body1,
        },
        textSmall: {
            ...theme.typography.body2,
        },
        textCenter: {
            alignSelf: 'start',
            alignItems: 'center',
            display: 'flex',
        },
        textColorPrimary: {
            color: theme.palette.text.primary,
        },
        textColorSecondary: {
            color: theme.palette.text.secondary,
        },
        textEllipsis: {
            overflow: 'hidden',
            textOverflow: 'ellipsis',
        },
    };
    return sc;
}

type ContainerCssRules<P> = {
    containerMain: P;
    containerMain90: P;
    containerMain100: P;
    container: P;
};
export type ContainerCssStyles = ContainerCssRules<CssStyle>;
export type ContainerCssClasses = ContainerCssRules<CssClass>;
export function getContainerStyles(theme: Theme) {
    const sc: ContainerCssStyles = {
        containerMain: {
            paddingTop: theme.spacing(2),
            width: '100%',
            [theme.breakpoints.up('md')]: {
                width: '80%',
            },
        },
        containerMain90: {
            paddingTop: theme.spacing(2),
            width: '100%',
            [theme.breakpoints.up('md')]: {
                width: '90%',
            },
        },
        containerMain100: {
            paddingTop: theme.spacing(2),
            width: '100%',
            [theme.breakpoints.up('md')]: {
                width: '100%',
            },
        },
        container: {
            padding: theme.spacing(2),
        },
    };
    return sc;
}

type PaddingMarginCssRules<P> = {
    pamaMr0: P;
    pamaMr1: P;
    pamaMr2: P;
    pamaMr3: P;
    pamaMr4: P;
    pamaMb0: P;
    pamaMb1: P;
    pamaMb2: P;
    pamaMb3: P;
    pamaMb4: P;
    pamaMl0: P;
    pamaMl1: P;
    pamaMl2: P;
    pamaMl3: P;
    pamaMl4: P;
    pamaMt0: P;
    pamaMt1: P;
    pamaMt2: P;
    pamaMt3: P;
    pamaMt4: P;

    pamaPr0: P;
    pamaPr1: P;
    pamaPr2: P;
    pamaPr3: P;
    pamaPr4: P;
    pamaPb0: P;
    pamaPb1: P;
    pamaPb2: P;
    pamaPb3: P;
    pamaPb4: P;
    pamaPl0: P;
    pamaPl1: P;
    pamaPl2: P;
    pamaPl3: P;
    pamaPl4: P;
    pamaPt0: P;
    pamaPt1: P;
    pamaPt2: P;
    pamaPt3: P;
    pamaPt4: P;
};
export type PaddingMarginCssStyles = PaddingMarginCssRules<CssStyle>;
export type PaddingMarginCssClasses = PaddingMarginCssRules<CssClass>;
export function getPaddingMarginStyles(theme: Theme) {
    const sc: PaddingMarginCssStyles = {
        pamaMr0: {
            marginRight: 0,
        },
        pamaMr1: {
            marginRight: theme.spacing(1),
        },
        pamaMr2: {
            marginRight: theme.spacing(2),
        },
        pamaMr3: {
            marginRight: theme.spacing(3),
        },
        pamaMr4: {
            marginRight: theme.spacing(4),
        },
        pamaMb0: {
            marginBottom: 0,
        },
        pamaMb1: {
            marginBottom: theme.spacing(1),
        },
        pamaMb2: {
            marginBottom: theme.spacing(2),
        },
        pamaMb3: {
            marginBottom: theme.spacing(3),
        },
        pamaMb4: {
            marginBottom: theme.spacing(4),
        },
        pamaMl0: {
            marginLeft: 0,
        },
        pamaMl1: {
            marginLeft: theme.spacing(1),
        },
        pamaMl2: {
            marginLeft: theme.spacing(2),
        },
        pamaMl3: {
            marginLeft: theme.spacing(3),
        },
        pamaMl4: {
            marginLeft: theme.spacing(4),
        },
        pamaMt0: {
            marginTop: 0,
        },
        pamaMt1: {
            marginTop: theme.spacing(1),
        },
        pamaMt2: {
            marginTop: theme.spacing(2),
        },
        pamaMt3: {
            marginTop: theme.spacing(3),
        },
        pamaMt4: {
            marginTop: theme.spacing(4),
        },
        pamaPr0: {
            paddingRight: theme.spacing(0),
        },
        pamaPr1: {
            paddingRight: theme.spacing(1),
        },
        pamaPr2: {
            paddingRight: theme.spacing(2),
        },
        pamaPr3: {
            paddingRight: theme.spacing(3),
        },
        pamaPr4: {
            paddingRight: theme.spacing(4),
        },
        pamaPb0: {
            paddingBottom: theme.spacing(0),
        },
        pamaPb1: {
            paddingBottom: theme.spacing(1),
        },
        pamaPb2: {
            paddingBottom: theme.spacing(2),
        },
        pamaPb3: {
            paddingBottom: theme.spacing(3),
        },
        pamaPb4: {
            paddingBottom: theme.spacing(4),
        },
        pamaPl0: {
            paddingLeft: theme.spacing(0),
        },
        pamaPl1: {
            paddingLeft: theme.spacing(1),
        },
        pamaPl2: {
            paddingLeft: theme.spacing(2),
        },
        pamaPl3: {
            paddingLeft: theme.spacing(3),
        },
        pamaPl4: {
            paddingLeft: theme.spacing(4),
        },
        pamaPt0: {
            paddingTop: theme.spacing(0),
        },
        pamaPt1: {
            paddingTop: theme.spacing(1),
        },
        pamaPt2: {
            paddingTop: theme.spacing(2),
        },
        pamaPt3: {
            paddingTop: theme.spacing(3),
        },
        pamaPt4: {
            paddingTop: theme.spacing(4),
        },
    };
    return sc;
}

type SkeletonCssRules<P> = {
    skeletonTabs: P;
    skeletonContainer: P;
    skeletonTable: P;
};
export type SkeletonCssStyles = SkeletonCssRules<CssStyle>;
export type SkeletonCssClasses = SkeletonCssRules<CssClass>;
export function getSkeletonStyles(theme: Theme) {
    const sc: SkeletonCssStyles = {
        skeletonTabs: {
            width: '100%',
            margin: theme.spacing(1, 0),
            ...theme.mixins.toolbar,
        },
        skeletonContainer: {
            width: '100%',
            margin: theme.spacing(1, 1),
            height: theme.spacing(20),
        },
        skeletonTable: {
            width: '100%',
            margin: theme.spacing(1, 1),
            height: theme.spacing(5),
        },
    };
    return sc;
}

type TabCssRules<P> = {
    tabPanels: P;
    tabPanel: P;
    tabs: P;
};
export type TabCssStyles = TabCssRules<CssStyle>;
export type TabCssClasses = TabCssRules<CssClass>;
export function getTabStyles(theme: Theme) {
    const sc: TabCssStyles = {
        tabs: {
            '& .MuiTab-root': {},
        },
        tabPanels: {
            width: '100%',
            padding: theme.spacing(1),
            display: 'flex',
            justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0)',
        },
        tabPanel: {},
    };
    return sc;
}

type FormCssRules<P> = {
    form: P;
    formChipBox: P;
    formChip: P;
    formBtnBox: P;
    formInputError: P;
    formTextField: P;
    formTextLabel: P;
    formTextDense: P;
    formControlLabel: P;
    formReadonly: P;
    inputNumberFieldShort: P;
    inputNumberField: P;
};
export type FormCssStyles = FormCssRules<CssStyle>;
export type FormCssClasses = FormCssRules<CssClass>;
export function getFormStyles(theme: Theme) {
    const sc: FormCssStyles = {
        formChipBox: {
            flexDirection: 'row',
            justifyContent: 'flex-start',
            flexGrow: 1,
            paddingRight: theme.spacing(1),
            paddingLeft: theme.spacing(1),
            '&div': {
                display: 'flex',
                justifyContent: 'center',
                flexWrap: 'wrap',
            },
        },
        formChip: {
            margin: theme.spacing(0.25, 0.5, 0.25, 0),
            '& .MuiChip-avatar': {
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: 'transparent',
                color: 'inherit'
            },
        },
        form: {
            position: 'relative',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            '& .MuiFormHelperText-root.Mui-error': {
                transition: 'color 0.4s ease',
            },
        },
        formBtnBox: {
            width: '100%',
            textAlign: 'right',
            padding: theme.spacing(2, 1, 0, 0),
        },
        formInputError: {
            color: theme.palette.error.main,
            width: '100%',
            margin: theme.spacing(0, 0, 0, 2),
        },
        formTextField: {
            marginTop: theme.spacing(2),
            '& .MuiInputBase-root': {
                marginBottom: theme.spacing(2),
            },
            '& .MuiFormHelperText-root': {
                marginTop: theme.spacing(-2),
            },
        },
        formTextLabel: {
            marginTop: theme.spacing(2),
            '& .MuiInputBase-root': {
                marginBottom: theme.spacing(2),
            },
            '& .MuiFormHelperText-root': {
                marginTop: theme.spacing(-2),
            },
            '& .MuiInput-underline': {
                '&:before': {
                    borderBottom: 'none',
                },
                '& .MuiInputBase-input': {
                    color: theme.palette.text.primary,
                },
            },
        },
        formTextDense: {
            marginBottom: theme.spacing(1),
            marginTop: theme.spacing(1),
        },
        formControlLabel: {
            paddingLeft: theme.spacing(1),
        },
        inputNumberField: {
            '& .MuiInputBase-input': {
                textAlign: 'right',
            },
        },
        inputNumberFieldShort: {
            width: theme.spacing(10),
            '& .MuiInputBase-input': {
                textAlign: 'right',
            },
        },
        formReadonly: {
            cursor: 'default',
            '& .MuiInputBase-input': {
                cursor: 'default',
                color: theme.palette.text.secondary,
            },
            '& .MuiButtonBase-root': {
                cursor: 'default',
            },
        },
    };
    return sc;
}

type CardCssRules<P> = {
    card: P;
    cardHover: P;
    cardContent: P;
    cardContentTable: P;
    cardContentDense: P;
    cardHeader: P;
    cardHeaderSelected: P;
};
export type CardCssStyles = CardCssRules<CssStyle>;
export type CardCssClasses = CardCssRules<CssClass>;
export function getCardStyles(theme: Theme) {
    const sc: CardCssStyles = {
        card: {
            width: '100%',
            boxShadow: 'none',
            border: `1px solid ${theme.palette.divider}`,
            '& .MuiCardHeader-root': {
                padding: theme.spacing(1),
            },
            '& .MuiCardActions-root': {
                justifyContent: 'flex-end',
                padding: theme.spacing(1),
            },
            '& .MuiCardHeader-action': {
                marginTop: 'auto',
                marginBottom: 'auto',
            },
        },
        cardHover: {
            '&:hover': {
                boxShadow: theme.shadows[4],
            },
        },
        cardHeader: {
            backgroundColor: Color(theme.palette.primary.main).alpha(0.1).string(),
        },
        cardHeaderSelected: {
            backgroundColor: Color(theme.palette.secondary.main).alpha(0.9).string(),
        },
        cardContent: {},
        cardContentTable: {
            marginTop: theme.spacing(-2),
        },
        cardContentDense: {
            padding: theme.spacing(0, 2),
            '&:last-child': {
                paddingBottom: theme.spacing(2),
            },
        },
    };
    return sc;
}

type PaperCssRules<P> = {
    paper: P;
    paperHover: P;
};
export type PaperCssStyles = PaperCssRules<CssStyle>;
export type PaperCssClasses = PaperCssRules<CssClass>;
export function getPaperStyles(theme: Theme) {
    const sc: PaperCssStyles = {
        paper: {
            width: '100%',
            padding: theme.spacing(3),
            boxShadow: 'none',
            border: `1px solid ${theme.palette.divider}`,
        },
        paperHover: {
            '&:hover': {
                boxShadow: theme.shadows[4],
            },
        },
    };
    return sc;
}

type StatusCssRules<P> = {
    statusPassed: P;
    statusUnknown: P;
    statusError: P;
    statusWarn: P;
    statusInfo: P;
    statusActive: P;
    statusPassive: P;
    statusBoxPassed: P;
    statusBoxUnknown: P;
    statusBoxError: P;
    statusBoxWarn: P;
    statusBoxInfo: P;
    statusBoxActive: P;
    statusBoxPassive: P;
};

export type StatusCssStyles = StatusCssRules<CssStyle>;
export type StatusCssClasses = StatusCssRules<CssClass>;

export function getStatusStyles(theme: Theme) {
    const sc: StatusCssStyles = {
        statusPassed: {
            color: theme.palette.success.main,
        },
        statusUnknown: {
            color: theme.palette.unknown.main,
        },
        statusError: {
            color: theme.palette.error.main,
        },
        statusWarn: {
            color: theme.palette.warning.main,
        },
        statusInfo: {
            color: theme.palette.info.main,
        },
        statusActive: {
            color: theme.palette.primary.main,
        },
        statusPassive: {
            color: theme.palette.unknown.main,
        },
        statusBoxPassed: {
            color: theme.palette.getContrastText(theme.palette.success.main),
            backgroundColor: theme.palette.success.main,
        },
        statusBoxUnknown: {
            color: theme.palette.getContrastText(theme.palette.unknown.main),
            backgroundColor: theme.palette.unknown.main,
        },
        statusBoxError: {
            color: theme.palette.getContrastText(theme.palette.error.main),
            backgroundColor: theme.palette.error.main,
        },
        statusBoxWarn: {
            color: theme.palette.getContrastText(theme.palette.warning.main),
            backgroundColor: theme.palette.warning.main,
        },
        statusBoxInfo: {
            color: theme.palette.getContrastText(theme.palette.info.main),
            backgroundColor: theme.palette.info.main,
        },
        statusBoxActive: {
            color: theme.palette.getContrastText(theme.palette.primary.main),
            backgroundColor: theme.palette.primary.main,
        },
        statusBoxPassive: {
            color: theme.palette.getContrastText(theme.palette.unknown.main),
            backgroundColor: theme.palette.unknown.main,
        },
    };
    return sc;
}

type BreakpointCssRules<P> = {
    breakpointTextField: P;
};

export type BreakpointCssStyles = BreakpointCssRules<CssStyle>;
export type BreakpointCssClasses = BreakpointCssRules<CssClass>;

export function getBreakpointStyles(theme: Theme) {
    const sc: BreakpointCssStyles = {
        breakpointTextField: {
            [theme.breakpoints.down('sm')]: {
                width: theme.spacing(18),
            },
        },
    };
    return sc;
}

type MiscCssRules<P> = {
    badgeFabTr: P;
    hoverTextPrimary: P;
    hoverTextSecondary: P;
    hoverPrimary: P;
    hoverSecondary: P;
    fullWidth: P;
    flexGrow: P;
    fab: P;
    flexHs: P;
    flexHc: P;
    flexHe: P;
    flexHb: P;

    flexVs: P;
    flexVc: P;
    flexVe: P;

    clickable: P;
    linkBtn: P;

    inlineEditTextField: P;
    densTextField:P;

    noTextSelect: P;


};

export type MiscCssStyles = MiscCssRules<CssStyle>;
export type MiscCssClasses = MiscCssRules<CssClass>;

export function getMiscStyles(theme: Theme) {
    const sc: MiscCssStyles = {
        badgeFabTr: {
            '& .MuiBadge-anchorOriginTopRightRectangular': {
                top: '-6px',
                right: '-6px',
            },
        },
        hoverPrimary: {
            '&:hover': {
                color: theme.palette.primary.main,
            },
        },
        hoverSecondary: {
            '&:hover': {
                color: theme.palette.secondary.main,
            },
        },
        hoverTextPrimary: {
            '&:hover': {
                color: theme.palette.text.primary,
            },
        },
        hoverTextSecondary: {
            '&:hover': {
                color: theme.palette.text.primary,
            },
        },
        fullWidth: {
            width: '100%',
        },
        flexGrow: {
            flexGrow: 1,
        },
        fab: {
            position: 'fixed',
            bottom: theme.spacing(4),
            right: theme.spacing(4),
            [theme.breakpoints.down('md')]: {
                bottom: theme.spacing(3),
                right: theme.spacing(3),
            },
            [theme.breakpoints.down('sm')]: {
                bottom: theme.spacing(2),
                right: theme.spacing(2),
            },
        },
        flexHs: {
            display: 'flex',
            alignItems: 'flex-start',
            flexDirection: 'row',
        },
        flexHc: {
            display: 'flex',
            alignItems: 'center',
            flexDirection: 'row',
        },
        flexHe: {
            display: 'flex',
            alignItems: 'flex-end',
            flexDirection: 'row',
        },
        flexHb: {
            display: 'flex',
            alignItems: 'baseline',
            flexDirection: 'row',
        },
        flexVs: {
            display: 'flex',
            alignItems: 'start',
            flexDirection: 'column',
        },
        flexVc: {
            display: 'flex',
            alignItems: 'center',
            flexDirection: 'column',
        },
        flexVe: {
            display: 'flex',
            alignItems: 'flex-end',
            flexDirection: 'column',
        },
        clickable: {
            cursor: 'pointer',
        },
        linkBtn: {
            textTransform: 'none',
        },
        inlineEditTextField: {
            '& .MuiInputBase-root::before': {
                borderBottomColor: 'rgba(0,0,0,0)',
            },
        },
        densTextField: {
            '& .MuiInputBase-input':{
                padding: theme.spacing(1),
            }
        },
        noTextSelect: {
            userSelect: 'none',
        },
    };
    return sc;
}

export function getStyles(theme: Theme) {
    return {
        ...getContainerStyles(theme),
        ...getSkeletonStyles(theme),
        ...getToolbarStyles(theme),
        ...getDlgStyles(theme),
        ...getLayoutStyles(theme),
        ...getTableStyles(theme),
        ...getFormStyles(theme),
        ...getCardStyles(theme),
        ...getPaperStyles(theme),
        ...getTextStyles(theme),
        ...getTabStyles(theme),
        ...getStatusStyles(theme),
        ...getBreakpointStyles(theme),
        ...getMiscStyles(theme),
        ...getPaddingMarginStyles(theme),
    };
}

export function makeStyles(theme: Theme) {
    return createStyles(getStyles(theme));
}

export type CssClasses = TextCssClasses &
    ContainerCssClasses &
    PaddingMarginCssClasses &
    SkeletonCssClasses &
    LayoutCssClasses &
    ToolbarCssClasses &
    DlgCssClasses &
    TableCssClasses &
    FormCssClasses &
    CardCssClasses &
    PaperCssClasses &
    StatusCssClasses &
    BreakpointCssClasses &
    MiscCssClasses &
    TabCssClasses;

export type CssStyles = TextCssStyles &
    ContainerCssStyles &
    SkeletonCssStyles &
    LayoutCssStyles &
    ToolbarCssStyles &
    DlgCssStyles &
    FormCssStyles &
    CardCssStyles &
    PaperCssStyles &
    TableCssStyles &
    StatusCssStyles &
    BreakpointCssStyles &
    MiscCssStyles &
    TabCssStyles &
    //the most customized padding maragin has to put in the last
    PaddingMarginCssStyles;



const supportMatchMedia = typeof window !== 'undefined' && typeof window.matchMedia !== 'undefined';
export function isWidthUp(breakpoint: Breakpoint, theme: Theme) {
    return isMatchMedia(theme.breakpoints.up(breakpoint));
}
export function isWidthDown(breakpoint: Breakpoint, theme: Theme) {
    return isMatchMedia(theme.breakpoints.down(breakpoint));
}
export function isMatchMedia(query: string): boolean {
    if (supportMatchMedia) {
        query = query.replace(/^@media( ?)/m, '');
        return matchMedia(query).matches;
    }
    return false;
}
export function isDarkTheme(theme: Theme){
    return theme.palette.mode === 'dark';
}

export function getBoxPassedStyle(theme: Theme) {
    const style: React.CSSProperties = {
        color: theme.palette.getContrastText(theme.palette.success.main),
        backgroundColor: theme.palette.success.main,
    }
    return style;
}
export function getBoxUnknownStyle(theme: Theme) {
    const style: React.CSSProperties = {
        color: theme.palette.getContrastText(theme.palette.unknown.main),
        backgroundColor: theme.palette.unknown.main,
    }
    return style;
}
export function getBoxErrorStyle(theme: Theme) {
    const style: React.CSSProperties = {
        color: theme.palette.getContrastText(theme.palette.error.main),
        backgroundColor: theme.palette.error.main,
    }
    return style;
}
export function getBoxWarnStyle(theme: Theme) {
    const style: React.CSSProperties = {
        color: theme.palette.getContrastText(theme.palette.warning.main),
        backgroundColor: theme.palette.warning.main,
    }
    return style;
}
export function getBoxInfoStyle(theme: Theme) {
    const style: React.CSSProperties = {
        color: theme.palette.getContrastText(theme.palette.info.main),
        backgroundColor: theme.palette.info.main,
    }
    return style;
}
export function getBoxActiveStyle(theme: Theme) {
    const style: React.CSSProperties = {
        color: theme.palette.getContrastText(theme.palette.primary.main),
        backgroundColor: theme.palette.primary.main,
    }
    return style;
}
export function getBoxPassiveStyle(theme: Theme) {
    const style: React.CSSProperties = {
        color: theme.palette.getContrastText(theme.palette.unknown.main),
        backgroundColor: theme.palette.unknown.main,
    }
    return style;
}