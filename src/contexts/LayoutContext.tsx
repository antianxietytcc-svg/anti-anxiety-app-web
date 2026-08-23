import { createContext, useState, type ReactNode } from "react";

interface LayoutProviderProps {
  children: ReactNode;
}

interface LayoutContextType {
  menuAberto: boolean;
  emailUsuario: string;
  setMenuAberto: (aberto: boolean) => void;
  setEmailUsuario: (email: string) => void;
}

export const LayoutContext = createContext<LayoutContextType>({
  menuAberto: false,
  emailUsuario: "",
  setMenuAberto: () => {},
  setEmailUsuario: () => {},
});

export function LayoutProvider({ children }: LayoutProviderProps) {
  const [menuAberto, setMenuAberto] = useState(false);
  const [emailUsuario, setEmailUsuario] = useState("");

  return (
    <LayoutContext.Provider
      value={{ menuAberto, setMenuAberto, emailUsuario, setEmailUsuario }}
    >
      {children}
    </LayoutContext.Provider>
  );
}
