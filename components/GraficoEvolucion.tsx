import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Polyline, Circle, Line, Text as SvgText } from 'react-native-svg';
import { useTheme } from '../context/ThemeContext';

interface Props {
  historial: { fecha: string; score_final: number; categoria_riesgo: string }[];
}

const ANCHO = Dimensions.get('window').width - 76;
const ALTO = 160;
const PADDING = 20;

export default function GraficoEvolucion({ historial }: Props) {
  const { colors } = useTheme();

  if (!historial || historial.length < 2) {
    return (
      <View style={[styles.vacio, { backgroundColor: colors.input, borderColor: colors.inputBorder }]}>
        <Text style={[styles.vacioText, { color: colors.textMuted }]}>
          Necesitas al menos 2 evaluaciones para ver tu evolución 📊
        </Text>
      </View>
    );
  }

  const ordenado = [...historial].reverse(); // mas antiguo primero
  const scores = ordenado.map(e => e.score_final ?? 0);
  const min = Math.min(...scores);
  const max = Math.max(...scores);
  const rango = max - min || 1;

  const puntos = ordenado.map((e, i) => {
    const x = PADDING + (i / (ordenado.length - 1)) * (ANCHO - PADDING * 2);
    const y = ALTO - PADDING - ((e.score_final - min) / rango) * (ALTO - PADDING * 2);
    return { x, y, cat: e.categoria_riesgo };
  });

  const puntosStr = puntos.map(p => `${p.x},${p.y}`).join(' ');

  function colorCat(cat: string) {
    if (cat === 'bajo') return colors.success;
    if (cat === 'medio') return colors.warning;
    return colors.danger;
  }

  return (
    <View>
      <Svg width={ANCHO} height={ALTO}>
        <Line x1={PADDING} y1={ALTO - PADDING} x2={ANCHO - PADDING} y2={ALTO - PADDING} stroke={colors.divider} strokeWidth={1} />
        <Polyline points={puntosStr} fill="none" stroke={colors.primary} strokeWidth={2.5} />
        {puntos.map((p, i) => (
          <Circle key={i} cx={p.x} cy={p.y} r={5} fill={colorCat(p.cat)} stroke={colors.card} strokeWidth={1.5} />
        ))}
      </Svg>
      <View style={styles.leyendaRow}>
        <Text style={[styles.leyendaTexto, { color: colors.textMuted }]}>
          {ordenado.length} evaluaciones — de {new Date(ordenado[0].fecha).toLocaleDateString('es-PE')} a {new Date(ordenado[ordenado.length - 1].fecha).toLocaleDateString('es-PE')}
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