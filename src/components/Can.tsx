import { ReactNode } from "react";
import { useCan } from "../hooks/useCan";

interface CanProps {
  children: ReactNode;
  permitions?: string[];
  roles?: [];
}

export function Can({ children, permitions, roles }: CanProps) {
  const userCanSeeComponent = useCan({ permitions, roles });
  if (!userCanSeeComponent) {
    return null;
  }
  return <>{children}</>;
}
