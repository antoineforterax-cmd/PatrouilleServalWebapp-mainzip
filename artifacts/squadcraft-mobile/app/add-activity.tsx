import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import { useSquad } from '@/context/SquadContext';
import { useColors } from '@/hooks/useColors';
import { typography } from '@/components/ui';

export default function AddActivityScreen() {
  const colors = useColors();
  const { addActivity } = useSquad();
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [type, setType] = useState<'Réunion' | 'Sortie' | 'Week-end'>('Réunion');
  const valid = title.trim().length >= 3 && location.trim().length >= 2 && date.trim().length >= 3;
  const save = () => { if (!valid) return; addActivity({ title: title.trim(), location: location.trim(), date: date.trim().toUpperCase(), type }); router.back(); };
  return (
    <KeyboardAwareScrollViewCompat style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={styles.content} bottomOffset={30} keyboardShouldPersistTaps="handled">
      <Text style={[typography.h2, { color: colors.foreground }]}>Planifier une activité</Text>
      {[
        { label: 'Titre', value: title, setter: setTitle, placeholder: 'Ex. Veillée de patrouille' },
        { label: 'Date courte', value: date, setter: setDate, placeholder: 'Ex. 15 OCT' },
        { label: 'Lieu', value: location, setter: setLocation, placeholder: 'Ex. Local du groupe' },
      ].map((field) => <View key={field.label} style={styles.field}><Text style={[styles.label, { color: colors.foreground }]}>{field.label}</Text><TextInput value={field.value} onChangeText={field.setter} placeholder={field.placeholder} placeholderTextColor={colors.mutedForeground} style={[styles.input, { backgroundColor: colors.card, borderColor: colors.input, color: colors.foreground }]} /></View>)}
      <Text style={[styles.label, { color: colors.foreground }]}>Type</Text>
      <View style={styles.types}>{(['Réunion', 'Sortie', 'Week-end'] as const).map((item) => <Pressable key={item} onPress={() => setType(item)} style={[styles.type, { backgroundColor: type === item ? colors.accent : colors.muted }]}><Text style={[typography.label, { color: type === item ? colors.accentForeground : colors.mutedForeground }]}>{item}</Text></Pressable>)}</View>
      <Pressable testID="save-activity" disabled={!valid} onPress={save} style={({ pressed }) => [styles.save, { backgroundColor: colors.primary, opacity: !valid ? 0.45 : pressed ? 0.7 : 1 }]}><Text style={[typography.label, { color: colors.primaryForeground }]}>Ajouter au calendrier</Text></Pressable>
    </KeyboardAwareScrollViewCompat>
  );
}

const styles = StyleSheet.create({
  content: { padding: 22, gap: 12 },
  field: { gap: 7 },
  label: { fontFamily: 'Inter_600SemiBold', fontSize: 13, marginTop: 5 },
  input: { height: 50, borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, fontFamily: 'Inter_400Regular', fontSize: 15 },
  types: { flexDirection: 'row', gap: 7 },
  type: { flex: 1, alignItems: 'center', paddingVertical: 11, borderRadius: 10 },
  save: { minHeight: 50, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 15 },
});