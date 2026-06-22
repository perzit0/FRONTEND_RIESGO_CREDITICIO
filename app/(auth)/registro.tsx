import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert,
  KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';
import apiClient from '../../data/api/client';

export default function RegistroScreen() {
  const router = useRouter();
  const [form, setForm] = useState({
    nombre: '', dni: '', email: '',
    telefono: '', password: '', confirmar: '',
  });
  const [verPassword, setVerPassword] = useState(false);
  const [verConfirmar, setVerConfirmar] = useState(false);
  const [loading, setLoading] = useState(false);

  function update(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function handleRegistro() {
    if (!form.nombre || !form.dni || !form.email || !form.telefono || !form.password) {
      Alert.alert('Error', 'Completa todos los campos');
      return;
    }
    if (form.password !== form.confirmar) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }
    setLoading(true);
    try {
  const res = await apiClient.post('/api/auth/registro', {
    nombre: form.nombre,
    dni: form.dni,
    email: form.email,
    telefono: `+51${form.telefono}`,
    password: form.password,
  });
  const { usuario_id } = res.data;
  console.log('Registro exitoso, usuario_id:', usuario_id);
  router.push({
    pathname: '/(auth)/verificar-correo',
    params: { usuario_id, email: form.email },
  });
} catch (err: any) {
  console.log('Error registro:', err.response?.data);
  const mensaje = err.response?.data?.error || '';
  if (mensaje.toLowerCase().includes('email') || mensaje.toLowerCase().includes('correo')) {
    Alert.alert('Correo ya registrado', 'Este correo ya tiene una cuenta. Intenta iniciar sesión.');
  } else if (mensaje.toLowerCase().includes('dni')) {
    Alert.alert('DNI ya registrado', 'Este DNI ya está asociado a una cuenta.');
  } else {
    Alert.alert('Error', mensaje || 'No se pudo registrar');
  }
}
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.card}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>← Volver</Text>
          </TouchableOpacity>

          <Text style={styles.title}>Crear cuenta</Text>
          <Text style={styles.sub}>Completa tus datos para registrarte</Text>

          <Text style={styles.label}>Nombre completo</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: Juan Pérez García"
            placeholderTextColor="#A0AEC0"
            value={form.nombre}
            onChangeText={v => update('nombre', v)}
          />

          <Text style={styles.label}>DNI</Text>
          <TextInput
            style={styles.input}
            placeholder="12345678"
            placeholderTextColor="#A0AEC0"
            keyboardType="numeric"
            maxLength={8}
            value={form.dni}
            onChangeText={v => update('dni', v)}
          />

          <Text style={styles.label}>Correo electrónico</Text>
          <TextInput
            style={styles.input}
            placeholder="tucorreo@email.com"
            placeholderTextColor="#A0AEC0"
            keyboardType="email-address"
            autoCapitalize="none"
            value={form.email}
            onChangeText={v => update('email', v)}
          />

          <Text style={styles.label}>Teléfono</Text>
          <View style={styles.phoneWrap}>
            <View style={styles.phonePrefix}>
              <Text style={styles.phonePrefixText}>+51</Text>
            </View>
            <TextInput
              style={styles.phoneInput}
              placeholder="999 999 999"
              placeholderTextColor="#A0AEC0"
              keyboardType="phone-pad"
              maxLength={9}
              value={form.telefono}
              onChangeText={v => update('telefono', v)}
            />
          </View>

          <Text style={styles.label}>Contraseña</Text>
          <View style={styles.passwordWrap}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Mínimo 8 caracteres"
              placeholderTextColor="#A0AEC0"
              secureTextEntry={!verPassword}
              value={form.password}
              onChangeText={v => update('password', v)}
            />
            <TouchableOpacity
              onPress={() => setVerPassword(!verPassword)}
              style={styles.eyeBtn}
            >
              <Text style={styles.eyeText}>{verPassword ? '🙈' : '👁'}</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Confirmar contraseña</Text>
          <View style={styles.passwordWrap}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Repite tu contraseña"
              placeholderTextColor="#A0AEC0"
              secureTextEntry={!verConfirmar}
              value={form.confirmar}
              onChangeText={v => update('confirmar', v)}
            />
            <TouchableOpacity
              onPress={() => setVerConfirmar(!verConfirmar)}
              style={styles.eyeBtn}
            >
              <Text style={styles.eyeText}>{verConfirmar ? '🙈' : '👁'}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.btnPrimary}
            onPress={handleRegistro}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.btnPrimaryText}>Crear cuenta</Text>
            }
          </TouchableOpacity>

          <View style={{ height: 16 }} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0EFFF' },
  scroll: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  card: {
    width: '100%', maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 24, padding: 28,
    shadowColor: '#6B4EFF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1, shadowRadius: 24, elevation: 8,
  },
  backBtn: { marginBottom: 16 },
  backText: { color: '#6B4EFF', fontSize: 14, fontWeight: '500' },
  title: { fontSize: 22, fontWeight: '700', color: '#1A1A2E', marginBottom: 4 },
  sub: { fontSize: 13, color: '#8892B0', marginBottom: 24 },
  label: { fontSize: 13, fontWeight: '600', color: '#2D3748', marginBottom: 6 },
  input: {
    backgroundColor: '#F7F8FC',
    borderWidth: 1.5, borderColor: '#E2E8F0',
    borderRadius: 12, padding: 13,
    fontSize: 14, color: '#1A1A2E', marginBottom: 16,
  },
  phoneWrap: {
    flexDirection: 'row',
    marginBottom: 16,
    borderWidth: 1.5, borderColor: '#E2E8F0',
    borderRadius: 12, overflow: 'hidden',
    backgroundColor: '#F7F8FC',
  },
  phonePrefix: {
    paddingHorizontal: 14, paddingVertical: 13,
    backgroundColor: '#EDE9FF',
    borderRightWidth: 1.5, borderRightColor: '#E2E8F0',
    justifyContent: 'center',
  },
  phonePrefixText: { fontSize: 14, fontWeight: '700', color: '#6B4EFF' },
  phoneInput: {
    flex: 1, padding: 13,
    fontSize: 14, color: '#1A1A2E',
  },
  passwordWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F7F8FC',
    borderWidth: 1.5, borderColor: '#E2E8F0',
    borderRadius: 12, marginBottom: 16,
  },
  passwordInput: { flex: 1, padding: 13, fontSize: 14, color: '#1A1A2E' },
  eyeBtn: { paddingHorizontal: 14, paddingVertical: 13 },
  eyeText: { fontSize: 16 },
  btnPrimary: {
    backgroundColor: '#6B4EFF',
    borderRadius: 12, padding: 14,
    alignItems: 'center', marginTop: 4,
  },
  btnPrimaryText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});