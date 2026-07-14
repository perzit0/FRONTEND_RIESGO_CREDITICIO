import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Alert
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Svg, { Path, Circle, Line, Text as SvgText } from 'react-native-svg';
import { descargarPdfAutenticado } from '../../data/api/descargarPdf';
import { useTheme } from '../../context/ThemeContext';

function Velocimetro({ scorePct, categoria, colors }: { scorePct: number, categoria: string, colors: any }) {
  const W = 300, H = 210, cx = W / 2, cy = H - 54, r = 110;

  const scoreClamped = Math.max(0, Math.min(100, scorePct));
  const angulo = -180 + (scoreClamped / 100) * 180;
  const rad = (angulo * Math.PI) / 180;
  const agujaX = cx + (r - 22) * Math.cos(rad);
  const agujaY = cy + (r - 22) * Math.sin(rad);

  function getColor() {
    if (categoria === 'bajo') return colors.success;
    if (categoria === 'medio') return colors.warning;
    return colors.danger;
  }

  function arcPath(startDeg: number, endDeg: number) {
    const s = (startDeg * Math.PI) / 180;
    const e = (endDeg * Math.PI) / 180;
    const x1 = cx + r * Math.cos(s), y1 = cy + r * Math.sin(s);
    const x2 = cx + r * Math.cos(e), y2 = cy + r * Math.sin(e);
    return `M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2}`;
  }

  function marcaPos(pct: number) {
    const deg = -180 + pct * 1.8;
    const rad2 = (deg * Math.PI) / 180;
    const rMarca = r + 18;
    return { x: cx + rMarca * Math.cos(rad2), y: cy + rMarca * Math.sin(rad2) };
  }

  return (
    <Svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <Path d={arcPath(-180, -120)} fill="none" stroke={colors.danger} strokeWidth={20} strokeLinecap="round" />
      <Path d={arcPath(-120, -60)} fill="none" stroke={colors.warning} strokeWidth={20} strokeLinecap="round" />
      <Path d={arcPath(-60, 0)} fill="none" stroke={colors.success} strokeWidth={20} strokeLinecap="round" />

      {[{ pct: 0, label: '0' }, { pct: 33, label: '33' }, { pct: 66, label: '66' }, { pct: 100, label: '100' }].map(({ pct, label }) => {
        const pos = marcaPos(pct);
        return (
          <SvgText key={label} x={pos.x} y={pos.y} fill={colors.textMuted} fontSize={10} fontWeight="600" textAnchor="middle" alignmentBaseline="central">
            {label}
          </SvgText>
        );
      })}

      <SvgText x={26} y={H - 40} fill={colors.danger} fontSize={11} fontWeight="700" textAnchor="middle">Alto</SvgText>
      <SvgText x={cx} y={40} fill={colors.warning} fontSize={11} fontWeight="700" textAnchor="middle">Medio</SvgText>
      <SvgText x={W - 26} y={H - 40} fill={colors.success} fontSize={11} fontWeight="700" textAnchor="middle">Bajo</SvgText>

      <Line x1={cx} y1={cy} x2={agujaX} y2={agujaY} stroke={getColor()} strokeWidth={4} strokeLinecap="round" />
      <Circle cx={cx} cy={cy} r={10} fill={getColor()} />
      <Circle cx={cx} cy={cy} r={4} fill={colors.card} />

      <SvgText x={cx} y={H - 8} fill={getColor()} fontSize={32} fontWeight="800" textAnchor="middle">
        {scoreClamped.toFixed(0)}
      </SvgText>
      <SvgText x={cx} y={H - 8} dx={38} dy={-2} fill={colors.textMuted} fontSize={13} fontWeight="600" textAnchor="start">
        /100
      </SvgText>
    </Svg>
  );
}

export default function ResultadoScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { data } = useLocalSearchParams();
  const resultado = data ? JSON.parse(data as string) : null;

  if (!resultado) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: colors.textSecondary }}>No hay datos de evaluación</Text>
      </View>
    );
  }

  const categoria = resultado.categoria_riesgo ?? 'desconocido';
  const factores = resultado.factores_influyentes ?? [];
  const recomendaciones = resultado.recomendaciones ?? [];
  const scorePct = (resultado.score_final ?? 0) * 100;

  function getCategoriaColor() {
    if (categoria === 'bajo') return colors.success;
    if (categoria === 'medio') return colors.warning;
    return colors.danger;
  }
  function getCategoriaBg() {
    if (categoria === 'bajo') return colors.successBg;
    if (categoria === 'medio') return colors.warningBg;
    return colors.dangerBg;
  }
  function getCategoriaLabel() {
    if (categoria === 'bajo') return 'Riesgo Bajo';
    if (categoria === 'medio') return 'Riesgo Medio';
    return 'Riesgo Alto';
  }
  function getCategoriaDesc() {
    if (categoria === 'bajo') return 'Tu perfil financiero se encuentra en buen estado';
    if (categoria === 'medio') return 'Hay aspectos que podrías mejorar';
    return 'Te recomendamos revisar tu situación financiera';
  }

  async function handleDescargarPDF() {
    try {
      const evaluacionId = resultado.evaluacion_id;
      const ok = await descargarPdfAutenticado(
        `/api/user/evaluacion/${evaluacionId}/pdf`,
        `Reporte_Crediticio_${evaluacionId}.pdf`
      );
      if (!ok) Alert.alert('Error', 'No se pudo generar el PDF');
    } catch {
      Alert.alert('Error', 'No se pudo descargar el reporte');
    }
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ padding: 20, alignItems: 'center' }}>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, width: '100%', maxWidth: 480 }}>
        <Text style={{ fontSize: 15, fontWeight: '700', color: colors.primary }}>UNFV — Riesgo Crediticio</Text>
        <View style={[styles.badge, { backgroundColor: getCategoriaBg(), borderColor: getCategoriaColor() + '40' }]}>
          <Text style={[styles.badgeText, { color: getCategoriaColor() }]}>Verificado</Text>
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <View style={{ alignItems: 'center', paddingVertical: 8 }}>
          <Velocimetro scorePct={scorePct} categoria={categoria} colors={colors} />
          <Text style={[styles.resultLabel, { color: getCategoriaColor() }]}>{getCategoriaLabel()}</Text>
          <Text style={[styles.resultDesc, { color: colors.textSecondary }]}>{getCategoriaDesc()}</Text>
        </View>

        <View style={[styles.explicacionBox, { backgroundColor: colors.input, borderColor: colors.inputBorder }]}>
          <Text style={[styles.explicacionText, { color: colors.textSecondary }]}>
            El score va de 0 a 100: mientras más alto, mayor es la probabilidad estimada de incumplimiento de pago. Un score bajo indica menor riesgo; un score alto indica mayor riesgo.
          </Text>
        </View>
      </View>

      {factores.length > 0 && (
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Factores que influyeron</Text>
          {factores.map((f: any, i: number) => (
            <View key={i} style={styles.factorRow}>
              <View style={[styles.factorDot, { backgroundColor: f.impacto === 'positivo' ? colors.success : colors.danger }]} />
              <Text style={[styles.factorText, { color: colors.textSecondary }]}>{f.factor}</Text>
              <View style={[styles.factorBadge, { backgroundColor: f.impacto === 'positivo' ? colors.successBg : colors.dangerBg }]}>
                <Text style={[styles.factorBadgeText, { color: f.impacto === 'positivo' ? colors.success : colors.danger }]}>
                  {f.impacto === 'positivo' ? '↑ positivo' : '↓ negativo'}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Recomendaciones</Text>
        {recomendaciones.map((rec: string, i: number) => (
          <View key={i} style={[styles.recRow, { backgroundColor: colors.input, borderColor: colors.inputBorder }]}>
            <Text style={[styles.recBullet, { color: colors.primary }]}>→</Text>
            <Text style={[styles.recText, { color: colors.textSecondary }]}>{rec}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity style={[styles.btnPrimary, { backgroundColor: colors.primary }]} onPress={handleDescargarPDF}>
        <Text style={styles.btnPrimaryText}>Descargar reporte PDF</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.btnSecondary, { borderColor: colors.primary }]} onPress={() => router.replace('/(user)/home')}>
        <Text style={[styles.btnSecondaryText, { color: colors.primary }]}>Volver al inicio</Text>
      </TouchableOpacity>

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  badge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, borderWidth: 1 },
  badgeText: { fontSize: 11, fontWeight: '600' },
  card: { width: '100%', maxWidth: 480, borderRadius: 20, padding: 20, borderWidth: 1.5, shadowColor: 'transparent', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0, shadowRadius: 16, elevation: 0, marginBottom: 14 },
  cardTitle: { fontSize: 14, fontWeight: '700', marginBottom: 14 },
  resultLabel: { fontSize: 22, fontWeight: '700', marginTop: 4, marginBottom: 6 },
  resultDesc: { fontSize: 13, textAlign: 'center' },
  explicacionBox: { borderRadius: 12, borderWidth: 1, padding: 12, marginTop: 14 },
  explicacionText: { fontSize: 12, lineHeight: 18, textAlign: 'center' },
  factorRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  factorDot: { width: 8, height: 8, borderRadius: 4, flexShrink: 0 },
  factorText: { fontSize: 13, flex: 1 },
  factorBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  factorBadgeText: { fontSize: 11, fontWeight: '600' },
  recRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', padding: 10, borderRadius: 10, marginBottom: 8, borderWidth: 1 },
  recBullet: { fontSize: 14, flexShrink: 0, fontWeight: '700' },
  recText: { fontSize: 12, flex: 1, lineHeight: 18 },
  btnPrimary: { width: '100%', maxWidth: 480, borderRadius: 12, padding: 15, alignItems: 'center', marginBottom: 10 },
  btnPrimaryText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  btnSecondary: { width: '100%', maxWidth: 480, borderWidth: 1.5, borderRadius: 12, padding: 14, alignItems: 'center' },
  btnSecondaryText: { fontSize: 14, fontWeight: '600' },
});
