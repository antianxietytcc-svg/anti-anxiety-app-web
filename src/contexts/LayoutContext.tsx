import { createContext, useState, type ReactNode } from "react";

interface LayoutProviderProps {
  children: ReactNode;
}

interface LayoutContextType {
  menuAberto: boolean;
  emailUsuario: string;
  nomeUsuario: string;
  setMenuAberto: (aberto: boolean) => void;
  setEmailUsuario: (email: string) => void;
  setNomeUsuario: (nome: string) => void;
}

export const LayoutContext = createContext<LayoutContextType>({
  menuAberto: false,
  emailUsuario: "",
  nomeUsuario: "",
  setMenuAberto: () => {},
  setEmailUsuario: () => {},
  setNomeUsuario: () => {},
});

export function LayoutProvider({ children }: LayoutProviderProps) {
  const [menuAberto, setMenuAberto] = useState(false);
  const [emailUsuario, setEmailUsuario] = useState("");
  const [nomeUsuario, setNomeUsuario] = useState("");

  return (
    <LayoutContext.Provider
      value={{ menuAberto, setMenuAberto, emailUsuario, setEmailUsuario, nomeUsuario, setNomeUsuario }}
    >
      {children}
    </LayoutContext.Provider>
  );
}
