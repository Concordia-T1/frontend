import {AppBar, Toolbar, Box} from "@mui/material";
import logo from "@shared/assets/logo.svg";
import {useAuthStore} from "@entities/user/store.ts";
import IconButton from "@mui/material/Button";
import {useNavigate} from "react-router-dom";
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import {theme} from "@app/providers/ThemeProvider/config/theme.ts";
import Cookies from "js-cookie";

export const Navbar = () => {
    const logout = useAuthStore(state => state.logout);
    const navigate = useNavigate();

    return (
        <AppBar
            position="static"
            sx={{
                backgroundColor: "#fff",
                color: "#000",
                boxShadow: "none"
            }}
        >
            <Toolbar>
                <Box
                    component="img"
                    src={logo}
                    alt="icon"
                    sx={{height: 40, mr: 2}}
                />

                <Box sx={{flexGrow: 1}}/>

                {Cookies.get("access_refresh") && (
                    <IconButton
                        color="inherit"
                        onClick={() => {
                            logout();
                            navigate("/login");
                        }}
                        sx={{
                            padding: 0,
                            color: theme.palette.brand.grayDark,
                            transition: '0.5s',
                            "&:hover": {
                                backgroundColor: theme.palette.brand.white,
                                color: theme.palette.brand.primary
                            }}}
                    >
                        <ExitToAppIcon sx={{ fontSize: 32 }}/>
                    </IconButton>

                )}
            </Toolbar>
        </AppBar>

    );
};
