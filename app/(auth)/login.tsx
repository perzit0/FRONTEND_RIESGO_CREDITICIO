import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert,
  KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';
import apiClient from '../../data/api/client';
import { guardarToken, guardarRol } from '../../storage/secureStorage';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verPassword, setVerPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin() {
    setError('');
    if (!email || !password) {
      setError('Completa todos los campos');
      return;
    }
    setLoading(true);
    try {
      const res = await apiClient.post('/api/auth/login', { email, password });
      const token = res.data.token;
      const rol = res.data.rol;
      await guardarToken(token);
      await guardarRol(rol);
      if (rol === 'admin') {
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
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          {/* Logo */}
          <View style={styles.logoWrap}>
            <View style={styles.logoIcon}>
              <Text style={styles.logoInitial}>C</Text>
            </View>
            <Text style={styles.logoText}>UNFV — Riesgo Crediticio</Text>
            <Text style={styles.logoSub}>Sistema de Riesgo Crediticio</Text>
          </View>

          {/* Error */}
          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <Text style={styles.label}>Correo electrónico</Text>
          <TextInput
            style={styles.input}
            placeholder="tucorreo@email.com"
            placeholderTextColor="#A0AEC0"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          <Text style={styles.label}>Contraseña</Text>
          <View style={styles.passwordWrap}>
            <TextInput
              style={styles.passwordInput}
              placeholder="••••••••"
              placeholderTextColor="#A0AEC0"
              secureTextEntry={!verPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity
              onPress={() => setVerPassword(!verPassword)}
              style={styles.eyeBtn}
            >
              <Text style={styles.eyeText}>{verPassword ? '🙈' : '👁'}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.forgotWrap}
            onPress={() => router.push('/(auth)/olvide-password')}
          >
            <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.btnPrimary}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.btnPrimaryText}>Ingresar</Text>
            }
          </TouchableOpacity>

          <View style={styles.dividerWrap}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>o</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={styles.btnSecondary}
            onPress={() => router.push('/(auth)/registro')}
          >
            <Text style={styles.btnSecondaryText}>Crear una cuenta nueva</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0EFFF' },
  scroll: {
    flexGrow: 1, justifyContent: 'center',
    alignItems: 'center', padding: 24,
  },
  card: {
    width: '100%', maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 24, padding: 32,
    shadowColor: '#6B4EFF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1, shadowRadius: 24, elevation: 8,
  },
  logoWrap: { alignItems: 'center', marginBottom: 28 },
  logoIcon: {
    width: 56, height: 56,
    backgroundColor: '#6B4EFF',
    borderRadius: 16, alignItems: 'center',
    justifyContent: 'center', marginBottom: 12,
  },
  logoInitial: { fontSize: 26, fontWeight: '700', color: '#FFFFFF' },
  logoText: { fontSize: 17, fontWeight: '700', color: '#1A1A2E' },
  logoSub: { fontSize: 12, color: '#8892B0', marginTop: 2 },
  errorBox: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1, borderColor: '#FECACA',
    borderRadius: 10, padding: 12, marginBottom: 16,
  },
  errorText: { color: '#DC2626', fontSize: 13, textAlign: 'center' },
  label: { fontSize: 13, fontWeight: '600', color: '#2D3748', marginBottom: 6 },
  input: {
    backgroundColor: '#F7F8FC',
    borderWidth: 1.5, borderColor: '#E2E8F0',
    borderRadius: 12, padding: 13,
    fontSize: 14, color: '#1A1A2E', marginBottom: 16,
  },
  passwordWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F7F8FC',
    borderWidth: 1.5, borderColor: '#E2E8F0',
    borderRadius: 12, marginBottom: 8,
  },
  passwordInput: { flex: 1, padding: 13, fontSize: 14, color: '#1A1A2E' },
  eyeBtn: { paddingHorizontal: 14, paddingVertical: 13 },
  eyeText: { fontSize: 16 },
  forgotWrap: { alignItems: 'flex-end', marginBottom: 20, marginTop: 4 },
  forgotText: { fontSize: 12, color: '#6B4EFF', fontWeight: '500' },
  btnPrimary: {
    backgroundColor: '#6B4EFF',
    borderRadius: 12, padding: 14, alignItems: 'center',
  },
  btnPrimaryText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  dividerWrap: {
    flexDirection: 'row', alignItems: 'center',
    marginVertical: 20, gap: 10,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#E2E8F0' },
  dividerText: { fontSize: 12, color: '#A0AEC0' },
  btnSecondary: {
    borderWidth: 1.5, borderColor: '#6B4EFF',
    borderRadius: 12, padding: 13, alignItems: 'center',
  },
  btnSecondaryText: { color: '#6B4EFF', fontSize: 14, fontWeight: '600' },
});