import { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Image,
  StyleSheet, ActivityIndicator, ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import apiClient from '../../data/api/client';
import { useTheme } from '../../context/ThemeContext';
import GraficoEvolucion from '../../components/GraficoEvolucion';

export default function PerfilScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [perfil, setPerfil] = useState<any>(null);
  const [historial, setHistorial] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [seccion, setSeccion] = useState<'inicio' | 'nombre' | 'username'>('inicio');

  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevoUsername, setNuevoUsername] = useState('');
  const [subiendoFoto, setSubiendoFoto] = useState(false);

  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');

  useEffect(() => { cargarPerfil(); }, []);

  async function cargarPerfil() {
    try {
      const [perfilRes, historialRes] = await Promise.all([
        apiClient.get('/api/user/mi-perfil'),
        apiClient.get('/api/user/mi-historial'),
      ]);
      setPerfil(perfilRes.data);
      setNuevoNombre(perfilRes.data.nombre);
      setNuevoUsername(perfilRes.data.username || '');
      setHistorial(historialRes.data);
    } catch { }
    finally { setLoading(false); }
  }

  function resetMensajes() { setError(''); setExito(''); }

  async function handleGuardarNombre() {
    resetMensajes();
    if (!nuevoNombre.trim()) { setError('El nombre no puede estar vacío'); return; }
    setGuardando(true);
    try {
      await apiClient.post('/api/user/actualizar-nombre', { nombre: nuevoNombre });
      setExito('Nombre actualizado correctamente');
      setPerfil((p: any) => ({ ...p, nombre: nuevoNombre }));
      setTimeout(() => setSeccion('inicio'), 1500);
    } catch (err: any) {
      console.log('ERROR FOTO:', err.message, err.response?.status, err.response?.data);
      setError(err.response?.data?.error || 'Error al subir la foto');
    } finally { setSubiendoFoto(false); }
  }

  async function handleGuardarUsername() {
    resetMensajes();
    if (!nuevoUsername.trim()) { setError('El username no puede estar vacío'); return; }
    setGuardando(true);
    try {
      const res = await apiClient.post('/api/user/actualizar-username', { username: nuevoUsername });
      setExito('Username actualizado correctamente');
      setPerfil((p: any) => ({ ...p, username: res.data.username }));
      setTimeout(() => setSeccion('inicio'), 1500);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al actualizar username');
    } finally { setGuardando(false); }
  }

  async function handleElegirFoto() {
    const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permiso.granted) {
      setError('Necesitas dar permiso para acceder a tus fotos');
      return;
    }

    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });

    if (resultado.canceled || !resultado.assets?.[0]?.base64) return;

    const mime = resultado.assets[0].mimeType || 'image/jpeg';
    const dataUri = `data:${mime};base64,${resultado.assets[0].base64}`;

    setSubiendoFoto(true);
    resetMensajes();
    try {
      await apiClient.post('/api/user/actualizar-foto', { foto_base64: dataUri });
      setPerfil((p: any) => ({ ...p, foto_base64: dataUri }));
      setExito('Foto de perfil actualizada');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al subir la foto');
    } finally { setSubiendoFoto(false); }
  }

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={styles.scroll}>

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[styles.backText, { color: colors.primary }]}>← Volver</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Mi perfil</Text>
      </View>

      {error ? <View style={[styles.errorBox, { backgroundColor: colors.dangerBg, borderColor: colors.dangerBorder }]}><Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text></View> : null}
      {exito ? <View style={[styles.exitoBox, { backgroundColor: colors.successBg, borderColor: colors.successBorder }]}><Text style={[styles.exitoText, { color: colors.success }]}>{exito}</Text></View> : null}

      {seccion === 'inicio' && (
        <>
          <TouchableOpacity style={styles.avatarWrap} onPress={handleElegirFoto} disabled={subiendoFoto}>
            {perfil?.foto_base64 ? (
              <Image source={{ uri: perfil.foto_base64 }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatarPlaceholder, { backgroundColor: colors.primaryLight, borderColor: colors.primaryBorder }]}>
                <Text style={{ fontSize: 32 }}>👤</Text>
              </View>
            )}
            <View style={[styles.avatarEditBadge, { backgroundColor: colors.primary }]}>
              {subiendoFoto ? <ActivityIndicator color="#fff" size="small" /> : <Text style={{ fontSize: 12 }}>✏️</Text>}
            </View>
          </TouchableOpacity>
          {perfil?.username && (
            <Text style={[styles.usernameText, { color: colors.textSecondary }]}>@{perfil.username}</Text>
          )}

          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Información personal</Text>
            {[
              { label: 'Nombre', value: perfil?.nombre },
              { label: 'Username', value: perfil?.username ? `@${perfil.username}` : 'No configurado' },
              { label: 'Correo', value: perfil?.email },
              { label: 'DNI', value: perfil?.dni },
              { label: 'Teléfono', value: perfil?.telefono },
            ].map(({ label, value }) => (
              <View key={label} style={[styles.infoRow, { borderBottomColor: colors.divider }]}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>{label}</Text>
                <Text style={[styles.infoValue, { color: colors.textPrimary }]}>{value}</Text>
              </View>
            ))}
          </View>

          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Tu evolución</Text>
            <GraficoEvolucion historial={historial} />
          </View>

          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Editar información</Text>
            <TouchableOpacity
              style={[styles.opcionBtn, { borderBottomColor: colors.divider, borderBottomWidth: 1 }]}
              onPress={() => { resetMensajes(); setSeccion('nombre'); }}
            >
              <Text style={[styles.opcionText, { color: colors.textPrimary }]}>Cambiar nombre</Text>
              <Text style={[styles.opcionArrow, { color: colors.primary }]}>→</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.opcionBtn, { borderBottomWidth: 0 }]}
              onPress={() => { resetMensajes(); setSeccion('username'); }}
            >
              <Text style={[styles.opcionText, { color: colors.textPrimary }]}>Cambiar username</Text>
              <Text style={[styles.opcionArrow, { color: colors.primary }]}>→</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.card, styles.configCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
            onPress={() => router.push('/(user)/configuracion')}
          >
            <Text style={[styles.cardTitle, { color: colors.textPrimary, marginBottom: 0 }]}>⚙️ Configuración y seguridad</Text>
            <Text style={[styles.opcionArrow, { color: colors.primary }]}>→</Text>
          </TouchableOpacity>
        </>
      )}

      {seccion === 'nombre' && (
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <TouchableOpacity onPress={() => setSeccion('inicio')} style={styles.backBtn}>
            <Text style={[styles.backText, { color: colors.primary }]}>← Volver</Text>
          </TouchableOpacity>
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Cambiar nombre</Text>
          <Text style={[styles.label, { color: colors.textLabel }]}>Nuevo nombre completo</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.input, borderColor: colors.inputBorder, color: colors.textPrimary }]}
            value={nuevoNombre} onChangeText={setNuevoNombre}
            placeholder="Tu nombre completo" placeholderTextColor={colors.textMuted}
          />
          <TouchableOpacity style={[styles.btnPrimary, { backgroundColor: colors.primary }]} onPress={handleGuardarNombre} disabled={guardando}>
            {guardando ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnPrimaryText}>Guardar nombre</Text>}
          </TouchableOpacity>
        </View>
      )}

      {seccion === 'username' && (
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <TouchableOpacity onPress={() => setSeccion('inicio')} style={styles.backBtn}>
            <Text style={[styles.backText, { color: colors.primary }]}>← Volver</Text>
          </TouchableOpacity>
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Cambiar username</Text>
          <Text style={[styles.label, { color: colors.textLabel }]}>Nuevo username</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.input, borderColor: colors.inputBorder, color: colors.textPrimary }]}
            value={nuevoUsername}
            onChangeText={(t) => setNuevoUsername(t.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
            placeholder="tu_username" placeholderTextColor={colors.textMuted}
            autoCapitalize="none"
          />
          <TouchableOpacity style={[styles.btnPrimary, { backgroundColor: colors.primary }]} onPress={handleGuardarUsername} disabled={guardando}>
            {guardando ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnPrimaryText}>Guardar username</Text>}
          </TouchableOpacity>
        </View>
      )}

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 20 },
  header: { marginBottom: 20 },
  backBtn: { marginBottom: 12 },
  backText: { fontSize: 14, fontWeight: '500' },
  title: { fontSize: 24, fontWeight: '700' },
  errorBox: { borderWidth: 1, borderRadius: 10, padding: 12, marginBottom: 14 },
  errorText: { fontSize: 13, textAlign: 'center' },
  exitoBox: { borderWidth: 1, borderRadius: 10, padding: 12, marginBottom: 14 },
  exitoText: { fontSize: 13, textAlign: 'center' },
  card: { borderRadius: 16, padding: 18, borderWidth: 1.5, marginBottom: 14, shadowColor: '#6B4EFF', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 3 },
  configCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: 15, fontWeight: '700', marginBottom: 14 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1 },
  infoLabel: { fontSize: 13, fontWeight: '500' },
  infoValue: { fontSize: 13, fontWeight: '600' },
  opcionBtn: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14 },
  opcionText: { fontSize: 14, fontWeight: '500' },
  opcionArrow: { fontSize: 16 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 6 },
  input: { borderWidth: 1.5, borderRadius: 12, padding: 13, fontSize: 14, marginBottom: 16 },
  btnPrimary: { borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 4 },
  btnPrimaryText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  avatarWrap: { alignSelf: 'center', marginBottom: 6 },
  avatar: { width: 90, height: 90, borderRadius: 45 },
  avatarPlaceholder: { width: 90, height: 90, borderRadius: 45, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  avatarEditBadge: { position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' },
  usernameText: { textAlign: 'center', fontSize: 13, fontWeight: '600', marginBottom: 16 },
});