import {RequestsPage} from "../pages/RequestsPage/RequestsPage.tsx";
import {Navbar} from "../widgets/Navbar/ui/Navbar.tsx";
import {ProtectedRoute, PublicRoute} from "./providers/Router.tsx";
import {LoginPage} from "../pages/LoginPage/LoginPage.tsx";
import {LoginPagePrototype} from "../pages/Prototypes/LoginPagePrototype.tsx";
import {Navigate, Route, Routes} from "react-router-dom";
import {useAuthStore} from "../entities/user/store.ts";
import Cookies from "js-cookie";


function App() {

  return (
    <>
        <Navbar/>
        {/*<Routes>*/}
        {/*    <Route element={<PublicRoute />}>*/}
        {/*        <Route path="/login" element={<LoginPagePrototype />} />*/}
        {/*    </Route>*/}
        {/*    <Route element={<ProtectedRoute />}>*/}
        {/*        <Route path="/requests" element={<RequestsPage />} />*/}
        {/*    </Route>*/}
        {/*    <Route*/}
        {/*        path="/"*/}
        {/*        element={*/}
        {/*            <Navigate*/}
        {/*                to={Cookies.get("access_refresh") ? "/requests" : "/login"}*/}
        {/*                replace*/}
        {/*            />*/}
        {/*        }*/}
        {/*    />*/}
        {/*</Routes>*/}

        <Routes>
            <Route element={<PublicRoute/>}>
                <Route path="/login" element={<LoginPagePrototype />} />
            </Route>
            <Route element={<ProtectedRoute/>}>
                <Route path="/requests" element={<RequestsPage />} />
            </Route>
            <Route
                path="/"
                element={
                    <Navigate
                        to={Cookies.get("access_refresh") ? "/requests" : "/login"}
                        replace
                    />
                }
            />
        </Routes>
    </>
  )
}

export default App
