import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Switch,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  ArrowLeft,
  Check,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  User,
  Calendar,
  Repeat,
  Type,
  Trash2, // Import Trash icon
} from 'lucide-react-native';
import * as theme from '../../utils/theme';
import BudgetCategoryPicker from './BudgetCategoryPicker';
import AccountPicker from './AccountPicker';
import MemberPickerModal from '../Lists/MemberPickerModal';
import DateTimePickerModal from '../Common/DateTimePickerModal';
import firestore from '@react-native-firebase/firestore';
import { useFamily } from '../../hooks/useFamily';
import { useAuth } from '../../contexts/AuthContext';
import { addTransaction, updateTransaction, deleteTransaction } from '../../services/firestore';

const { COLORS, FONT_SIZES, SPACING, RADII } = theme;

const COLOR_EXPENSE = '#E91E63';
const COLOR_INCOME = '#10B981';

const ModalHeader = ({ onSave, loading, title, onDelete, isEditMode }) => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.header, { paddingTop: insets.top }]}>
      <TouchableOpacity
        style={styles.headerButton}
        onPress={() => navigation.goBack()}
        disabled={loading}>
        <ArrowLeft size={FONT_SIZES.xl} color={COLORS.text_dark} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>{title}</Text>
      <View style={{ flexDirection: 'row' }}>
        {isEditMode && (
          <TouchableOpacity
            style={[styles.headerButton, { marginRight: 8 }]}
            onPress={onDelete}
            disabled={loading}>
            <Trash2 size={FONT_SIZES.xl} color={COLORS.text_danger} />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.headerButton}
          onPress={onSave}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator size="small" color={COLORS.primary} />
          ) : (
            <Check size={FONT_SIZES.xl} color={COLORS.primary} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const FormRow = ({ icon, emoji, text, onPress, value, iconColor, iconBackgroundColor }) => {
  const IconComponent = icon;
  return (
    <TouchableOpacity style={styles.formRow} onPress={onPress}>
      <View style={[
        styles.iconContainer, 
        iconBackgroundColor && { backgroundColor: iconBackgroundColor } 
      ]}>
        {emoji ? (
          <Text style={styles.emojiText}>{emoji}</Text>
        ) : (
          <IconComponent 
            size={20} 
            color={iconColor || COLORS.text_dark} 
          />
        )}
      </View>
      <Text style={styles.rowText}>{text}</Text>
      {value && <Text style={styles.rowValue}>{value}</Text>}
      {onPress && (
        <ChevronDown size={20} color={COLORS.text_light} style={styles.rowArrow} />
      )}
    </TouchableOpacity>
  );
};

const NewTransactionScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { familyId } = useFamily();
  const { user } = useAuth();

  // Get existing transaction from params if editing
  const existingTx = route.params?.transaction;
  const isEditMode = !!existingTx;

  const [type, setType] = useState('Expense');
  const [amount, setAmount] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(null);
  const [account, setAccount] = useState(null);
  const [paidBy, setPaidBy] = useState(null);
  const [date, setDate] = useState(new Date());
  const [repeat, setRepeat] = useState('One time only');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [isCategoryPickerVisible, setCategoryPickerVisible] = useState(false);
  const [isAccountPickerVisible, setAccountPickerVisible] = useState(false);
  const [isMemberPickerVisible, setMemberPickerVisible] = useState(false);
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);

  // Populate state if editing
  useEffect(() => {
    if (isEditMode && existingTx) {
      setType(existingTx.type);
      setAmount(existingTx.amount.toString());
      setTitle(existingTx.title);
      // Reconstruct category object for UI
      setCategory({ 
        id: existingTx.category, 
        name: existingTx.categoryName, 
        icon: existingTx.categoryIcon 
      });
      // Reconstruct account object for UI
      setAccount({ 
        id: existingTx.accountId, 
        name: existingTx.accountName, 
        icon: existingTx.accountIcon 
      });
      // PaidBy is just an ID, we might need to fetch full object or just store ID
      // For MVP we stored just ID in paidBy. 
      // To properly show "Received by X", we need the user object. 
      // Assuming we can't easily get the full object here without context, 
      // we'll just rely on the list logic or default.
      // Ideally, pass the full member object if available or fetch it.
      // For now, we will keep paidBy as null to show "Paid by" until user re-selects,
      // OR you can pass the full member object via navigation params if you have it.
      
      const txDate = existingTx.date.toDate ? existingTx.date.toDate() : new Date(existingTx.date);
      setDate(txDate);
      setRepeat(existingTx.repeat || 'One time only');
      setNote(existingTx.note || '');
    }
  }, [isEditMode, existingTx]);

  const activeColor = type === 'Expense' ? COLOR_EXPENSE : COLOR_INCOME;

  const handleSave = async () => {
    if (!amount || isNaN(parseFloat(amount))) {
      Alert.alert('Invalid Amount', 'Please enter a valid number.');
      return;
    }
    if (!title) {
      Alert.alert('Missing Title', 'Please enter a title.');
      return;
    }

    setLoading(true);

    const transactionData = {
      type,
      amount: parseFloat(amount),
      title,
      category: category ? category.id : 'misc',
      categoryName: category ? category.name : 'Miscellaneous',
      categoryIcon: category ? category.icon : '🔣',
      accountId: account ? account.id : 'cash',
      accountName: account ? account.name : 'Cash',
      accountIcon: account ? account.icon : '💵',
      paidBy: paidBy ? paidBy.id : (existingTx?.paidBy || user.uid),
      date: firestore.Timestamp.fromDate(date),
      isPaid: true,
      repeat,
      note,
      updatedBy: user.uid,
    };

    if (!isEditMode) {
        transactionData.createdBy = user.uid;
    }

    try {
      if (isEditMode) {
        await updateTransaction(familyId, existingTx.id, existingTx, transactionData);
      } else {
        await addTransaction(familyId, transactionData);
      }
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Could not save transaction.');
    } finally {
      setLoading(false);
    }
  };

const handleDelete = () => {
    // Check if it's a repeating series
    if (existingTx.seriesId) {
      Alert.alert(
        'Delete Repeating Transaction',
        'This transaction is part of a repeating series.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete This Only',
            onPress: () => performDelete('single'),
          },
          {
            text: 'Delete All Future',
            style: 'destructive',
            onPress: () => performDelete('future'),
          },
        ]
      );
    } else {
      // Standard delete for single item
      Alert.alert(
        'Delete Transaction',
        'Are you sure you want to delete this transaction?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => performDelete('single'),
          },
        ]
      );
    }
  };

  const performDelete = async (deleteScope) => {
    setLoading(true);
    try {
      await deleteTransaction(familyId, existingTx.id, existingTx, deleteScope);
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Could not delete transaction.');
      setLoading(false);
    }
  };
  
  return (
    <View style={styles.container}>
      <ModalHeader 
        title={isEditMode ? "Edit Transaction" : "New Transaction"}
        onSave={handleSave} 
        loading={loading} 
        isEditMode={isEditMode}
        onDelete={handleDelete}
      />
      
      <ScrollView>
        <View style={styles.amountContainer}>
          <Text style={[styles.currencySymbol, { color: activeColor }]}>₹</Text>
          <TextInput
            style={[styles.amountInput, { color: activeColor }]}
            value={amount}
            onChangeText={setAmount}
            placeholder="0.00"
            placeholderTextColor={activeColor + '80'} 
            keyboardType="numeric"
            autoFocus={!isEditMode}
          />
        </View>
        
        <View style={styles.card}>
          <TextInput
            placeholder="Title"
            placeholderTextColor={COLORS.text_light}
            value={title}
            onChangeText={setTitle}
            style={styles.titleInput}
          />
          
          <FormRow
            icon={type === 'Expense' ? ArrowUp : ArrowDown}
            iconColor={COLORS.white}
            iconBackgroundColor={activeColor}
            text={type}
            onPress={() => setType(type === 'Expense' ? 'Income' : 'Expense')}
          />
          
          <FormRow
            emoji={category ? category.icon : '🏷️'}
            text={category ? category.name : 'Category'}
            onPress={() => setCategoryPickerVisible(true)}
          />

          <FormRow
            icon={User}
            text={paidBy ? paidBy.displayName : (type === 'Expense' ? 'Paid by' : 'Received by')}
            onPress={() => setMemberPickerVisible(true)}
          />

          <FormRow
            emoji={account ? account.icon : '💵'}
            text={account ? account.name : 'Account'}
            onPress={() => setAccountPickerVisible(true)}
          />

          <FormRow
            icon={Calendar}
            text={date.toLocaleDateString()}
            onPress={() => setDatePickerVisible(true)}
          />
        </View>
        
        <View style={styles.card}>
           <FormRow
            icon={Repeat}
            text="Repeat"
            value={repeat}
            onPress={() => navigation.navigate('Repeat', {
              currentValue: repeat,
              onSave: setRepeat,
            })}
          />
          <FormRow icon={Type} text="Add note" />
          <TextInput
            placeholder="Add a note..."
            placeholderTextColor={COLORS.text_light}
            value={note}
            onChangeText={setNote}
            style={styles.noteInput}
            multiline
          />
        </View>
      </ScrollView>

      <BudgetCategoryPicker
        visible={isCategoryPickerVisible}
        type={type}
        onClose={() => setCategoryPickerVisible(false)}
        onSelect={setCategory}
      />
      <AccountPicker
        visible={isAccountPickerVisible}
        onClose={() => setAccountPickerVisible(false)}
        onSelect={setAccount}
      />
      <MemberPickerModal
        visible={isMemberPickerVisible}
        onClose={() => setMemberPickerVisible(false)}
        onSelect={setPaidBy}
      />
      <DateTimePickerModal
        visible={isDatePickerVisible}
        onClose={() => setDatePickerVisible(false)}
        onSave={(d) => { setDate(d); setDatePickerVisible(false); }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background_modal,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.white,
  },
  headerButton: {
    padding: SPACING.xs,
  },
  headerTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text_dark,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xl,
    backgroundColor: COLORS.white,
  },
  currencySymbol: {
    fontSize: 40,
    marginRight: SPACING.sm,
  },
  amountInput: {
    fontSize: 50,
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADII.lg,
    margin: SPACING.lg,
    overflow: 'hidden',
  },
  titleInput: {
    height: 50,
    paddingHorizontal: SPACING.lg,
    fontSize: FONT_SIZES.md,
    color: COLORS.text_dark,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  formRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  iconContainer: {
    width: 32,
    height: 32, 
    borderRadius: 16, 
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.lg,
  },
  emojiText: {
    fontSize: 22,
    color: COLORS.text_dark,
  },
  rowIcon: {
    marginRight: SPACING.lg,
  },
  rowText: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    color: COLORS.text_dark,
  },
  rowValue: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text_light,
    marginRight: SPACING.sm,
  },
  rowArrow: {
    marginLeft: 'auto',
  },
  noteInput: {
    height: 100,
    fontSize: FONT_SIZES.md,
    color: COLORS.text_dark,
    padding: SPACING.lg,
    textAlignVertical: 'top',
  },
});

export default NewTransactionScreen;