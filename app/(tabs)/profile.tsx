import { useContext, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import {
  Settings,
  Calendar,
  Heart,
  MessageCircle,
  Award,
  Phone,
  Camera,
  Lock,
  EyeOff,
  Mail,
  ChevronRight,
  X,
} from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import { GradientBackground } from "../../src/components/GradientBackground";
import { COLORS } from "../../src/constants/theme";
import { LayoutContext } from "../../src/contexts/LayoutContext";
import { getIniciais } from "../../src/components/Avatar";
import { alterarSenha, alterarEmail } from "../../src/lib/firestore";

// ---------------------------------------------------------------------------
// Componente de campo de edição inline
// ---------------------------------------------------------------------------
interface CampoEdicaoProps {
  label: string;
  valor: string;
  aoSalvar: (v: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
}

function CampoEdicao({ label, valor, aoSalvar, placeholder, secureTextEntry }: CampoEdicaoProps) {
  const [editando, setEditando] = useState(false);
  const [texto, setTexto] = useState(valor);

  function salvar() {
    if (texto.trim()) aoSalvar(texto.trim());
    setEditando(false);
  }

  if (!editando) {
    return (
      <Pressable
        onPress={() => setEditando(true)}
        style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 6 }}
      >
        <View>
          <Text style={{ fontSize: 11, color: COLORS.sky500 }}>{label}</Text>
          <Text style={{ fontSize: 14, color: COLORS.sky800 }}>{valor || placeholder || "–"}</Text>
        </View>
        <ChevronRight size={16} color={COLORS.sky400} strokeWidth={1.5} />
      </Pressable>
    );
  }

  return (
    <View style={{ paddingVertical: 6 }}>
      <Text style={{ fontSize: 11, color: COLORS.sky500, marginBottom: 4 }}>{label}</Text>
      <View style={{ flexDirection: "row", gap: 8 }}>
        <TextInput
          value={texto}
          onChangeText={setTexto}
          secureTextEntry={secureTextEntry}
          style={{
            flex: 1,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: "#bae6fd",
            backgroundColor: "#f0f9ff",
            paddingHorizontal: 12,
            paddingVertical: 8,
            color: COLORS.sky800,
            fontSize: 14,
          }}
        />
        <Pressable
          onPress={salvar}
          style={{
            backgroundColor: COLORS.sky400,
            borderRadius: 10,
            paddingHorizontal: 14,
            justifyContent: "center",
          }}
        >
          <Text style={{ color: "#fff", fontSize: 13 }}>OK</Text>
        </Pressable>
        <Pressable
          onPress={() => { setTexto(valor); setEditando(false); }}
          style={{
            backgroundColor: "#f1f5f9",
            borderRadius: 10,
            paddingHorizontal: 12,
            justifyContent: "center",
          }}
        >
          <X size={16} color={COLORS.sky600} />
        </Pressable>
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Modal alterar senha
// ---------------------------------------------------------------------------
function ModalAlterarSenha({ visivel, aoFechar }: { visivel: boolean; aoFechar: () => void }) {
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState(false);
  const [carregando, setCarregando] = useState(false);

  async function handleSalvar() {
    setErro("");
    if (!senhaAtual) { setErro("Digite a senha atual."); return; }
    if (!novaSenha || novaSenha.length < 6) { setErro("Nova senha deve ter pelo menos 6 caracteres."); return; }
    if (novaSenha !== confirmar) { setErro("As senhas não coincidem."); return; }
    setCarregando(true);
    const res = await alterarSenha(senhaAtual, novaSenha);
    setCarregando(false);
    if (res.sucesso) {
      setSucesso(true);
      setTimeout(() => { setSucesso(false); aoFechar(); setSenhaAtual(""); setNovaSenha(""); setConfirmar(""); }, 1500);
    } else {
      setErro(res.erro ?? "Erro ao alterar senha.");
    }
  }

  const inputStyle = {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#bae6fd",
    backgroundColor: "#f0f9ff",
    paddingHorizontal: 14,
    paddingVertical: 11,
    color: COLORS.sky800,
    fontSize: 14,
  } as const;

  return (
    <Modal visible={visivel} transparent animationType="fade" onRequestClose={aoFechar}>
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.35)", justifyContent: "center", alignItems: "center", padding: 20 }}>
        <View style={{ width: "100%", maxWidth: 400, backgroundColor: "#fff", borderRadius: 20, padding: 24 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <Text style={{ fontSize: 18, color: COLORS.sky700 }}>Alterar senha</Text>
            <Pressable onPress={aoFechar}><X size={20} color={COLORS.sky500} /></Pressable>
          </View>
          {sucesso ? (
            <Text style={{ textAlign: "center", color: "#166534", fontSize: 15, paddingVertical: 20 }}>✅ Senha alterada com sucesso!</Text>
          ) : (
            <View style={{ gap: 12 }}>
              <View>
                <Text style={{ fontSize: 12, color: COLORS.sky600, marginBottom: 4 }}>Senha atual</Text>
                <TextInput value={senhaAtual} onChangeText={setSenhaAtual} secureTextEntry placeholder="••••••••" placeholderTextColor={COLORS.sky300} style={inputStyle} />
              </View>
              <View>
                <Text style={{ fontSize: 12, color: COLORS.sky600, marginBottom: 4 }}>Nova senha</Text>
                <TextInput value={novaSenha} onChangeText={setNovaSenha} secureTextEntry placeholder="Mín. 6 caracteres" placeholderTextColor={COLORS.sky300} style={inputStyle} />
              </View>
              <View>
                <Text style={{ fontSize: 12, color: COLORS.sky600, marginBottom: 4 }}>Confirmar nova senha</Text>
                <TextInput value={confirmar} onChangeText={setConfirmar} secureTextEntry placeholder="••••••••" placeholderTextColor={COLORS.sky300} style={inputStyle} />
              </View>
              {erro ? <Text style={{ color: "#ef4444", fontSize: 13, textAlign: "center" }}>{erro}</Text> : null}
              <Pressable
                onPress={handleSalvar}
                disabled={carregando}
                style={{ backgroundColor: COLORS.sky400, borderRadius: 12, paddingVertical: 13, alignItems: "center", marginTop: 4, opacity: carregando ? 0.7 : 1 }}
              >
                {carregando ? <ActivityIndicator color="#fff" /> : <Text style={{ color: "#fff", fontSize: 15 }}>Salvar</Text>}
              </Pressable>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// Modal alterar email
// ---------------------------------------------------------------------------
function ModalAlterarEmail({ visivel, aoFechar }: { visivel: boolean; aoFechar: () => void }) {
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novoEmail, setNovoEmail] = useState("");
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState(false);
  const [carregando, setCarregando] = useState(false);

  async function handleSalvar() {
    setErro("");
    if (!senhaAtual) { setErro("Digite a senha atual."); return; }
    if (!novoEmail.includes("@")) { setErro("Informe um e-mail válido."); return; }
    setCarregando(true);
    const res = await alterarEmail(senhaAtual, novoEmail);
    setCarregando(false);
    if (res.sucesso) {
      setSucesso(true);
      setTimeout(() => { setSucesso(false); aoFechar(); setSenhaAtual(""); setNovoEmail(""); }, 1500);
    } else {
      setErro(res.erro ?? "Erro ao alterar e-mail.");
    }
  }

  const inputStyle = {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#bae6fd",
    backgroundColor: "#f0f9ff",
    paddingHorizontal: 14,
    paddingVertical: 11,
    color: COLORS.sky800,
    fontSize: 14,
  } as const;

  return (
    <Modal visible={visivel} transparent animationType="fade" onRequestClose={aoFechar}>
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.35)", justifyContent: "center", alignItems: "center", padding: 20 }}>
        <View style={{ width: "100%", maxWidth: 400, backgroundColor: "#fff", borderRadius: 20, padding: 24 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <Text style={{ fontSize: 18, color: COLORS.sky700 }}>Alterar e-mail</Text>
            <Pressable onPress={aoFechar}><X size={20} color={COLORS.sky500} /></Pressable>
          </View>
          {sucesso ? (
            <Text style={{ textAlign: "center", color: "#166534", fontSize: 15, paddingVertical: 20 }}>✅ E-mail alterado com sucesso!</Text>
          ) : (
            <View style={{ gap: 12 }}>
              <View>
                <Text style={{ fontSize: 12, color: COLORS.sky600, marginBottom: 4 }}>Senha atual</Text>
                <TextInput value={senhaAtual} onChangeText={setSenhaAtual} secureTextEntry placeholder="••••••••" placeholderTextColor={COLORS.sky300} style={inputStyle} />
              </View>
              <View>
                <Text style={{ fontSize: 12, color: COLORS.sky600, marginBottom: 4 }}>Novo e-mail</Text>
                <TextInput value={novoEmail} onChangeText={setNovoEmail} keyboardType="email-address" autoCapitalize="none" placeholder="novo@email.com" placeholderTextColor={COLORS.sky300} style={inputStyle} />
              </View>
              {erro ? <Text style={{ color: "#ef4444", fontSize: 13, textAlign: "center" }}>{erro}</Text> : null}
              <Pressable
                onPress={handleSalvar}
                disabled={carregando}
                style={{ backgroundColor: COLORS.sky400, borderRadius: 12, paddingVertical: 13, alignItems: "center", marginTop: 4, opacity: carregando ? 0.7 : 1 }}
              >
                {carregando ? <ActivityIndicator color="#fff" /> : <Text style={{ color: "#fff", fontSize: 15 }}>Salvar</Text>}
              </Pressable>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// Modal de Privacidade
// ---------------------------------------------------------------------------
interface PrivacidadeOpcao {
  chave: keyof { ocultar_perfil: boolean; ocultar_foto: boolean; ocultar_nome: boolean; restringir_mensagens: boolean };
  label: string;
  descricao: string;
}

const opcoesPrivacidade: PrivacidadeOpcao[] = [
  { chave: "ocultar_perfil", label: "Ocultar perfil", descricao: "Seu perfil não aparece em buscas" },
  { chave: "ocultar_foto", label: "Ocultar foto de perfil", descricao: "Outros verão apenas suas iniciais" },
  { chave: "ocultar_nome", label: "Ocultar nome real", descricao: "Exibir apenas iniciais no app" },
  { chave: "restringir_mensagens", label: "Restringir mensagens", descricao: "Só recebe msgs de contatos aprovados" },
];

function ModalPrivacidade({
  visivel,
  aoFechar,
  valores,
  aoAlternar,
}: {
  visivel: boolean;
  aoFechar: () => void;
  valores: Record<string, boolean>;
  aoAlternar: (chave: string, valor: boolean) => void;
}) {
  return (
    <Modal visible={visivel} transparent animationType="slide" onRequestClose={aoFechar}>
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.35)", justifyContent: "flex-end" }}>
        <View style={{ backgroundColor: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <Text style={{ fontSize: 18, color: COLORS.sky700 }}>Privacidade</Text>
            <Pressable onPress={aoFechar}><X size={20} color={COLORS.sky500} /></Pressable>
          </View>
          {opcoesPrivacidade.map((op, idx) => (
            <View
              key={op.chave}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingVertical: 14,
                borderBottomWidth: idx < opcoesPrivacidade.length - 1 ? 1 : 0,
                borderBottomColor: "#f1f5f9",
              }}
            >
              <View style={{ flex: 1, marginRight: 12 }}>
                <Text style={{ fontSize: 14, color: COLORS.sky800 }}>{op.label}</Text>
                <Text style={{ fontSize: 12, color: COLORS.sky500 }}>{op.descricao}</Text>
              </View>
              <Pressable
                onPress={() => aoAlternar(op.chave, !valores[op.chave])}
                style={{
                  width: 48,
                  height: 28,
                  borderRadius: 14,
                  backgroundColor: valores[op.chave] ? COLORS.sky400 : "#cbd5e1",
                  justifyContent: "center",
                  paddingHorizontal: 2,
                }}
              >
                <View
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 11,
                    backgroundColor: "#fff",
                    transform: [{ translateX: valores[op.chave] ? 20 : 0 }],
                    shadowColor: "#000",
                    shadowOpacity: 0.15,
                    shadowRadius: 2,
                    elevation: 2,
                  }}
                />
              </Pressable>
            </View>
          ))}
        </View>
      </View>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// Tela de Perfil principal
// ---------------------------------------------------------------------------
export default function Profile() {
  const router = useRouter();
  const { nomeUsuario, emailUsuario, usuarioLogado, logout, atualizarPerfilLocal } = useContext(LayoutContext);

  const [modalSenha, setModalSenha] = useState(false);
  const [modalEmail, setModalEmail] = useState(false);
  const [modalPrivacidade, setModalPrivacidade] = useState(false);
  const [modalAjuda, setModalAjuda] = useState(false);
  const [salvandoFoto, setSalvandoFoto] = useState(false);

  const tipoConta = usuarioLogado?.tipo_conta ?? "paciente";

  const privacidade = {
    ocultar_perfil: usuarioLogado?.ocultar_perfil ?? false,
    ocultar_foto: usuarioLogado?.ocultar_foto ?? false,
    ocultar_nome: usuarioLogado?.ocultar_nome ?? false,
    restringir_mensagens: usuarioLogado?.restringir_mensagens ?? false,
  };

  const dataCadastro = usuarioLogado?.data_cadastro
    ? new Date(usuarioLogado.data_cadastro).toLocaleDateString("pt-BR")
    : "–";

  const stats =
    tipoConta === "paciente"
      ? [
          { label: "Dias consecutivos", value: "–", Icon: Calendar },
          { label: "Sessões", value: "–", Icon: MessageCircle },
          { label: "Conquistas", value: "–", Icon: Award },
        ]
      : [
          { label: "Pacientes", value: "–", Icon: MessageCircle },
          { label: "Sessões/mês", value: "–", Icon: Calendar },
          { label: "Avaliação", value: String(usuarioLogado?.media_avaliacao?.toFixed(1) ?? "–"), Icon: Heart },
        ];

  async function escolherFoto() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
      base64: false,
    });
    if (!result.canceled && result.assets[0]) {
      setSalvandoFoto(true);
      // Para o protótipo: salva a URI local. Em produção, faria upload para Firebase Storage.
      await atualizarPerfilLocal({ foto_url: result.assets[0].uri });
      setSalvandoFoto(false);
    }
  }

  async function alternarPrivacidade(chave: string, valor: boolean) {
    await atualizarPerfilLocal({ [chave]: valor } as any);
  }

  async function handleSalvarNome(novoNome: string) {
    await atualizarPerfilLocal({ nome: novoNome });
  }

  const nomeMostrado = usuarioLogado?.ocultar_nome
    ? getIniciais(nomeUsuario || "U")
    : nomeUsuario || "Usuário";

  return (
    <GradientBackground>
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 24,
          paddingVertical: 14,
          backgroundColor: "rgba(255,255,255,0.8)",
          borderBottomWidth: 1,
          borderBottomColor: "rgba(186,230,253,0.5)",
        }}
      >
        <Text style={{ fontSize: 22, color: COLORS.sky700 }}>Perfil</Text>
        <View style={{ flexDirection: "row", gap: 12 }}>
          <Pressable
            onPress={() => setModalPrivacidade(true)}
            accessibilityLabel="Privacidade"
          >
            <EyeOff size={22} color={COLORS.sky600} strokeWidth={1.5} />
          </Pressable>
          <Pressable
            accessibilityLabel="Configurações"
          >
            <Settings size={24} color={COLORS.sky600} strokeWidth={1.5} />
          </Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100, gap: 16 }}>
        {/* Avatar e Info */}
        <View
          style={{
            alignItems: "center",
            backgroundColor: "rgba(255,255,255,0.8)",
            borderRadius: 20,
            padding: 24,
            shadowColor: "#000",
            shadowOpacity: 0.06,
            shadowRadius: 8,
            elevation: 2,
          }}
        >
          {/* Foto de perfil */}
          <Pressable onPress={escolherFoto} style={{ marginBottom: 12 }} accessibilityLabel="Trocar foto de perfil">
            {salvandoFoto ? (
              <View style={{ width: 88, height: 88, borderRadius: 44, backgroundColor: COLORS.sky100, alignItems: "center", justifyContent: "center" }}>
                <ActivityIndicator color={COLORS.sky400} />
              </View>
            ) : usuarioLogado?.foto_url && !usuarioLogado.ocultar_foto ? (
              <View style={{ position: "relative" }}>
                <Image
                  source={{ uri: usuarioLogado.foto_url }}
                  style={{ width: 88, height: 88, borderRadius: 44 }}
                  contentFit="cover"
                />
                <View style={{ position: "absolute", bottom: 0, right: 0, backgroundColor: COLORS.sky400, borderRadius: 14, padding: 4 }}>
                  <Camera size={14} color="#fff" strokeWidth={2} />
                </View>
              </View>
            ) : (
              <View style={{ position: "relative" }}>
                <View
                  style={{
                    width: 88,
                    height: 88,
                    borderRadius: 44,
                    backgroundColor: COLORS.sky300,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text style={{ fontSize: 28, color: "#fff" }}>
                    {nomeUsuario ? getIniciais(nomeUsuario) : "??"}
                  </Text>
                </View>
                <View style={{ position: "absolute", bottom: 0, right: 0, backgroundColor: COLORS.sky400, borderRadius: 14, padding: 4 }}>
                  <Camera size={14} color="#fff" strokeWidth={2} />
                </View>
              </View>
            )}
          </Pressable>

          {/* Nome editável */}
          <CampoEdicao
            label="Nome de exibição"
            valor={nomeMostrado}
            aoSalvar={handleSalvarNome}
            placeholder="Seu nome"
          />

          {emailUsuario ? (
            <Text style={{ fontSize: 13, color: COLORS.sky500, marginTop: 4 }}>{emailUsuario}</Text>
          ) : null}

          <Text style={{ fontSize: 12, color: COLORS.sky400, marginTop: 4 }}>
            Membro desde {dataCadastro}
          </Text>

          {/* Badge tipo de conta */}
          <View
            style={{
              marginTop: 10,
              paddingHorizontal: 16,
              paddingVertical: 5,
              borderRadius: 20,
              backgroundColor: tipoConta === "psicologo" ? "#e0f2fe" : COLORS.sky100,
            }}
          >
            <Text style={{ fontSize: 13, color: tipoConta === "psicologo" ? COLORS.sky700 : COLORS.sky600 }}>
              {tipoConta === "psicologo" ? "🩺 Psicólogo(a)" : "👤 Paciente"}
            </Text>
          </View>

          {/* CRM para psicólogo */}
          {tipoConta === "psicologo" && usuarioLogado?.crm ? (
            <Text style={{ fontSize: 12, color: COLORS.sky400, marginTop: 4 }}>{usuarioLogado.crm}</Text>
          ) : null}
        </View>

        {/* Estatísticas */}
        <View
          style={{
            backgroundColor: "rgba(255,255,255,0.8)",
            borderRadius: 20,
            padding: 20,
            shadowColor: "#000",
            shadowOpacity: 0.06,
            shadowRadius: 8,
            elevation: 2,
          }}
        >
          <Text style={{ fontSize: 16, color: COLORS.sky800, marginBottom: 16 }}>Estatísticas</Text>
          <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
            {stats.map((stat) => (
              <View key={stat.label} style={{ alignItems: "center" }}>
                <View
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    backgroundColor: COLORS.sky100,
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 8,
                  }}
                >
                  <stat.Icon size={22} color={COLORS.sky600} strokeWidth={1.5} />
                </View>
                <Text style={{ fontSize: 20, color: COLORS.sky800, marginBottom: 2 }}>{stat.value}</Text>
                <Text style={{ fontSize: 11, color: COLORS.sky500, textAlign: "center" }}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Segurança da conta */}
        <View
          style={{
            backgroundColor: "rgba(255,255,255,0.8)",
            borderRadius: 20,
            padding: 20,
            shadowColor: "#000",
            shadowOpacity: 0.06,
            shadowRadius: 8,
            elevation: 2,
            gap: 4,
          }}
        >
          <Text style={{ fontSize: 16, color: COLORS.sky800, marginBottom: 8 }}>Segurança</Text>
          <Pressable
            onPress={() => setModalSenha(true)}
            style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#f1f5f9" }}
          >
            <Lock size={18} color={COLORS.sky500} strokeWidth={1.5} />
            <Text style={{ flex: 1, fontSize: 14, color: COLORS.sky800 }}>Alterar senha</Text>
            <ChevronRight size={16} color={COLORS.sky400} strokeWidth={1.5} />
          </Pressable>
          <Pressable
            onPress={() => setModalEmail(true)}
            style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 12 }}
          >
            <Mail size={18} color={COLORS.sky500} strokeWidth={1.5} />
            <Text style={{ flex: 1, fontSize: 14, color: COLORS.sky800 }}>Alterar e-mail</Text>
            <ChevronRight size={16} color={COLORS.sky400} strokeWidth={1.5} />
          </Pressable>
        </View>

        {/* Menu */}
        <View
          style={{
            backgroundColor: "rgba(255,255,255,0.8)",
            borderRadius: 20,
            overflow: "hidden",
            shadowColor: "#000",
            shadowOpacity: 0.06,
            shadowRadius: 8,
            elevation: 2,
          }}
        >
          {[
            { label: "Contatos de Emergência", rota: "/contatos-emergencia", Icon: Phone },
            { label: "Sons", rota: "/sons", Icon: null },
            { label: "Sobre", rota: "/sobre", Icon: null },
          ].map((opcao, index, arr) => (
            <Pressable
              key={opcao.label}
              onPress={() => router.push(opcao.rota as any)}
              accessibilityRole="button"
              accessibilityLabel={opcao.label}
              style={({ pressed }) => ({
                paddingHorizontal: 20,
                paddingVertical: 16,
                backgroundColor: pressed ? "rgba(240,249,255,0.8)" : "transparent",
                borderBottomWidth: index < arr.length - 1 ? 1 : 0,
                borderBottomColor: "rgba(186,230,253,0.3)",
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
              })}
            >
              {opcao.Icon && <opcao.Icon size={18} color={COLORS.sky500} strokeWidth={1.5} />}
              <Text style={{ flex: 1, fontSize: 15, color: COLORS.sky800 }}>{opcao.label}</Text>
              <ChevronRight size={16} color={COLORS.sky400} strokeWidth={1.5} />
            </Pressable>
          ))}

          {/* Ajuda e suporte */}
          <Pressable
            onPress={() => setModalAjuda(true)}
            accessibilityRole="button"
            style={({ pressed }) => ({
              paddingHorizontal: 20,
              paddingVertical: 16,
              backgroundColor: pressed ? "rgba(240,249,255,0.8)" : "transparent",
              borderBottomWidth: 1,
              borderBottomColor: "rgba(186,230,253,0.3)",
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
            })}
          >
            <Text style={{ flex: 1, fontSize: 15, color: COLORS.sky800 }}>Ajuda e Suporte</Text>
            <ChevronRight size={16} color={COLORS.sky400} strokeWidth={1.5} />
          </Pressable>

          {/* Privacidade */}
          <Pressable
            onPress={() => setModalPrivacidade(true)}
            accessibilityRole="button"
            style={({ pressed }) => ({
              paddingHorizontal: 20,
              paddingVertical: 16,
              backgroundColor: pressed ? "rgba(240,249,255,0.8)" : "transparent",
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
            })}
          >
            <EyeOff size={18} color={COLORS.sky500} strokeWidth={1.5} />
            <Text style={{ flex: 1, fontSize: 15, color: COLORS.sky800 }}>Privacidade</Text>
            <ChevronRight size={16} color={COLORS.sky400} strokeWidth={1.5} />
          </Pressable>
        </View>

        {/* Sair */}
        <Pressable
          onPress={async () => {
            await logout();
            router.replace("/");
          }}
          accessibilityRole="button"
          accessibilityLabel="Sair da conta"
          style={({ pressed }) => ({
            backgroundColor: pressed ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.8)",
            borderRadius: 20,
            paddingVertical: 16,
            alignItems: "center",
            shadowColor: "#000",
            shadowOpacity: 0.06,
            shadowRadius: 8,
            elevation: 2,
          })}
        >
          <Text style={{ color: "#ef4444", fontSize: 15 }}>Sair da conta</Text>
        </Pressable>
      </ScrollView>

      {/* Modais */}
      <ModalAlterarSenha visivel={modalSenha} aoFechar={() => setModalSenha(false)} />
      <ModalAlterarEmail visivel={modalEmail} aoFechar={() => setModalEmail(false)} />
      <ModalPrivacidade
        visivel={modalPrivacidade}
        aoFechar={() => setModalPrivacidade(false)}
        valores={privacidade}
        aoAlternar={alternarPrivacidade}
      />

      {/* Modal Ajuda e Suporte */}
      <Modal visible={modalAjuda} transparent animationType="slide" onRequestClose={() => setModalAjuda(false)}>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.35)", justifyContent: "flex-end" }}>
          <View style={{ backgroundColor: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <Text style={{ fontSize: 18, color: COLORS.sky700 }}>Ajuda e Suporte</Text>
              <Pressable onPress={() => setModalAjuda(false)}><X size={20} color={COLORS.sky500} /></Pressable>
            </View>
            <Text style={{ fontSize: 14, color: COLORS.sky600, lineHeight: 22, marginBottom: 16 }}>
              Tem dúvidas, sugestões ou precisa de suporte? Entre em contato direto com a equipe Anti-Anxiety:
            </Text>
            <View style={{ backgroundColor: COLORS.sky50, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: "#bae6fd" }}>
              <Text style={{ fontSize: 14, color: COLORS.sky800, marginBottom: 4 }}>📧 E-mail dos criadores:</Text>
              <Text style={{ fontSize: 15, color: COLORS.sky600, fontWeight: "500" }}>anti.anxiety.tcc@gmail.com</Text>
            </View>
            <Text style={{ fontSize: 12, color: COLORS.sky500, marginTop: 12, textAlign: "center", lineHeight: 18 }}>
              Responderemos em até 48 horas úteis.{"\n"}Este app é um projeto de TCC de apoio ao bem-estar emocional.
            </Text>
          </View>
        </View>
      </Modal>
    </GradientBackground>
  );
}
