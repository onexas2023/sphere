import TouchRipple from '@mui/material/ButtonBase/TouchRipple';
import { ThemeOptions, PaletteColorOptions } from '@mui/material/styles';


const primaryPaletteColorOptions: PaletteColorOptions = {
    main: '#9bc2ac',
    light: '#cbffe2',
    dark: '#5d7568',
    contrastText: '#fefefe',
}
const secondaryPaletteColorOptions: PaletteColorOptions = {
    main: '#f5bf39',
    light: '#ffe03b',
    dark: '#a88327',
    contrastText: '#fefefe',
}

const defaultThemeOptions: ThemeOptions = {
    palette: {
        primary: primaryPaletteColorOptions,
        secondary: secondaryPaletteColorOptions,
        success: {
            main: '#43a047',
            light: '#76d275',
            dark: '#00701a',
            contrastText: '#e8f5e9',
        },
        info: {
            main: '#1976d2',
            light: '#63a4ff',
            dark: '#004ba0',
            contrastText: '#e3f2fd',
        },
        warning: {
            main: '#fbc02d',
            light: '#fff263',
            dark: '#c49000',
            contrastText: '#fffde7',
        },
        error: {
            main: '#e53935',
            light: '#ff6f60',
            dark: '#ab000d',
            contrastText: '#fffde7',
        },
        unknown: {
            main: '#90a4ae',
            light: '#c1d5e0',
            dark: '#62757f',
            contrastText: '#eceff1',
        },
    },
    sphere: {
        portal: {
            bgColor: '#9bc2ac0a',
            textColor: '#3f3f3f',
        },
        appbar: {
            bgColor: '#3f3f3f',
            textColor: '#fefefe',
            iconSize: 32,
            minHeight: 64,
        },
        notificationSider: {
            width: 300,
        },
        menuSider: {
            width: 56,
            openWidth: 300,
            itemPadding: 8,
            iconSize: 32,
        },
        applinksPopover: {
            tilesSize: 96,
            imageSize: 56,
        },
    },
    components: {
        MuiFormLabel: {
            styleOverrides: {
                asterisk: {
                    color: '#db3131',
                    '&.error': {
                        color: '#db3131',
                    },
                },
            }
        },
        MuiInputBase: {
            styleOverrides: {
                root: {
                    '&.MuiInputBase-root': {
                        borderRadius: 0,
                    }
                }
            }
        },
        MuiTextField: {
            defaultProps: {
                variant: 'standard'
            }
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    '&.MuiButton-root': {
                        borderRadius: 0,
                        padding: "10px 16px",
                        boxShadow: "none"
                    }
                }
            }
        },
        MuiIconButton: {
            styleOverrides: {
                root: {
                    '&.MuiIconButton-sizeLarge': {
                        fontSize: '2rem'
                    },
                    '&.MuiIconButton-sizeMedium': {
                        fontSize: '1.2rem'
                    },
                    '&.MuiIconButton-sizeSmall': {
                        fontSize: '1rem'
                    }
                }
            }
        },
        MuiButtonBase: {
            styleOverrides: {
                root: {
                    '& .MuiTouchRipple-child': {
                        backgroundColor: primaryPaletteColorOptions.main
                    }
                }
            }
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    '&.MuiPaper-root': {
                        borderRadius: 0,
                    }
                }
            }
        },
        MuiDialogTitle: {
            styleOverrides: {
                root: {
                    '&.MuiDialogTitle-root': {
                        padding: 16
                    }
                }
            }
        },
        MuiTab: {
            styleOverrides: {
                root: {
                    '&.MuiTab-root': {
                        fontSize: '1rem',
                        '&:hover': {
                            color: primaryPaletteColorOptions.main
                        }
                    }
                }
            }
        },
        MuiBreadcrumbs: {
            styleOverrides: {
                root: {
                    '& .MuiTypography-root': {
                        fontSize: '1.1rem'
                    }
                }
            }
        },
        MuiAccordionSummary: {
            styleOverrides: {
                root: {
                    '&.MuiAccordionSummary-root': {
                        minHeight: 48,
                        '&.Mui-expanded': {
                            minHeight: 56,
                        }
                    },
                },
                content: {
                    '&.MuiAccordionSummary-content': {
                        margin: 0
                    }
                }
            }
        },
        MuiAvatar: {
            styleOverrides: {
                root: {
                    '&.MuiAvatar-colorDefault': {
                        backgroundColor: primaryPaletteColorOptions.main
                    }
                }
            }
        }
    },
};

export default defaultThemeOptions;
