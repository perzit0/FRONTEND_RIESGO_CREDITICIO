import { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import apiClient from '../../data/api/client';
import { useTheme } from '../../context/ThemeContext';

export default function ComunidadScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [datos, setDatos] = useState<any>(null);

  useEffect(() => { cargarDatos(); }, []);

  async function cargarDatos() {
    try {
      const res = await apiClient.get('/api/user/comunidad');
      setDatos(res.data);
    } catch { }
    finally { setLoading(false); }
  }

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  const bajo = datos?.porcentajes?.bajo ?? 0;
  const medio = datos?.porcentajes?.medio ?? 0;
  const alto = datos?.porcentajes?.alto ?? 0;
  const total = datos?.total_personas ?? 0;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={styles.scroll}>

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[styles.backText, { color: colors.primary }]}>← Volver</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Comunidad</Text>
        <Text style={[styles.sub, { color: colors.textSecondary }]}>Así están los demás usuarios de la plataforma</Text>
      </View>

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>Total de personas evaluadas</Text>
        <Text style={[styles.totalNum, { color: colors.primary }]}>{total}</Text>
      </View>

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Distribución de riesgo crediticio</Text>
        {[
          { label: 'Riesgo Bajo', pct: bajo, color: colors.success },
          { label: 'Riesgo Medio', pct: medio, color: colors.warning },
          { label: 'Riesgo Alto', pct: alto, color: colors.danger },
        ].map(({ label, pct, color }) => (
          <View key={label} style={styles.barraRow}>
            <View style={styles.barraLabelWrap}>
              <View style={[styles.barraDot, { backgroundColor: color }]} />
              <Text style={[styles.barraLabel, { color: colors.textSecondary }]}>{label}</Text>
            </View>
            <View style={[styles.barraTrack, { backgroundColor: colors.input }]}>
              <View style={[styles.barraFill, { width: `${pct}%`, backgroundColor: color }]} />
            </View>
            <Text style={[styles.barraPct, { color: colors.textMuted }]}>{pct}%</Text>
          </View>
        ))}
      </View>

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Proporción visual</Text>
        <View style={styles.donaWrap}>
          <View style={styles.donaBar}>
            {bajo > 0 && <View style={[styles.donaSegmento, { flex: bajo, backgroundColor: colors.success }]} />}
            {medio > 0 && <View style={[styles.donaSegmento, { flex: medio, backgroundColor: colors.warning }]} />}
            {alto > 0 && <View style={[styles.donaSegmento, { flex: alto, backgroundColor: colors.danger }]} />}
          </View>
          <View style={styles.leyendaWrap}>
            {[
              { color: colors.success, label: `Bajo — ${bajo}%` },
              { color: colors.warning, label: `Medio — ${medio}%` },
              { color: colors.danger, label: `Alto — ${alto}%` },
            ].map(({ color, label }) => (
              <View key={label} style={styles.leyendaItem}>
                <View style={[styles.leyendaDot, { backgroundColor: color }]} />
                <Text style={[styles.leyendaText, { color: colors.textSecondary }]}>{label}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.tarjetasGrid}>
        {[
          { color: colors.success, borderColor: colors.success, num: datos?.distribucion?.bajo ?? 0, label: 'usuarios con\nriesgo bajo' },
          { color: colors.warning, borderColor: colors.warning, num: datos?.distribucion?.medio ?? 0, label: 'usuarios con\nriesgo medio' },
          { color: colors.danger, borderColor: colors.danger, num: datos?.distribucion?.alto ?? 0, label: 'usuarios con\nriesgo alto' },
        ].map(({ color, borderColor, num, label }) => (
          <View key={label} style={[styles.tarjeta, { backgroundColor: colors.card, borderColor: colors.cardBorder, borderTopColor: borderColor }]}>
            <Text style={[styles.tarjetaNum, { color: colors.textPrimary }]}>{num}</Text>
            <Text style={[styles.tarjetaLabel, { color: colors.textSecondary }]}>{label}</Text>
          </View>
        ))}
      </View>

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 20 },
  header: { marginBottom: 20 },
  backText: { fontSize: 14, fontWeight: '500', marginBottom: 12 },
  title: { fontSize: 24, fontWeight: '700' },
  sub: { fontSize: 13, marginTop: 4 },
  card: { borderRadius: 16, padding: 18, borderWidth: 1.5, marginBottom: 14, shadowColor: 'transparent', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0, shadowRadius: 12, elevation: 0 },
  cardTitle: { fontSize: 15, fontWeight: '700', marginBottom: 16 },
  totalLabel: { fontSize: 13, fontWeight: '500', marginBottom: 6 },
  totalNum: { fontSize: 40, fontWeight: '700' },
  barraRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14, gap: 10 },
  barraLabelWrap: { flexDirection: 'row', alignItems: 'center', gap: 6, width: 110 },
  barraDot: { width: 8, height: 8, borderRadius: 4 },
  barraLabel: { fontSize: 12, fontWeight: '500' },
  barraTrack: { flex: 1, height: 10, borderRadius: 5, overflow: 'hidden' },
  barraFill: { height: '100%', borderRadius: 5 },
  barraPct: { fontSize: 12, fontWeight: '600', width: 36, textAlign: 'right' },
  donaWrap: { gap: 16 },
  donaBar: { flexDirection: 'row', height: 28, borderRadius: 14, overflow: 'hidden' },
  donaSegmento: { height: '100%' },
  leyendaWrap: { flexDirection: 'row', justifyContent: 'space-around', flexWrap: 'wrap', gap: 8 },
  leyendaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  leyendaDot: { width: 10, height: 10, borderRadius: 5 },
  leyendaText: { fontSize: 12, fontWeight: '500' },
  tarjetasGrid: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  tarjeta: { flex: 1, borderRadius: 14, padding: 14, borderWidth: 1.5, borderTopWidth: 3, alignItems: 'center', shadowColor: 'transparent', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0, shadowRadius: 8, elevation: 0 },
  tarjetaNum: { fontSize: 28, fontWeight: '700', marginBottom: 4 },
  tarjetaLabel: { fontSize: 11, textAlign: 'center', lineHeight: 16 },
});