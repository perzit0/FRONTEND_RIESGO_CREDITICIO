import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert,
  KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';
import apiClient from '../../data/api/client';
import { useTheme } from '../../context/ThemeContext';

export default function FormularioScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [paso, setPaso] = useState(1);
  const [loading, setLoading] = useState(false);

  const [datos1, setDatos1] = useState({
    edad: '', tipo_empleo: 'dependiente', antiguedad_laboral_meses: '',
    nivel_educativo: 'universitario', estado_civil: 'soltero',
    tipo_vivienda: 'propia', num_dependientes_hogar: '0',
  });

  const [datos2, setDatos2] = useState({
    ingreso_mensual: '', monto_en_bancos: '', num_cuentas_bancarias: '',
    num_creditos_previos: '0', dias_mora_historico: '0',
    ratio_deuda_ingreso: '0', num_lineas_credito_abiertas: '0',
    num_dependientes_economicos: '0',
  });

  function update1(field: string, value: string) { setDatos1(prev => ({ ...prev, [field]: value })); }
  function update2(field: string, value: string) { setDatos2(prev => ({ ...prev, [field]: value })); }

  function handleSiguiente() {
    const edadNum = Number(datos1.edad);
    if (!datos1.edad || isNaN(edadNum) || edadNum < 18 || edadNum > 100) {
      Alert.alert('Error', 'Ingresa una edad válida (entre 18 y 100 años)'); return;
    }
    if (!datos1.antiguedad_laboral_meses) {
      Alert.alert('Error', 'Ingresa tu antigüedad laboral en meses (puede ser 0)'); return;
    }
    setPaso(2);
  }

  async function handleAnalizar() {
    if (!datos2.ingreso_mensual || !datos2.monto_en_bancos || !datos2.num_cuentas_bancarias) {
      Alert.alert('Error', 'Completa los campos obligatorios'); return;
    }
    setLoading(true);
    try {
      const payload = {
        ...datos1, ...datos2,
        edad: Number(datos1.edad),
        antiguedad_laboral_meses: Number(datos1.antiguedad_laboral_meses),
        num_dependientes_hogar: Number(datos1.num_dependientes_hogar),
        ingreso_mensual: Number(datos2.ingreso_mensual),
        monto_en_bancos: Number(datos2.monto_en_bancos),
        num_cuentas_bancarias: Number(datos2.num_cuentas_bancarias),
        num_creditos_previos: Number(datos2.num_creditos_previos),
        dias_mora_historico: Number(datos2.dias_mora_historico),
        ratio_deuda_ingreso: Number(datos2.ratio_deuda_ingreso),
        num_lineas_credito_abiertas: Number(datos2.num_lineas_credito_abiertas),
        num_dependientes_economicos: Number(datos2.num_dependientes_economicos),
      };
      const res = await apiClient.post('/api/user/evaluar-riesgo', payload);
      router.push({ pathname: '/(user)/resultado', params: { data: JSON.stringify(res.data) } });
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.error || 'No se pudo evaluar');
    } finally {
      setLoading(false);
    }
  }

  function Opcion({ value, selected, onPress, label }: { value: string, selected: boolean, onPress: () => void, label: string }) {
    return (
      <TouchableOpacity
        style={[styles.optionBtn, {
          backgroundColor: selected ? colors.primaryLight : colors.input,
          borderColor: selected ? colors.primary : colors.inputBorder,
        }]}
        onPress={onPress}
      >
        <Text style={[styles.optionText, { color: selected ? colors.primary : colors.textSecondary, fontWeight: selected ? '600' : '400' }]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.background }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, alignItems: 'center', padding: 24 }}>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>

          <Text style={[styles.headerTitle, { color: colors.primary }]}>UNFV — Riesgo Crediticio</Text>

          <View style={styles.stepWrap}>
            <View style={[styles.stepDot, { backgroundColor: paso >= 1 ? colors.primary : colors.primaryLight }]}>
              <Text style={[styles.stepNum, { color: paso >= 1 ? '#fff' : colors.primary }]}>{paso > 1 ? '✓' : '1'}</Text>
            </View>
            <View style={[styles.stepLine, { backgroundColor: paso > 1 ? colors.primary : colors.primaryLight }]} />
            <View style={[styles.stepDot, { backgroundColor: paso === 2 ? colors.primary : colors.primaryLight }]}>
              <Text style={[styles.stepNum, { color: paso === 2 ? '#fff' : colors.primary }]}>2</Text>
            </View>
          </View>

          {paso === 1 && (
            <View>
              <Text style={[styles.title, { color: colors.textPrimary }]}>Datos demográficos</Text>
              <Text style={[styles.sub, { color: colors.textSecondary }]}>Información personal para el análisis</Text>

              <Text style={[styles.label, { color: colors.textLabel }]}>Edad *</Text>
              <TextInput style={[styles.input, { backgroundColor: colors.input, borderColor: colors.inputBorder, color: colors.textPrimary }]} placeholder="Ej: 32" placeholderTextColor={colors.textMuted} keyboardType="numeric" value={datos1.edad} onChangeText={v => update1('edad', v)} />

              <Text style={[styles.label, { color: colors.textLabel }]}>Antigüedad laboral (meses) *</Text>
              <TextInput style={[styles.input, { backgroundColor: colors.input, borderColor: colors.inputBorder, color: colors.textPrimary }]} placeholder="Ej: 36" placeholderTextColor={colors.textMuted} keyboardType="numeric" value={datos1.antiguedad_laboral_meses} onChangeText={v => update1('antiguedad_laboral_meses', v)} />

              <Text style={[styles.label, { color: colors.textLabel }]}>Número de dependientes en el hogar</Text>
              <TextInput style={[styles.input, { backgroundColor: colors.input, borderColor: colors.inputBorder, color: colors.textPrimary }]} placeholder="0" placeholderTextColor={colors.textMuted} keyboardType="numeric" value={datos1.num_dependientes_hogar} onChangeText={v => update1('num_dependientes_hogar', v)} />

              <Text style={[styles.label, { color: colors.textLabel }]}>Tipo de empleo</Text>
              <View style={styles.optionGroup}>
                {['dependiente', 'independiente', 'desempleado'].map(op => (
                  <Opcion key={op} value={op} selected={datos1.tipo_empleo === op} onPress={() => update1('tipo_empleo', op)} label={op.charAt(0).toUpperCase() + op.slice(1)} />
                ))}
              </View>

              <Text style={[styles.label, { color: colors.textLabel }]}>Nivel educativo</Text>
              <View style={styles.optionGroup}>
                {['secundaria', 'tecnico', 'universitario', 'posgrado'].map(op => (
                  <Opcion key={op} value={op} selected={datos1.nivel_educativo === op} onPress={() => update1('nivel_educativo', op)} label={op.charAt(0).toUpperCase() + op.slice(1)} />
                ))}
              </View>

              <Text style={[styles.label, { color: colors.textLabel }]}>Estado civil</Text>
              <View style={styles.optionGroup}>
                {['soltero', 'casado', 'conviviente', 'otro'].map(op => (
                  <Opcion key={op} value={op} selected={datos1.estado_civil === op} onPress={() => update1('estado_civil', op)} label={op.charAt(0).toUpperCase() + op.slice(1)} />
                ))}
              </View>

              <Text style={[styles.label, { color: colors.textLabel }]}>Tipo de vivienda</Text>
              <View style={styles.optionGroup}>
                {['propia', 'alquilada', 'familiar'].map(op => (
                  <Opcion key={op} value={op} selected={datos1.tipo_vivienda === op} onPress={() => update1('tipo_vivienda', op)} label={op.charAt(0).toUpperCase() + op.slice(1)} />
                ))}
              </View>

              <TouchableOpacity style={[styles.btnPrimary, { backgroundColor: colors.primary }]} onPress={handleSiguiente}>
                <Text style={styles.btnPrimaryText}>Siguiente →</Text>
              </TouchableOpacity>
            </View>
          )}

          {paso === 2 && (
            <View>
              <Text style={[styles.title, { color: colors.textPrimary }]}>Datos financieros</Text>
              <Text style={[styles.sub, { color: colors.textSecondary }]}>Información bancaria y crediticia</Text>

              {[
                { label: 'Ingresos mensuales (S/.) *', field: 'ingreso_mensual', ph: 'Ej: 3500' },
                { label: 'Monto total en cuentas bancarias (S/.) *', field: 'monto_en_bancos', ph: 'Ej: 8000' },
                { label: 'Número de cuentas bancarias *', field: 'num_cuentas_bancarias', ph: 'Ej: 2' },
                { label: 'Créditos previos', field: 'num_creditos_previos', ph: '0' },
                { label: 'Días de mora histórico', field: 'dias_mora_historico', ph: '0' },
              ].map(({ label, field, ph }) => (
                <View key={field}>
                  <Text style={[styles.label, { color: colors.textLabel }]}>{label}</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.input, borderColor: colors.inputBorder, color: colors.textPrimary }]}
                    placeholder={ph} placeholderTextColor={colors.textMuted}
                    keyboardType="numeric"
                    value={(datos2 as any)[field]}
                    onChangeText={v => update2(field, v)}
                  />
                </View>
              ))}

              <View style={styles.rowBtns}>
                <TouchableOpacity style={[styles.btnSecondary, { borderColor: colors.primary }]} onPress={() => setPaso(1)}>
                  <Text style={[styles.btnSecondaryText, { color: colors.primary }]}>← Atrás</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.btnPrimary, { flex: 1, backgroundColor: colors.primary }]} onPress={handleAnalizar} disabled={loading}>
                  {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnPrimaryText}>Analizar mi perfil</Text>}
                </TouchableOpacity>
              </View>
            </View>
          )}

          <View style={{ height: 16 }} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  card: { width: '100%', maxWidth: 480, borderRadius: 24, padding: 28, borderWidth: 1, shadowColor: '#6B4EFF', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.1, shadowRadius: 24, elevation: 8, marginVertical: 24 },
  headerTitle: { fontSize: 15, fontWeight: '700', marginBottom: 20 },
  stepWrap: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  stepDot: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  stepNum: { fontSize: 13, fontWeight: '700' },
  stepLine: { flex: 1, height: 2 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 4 },
  sub: { fontSize: 13, marginBottom: 24 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 6 },
  input: { borderWidth: 1.5, borderRadius: 12, padding: 13, fontSize: 14, marginBottom: 16 },
  optionGroup: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  optionBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, borderWidth: 1.5 },
  optionText: { fontSize: 13 },
  rowBtns: { flexDirection: 'row', gap: 10, marginTop: 4 },
  btnPrimary: { borderRadius: 12, padding: 14, alignItems: 'center' },
  btnPrimaryText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  btnSecondary: { borderWidth: 1.5, borderRadius: 12, padding: 14, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  btnSecondaryText: { fontSize: 14, fontWeight: '600' },
});