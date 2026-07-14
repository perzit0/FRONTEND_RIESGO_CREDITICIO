import { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import apiClient from '../../data/api/client';
import { useTheme } from '../../context/ThemeContext';

export default function MetricasScreen() {
  const router = useRouter();
  const { colors } = useTheme();
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
      <View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <ActivityIndicator color={colors.primary} size="large" />
        <Text style={{ color: colors.textSecondary, fontSize: 14 }}>Cargando métricas...</Text>
      </View>
    );
  }

  const riesgo = metricas?.modelo_riesgo_produccion ?? {};
  const fraude = metricas?.modelo_fraude_produccion ?? {};

  function MetricaFila({ label, value }: { label: string, value: string }) {
    return (
      <View style={[styles.filaRow, { borderBottomColor: colors.divider }]}>
        <Text style={[styles.filaLabel, { color: colors.textSecondary }]}>{label}</Text>
        <Text style={[styles.filaValue, { color: colors.textPrimary }]}>{value}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={styles.scroll}>

      <View style={styles.header}>
        <Text style={[styles.headerSub, { color: colors.primary }]}>UNFV — Riesgo Crediticio</Text>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Modelos en producción</Text>
        <Text style={[styles.sub, { color: colors.textSecondary }]}>Modelos de IA actualmente en uso</Text>
      </View>

      <View style={styles.nav}>
        <TouchableOpacity style={[styles.navBtn, { borderColor: colors.cardBorder, backgroundColor: colors.card }]} onPress={() => router.push('/(admin)/dashboard')}>
          <Text style={[styles.navText, { color: colors.textSecondary }]}>Dashboard</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.navBtn, { borderColor: colors.cardBorder, backgroundColor: colors.card }]} onPress={() => router.push('/(admin)/casos-fraude')}>
          <Text style={[styles.navText, { color: colors.textSecondary }]}>Cola de fraude</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.navBtn, styles.navActive, { backgroundColor: colors.primary, borderColor: colors.primary }]}>
          <Text style={[styles.navText, styles.navTextActive]}>Métricas</Text>
        </TouchableOpacity>
      </View>

      {/* Modelo de riesgo */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder, borderTopColor: colors.primary }]}>
        <View style={styles.cardHeader}>
          <View style={[styles.iconWrap, { backgroundColor: colors.primaryLight }]}>
            <Text style={styles.iconText}>📊</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Modelo de riesgo crediticio</Text>
            <Text style={[styles.cardSub, { color: colors.textSecondary }]}>Algoritmo: {riesgo.algoritmo ?? 'XGBoost'}</Text>
          </View>
          <View style={[styles.activeBadge, { backgroundColor: colors.successBg, borderColor: colors.successBorder }]}>
            <Text style={[styles.activeBadgeText, { color: colors.success }]}>● Activo</Text>
          </View>
        </View>

        <View style={styles.metricasGrid}>
          {[
            { num: riesgo.accuracy != null ? `${Math.round(riesgo.accuracy * 100)}%` : '—', label: 'Accuracy' },
            { num: riesgo.f1_score != null ? `${Math.round(riesgo.f1_score * 100)}%` : '—', label: 'F1-Score' },
            { num: riesgo.roc_auc != null ? `${Math.round(riesgo.roc_auc * 100)}%` : '—', label: 'ROC-AUC' },
          ].map(({ num, label }) => (
            <View key={label} style={[styles.metricaCard, { backgroundColor: colors.input, borderColor: colors.cardBorder }]}>
              <Text style={[styles.metricaNum, { color: colors.textPrimary }]}>{num}</Text>
              <Text style={[styles.metricaLabel, { color: colors.textSecondary }]}>{label}</Text>
            </View>
          ))}
        </View>

        <View style={[styles.divider, { backgroundColor: colors.divider }]} />
        <MetricaFila label="Tiempo de entrenamiento" value={riesgo.tiempo_entrenamiento_seg != null ? `${riesgo.tiempo_entrenamiento_seg}s` : '—'} />
        <MetricaFila label="Peso del modelo" value={riesgo.peso_kb != null ? `${riesgo.peso_kb} KB` : '—'} />
        <MetricaFila label="Dataset" value="laotse/credit-risk-dataset (Kaggle)" />
      </View>

      {/* Modelo de fraude */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder, borderTopColor: colors.danger }]}>
        <View style={styles.cardHeader}>
          <View style={[styles.iconWrap, { backgroundColor: colors.dangerBg }]}>
            <Text style={styles.iconText}>🛡️</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Modelo de detección de fraude</Text>
            <Text style={[styles.cardSub, { color: colors.textSecondary }]}>Algoritmo: {fraude.algoritmo ?? 'Random Forest Supervisado'}</Text>
          </View>
          <View style={[styles.activeBadge, { backgroundColor: colors.dangerBg, borderColor: colors.dangerBorder }]}>
            <Text style={[styles.activeBadgeText, { color: colors.danger }]}>● Activo</Text>
          </View>
        </View>

        <View style={styles.metricasGrid}>
          {[
            { num: fraude.tasa_deteccion != null ? `${Math.round(fraude.tasa_deteccion * 100)}%` : '—', label: 'Detección' },
            { num: fraude.falsos_positivos != null ? `${Math.round(fraude.falsos_positivos * 100)}%` : '—', label: 'Falsos +' },
            { num: fraude.tiempo_entrenamiento_seg != null ? `${fraude.tiempo_entrenamiento_seg}s` : '—', label: 'Entrena.' },
          ].map(({ num, label }) => (
            <View key={label} style={[styles.metricaCard, { backgroundColor: colors.input, borderColor: colors.cardBorder }]}>
              <Text style={[styles.metricaNum, { color: colors.textPrimary }]}>{num}</Text>
              <Text style={[styles.metricaLabel, { color: colors.textSecondary }]}>{label}</Text>
            </View>
          ))}
        </View>

        <View style={[styles.divider, { backgroundColor: colors.divider }]} />
        <MetricaFila label="Tiempo de entrenamiento" value={fraude.tiempo_entrenamiento_seg != null ? `${fraude.tiempo_entrenamiento_seg}s` : '—'} />
        <MetricaFila label="Peso del modelo" value={fraude.peso_kb != null ? `${fraude.peso_kb} KB` : '—'} />
        <MetricaFila label="Dataset" value="Sintético generado" />
      </View>

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
  card: { borderRadius: 16, padding: 20, borderWidth: 1.5, borderTopWidth: 3, marginBottom: 16, shadowColor: 'transparent', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0, shadowRadius: 12, elevation: 0 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
  iconWrap: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  iconText: { fontSize: 22 },
  cardTitle: { fontSize: 15, fontWeight: '700' },
  cardSub: { fontSize: 12, marginTop: 2 },
  activeBadge: { borderWidth: 1.5, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  activeBadgeText: { fontSize: 11, fontWeight: '700' },
  metricasGrid: { flexDirection: 'row', gap: 10, marginBottom: 4 },
  metricaCard: { flex: 1, borderRadius: 12, padding: 14, alignItems: 'center', borderWidth: 1 },
  metricaNum: { fontSize: 22, fontWeight: '700', marginBottom: 4 },
  metricaLabel: { fontSize: 11, fontWeight: '500' },
  divider: { height: 1, marginVertical: 14 },
  filaRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1 },
  filaLabel: { fontSize: 13 },
  filaValue: { fontSize: 13, fontWeight: '600' },
});