import { Pressable, StyleSheet, Text, View } from 'react-native';

type SectionPlaceholderProps = {
  title: string;
  description: string;
  onBack: () => void;
};

export default function SectionPlaceholder({
  title,
  description,
  onBack,
}: SectionPlaceholderProps) {
  return (
    <View style={styles.root}>
      <Pressable accessibilityRole="button" onPress={onBack} style={styles.back}>
        <Text style={styles.backText}>← Beyond180 Sports</Text>
      </Pressable>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 28,
    paddingTop: 28,
  },
  back: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 4,
    cursor: 'pointer',
  },
  backText: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 14,
    letterSpacing: 0.6,
    color: '#1E6FE8',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    maxWidth: 560,
  },
  title: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 64,
    letterSpacing: 1.5,
    color: '#123A7A',
    marginBottom: 12,
  },
  description: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 18,
    lineHeight: 28,
    color: 'rgba(18, 58, 122, 0.7)',
  },
});
