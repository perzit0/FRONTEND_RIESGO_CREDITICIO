import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import apiClient from '../../data/api/client';
import { useTheme } from '../../context/ThemeContext';

export default function VerificarCorreoScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { usuario_id, email } = useLocalSearchParams();
  const [codigo, setCodigo] = useState('');
  const [loading, setLoading] = useState(false);
  const [segundos, setSegundos] = useState(30);

  useEffect(() => {
    if (segundos <= 0) return;
    const timer = setTimeout(() => setSegundos(s => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [segundos]);

  async function handleReenviar() {
    if (segundos > 0) return;
    try {
      await apiClient.post('/api/auth/reenviar-codigo-correo', { usuario_id: Number(usuario_id) });
      setSegundos(30);
    } catch { }
  }

  async function handleVerificar() {
    if (codigo.length < 6) return;
    setLoading(true);
    try {
      await apiClient.post('/api/auth/verificar-correo', { usuario_id: Number(usuario_id), codigo });
      // Ya no se requiere verificacion por SMS: el registro queda completo
      // apenas se verifica el correo. Se redirige directo al login.
      router.replace('/(auth)/login');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Código inválido');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <View style={[styles.iconWrap, { backgroundColor: colors.primaryLight }]}>
          <Text style={styles.icon}>✉</Text>
        </View>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Verifica tu correo</Text>
        <Text style={[styles.sub, { color: colors.textSecondary }]}>Enviamos un código de 6 dígitos a</Text>
        <Text style={[styles.emailText, { color: colors.primary }]}>{email}</Text>

        <Text style={[styles.label, { color: colors.textLabel, alignSelf: 'flex-start' }]}>Código de verificación</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.input, borderColor: colors.inputBorder, color: colors.textPrimary }]}
          placeholder="000000"
          placeholderTextColor={colors.textMuted}
          keyboardType="numeric"
          maxLength={6}
          value={codigo}
          onChangeText={setCodigo}
          textAlign="center"
        />

        <TouchableOpacity onPress={handleReenviar} disabled={segundos > 0}>
          <Text style={[styles.reenviarText, { color: segundos > 0 ? colors.textMuted : colors.primary, fontWeight: segundos > 0 ? '400' : '600' }]}>
            {segundos > 0 ? `Reenviar código en ${segundos}s` : '¿No lo recibiste? Reenviar código'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.btnPrimary, { backgroundColor: colors.primary }]} onPress={handleVerificar} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnPrimaryText}>Verificar código</Text>}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  card: { width: '100%', maxWidth: 400, borderRadius: 24, padding: 28, borderWidth: 1, shadowColor: 'transparent', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0, shadowRadius: 24, elevation: 0, alignItems: 'center' },
  iconWrap: { width: 64, height: 64, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  icon: { fontSize: 28 },
  title: { fontSize: 22, fontWeight: '700', textAlign: 'center', marginBottom: 6 },
  sub: { fontSize: 13, textAlign: 'center' },
  emailText: { fontSize: 14, fontWeight: '700', textAlign: 'center', marginBottom: 24, marginTop: 4 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 6 },
  input: { width: '100%', borderWidth: 1.5, borderRadius: 12, padding: 14, fontSize: 28, fontWeight: '700', marginBottom: 20, letterSpacing: 12 },
  reenviarText: { fontSize: 13, textAlign: 'center', marginBottom: 24 },
  btnPrimary: { width: '100%', borderRadius: 12, padding: 14, alignItems: 'center' },
  btnPrimaryText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});