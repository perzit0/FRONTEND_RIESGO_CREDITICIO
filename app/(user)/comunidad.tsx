import { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import apiClient from '../../data/api/client';

export default function ComunidadScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [datos, setDatos] = useState<any>(null);

  useEffect(() => { cargarDatos(); }, []);

  async function cargarDatos() {
    try {
      const res = await apiClient.get('/api/user/comunidad');
      setDatos(res.data);
    } catch (err) {
      console.log('Error cargando comunidad:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator color="#6B4EFF" size="large" />
      </View>
    );
  }

  const bajo = datos?.porcentajes?.bajo ?? 0;
  const medio = datos?.porcentajes?.medio ?? 0;
  const alto = datos?.porcentajes?.alto ?? 0;
  const total = datos?.total_personas ?? 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Comunidad</Text>
        <Text style={styles.sub}>Así están los demás usuarios de la plataforma</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.totalLabel}>Total de personas evaluadas</Text>
        <Text style={styles.totalNum}>{total}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Distribución de riesgo crediticio</Text>
        {[
          { label: 'Riesgo Bajo', pct: bajo, color: '#059669' },
          { label: 'Riesgo Medio', pct: medio, color: '#D97706' },
          { label: 'Riesgo Alto', pct: alto, color: '#DC2626' },
        ].map(({ label, pct, color }) => (
          <View key={label} style={styles.barraRow}>
            <View style={styles.barraLabelWrap}>
              <View style={[styles.barraDot, { backgroundColor: color }]} />
              <Text style={styles.barraLabel}>{label}</Text>
            </View>
            <View style={styles.barraTrack}>
              <View style={[styles.barraFill, { width: `${pct}%`, backgroundColor: color }]} />
            </View>
            <Text style={styles.barraPct}>{pct}%</Text>
          </View>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Proporción visual</Text>
        <View style={styles.donaWrap}>
          <View style={styles.donaBar}>
            {bajo > 0 && <View style={[styles.donaSegmento, { flex: bajo, backgroundColor: '#059669' }]} />}
            {medio > 0 && <View style={[styles.donaSegmento, { flex: medio, backgroundColor: '#D97706' }]} />}
            {alto > 0 && <View style={[styles.donaSegmento, { flex: alto, backgroundColor: '#DC2626' }]} />}
          </View>
          <View style={styles.leyendaWrap}>
            {[
              { color: '#059669', label: `Bajo — ${bajo}%` },
              { color: '#D97706', label: `Medio — ${medio}%` },
              { color: '#DC2626', label: `Alto — ${alto}%` },
            ].map(({ color, label }) => (
              <View key={label} style={styles.leyendaItem}>
                <View style={[styles.leyendaDot, { backgroundColor: color }]} />
                <Text style={styles.leyendaText}>{label}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.tarjetasGrid}>
        {[
          { color: '#059669', num: datos?.distribucion?.bajo ?? 0, label: 'usuarios con\nriesgo bajo' },
          { color: '#D97706', num: datos?.distribucion?.medio ?? 0, label: 'usuarios con\nriesgo medio' },
          { color: '#DC2626', num: datos?.distribucion?.alto ?? 0, label: 'usuarios con\nriesgo alto' },
        ].map(({ color, num, label }) => (
          <View key={label} style={[styles.tarjeta, { borderTopColor: color }]}>
            <Text style={styles.tarjetaNum}>{num}</Text>
            <Text style={styles.tarjetaLabel}>{label}</Text>
          </View>
        ))}
      </View>

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0EFFF' },
  scroll: { padding: 20 },
  loadingWrap: { flex: 1, backgroundColor: '#F0EFFF', alignItems: 'center', justifyContent: 'center' },
  header: { marginBottom: 20 },
  backBtn: { marginBottom: 12 },
  backText: { color: '#6B4EFF', fontSize: 14, fontWeight: '500' },
  title: { fontSize: 24, fontWeight: '700', color: '#1A1A2E' },
  sub: { fontSize: 13, color: '#8892B0', marginTop: 4 },
  card: {
    backgroundColor: '#fff', borderRadius: 16, padding: 18,
    borderWidth: 1.5, borderColor: '#E2E8F0', marginBottom: 14,
    shadowColor: '#6B4EFF', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06, shadowRadius: 12, elevation: 3,
  },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#1A1A2E', marginBottom: 16 },
  totalLabel: { fontSize: 13, color: '#8892B0', fontWeight: '500', marginBottom: 6 },
  totalNum: { fontSize: 40, fontWeight: '700', color: '#6B4EFF' },
  barraRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14, gap: 10 },
  barraLabelWrap: { flexDirection: 'row', alignItems: 'center', gap: 6, width: 110 },
  barraDot: { width: 8, height: 8, borderRadius: 4 },
  barraLabel: { fontSize: 12, color: '#4A5568', fontWeight: '500' },
  barraTrack: { flex: 1, height: 10, backgroundColor: '#F0EFFF', borderRadius: 5, overflow: 'hidden' },
  barraFill: { height: '100%', borderRadius: 5 },
  barraPct: { fontSize: 12, color: '#8892B0', fontWeight: '600', width: 36, textAlign: 'right' },
  donaWrap: { gap: 16 },
  donaBar: { flexDirection: 'row', height: 28, borderRadius: 14, overflow: 'hidden' },
  donaSegmento: { height: '100%' },
  leyendaWrap: { flexDirection: 'row', justifyContent: 'space-around', flexWrap: 'wrap', gap: 8 },
  leyendaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  leyendaDot: { width: 10, height: 10, borderRadius: 5 },
  leyendaText: { fontSize: 12, color: '#4A5568', fontWeight: '500' },
  tarjetasGrid: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  tarjeta: {
    flex: 1, backgroundColor: '#fff', borderRadius: 14, padding: 14,
    borderWidth: 1.5, borderColor: '#E2E8F0', borderTopWidth: 3,
    alignItems: 'center',
    shadowColor: '#6B4EFF', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
  },
  tarjetaNum: { fontSize: 28, fontWeight: '700', color: '#1A1A2E', marginBottom: 4 },
  tarjetaLabel: { fontSize: 11, color: '#8892B0', textAlign: 'center', lineHeight: 16 },
});
