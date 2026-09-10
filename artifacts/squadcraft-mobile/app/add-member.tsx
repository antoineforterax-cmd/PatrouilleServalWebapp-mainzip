import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import { useSquad } from '@/context/SquadContext';
import { useColors } from '@/hooks/useColors';
import { typography } from '@/components/ui';

export default function AddMemberScreen() {
  const colors = useColors();
  const { addMember } = useSquad();
  const [name, setName] = useState('');
  const [allergies, setAllergies] = useState('');
  const [role, setRole] = useState('MEMBRE');
  const valid = name.trim().length >= 2;
  const save = () => { if (!valid) return; addMember({ name: name.trim(), role, place: role === 'SP' ? 'Second' : 'Membre', allergies: allergies.trim() || undefined }); router.back(); };
  return (
    <KeyboardAwareScrollViewCompat style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={styles.content} bottomOffset={30} keyboardShouldPersistTaps="handled">
      <Text style={[typography.h2, { color: colors.foreground }]}>Ajouter un patrouillard</Text>
      <Text style={[typography.body, { color: colors.mutedForeground }]}>Sa fiche restera enregistrée sur ce téléphone.</Text>
      <Text style={[styles.label, { color: colors.foreground }]}>Prénom</Text>
      <TextInput testID="member-name" value={name} onChangeText={setName} placeholder="Ex. Baptiste" placeholderTextColor={colors.mutedForeground} style={[styles.input, { backgroundColor: colors.card, borderColor: colors.input, color: colors.foreground }]} />
      <Text style={[styles.label, { color: colors.foreground }]}>Rôle</Text>
      <View style={styles.roles}>{['MEMBRE', 'SP', 'HP'].map((item) => <Pressable key={item} onPress={() => setRole(item)} style={[styles.role, { backgroundColor: role === item ? colors.accent : colors.muted }]}><Text style={[typography.label, { color: role === item ? colors.accentForeground : colors.mutedForeground }]}>{item}</Text></Pressable>)}</View>
      <Text style={[styles.label, { color: colors.foreground }]}>Allergies ou vigilance</Text>
      <TextInput value={allergies} onChangeText={setAllergies} placeholder="Facultatif" placeholderTextColor={colors.mutedForeground} style={[styles.input, { backgroundColor: colors.card, borderColor: colors.input, color: colors.foreground }]} />
      {!valid && name.length > 0 && <Text style={[typography.label, { color: colors.destructive }]}>Saisis au moins 2 caractères.</Text>}
      <Pressable testID="save-member" disabled={!valid} onPress={save} style={({ pressed }) => [styles.save, { backgroundColor: colors.primary, opacity: !valid ? 0.45 : pressed ? 0.7 : 1 }]}><Text style={[typography.label, { color: colors.primaryForeground }]}>Ajouter à la patrouille</Text></Pressable>
    </KeyboardAwareScrollViewCompat>
  );
}

const styles = StyleSheet.create({
  content: { padding: 22, gap: 12 },
  label: { fontFamily: 'Inter_600SemiBold', fontSize: 13, marginTop: 8 },
  input: { height: 50, borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, fontFamily: 'Inter_400Regular', fontSize: 15 },
  roles: { flexDirection: 'row', gap: 8 },
  role: { paddingHorizontal: 16, paddingVertical: 11, borderRadius: 10 },
  save: { minHeight: 50, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 15 },
});