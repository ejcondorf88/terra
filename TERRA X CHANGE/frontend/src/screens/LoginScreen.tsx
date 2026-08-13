import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, TouchableOpacity, Platform } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE = 'http://localhost:3000/api/auth'; // Cambiar a tu backend URL

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mfaToken, setMfaToken] = useState('');
  const [userId, setUserId] = useState('');
  const [requiresMFA, setRequiresMFA] = useState(false);

  const handleBiometricAuth = async () => {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();

    if (!hasHardware || !isEnrolled) {
      Alert.alert('Error', 'Biométricos no disponibles');
      return;
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Autenticación Biométrica',
      fallbackLabel: 'Usar PIN',
    });

    if (result.success) {
      // Aquí podrías cargar credenciales guardadas o proceder con login simplificado
      Alert.alert('Éxito', 'Autenticación biométrica exitosa');
      // Navegar a Home o Wallet
      navigation.navigate('Home');
    } else {
      Alert.alert('Error', 'Autenticación fallida');
    }
  };

  const handleLogin = async () => {
    try {
      const response = await axios.post(`${API_BASE}/login`, { email, password });
      if (response.data.requiresMFA) {
        setRequiresMFA(true);
        setUserId(response.data.userId || '');
        Alert.alert('MFA requerido', 'Ingresa tu código de autenticación');
        return;
      }

      const { token } = response.data;
      await AsyncStorage.setItem('terra_xchange_token', token);
      Alert.alert('Éxito', 'Login exitoso');
      navigation.navigate('Home');
    } catch (error) {
      if (error.response?.status === 401) {
        Alert.alert('Error', error.response?.data?.message || 'Credenciales inválidas');
      } else {
        Alert.alert('Error', error.response?.data?.message || 'Login fallido');
      }
    }
  };

  const handleMFAVerify = async () => {
    try {
      const response = await axios.post(`${API_BASE}/${userId}/mfa/verify`, { token: mfaToken });
      if (response.data.verified) {
        await AsyncStorage.setItem('terra_xchange_token', response.data.token || '');
        Alert.alert('Éxito', 'MFA verificado');
        navigation.navigate('Home');
      } else {
        Alert.alert('Error', 'Token MFA inválido');
      }
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Verificación MFA fallida');
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Login - TERRA X CHANGE</Text>

      {!requiresMFA ? (
        <>
          <TextInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
          />
          <TextInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
          />
          <Button title="Login" onPress={handleLogin} />
          {Platform.OS !== 'web' && (
            <TouchableOpacity onPress={handleBiometricAuth} style={{ marginTop: 20 }}>
              <Text style={{ color: 'blue', textAlign: 'center' }}>Usar Biométricos</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={() => navigation.navigate('Register')} style={{ marginTop: 10 }}>
            <Text style={{ color: 'green', textAlign: 'center' }}>Registrarse</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text>Ingresa tu código MFA:</Text>
          <TextInput
            placeholder="Código TOTP"
            value={mfaToken}
            onChangeText={setMfaToken}
            style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
          />
          <Button title="Verificar MFA" onPress={handleMFAVerify} />
        </>
      )}
    </View>
  );
}