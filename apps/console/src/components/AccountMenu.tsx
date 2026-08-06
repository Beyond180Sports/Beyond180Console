import { useEffect, useRef, useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useAuth } from '../auth/AuthContext';
import DeleteAccountModal from './DeleteAccountModal';

type AccountMenuProps = {
  onSignIn: () => void;
  onCreateAccount: () => void;
};

export default function AccountMenu({
  onSignIn,
  onCreateAccount,
}: AccountMenuProps) {
  const { profile, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const [menuTop, setMenuTop] = useState(64);
  const [signingOut, setSigningOut] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    userId: string;
    userEmail: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const triggerRef = useRef<View>(null);

  useEffect(() => {
    if (!open) {
      setError(null);
    }
  }, [open]);

  function openMenu() {
    triggerRef.current?.measureInWindow((_x, y, _width, height) => {
      setMenuTop(y + height + 8);
      setOpen(true);
    });
  }

  async function handleSignOut() {
    setSigningOut(true);
    setError(null);
    try {
      await signOut();
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign out.');
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <View style={styles.wrap}>
      <View ref={triggerRef} collapsable={false}>
        <Pressable
          accessibilityLabel="Account menu"
          accessibilityRole="button"
          onPress={openMenu}
          style={({ hovered, pressed }) => [
            styles.trigger,
            (hovered || pressed) && styles.triggerPressed,
          ]}
        >
          <View style={styles.line} />
          <View style={styles.line} />
          <View style={styles.line} />
        </Pressable>
      </View>

      <Modal
        animationType="fade"
        transparent
        visible={open}
        onRequestClose={() => setOpen(false)}
      >
        <View style={styles.modalRoot}>
          <Pressable
            accessibilityLabel="Close account menu"
            onPress={() => setOpen(false)}
            style={StyleSheet.absoluteFill}
          />
          <View style={[styles.menu, { top: menuTop }]}>
            {profile != null ? (
              <>
                <Text style={styles.menuEmail} numberOfLines={1}>
                  {profile.email}
                </Text>
                <Pressable
                  accessibilityRole="button"
                  disabled={signingOut}
                  onPress={() => {
                    void handleSignOut();
                  }}
                  style={({ hovered, pressed }) => [
                    styles.menuItem,
                    (hovered || pressed) && styles.menuItemPressed,
                  ]}
                >
                  <Text style={styles.menuItemText}>
                    {signingOut ? 'Signing out…' : 'Log Out'}
                  </Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  disabled={signingOut}
                  onPress={() => {
                    setOpen(false);
                    setDeleteTarget({
                      userId: profile.id,
                      userEmail: profile.email,
                    });
                    setShowDeleteModal(true);
                  }}
                  style={({ hovered, pressed }) => [
                    styles.menuItem,
                    (hovered || pressed) && styles.menuItemPressed,
                  ]}
                >
                  <Text style={styles.menuItemDangerText}>Delete Account</Text>
                </Pressable>
              </>
            ) : (
              <>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => {
                    setOpen(false);
                    onSignIn();
                  }}
                  style={({ hovered, pressed }) => [
                    styles.menuItem,
                    (hovered || pressed) && styles.menuItemPressed,
                  ]}
                >
                  <Text style={styles.menuItemText}>Sign In</Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => {
                    setOpen(false);
                    onCreateAccount();
                  }}
                  style={({ hovered, pressed }) => [
                    styles.menuItem,
                    (hovered || pressed) && styles.menuItemPressed,
                  ]}
                >
                  <Text style={styles.menuItemText}>Create Account</Text>
                </Pressable>
              </>
            )}
            {error != null && <Text style={styles.menuError}>{error}</Text>}
          </View>
        </View>
      </Modal>

      {deleteTarget != null && (
        <DeleteAccountModal
          visible={showDeleteModal}
          userEmail={deleteTarget.userEmail}
          userId={deleteTarget.userId}
          onClose={() => {
            setShowDeleteModal(false);
            setDeleteTarget(null);
          }}
          onDeleted={() => {
            setShowDeleteModal(false);
            setDeleteTarget(null);
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    right: 16,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    zIndex: 2,
  },
  trigger: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  triggerPressed: {
    opacity: 0.7,
  },
  line: {
    width: 22,
    height: 2,
    backgroundColor: '#1E6FE8',
  },
  modalRoot: {
    flex: 1,
  },
  menu: {
    position: 'absolute',
    right: 16,
    minWidth: 220,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(30, 111, 232, 0.18)',
    paddingVertical: 8,
    shadowColor: '#123A7A',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  menuEmail: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    color: 'rgba(18, 58, 122, 0.72)',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  menuItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  menuItemPressed: {
    backgroundColor: 'rgba(30, 111, 232, 0.08)',
  },
  menuItemText: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 14,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: '#1E6FE8',
  },
  menuItemDangerText: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 14,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: '#B42318',
  },
  menuError: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    color: '#B42318',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
});
