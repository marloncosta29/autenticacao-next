import Router from "next/dist/client/router";
import React, { createContext, useContext, useEffect, useState } from "react";
import { api } from "../services/apiClient";
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
  signOut(): void;
  isAutenticate: boolean;
  user: User | undefined;
};

let authChannel: BroadcastChannel;

export const signInOut = () => {
  destroyCookie(undefined, "token");
  destroyCookie(undefined, "refreshToken");

  authChannel.postMessage("logout");
  Router.push("/");
};

export const AuthContext = createContext<AuthContextData>(
  {} as AuthContextData
);

export const AuthProvider: React.FC = ({ children }) => {
  const [user, setUser] = useState<User>();

  const isAutenticate = !!user;

  useEffect(() => {
    authChannel = new BroadcastChannel("auth");
    authChannel.onmessage = (message) => {
      switch (message.data) {
        case "logout":
          signInOut();
          break;
        default:
          break;
      }
    };
  }, []);

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
    <AuthContext.Provider
      value={{ isAutenticate, signIn, user, signOut: signInOut }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
