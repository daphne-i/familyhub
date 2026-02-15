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
  ChevronDown
} from 'lucide-react-native';
import firestore from '@react-native-firebase/firestore'; 
import * as theme from '../../utils/theme';
import { useFamilyCollection } from '../../services/firestore';
import { useFamily } from '../../hooks/useFamily';
import MemberAvatar from '../Common/MemberAvatar';
import MonthYearPicker from '../Common/MonthYearPicker';
import BudgetCategoryPicker from './BudgetCategoryPicker'; // Added Category Picker

const { COLORS, FONT_SIZES, SPACING, RADII } = theme;

// --- Components ---

const BudgetHeader = ({ onPressMore }) => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.header, { paddingTop: insets.top }]}>
      <TouchableOpacity
        style={styles.headerButton}
        onPress={() => navigation.navigate('Dashboard')}>
        <Home size={FONT_SIZES.xl} color={COLORS.text_dark} /> 
      </TouchableOpacity>
      <TouchableOpacity style={styles.headerButton} onPress={onPressMore}>
        <MoreHorizontal size={FONT_SIZES.xl} color={COLORS.text_dark} />
      </TouchableOpacity>
    </View>
  );
};

const SummaryCard = ({ totalSpent, totalIncome, budgetLimit, loading, mode, onToggle }) => {
  if (loading) {
    return (
      <View style={[styles.summaryCard, { height: 180, justifyContent: 'center' }]}>
        <ActivityIndicator color={COLORS.white} />
      </View>
    );
  }

  const isExpense = mode === 'expense';
  
  const amount = isExpense ? totalSpent : totalIncome;
  const label = isExpense ? 'Monthly Expenses' : 'Monthly Income';
  const subLabel = isExpense ? 'Expenses this month' : 'Income this month';
  
  const limit = budgetLimit || 0; 
  const left = limit - totalSpent;
  const percent = limit > 0 ? Math.min(Math.max((totalSpent / limit) * 100, 0), 100) : 0;

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
      
      {isExpense ? (
        <>
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>
               {limit > 0 ? `Overall Budget: ₹${left.toFixed(2)} left` : 'No Overall Budget Set'}
            </Text>
            <Text style={styles.progressText}>{percent.toFixed(0)}%</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${percent}%` }]} />
          </View>
        </>
      ) : (
        <View style={{ marginTop: SPACING.xl, height: 20 }} />
      )}
    </TouchableOpacity>
  );
};

// Reusable Modal for setting both Overall Limits and Category Limits
const SetLimitModal = ({ visible, onClose, onSave, currentLimit, title, subtitle }) => {
  const [limit, setLimit] = useState('');

  useEffect(() => {
    if (visible) {
      setLimit(currentLimit ? currentLimit.toString() : '');
    }
  }, [visible, currentLimit]);

  const handleSave = () => {
    if (limit === '') {
        onSave(0); // Treat empty as removing the limit
        onClose();
        return;
    }
    const val = parseFloat(limit);
    if (!isNaN(val) && val >= 0) {
      onSave(val);
      onClose();
    } else {
      Alert.alert("Invalid Amount", "Please enter a valid number.");
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color={COLORS.text_dark} />
            </TouchableOpacity>
          </View>
           <Text style={styles.modalSubtitle}>{subtitle}</Text>
           <TextInput
             style={styles.input}
             value={limit}
             onChangeText={setLimit}
             keyboardType="numeric"
             placeholder="e.g. 5000"
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
  const [summaryMode, setSummaryMode] = useState('expense');

  // Modals & Pickers
  const [isOverallLimitModalVisible, setOverallLimitModalVisible] = useState(false);
  const [isCategoryLimitModalVisible, setCategoryLimitModalVisible] = useState(false);
  const [isCategoryPickerVisibleForBudget, setCategoryPickerVisibleForBudget] = useState(false);
  const [isMonthPickerVisible, setMonthPickerVisible] = useState(false);
  
  const [selectedCategoryForLimit, setSelectedCategoryForLimit] = useState(null);

  const monthId = useMemo(() => {
    const year = selectedDate.getFullYear();
    const month = (selectedDate.getMonth() + 1).toString().padStart(2, '0');
    return `${year}-${month}`;
  }, [selectedDate]);

  // --- Fetch Budget Data ---
  const [budgetData, setBudgetData] = useState(null);
  const [loadingBudget, setLoadingBudget] = useState(true);

  useEffect(() => {
    if (!familyId) return;
    setLoadingBudget(true);

    const unsub = firestore()
      .collection(`families/${familyId}/budgets`)
      .doc(monthId)
      .onSnapshot(doc => {
        if (doc.exists) {
          const data = doc.data();
          // We pull categoryLimits map into state alongside the total limits
          setBudgetData({ 
            ...data, 
            totalLimit: data.monthlyLimit || 0,
            categoryLimits: data.categoryLimits || {} 
          });
        } else {
          setBudgetData({ totalLimit: 0, totalSpent: 0, categoryLimits: {} });
        }
        setLoadingBudget(false);
      }, err => {
        console.error("Budget fetch error:", err);
        setLoadingBudget(false);
      });

    return () => unsub();
  }, [familyId, monthId]);


  // --- Fetch Transactions ---
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

  const calculatedSpent = useMemo(() => {
      return filteredTransactions.reduce((total, tx) => total + (tx.type === 'Expense' ? (tx.amount || 0) : 0), 0);
  }, [filteredTransactions]);

  const calculatedIncome = useMemo(() => {
      return filteredTransactions.reduce((total, tx) => total + (tx.type === 'Income' ? (tx.amount || 0) : 0), 0);
  }, [filteredTransactions]);

  // Sync to Firestore for Dashboard
  useEffect(() => {
    if (!familyId || loadingBudget) return;
    const dbSpent = budgetData?.totalSpent || 0;
    
    if (Math.abs(dbSpent - calculatedSpent) > 0.01) {
       firestore()
         .collection(`families/${familyId}/budgets`)
         .doc(monthId)
         .set({ totalSpent: calculatedSpent }, { merge: true })
         .catch(err => console.log("Failed to sync totalSpent", err));
    }
  }, [calculatedSpent, familyId, monthId, budgetData, loadingBudget]);

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
      if (tx.type === 'Expense') groups[dateStr].total -= tx.amount;
      else groups[dateStr].total += tx.amount;
    });
    return Object.values(groups);
  }, [filteredTransactions]);

  const groupedByCategory = useMemo(() => {
     const groups = {};
     let totalForView = 0;

     // 1. Ensure any category with a budget limit exists in the list (even if 0 spent so far)
     if (summaryMode === 'expense' && budgetData?.categoryLimits) {
         Object.entries(budgetData.categoryLimits).forEach(([catId, data]) => {
             if (data.limit > 0) {
                 groups[catId] = {
                     id: catId,
                     title: data.name,
                     icon: data.icon,
                     amount: 0,
                     limit: data.limit
                 };
             }
         });
     }

     const relevantTransactions = filteredTransactions.filter(tx => 
       summaryMode === 'expense' ? tx.type === 'Expense' : tx.type === 'Income'
     );

     // 2. Tally up transaction amounts
     relevantTransactions.forEach(tx => {
         totalForView += tx.amount;
         if (!groups[tx.category]) {
           groups[tx.category] = { 
             id: tx.category, 
             title: tx.categoryName || 'Uncategorized',
             amount: 0,
             icon: tx.categoryIcon || '🔣',
             limit: budgetData?.categoryLimits?.[tx.category]?.limit || 0
           };
         }
         groups[tx.category].amount += tx.amount;
     });
     
     // 3. Format strings and progress percentages
     return Object.values(groups).map(g => ({
       ...g,
       percent: totalForView > 0 ? `${((g.amount / totalForView) * 100).toFixed(0)}%` : '0%',
       percentOfLimit: g.limit > 0 ? Math.min((g.amount / g.limit) * 100, 100) : 0
     })).sort((a, b) => {
         // Keep budgeted items at the top, then sort by highest spent
         if (a.limit > 0 && b.limit === 0) return -1;
         if (b.limit > 0 && a.limit === 0) return 1;
         return b.amount - a.amount;
     });
  }, [filteredTransactions, summaryMode, budgetData]);

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

  // --- Actions ---
  const handleSaveOverallLimit = async (newLimit) => {
    try {
        await firestore()
            .collection(`families/${familyId}/budgets`)
            .doc(monthId)
            .set({ monthlyLimit: newLimit }, { merge: true });
    } catch (e) {
        Alert.alert("Error", "Failed to update overall limit");
    }
  };

  const handleSaveCategoryLimit = async (newLimit) => {
    if (!selectedCategoryForLimit) return;
    try {
      await firestore()
          .collection(`families/${familyId}/budgets`)
          .doc(monthId)
          .set({ 
             categoryLimits: {
               // We save an object so we remember the name and icon even when there are 0 expenses
               [selectedCategoryForLimit.id]: {
                 limit: newLimit,
                 name: selectedCategoryForLimit.name,
                 icon: selectedCategoryForLimit.icon || '🏷️'
               }
             }
          }, { merge: true });
    } catch (e) {
      Alert.alert("Error", "Failed to update category budget");
    }
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
          <View style={styles.categoryHeaderRow}>
            <Text style={styles.listHeaderTitle}>
                {summaryMode === 'expense' ? 'Expenses' : 'Income'} by Category
            </Text>
            {summaryMode === 'expense' && (
              <TouchableOpacity 
                style={styles.addCategoryBudgetBtn}
                onPress={() => setCategoryPickerVisibleForBudget(true)}
              >
                <Text style={styles.addCategoryBudgetBtnText}>+ Set Budget</Text>
              </TouchableOpacity>
            )}
          </View>
      }
      ListEmptyComponent={<Text style={styles.emptyText}>No data for this view.</Text>}
      renderItem={({ item }) => (
        <TouchableOpacity 
          style={styles.txRow}
          disabled={summaryMode === 'income'}
          onPress={() => {
             // Let user tap any expense category to set its limit
             if (summaryMode === 'expense') {
                 setSelectedCategoryForLimit({ id: item.id, name: item.title, icon: item.icon });
                 setCategoryLimitModalVisible(true);
             }
          }}
        >
          <View style={styles.txIconContainer}>
            <Text style={styles.txIcon}>{item.icon}</Text>
          </View>
          
          <View style={styles.txRowCenter}>
            <Text style={styles.txTitle}>{item.title}</Text>
            
            {/* Show Progress Bar if a limit is set */}
            {item.limit > 0 ? (
               <View style={{ marginTop: 4 }}>
                   <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                       <Text style={{ fontSize: FONT_SIZES.xs, color: COLORS.text_light }}>
                           ₹{item.amount.toFixed(0)} / ₹{item.limit.toFixed(0)}
                       </Text>
                       <Text style={{ 
                         fontSize: FONT_SIZES.xs, 
                         color: item.amount > item.limit ? COLORS.text_danger : COLORS.text_light,
                         fontWeight: item.amount > item.limit ? 'bold' : 'normal'
                       }}>
                           {item.percentOfLimit.toFixed(0)}%
                       </Text>
                   </View>
                   <View style={{ height: 4, backgroundColor: COLORS.background_light, borderRadius: 2 }}>
                       <View style={{ 
                           height: '100%', 
                           width: `${item.percentOfLimit}%`, 
                           backgroundColor: item.amount > item.limit ? COLORS.text_danger : COLORS.primary,
                           borderRadius: 2
                       }} />
                   </View>
               </View>
            ) : (
               <Text style={styles.txSubtitle}>{item.percent} of total {summaryMode}</Text>
            )}

          </View>

          <Text style={[styles.txAmount, summaryMode === 'expense' ? styles.txExpense : styles.txIncome]}>
              ₹{item.amount.toFixed(2)}
          </Text>
        </TouchableOpacity>
      )}
    />
  );

  const renderMembers = () => (
    <FlatList
     data={groupedByMember}
     keyExtractor={item => item.id}
     ListHeaderComponent={
        <View style={styles.categoryHeaderRow}>
          <Text style={styles.listHeaderTitle}>
              {summaryMode === 'expense' ? 'Expenses' : 'Income'} by Member
          </Text>
        </View>
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
        <View style={styles.categoryHeaderRow}>
          <Text style={styles.listHeaderTitle}>
              {summaryMode === 'expense' ? 'Expenses' : 'Income'} by Account
          </Text>
        </View>
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

  return (
    <View style={styles.container}>
      <BudgetHeader onPressMore={() => setOverallLimitModalVisible(true)} />
      
      <SummaryCard 
        totalSpent={calculatedSpent} 
        totalIncome={calculatedIncome}
        budgetLimit={budgetData?.totalLimit} 
        loading={loadingTx || loadingBudget}
        mode={summaryMode}
        onToggle={() => setSummaryMode(prev => prev === 'expense' ? 'income' : 'expense')}
      />
      
      <MonthSelector 
        currentMonth={selectedDate} 
        onPrev={() => setSelectedDate(new Date(selectedDate.setMonth(selectedDate.getMonth() - 1)))} 
        onNext={() => setSelectedDate(new Date(selectedDate.setMonth(selectedDate.getMonth() + 1)))}
        onPressDate={() => setMonthPickerVisible(true)} 
      />
      
      <ViewToggle currentView={currentView} setView={setCurrentView} />
      
      {loadingTx ? <ActivityIndicator style={{marginTop: 20}} color={COLORS.primary} /> : (
        currentView === 'Categories' ? renderCategories() :
        currentView === 'Members' ? renderMembers() :
        currentView === 'Accounts' ? renderAccounts() :
        renderList()
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('NewTransaction')}>
        <Plus size={30} color={COLORS.white} />
      </TouchableOpacity>

      {/* --- Modals --- */}
      <SetLimitModal
        visible={isOverallLimitModalVisible}
        onClose={() => setOverallLimitModalVisible(false)}
        onSave={handleSaveOverallLimit}
        currentLimit={budgetData?.totalLimit}
        title="Set Overall Budget"
        subtitle={`For ${selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' })}`}
      />

      <SetLimitModal
        visible={isCategoryLimitModalVisible}
        onClose={() => setCategoryLimitModalVisible(false)}
        onSave={handleSaveCategoryLimit}
        currentLimit={selectedCategoryForLimit ? (budgetData?.categoryLimits?.[selectedCategoryForLimit.id]?.limit || '') : ''}
        title={`Budget for ${selectedCategoryForLimit?.name}`}
        subtitle={`For ${selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' })}`}
      />

      <BudgetCategoryPicker
        visible={isCategoryPickerVisibleForBudget}
        type="Expense"
        onClose={() => setCategoryPickerVisibleForBudget(false)}
        onSelect={(cat) => {
          setSelectedCategoryForLimit(cat);
          setCategoryLimitModalVisible(true);
        }}
      />

      <MonthYearPicker
        visible={isMonthPickerVisible}
        onClose={() => setMonthPickerVisible(false)}
        onSave={(date) => { setSelectedDate(date); setMonthPickerVisible(false); }}
        initialDate={selectedDate}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background_white },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, backgroundColor: COLORS.white,
  },
  headerButton: { padding: SPACING.xs, width: 40, alignItems: 'center' },
  summaryCard: { padding: SPACING.lg },
  summaryTitleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.xs },
  summaryLabel: { fontSize: FONT_SIZES.md, color: 'rgba(255,255,255,0.8)' },
  summaryBalance: { fontSize: 40, fontWeight: 'bold', color: COLORS.white, marginBottom: SPACING.xs },
  summarySublabel: { fontSize: FONT_SIZES.base, color: 'rgba(255,255,255,0.8)' },
  progressContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: SPACING.xl },
  progressText: { fontSize: FONT_SIZES.sm, color: COLORS.white, fontWeight: '600' },
  progressBar: { height: 8, backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 4, marginTop: SPACING.sm },
  progressFill: { height: '100%', backgroundColor: COLORS.white, borderRadius: 4 },
  monthSelector: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: SPACING.lg, backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  monthClickable: { padding: SPACING.xs },
  monthText: { fontSize: FONT_SIZES.md, fontWeight: 'bold', color: COLORS.text_dark },
  viewToggleContainer: { backgroundColor: COLORS.white, paddingVertical: SPACING.md },
  viewToggleContent: { paddingHorizontal: SPACING.lg },
  toggleButton: {
    flexDirection: 'row', alignItems: 'center', height: 32, paddingHorizontal: 14,
    borderRadius: 20, backgroundColor: COLORS.white, borderWidth: 1, borderColor: '#E0E0E0', marginRight: SPACING.sm,
  },
  toggleActive: { backgroundColor: '#E3F2FD', borderColor: '#E3F2FD' },
  toggleIcon: { marginRight: 4 },
  toggleText: { fontSize: 15, color: COLORS.text_dark, fontWeight: '500', lineHeight: 18, textAlignVertical: 'center' },
  toggleActiveText: { color: COLORS.primary },
  
  // Category Header styles
  categoryHeaderRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: SPACING.lg, marginTop: SPACING.sm, backgroundColor: COLORS.background_white,
    paddingTop: SPACING.sm, paddingBottom: SPACING.xs,
  },
  listHeaderTitle: { fontSize: FONT_SIZES.md, color: COLORS.text_light, fontWeight: '600' },
  addCategoryBudgetBtn: { backgroundColor: COLORS.primary_light, paddingHorizontal: SPACING.sm, paddingVertical: 4, borderRadius: RADII.sm },
  addCategoryBudgetBtnText: { color: COLORS.primary, fontSize: FONT_SIZES.sm, fontWeight: 'bold' },
  
  listDayHeader: {
    flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg, paddingBottom: SPACING.md, backgroundColor: COLORS.background_white,
  },
  listDayText: { fontSize: FONT_SIZES.md, fontWeight: 'bold', color: COLORS.text_dark },
  listDayTotal: { fontSize: FONT_SIZES.md, fontWeight: 'bold', color: COLORS.text_dark },
  txRow: {
    flexDirection: 'row', alignItems: 'center', padding: SPACING.lg,
    backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  txIconContainer: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.background_light,
    justifyContent: 'center', alignItems: 'center', marginRight: SPACING.md,
  },
  txIcon: { fontSize: 22, color: COLORS.text_dark },
  txRowCenter: { flex: 1, marginRight: SPACING.md },
  txTitle: { fontSize: FONT_SIZES.md, color: COLORS.text_dark, fontWeight: '600' },
  txSubtitle: { fontSize: FONT_SIZES.sm, color: COLORS.text_light },
  txAmount: { fontSize: FONT_SIZES.md, fontWeight: 'bold' },
  txExpense: { color: COLORS.text_danger },
  txIncome: { color: COLORS.green },
  emptyText: { textAlign: 'center', marginTop: SPACING.xl, color: COLORS.text_light, fontSize: FONT_SIZES.md },
  fab: {
    position: 'absolute', bottom: SPACING.xl, right: SPACING.xl, width: 60, height: 60,
    borderRadius: 30, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', elevation: 8,
  },
  
  // Modal styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: SPACING.lg },
  modalContainer: { backgroundColor: COLORS.white, borderRadius: RADII.lg, padding: SPACING.xl },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
  modalTitle: { fontSize: FONT_SIZES.lg, fontWeight: 'bold', color: COLORS.text_dark },
  modalSubtitle: { fontSize: FONT_SIZES.md, color: COLORS.text_light, marginBottom: SPACING.lg },
  input: {
    borderWidth: 1, borderColor: COLORS.border, borderRadius: RADII.md, padding: SPACING.md,
    fontSize: FONT_SIZES.lg, marginBottom: SPACING.xl, textAlign: 'center',
  },
  saveButton: { backgroundColor: COLORS.primary, padding: SPACING.md, borderRadius: RADII.md, alignItems: 'center' },
  saveButtonText: { color: COLORS.white, fontWeight: 'bold', fontSize: FONT_SIZES.md },
});

export default BudgetScreen;