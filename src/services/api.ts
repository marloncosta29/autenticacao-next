import axios, { AxiosError } from "axios";
import { parseCookies, setCookie } from "nookies";
import { signInOut } from "../contexts/AuthContext";
import { AuthTokenError } from "./errors/AuthTokenErrors";
let isRefreshing = false;
let failureRequests: any[] = [];

export function setupApiClient(ctx = undefined) {
  let cookies = parseCookies(ctx);

  const api = axios.create({
    baseURL: "http://localhost:3333/",
    headers: {
      Authorization: `Bearer ${cookies["token"]}`,
    },
  });

  api.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      if (error.response?.status === 401) {
        if (error.response.data.code === "token.expired") {
          //renova o token
          cookies = parseCookies(ctx);
          const { refreshToken } = cookies;

          const originalConfig = error.config;

          if (!isRefreshing) {
            isRefreshing = true;
            api
              .post("refresh", { refreshToken })
              .then((response) => {
                const { token, refreshToken } = response.data;

                console.log({ token });
                setCookie(ctx, "token", token, {
                  maxAge: 60 * 60 * 24 * 30,
                  path: "/",
                });
                setCookie(ctx, "refreshToken", refreshToken, {
                  maxAge: 60 * 60 * 24 * 30,
                  path: "/",
                });
                api.defaults.headers["Authorization"] = `Bearer ${token}`;
                failureRequests.forEach((request) => request.onSuccess(token));
                failureRequests = [];
              })
              .catch((err) => {
                failureRequests.forEach((request) => request.onFailure(err));
                failureRequests = [];
                if (process.browser) {
                  signInOut();
                }
              })
              .finally(() => {
                isRefreshing = false;
              });
          }

          return new Promise((resolve, reject) => {
            failureRequests.push({
              onSuccess: (token: string) => {
                originalConfig.headers["Authorization"] = `Bearer ${token}`;
                resolve(api(originalConfig));
              },
              onFailure: (error: AxiosError) => {
                reject(error);
              },
            });
          });
        } else {
          //deslogar
          if (process.browser) {
            signInOut();
          } else {
            return Promise.reject(new AuthTokenError());
          }
        }
      }
      return Promise.reject(error);
    }
  );
  return api;
}
