import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Card, Header, IconButton, Pill, Screen, typography } from '@/components/ui';
import { useSquad } from '@/context/SquadContext';
import { useColors } from '@/hooks/useColors';

export default function MembersScreen() {
  const colors = useColors();
  const { members, removeMember } = useSquad();
  return (
    <Screen>
      <Header eyebrow="Troupe" title="Mon équipe" action={<IconButton testID="add-member" icon="user-plus" onPress={() => router.push('/add-member')} />} />
      <Text style={[typography.body, { color: colors.mutedForeground }]}>{members.length} patrouillards · données enregistrées sur ce téléphone</Text>
      {members.map((member) => (
        <Card key={member.id}>
          <View style={styles.memberTop}>
            <View style={[styles.avatar, { backgroundColor: member.role === 'CP' ? colors.primary : member.role === 'SP' ? colors.blue : colors.success }]}><Text style={styles.initial}>{member.name.slice(0, 1)}</Text></View>
            <View style={styles.info}><Text style={[styles.name, { color: colors.foreground }]}>{member.name}</Text><Text style={[typography.body, { color: colors.mutedForeground }]}>{member.place}</Text></View>
            <Pill label={member.role} tone={member.role === 'CP' ? 'gold' : member.role === 'SP' ? 'blue' : 'green'} />
          </View>
          {member.allergies && <View style={[styles.alert, { backgroundColor: colors.coralSoft }]}><Feather name="alert-circle" size={14} color={colors.destructive} /><Text style={[typography.label, { color: colors.destructive }]}>{member.allergies}</Text></View>}
          <View style={styles.progressHead}><Text style={[typography.label, { color: colors.mutedForeground }]}>Progression</Text><Text style={[typography.label, { color: colors.success }]}>{member.progress}%</Text></View>
          <View style={[styles.track, { backgroundColor: colors.muted }]}><View style={[styles.fill, { width: `${member.progress}%`, backgroundColor: colors.success }]} /></View>
          {member.role !== 'CP' && <Pressable testID={`remove-${member.id}`} onPress={() => Alert.alert('Retirer ce membre ?', member.name, [{ text: 'Annuler', style: 'cancel' }, { text: 'Retirer', style: 'destructive', onPress: () => removeMember(member.id) }])} style={styles.remove}><Feather name="trash-2" size={16} color={colors.destructive} /><Text style={[typography.label, { color: colors.destructive }]}>Retirer</Text></Pressable>}
        </Card>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  memberTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  initial: { color: '#fff', fontFamily: 'Inter_700Bold', fontSize: 17 },
  info: { flex: 1 },
  name: { fontFamily: 'Inter_700Bold', fontSize: 16 },
  alert: { flexDirection: 'row', gap: 7, padding: 9, borderRadius: 9, marginTop: 14 },
  progressHead: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 17 },
  track: { height: 6, borderRadius: 6, overflow: 'hidden', marginTop: 8 },
  fill: { height: '100%', borderRadius: 6 },
  remove: { flexDirection: 'row', alignSelf: 'flex-end', alignItems: 'center', gap: 6, marginTop: 15 },
});