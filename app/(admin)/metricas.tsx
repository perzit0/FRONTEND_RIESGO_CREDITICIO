import { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import apiClient from '../../data/api/client';
import { obtenerToken } from '../../storage/secureStorage';

export default function MetricasScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [metricas, setMetricas] = useState<any>(null);

  useEffect(() => {
    cargarMetricas();
  }, []);

  async function cargarMetricas() {
    try {
      const token = await obtenerToken();
      const res = await apiClient.get('/api/admin/metricas-modelos', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMetricas(res.data);
    } catch {
      Alert.alert('Error', 'No se pudieron cargar las métricas');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator color="#6B4EFF" size="large" />
        <Text style={styles.loadingText}>Cargando métricas...</Text>
      </View>
    );
  }

  const modeloA = metricas?.modelo_a ?? {};
  const modeloB = metricas?.modelo_b ?? {};
  const modeloC = metricas?.modelo_c ?? {};

  function MetricaBar({ label, value, color }: { label: string, value: number | null, color: string }) {
    const pct = value !== null ? Math.round(value * 100) : null;
    return (
      <View style={styles.barRow}>
        <Text style={styles.barLabel}>{label}</Text>
        <View style={styles.barTrack}>
          <View style={[styles.barFill, {
            width: pct !== null ? `${pct}%` : '0%',
            backgroundColor: color,
          }]} />
        </View>
        <Text style={styles.barVal}>{pct !== null ? `${pct}%` : '—'}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerSub}>UNFV — Riesgo Crediticio</Text>
          <Text style={styles.title}>Métricas de modelos</Text>
          <Text style={styles.sub}>Comparativa de rendimiento de IA</Text>
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
        <TouchableOpacity
          style={styles.navBtn}
          onPress={() => router.push('/(admin)/casos-fraude')}
        >
          <Text style={styles.navText}>Cola de fraude</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.navBtn, styles.navActive]}>
          <Text style={[styles.navText, styles.navTextActive]}>Métricas</Text>
        </TouchableOpacity>
      </View>

      {/* Aviso */}
      <View style={styles.warningCard}>
        <Text style={styles.warningTitle}>Pendiente integración</Text>
        <Text style={styles.warningText}>
          Las métricas reales se poblarán cuando se integren
          modelo_a.pkl, modelo_b.pkl y modelo_c.pkl en el backend.
        </Text>
      </View>

      {/* Modelo A */}
      <View style={[styles.card, styles.cardBorderA]}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.cardTitle}>Modelo A</Text>
            <Text style={styles.cardSub}>XGBoost · Riesgo financiero</Text>
          </View>
          <View style={[styles.datasetBadge, styles.badgeA]}>
            <Text style={[styles.datasetText, styles.datasetTextA]}>Give Me Some Credit</Text>
          </View>
        </View>
        <Text style={styles.metricaLabel}>Accuracy</Text>
        <Text style={styles.metricaValue}>
          {modeloA.accuracy != null ? `${Math.round(modeloA.accuracy * 100)}%` : '—'}
        </Text>
        <View style={styles.divider} />
        <MetricaBar label="F1-Score" value={modeloA.f1_score} color="#6B4EFF" />
        <MetricaBar label="ROC-AUC" value={modeloA.roc_auc} color="#6B4EFF" />
        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Entrenamiento: {modeloA.tiempo_entrenamiento_seg ?? '—'} seg</Text>
          <Text style={styles.footerText}>Peso: {modeloA.peso_kb ?? '—'} KB</Text>
        </View>
      </View>

      {/* Modelo B */}
      <View style={[styles.card, styles.cardBorderB]}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.cardTitle}>Modelo B</Text>
            <Text style={styles.cardSub}>Random Forest · Cap. de pago</Text>
          </View>
          <View style={[styles.datasetBadge, styles.badgeB]}>
            <Text style={[styles.datasetText, styles.datasetTextB]}>German Credit</Text>
          </View>
        </View>
        <Text style={styles.metricaLabel}>Accuracy</Text>
        <Text style={styles.metricaValue}>
          {modeloB.accuracy != null ? `${Math.round(modeloB.accuracy * 100)}%` : '—'}
        </Text>
        <View style={styles.divider} />
        <MetricaBar label="F1-Score" value={modeloB.f1_score} color="#059669" />
        <MetricaBar label="ROC-AUC" value={modeloB.roc_auc} color="#059669" />
        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Entrenamiento: {modeloB.tiempo_entrenamiento_seg ?? '—'} seg</Text>
          <Text style={styles.footerText}>Peso: {modeloB.peso_kb ?? '—'} KB</Text>
        </View>
      </View>

      {/* Modelo C */}
      <View style={[styles.card, styles.cardBorderC]}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.cardTitle}>Modelo C</Text>
            <Text style={styles.cardSub}>Isolation Forest · Fraude</Text>
          </View>
          <View style={[styles.datasetBadge, styles.badgeC]}>
            <Text style={[styles.datasetText, styles.datasetTextC]}>Sintético</Text>
          </View>
        </View>
        <Text style={styles.metricaLabel}>Tasa de detección</Text>
        <Text style={styles.metricaValue}>
          {modeloC.tasa_deteccion != null ? `${Math.round(modeloC.tasa_deteccion * 100)}%` : '—'}
        </Text>
        <View style={styles.divider} />
        <MetricaBar label="Falsos +" value={modeloC.falsos_positivos} color="#DC2626" />
        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Entrenamiento: {modeloC.tiempo_entrenamiento_seg ?? '—'} seg</Text>
          <Text style={styles.footerText}>Peso: {modeloC.peso_kb ?? '—'} KB</Text>
        </View>
      </View>

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
  warningCard: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1.5, borderColor: '#FDE68A',
    borderRadius: 12, padding: 14, marginBottom: 16,
  },
  warningTitle: { color: '#D97706', fontSize: 13, fontWeight: '700', marginBottom: 4 },
  warningText: { color: '#92400E', fontSize: 12, lineHeight: 18 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16, padding: 20,
    borderWidth: 1.5, borderColor: '#E2E8F0',
    marginBottom: 14,
    shadowColor: '#6B4EFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06, shadowRadius: 12, elevation: 3,
  },
  cardBorderA: { borderTopWidth: 3, borderTopColor: '#6B4EFF' },
  cardBorderB: { borderTopWidth: 3, borderTopColor: '#059669' },
  cardBorderC: { borderTopWidth: 3, borderTopColor: '#DC2626' },
  cardHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: 16,
  },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#1A1A2E' },
  cardSub: { fontSize: 11, color: '#8892B0', marginTop: 2 },
  datasetBadge: {
    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4,
    borderWidth: 1.5,
  },
  datasetText: { fontSize: 10, fontWeight: '700' },
  badgeA: { backgroundColor: '#EDE9FF', borderColor: '#C4B5FD' },
  datasetTextA: { color: '#6B4EFF' },
  badgeB: { backgroundColor: '#ECFDF5', borderColor: '#6EE7B7' },
  datasetTextB: { color: '#059669' },
  badgeC: { backgroundColor: '#FEF2F2', borderColor: '#FECACA' },
  datasetTextC: { color: '#DC2626' },
  metricaLabel: { fontSize: 12, color: '#8892B0', marginBottom: 4, fontWeight: '500' },
  metricaValue: { fontSize: 30, fontWeight: '700', color: '#1A1A2E' },
  divider: { height: 1, backgroundColor: '#F0EFFF', marginVertical: 14 },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  barLabel: { fontSize: 12, color: '#4A5568', width: 70, fontWeight: '500' },
  barTrack: {
    flex: 1, height: 8,
    backgroundColor: '#F0EFFF', borderRadius: 4, overflow: 'hidden',
  },
  barFill: { height: '100%', borderRadius: 4 },
  barVal: { fontSize: 12, color: '#8892B0', width: 36, textAlign: 'right', fontWeight: '600' },
  footerRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    marginTop: 14, paddingTop: 12,
    borderTopWidth: 1, borderTopColor: '#F0EFFF',
  },
  footerText: { fontSize: 11, color: '#A0AEC0' },
});