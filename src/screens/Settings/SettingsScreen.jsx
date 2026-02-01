import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Share,
  Image
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { 
  LogOut, 
  Users, 
  ChevronRight, 
  User, 
  Share2,
  Info,
  Shield
} from 'lucide-react-native';
import auth from '@react-native-firebase/auth';
import * as theme from '../../utils/theme';
import { useFamily } from '../../hooks/useFamily';
import { useAuth } from '../../contexts/AuthContext';

const { COLORS, FONT_SIZES, SPACING, RADII } = theme;

const SettingItem = ({ icon: Icon, label, value, onPress, isDestructive, showChevron = true }) => (
  <TouchableOpacity 
    style={styles.itemContainer} 
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={styles.itemLeft}>
      <View style={[styles.iconBox, isDestructive && styles.destructiveIconBox]}>
        <Icon size={20} color={isDestructive ? COLORS.text_danger : COLORS.primary} />
      </View>
      <Text style={[styles.itemLabel, isDestructive && styles.destructiveLabel]}>
        {label}
      </Text>
    </View>
    <View style={styles.itemRight}>
      {value && <Text style={styles.itemValue}>{value}</Text>}
      {showChevron && <ChevronRight size={18} color={COLORS.text_light} />}
    </View>
  </TouchableOpacity>
);

const SectionHeader = ({ title }) => (
  <Text style={styles.sectionHeader}>{title}</Text>
);

const SettingsScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { familyId, familyName } = useFamily();
  const { user } = useAuth();

  const handleSignOut = async () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Sign Out", 
          style: "destructive", 
          onPress: async () => {
            try {
              await auth().signOut();
              // AuthContext will automatically redirect to Login
            } catch (error) {
              console.error(error);
              Alert.alert("Error", "Failed to sign out.");
            }
          } 
        }
      ]
    );
  };

  const handleShareFamily = async () => {
    try {
      await Share.share({
        message: `Join my family on FamilyHub! Use this Family ID to join: ${familyId}`,
      });
    } catch (error) {
      Alert.alert("Error", "Could not share.");
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            {user?.photoURL ? (
              <Image source={{ uri: user.photoURL }} style={styles.avatar} />
            ) : (
              <User size={40} color={COLORS.white} />
            )}
          </View>
          <View>
            <Text style={styles.profileName}>{user?.displayName || 'Family Member'}</Text>
            <Text style={styles.profileEmail}>{user?.email}</Text>
          </View>
        </View>

        {/* Family Section */}
        <SectionHeader title="Family" />
        <View style={styles.section}>
          <SettingItem 
            icon={Users} 
            label="Family Name" 
            value={familyName || "My Family"} 
            showChevron={false}
          />
          <View style={styles.divider} />
          <SettingItem 
            icon={Share2} 
            label="Invite Member" 
            value="Share ID" 
            onPress={handleShareFamily}
          />
        </View>

        {/* App Info Section */}
        <SectionHeader title="App Info" />
        <View style={styles.section}>
          <SettingItem 
            icon={Info} 
            label="Version" 
            value="1.0.0" 
            showChevron={false}
          />
          <View style={styles.divider} />
          <SettingItem 
            icon={Shield} 
            label="Privacy Policy" 
            onPress={() => Alert.alert("Privacy", "Data stored securely on Firebase.")}
          />
        </View>

        {/* Danger Zone */}
        <SectionHeader title="Account" />
        <View style={styles.section}>
          <SettingItem 
            icon={LogOut} 
            label="Sign Out" 
            isDestructive 
            onPress={handleSignOut}
            showChevron={false}
          />
        </View>

        <Text style={styles.footerText}>FamilyHub for {familyName}</Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background_light },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.background_light,
  },
  headerTitle: { fontSize: 32, fontWeight: 'bold', color: COLORS.text_dark },
  content: { padding: SPACING.lg },
  
  // Profile Card
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    borderRadius: RADII.lg,
    marginBottom: SPACING.xl,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  avatarContainer: {
    width: 60, height: 60, borderRadius: 30, backgroundColor: COLORS.primary,
    justifyContent: 'center', alignItems: 'center', marginRight: SPACING.md,
    overflow: 'hidden'
  },
  avatar: { width: '100%', height: '100%' },
  profileName: { fontSize: FONT_SIZES.lg, fontWeight: 'bold', color: COLORS.text_dark },
  profileEmail: { fontSize: FONT_SIZES.sm, color: COLORS.text_light },

  // Sections
  sectionHeader: { 
    fontSize: FONT_SIZES.sm, fontWeight: 'bold', color: COLORS.text_light, 
    marginBottom: SPACING.sm, marginLeft: SPACING.xs, textTransform: 'uppercase' 
  },
  section: {
    backgroundColor: COLORS.white,
    borderRadius: RADII.lg,
    marginBottom: SPACING.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  divider: { height: 1, backgroundColor: COLORS.border, marginLeft: 50 },
  
  // Items
  itemContainer: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 16, paddingHorizontal: SPACING.md,
  },
  itemLeft: { flexDirection: 'row', alignItems: 'center' },
  iconBox: {
    width: 32, height: 32, borderRadius: 8, backgroundColor: COLORS.primary_light,
    justifyContent: 'center', alignItems: 'center', marginRight: SPACING.md
  },
  destructiveIconBox: { backgroundColor: '#FFEBEE' },
  itemLabel: { fontSize: FONT_SIZES.md, color: COLORS.text_dark, fontWeight: '500' },
  destructiveLabel: { color: COLORS.text_danger },
  itemRight: { flexDirection: 'row', alignItems: 'center' },
  itemValue: { fontSize: FONT_SIZES.md, color: COLORS.text_light, marginRight: 8 },

  footerText: { textAlign: 'center', color: COLORS.text_light, fontSize: FONT_SIZES.sm, marginTop: SPACING.lg }
});

export default SettingsScreen;