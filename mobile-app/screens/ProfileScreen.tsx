import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { authApi } from '../services/api';
import { useTheme } from '../context/ThemeContext';

type Props = {
  route: { params: { token: string; username: string } };
  navigation: any;
};

type Profile = { username: string; email: string };

const Field = ({
  label, value, onChangeText, secureTextEntry, placeholder, autoCapitalize, colors,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  secureTextEntry?: boolean;
  placeholder?: string;
  autoCapitalize?: 'none' | 'sentences';
  colors: typeof import('../context/ThemeContext').lightColors;
}) => (
  <View style={styles.fieldRow}>
    <Text style={[styles.fieldLabel, { color: colors.muted }]}>{label}</Text>
    <TextInput
      style={[styles.fieldInput, { backgroundColor: colors.input, borderColor: colors.border, color: colors.text }]}
      value={value}
      onChangeText={onChangeText}
      secureTextEntry={secureTextEntry}
      placeholder={placeholder}
      placeholderTextColor={colors.muted}
      autoCapitalize={autoCapitalize ?? 'none'}
      autoCorrect={false}
    />
  </View>
);

const ProfileScreen = ({ route, navigation }: Props) => {
  const { token } = route.params;
  const { isDark, colors, toggleTheme } = useTheme();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingInfo, setSavingInfo] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [infoMsg, setInfoMsg] = useState<{ text: string; error: boolean } | null>(null);
  const [pwMsg, setPwMsg] = useState<{ text: string; error: boolean } | null>(null);

  useEffect(() => {
    authApi(token)
      .get('/users/profile')
      .then((res) => {
        setProfile(res.data);
        setUsername(res.data.username);
        setEmail(res.data.email);
      })
      .catch(() => {})
      .finally(() => setLoadingProfile(false));
  }, [token]);

  const saveInfo = async () => {
    setInfoMsg(null);
    setSavingInfo(true);
    try {
      const res = await authApi(token).patch('/users/profile', { username, email });
      setProfile(res.data);
      setInfoMsg({ text: 'Saved successfully', error: false });
    } catch (err: any) {
      const msg = err.response?.data?.message ?? 'Could not save changes';
      setInfoMsg({ text: Array.isArray(msg) ? msg.join(', ') : msg, error: true });
    } finally {
      setSavingInfo(false);
    }
  };

  const savePassword = async () => {
    setPwMsg(null);
    if (newPassword !== confirmPassword) {
      setPwMsg({ text: 'Passwords do not match', error: true });
      return;
    }
    if (newPassword.length < 6) {
      setPwMsg({ text: 'Password must be at least 6 characters', error: true });
      return;
    }
    setSavingPassword(true);
    try {
      await authApi(token).patch('/users/profile', { currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPwMsg({ text: 'Password changed', error: false });
    } catch (err: any) {
      const msg = err.response?.data?.message ?? 'Could not change password';
      setPwMsg({ text: Array.isArray(msg) ? msg.join(', ') : msg, error: true });
    } finally {
      setSavingPassword(false);
    }
  };

  if (loadingProfile) {
    return (
      <View style={[styles.center, { backgroundColor: colors.bg }]}>
        <ActivityIndicator size="large" color="#1a73e8" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={[styles.scroll, { backgroundColor: colors.bg }]} keyboardShouldPersistTaps="handled">

        <View style={styles.avatar}>
          <Ionicons name="person-circle-outline" size={72} color="#1a73e8" />
          <Text style={[styles.avatarName, { color: colors.text }]}>{profile?.username}</Text>
          <Text style={[styles.avatarEmail, { color: colors.subtext }]}>{profile?.email}</Text>
        </View>

        {/* Dark mode toggle */}
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <View style={styles.toggleRow}>
            <Ionicons name={isDark ? 'moon' : 'sunny-outline'} size={20} color={isDark ? '#a78bfa' : '#f5a623'} style={{ marginRight: 10 }} />
            <Text style={[styles.cardTitle, { color: colors.text, marginBottom: 0, flex: 1 }]}>Dark Mode</Text>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: '#ccc', true: '#22c55e' }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* Account info */}
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Account Info</Text>
          <Field label="Username" value={username} onChangeText={setUsername} autoCapitalize="sentences" colors={colors} />
          <Field label="Email" value={email} onChangeText={setEmail} placeholder="you@example.com" colors={colors} />
          {infoMsg && (
            <Text style={[styles.msg, infoMsg.error ? styles.msgError : styles.msgSuccess]}>
              {infoMsg.text}
            </Text>
          )}
          <TouchableOpacity style={styles.saveBtn} onPress={saveInfo} disabled={savingInfo}>
            {savingInfo
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.saveBtnText}>Save Changes</Text>}
          </TouchableOpacity>
        </View>

        {/* Change password */}
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Change Password</Text>
          <Field label="Current" value={currentPassword} onChangeText={setCurrentPassword} secureTextEntry placeholder="Current password" colors={colors} />
          <Field label="New" value={newPassword} onChangeText={setNewPassword} secureTextEntry placeholder="New password" colors={colors} />
          <Field label="Confirm" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry placeholder="Confirm new password" colors={colors} />
          {pwMsg && (
            <Text style={[styles.msg, pwMsg.error ? styles.msgError : styles.msgSuccess]}>
              {pwMsg.text}
            </Text>
          )}
          <TouchableOpacity style={styles.saveBtn} onPress={savePassword} disabled={savingPassword}>
            {savingPassword
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.saveBtnText}>Change Password</Text>}
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={() => navigation.getParent()?.replace('Auth')}
        >
          <Ionicons name="log-out-outline" size={20} color="#e53935" style={{ marginRight: 8 }} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { padding: 20, paddingBottom: 48 },
  avatar: { alignItems: 'center', marginBottom: 24, marginTop: 8 },
  avatarName: { fontSize: 20, fontWeight: '700', color: '#111', marginTop: 8 },
  avatarEmail: { fontSize: 14, color: '#777', marginTop: 2 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 18,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#111', marginBottom: 14 },
  toggleRow: { flexDirection: 'row', alignItems: 'center' },
  fieldRow: { marginBottom: 12 },
  fieldLabel: { fontSize: 12, fontWeight: '600', color: '#777', marginBottom: 4, textTransform: 'uppercase' },
  fieldInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: '#111',
    backgroundColor: '#fafafa',
  },
  msg: { fontSize: 13, marginBottom: 10, marginTop: -4 },
  msgError: { color: '#c00' },
  msgSuccess: { color: '#1a8a3a' },
  saveBtn: {
    backgroundColor: '#1a73e8',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  saveBtnText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#e53935',
    borderRadius: 10,
    paddingVertical: 14,
    marginTop: 8,
  },
  logoutText: { color: '#e53935', fontWeight: '600', fontSize: 15 },
});

export default ProfileScreen;
