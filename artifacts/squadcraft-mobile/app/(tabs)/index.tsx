import { Feather } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Card, Header, Pill, Screen, typography } from '@/components/ui';
import { useSquad } from '@/context/SquadContext';
import { useColors } from '@/hooks/useColors';

export default function HomeScreen() {
  const colors = useColors();
  const { members, activities, tasks, toggleTask, ready } = useSquad();
  if (!ready) return <View style={[styles.loading, { backgroundColor: colors.background }]}><ActivityIndicator color={colors.primary} /></View>;
  const avg = Math.round(members.reduce((sum, member) => sum + member.progress, 0) / Math.max(members.length, 1));
  return (
    <Screen>
      <Header eyebrow="Patrouille du Serval" title="Bonjour Antoine" />
      <Card tone="dark">
        <View style={styles.heroTop}><Text style={[styles.heroLabel, { color: colors.primary }]}>CAP DE LA SEMAINE</Text><Feather name="compass" size={28} color={colors.primary} /></View>
        <Text style={[styles.heroTitle, { color: colors.accentForeground }]}>Prêts pour l’orientation</Text>
        <Text style={[typography.body, { color: colors.mutedForeground }]}>3 actions à terminer avant la prochaine sortie.</Text>
        <View style={[styles.progressTrack, { backgroundColor: colors.secondaryForeground }]}><View style={[styles.progressFill, { width: '68%', backgroundColor: colors.primary }]} /></View>
      </Card>
      <View style={styles.stats}>
        <Card tone="green" style={styles.stat}><Feather name="users" size={19} color={colors.success} /><Text style={[styles.statValue, { color: colors.foreground }]}>{members.length}</Text><Text style={[styles.statLabel, { color: colors.mutedForeground }]}>membres actifs</Text></Card>
        <Card tone="gold" style={styles.stat}><Feather name="award" size={19} color={colors.primary} /><Text style={[styles.statValue, { color: colors.foreground }]}>{avg}%</Text><Text style={[styles.statLabel, { color: colors.mutedForeground }]}>progression</Text></Card>
      </View>
      <View style={styles.sectionHead}><Text style={[typography.h2, { color: colors.foreground }]}>À faire</Text><Pill label={`${tasks.filter((task) => !task.done).length} restantes`} tone="gold" /></View>
      <Card>
        {tasks.map((task, index) => (
          <Pressable testID={`task-${task.id}`} onPress={() => toggleTask(task.id)} key={task.id} style={[styles.task, index > 0 && { borderTopWidth: 1, borderTopColor: colors.border }]}>
            <View style={[styles.check, { backgroundColor: task.done ? colors.success : colors.card, borderColor: task.done ? colors.success : colors.border }]}>{task.done && <Feather name="check" size={14} color={colors.primaryForeground} />}</View>
            <Text style={[typography.body, { color: task.done ? colors.mutedForeground : colors.foreground, textDecorationLine: task.done ? 'line-through' : 'none', flex: 1 }]}>{task.label}</Text>
          </Pressable>
        ))}
      </Card>
      <View style={styles.sectionHead}><Text style={[typography.h2, { color: colors.foreground }]}>Prochain rendez-vous</Text></View>
      <Card tone="blue"><Pill label={activities[0]?.type ?? 'Activité'} tone="blue" /><Text style={[styles.nextTitle, { color: colors.foreground }]}>{activities[0]?.title}</Text><Text style={[typography.body, { color: colors.mutedForeground }]}>{activities[0]?.date} · {activities[0]?.location}</Text></Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  heroLabel: { fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 1.2 },
  heroTitle: { fontFamily: 'Inter_700Bold', fontSize: 23, letterSpacing: -0.8, marginTop: 13, marginBottom: 5 },
  progressTrack: { height: 5, borderRadius: 5, marginTop: 17, overflow: 'hidden', opacity: 0.8 },
  progressFill: { height: '100%', borderRadius: 5 },
  stats: { flexDirection: 'row', gap: 12 },
  stat: { flex: 1, minHeight: 132 },
  statValue: { fontFamily: 'Inter_700Bold', fontSize: 28, marginTop: 17 },
  statLabel: { fontFamily: 'Inter_500Medium', fontSize: 11, marginTop: 2 },
  sectionHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 5 },
  task: { minHeight: 53, flexDirection: 'row', alignItems: 'center', gap: 12 },
  check: { width: 22, height: 22, borderRadius: 6, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  nextTitle: { fontFamily: 'Inter_700Bold', fontSize: 18, marginTop: 13, marginBottom: 4 },
});
