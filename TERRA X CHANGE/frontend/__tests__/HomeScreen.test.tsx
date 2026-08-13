import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import HomeScreen from '../src/screens/HomeScreen';

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
}));

describe('HomeScreen', () => {
  it('renders correctly', () => {
    const { getByText } = render(<HomeScreen />);
    expect(getByText('Welcome to TERRA X CHANGE')).toBeTruthy();
  });

  it('navigates to Wallet on button press', () => {
    const { getByText } = render(<HomeScreen />);
    fireEvent.press(getByText('Go to Wallet'));
    expect(mockNavigate).toHaveBeenCalledWith('Wallet');
  });
});