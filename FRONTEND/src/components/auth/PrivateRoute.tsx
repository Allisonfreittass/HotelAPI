import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";

const PrivateRoute = () => {
  const { isLoggedIn } = useAuth();

  if (!isLoggedIn) {
    // Redireciona para a página de login caso o usuário não esteja logado
    return <Navigate to="/login" />;
  }

  return <Outlet />;
};

export default PrivateRoute;
