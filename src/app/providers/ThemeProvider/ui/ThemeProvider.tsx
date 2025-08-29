import { ThemeProvider as MUIThemeProvider } from "@mui/material/styles";
import { theme } from "../config/theme";
import { CssBaseline } from "@mui/material";
import type {ReactNode} from "react";

interface Props {
    children: ReactNode;
}

export const ThemeProvider = ({ children }: Props) => {
    return (
        <MUIThemeProvider theme={theme}>
            <CssBaseline />
            {children}
        </MUIThemeProvider>
    );
};
