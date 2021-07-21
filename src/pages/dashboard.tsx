import { useRouter } from "next/dist/client/router";
import { useAuth } from "../contexts/AuthContext";

export default function Dashboard() {
  const { isAutenticate, user } = useAuth();
  const router = useRouter();
  if (!isAutenticate) {
    router.push("/");
  }

  return (
    <>
      <h1>Dashboard</h1>
      <h1>{user?.email}</h1>
    </>
  );
}
