import { createTheme } from "@mui/material/styles";

declare module "@mui/material/styles" {
    interface Palette {
        brand: {
            primary: string;
            secondary: string;
            lightBlue: string;
            darkblue: string;
            pastelBlue: string;
            pastelGreen: string;
            pastelRed: string;
            pastelOrange: string;
            grayLight: string;
            grayMedium: string;
            grayDark: string;
            backgroundLight: string;
            white: string;
        };
    }
    interface PaletteOptions {
        brand?: {
            primary?: string;
            secondary?: string;
            lightBlue?: string;
            darkblue?: string;
            pastelBlue?: string;
            pastelGreen?: string;
            pastelRed?: string;
            pastelOrange?: string;
            grayLight?: string;
            grayMedium?: string;
            grayDark?: string;
            backgroundLight?: string;
            white?: string;
        };
    }
}

export const theme = createTheme({
    palette: {
        brand: {
            primary: "#000000",
            secondary: "#9C9C9C",
            white: "#FFFFFF",
            lightBlue: "#00AAE6",
            darkblue: "#008ACD",
            pastelBlue: "#B7D0FF",
            pastelGreen: "#96E399",
            pastelRed: "#FF8989",
            pastelOrange: "#FFD289",
            grayLight: "#D0D2D5",
            backgroundLight: "#ECF2F9",
            grayDark: "#82858E",
        },
    },
    typography: {
        fontFamily: `"ALS Hauss", "Roboto", "Arial", sans-serif`,
    },
    components: {
        MuiInputLabel: {
            styleOverrides: {
                root: {
                    "&.Mui-focused": {
                        color: "#00AAE6",
                    },
                },
            },
        },
        MuiInput: {
            styleOverrides: {
                underline: {
                    "&:after": {
                        borderBottomColor: "#00AAE6",
                    },
                },
            },
        },
        MuiCheckbox: {
            styleOverrides: {
                root: {
                    '&.Mui-checked': {
                        color: '#00AAE6',
                    },
                    '&.MuiCheckbox-indeterminate': {
                        color: '#00AAE6',
                    },
                    color: '#9C9C9C'
                },
            },
        },
        MuiOutlinedInput: {
            styleOverrides: {
                root: {
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#00AAE6",
                    },
                },
            },
        },
    },
});





