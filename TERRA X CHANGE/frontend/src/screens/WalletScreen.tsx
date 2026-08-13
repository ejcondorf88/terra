import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, TextInput, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_BASE = 'http://localhost:3000/api/wallet';

export default function WalletScreen() {
  const [balance, setBalance] = useState('0 X Coin');
  const [userId, setUserId] = useState('');

  const createWallet = async () => {
    try {
      const token = await AsyncStorage.getItem('terra_xchange_token');
      const response = await axios.post(
        `${API_BASE}/create`,
        { userId },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setBalance(`${response.data.blockchainAddress || 'wallet created'}`);
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'No se pudo crear la wallet');
    }
  };

  return (
    <View style={styles.container}>
      <Text>Wallet Balance: {balance}</Text>
      <TextInput
        placeholder="User ID"
        value={userId}
        onChangeText={setUserId}
        style={styles.input}
      />
      <Button title="Create Wallet" onPress={createWallet} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    width: '100%',
  },
});