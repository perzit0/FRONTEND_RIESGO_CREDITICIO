import { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import apiClient from '../../data/api/client';
import { useTheme } from '../../context/ThemeContext';

export default function CasosFraudeScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [casos, setCasos] = useState<any[]>([]);

  useEffect(() => { cargarCasos(); }, []);

  async function cargarCasos() {
    try {
      const res = await apiClient.get('/api/admin/casos-fraude');
      setCasos(res.data);
    } catch {
      Alert.alert('Error', 'No se pudieron cargar los casos');
    } finally {
      setLoading(false);
    }
  }

  async function handleAprobar(uid: number) {
    try {
      await apiClient.post(`/api/admin/casos-fraude/${uid}/resolver`, {});
      setCasos(prev => prev.filter(c => c.id !== uid));
      Alert.alert('Listo', 'Cuenta aprobada y marcada como revisada');
    } catch {
      Alert.alert('Error', 'No se pudo aprobar el caso');
    }
  }

  async function handleBloquear(uid: number, email: string) {
    Alert.alert(
      'Bloquear cuenta',
      `¿Bloquear definitivamente a ${email}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Bloquear', style: 'destructive',
          onPress: async () => {
            try {
              await apiClient.post(`/api/admin/casos-fraude/${uid}/bloquear`, {});
              setCasos(prev => prev.filter(c => c.id !== uid));
              Alert.alert('Listo', 'Cuenta bloqueada');
            } catch {
              Alert.alert('Error', 'No se pudo bloquear la cuenta');
            }
          },
        },
      ]
    );
  }

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <ActivityIndicator color={colors.primary} size="large" />
        <Text style={{ color: colors.textSecondary, fontSize: 14 }}>Cargando casos...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={styles.scroll}>

      <View style={styles.header}>
        <Text style={[styles.headerSub, { color: colors.primary }]}>UNFV — Riesgo Crediticio</Text>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Cola de fraude</Text>
        <Text style={[styles.sub, { color: colors.textSecondary }]}>Usuarios marcados por el modelo de detección</Text>
      </View>

      <View style={styles.nav}>
        <TouchableOpacity style={[styles.navBtn, { borderColor: colors.cardBorder, backgroundColor: colors.card }]} onPress={() => router.push('/(admin)/dashboard')}>
          <Text style={[styles.navText, { color: colors.textSecondary }]}>Dashboard</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.navBtn, styles.navActive, { backgroundColor: colors.primary, borderColor: colors.primary }]}>
          <Text style={[styles.navText, styles.navTextActive]}>Cola de fraude</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.navBtn, { borderColor: colors.cardBorder, backgroundColor: colors.card }]} onPress={() => router.push('/(admin)/metricas')}>
          <Text style={[styles.navText, { color: colors.textSecondary }]}>Métricas</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.countWrap}>
        <View style={[styles.countBadge, { backgroundColor: colors.dangerBg, borderColor: colors.dangerBorder }]}>
          <Text style={[styles.countText, { color: colors.danger }]}>{casos.length} pendientes</Text>
        </View>
      </View>

      {casos.length === 0 ? (
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <View style={styles.emptyWrap}>
            <View style={[styles.emptyIcon, { backgroundColor: colors.successBg }]}>
              <Text style={[styles.emptyIconText, { color: colors.success }]}>✓</Text>
            </View>
            <Text style={[styles.emptyTitle, { color: colors.success }]}>Sin casos pendientes</Text>
            <Text style={[styles.emptySub, { color: colors.textSecondary }]}>No hay usuarios marcados como sospechosos</Text>
          </View>
        </View>
      ) : (
        casos.map((caso) => (
          <View key={caso.id} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <View style={styles.casoHeader}>
              <Text style={[styles.casoEmail, { color: colors.textPrimary }]}>{caso.email}</Text>
              <View style={[styles.alertBadge, { backgroundColor: colors.dangerBg, borderColor: colors.dangerBorder }]}>
                <Text style={[styles.alertText, { color: colors.danger }]}>Fraude</Text>
              </View>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.divider }]} />

            <View style={[styles.razonesWrap, { backgroundColor: colors.warningBg, borderColor: colors.warningBorder }]}>
              <Text style={[styles.razonesTitle, { color: colors.warning }]}>Por qué fue marcado:</Text>
              {caso.razones_fraude?.map((razon: string, i: number) => (
                <View key={i} style={styles.razonRow}>
                  <Text style={[styles.razonBullet, { color: colors.warning }]}>⚠</Text>
                  <Text style={[styles.razonText, { color: colors.warning }]}>{razon}</Text>
                </View>
              ))}
            </View>

            <View style={styles.casoGrid}>
              {[
                { label: 'DNI', value: caso.dni },
                { label: 'Teléfono', value: caso.telefono },
                { label: 'IP registro', value: caso.ip_registro ?? 'S/D', isRed: true },
                { label: 'Fecha', value: new Date(caso.fecha_registro).toLocaleDateString('es-PE') },
              ].map(({ label, value, isRed }) => (
                <View key={label} style={styles.casoItem}>
                  <Text style={[styles.casoLabel, { color: colors.textMuted }]}>{label}</Text>
                  <Text style={[styles.casoValue, { color: isRed ? colors.danger : colors.textPrimary }]}>{value}</Text>
                </View>
              ))}
            </View>

            <View style={styles.casoActions}>
              <TouchableOpacity style={[styles.btnAprobar, { backgroundColor: colors.successBg, borderColor: colors.successBorder }]} onPress={() => handleAprobar(caso.id)}>
                <Text style={[styles.btnAprobarText, { color: colors.success }]}>Aprobar cuenta</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btnBloquear, { backgroundColor: colors.dangerBg, borderColor: colors.dangerBorder }]} onPress={() => handleBloquear(caso.id, caso.email)}>
                <Text style={[styles.btnBloquearText, { color: colors.danger }]}>Bloquear</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 24 },
  header: { marginBottom: 20 },
  headerSub: { fontSize: 12, fontWeight: '600', marginBottom: 2 },
  title: { fontSize: 22, fontWeight: '700' },
  sub: { fontSize: 13, marginTop: 2 },
  nav: { flexDirection: 'row', gap: 8, marginBottom: 20, flexWrap: 'wrap' },
  navBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10, borderWidth: 1.5 },
  navActive: {},
  navText: { fontSize: 13, fontWeight: '500' },
  navTextActive: { color: '#fff', fontWeight: '600' },
  countWrap: { flexDirection: 'row', marginBottom: 16 },
  countBadge: { borderWidth: 1.5, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 6 },
  countText: { fontSize: 12, fontWeight: '700' },
  card: { borderRadius: 16, padding: 18, borderWidth: 1.5, marginBottom: 14, shadowColor: 'transparent', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0, shadowRadius: 12, elevation: 0 },
  emptyWrap: { alignItems: 'center', paddingVertical: 32 },
  emptyIcon: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  emptyIconText: { fontSize: 28 },
  emptyTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  emptySub: { fontSize: 13 },
  casoHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  casoEmail: { fontSize: 14, fontWeight: '700', flex: 1 },
  alertBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1.5 },
  alertText: { fontSize: 11, fontWeight: '700' },
  divider: { height: 1, marginBottom: 12 },
  razonesWrap: { borderRadius: 10, padding: 12, marginBottom: 14, borderWidth: 1 },
  razonesTitle: { fontSize: 12, fontWeight: '700', marginBottom: 8 },
  razonRow: { flexDirection: 'row', gap: 8, marginBottom: 4, alignItems: 'flex-start' },
  razonBullet: { fontSize: 12 },
  razonText: { fontSize: 12, flex: 1, lineHeight: 18 },
  casoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 16 },
  casoItem: { width: '45%' },
  casoLabel: { fontSize: 11, fontWeight: '500', marginBottom: 2 },
  casoValue: { fontSize: 13, fontWeight: '600' },
  casoActions: { flexDirection: 'row', gap: 10 },
  btnAprobar: { flex: 1, padding: 10, borderRadius: 10, borderWidth: 1.5, alignItems: 'center' },
  btnAprobarText: { fontSize: 13, fontWeight: '700' },
  btnBloquear: { flex: 1, padding: 10, borderRadius: 10, borderWidth: 1.5, alignItems: 'center' },
  btnBloquearText: { fontSize: 13, fontWeight: '700' },
});