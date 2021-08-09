import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { validateUserPermitions } from "../utils/validateUserPermitions";

type UseCanParams = {
  permitions?: string[];
  roles?: string[];
};

export function useCan({ permitions = [], roles = [] }: UseCanParams) {
  const { user, isAutenticate } = useContext(AuthContext);

  if (!isAutenticate) {
    return false;
  }

  const userHasValidPermissions = validateUserPermitions({
    user,
    permissions: permitions,
    roles,
  });

  return userHasValidPermissions;
}
