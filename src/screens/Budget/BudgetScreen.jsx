import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import {
  Home, 
  MoreHorizontal,
  Plus,
  ChevronLeft,
  ChevronRight,
  ChevronDown, 
  List,        
  Tag,
  User,
  Banknote,
} from 'lucide-react-native';
import * as theme from '../../utils/theme';
import { useFamilyCollection, useBudget } from '../../services/firestore';
import MemberAvatar from '../Common/MemberAvatar'; // Import MemberAvatar

const { COLORS, FONT_SIZES, SPACING, RADII } = theme;

// --- Components ---

const BudgetHeader = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.header, { paddingTop: insets.top }]}>
      <TouchableOpacity
        style={styles.headerButton}
        onPress={() => navigation.navigate('Hub')}>
        <Home size={FONT_SIZES.xl} color={COLORS.text_dark} /> 
      </TouchableOpacity>
      <TouchableOpacity style={styles.headerButton}>
        <MoreHorizontal size={FONT_SIZES.xl} color={COLORS.text_dark} />
      </TouchableOpacity>
    </View>
  );
};

const SummaryCard = ({ budgetData, loading }) => {
  if (loading) {
    return (
      <View style={[styles.summaryCard, { height: 180, justifyContent: 'center' }]}>
        <ActivityIndicator color={COLORS.white} />
      </View>
    );
  }

  const spent = budgetData?.totalSpent || 0;
  const budgetLimit = 20000; // TODO: Make editable
  const left = budgetLimit - spent;
  const percent = Math.min(Math.max((spent / budgetLimit) * 100, 0), 100);

  return (
    <View style={styles.summaryCard}>
      <TouchableOpacity style={styles.summaryTitleRow}>
        <Text style={styles.summaryLabel}>Monthly Budget</Text>
        <ChevronDown size={16} color="rgba(255,255,255,0.7)" style={{ marginLeft: SPACING.xs }} />
      </TouchableOpacity>
      <Text style={styles.summaryBalance}>₹{spent.toFixed(2)}</Text>
      <Text style={styles.summarySublabel}>Expenses this month</Text>
      
      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>Budget: ₹{left.toFixed(2)} left</Text>
        <Text style={styles.progressText}>{percent.toFixed(0)}%</Text>
      </View>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${percent}%` }]} />
      </View>
    </View>
  );
};

const MonthSelector = ({ currentMonth, onPrev, onNext }) => {
  const monthName = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' });
  return (
    <View style={styles.monthSelector}>
      <TouchableOpacity onPress={onPrev}>
        <ChevronLeft size={24} color={COLORS.text_dark} />
      </TouchableOpacity>
      <Text style={styles.monthText}>{monthName}</Text>
      <TouchableOpacity onPress={onNext}>
        <ChevronRight size={24} color={COLORS.text_dark} />
      </TouchableOpacity>
    </View>
  );
};

const ViewToggle = ({ currentView, setView }) => {
  const toggleOptions = [
    { key: 'List', icon: List },
    { key: 'Categories', icon: Tag },
    { key: 'Members', icon: User },
    { key: 'Accounts', icon: Banknote },
  ];

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.viewToggle}>
      {toggleOptions.map((opt) => {
        const isActive = currentView === opt.key;
        const Icon = opt.icon;
        return (
          <TouchableOpacity
            key={opt.key}
            style={[styles.toggleButton, isActive && styles.toggleActive]}
            onPress={() => setView(opt.key)}>
            <Icon 
              size={18} 
              color={isActive ? COLORS.primary : COLORS.text} 
              style={styles.toggleIcon} 
            />
            <Text style={[styles.toggleText, isActive && styles.toggleActiveText]}>
              {opt.key}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

// --- Main Screen ---
const BudgetScreen = () => {
  const navigation = useNavigation();
  const [currentView, setCurrentView] = useState('List');
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // 1. Calculate Month ID (YYYY-MM)
  const monthId = useMemo(() => {
    const year = selectedDate.getFullYear();
    const month = (selectedDate.getMonth() + 1).toString().padStart(2, '0');
    return `${year}-${month}`;
  }, [selectedDate]);

  // 2. Fetch Budget Summary
  const { data: budgetData, loading: loadingBudget } = useBudget(monthId);

  // 3. Fetch Transactions
  const { data: allTransactions, loading: loadingTx } = useFamilyCollection('transactions');

  const filteredTransactions = useMemo(() => {
    if (!allTransactions) return [];
    return allTransactions.filter(tx => {
      if (!tx.date) return false;
      const txDate = tx.date.toDate();
      return (
        txDate.getMonth() === selectedDate.getMonth() &&
        txDate.getFullYear() === selectedDate.getFullYear()
      );
    }).sort((a, b) => b.date.toDate() - a.date.toDate());
  }, [allTransactions, selectedDate]);


  // --- Grouping Logic ---
  
  // Group by Date for "List" view
  const groupedByDate = useMemo(() => {
    const groups = {};
    filteredTransactions.forEach(tx => {
      const dateStr = tx.date.toDate().toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
      if (!groups[dateStr]) {
        groups[dateStr] = { day: dateStr, total: 0, items: [] };
      }
      groups[dateStr].items.push(tx);
      if (tx.type === 'Expense') groups[dateStr].total += tx.amount;
    });
    return Object.values(groups);
  }, [filteredTransactions]);

  // Group by Category
  const groupedByCategory = useMemo(() => {
     const groups = {};
     let totalExpense = 0;
     filteredTransactions.forEach(tx => {
       if (tx.type === 'Expense') {
         totalExpense += tx.amount;
         if (!groups[tx.category]) {
           groups[tx.category] = { 
             id: tx.category, 
             title: tx.categoryName || 'Uncategorized',
             amount: 0,
             // FIX: Use the icon from the transaction
             icon: tx.categoryIcon || '🔣' 
           };
         }
         groups[tx.category].amount += tx.amount;
       }
     });
     return Object.values(groups).map(g => ({
       ...g,
       percent: totalExpense > 0 ? `${((g.amount / totalExpense) * 100).toFixed(0)}%` : '0%'
     })).sort((a, b) => b.amount - a.amount);
  }, [filteredTransactions]);

  // Group by Member
  const groupedByMember = useMemo(() => {
    const groups = {};
    let totalExpense = 0;
    filteredTransactions.forEach(tx => {
      if (tx.type === 'Expense') {
        totalExpense += tx.amount;
        const memberId = tx.paidBy || 'unknown';
        if (!groups[memberId]) {
          groups[memberId] = { id: memberId, amount: 0 };
        }
        groups[memberId].amount += tx.amount;
      }
    });
    return Object.values(groups).map(g => ({
      ...g,
      percent: totalExpense > 0 ? `${((g.amount / totalExpense) * 100).toFixed(0)}%` : '0%'
    })).sort((a, b) => b.amount - a.amount);
  }, [filteredTransactions]);

  // Group by Account
  const groupedByAccount = useMemo(() => {
    const groups = {};
    filteredTransactions.forEach(tx => {
      if (tx.type === 'Expense') {
        const accName = tx.accountName || 'Cash';
        if (!groups[accName]) {
          // FIX: Use the icon from the transaction
          groups[accName] = { name: accName, amount: 0, icon: tx.accountIcon || '💵' }; 
        }
        groups[accName].amount += tx.amount;
      }
    });
    return Object.values(groups).sort((a, b) => b.amount - a.amount);
  }, [filteredTransactions]);


  const handlePrevMonth = () => {
    setSelectedDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  };

  const handleNextMonth = () => {
     setSelectedDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  };

  // --- RENDER FUNCTIONS ---

  const renderList = () => (
    <FlatList
      data={groupedByDate}
      keyExtractor={item => item.day}
      ListEmptyComponent={<Text style={styles.emptyText}>No transactions this month.</Text>}
      renderItem={({ item }) => (
        <View>
          <View style={styles.listDayHeader}>
            <Text style={styles.listDayText}>{item.day}</Text>
            <Text style={styles.listDayTotal}>-₹{item.total.toFixed(2)}</Text>
          </View>
          {item.items.map(tx => (
            <View key={tx.id} style={styles.txRow}>
              <View style={styles.txIconContainer}>
                {/* FIX: Display the Category Icon here */}
                <Text style={styles.txIcon}>{tx.categoryIcon || '💰'}</Text> 
              </View>
              <View style={styles.txRowCenter}>
                <Text style={styles.txTitle}>{tx.title}</Text>
                <Text style={styles.txSubtitle}>{tx.categoryName}</Text>
              </View>
              <Text style={[styles.txAmount, tx.type === 'Expense' ? styles.txExpense : styles.txIncome]}>
                {tx.type === 'Expense' ? '-' : '+'}₹{tx.amount.toFixed(2)}
              </Text>
            </View>
          ))}
        </View>
      )}
    />
  );
  
  const renderCategories = () => (
    <FlatList
      data={groupedByCategory}
      keyExtractor={item => item.id}
      ListHeaderComponent={<Text style={styles.listHeaderTitle}>Expenses by Category</Text>}
      renderItem={({ item }) => (
        <View style={styles.txRow}>
          <View style={styles.txIconContainer}>
            <Text style={styles.txIcon}>{item.icon}</Text>
          </View>
          <View style={styles.txRowCenter}>
            <Text style={styles.txTitle}>{item.title}</Text>
            <Text style={styles.txSubtitle}>{item.percent} of expenses</Text>
          </View>
          <Text style={[styles.txAmount, styles.txExpense]}>₹{item.amount.toFixed(2)}</Text>
        </View>
      )}
    />
  );

  const renderMembers = () => (
    <FlatList
     data={groupedByMember}
     keyExtractor={item => item.id}
     ListHeaderComponent={<Text style={styles.listHeaderTitle}>Expenses by Member</Text>}
     renderItem={({ item }) => (
       <View style={styles.txRow}>
         <View style={{ marginRight: 12 }}> 
            <MemberAvatar memberId={item.id} />
         </View>
         <View style={styles.txRowCenter}>
           <Text style={styles.txTitle}>Member</Text> 
           <Text style={styles.txSubtitle}>{item.percent} of expenses</Text>
         </View>
         <Text style={[styles.txAmount, styles.txExpense]}>₹{item.amount.toFixed(2)}</Text>
       </View>
     )}
   />
 );

 const renderAccounts = () => (
   <FlatList
     data={groupedByAccount}
     keyExtractor={item => item.name}
     ListHeaderComponent={<Text style={styles.listHeaderTitle}>Expenses by Account</Text>}
     renderItem={({ item }) => (
       <View style={styles.txRow}>
          <View style={styles.txIconContainer}>
           <Text style={styles.txIcon}>{item.icon}</Text>
         </View>
         <View style={styles.txRowCenter}>
           <Text style={styles.txTitle}>{item.name}</Text>
         </View>
         <Text style={[styles.txAmount, styles.txExpense]}>₹{item.amount.toFixed(2)}</Text>
       </View>
     )}
   />
 );
  
  const renderContent = () => {
    if (loadingTx) return <ActivityIndicator style={{marginTop: 20}} color={COLORS.primary} />;
    
    if (currentView === 'Categories') return renderCategories();
    if (currentView === 'Members') return renderMembers();
    if (currentView === 'Accounts') return renderAccounts();
    return renderList(); 
  };

  return (
    <View style={styles.container}>
      <BudgetHeader />
      <SummaryCard budgetData={budgetData} loading={loadingBudget} />
      <MonthSelector currentMonth={selectedDate} onPrev={handlePrevMonth} onNext={handleNextMonth} />
      <ViewToggle currentView={currentView} setView={setCurrentView} />
      
      {renderContent()}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('NewTransaction')}>
        <Plus size={30} color={COLORS.white} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background_white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
  },
  headerButton: {
    padding: SPACING.xs,
    width: 40,
    alignItems: 'center',
  },
  summaryCard: {
    backgroundColor: COLORS.primary,
    padding: SPACING.lg,
  },
  summaryTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: FONT_SIZES.md,
    color: 'rgba(255,255,255,0.7)',
  },
  summaryBalance: {
    fontSize: 40,
    fontWeight: 'bold',
    color: COLORS.white,
    marginVertical: SPACING.xs,
  },
  summarySublabel: {
    fontSize: FONT_SIZES.base,
    color: 'rgba(255,255,255,0.7)',
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.xl,
  },
  progressText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.white,
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 4,
    marginTop: SPACING.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.white,
    borderRadius: 4,
  },
  monthSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  monthText: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.text_dark,
  },
  viewToggle: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.white,
    maxHeight: 60, 
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 32,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginRight: SPACING.sm,
  },
  toggleActive: {
    backgroundColor: '#E3F2FD',
    borderColor: '#E3F2FD',
  },
  toggleIcon: {
    marginRight: 4,
  },
  toggleText: {
    fontSize: 15,
    color: COLORS.text_dark,
    fontWeight: '500',
    lineHeight: 18,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  toggleActiveText: {
    color: COLORS.primary,
  },
  listHeaderTitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text_light,
    fontWeight: '600',
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.sm,
    backgroundColor: COLORS.background_white,
    paddingTop: SPACING.sm,
  },
  listDayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.background_white,
  },
  listDayText: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.text_dark,
  },
  listDayTotal: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.text_dark,
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  txIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background_light,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  txIcon: {
    fontSize: 22, // Increased font size for emojis
    color: COLORS.text_dark,
  },
  txRowCenter: {
    flex: 1,
  },
  txTitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text_dark,
    fontWeight: '600',
  },
  txSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text_light,
  },
  txAmount: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
  },
  txExpense: {
    color: COLORS.text_danger,
  },
  txIncome: {
    color: COLORS.green,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: SPACING.xl,
    color: COLORS.text_light,
    fontSize: FONT_SIZES.md,
  },
  fab: {
    position: 'absolute',
    bottom: SPACING.xl,
    right: SPACING.xl,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
  },
});

export default BudgetScreen;