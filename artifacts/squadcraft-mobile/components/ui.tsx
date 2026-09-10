import { Feather } from '@expo/vector-icons';
import React, { ReactNode } from 'react';
import { Image, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';

export function Screen({ children }: { children: ReactNode }) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.fill, { backgroundColor: colors.background }]}>
      <View style={[styles.glow, { backgroundColor: colors.goldSoft }]} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.content, {
          paddingTop: (Platform.OS === 'web' ? 67 : insets.top) + 18,
          paddingBottom: (Platform.OS === 'web' ? 104 : insets.bottom + 100),
        }]}
      >
        {children}
      </ScrollView>
    </View>
  );
}

export function Header({ eyebrow, title, action }: { eyebrow: string; title: string; action?: ReactNode }) {
  const colors = useColors();
  return (
    <View style={styles.header}>
      <View style={styles.brandRow}>
        <Image source={require('@/assets/images/brand-mark.png')} style={styles.logo} />
        <View><Text style={[styles.eyebrow, { color: colors.primary }]}>{eyebrow}</Text><Text style={[styles.title, { color: colors.foreground }]}>{title}</Text></View>
      </View>
      {action}
    </View>
  );
}

export function Card({ children, tone = 'plain', style }: { children: ReactNode; tone?: 'plain' | 'green' | 'gold' | 'blue' | 'dark'; style?: object }) {
  const colors = useColors();
  const backgrounds = { plain: colors.card, green: colors.greenSoft, gold: colors.goldSoft, blue: colors.blueSoft, dark: colors.accent };
  return <View style={[styles.card, { backgroundColor: backgrounds[tone], borderColor: tone === 'plain' ? colors.border : backgrounds[tone] }, style]}>{children}</View>;
}

export function Pill({ label, tone = 'green' }: { label: string; tone?: 'green' | 'gold' | 'blue' }) {
  const colors = useColors();
  const palette = tone === 'gold' ? [colors.goldSoft, colors.primary] : tone === 'blue' ? [colors.blueSoft, colors.blue] : [colors.greenSoft, colors.success];
  return <View style={[styles.pill, { backgroundColor: palette[0] }]}><Text style={[styles.pillText, { color: palette[1] }]}>{label}</Text></View>;
}

export function IconButton({ icon, onPress, testID }: { icon: keyof typeof Feather.glyphMap; onPress: () => void; testID?: string }) {
  const colors = useColors();
  return <Pressable testID={testID} hitSlop={10} onPress={onPress} style={({ pressed }) => [styles.iconButton, { opacity: pressed ? 0.45 : 1 }]}><Feather name={icon} size={23} color={colors.foreground} /></Pressable>;
}

export const typography = StyleSheet.create({
  h2: { fontFamily: 'Inter_700Bold', fontSize: 20, letterSpacing: -0.6 },
  body: { fontFamily: 'Inter_400Regular', fontSize: 14, lineHeight: 20 },
  label: { fontFamily: 'Inter_600SemiBold', fontSize: 12 },
});

const styles = StyleSheet.create({
  fill: { flex: 1, overflow: 'hidden' },
  glow: { position: 'absolute', width: 260, height: 260, borderRadius: 130, right: -100, top: -100, opacity: 0.55 },
  content: { paddingHorizontal: 18, gap: 16 },
  header: { minHeight: 58, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  logo: { width: 46, height: 46, borderRadius: 23 },
  eyebrow: { fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 1.4, textTransform: 'uppercase' },
  title: { fontFamily: 'Inter_700Bold', fontSize: 25, letterSpacing: -1 },
  card: { padding: 17, borderRadius: 16, borderWidth: 1 },
  pill: { alignSelf: 'flex-start', borderRadius: 999, paddingHorizontal: 9, paddingVertical: 5 },
  pillText: { fontFamily: 'Inter_700Bold', fontSize: 10 },
  iconButton: { padding: 4 },
});