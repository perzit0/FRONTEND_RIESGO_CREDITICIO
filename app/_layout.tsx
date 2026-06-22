import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator } from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import { obtenerToken, obtenerRol } from '../storage/secureStorage';
import { ThemeProvider, useTheme } from '../context/ThemeContext';

function AppNavegador() {
  const router = useRouter();
  const segments = useSegments();
  const [verificando, setVerificando] = useState(true);
  const { isDark, colors } = useTheme();

  useEffect(() => {
    verificarSesion();
  }, []);

  async function verificarSesion() {
    try {
      const token = await obtenerToken();
      const rol = await obtenerRol();
      const enAuth = segments[0] === '(auth)';

      if (!token) {
        if (!enAuth) router.replace('/(auth)/login');
      } else {
        if (enAuth) {
          if (rol === 'admin') {
            router.replace('/(admin)/dashboard');
          } else {
            router.replace('/(user)/home');
          }
        }
      }
    } catch {
      router.replace('/(auth)/login');
    } finally {
      setVerificando(false);
    }
  }

  if (verificando) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)/login" />
        <Stack.Screen name="(auth)/registro" />
        <Stack.Screen name="(auth)/verificar-correo" />
        <Stack.Screen name="(auth)/verificar-sms" />
        <Stack.Screen name="(auth)/olvide-password" />
        <Stack.Screen name="(user)/home" />
        <Stack.Screen name="(user)/formulario" />
        <Stack.Screen name="(user)/resultado" />
        <Stack.Screen name="(user)/perfil" />
        <Stack.Screen name="(user)/comunidad" />
        <Stack.Screen name="(user)/meta" />
        <Stack.Screen name="(admin)/dashboard" />
        <Stack.Screen name="(admin)/casos-fraude" />
        <Stack.Screen name="(admin)/metricas" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AppNavegador />
    </ThemeProvider>
  );
}