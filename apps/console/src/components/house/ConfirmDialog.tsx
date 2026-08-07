import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

type ConfirmDialogProps = {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = false,
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.actions}>
            <Pressable
              onPress={onCancel}
              disabled={loading}
              style={({ hovered, pressed }) => [
                styles.button,
                styles.cancelButton,
                (hovered || pressed) && styles.cancelPressed,
              ]}
            >
              <Text style={styles.cancelText}>{cancelLabel}</Text>
            </Pressable>
            <Pressable
              onPress={onConfirm}
              disabled={loading}
              style={({ hovered, pressed }) => [
                styles.button,
                destructive ? styles.destructiveButton : styles.confirmButton,
                (hovered || pressed) &&
                  (destructive ? styles.destructivePressed : styles.confirmPressed),
              ]}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.confirmText}>{confirmLabel}</Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(11, 31, 64, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    padding: 24,
  },
  title: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 28,
    letterSpacing: 1,
    color: '#123A7A',
  },
  message: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 15,
    color: 'rgba(18, 58, 122, 0.75)',
    marginTop: 10,
    lineHeight: 22,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 24,
  },
  button: {
    minWidth: 100,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F3F7FF',
  },
  cancelPressed: {
    backgroundColor: '#E5EEFF',
  },
  cancelText: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 14,
    color: '#123A7A',
  },
  confirmButton: {
    backgroundColor: '#1E6FE8',
  },
  confirmPressed: {
    backgroundColor: '#1859BA',
  },
  destructiveButton: {
    backgroundColor: '#DC2626',
  },
  destructivePressed: {
    backgroundColor: '#B91C1C',
  },
  confirmText: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 14,
    color: '#FFFFFF',
  },
});
