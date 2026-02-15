import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Share,
  Image,
  ActivityIndicator
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
  Shield,
  Camera
} from 'lucide-react-native';
import auth from '@react-native-firebase/auth';
import storage from '@react-native-firebase/storage';
import { launchImageLibrary } from 'react-native-image-picker';
import * as theme from '../../utils/theme';
import { useFamily } from '../../hooks/useFamily';
import { useAuth } from '../../contexts/AuthContext';

const { COLORS, FONT_SIZES, SPACING, RADII } = theme;

const SettingItem = ({ icon: Icon, label, value, onPress, isDestructive, showChevron = true }) => (
  <TouchableOpacity 
    style={styles.itemContainer} 
    onPress={onPress}
    activeOpacity={onPress ? 0.7 : 1}
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
      {showChevron && onPress && <ChevronRight size={18} color={COLORS.text_light} />}
    </View>
  </TouchableOpacity>
);

const SectionHeader = ({ title }) => (
  <Text style={styles.sectionHeader}>{title}</Text>
);

const SettingsScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { familyDoc } = useFamily();
  const { user } = useAuth();
  
  const [uploadingImage, setUploadingImage] = useState(false);
  
  // FIX: Add local state to force UI updates immediately
  const [localPhoto, setLocalPhoto] = useState(user?.photoURL);

  // Sync local photo if user object changes from outside
  useEffect(() => {
    setLocalPhoto(user?.photoURL);
  }, [user?.photoURL]);

  // --- Avatar Menu Logic ---
  const handleAvatarPress = () => {
    if (localPhoto) {
      Alert.alert(
        "Profile Photo",
        "What would you like to do?",
        [
          { text: "Change Photo", onPress: handleUpdatePhoto },
          { text: "Cancel", style: "cancel" },
          { text: "Remove Photo", onPress: handleDeletePhoto, style: "destructive" }
        ]
      );
    } else {
      handleUpdatePhoto();
    }
  };

  const handleUpdatePhoto = async () => {
    try {
      const result = await launchImageLibrary({ 
        mediaType: 'photo', 
        selectionLimit: 1,
        quality: 0.5 
      });

      if (result.assets && result.assets.length > 0) {
        setUploadingImage(true);
        const asset = result.assets[0];
        
        const reference = storage().ref(`profile_photos/${user.uid}.jpg`);
        await reference.putFile(asset.uri);
        const url = await reference.getDownloadURL();
        
        await auth().currentUser.updateProfile({ photoURL: url });
        setLocalPhoto(url); // Instantly show new photo
        
        Alert.alert("Success", "Profile photo updated!");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Could not upload photo.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDeletePhoto = async () => {
    setUploadingImage(true);
    try {
      // 1. Remove from Firebase Auth Profile (Use null to properly clear it)
      await auth().currentUser.updateProfile({ photoURL: null });
      
      // 2. Try to delete the file from Storage to save space
      try {
        const reference = storage().ref(`profile_photos/${user.uid}.jpg`);
        await reference.delete();
      } catch (e) {
        // It's fine if this fails (e.g., if they didn't have a photo stored there)
      }

      setLocalPhoto(null); // Instantly remove photo from screen
      Alert.alert("Success", "Profile photo removed!");
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Could not remove photo.");
    } finally {
      setUploadingImage(false);
    }
  };

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
    if (!familyDoc?.inviteCode) {
        Alert.alert("Error", "Invite code not found.");
        return;
    }
    try {
      await Share.share({
        message: `Join my family on FamilyHub! Use this 6-digit Invite Code: ${familyDoc.inviteCode}`,
      });
    } catch (error) {
      Alert.alert("Error", "Could not share.");
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <TouchableOpacity style={styles.avatarWrapper} onPress={handleAvatarPress}>
            <View style={styles.avatarContainer}>
              {uploadingImage ? (
                <ActivityIndicator color={COLORS.white} />
              ) : localPhoto ? (
                <Image source={{ uri: localPhoto }} style={styles.avatar} />
              ) : (
                <User size={40} color={COLORS.white} />
              )}
            </View>
            <View style={styles.cameraIconBadge}>
               <Camera size={14} color={COLORS.white} />
            </View>
          </TouchableOpacity>
          
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
            value={familyDoc?.familyName || "My Family"} 
            showChevron={false}
          />
          <View style={styles.divider} />
          <SettingItem 
            icon={Share2} 
            label="Invite Member" 
            value={`Code: ${familyDoc?.inviteCode || '---'}`} 
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

        <Text style={styles.footerText}>FamilyHub for {familyDoc?.familyName || 'Family'}</Text>
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
  avatarWrapper: {
    marginRight: SPACING.md,
    position: 'relative'
  },
  avatarContainer: {
    width: 60, height: 60, borderRadius: 30, backgroundColor: COLORS.primary,
    justifyContent: 'center', alignItems: 'center',
    overflow: 'hidden'
  },
  avatar: { width: '100%', height: '100%' },
  cameraIconBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.text_dark,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.white
  },
  profileName: { fontSize: FONT_SIZES.lg, fontWeight: 'bold', color: COLORS.text_dark },
  profileEmail: { fontSize: FONT_SIZES.sm, color: COLORS.text_light },

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