import { Can } from "../components/Can";
import { useAuth } from "../contexts/AuthContext";
import { useCan } from "../hooks/useCan";
import { withSSRAuth } from "../utils/withSSRAuth";

export default function Dashboard() {
  const { user, signOut } = useAuth();
  return (
    <>
      <h1>Dashboard</h1>
      <h1>{user?.email}</h1>
      <Can permitions={["metrics.list"]}>
        <div>Metricas</div>
      </Can>
      <button onClick={signOut}>Sair</button>
    </>
  );
}

export const getServerSideProps = withSSRAuth(async (ctx) => {
  return {
    props: {},
  };
});
