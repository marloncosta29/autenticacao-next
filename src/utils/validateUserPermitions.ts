type User = {
  permissions: string[];
  roles: string[];
};
type ValidateUserPermissionsParams = {
  user: User | undefined;
  permissions?: string[];
  roles?: string[];
};

export function validateUserPermitions({
  user,
  permissions = [],
  roles = [],
}: ValidateUserPermissionsParams) {
  if (permissions.length > 0) {
    const hasAllPermitions = permissions.every((permition) => {
      return user?.permissions.includes(permition);
    });

    if (!hasAllPermitions) {
      return false;
    }
  }

  if (roles.length > 0) {
    const hasAllRoles = roles.some((role) => {
      return user?.roles.includes(role);
    });
    if (!hasAllRoles) {
      return false;
    }
  }
  return true;
}
