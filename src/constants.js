// This file holds all the static, hard-coded data needed for the UI.
// Based on Section 8.0 and 15.0 of your design document.

// --- 1. LISTS (Shopping) ---
// Used in `ListDetailScreen` (for sections) and `ItemDetailScreen` (for picker)
export const SHOPPING_CATEGORIES = [
  { id: 'fruits_veg', name: 'Fruits & Vegetables', icon: '🍎' },
  { id: 'meat', name: 'Meat', icon: '🥩' },
  { id: 'seafood', name: 'Fish & Seafood', icon: '🐟' },
  { id: 'bakery', name: 'Bakery', icon: '🍞' },
  { id: 'dairy_eggs', name: 'Dairy & Eggs', icon: '🥛' },
  { id: 'frozen', name: 'Frozen', icon: '❄️' },
  { id: 'beverages', name: 'Beverages', icon: '🥤' },
  { id: 'pasta_rice_beans', name: 'Pasta, Rice & Beans', icon: '🌾' },
  { id: 'canned', name: 'Canned Foods', icon: '🥫' },
  { id: 'deli', name: 'Deli & Prepared Food', icon: '🥪' },
  { id: 'sauces', name: 'Sauces & Condiments', icon: '🧂' },
  { id: 'cereal', name: 'Cereal & Breakfast', icon: '🥣' },
  { id: 'snacks', name: 'Snacks', icon: '🍫' },
  { id: 'baking_cooking', name: 'Baking & Cooking', icon: '🧑‍🍳' },
  { id: 'health', name: 'Health & Beauty', icon: '🧴' },
  { id: 'baby', name: 'Baby', icon: '🍼' },
  { id: 'household', name: 'Household', icon: '🧼' },
  { id: 'pets', name: 'Pets', icon: '🐶' },
  { id: 'garden', name: 'Home & Garden', icon: '🏡' },
  { id: 'uncategorized', name: 'Uncategorized', icon: '🏷️' },
];

// --- 2. LISTS (To Do) ---
// Used to pre-populate a new To-Do list.
export const TODO_DEFAULT_CATEGORIES = [
  { id: 'uncategorized', name: 'Uncategorized', icon: '🏷️' },
  { id: 'home', name: 'Home', icon: '🏠' },
  { id: 'errands', name: 'Errands', icon: '🛒' },
  { id: 'school', name: 'School', icon: '🎓' },
  { id: 'work', name: 'Work', icon: '💼' },
];

// --- 3. BUDGET (Categories) ---
// Used in `NewTransactionScreen` in the "Pick a category" modal
// Icon names are from `lucide-react-native`
export const DEFAULT_EXPENSE_CATEGORIES = [
  { id: 'misc', name: 'Miscellaneous', icon: 'MoreHorizontal' },
  { id: 'groceries', name: 'Groceries', icon: 'ShoppingCart' },
  { id: 'food', name: 'Food', icon: 'Utensils' },
  { id: 'car', name: 'Car', icon: 'Car' },
  { id: 'utilities', name: 'Utilities', icon: 'Wrench' },
  { id: 'subscriptions', name: 'Subscription', icon: 'Repeat' },
  { id: 'restaurant', name: 'Restaurants & ...', icon: 'Coffee' },
  { id: 'entertainment', name: 'Entertainment', icon: 'Ticket' },
  { id: 'housing', name: 'Housing', icon: 'Home' },
  { id: 'loan', name: 'Loan', icon: 'Landmark' },
  { id: 'kids', name: 'Kids', icon: 'Baby' },
  { id: 'insurance', name: 'Insurance', icon: 'Shield' },
  { id: 'gifts', name: 'Gifts & Donations', icon: 'Gift' },
  { id: 'health', name: 'Health', icon: 'HeartPulse' },
  { id: 'personal_care', name: 'Personal Care & B...', icon: 'Droplet' },
  { id: 'clothing', name: 'Clothing', icon: 'Shirt' },
  { id: 'rent', name: 'Rent', icon: 'KeyRound' },
  { id: 'electricity', name: 'Electricity', icon: 'Zap' },
  { id: 'pets', name: 'Pets', icon: 'Dog' },
  { id: 'savings', name: 'Savings', icon: 'PiggyBank' },
  { id: 'transportation', name: 'Transportation', icon: 'Bus' },
  { id: 'electronics', name: 'Electronics', icon: 'Smartphone' },
  { id: 'education', name: 'Education', icon: 'BookOpen' },
  { id: 'sports', name: 'Sports', icon: 'Dumbbell' },
  { id: 'doctor', name: 'Doctor', icon: 'Stethoscope' },
  { id: 'taxes', name: 'Taxes', icon: 'FileText' },
  { id: 'travel', name: 'Travel', icon: 'Plane' },
  { id: 'vacation', name: 'Vacation', icon: 'Luggage' },
  { id: 'withdrawal', name: 'Withdrawal', icon: 'ArrowRight' },
];

export const DEFAULT_INCOME_CATEGORIES = [
  { id: 'misc_income', name: 'Miscellaneous', icon: 'MoreHorizontal' },
  { id: 'income', name: 'Income', icon: 'ArrowLeft' },
  { id: 'salary', name: 'Salary', icon: 'Briefcase' },
  { id: 'savings_income', name: 'Savings', icon: 'PiggyBank' },
  { id: 'investments', name: 'Investments', icon: 'TrendingUp' },
  { id: 'gifts_income', name: 'Gifts & Donations', icon: 'Gift' },
];

// --- 4. BUDGET (Accounts) ---
// Used in `NewTransactionScreen` in the "Pick an account" modal
export const DEFAULT_ACCOUNTS = [
  { id: 'checking', name: 'Checking Account', icon: 'Banknote' },
  { id: 'cash', name: 'Cash', icon: 'Wallet' },
  { id: 'credit_card', name: 'Credit Card', icon: 'CreditCard' },
  { id: 'savings', name: 'Savings Account', icon: 'PiggyBank' },
  { id: 'credit_account', name: 'Credit Account', icon: 'CircleDollarSign' },
  { id: 'joint', name: 'Joint Account', icon: 'Users' },
];

// --- 5. RECIPE BOX (Categories) ---
// Used in `EditRecipeScreen` in the "Collections" picker
export const DEFAULT_RECIPE_CATEGORIES = [
  { id: 'favorites', name: 'Favorites', icon: '❤️' },
  { id: 'spicy', name: 'Spicy', icon: '🌶️' },
  { id: 'vegetarian', name: 'Vegetarian', icon: '🥦' },
  { id: 'non_veg', name: 'Non-Veg', icon: '🥩' },
  { id: 'desserts', name: 'Desserts', icon: '🍰' },
  { id: 'gravy', name: 'Gravy', icon: 'CookingPot' },
  { id: 'side_dish', name: 'Side Dish', icon: 'Salad' },
];