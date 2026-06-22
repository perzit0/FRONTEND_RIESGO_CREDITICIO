import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert,
  KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';
import apiClient from '../../data/api/client';
import { useTheme } from '../../context/ThemeContext';

export default function RegistroScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [form, setForm] = useState({ nombre: '', dni: '', email: '', telefono: '', password: '', confirmar: '' });
  const [verPassword, setVerPassword] = useState(false);
  const [verConfirmar, setVerConfirmar] = useState(false);
  const [loading, setLoading] = useState(false);

  function update(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function handleRegistro() {
    if (!form.nombre || !form.dni || !form.email || !form.telefono || !form.password) {
      Alert.alert('Error', 'Completa todos los campos'); return;
    }
    if (form.dni.length !== 8 || !/^\d+$/.test(form.dni)) {
      Alert.alert('Error', 'El DNI debe tener exactamente 8 dígitos numéricos'); return;
    }
    if (form.password !== form.confirmar) {
      Alert.alert('Error', 'Las contraseñas no coinciden'); return;
    }
    if (form.password.length < 8) {
      Alert.alert('Error', 'La contraseña debe tener al menos 8 caracteres'); return;
    }
    setLoading(true);
    try {
      const res = await apiClient.post('/api/auth/registro', {
        nombre: form.nombre, dni: form.dni, email: form.email,
        telefono: `+51${form.telefono}`, password: form.password,
      });
      router.push({ pathname: '/(auth)/verificar-correo', params: { usuario_id: res.data.usuario_id, email: form.email } });
    } catch (err: any) {
      const mensaje = err.response?.data?.error || '';
      if (mensaje.toLowerCase().includes('email') || mensaje.toLowerCase().includes('correo')) {
        Alert.alert('Correo ya registrado', 'Este correo ya tiene una cuenta.');
      } else if (mensaje.toLowerCase().includes('dni')) {
        Alert.alert('DNI ya registrado', 'Este DNI ya está asociado a una cuenta.');
      } else {
        Alert.alert('Error', mensaje || 'No se pudo registrar');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.background }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={[styles.backText, { color: colors.primary }]}>← Volver</Text>
          </TouchableOpacity>

          <Text style={[styles.title, { color: colors.textPrimary }]}>Crear cuenta</Text>
          <Text style={[styles.sub, { color: colors.textSecondary }]}>Completa tus datos para registrarte</Text>

          {[
            { label: 'Nombre completo', field: 'nombre', placeholder: 'Ej: Juan Pérez García', keyboard: 'default' },
            { label: 'DNI', field: 'dni', placeholder: '12345678', keyboard: 'numeric', maxLength: 8 },
            { label: 'Correo electrónico', field: 'email', placeholder: 'tucorreo@email.com', keyboard: 'email-address' },
          ].map(({ label, field, placeholder, keyboard, maxLength }) => (
            <View key={field}>
              <Text style={[styles.label, { color: colors.textLabel }]}>{label}</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.input, borderColor: colors.inputBorder, color: colors.textPrimary }]}
                placeholder={placeholder}
                placeholderTextColor={colors.textMuted}
                keyboardType={keyboard as any}
                autoCapitalize="none"
                maxLength={maxLength}
                value={(form as any)[field]}
                onChangeText={v => update(field, v)}
              />
            </View>
          ))}

          <Text style={[styles.label, { color: colors.textLabel }]}>Teléfono</Text>
          <View style={[styles.phoneWrap, { backgroundColor: colors.input, borderColor: colors.inputBorder }]}>
            <View style={[styles.phonePrefix, { backgroundColor: colors.primaryLight, borderRightColor: colors.inputBorder }]}>
              <Text style={[styles.phonePrefixText, { color: colors.primary }]}>+51</Text>
            </View>
            <TextInput
              style={[styles.phoneInput, { color: colors.textPrimary }]}
              placeholder="999 999 999"
              placeholderTextColor={colors.textMuted}
              keyboardType="phone-pad"
              maxLength={9}
              value={form.telefono}
              onChangeText={v => update('telefono', v)}
            />
          </View>

          {[
            { label: 'Contraseña', field: 'password', ver: verPassword, setVer: setVerPassword, placeholder: 'Mínimo 8 caracteres' },
            { label: 'Confirmar contraseña', field: 'confirmar', ver: verConfirmar, setVer: setVerConfirmar, placeholder: 'Repite tu contraseña' },
          ].map(({ label, field, ver, setVer, placeholder }) => (
            <View key={field}>
              <Text style={[styles.label, { color: colors.textLabel }]}>{label}</Text>
              <View style={[styles.passwordWrap, { backgroundColor: colors.input, borderColor: colors.inputBorder }]}>
                <TextInput
                  style={[styles.passwordInput, { color: colors.textPrimary }]}
                  placeholder={placeholder}
                  placeholderTextColor={colors.textMuted}
                  secureTextEntry={!ver}
                  value={(form as any)[field]}
                  onChangeText={v => update(field, v)}
                />
                <TouchableOpacity onPress={() => setVer(!ver)} style={styles.eyeBtn}>
                  <Text style={[styles.eyeText, { color: colors.primary }]}>{ver ? 'Ocultar' : 'Ver'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}

          <TouchableOpacity style={[styles.btnPrimary, { backgroundColor: colors.primary }]} onPress={handleRegistro} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnPrimaryText}>Crear cuenta</Text>}
          </TouchableOpacity>
          <View style={{ height: 16 }} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  card: { width: '100%', maxWidth: 400, borderRadius: 24, padding: 28, borderWidth: 1, shadowColor: '#6B4EFF', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.1, shadowRadius: 24, elevation: 8 },
  backBtn: { marginBottom: 16 },
  backText: { fontSize: 14, fontWeight: '500' },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 4 },
  sub: { fontSize: 13, marginBottom: 24 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 6 },
  input: { borderWidth: 1.5, borderRadius: 12, padding: 13, fontSize: 14, marginBottom: 16 },
  phoneWrap: { flexDirection: 'row', marginBottom: 16, borderWidth: 1.5, borderRadius: 12, overflow: 'hidden' },
  phonePrefix: { paddingHorizontal: 14, paddingVertical: 13, borderRightWidth: 1.5, justifyContent: 'center' },
  phonePrefixText: { fontSize: 14, fontWeight: '700' },
  phoneInput: { flex: 1, padding: 13, fontSize: 14 },
  passwordWrap: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderRadius: 12, marginBottom: 16 },
  passwordInput: { flex: 1, padding: 13, fontSize: 14 },
  eyeBtn: { paddingHorizontal: 14, paddingVertical: 13 },
  eyeText: { fontSize: 12, fontWeight: '600' },
  btnPrimary: { borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 4 },
  btnPrimaryText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});