import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, KeyboardAvoidingView,
  Platform, ScrollView, Image
} from 'react-native';
import { useRouter } from 'expo-router';
import apiClient from '../../data/api/client';
import { guardarToken, guardarRol } from '../../storage/secureStorage';
import { useTheme } from '../../context/ThemeContext';

export default function LoginScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verPassword, setVerPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin() {
    setError('');
    if (!email || !password) { setError('Completa todos los campos'); return; }
    setLoading(true);
    try {
      const res = await apiClient.post('/api/auth/login', { email, password });
      await guardarToken(res.data.token);
      await guardarRol(res.data.rol);
      if (res.data.rol === 'admin') {
        router.replace('/(admin)/dashboard');
      } else {
        router.replace('/(user)/home');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'No se pudo iniciar sesión');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>

          <View style={styles.logoWrap}>
            <Image source={require('../../assets/unfv_logo.jpg')} style={styles.logoImg} resizeMode="contain" />
            <Text style={[styles.logoSub, { color: colors.textSecondary }]}>Sistema de Riesgo Crediticio</Text>
          </View>

          {error ? (
            <View style={[styles.errorBox, { backgroundColor: colors.dangerBg, borderColor: colors.dangerBorder }]}>
              <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text>
            </View>
          ) : null}

          <Text style={[styles.label, { color: colors.textLabel }]}>Correo electrónico</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.input, borderColor: colors.inputBorder, color: colors.textPrimary }]}
            placeholder="tucorreo@email.com"
            placeholderTextColor={colors.textMuted}
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          <Text style={[styles.label, { color: colors.textLabel }]}>Contraseña</Text>
          <View style={[styles.passwordWrap, { backgroundColor: colors.input, borderColor: colors.inputBorder }]}>
            <TextInput
              style={[styles.passwordInput, { color: colors.textPrimary }]}
              placeholder="••••••••"
              placeholderTextColor={colors.textMuted}
              secureTextEntry={!verPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setVerPassword(!verPassword)} style={styles.eyeBtn}>
              <Text style={[styles.eyeText, { color: colors.primary }]}>
                {verPassword ? 'Ocultar' : 'Ver'}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.forgotWrap} onPress={() => router.push('/(auth)/olvide-password')}>
            <Text style={[styles.forgotText, { color: colors.primary }]}>¿Olvidaste tu contraseña?</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.btnPrimary, { backgroundColor: colors.primary }]} onPress={handleLogin} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnPrimaryText}>Ingresar</Text>}
          </TouchableOpacity>

          <View style={styles.dividerWrap}>
            <View style={[styles.dividerLine, { backgroundColor: colors.cardBorder }]} />
            <Text style={[styles.dividerText, { color: colors.textMuted }]}>o</Text>
            <View style={[styles.dividerLine, { backgroundColor: colors.cardBorder }]} />
          </View>

          <TouchableOpacity style={[styles.btnSecondary, { borderColor: colors.primary }]} onPress={() => router.push('/(auth)/registro')}>
            <Text style={[styles.btnSecondaryText, { color: colors.primary }]}>Crear una cuenta nueva</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  card: { width: '100%', maxWidth: 400, borderRadius: 24, padding: 32, borderWidth: 1, shadowColor: '#6B4EFF', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.1, shadowRadius: 24, elevation: 8 },
  logoWrap: { alignItems: 'center', marginBottom: 28 },
  logoImg: { width: 220, height: 80 },
  logoSub: { fontSize: 12, marginTop: 8 },
  errorBox: { borderWidth: 1, borderRadius: 10, padding: 12, marginBottom: 16 },
  errorText: { fontSize: 13, textAlign: 'center' },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 6 },
  input: { borderWidth: 1.5, borderRadius: 12, padding: 13, fontSize: 14, marginBottom: 16 },
  passwordWrap: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderRadius: 12, marginBottom: 8 },
  passwordInput: { flex: 1, padding: 13, fontSize: 14 },
  eyeBtn: { paddingHorizontal: 14, paddingVertical: 13 },
  eyeText: { fontSize: 12, fontWeight: '600' },
  forgotWrap: { alignItems: 'flex-end', marginBottom: 20, marginTop: 4 },
  forgotText: { fontSize: 12, fontWeight: '500' },
  btnPrimary: { borderRadius: 12, padding: 14, alignItems: 'center' },
  btnPrimaryText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  dividerWrap: { flexDirection: 'row', alignItems: 'center', marginVertical: 20, gap: 10 },
  dividerLine: { flex: 1, height: 1 },
  dividerText: { fontSize: 12 },
  btnSecondary: { borderWidth: 1.5, borderRadius: 12, padding: 13, alignItems: 'center' },
  btnSecondaryText: { fontSize: 14, fontWeight: '600' },
});