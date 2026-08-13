import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, TouchableOpacity } from 'react-native';
import axios from 'axios';

const API_BASE = 'http://localhost:3000/api/auth'; // Cambiar a tu backend URL

export default function RegisterScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userId, setUserId] = useState('');
  const [mfaSecret, setMfaSecret] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [showMFA, setShowMFA] = useState(false);

  const handleRegister = async () => {
    try {
      const response = await axios.post(`${API_BASE}/register`, { email, password });
      const { user, token } = response.data;
      setUserId(user.id);
      Alert.alert('Éxito', 'Usuario registrado. Configura MFA.');
      // Setup MFA automáticamente
      await setupMFA(user.id);
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Registro fallido');
    }
  };

  const setupMFA = async (id: string) => {
    try {
      const response = await axios.post(`${API_BASE}/${id}/mfa/setup`);
      const { secret, qrCode: qr } = response.data;
      setMfaSecret(secret);
      setQrCode(qr);
      setShowMFA(true);
    } catch (error) {
      Alert.alert('Error', 'Error configurando MFA');
    }
  };

  const handleComplete = () => {
    Alert.alert('Éxito', 'Registro completo con MFA');
    navigation.navigate('Login');
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Registro - TERRA X CHANGE</Text>

      {!showMFA ? (
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
          <Button title="Registrar" onPress={handleRegister} />
          <TouchableOpacity onPress={() => navigation.navigate('Login')} style={{ marginTop: 10 }}>
            <Text style={{ color: 'blue', textAlign: 'center' }}>Ya tengo cuenta</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text>Escanea este QR en tu app de autenticación:</Text>
          <Text style={{ marginVertical: 10 }}>{qrCode}</Text>
          <Text>Secret: {mfaSecret}</Text>
          <Button title="Completar Registro" onPress={handleComplete} />
        </>
      )}
    </View>
  );
}