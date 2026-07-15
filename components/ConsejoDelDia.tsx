import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

// Consejos de educación financiera. Se elige uno según el día del año, así
// que todos los usuarios ven el mismo consejo el mismo día y cambia solo
// una vez cada 24 h (determinista, sin necesidad de backend ni storage).
const CONSEJOS: { titulo: string; texto: string }[] = [
  { titulo: 'Regla 50/30/20', texto: 'Destina 50% de tu ingreso a necesidades, 30% a gustos y 20% a ahorro o pago de deudas. Es el punto de partida de un presupuesto sano.' },
  { titulo: 'Fondo de emergencia', texto: 'Apunta a ahorrar el equivalente a 3 meses de gastos. Es lo que evita que una urgencia se convierta en una deuda cara.' },
  { titulo: 'Paga a tiempo, siempre', texto: 'El historial de pagos es el factor que más pesa en tu perfil crediticio. Un solo pago atrasado puede tardar años en borrarse.' },
  { titulo: 'Cuida tu ratio deuda/ingreso', texto: 'Si tus deudas mensuales superan el 35% de tu ingreso, las entidades te ven como riesgoso. Por debajo del 20% es lo ideal.' },
  { titulo: 'No uses todo tu cupo', texto: 'Usar más del 30% de la línea de tu tarjeta de crédito baja tu score, aunque pagues el total cada mes.' },
  { titulo: 'Revisa tu reporte crediticio', texto: 'En Perú puedes consultar gratis tu reporte en la Central de Riesgos de la SBS. Los errores son más comunes de lo que crees.' },
  { titulo: 'Antigüedad suma', texto: 'No cierres tu tarjeta más antigua solo porque no la usas: la antigüedad de tu historial juega a tu favor.' },
  { titulo: 'Evita pedir varios créditos a la vez', texto: 'Cada solicitud deja una consulta en tu historial. Muchas en poco tiempo dan señal de necesidad urgente de dinero.' },
  { titulo: 'Método bola de nieve', texto: 'Paga primero la deuda más pequeña para ganar impulso, o la de mayor tasa para ahorrar más dinero. Elige una y sé constante.' },
  { titulo: 'Automatiza tu ahorro', texto: 'Programa una transferencia automática el día que cobras. Ahorrar lo que sobra a fin de mes casi nunca funciona.' },
  { titulo: 'Lee la TCEA, no la tasa', texto: 'La TCEA incluye comisiones y seguros: es el costo real del crédito. Dos préstamos con la misma tasa pueden costar muy distinto.' },
  { titulo: 'Estabilidad laboral cuenta', texto: 'La antigüedad en tu trabajo es una de las variables que evalúa nuestro modelo. Cambiar de empleo muy seguido puede afectarte.' },
  { titulo: 'Deuda buena vs. deuda mala', texto: 'Endeudarte para algo que se revaloriza o genera ingresos es distinto a endeudarte para consumo que pierde valor de inmediato.' },
  { titulo: 'Registra tus gastos', texto: 'Anota lo que gastas durante un mes. La mayoría descubre entre 15% y 20% de gasto invisible que puede recortar sin dolor.' },
  { titulo: 'Cuidado con el mínimo', texto: 'Pagar solo el mínimo de tu tarjeta puede hacer que una deuda pequeña tarde años en saldarse por los intereses.' },
];

export default function ConsejoDelDia() {
  const { colors } = useTheme();

  const inicioAnio = new Date(new Date().getFullYear(), 0, 0);
  const diaDelAnio = Math.floor((Date.now() - inicioAnio.getTime()) / 86400000);
  const consejo = CONSEJOS[diaDelAnio % CONSEJOS.length];

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
      <View style={styles.headerRow}>
        <Text style={[styles.etiqueta, { color: colors.primary }]}>CONSEJO DEL DÍA</Text>
      </View>
      <Text style={[styles.titulo, { color: colors.textPrimary }]}>{consejo.titulo}</Text>
      <Text style={[styles.texto, { color: colors.textSecondary }]}>{consejo.texto}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 14, padding: 16, borderWidth: 1, marginBottom: 12 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  etiqueta: { fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  titulo: { fontSize: 15, fontWeight: '700', marginBottom: 6 },
  texto: { fontSize: 13, lineHeight: 20 },
});
