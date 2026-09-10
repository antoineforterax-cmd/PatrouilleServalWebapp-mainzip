import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Card, Header, Pill, Screen, typography } from '@/components/ui';
import { useSquad } from '@/context/SquadContext';
import { useColors } from '@/hooks/useColors';

export default function ParentScreen() {
  const colors = useColors();
  const { mode, setMode, members, activities } = useSquad();
  const child = members[2] ?? members[0];
  return (
    <Screen>
      <Header eyebrow="Accès famille" title="Espace parent" />
      <View style={[styles.switch, { backgroundColor: colors.muted }]}>
        {(['chef', 'parent'] as const).map((item) => <Pressable testID={`mode-${item}`} key={item} onPress={() => setMode(item)} style={[styles.switchItem, mode === item && { backgroundColor: colors.card }]}><Text style={[typography.label, { color: mode === item ? colors.foreground : colors.mutedForeground }]}>{item === 'chef' ? 'Aperçu chef' : 'Vue parent'}</Text></Pressable>)}
      </View>
      {mode === 'chef' ? (
        <>
          <Card tone="gold"><Feather name="shield" size={24} color={colors.primary} /><Text style={[styles.cardTitle, { color: colors.foreground }]}>Une vue séparée, sur le même téléphone</Text><Text style={[typography.body, { color: colors.mutedForeground }]}>Bascule en vue parent pour vérifier les informations visibles par les familles. Les données restent locales à cette app.</Text></Card>
          <Text style={[typography.h2, { color: colors.foreground }]}>Ce que les parents voient</Text>
          {['Progression de leur enfant', 'Agenda et réponses de présence', 'Alertes et informations pratiques'].map((label) => <Card key={label}><View style={styles.feature}><View style={[styles.featureIcon, { backgroundColor: colors.greenSoft }]}><Feather name="check" size={17} color={colors.success} /></View><Text style={[typography.body, { color: colors.foreground, flex: 1 }]}>{label}</Text></View></Card>)}
        </>
      ) : (
        <>
          <Card tone="dark"><Pill label="MON ENFANT" tone="gold" /><Text style={[styles.childName, { color: colors.accentForeground }]}>{child?.name}</Text><Text style={[typography.body, { color: colors.mutedForeground }]}>{child?.place} · progression {child?.progress}%</Text><View style={[styles.track, { backgroundColor: colors.secondaryForeground }]}><View style={[styles.fill, { width: `${child?.progress ?? 0}%`, backgroundColor: colors.primary }]} /></View></Card>
          <Text style={[typography.h2, { color: colors.foreground }]}>Prochaines activités</Text>
          {activities.slice(0, 2).map((activity) => {
            const attending = activity.attending.includes(child?.id ?? '');
            return <Card key={activity.id}><View style={styles.activity}><View style={styles.info}><Text style={[styles.activityTitle, { color: colors.foreground }]}>{activity.title}</Text><Text style={[typography.body, { color: colors.mutedForeground }]}>{activity.date} · {activity.location}</Text></View><Pill label={attending ? 'Présent' : 'À confirmer'} tone={attending ? 'green' : 'gold'} /></View></Card>;
          })}
          <Card tone="blue"><View style={styles.feature}><Feather name="info" size={20} color={colors.blue} /><Text style={[typography.body, { color: colors.foreground, flex: 1 }]}>Cette version mobile conserve ses informations sur cet appareil. Elle ne se synchronise pas avec le navigateur.</Text></View></Card>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  switch: { flexDirection: 'row', padding: 4, borderRadius: 13 },
  switchItem: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 10 },
  cardTitle: { fontFamily: 'Inter_700Bold', fontSize: 18, marginTop: 13, marginBottom: 6 },
  feature: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  featureIcon: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  childName: { fontFamily: 'Inter_700Bold', fontSize: 28, marginTop: 16, marginBottom: 3 },
  track: { height: 6, borderRadius: 6, overflow: 'hidden', marginTop: 17 },
  fill: { height: '100%', borderRadius: 6 },
  activity: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  info: { flex: 1 },
  activityTitle: { fontFamily: 'Inter_700Bold', fontSize: 15, marginBottom: 3 },
});