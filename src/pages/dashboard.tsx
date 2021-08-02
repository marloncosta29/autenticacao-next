import { useAuth } from "../contexts/AuthContext";
import { withSSRAuth } from "../utils/withSSRAuth";

export default function Dashboard() {
  const { user } = useAuth();
  return (
    <>
      <h1>Dashboard</h1>
      <h1>{user?.email}</h1>
    </>
  );
}

export const getServerSideProps = withSSRAuth(async (ctx) => {
  return {
    props: {},
  };
});
