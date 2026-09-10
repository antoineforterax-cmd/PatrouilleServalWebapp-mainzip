import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import React, { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';

export type Member = { id: string; name: string; role: string; place: string; progress: number; allergies?: string };
export type Activity = { id: string; title: string; date: string; location: string; type: 'Réunion' | 'Sortie' | 'Week-end'; attending: string[] };
type Mode = 'chef' | 'parent';

type Store = {
  members: Member[];
  activities: Activity[];
  mode: Mode;
  tasks: { id: string; label: string; done: boolean }[];
};

type SquadValue = Store & {
  ready: boolean;
  setMode: (mode: Mode) => void;
  addMember: (member: Omit<Member, 'id' | 'progress'>) => void;
  removeMember: (id: string) => void;
  addActivity: (activity: Omit<Activity, 'id' | 'attending'>) => void;
  toggleAttendance: (activityId: string, memberId: string) => void;
  toggleTask: (id: string) => void;
};

const initial: Store = {
  mode: 'chef',
  members: [
    { id: 'm1', name: 'Antoine', role: 'CP', place: 'Chef de patrouille', progress: 82 },
    { id: 'm2', name: 'Gaspard', role: 'SP', place: 'Second', progress: 68 },
    { id: 'm3', name: 'Louis', role: 'MEMBRE', place: 'Troisième', progress: 55, allergies: 'Arachides' },
    { id: 'm4', name: 'Martin', role: 'MEMBRE', place: 'Quatrième', progress: 47 },
    { id: 'm5', name: 'Paul', role: 'MEMBRE', place: 'Cinquième', progress: 39 },
    { id: 'm6', name: 'Hugo', role: 'MEMBRE', place: 'Sixième', progress: 31 },
  ],
  activities: [
    { id: 'a1', title: 'Réunion de patrouille', date: '12 SEP', location: 'Local du groupe', type: 'Réunion', attending: ['m1', 'm2', 'm3', 'm4'] },
    { id: 'a2', title: 'Sortie orientation', date: '20 SEP', location: 'Forêt de Meudon', type: 'Sortie', attending: ['m1', 'm2', 'm5'] },
    { id: 'a3', title: 'Week-end de rentrée', date: '03 OCT', location: 'Domaine des Pins', type: 'Week-end', attending: ['m1', 'm2', 'm3', 'm4', 'm5', 'm6'] },
  ],
  tasks: [
    { id: 't1', label: 'Confirmer le lieu du week-end', done: true },
    { id: 't2', label: 'Vérifier les trousses de secours', done: false },
    { id: 't3', label: 'Relancer les réponses parents', done: false },
  ],
};

const SquadContext = createContext<SquadValue | null>(null);
const STORAGE_KEY = 'squadcraft_mobile_local_v1';

export function SquadProvider({ children }: { children: ReactNode }) {
  const [store, setStore] = useState<Store>(initial);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((saved) => { if (saved) setStore(JSON.parse(saved) as Store); })
      .finally(() => setReady(true));
  }, []);

  const update = (fn: (current: Store) => Store) => {
    setStore((current) => {
      const next = fn(current);
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const value = useMemo<SquadValue>(() => ({
    ...store,
    ready,
    setMode: (mode) => update((current) => ({ ...current, mode })),
    addMember: (member) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      update((current) => ({ ...current, members: [...current.members, { ...member, id: `m-${Date.now()}`, progress: 0 }] }));
    },
    removeMember: (id) => update((current) => ({ ...current, members: current.members.filter((member) => member.id !== id) })),
    addActivity: (activity) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      update((current) => ({ ...current, activities: [...current.activities, { ...activity, id: `a-${Date.now()}`, attending: [] }] }));
    },
    toggleAttendance: (activityId, memberId) => update((current) => ({
      ...current,
      activities: current.activities.map((activity) => activity.id !== activityId ? activity : {
        ...activity,
        attending: activity.attending.includes(memberId)
          ? activity.attending.filter((id) => id !== memberId)
          : [...activity.attending, memberId],
      }),
    })),
    toggleTask: (id) => update((current) => ({ ...current, tasks: current.tasks.map((task) => task.id === id ? { ...task, done: !task.done } : task) })),
  }), [store, ready]);

  return <SquadContext.Provider value={value}>{children}</SquadContext.Provider>;
}

export function useSquad() {
  const value = useContext(SquadContext);
  if (!value) throw new Error('useSquad must be used inside SquadProvider');
  return value;
}