import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

type HouseDateFilterButtonProps = {
  value: Date | null;
  onChange: (date: Date | null) => void;
};

function toInputValue(date: Date | null): string {
  if (!date) {
    return '';
  }
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function HouseDateFilterButton({
  value,
  onChange,
}: HouseDateFilterButtonProps) {
  if (Platform.OS === 'web') {
    return (
      <View style={styles.wrap}>
        <input
          type="date"
          value={toInputValue(value)}
          onChange={(event: { target: { value: string } }) => {
            const next = event.target.value;
            onChange(next ? new Date(`${next}T12:00:00`) : null);
          }}
          style={{
            fontFamily: 'DM Sans, sans-serif',
            fontSize: 14,
            color: '#123A7A',
            border: '1px solid rgba(30, 111, 232, 0.18)',
            background: '#F3F7FF',
            padding: '10px 12px',
            minHeight: 42,
            boxSizing: 'border-box',
          }}
        />
        {value ? (
          <Pressable onPress={() => onChange(null)} style={styles.clear}>
            <Text style={styles.clearText}>Clear</Text>
          </Pressable>
        ) : null}
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <Pressable
        onPress={() => onChange(value ?? new Date())}
        style={({ hovered, pressed }) => [
          styles.button,
          (hovered || pressed) && styles.buttonPressed,
        ]}
      >
        <Text style={styles.buttonText}>
          {value ? value.toLocaleDateString() : 'Date'}
        </Text>
      </Pressable>
      {value ? (
        <Pressable onPress={() => onChange(null)} style={styles.clear}>
          <Text style={styles.clearText}>Clear</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  button: {
    backgroundColor: '#F3F7FF',
    borderWidth: 1,
    borderColor: 'rgba(30, 111, 232, 0.18)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 42,
    justifyContent: 'center',
  },
  buttonPressed: {
    backgroundColor: '#E5EEFF',
  },
  buttonText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    color: '#123A7A',
  },
  clear: {
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  clearText: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 12,
    color: '#1E6FE8',
  },
});
