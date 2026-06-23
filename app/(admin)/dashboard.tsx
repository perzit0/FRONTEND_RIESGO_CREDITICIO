import { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import apiClient, { BASE_URL } from '../../data/api/client';
import { obtenerToken, cerrarSesion } from '../../storage/secureStorage';
import { useTheme } from '../../context/ThemeContext';

export default function DashboardScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [datos, setDatos] = useState<any>(null);
  const [exportando, setExportando] = useState(false);

  useEffect(() => { cargarDatos(); }, []);

  async function cargarDatos() {
    try {
      const res = await apiClient.get('/api/admin/dashboard');
      setDatos(res.data);
    } catch {
      Alert.alert('Error', 'No se pudo cargar el dashboard');
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await cerrarSesion();
    router.replace('/(auth)/login');
  }

  async function handleExportarExcel() {
    setExportando(true);
    try {
      const token = await obtenerToken();
      const url = `${BASE_URL}/api/admin/exportar-excel`;
      if (Platform.OS === 'web') {
        const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
        if (!response.ok) { Alert.alert('Error', 'No se pudo generar el Excel'); return; }
        const blob = await response.blob();
        const urlBlob = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = urlBlob;
        link.download = 'usuarios_riesgo_crediticio.xlsx';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(urlBlob);
      } else {
        Alert.alert('Info', 'Exportar Excel solo disponible en versión web');
      }
    } catch {
      Alert.alert('Error', 'No se pudo exportar el Excel');
    } finally {
      setExportando(false);
    }
  }

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <ActivityIndicator color={colors.primary} size="large" />
        <Text style={{ color: colors.textSecondary, fontSize: 14 }}>Cargando dashboard...</Text>
      </View>
    );
  }

  const dist = datos?.distribucion_riesgo ?? { bajo: 0, medio: 0, alto: 0 };
  const totalEval = datos?.total_evaluaciones ?? 0;
  const totalParaPct = totalEval > 0 ? totalEval : 1;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={styles.scroll}>

      <View style={styles.header}>
        <View>
          <Text style={[styles.headerSub, { color: colors.primary }]}>UNFV — Riesgo Crediticio</Text>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Panel Administrador</Text>
        </View>
        <TouchableOpacity style={[styles.logoutBtn, { borderColor: colors.logoutBorder, backgroundColor: colors.card }]} onPress={handleLogout}>
          <Text style={[styles.logoutText, { color: colors.logoutText }]}>Salir</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.nav}>
        <TouchableOpacity style={[styles.navBtn, styles.navActive, { backgroundColor: colors.primary, borderColor: colors.primary }]}>
          <Text style={[styles.navText, styles.navTextActive]}>Dashboard</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.navBtn, { borderColor: colors.cardBorder, backgroundColor: colors.card }]} onPress={() => router.push('/(admin)/casos-fraude')}>
          <Text style={[styles.navText, { color: colors.textSecondary }]}>Cola de fraude</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.navBtn, { borderColor: colors.cardBorder, backgroundColor: colors.card }]} onPress={() => router.push('/(admin)/metricas')}>
          <Text style={[styles.navText, { color: colors.textSecondary }]}>Métricas</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.kpiGrid}>
        <View style={[styles.kpiCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>Usuarios registrados</Text>
          <Text style={[styles.kpiValue, { color: colors.primary }]}>{datos?.total_usuarios ?? 0}</Text>
        </View>
        <View style={[styles.kpiCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>Evaluaciones totales</Text>
          <Text style={[styles.kpiValue, { color: colors.textPrimary }]}>{totalEval}</Text>
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Distribución de riesgo crediticio</Text>
        {totalEval === 0 ? (
          <Text style={{ color: colors.textSecondary, fontSize: 13, textAlign: 'center', paddingVertical: 16 }}>
            Aún no hay evaluaciones registradas
          </Text>
        ) : (
          [
            { label: 'Bajo', key: 'bajo', color: colors.success },
            { label: 'Medio', key: 'medio', color: colors.warning },
            { label: 'Alto', key: 'alto', color: colors.danger },
          ].map(({ label, key, color }) => {
            const pct = Math.round((dist[key] / totalParaPct) * 100);
            return (
              <View key={key} style={styles.barRow}>
                <Text style={[styles.barLabel, { color: colors.textSecondary }]}>{label}</Text>
                <View style={[styles.barTrack, { backgroundColor: colors.input }]}>
                  <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: color }]} />
                </View>
                <Text style={[styles.barVal, { color: colors.textMuted }]}>{pct}%</Text>
              </View>
            );
          })
        )}
      </View>

      <TouchableOpacity
        style={[styles.btnExcel, { backgroundColor: colors.successBg, borderColor: colors.successBorder }]}
        onPress={handleExportarExcel}
        disabled={exportando}
      >
        {exportando
          ? <ActivityIndicator color={colors.success} />
          : <Text style={[styles.btnExcelText, { color: colors.success }]}>Exportar lista de usuarios a Excel</Text>
        }
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 24 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  headerSub: { fontSize: 12, fontWeight: '600', marginBottom: 2 },
  title: { fontSize: 22, fontWeight: '700' },
  logoutBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10, borderWidth: 1.5 },
  logoutText: { fontSize: 13, fontWeight: '500' },
  nav: { flexDirection: 'row', gap: 8, marginBottom: 20, flexWrap: 'wrap' },
  navBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10, borderWidth: 1.5 },
  navActive: {},
  navText: { fontSize: 13, fontWeight: '500' },
  navTextActive: { color: '#fff', fontWeight: '600' },
  kpiGrid: { flexDirection: 'row', gap: 12, marginBottom: 14 },
  kpiCard: { flex: 1, borderRadius: 16, padding: 18, borderWidth: 1.5, shadowColor: '#6B4EFF', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 3 },
  kpiLabel: { fontSize: 12, marginBottom: 8, fontWeight: '500' },
  kpiValue: { fontSize: 32, fontWeight: '700' },
  card: { borderRadius: 16, padding: 20, borderWidth: 1.5, marginBottom: 14, shadowColor: '#6B4EFF', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 3 },
  cardTitle: { fontSize: 14, fontWeight: '700', marginBottom: 16 },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  barLabel: { fontSize: 12, width: 40, fontWeight: '500' },
  barTrack: { flex: 1, height: 10, borderRadius: 5, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 5 },
  barVal: { fontSize: 12, width: 36, textAlign: 'right', fontWeight: '600' },
  btnExcel: { borderWidth: 1.5, borderRadius: 12, padding: 15, alignItems: 'center', marginBottom: 14 },
  btnExcelText: { fontSize: 14, fontWeight: '700' },
});