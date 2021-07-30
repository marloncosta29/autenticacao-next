import Router from "next/dist/client/router";
import React, { createContext, useContext, useEffect, useState } from "react";
import { api } from "../services/api";
import { destroyCookie, parseCookies, setCookie } from "nookies";
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

export const signInOut = () => {
  destroyCookie(undefined, "token");
  destroyCookie(undefined, "refreshToken");
  Router.push("/");
};

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC = ({ children }) => {
  const [user, setUser] = useState<User>();

  const isAutenticate = !!user;

  useEffect(() => {
    const cookies = parseCookies();
    const { token } = cookies;
    if (token) {
      api
        .get("me")
        .then((resp) => {
          const { email, permissions, roles } = resp.data;
          setUser({ email, permissions, roles });
        })
        .catch(() => {
          signInOut();
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
      api.defaults.headers["Authorization"] = `Bearer ${token}`;
      Router.push("dashboard");
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
