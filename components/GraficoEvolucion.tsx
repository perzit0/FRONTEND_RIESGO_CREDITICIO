import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Rect, Line, G, Text as SvgText } from 'react-native-svg';
import { useTheme } from '../context/ThemeContext';

interface Props {
  historial: { fecha: string; score_final: number; categoria_riesgo: string }[];
}

const ANCHO = Dimensions.get('window').width - 76;
const ALTO = 190;
const PAD_X = 14;
const PAD_TOP = 22;
const PAD_BOTTOM = 26;

export default function GraficoEvolucion({ historial }: Props) {
  const { colors } = useTheme();

  if (!historial || historial.length < 2) {
    return (
      <View style={[styles.vacio, { backgroundColor: colors.input, borderColor: colors.inputBorder }]}>
        <Text style={[styles.vacioText, { color: colors.textMuted }]}>
          Necesitas al menos 2 evaluaciones para ver tu evolución
        </Text>
      </View>
    );
  }

  // Más antiguo primero. El score se muestra en escala fija 0-100 para que
  // las alturas sean comparables entre evaluaciones (no relativas al min/max).
  const ordenado = [...historial].reverse();
  const n = ordenado.length;

  const areaW = ANCHO - PAD_X * 2;
  const areaH = ALTO - PAD_TOP - PAD_BOTTOM;
  const baseY = ALTO - PAD_BOTTOM;

  // Ancho de barra proporcional al número de evaluaciones (con separación).
  const slot = areaW / n;
  const barW = Math.min(34, slot * 0.6);

  function colorCat(cat: string) {
    if (cat === 'bajo') return colors.success;
    if (cat === 'medio') return colors.warning;
    return colors.danger;
  }

  // Líneas guía en los umbrales de categoría (33 y 66).
  const guias = [33, 66].map(v => ({ v, y: baseY - (v / 100) * areaH }));

  return (
    <View>
      <Svg width={ANCHO} height={ALTO}>
        {/* Guías de umbral */}
        {guias.map(g => (
          <Line
            key={g.v}
            x1={PAD_X} y1={g.y} x2={ANCHO - PAD_X} y2={g.y}
            stroke={colors.divider} strokeWidth={1} strokeDasharray="4 4"
          />
        ))}
        {/* Eje base */}
        <Line x1={PAD_X} y1={baseY} x2={ANCHO - PAD_X} y2={baseY} stroke={colors.inputBorder} strokeWidth={1} />

        {ordenado.map((e, i) => {
          const score = Math.max(0, Math.min(100, (e.score_final ?? 0) * 100));
          const h = Math.max(3, (score / 100) * areaH);
          const cx = PAD_X + slot * i + slot / 2;
          const x = cx - barW / 2;
          const y = baseY - h;
          return (
            <G key={i}>
              <Rect x={x} y={y} width={barW} height={h} rx={4} fill={colorCat(e.categoria_riesgo)} />
              <SvgText x={cx} y={y - 6} fill={colors.textMuted} fontSize={9} fontWeight="700" textAnchor="middle">
                {score.toFixed(0)}
              </SvgText>
            </G>
          );
        })}
      </Svg>
      <View style={styles.leyendaRow}>
        <Text style={[styles.leyendaTexto, { color: colors.textMuted }]}>
          {n} evaluaciones — de {new Date(ordenado[0].fecha).toLocaleDateString('es-PE')} a {new Date(ordenado[n - 1].fecha).toLocaleDateString('es-PE')}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  vacio: { borderRadius: 12, borderWidth: 1.5, padding: 20, alignItems: 'center' },
  vacioText: { fontSize: 13, textAlign: 'center' },
  leyendaRow: { marginTop: 8 },
  leyendaTexto: { fontSize: 11, textAlign: 'center' },
});
