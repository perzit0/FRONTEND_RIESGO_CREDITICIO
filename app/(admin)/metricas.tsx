import { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import apiClient from '../../data/api/client';

export default function MetricasScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [metricas, setMetricas] = useState<any>(null);

  useEffect(() => { cargarMetricas(); }, []);

  async function cargarMetricas() {
    try {
      const res = await apiClient.get('/api/admin/metricas-modelos');
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

  const riesgo = metricas?.modelo_riesgo_produccion ?? {};
  const fraude = metricas?.modelo_fraude_produccion ?? {};

  function MetricaFila({ label, value }: { label: string, value: string }) {
    return (
      <View style={styles.filaRow}>
        <Text style={styles.filaLabel}>{label}</Text>
        <Text style={styles.filaValue}>{value}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>

      <View style={styles.header}>
        <Text style={styles.headerSub}>UNFV — Riesgo Crediticio</Text>
        <Text style={styles.title}>Modelos en producción</Text>
        <Text style={styles.sub}>Modelos de IA actualmente en uso</Text>
      </View>

      <View style={styles.nav}>
        <TouchableOpacity style={styles.navBtn} onPress={() => router.push('/(admin)/dashboard')}>
          <Text style={styles.navText}>Dashboard</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navBtn} onPress={() => router.push('/(admin)/casos-fraude')}>
          <Text style={styles.navText}>Cola de fraude</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.navBtn, styles.navActive]}>
          <Text style={[styles.navText, styles.navTextActive]}>Métricas</Text>
        </TouchableOpacity>
      </View>

      {/* Modelo de riesgo */}
      <View style={[styles.card, { borderTopColor: '#6B4EFF' }]}>
        <View style={styles.cardHeader}>
          <View style={styles.iconWrap}>
            <Text style={styles.iconText}>📊</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>Modelo de riesgo crediticio</Text>
            <Text style={styles.cardSub}>Algoritmo: {riesgo.algoritmo ?? 'XGBoost'}</Text>
          </View>
          <View style={styles.activeBadge}>
            <Text style={styles.activeBadgeText}>● Activo</Text>
          </View>
        </View>

        <View style={styles.metricasGrid}>
          <View style={styles.metricaCard}>
            <Text style={styles.metricaNum}>
              {riesgo.accuracy != null ? `${Math.round(riesgo.accuracy * 100)}%` : '—'}
            </Text>
            <Text style={styles.metricaLabel}>Accuracy</Text>
          </View>
          <View style={styles.metricaCard}>
            <Text style={styles.metricaNum}>
              {riesgo.f1_score != null ? `${Math.round(riesgo.f1_score * 100)}%` : '—'}
            </Text>
            <Text style={styles.metricaLabel}>F1-Score</Text>
          </View>
          <View style={styles.metricaCard}>
            <Text style={styles.metricaNum}>
              {riesgo.roc_auc != null ? `${Math.round(riesgo.roc_auc * 100)}%` : '—'}
            </Text>
            <Text style={styles.metricaLabel}>ROC-AUC</Text>
          </View>
        </View>

        <View style={styles.divider} />
        <MetricaFila
          label="Tiempo de entrenamiento"
          value={riesgo.tiempo_entrenamiento_seg != null ? `${riesgo.tiempo_entrenamiento_seg}s` : '—'}
        />
        <MetricaFila
          label="Peso del modelo"
          value={riesgo.peso_kb != null ? `${riesgo.peso_kb} KB` : '—'}
        />
        <MetricaFila
          label="Dataset"
          value="laotse/credit-risk-dataset (Kaggle)"
        />
      </View>

      {/* Modelo de fraude */}
      <View style={[styles.card, { borderTopColor: '#DC2626' }]}>
        <View style={styles.cardHeader}>
          <View style={[styles.iconWrap, { backgroundColor: '#FEF2F2' }]}>
            <Text style={styles.iconText}>🛡️</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>Modelo de detección de fraude</Text>
            <Text style={styles.cardSub}>Algoritmo: {fraude.algoritmo ?? 'Random Forest Supervisado'}</Text>
          </View>
          <View style={[styles.activeBadge, { backgroundColor: '#FEF2F2', borderColor: '#FECACA' }]}>
            <Text style={[styles.activeBadgeText, { color: '#DC2626' }]}>● Activo</Text>
          </View>
        </View>

        <View style={styles.metricasGrid}>
          <View style={styles.metricaCard}>
            <Text style={styles.metricaNum}>
              {fraude.tasa_deteccion != null ? `${Math.round(fraude.tasa_deteccion * 100)}%` : '—'}
            </Text>
            <Text style={styles.metricaLabel}>Detección</Text>
          </View>
          <View style={styles.metricaCard}>
            <Text style={styles.metricaNum}>
              {fraude.falsos_positivos != null ? `${Math.round(fraude.falsos_positivos * 100)}%` : '—'}
            </Text>
            <Text style={styles.metricaLabel}>Falsos +</Text>
          </View>
          <View style={styles.metricaCard}>
            <Text style={styles.metricaNum}>
              {fraude.tiempo_entrenamiento_seg != null ? `${fraude.tiempo_entrenamiento_seg}s` : '—'}
            </Text>
            <Text style={styles.metricaLabel}>Entrena.</Text>
          </View>
        </View>

        <View style={styles.divider} />
        <MetricaFila
          label="Tiempo de entrenamiento"
          value={fraude.tiempo_entrenamiento_seg != null ? `${fraude.tiempo_entrenamiento_seg}s` : '—'}
        />
        <MetricaFila
          label="Peso del modelo"
          value={fraude.peso_kb != null ? `${fraude.peso_kb} KB` : '—'}
        />
        <MetricaFila
          label="Dataset"
          value="Sintético generado"
        />
      </View>

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0EFFF' },
  scroll: { padding: 24 },
  loadingWrap: { flex: 1, backgroundColor: '#F0EFFF', alignItems: 'center', justifyContent: 'center', gap: 16 },
  loadingText: { color: '#8892B0', fontSize: 14 },
  header: { marginBottom: 20 },
  headerSub: { fontSize: 12, color: '#6B4EFF', fontWeight: '600', marginBottom: 2 },
  title: { fontSize: 22, fontWeight: '700', color: '#1A1A2E' },
  sub: { fontSize: 13, color: '#8892B0', marginTop: 2 },
  nav: { flexDirection: 'row', gap: 8, marginBottom: 20, flexWrap: 'wrap' },
  navBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10, borderWidth: 1.5, borderColor: '#E2E8F0', backgroundColor: '#fff' },
  navActive: { backgroundColor: '#6B4EFF', borderColor: '#6B4EFF' },
  navText: { color: '#8892B0', fontSize: 13, fontWeight: '500' },
  navTextActive: { color: '#fff', fontWeight: '600' },
  card: {
    backgroundColor: '#fff', borderRadius: 16, padding: 20,
    borderWidth: 1.5, borderColor: '#E2E8F0', marginBottom: 16,
    borderTopWidth: 3,
    shadowColor: '#6B4EFF', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06, shadowRadius: 12, elevation: 3,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
  iconWrap: { width: 44, height: 44, backgroundColor: '#EDE9FF', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  iconText: { fontSize: 22 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#1A1A2E' },
  cardSub: { fontSize: 12, color: '#8892B0', marginTop: 2 },
  activeBadge: {
    backgroundColor: '#ECFDF5', borderWidth: 1.5, borderColor: '#6EE7B7',
    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4,
  },
  activeBadgeText: { fontSize: 11, fontWeight: '700', color: '#059669' },
  metricasGrid: { flexDirection: 'row', gap: 10, marginBottom: 4 },
  metricaCard: {
    flex: 1, backgroundColor: '#F7F8FC', borderRadius: 12,
    padding: 14, alignItems: 'center',
    borderWidth: 1, borderColor: '#E2E8F0',
  },
  metricaNum: { fontSize: 22, fontWeight: '700', color: '#1A1A2E', marginBottom: 4 },
  metricaLabel: { fontSize: 11, color: '#8892B0', fontWeight: '500' },
  divider: { height: 1, backgroundColor: '#F0EFFF', marginVertical: 14 },
  filaRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F7F8FC' },
  filaLabel: { fontSize: 13, color: '#8892B0' },
  filaValue: { fontSize: 13, color: '#1A1A2E', fontWeight: '600' },
});