import { initializeApp, getApps } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getAuth, type Auth } from "firebase/auth";

// ---------------------------------------------------------------------------
// Configuração do Firebase — credenciais via variáveis de ambiente (.env.local)
// Não commitar valores reais. Usar EXPO_PUBLIC_ prefix para expo-router.
// ---------------------------------------------------------------------------
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? "",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? "",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? "",
};

export const firebaseConfigurado = Object.values(firebaseConfig).every((valor) => valor.trim());

export let db: Firestore;
export let auth: Auth;

if (firebaseConfigurado) {
  const app = getApps()[0] ?? initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);
}
