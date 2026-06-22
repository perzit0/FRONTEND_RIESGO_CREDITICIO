import { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import apiClient from '../../data/api/client';
import { obtenerToken, cerrarSesion } from '../../storage/secureStorage';

export default function DashboardScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [datos, setDatos] = useState<any>(null);
  const [exportando, setExportando] = useState(false);

  useEffect(() => { cargarDatos(); }, []);

  async function cargarDatos() {
    try {
      const token = await obtenerToken();
      const res = await apiClient.get('/api/admin/dashboard', {
        headers: { Authorization: `Bearer ${token}` },
      });
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
      const url = 'https://backend-riesgo-crediticio.onrender.com/api/admin/exportar-excel';
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        Alert.alert('Error', 'No se pudo generar el Excel');
        return;
      }
      const blob = await response.blob();
      const urlBlob = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = urlBlob;
      link.download = 'usuarios_riesgo_crediticio.xlsx';
      link.click();
      URL.revokeObjectURL(urlBlob);
    } catch {
      Alert.alert('Error', 'No se pudo exportar el Excel');
    } finally {
      setExportando(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator color="#6B4EFF" size="large" />
        <Text style={styles.loadingText}>Cargando dashboard...</Text>
      </View>
    );
  }

  const dist = datos?.distribucion_riesgo ?? { bajo: 0, medio: 0, alto: 0 };
  const total = datos?.total_evaluaciones ?? 1;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerSub}>UNFV — Riesgo Crediticio</Text>
          <Text style={styles.title}>Panel Administrador</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Salir</Text>
        </TouchableOpacity>
      </View>

      {/* Nav */}
      <View style={styles.nav}>
        <TouchableOpacity style={[styles.navBtn, styles.navActive]}>
          <Text style={[styles.navText, styles.navTextActive]}>Dashboard</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navBtn}
          onPress={() => router.push('/(admin)/casos-fraude')}
        >
          <Text style={styles.navText}>Cola de fraude</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navBtn}
          onPress={() => router.push('/(admin)/metricas')}
        >
          <Text style={styles.navText}>Métricas</Text>
        </TouchableOpacity>
      </View>

      {/* KPI Cards */}
      <View style={styles.kpiGrid}>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>Usuarios registrados</Text>
          <Text style={[styles.kpiValue, { color: '#6B4EFF' }]}>
            {datos?.total_usuarios ?? 0}
          </Text>
        </View>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>Evaluaciones totales</Text>
          <Text style={styles.kpiValue}>{datos?.total_evaluaciones ?? 0}</Text>
        </View>
      </View>

      {/* Distribución */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Distribución de riesgo crediticio</Text>

        <View style={styles.barRow}>
          <Text style={styles.barLabel}>Bajo</Text>
          <View style={styles.barTrack}>
            <View style={[styles.barFill, {
              width: `${Math.round((dist.bajo / total) * 100)}%`,
              backgroundColor: '#059669',
            }]} />
          </View>
          <Text style={styles.barVal}>{Math.round((dist.bajo / total) * 100)}%</Text>
        </View>

        <View style={styles.barRow}>
          <Text style={styles.barLabel}>Medio</Text>
          <View style={styles.barTrack}>
            <View style={[styles.barFill, {
              width: `${Math.round((dist.medio / total) * 100)}%`,
              backgroundColor: '#D97706',
            }]} />
          </View>
          <Text style={styles.barVal}>{Math.round((dist.medio / total) * 100)}%</Text>
        </View>

        <View style={styles.barRow}>
          <Text style={styles.barLabel}>Alto</Text>
          <View style={styles.barTrack}>
            <View style={[styles.barFill, {
              width: `${Math.round((dist.alto / total) * 100)}%`,
              backgroundColor: '#DC2626',
            }]} />
          </View>
          <Text style={styles.barVal}>{Math.round((dist.alto / total) * 100)}%</Text>
        </View>
      </View>

      {/* Exportar Excel */}
      <TouchableOpacity
        style={styles.btnExcel}
        onPress={handleExportarExcel}
        disabled={exportando}
      >
        {exportando
          ? <ActivityIndicator color="#059669" />
          : <Text style={styles.btnExcelText}>Exportar lista de usuarios a Excel</Text>
        }
      </TouchableOpacity>

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
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: 20,
  },
  headerSub: { fontSize: 12, color: '#6B4EFF', fontWeight: '600', marginBottom: 2 },
  title: { fontSize: 22, fontWeight: '700', color: '#1A1A2E' },
  logoutBtn: {
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 10, borderWidth: 1.5,
    borderColor: '#E2E8F0', backgroundColor: '#fff',
  },
  logoutText: { color: '#8892B0', fontSize: 13, fontWeight: '500' },
  nav: { flexDirection: 'row', gap: 8, marginBottom: 20, flexWrap: 'wrap' },
  navBtn: {
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 10, borderWidth: 1.5,
    borderColor: '#E2E8F0', backgroundColor: '#fff',
  },
  navActive: { backgroundColor: '#6B4EFF', borderColor: '#6B4EFF' },
  navText: { color: '#8892B0', fontSize: 13, fontWeight: '500' },
  navTextActive: { color: '#fff', fontWeight: '600' },
  kpiGrid: { flexDirection: 'row', gap: 12, marginBottom: 14 },
  kpiCard: {
    flex: 1, backgroundColor: '#fff',
    borderRadius: 16, padding: 18,
    borderWidth: 1.5, borderColor: '#E2E8F0',
    shadowColor: '#6B4EFF', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06, shadowRadius: 12, elevation: 3,
  },
  kpiLabel: { fontSize: 12, color: '#8892B0', marginBottom: 8, fontWeight: '500' },
  kpiValue: { fontSize: 32, fontWeight: '700', color: '#1A1A2E' },
  card: {
    backgroundColor: '#fff', borderRadius: 16, padding: 20,
    borderWidth: 1.5, borderColor: '#E2E8F0', marginBottom: 14,
    shadowColor: '#6B4EFF', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06, shadowRadius: 12, elevation: 3,
  },
  cardTitle: { fontSize: 14, fontWeight: '700', color: '#1A1A2E', marginBottom: 16 },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  barLabel: { fontSize: 12, color: '#4A5568', width: 40, fontWeight: '500' },
  barTrack: {
    flex: 1, height: 10, backgroundColor: '#F0EFFF',
    borderRadius: 5, overflow: 'hidden',
  },
  barFill: { height: '100%', borderRadius: 5 },
  barVal: { fontSize: 12, color: '#8892B0', width: 36, textAlign: 'right', fontWeight: '600' },
  btnExcel: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1.5, borderColor: '#6EE7B7',
    borderRadius: 12, padding: 15,
    alignItems: 'center', marginBottom: 14,
  },
  btnExcelText: { color: '#059669', fontSize: 14, fontWeight: '700' },
});