import { useRouter } from "next/dist/client/router";
import React, { createContext, useContext, useEffect, useState } from "react";
import { api } from "../services/api";
import { parseCookies, setCookie } from "nookies";
type User = {
  email: string;
  permissions: string[];
  roles: string[];
};

type SignInCredentials = {
  email: string;
  password: string;
};
type AuthContextData = {
  signIn(credentials: SignInCredentials): Promise<void>;
  isAutenticate: boolean;
  user: User | undefined;
};

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC = ({ children }) => {
  const [user, setUser] = useState<User>();
  const router = useRouter();
  const isAutenticate = !!user;

  useEffect(() => {
    const cookies = parseCookies();
    const { token } = cookies;
    if (token) {
      api.get("me").then((resp) => {
        const { email, permissions, roles } = resp.data;
        setUser({ email, permissions, roles });
      });
    }
  }, []);

  async function signIn({ email, password }: SignInCredentials) {
    try {
      const response = await api.post("sessions", { email, password });
      const { token, refreshToken, permissions, roles } = response.data;
      setCookie(undefined, "token", token, {
        maxAge: 60 * 60 * 24 * 30,
        path: "/",
      });
      setCookie(undefined, "refreshToken", refreshToken, {
        maxAge: 60 * 60 * 24 * 30,
        path: "/",
      });

      setUser({ email, permissions, roles });

      router.push("dashboard");
    } catch (error) {
      console.log(error.message);
    }
  }

  return (
    <AuthContext.Provider value={{ isAutenticate, signIn, user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
