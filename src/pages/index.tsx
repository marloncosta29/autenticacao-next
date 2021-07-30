import { GetServerSideProps } from "next";
import { parseCookies } from "nookies";
import { FormEvent, useState } from "react";
import { useAuth } from "../contexts/AuthContext";

export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { signIn, isAutenticate } = useAuth();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const data = {
      email,
      password,
    };
    await signIn(data);
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="password"
      />
      <button type="submit">Entrar</button>
    </form>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const cookies = parseCookies(ctx);

  if (cookies["token"]) {
    return {
      redirect: {
        destination: "/dashboard",
        permanent: false,
      },
      props: {},
    };
  }

  return {
    props: {},
  };
};
