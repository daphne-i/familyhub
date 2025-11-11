import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useFamily } from '../../hooks/useFamily';
import * as theme from '../../utils/theme';

const { COLORS, FONT_SIZES } = theme;

// Helper to get initials
const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.split(' ');
  return parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : '');
};

const MemberAvatar = ({ memberId }) => {
  const { membersList } = useFamily();

  const member = useMemo(() => {
    if (!memberId || !membersList) return null;
    return membersList.find((m) => m.id === memberId);
  }, [memberId, membersList]);

  if (!member) {
    return null;
  }

  return (
    <View style={styles.avatar}>
      <Text style={styles.avatarText}>{getInitials(member.displayName)}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.orange_light,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16,
    borderWidth: 1,
    borderColor: COLORS.orange,
  },
  avatarText: {
    color: COLORS.orange,
    fontWeight: 'bold',
    fontSize: FONT_SIZES.sm,
  },
});

export default MemberAvatar;