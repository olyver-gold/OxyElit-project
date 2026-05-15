import { Navigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import { JSX } from "react";

function RotaProtegida({ children }: { children: JSX.Element }) {
    const { usuario } = useAuth();

    if (!usuario) {
        return <Navigate to="/login" />;
    }

    return children;
}

export default RotaProtegida;