import React, { useState } from 'react';
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
import { useNavigation } from '@react-navigation/native';
import {
  ArrowLeft,
  Check,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  Tag,
  User,
  Banknote,
  Calendar,
  Repeat,
  Info,
  Type,
} from 'lucide-react-native';
import * as theme from '../../utils/theme';
import BudgetCategoryPicker from './BudgetCategoryPicker';
import AccountPicker from './AccountPicker';
import MemberPickerModal from '../Lists/MemberPickerModal';
import DateTimePickerModal from '../Common/DateTimePickerModal';
import firestore from '@react-native-firebase/firestore';
import { useFamily } from '../../hooks/useFamily';
import { useAuth } from '../../contexts/AuthContext';
import { addTransaction } from '../../services/firestore'; // 1. Import function

const { COLORS, FONT_SIZES, SPACING, RADII } = theme;

// ... (ModalHeader, FormRow components are unchanged) ...
const ModalHeader = ({ onSave, loading }) => {
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
      <Text style={styles.headerTitle}>New Transaction</Text>
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
  );
};

const FormRow = ({ icon, text, onPress, value }) => {
  const IconComponent = icon;
  return (
    <TouchableOpacity style={styles.formRow} onPress={onPress}>
      <View style={styles.iconContainer}>
        <IconComponent size={22} color={COLORS.text_dark} />
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
  const { familyId } = useFamily();
  const { user } = useAuth();

  const [type, setType] = useState('Expense');
  const [amount, setAmount] = useState(''); // Use string for input
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(null);
  const [account, setAccount] = useState(null);
  const [paidBy, setPaidBy] = useState(null);
  const [date, setDate] = useState(new Date());
  const [isPaid, setIsPaid] = useState(true);
  const [repeat, setRepeat] = useState('One time only');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [isCategoryPickerVisible, setCategoryPickerVisible] = useState(false);
  const [isAccountPickerVisible, setAccountPickerVisible] = useState(false);
  const [isMemberPickerVisible, setMemberPickerVisible] = useState(false);
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);

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
      categoryName: category ? category.name : 'Miscellaneous', // Denormalize for easy display
      categoryIcon: category ? category.icon : 'MoreHorizontal',
      accountId: account ? account.id : 'cash',
      accountName: account ? account.name : 'Cash',
      paidBy: paidBy ? paidBy.id : user.uid,
      date: firestore.Timestamp.fromDate(date),
      isPaid,
      repeat,
      note,
      createdBy: user.uid,
    };

    try {
      await addTransaction(familyId, transactionData);
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Could not save transaction.');
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ModalHeader onSave={handleSave} loading={loading} />
      
      <ScrollView>
        <View style={styles.amountContainer}>
          <Text style={styles.currencySymbol}>₹</Text>
          <TextInput
            style={styles.amountInput}
            value={amount}
            onChangeText={setAmount}
            placeholder="0.00"
            keyboardType="numeric"
            autoFocus
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
            text={type}
            onPress={() => setType(type === 'Expense' ? 'Income' : 'Expense')}
          />
          <FormRow
            icon={Tag}
            text={category ? category.name : 'Category'}
            onPress={() => setCategoryPickerVisible(true)}
          />
          <FormRow
            icon={User}
            text={paidBy ? paidBy.displayName : (type === 'Expense' ? 'Paid by' : 'Received by')}
            onPress={() => setMemberPickerVisible(true)}
          />
          <FormRow
            icon={Banknote}
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
          <View style={styles.switchRow}>
            <View style={styles.switchRowLeft}>
              <Info size={20} color={COLORS.text_light} style={styles.rowIcon} />
              <Text style={styles.rowText}>Mark as paid</Text>
            </View>
            <Switch
              value={isPaid}
              onValueChange={setIsPaid}
              trackColor={{ false: COLORS.border, true: COLORS.primary }}
            />
          </View>
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
  // --- Header ---
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
  // --- Amount ---
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.lg,
    backgroundColor: COLORS.white,
  },
  currencySymbol: {
    fontSize: 40,
    color: COLORS.text_light,
    marginRight: SPACING.sm,
  },
  amountInput: {
    fontSize: 50,
    fontWeight: 'bold',
    color: COLORS.text_dark,
  },
  // --- Card ---
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
    width: 30,
    alignItems: 'center',
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
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  switchRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
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