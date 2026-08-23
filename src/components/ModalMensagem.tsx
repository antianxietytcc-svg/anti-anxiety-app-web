import { Modal, Pressable, Text, View } from "react-native";

interface ModalMensagemProps {
  exibir: boolean;
  titulo: string;
  texto: string;
  ocultar: () => void;
}

export function ModalMensagem({
  exibir,
  titulo,
  texto,
  ocultar,
}: ModalMensagemProps) {
  return (
    <Modal
      visible={exibir}
      transparent
      animationType="fade"
      onRequestClose={ocultar}
    >
      <View className="flex-1 items-center justify-center bg-black/25 px-6">
        <View className="w-full max-w-[350px] min-h-[220px] rounded-[20px] border border-sky-200 bg-white/95 overflow-hidden">
          <View className="bg-sky-400 px-5 py-4">
            <Text className="text-center text-xl font-semibold text-white">
              {titulo}
            </Text>
          </View>

          <View className="flex-1 items-center justify-center px-6 py-6">
            <Text className="text-center text-base leading-relaxed text-sky-700">
              {texto}
            </Text>
          </View>

          <View className="items-center px-5 py-4">
            <Pressable
              onPress={ocultar}
              className="rounded-xl bg-sky-400 px-6 py-2.5 active:bg-sky-500"
            >
              <Text className="text-[15px] font-medium text-white">
                Fechar
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
