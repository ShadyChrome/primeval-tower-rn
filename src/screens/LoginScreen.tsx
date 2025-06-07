import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Card, Text, useTheme } from 'react-native-paper';

const LoginScreen = ({ onSignIn }: { onSignIn: () => void }) => {
  const paperTheme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: paperTheme.colors.background }]}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="headlineMedium" style={styles.title}>
            Primeval Tower
          </Text>
          <Text variant="bodyMedium" style={{ marginBottom: 20, textAlign: 'center' }}>
            Welcome, brave adventurer!
          </Text>
          <Button
            icon="account-arrow-right"
            mode="contained"
            onPress={onSignIn}
            style={{ marginTop: 10 }}
          >
            Play as Guest
          </Button>
        </Card.Content>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    width: '90%',
    padding: 10,
  },
  title: {
    textAlign: 'center',
    marginBottom: 10,
  },
});

export default LoginScreen; 