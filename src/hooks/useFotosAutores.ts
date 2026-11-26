import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ouvirFotoPerfil } from "../lib/firestore";

export function useFotosAutores(itens: ReadonlyArray<{ autorId: string }>) {
  const ids = JSON.stringify([...new Set(itens.map(({ autorId }) => autorId).filter(Boolean))].sort());
  const [fotos, setFotos] = useState<ReadonlyMap<string, string>>(new Map());

  useFocusEffect(useCallback(() => {
    setFotos(new Map());
    const cancelar = (JSON.parse(ids) as string[]).map((uid) => ouvirFotoPerfil(uid, (foto) => {
      setFotos((atuais) => {
        if (atuais.get(uid) === foto) return atuais;
        const novas = new Map(atuais);
        if (foto) novas.set(uid, foto);
        else novas.delete(uid);
        return novas;
      });
    }));
    return () => cancelar.forEach((desinscrever) => desinscrever());
  }, [ids]));

  return fotos;
}
