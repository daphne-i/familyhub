import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import {
  Home, 
  MoreHorizontal,
  Plus,
  ChevronLeft,
  ChevronRight,
  List,        
  Tag,
  User,
  Banknote,
  X,
  ChevronDown // Import ChevronDown for the toggle hint
} from 'lucide-react-native';
import * as theme from '../../utils/theme';
import { useFamilyCollection, useBudget, updateBudgetLimit } from '../../services/firestore';
import { useFamily } from '../../hooks/useFamily';
import MemberAvatar from '../Common/MemberAvatar';
import MonthYearPicker from '../Common/MonthYearPicker';

const { COLORS, FONT_SIZES, SPACING, RADII } = theme;

// --- Components ---

const BudgetHeader = ({ onPressMore }) => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.header, { paddingTop: insets.top }]}>
      <TouchableOpacity
        style={styles.headerButton}
        onPress={() => navigation.navigate('Hub')}>
        <Home size={FONT_SIZES.xl} color={COLORS.text_dark} /> 
      </TouchableOpacity>
      <TouchableOpacity style={styles.headerButton} onPress={onPressMore}>
        <MoreHorizontal size={FONT_SIZES.xl} color={COLORS.text_dark} />
      </TouchableOpacity>
    </View>
  );
};

// Updated SummaryCard to toggle between Expense and Income
const SummaryCard = ({ totalSpent, totalIncome, budgetLimit, loading, mode, onToggle }) => {
  if (loading) {
    return (
      <View style={[styles.summaryCard, { height: 180, justifyContent: 'center' }]}>
        <ActivityIndicator color={COLORS.white} />
      </View>
    );
  }

  const isExpense = mode === 'expense';
  
  // Values to display
  const amount = isExpense ? totalSpent : totalIncome;
  const label = isExpense ? 'Monthly Expenses' : 'Monthly Income';
  const subLabel = isExpense ? 'Expenses this month' : 'Income this month';
  
  // Budget logic (only relevant for expenses)
  const limit = budgetLimit || 20000; 
  const left = limit - totalSpent;
  const percent = Math.min(Math.max((totalSpent / limit) * 100, 0), 100);

  // Dynamic background color: Blue for Expense (Default), Green for Income
  const cardBackgroundColor = isExpense ? COLORS.primary : COLORS.green;

  return (
    <TouchableOpacity 
      style={[styles.summaryCard, { backgroundColor: cardBackgroundColor }]} 
      activeOpacity={0.9}
      onPress={onToggle}
    >
      <View style={styles.summaryTitleRow}>
        <Text style={styles.summaryLabel}>{label}</Text>
        <ChevronDown size={16} color="rgba(255,255,255,0.7)" style={{ marginLeft: SPACING.xs }} />
      </View>
      
      <Text style={styles.summaryBalance}>₹{amount.toFixed(2)}</Text>
      <Text style={styles.summarySublabel}>{subLabel}</Text>
      
      {/* Only show Progress Bar for Expenses */}
      {isExpense ? (
        <>
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>Budget: ₹{left.toFixed(2)} left</Text>
            <Text style={styles.progressText}>{percent.toFixed(0)}%</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${percent}%` }]} />
          </View>
        </>
      ) : (
        // Placeholder or specific Income info could go here
        <View style={{ marginTop: SPACING.xl, height: 20 }} />
      )}
    </TouchableOpacity>
  );
};

// ... [EditBudgetModal, MonthSelector, ViewToggle remain UNCHANGED] ...
const EditBudgetModal = ({ visible, onClose, onSave, currentLimit, monthLabel }) => {
  const [limit, setLimit] = useState('');

  useEffect(() => {
    if (visible) {
      setLimit(currentLimit ? currentLimit.toString() : '20000');
    }
  }, [visible, currentLimit]);

  const handleSave = () => {
    const val = parseFloat(limit);
    if (!isNaN(val) && val > 0) {
      onSave(val);
      onClose();
    } else {
      Alert.alert("Invalid Amount", "Please enter a valid positive number.");
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Set Budget Limit</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color={COLORS.text_dark} />
            </TouchableOpacity>
          </View>
           <Text style={styles.modalSubtitle}>For {monthLabel}</Text>
           <TextInput
             style={styles.input}
             value={limit}
             onChangeText={setLimit}
             keyboardType="numeric"
             placeholder="e.g. 20000"
             placeholderTextColor={COLORS.text_light}
             autoFocus
           />
           <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
             <Text style={styles.saveButtonText}>Save Limit</Text>
           </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const MonthSelector = ({ currentMonth, onPrev, onNext, onPressDate }) => {
  const monthName = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' });
  return (
    <View style={styles.monthSelector}>
      <TouchableOpacity onPress={onPrev}>
        <ChevronLeft size={24} color={COLORS.text_dark} />
      </TouchableOpacity>
      
      <TouchableOpacity onPress={onPressDate} style={styles.monthClickable}>
        <Text style={styles.monthText}>{monthName}</Text>
      </TouchableOpacity>

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
    <View style={styles.viewToggleContainer}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        contentContainerStyle={styles.viewToggleContent}
      >
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
    </View>
  );
};

// --- Main Screen ---
const BudgetScreen = () => {
  const navigation = useNavigation();
  const { familyId, membersList } = useFamily();
  const [currentView, setCurrentView] = useState('List');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [isMonthPickerVisible, setMonthPickerVisible] = useState(false);
  
  // 1. New State for Summary Mode ('expense' or 'income')
  const [summaryMode, setSummaryMode] = useState('expense');

  const monthId = useMemo(() => {
    const year = selectedDate.getFullYear();
    const month = (selectedDate.getMonth() + 1).toString().padStart(2, '0');
    return `${year}-${month}`;
  }, [selectedDate]);

  const { data: budgetData, loading: loadingBudget } = useBudget(monthId);
  const { data: allTransactions, loading: loadingTx } = useFamilyCollection('transactions');

  const filteredTransactions = useMemo(() => {
    if (!allTransactions) return [];
    return allTransactions.filter(tx => {
      if (!tx.date) return false;
      const txDate = tx.date.toDate ? tx.date.toDate() : new Date(tx.date);
      return (
        txDate.getMonth() === selectedDate.getMonth() &&
        txDate.getFullYear() === selectedDate.getFullYear()
      );
    }).sort((a, b) => {
        const dateA = a.date.toDate ? a.date.toDate() : new Date(a.date);
        const dateB = b.date.toDate ? b.date.toDate() : new Date(b.date);
        return dateB - dateA;
    });
  }, [allTransactions, selectedDate]);

  // Calculate Total Spent
  const calculatedSpent = useMemo(() => {
      return filteredTransactions.reduce((total, tx) => {
          if (tx.type === 'Expense') {
              return total + (tx.amount || 0);
          }
          return total;
      }, 0);
  }, [filteredTransactions]);

  // 2. Calculate Total Income
  const calculatedIncome = useMemo(() => {
      return filteredTransactions.reduce((total, tx) => {
          if (tx.type === 'Income') {
              return total + (tx.amount || 0);
          }
          return total;
      }, 0);
  }, [filteredTransactions]);

  // --- Grouping Logic ---
  
  const groupedByDate = useMemo(() => {
    const groups = {};
    filteredTransactions.forEach(tx => {
      const txDate = tx.date.toDate ? tx.date.toDate() : new Date(tx.date);
      const dateStr = txDate.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
      if (!groups[dateStr]) {
        groups[dateStr] = { day: dateStr, total: 0, items: [] };
      }
      groups[dateStr].items.push(tx);
      // Only subtract expenses from daily total logic for visual clarity
      if (tx.type === 'Expense') groups[dateStr].total -= tx.amount;
      else groups[dateStr].total += tx.amount; // Add income
    });
    return Object.values(groups);
  }, [filteredTransactions]);

  const groupedByCategory = useMemo(() => {
     const groups = {};
     let totalForView = 0;
     
     // Filter based on the current Summary Mode (Expense vs Income)
     const relevantTransactions = filteredTransactions.filter(tx => 
       summaryMode === 'expense' ? tx.type === 'Expense' : tx.type === 'Income'
     );

     relevantTransactions.forEach(tx => {
         totalForView += tx.amount;
         if (!groups[tx.category]) {
           groups[tx.category] = { 
             id: tx.category, 
             title: tx.categoryName || 'Uncategorized',
             amount: 0,
             icon: tx.categoryIcon || '🔣' 
           };
         }
         groups[tx.category].amount += tx.amount;
     });
     
     return Object.values(groups).map(g => ({
       ...g,
       percent: totalForView > 0 ? `${((g.amount / totalForView) * 100).toFixed(0)}%` : '0%'
     })).sort((a, b) => b.amount - a.amount);
  }, [filteredTransactions, summaryMode]); // Re-calculate when mode changes

  const groupedByMember = useMemo(() => {
    const groups = {};
    let totalForView = 0;
    
    const relevantTransactions = filteredTransactions.filter(tx => 
       summaryMode === 'expense' ? tx.type === 'Expense' : tx.type === 'Income'
    );

    relevantTransactions.forEach(tx => {
        totalForView += tx.amount;
        const memberId = tx.paidBy || 'unknown';
        if (!groups[memberId]) {
          groups[memberId] = { id: memberId, amount: 0 };
        }
        groups[memberId].amount += tx.amount;
    });

    return Object.values(groups).map(g => ({
      ...g,
      percent: totalForView > 0 ? `${((g.amount / totalForView) * 100).toFixed(0)}%` : '0%'
    })).sort((a, b) => b.amount - a.amount);
  }, [filteredTransactions, summaryMode]);

  const groupedByAccount = useMemo(() => {
    const groups = {};
    // Account view usually shows everything, but let's respect the mode for consistency
    const relevantTransactions = filteredTransactions.filter(tx => 
       summaryMode === 'expense' ? tx.type === 'Expense' : tx.type === 'Income'
    );

    relevantTransactions.forEach(tx => {
        const accName = tx.accountName || 'Cash';
        if (!groups[accName]) {
          groups[accName] = { name: accName, amount: 0, icon: tx.accountIcon || '💵' }; 
        }
        groups[accName].amount += tx.amount;
    });
    return Object.values(groups).sort((a, b) => b.amount - a.amount);
  }, [filteredTransactions, summaryMode]);


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

  const handleSaveLimit = async (newLimit) => {
    try {
        await updateBudgetLimit(familyId, monthId, newLimit);
    } catch (e) {
        Alert.alert("Error", "Failed to update budget limit");
    }
  };

  const toggleSummaryMode = () => {
      setSummaryMode(prev => prev === 'expense' ? 'income' : 'expense');
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
            <Text style={[
                styles.listDayTotal, 
                item.total < 0 ? styles.txExpense : styles.txIncome
            ]}>
              {item.total < 0 ? '-' : '+'}₹{Math.abs(item.total).toFixed(2)}
            </Text>
          </View>
          {item.items.map(tx => (
            <TouchableOpacity 
              key={tx.id} 
              style={styles.txRow}
              onPress={() => navigation.navigate('NewTransaction', { transaction: tx })}
            >
              <View style={styles.txIconContainer}>
                <Text style={styles.txIcon}>{tx.categoryIcon || '💰'}</Text> 
              </View>
              <View style={styles.txRowCenter}>
                <Text style={styles.txTitle}>{tx.title}</Text>
                <Text style={styles.txSubtitle}>{tx.categoryName}</Text>
              </View>
              <Text style={[styles.txAmount, tx.type === 'Expense' ? styles.txExpense : styles.txIncome]}>
                {tx.type === 'Expense' ? '-' : '+'}₹{tx.amount.toFixed(2)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    />
  );
  
  const renderCategories = () => (
    <FlatList
      data={groupedByCategory}
      keyExtractor={item => item.id}
      ListHeaderComponent={
          <Text style={styles.listHeaderTitle}>
              {summaryMode === 'expense' ? 'Expenses' : 'Income'} by Category
          </Text>
      }
      ListEmptyComponent={<Text style={styles.emptyText}>No data for this view.</Text>}
      renderItem={({ item }) => (
        <View style={styles.txRow}>
          <View style={styles.txIconContainer}>
            <Text style={styles.txIcon}>{item.icon}</Text>
          </View>
          <View style={styles.txRowCenter}>
            <Text style={styles.txTitle}>{item.title}</Text>
            <Text style={styles.txSubtitle}>{item.percent} of {summaryMode}</Text>
          </View>
          <Text style={[styles.txAmount, summaryMode === 'expense' ? styles.txExpense : styles.txIncome]}>
              ₹{item.amount.toFixed(2)}
          </Text>
        </View>
      )}
    />
  );

  const renderMembers = () => (
    <FlatList
     data={groupedByMember}
     keyExtractor={item => item.id}
     ListHeaderComponent={
        <Text style={styles.listHeaderTitle}>
            {summaryMode === 'expense' ? 'Expenses' : 'Income'} by Member
        </Text>
     }
     ListEmptyComponent={<Text style={styles.emptyText}>No data for this view.</Text>}
     renderItem={({ item }) => {
       const member = membersList.find(m => m.id === item.id);
       const memberName = member ? member.displayName : 'Unknown';
       return (
         <View style={styles.txRow}>
           <View style={{ marginRight: 12 }}> 
              <MemberAvatar memberId={item.id} />
           </View>
           <View style={styles.txRowCenter}>
             <Text style={styles.txTitle}>{memberName}</Text> 
             <Text style={styles.txSubtitle}>{item.percent} of {summaryMode}</Text>
           </View>
           <Text style={[styles.txAmount, summaryMode === 'expense' ? styles.txExpense : styles.txIncome]}>
               ₹{item.amount.toFixed(2)}
           </Text>
         </View>
       );
     }}
   />
 );

 const renderAccounts = () => (
   <FlatList
     data={groupedByAccount}
     keyExtractor={item => item.name}
     ListHeaderComponent={
        <Text style={styles.listHeaderTitle}>
            {summaryMode === 'expense' ? 'Expenses' : 'Income'} by Account
        </Text>
     }
     ListEmptyComponent={<Text style={styles.emptyText}>No data for this view.</Text>}
     renderItem={({ item }) => (
       <View style={styles.txRow}>
          <View style={styles.txIconContainer}>
           <Text style={styles.txIcon}>{item.icon}</Text>
         </View>
         <View style={styles.txRowCenter}>
           <Text style={styles.txTitle}>{item.name}</Text>
         </View>
         <Text style={[styles.txAmount, summaryMode === 'expense' ? styles.txExpense : styles.txIncome]}>
             ₹{item.amount.toFixed(2)}
         </Text>
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
      <BudgetHeader onPressMore={() => setEditModalVisible(true)} />
      
      {/* 3. Pass new props to SummaryCard */}
      <SummaryCard 
        totalSpent={calculatedSpent} 
        totalIncome={calculatedIncome}
        budgetLimit={budgetData?.totalLimit} 
        loading={loadingTx || loadingBudget}
        mode={summaryMode}
        onToggle={toggleSummaryMode}
      />
      
      <MonthSelector 
        currentMonth={selectedDate} 
        onPrev={handlePrevMonth} 
        onNext={handleNextMonth}
        onPressDate={() => setMonthPickerVisible(true)} 
      />
      
      <ViewToggle currentView={currentView} setView={setCurrentView} />
      
      {renderContent()}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('NewTransaction')}>
        <Plus size={30} color={COLORS.white} />
      </TouchableOpacity>

      <EditBudgetModal
        visible={isEditModalVisible}
        onClose={() => setEditModalVisible(false)}
        onSave={handleSaveLimit}
        currentLimit={budgetData?.totalLimit}
        monthLabel={selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
      />

      <MonthYearPicker
        visible={isMonthPickerVisible}
        onClose={() => setMonthPickerVisible(false)}
        onSave={(date) => {
          setSelectedDate(date);
          setMonthPickerVisible(false);
        }}
        initialDate={selectedDate}
      />
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
    // backgroundColor is now dynamic
    padding: SPACING.lg,
  },
  summaryTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  summaryLabel: {
    fontSize: FONT_SIZES.md,
    color: 'rgba(255,255,255,0.8)',
  },
  summaryBalance: {
    fontSize: 40,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: SPACING.xs,
  },
  summarySublabel: {
    fontSize: FONT_SIZES.base,
    color: 'rgba(255,255,255,0.8)',
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
  monthClickable: {
    padding: SPACING.xs,
  },
  monthText: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.text_dark,
  },
  viewToggleContainer: {
    backgroundColor: COLORS.white,
    paddingVertical: SPACING.md,
  },
  viewToggleContent: {
    paddingHorizontal: SPACING.lg,
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
    fontSize: 22, 
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  modalContainer: {
    backgroundColor: COLORS.white,
    borderRadius: RADII.lg,
    padding: SPACING.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  modalTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text_dark,
  },
  modalSubtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text_light,
    marginBottom: SPACING.lg,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADII.md,
    padding: SPACING.md,
    fontSize: FONT_SIZES.lg,
    marginBottom: SPACING.xl,
    textAlign: 'center',
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    borderRadius: RADII.md,
    alignItems: 'center',
  },
  saveButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: FONT_SIZES.md,
  },
});

export default BudgetScreen;