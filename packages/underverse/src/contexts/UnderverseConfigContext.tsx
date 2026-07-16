"use client";

import * as React from "react";
import type { BorderMode } from "../utils/radius";

export interface UnderverseUIConfig {
  /** Global default border mode for all components that support it */
  borderMode?: BorderMode;
  button?: {
    borderMode?: BorderMode;
  };
  input?: {
    borderMode?: BorderMode;
  };
  card?: {
    borderMode?: BorderMode;
  };
  table?: {
    borderMode?: BorderMode;
  };
  popover?: {
    borderMode?: BorderMode;
  };
  dropdownMenu?: {
    borderMode?: BorderMode;
  };
  modal?: {
    borderMode?: BorderMode;
  };
  // Future component configs can be added here
}

const UnderverseUIConfigContext = React.createContext<UnderverseUIConfig | null>(null);

/** Read the global UI config for Underverse components. */
export function useUnderverseUIConfig(): UnderverseUIConfig {
  return React.useContext(UnderverseUIConfigContext) ?? {};
}

export interface UnderverseConfigProviderProps {
  children: React.ReactNode;
  config?: UnderverseUIConfig;
}

/** Provider to configure global default styles/behaviors for Underverse components. */
export function UnderverseConfigProvider({ children, config }: UnderverseConfigProviderProps) {
  if (!config) return <>{children}</>;
  return <UnderverseUIConfigContext.Provider value={config}>{children}</UnderverseUIConfigContext.Provider>;
}
