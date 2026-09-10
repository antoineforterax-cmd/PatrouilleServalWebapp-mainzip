import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Card, Header, IconButton, Pill, Screen, typography } from '@/components/ui';
import { useSquad } from '@/context/SquadContext';
import { useColors } from '@/hooks/useColors';

export default function ActivitiesScreen() {
  const colors = useColors();
  const { activities, members, toggleAttendance } = useSquad();
  return (
    <Screen>
      <Header eyebrow="Calendrier" title="Activités" action={<IconButton testID="add-activity" icon="plus" onPress={() => router.push('/add-activity')} />} />
      {activities.map((activity) => (
        <Card key={activity.id}>
          <View style={styles.row}>
            <View style={[styles.date, { backgroundColor: activity.type === 'Week-end' ? colors.goldSoft : colors.greenSoft }]}><Text style={[styles.dateText, { color: activity.type === 'Week-end' ? colors.primary : colors.success }]}>{activity.date}</Text></View>
            <View style={styles.info}><Pill label={activity.type} tone={activity.type === 'Week-end' ? 'gold' : 'green'} /><Text style={[styles.title, { color: colors.foreground }]}>{activity.title}</Text><Text style={[typography.body, { color: colors.mutedForeground }]}>{activity.location}</Text></View>
          </View>
          <Text style={[typography.label, { color: colors.mutedForeground, marginTop: 17 }]}>PRÉSENCES · {activity.attending.length}/{members.length}</Text>
          <View style={styles.people}>{members.map((member) => {
            const selected = activity.attending.includes(member.id);
            return <Pressable testID={`${activity.id}-${member.id}`} key={member.id} onPress={() => toggleAttendance(activity.id, member.id)} style={[styles.person, { backgroundColor: selected ? colors.accent : colors.muted }]}><Text style={[styles.personText, { color: selected ? colors.accentForeground : colors.mutedForeground }]}>{member.name.slice(0, 1)}</Text>{selected && <Feather name="check" size={10} color={colors.primary} />}</Pressable>;
          })}</View>
        </Card>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 13 },
  date: { width: 58, height: 60, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  dateText: { fontFamily: 'Inter_700Bold', fontSize: 12, textAlign: 'center' },
  info: { flex: 1 },
  title: { fontFamily: 'Inter_700Bold', fontSize: 17, marginTop: 9, marginBottom: 2 },
  people: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  person: { width: 39, height: 39, borderRadius: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 1 },
  personText: { fontFamily: 'Inter_700Bold', fontSize: 13 },
});