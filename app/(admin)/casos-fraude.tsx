import { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import apiClient from '../../data/api/client';
import { obtenerToken } from '../../storage/secureStorage';

export default function CasosFraudeScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [casos, setCasos] = useState<any[]>([]);

  useEffect(() => {
    cargarCasos();
  }, []);

  async function cargarCasos() {
    try {
      const token = await obtenerToken();
      const res = await apiClient.get('/api/admin/casos-fraude', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCasos(res.data);
    } catch {
      Alert.alert('Error', 'No se pudieron cargar los casos');
    } finally {
      setLoading(false);
    }
  }

  async function handleResolver(uid: number) {
    try {
      const token = await obtenerToken();
      await apiClient.post(`/api/admin/casos-fraude/${uid}/resolver`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCasos(prev => prev.filter(c => c.id !== uid));
      Alert.alert('Listo', 'Caso marcado como revisado');
    } catch {
      Alert.alert('Error', 'No se pudo resolver el caso');
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator color="#6B4EFF" size="large" />
        <Text style={styles.loadingText}>Cargando casos...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerSub}>UNFV — Riesgo Crediticio</Text>
          <Text style={styles.title}>Cola de fraude</Text>
          <Text style={styles.sub}>Usuarios marcados por Isolation Forest</Text>
        </View>
      </View>

      {/* Nav */}
      <View style={styles.nav}>
        <TouchableOpacity
          style={styles.navBtn}
          onPress={() => router.push('/(admin)/dashboard')}
        >
          <Text style={styles.navText}>Dashboard</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.navBtn, styles.navActive]}>
          <Text style={[styles.navText, styles.navTextActive]}>Cola de fraude</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navBtn}
          onPress={() => router.push('/(admin)/metricas')}
        >
          <Text style={styles.navText}>Métricas</Text>
        </TouchableOpacity>
      </View>

      {/* Contador */}
      <View style={styles.countWrap}>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{casos.length} pendientes</Text>
        </View>
      </View>

      {/* Lista */}
      {casos.length === 0 ? (
        <View style={styles.card}>
          <View style={styles.emptyWrap}>
            <View style={styles.emptyIcon}>
              <Text style={styles.emptyIconText}>✓</Text>
            </View>
            <Text style={styles.emptyTitle}>Sin casos pendientes</Text>
            <Text style={styles.emptySub}>No hay usuarios marcados como sospechosos</Text>
          </View>
        </View>
      ) : (
        casos.map((caso) => (
          <View key={caso.id} style={styles.card}>
            <View style={styles.casoHeader}>
              <Text style={styles.casoEmail}>{caso.email}</Text>
              <View style={styles.alertBadge}>
                <Text style={styles.alertText}>Fraude</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.casoGrid}>
              <View style={styles.casoItem}>
                <Text style={styles.casoLabel}>DNI</Text>
                <Text style={styles.casoValue}>{caso.dni}</Text>
              </View>
              <View style={styles.casoItem}>
                <Text style={styles.casoLabel}>Teléfono</Text>
                <Text style={styles.casoValue}>{caso.telefono}</Text>
              </View>
              <View style={styles.casoItem}>
                <Text style={styles.casoLabel}>IP registro</Text>
                <Text style={[styles.casoValue, { color: '#DC2626' }]}>
                  {caso.ip_registro ?? '—'}
                </Text>
              </View>
              <View style={styles.casoItem}>
                <Text style={styles.casoLabel}>Fecha</Text>
                <Text style={styles.casoValue}>
                  {new Date(caso.fecha_registro).toLocaleDateString()}
                </Text>
              </View>
            </View>

            <View style={styles.casoActions}>
              <TouchableOpacity
                style={styles.btnAprobar}
                onPress={() => handleResolver(caso.id)}
              >
                <Text style={styles.btnAprobarText}>Aprobar cuenta</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.btnBloquear}
                onPress={() => Alert.alert(
                  'Bloquear cuenta',
                  `¿Bloquear definitivamente a ${caso.email}?`,
                  [
                    { text: 'Cancelar', style: 'cancel' },
                    { text: 'Bloquear', style: 'destructive', onPress: () => handleResolver(caso.id) },
                  ]
                )}
              >
                <Text style={styles.btnBloquearText}>Bloquear</Text>
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
  container: { flex: 1, backgroundColor: '#F0EFFF' },
  scroll: { padding: 24 },
  loadingWrap: {
    flex: 1, backgroundColor: '#F0EFFF',
    alignItems: 'center', justifyContent: 'center', gap: 16,
  },
  loadingText: { color: '#8892B0', fontSize: 14 },
  header: { marginBottom: 20 },
  headerSub: { fontSize: 12, color: '#6B4EFF', fontWeight: '600', marginBottom: 2 },
  title: { fontSize: 22, fontWeight: '700', color: '#1A1A2E' },
  sub: { fontSize: 13, color: '#8892B0', marginTop: 2 },
  nav: { flexDirection: 'row', gap: 8, marginBottom: 20, flexWrap: 'wrap' },
  navBtn: {
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 10, borderWidth: 1.5,
    borderColor: '#E2E8F0', backgroundColor: '#fff',
  },
  navActive: { backgroundColor: '#6B4EFF', borderColor: '#6B4EFF' },
  navText: { color: '#8892B0', fontSize: 13, fontWeight: '500' },
  navTextActive: { color: '#fff', fontWeight: '600' },
  countWrap: { flexDirection: 'row', marginBottom: 16 },
  countBadge: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1.5, borderColor: '#FECACA',
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 6,
  },
  countText: { color: '#DC2626', fontSize: 12, fontWeight: '700' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16, padding: 18,
    borderWidth: 1.5, borderColor: '#E2E8F0',
    marginBottom: 14,
    shadowColor: '#6B4EFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06, shadowRadius: 12, elevation: 3,
  },
  emptyWrap: { alignItems: 'center', paddingVertical: 32 },
  emptyIcon: {
    width: 64, height: 64,
    backgroundColor: '#ECFDF5', borderRadius: 32,
    alignItems: 'center', justifyContent: 'center', marginBottom: 14,
  },
  emptyIconText: { fontSize: 28, color: '#059669' },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#059669', marginBottom: 4 },
  emptySub: { fontSize: 13, color: '#8892B0' },
  casoHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 12,
  },
  casoEmail: { fontSize: 14, fontWeight: '700', color: '#1A1A2E', flex: 1 },
  alertBadge: {
    backgroundColor: '#FEF2F2',
    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4,
    borderWidth: 1.5, borderColor: '#FECACA',
  },
  alertText: { color: '#DC2626', fontSize: 11, fontWeight: '700' },
  divider: { height: 1, backgroundColor: '#F0EFFF', marginBottom: 12 },
  casoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 16 },
  casoItem: { width: '45%' },
  casoLabel: { fontSize: 11, color: '#A0AEC0', fontWeight: '500', marginBottom: 2 },
  casoValue: { fontSize: 13, color: '#2D3748', fontWeight: '600' },
  casoActions: { flexDirection: 'row', gap: 10 },
  btnAprobar: {
    flex: 1, padding: 10, borderRadius: 10,
    backgroundColor: '#ECFDF5',
    borderWidth: 1.5, borderColor: '#6EE7B7',
    alignItems: 'center',
  },
  btnAprobarText: { color: '#059669', fontSize: 13, fontWeight: '700' },
  btnBloquear: {
    flex: 1, padding: 10, borderRadius: 10,
    backgroundColor: '#FEF2F2',
    borderWidth: 1.5, borderColor: '#FECACA',
    alignItems: 'center',
  },
  btnBloquearText: { color: '#DC2626', fontSize: 13, fontWeight: '700' },
});