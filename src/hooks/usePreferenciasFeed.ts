import { useEffect, useState } from "react";
import { collection, doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import type { PostFirestore } from "../lib/firestore";

type Preferencia = { salvo?: boolean; oculto?: boolean };
export type FiltroFeed = "recentes" | "salvos" | "ocultos";

export function usePreferenciasFeed(uid: string, recentes: PostFirestore[]) {
  const [filtro, setFiltro] = useState<FiltroFeed>("recentes");
  const [preferencias, setPreferencias] = useState<ReadonlyMap<string, Preferencia>>(new Map());
  const [extras, setExtras] = useState<ReadonlyMap<string, PostFirestore>>(new Map());
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(true);
  useEffect(() => {
    setFiltro("recentes");
    setPreferencias(new Map());
    setExtras(new Map());
    setErro("");
    setCarregando(Boolean(uid));
    if (!uid) return;
    return onSnapshot(collection(db, "usuarios", uid, "feed"), (snap) => {
      setPreferencias(new Map(snap.docs.map((item) => [item.id, item.data() as Preferencia])));
      setCarregando(false);
    }, () => {
      setErro("Não foi possível carregar suas preferências do feed.");
      setCarregando(false);
    });
  }, [uid]);

  const recentesIds = new Set(recentes.map((post) => post.id));
  const extrasIds = JSON.stringify(filtro === "recentes" ? [] : [...preferencias]
    .filter(([id, p]) => !recentesIds.has(id) && (filtro === "ocultos" ? p.oculto : p.salvo && !p.oculto))
    .map(([id]) => id).sort());

  useEffect(() => {
    setExtras(new Map());
    const cancelar = (JSON.parse(extrasIds) as string[]).map((id) =>
      onSnapshot(doc(db, "posts", id), (snap) => {
        setExtras((anteriores) => {
          const atual = new Map(anteriores);
          if (snap.exists()) atual.set(id, { ...snap.data() as Omit<PostFirestore, "id">, id });
          else atual.delete(id);
          return atual;
        });
      }, () => setErro("Não foi possível abrir uma publicação da lista.")));
    return () => cancelar.forEach((cancelarLeitura) => cancelarLeitura());
  }, [extrasIds]);

  const posts = [...recentes, ...[...extras.values()].filter((post) => !recentesIds.has(post.id))]
    .filter(({ id }) => {
      const p = preferencias.get(id);
      if (filtro === "ocultos") return Boolean(p?.oculto);
      if (filtro === "salvos") return Boolean(p?.salvo && !p.oculto);
      return !p?.oculto;
    }).sort((a, b) => b.timestamp - a.timestamp);

  async function alternar(id: string, chave: keyof Preferencia) {
    if (!uid) throw new Error("Entre para mudar suas preferências.");
    await setDoc(doc(db, "usuarios", uid, "feed", id), { [chave]: !preferencias.get(id)?.[chave] }, { merge: true });
  }

  return { posts, filtro, setFiltro, preferencias, alternar, erro, carregando };
}

