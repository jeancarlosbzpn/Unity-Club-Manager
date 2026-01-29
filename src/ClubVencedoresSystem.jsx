import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, Edit2, Save, X, UserPlus, Users, Menu, ChevronLeft, Home, DollarSign, Calendar, Award, BookOpen, BarChart3, Settings, TrendingUp, TrendingDown, Wallet, FileText, ChevronUp, ChevronDown, ChevronRight, Grid, List, Trash2, Heart, AlertCircle, Phone, Package, CheckCircle, AlertTriangle, MapPin, Printer, IdCard, Trophy, ArrowLeft, CheckSquare, Tent, Image as ImageIcon, Upload, Shirt, Ruler, Scissors, Gift, Cake, Crown, ClipboardList, PlusCircle, MessageCircle, MessageSquare, Moon, Sun, Check, Globe, Sparkles, RefreshCw, Target } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import ClubLogo from './components/ClubLogo';
import adventistLogo from './assets/adventist-logo.png';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full text-center">
            <div className="text-red-500 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Algo salió mal</h2>
            <p className="text-gray-600 mb-6">El sistema ha detectado un error inesperado para evitar perder datos.</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium shadow-md"
            >
              Recargar Aplicación
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const ClubVencedoresSystem = () => {
  // Authentication state
  const dataclubesWebviewRef = useRef(null);

  // Create a style element for Google Fonts
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Roboto+Mono:wght@400;500&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    const style = document.createElement('style');
    style.innerHTML = `
      body { font-family: 'Inter', sans-serif; }
      .font-mono { font-family: 'Roboto Mono', monospace !important; }
    `;
    document.head.appendChild(style);

    return () => {
      if (document.head.contains(link)) document.head.removeChild(link);
      if (document.head.contains(style)) document.head.removeChild(style);
    };
  }, []);

  const handleAutoFillDataClubes = () => {
    const webview = dataclubesWebviewRef.current;
    if (webview) {
      webview.executeJavaScript(`
        (function() {
          const userField = document.querySelector('input[name="login[usuario]"]');
          const passField = document.querySelector('input[name="login[clave]"]');
          const btn = document.querySelector('#submitLog');
          
          if (userField && passField) {
            userField.value = 'DO1902340';
            passField.value = 'Baez240080';
            
            // Trigger events to ensure frameworks pick up changes
            userField.dispatchEvent(new Event('input', { bubbles: true }));
            passField.dispatchEvent(new Event('input', { bubbles: true }));
            
            if (btn) {
               // Optional: Click automatically or just highlight
               btn.click();
            }
          } else {
            console.log('Inputs not found');
          }
        })();
      `);
    }
  };

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [showAccountSettings, setShowAccountSettings] = useState(false);
  const [showUserManagement, setShowUserManagement] = useState(false);
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [accountFormData, setAccountFormData] = useState({
    name: '',
    username: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    position: ''
  });
  const [accountErrors, setAccountErrors] = useState({});
  const [newUserFormData, setNewUserFormData] = useState({
    name: '',
    username: '',
    password: '',
    confirmPassword: '',
    position: '',
    role: 'user',
    allowedModules: []
  });
  const [newUserErrors, setNewUserErrors] = useState({});

  // Users database (including admin and other users)
  const [users, setUsers] = useState([
    {
      username: 'soybaex',
      password: 'Baez240080',
      role: 'administrator',
      name: 'Administrator',
      position: 'Director'
    }
  ]);

  // Admin credentials (reference to main admin)
  const [adminUser, setAdminUser] = useState(users[0]);

  // Members state
  const [members, setMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [memberSortField, setMemberSortField] = useState('firstName');
  const [memberSortOrder, setMemberSortOrder] = useState('asc');
  const [memberViewMode, setMemberViewMode] = useState('table'); // 'table' or 'grid'
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  // Tab System State
  const [tabs, setTabs] = useState([{ id: 1, module: 'dashboard', label: 'Inicio', icon: Home }]);
  const [activeTabId, setActiveTabId] = useState(1);

  // Derived active module from current tab
  const activeModule = tabs.find(t => t.id === activeTabId)?.module || 'dashboard';

  // Helper to update current tab (maintaining compatibility with existing SetActiveModule calls)
  const setActiveModule = (moduleId) => {
    // Find label and icon from menuItems if possible (needs menuItems defined, or lookup)
    // Since menuItems is defined later, we might need a lookup helper or just basic logic
    let label = 'Módulo';
    let Icon = FileText;

    // Simple lookup based on ID (we can refine this)
    if (moduleId === 'dashboard') { label = 'Inicio'; Icon = Home; }
    else if (moduleId === 'dataclubes') { label = 'DataClubes'; Icon = Globe; }
    else if (moduleId === 'members') { label = 'Miembros'; Icon = Users; }
    else if (moduleId === 'finances') { label = 'Finanzas'; Icon = DollarSign; }
    else if (moduleId === 'activities') { label = 'Calendario'; Icon = Calendar; }
    else if (moduleId === 'inventory') { label = 'Inventario'; Icon = Package; }
    else if (moduleId === 'directive') { label = 'Directiva'; Icon = Award; }
    else if (moduleId === 'profile') { label = 'Perfil'; Icon = UserPlus; }
    else if (moduleId === 'cleaning') { label = 'Limpieza'; Icon = RefreshCw; }
    else { label = moduleId.charAt(0).toUpperCase() + moduleId.slice(1); }

    setTabs(prev => prev.map(t =>
      t.id === activeTabId
        ? { ...t, module: moduleId, label, icon: Icon }
        : t
    ));
  };

  const handleAddTab = () => {
    const newId = Date.now();
    setTabs(prev => [...prev, { id: newId, module: 'dashboard', label: 'Inicio', icon: Home }]);
    setActiveTabId(newId);
  };

  const handleCloseTab = (e, tabId) => {
    e.stopPropagation();
    if (tabs.length === 1) return; // Don't close last tab

    const newTabs = tabs.filter(t => t.id !== tabId);
    setTabs(newTabs);

    if (activeTabId === tabId) {
      setActiveTabId(newTabs[newTabs.length - 1].id);
    }
  };
  const [transactions, setTransactions] = useState([]);
  const [expandedMenus, setExpandedMenus] = useState({}); // { menuId: boolean }
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // PREVENT ACCIDENTAL RELOADS/CLOSES
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = ''; // Chrome requires this to be set
      return '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  const [resolvingTransaction, setResolvingTransaction] = useState(null); // Transaction being resolved (debt)
  const [showFinanceForm, setShowFinanceForm] = useState(false);
  const [showMonthlyReport, setShowMonthlyReport] = useState(false);
  const [showCategoryReport, setShowCategoryReport] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [financeCategories, setFinanceCategories] = useState([
    { id: 'inc_1', name: 'Cuotas', type: 'income' },
    { id: 'inc_2', name: 'Donaciones', type: 'income' },
    { id: 'inc_3', name: 'Eventos', type: 'income' },
    { id: 'exp_1', name: 'Materiales', type: 'expense' },
    { id: 'exp_2', name: 'Alimentos', type: 'expense' },
    { id: 'exp_3', name: 'Transporte', type: 'expense' }
  ]);
  const [financeFormData, setFinanceFormData] = useState({
    type: 'income',
    category: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    paymentMethod: '',
    memberId: '',
    responsibleId: '', // For expenses: Directive member responsible
    receipt: '', // Base64 string of the receipt (image/pdf)
    status: 'official' // 'official' or 'pending_receipt'
  });
  const [financeErrors, setFinanceErrors] = useState({});
  const [showGroupPaymentForm, setShowGroupPaymentForm] = useState(false);
  const [groupPaymentData, setGroupPaymentData] = useState({
    categoryId: '',
    date: new Date().toISOString().split('T')[0],
    amount: '',
    description: '',
    paymentMethod: 'Cash',
    selectedMembers: [] // Array of member IDs
  });
  const [groupPaymentSearchTerm, setGroupPaymentSearchTerm] = useState('');

  // Activities state
  const [activities, setActivities] = useState([]);
  const [cleaningSchedule, setCleaningSchedule] = useState([]); // [{ id, month, supervisorId, weeks: [] }]
  const [activityTab, setActivityTab] = useState('events'); // 'events' or 'cleaning'
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);

  // Points state
  const [points, setPoints] = useState([]);
  const [selectedPointsMonth, setSelectedPointsMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM format
  const [editingPoints, setEditingPoints] = useState(null);
  const [selectedSaturday, setSelectedSaturday] = useState('');
  const [lockedSaturdays, setLockedSaturdays] = useState([]); // Array of locked saturday dates

  // Units state
  const [units, setUnits] = useState([]);
  const [showUnitForm, setShowUnitForm] = useState(false);
  const [editingUnit, setEditingUnit] = useState(null);
  const [unitFormData, setUnitFormData] = useState({
    name: '',
    logo: '',
    clubType: 'conquistadores', // 'aventureros', 'conquistadores', 'guias'
    gender: 'Mixed', // 'Male', 'Female', 'Mixed'
    captainId: '',
    secretaryId: ''
  });

  // Inventory state
  const [inventory, setInventory] = useState([]);
  const [showInventoryForm, setShowInventoryForm] = useState(false);
  const [editingInventoryItem, setEditingInventoryItem] = useState(null);
  const [inventoryFormData, setInventoryFormData] = useState({
    name: '',
    category: '',
    quantity: '',
    condition: 'Good',
    location: '',
    description: '',
    photo: ''
  });
  const [inventoryErrors, setInventoryErrors] = useState({});
  const [inventoryTab, setInventoryTab] = useState('general'); // 'general', 'tents', 'loans'
  const [loans, setLoans] = useState([]);
  const [showLoanForm, setShowLoanForm] = useState(false);
  const [loanFormData, setLoanFormData] = useState({
    itemId: '',
    memberId: '',
    borrowerType: 'member', // 'member' or 'external'
    externalName: '',
    loanDate: new Date().toISOString().split('T')[0],
    expectedReturnDate: '',
    notes: ''
  });

  // Data Safety State
  const [dataLoaded, setDataLoaded] = useState(false);

  // Communication Module State
  const [whatsappGroups, setWhatsappGroups] = useState([
    { id: '1', name: 'Directiva', link: 'https://chat.whatsapp.com/example1', description: 'Canal oficial para líderes' },
    { id: '2', name: 'Padres', link: '', description: 'Comunicados para padres' },
    { id: '3', name: 'Aventureros', link: '', description: 'Grupo general para niños pequeños' },
    { id: '4', name: 'Conquistadores', link: '', description: 'Grupo para adolescentes' },
    { id: '5', name: 'Guías Mayores', link: '', description: 'Liderazgo avanzado' },
  ]);
  const [editingGroup, setEditingGroup] = useState(null); // For editing WhatsApp group links

  const messageTemplates = [
    { id: 'payment', title: 'Recordatorio de Pago', icon: 'DollarSign', text: 'Hola {name}, te recordamos que tienes un pago pendiente de cuota. Por favor regularizarlo pronto. Bendiciones.' },
    { id: 'meeting', title: 'Recordatorio de Reunión', icon: 'Bell', text: 'Hola {name}, recuerda nuestra reunión del club este sábado a las 3:00 PM. No faltes!' },
    { id: 'absence', title: 'Notificación de Ausencia', icon: 'UserMinus', text: 'Hola {name}, notamos tu ausencia en la última reunión. Esperamos verte la próxima semana.' }
  ];
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [customMessage, setCustomMessage] = useState('');




  // Tents state
  const [tents, setTents] = useState([]);
  const [tentAssignments, setTentAssignments] = useState({}); // { activityId: { tentId: [memberIds] } }
  const [showTentForm, setShowTentForm] = useState(false);
  const [editingTent, setEditingTent] = useState(null);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [currentAssignmentTent, setCurrentAssignmentTent] = useState(null);
  const [tentFormData, setTentFormData] = useState({
    name: '',
    capacity: 4,
    condition: 'Good',
    brand: '',
    color: '',
    photo: ''
  });
  const [selectedActivityForAssignment, setSelectedActivityForAssignment] = useState('');
  const [inventoryCategories, setInventoryCategories] = useState([
    'Camping Gear', 'Cooking', 'Uniforms', 'Electronics', 'Furniture', 'Flags/Banners', 'Other'
  ]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategory, setNewCategory] = useState('');

  // Uniformity Module State
  const [uniformityTab, setUniformityTab] = useState('inspection'); // 'inspection', 'inventory', 'settings'
  const [inspectionViewMode, setInspectionViewMode] = useState('dashboard'); // 'dashboard', 'selection', 'list'
  const [selectedInspectionGroup, setSelectedInspectionGroup] = useState('all'); // 'all', 'directive', 'juniors', 'masters'
  const [uniformInspections, setUniformInspections] = useState([]);
  const [memberUniforms, setMemberUniforms] = useState({}); // { memberId: { shirtSize: 'M', pantsSize: '10', hasScarf: true, ... } }
  const [uniformItems, setUniformItems] = useState([
    { id: '1', label: 'Pañoleta', category: 'Accesorios', price: 0, gender: 'Unisex', onlyForDirective: false },
    { id: '2', label: 'Arillo', category: 'Accesorios', price: 0, gender: 'Unisex', onlyForDirective: false },
    { id: '3', label: 'Camisa', category: 'Uniforme', price: 0, gender: 'Unisex', onlyForDirective: false },
    { id: '4', label: 'Pantalón/Falda', category: 'Uniforme', price: 0, gender: 'Unisex', onlyForDirective: false },
    { id: '5', label: 'Faja', category: 'Accesorios', price: 0, gender: 'Unisex', onlyForDirective: false },
    { id: '6', label: 'Banda', category: 'Accesorios', price: 0, gender: 'Unisex', onlyForDirective: false },
    { id: '7', label: 'Zapatos Negros', category: 'Calzado', price: 0, gender: 'Unisex', onlyForDirective: false },
    // Directive specifics
    { id: '8', label: 'Corbata/Corbatín', category: 'Accesorios', price: 0, gender: 'Unisex', onlyForDirective: true },
    { id: '9', label: 'Saco', category: 'Uniforme', price: 0, gender: 'Unisex', onlyForDirective: true },
  ]);
  const [uniformCategories, setUniformCategories] = useState(['Uniforme', 'Accesorios', 'Calzado']);
  const [showUniformCategoryModal, setShowUniformCategoryModal] = useState(false);
  const [newUniformCategory, setNewUniformCategory] = useState('');
  const [showItemForm, setShowItemForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [itemFormData, setItemFormData] = useState({ label: '', category: 'Gala', price: 0, gender: 'Unisex', hasVariants: false, variants: [], sizeType: 'none' });

  // ID Cards State
  const [selectedForIdCard, setSelectedForIdCard] = useState([]);

  // Helper: Get next Saturday for default date
  const getNextSaturday = () => {
    const d = new Date();
    d.setDate(d.getDate() + (6 - d.getDay() + 7) % 7);
    return d.toISOString().split('T')[0];
  };

  // Cleaning Schedule Generator
  const generateCleaningSchedule = (startDate, monthsToGenerate = 1) => {
    // 1. Get pool of assignable members (Conquistadores only, maybe verify age/class?)
    // Filter active members and separate by gender
    // EXCLUDE DIRECTIVE MEMBERS (Board) who are 18+ years old
    // Younger directive members (under 18) should still participate in cleaning
    const getMemberAge = (m) => {
      if (!m.dateOfBirth) return 0;
      const dob = new Date(m.dateOfBirth);
      if (isNaN(dob.getTime())) return 0;
      const ageDifMs = Date.now() - dob.getTime();
      const ageDate = new Date(ageDifMs);
      return Math.abs(ageDate.getUTCFullYear() - 1970);
    };

    const eligibleMembers = members.filter(m => {
      if (!m.gender) return false;
      const pos = m.position || '';

      // Regular members (no position or explicitly "Member"/"Miembro") are always eligible
      if (pos === '' || pos === 'Member' || pos === 'Miembro') {
        return true;
      }

      // Directive members: only exclude if 18+ years old
      const age = getMemberAge(m);
      return age < 18;
    });
    const males = eligibleMembers.filter(m => m.gender === 'Male' || m.gender === 'M');
    const females = eligibleMembers.filter(m => m.gender === 'Female' || m.gender === 'F');

    if (males.length < 2 || females.length < 2) {
      alert('No hay suficientes varones o hembras para generar la rotación (mínimo 2 de cada uno).');
      return;
    }

    let start = new Date(startDate);
    const newSchedule = []; // Array of months

    // State for round-robin rotation (indices)
    let maleIndex = 0;
    let femaleIndex = 0;

    // Helper to get next 2 members
    const getNextMembers = (list, currentIndex) => {
      const selection = [];
      for (let i = 0; i < 2; i++) {
        selection.push(list[(currentIndex + i) % list.length].id);
      }
      return { selection, nextIndex: (currentIndex + 2) % list.length };
    };

    for (let i = 0; i < monthsToGenerate; i++) {
      const monthDate = new Date(start);
      monthDate.setMonth(start.getMonth() + i);
      const monthKey = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}`;

      const weeksInMonth = [];

      // Calculate weeks for this month
      // Allow partial weeks? Let's say a "week" belongs to the month its Wednesday falls in.
      const currentIterDate = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);

      // Find first Wednesday or Friday
      // Simple approach: Iterate days of month, grouping Mon-Sun
      // Actually per requirements: "Wednesday and Friday"

      // Iterate through the month day by day
      // We need to define "Weeks". Let's say Week starts on Monday.

      const lastDayOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
      let weekStart = new Date(currentIterDate);

      // Adjust to Monday
      const day = weekStart.getDay();
      const diff = weekStart.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
      weekStart.setDate(diff); // This is the Monday of the first week overlapping this month

      while (weekStart <= lastDayOfMonth) {
        // Check if this week has Wed/Fri in THIS month
        const wednesday = new Date(weekStart);
        wednesday.setDate(weekStart.getDate() + 2);

        const friday = new Date(weekStart);
        friday.setDate(weekStart.getDate() + 4);

        const wedInMonth = wednesday.getMonth() === monthDate.getMonth();
        const friInMonth = friday.getMonth() === monthDate.getMonth();

        // If at least one cleaning day is in this month, add it
        if (wedInMonth || friInMonth) {
          const mSelection = getNextMembers(males, maleIndex);
          const fSelection = getNextMembers(females, femaleIndex);
          maleIndex = mSelection.nextIndex;
          femaleIndex = fSelection.nextIndex;

          weeksInMonth.push({
            id: Date.now() + Math.random().toString(),
            weekRange: `${wednesday.getDate()}/${wednesday.getMonth() + 1} (Mié) - ${friday.getDate()}/${friday.getMonth() + 1} (Vie)`,
            team: [...mSelection.selection, ...fSelection.selection],
            completed: false
          });
        }

        // Next week
        weekStart.setDate(weekStart.getDate() + 7);
        // Safety break to prevent infinite loops if logic fails
        if (weekStart.getFullYear() > monthDate.getFullYear() + 1) break;
      }

      newSchedule.push({
        id: Date.now() + i,
        month: monthKey,
        supervisorId: '', // To be filled manually
        weeks: weeksInMonth
      });
    }

    setCleaningSchedule(prev => {
      // Merge or replace? Let's append new months, avoiding duplicates
      const filtered = prev.filter(s => !newSchedule.some(ns => ns.month === s.month));
      return [...filtered, ...newSchedule].sort((a, b) => a.month.localeCompare(b.month));
    });

    alert('Cronograma de limpieza generado exitosamente.');
  };

  const handleAutoFillUnits = () => {
    if (!window.confirm('¿Estás seguro de reasignar AUTOMÁTICAMENTE a todos los miembros? Esto borrará las asignaciones actuales de unidades.')) {
      return;
    }

    // 1. Clear current assignments
    const clearedMembers = members.map(m => ({ ...m, unitId: '', unitRole: '' }));

    // 2. Define Age Groups
    const AVENTUREROS_RANGE = { min: 4, max: 9 };
    const CONQUISTADORES_RANGE = { min: 10, max: 15 };
    const GUIAS_RANGE = { min: 16, max: 99 };

    // 3. Filter members by age and gender
    const getAge = (dob) => {
      if (!dob) return 0;
      const diff = Date.now() - new Date(dob).getTime();
      return Math.abs(new Date(diff).getUTCFullYear() - 1970);
    };

    const aventureros = clearedMembers.filter(m => {
      const age = getAge(m.dateOfBirth);
      return age >= AVENTUREROS_RANGE.min && age <= AVENTUREROS_RANGE.max;
    });

    const conquistadores = clearedMembers.filter(m => {
      const age = getAge(m.dateOfBirth);
      return age >= CONQUISTADORES_RANGE.min && age <= CONQUISTADORES_RANGE.max;
    });

    const guias = clearedMembers.filter(m => {
      const age = getAge(m.dateOfBirth);
      return age >= GUIAS_RANGE.min;
    });

    // 4. Helper to distribute members into units
    const distribute = (pool, clubType) => {
      // Find existing units of this type
      const availableUnits = units.filter(u => u.clubType === clubType);

      if (availableUnits.length === 0) return pool; // No units to assign to

      // Separate pool by gender
      const males = pool.filter(m => m.gender === 'Male' || m.gender === 'M');
      const females = pool.filter(m => m.gender === 'Female' || m.gender === 'F');

      let updatedPool = [];

      // Assign Males
      const maleUnits = availableUnits.filter(u => u.gender === 'Male' || u.gender === 'Mixed');
      if (maleUnits.length > 0) {
        males.forEach((m, index) => {
          const targetUnit = maleUnits[index % maleUnits.length];
          updatedPool.push({ ...m, unitId: targetUnit.id });
        });
      } else {
        updatedPool = [...updatedPool, ...males];
      }

      // Assign Females
      const femaleUnits = availableUnits.filter(u => u.gender === 'Female' || u.gender === 'Mixed');
      if (femaleUnits.length > 0) {
        females.forEach((m, index) => {
          const targetUnit = femaleUnits[index % femaleUnits.length];
          updatedPool.push({ ...m, unitId: targetUnit.id });
        });
      } else {
        updatedPool = [...updatedPool, ...females];
      }

      return updatedPool;
    };

    // 5. Execute distribution
    const newAventureros = distribute(aventureros, 'aventureros');
    const newConquistadores = distribute(conquistadores, 'conquistadores');
    // For Guías, maybe we don't auto-assign or do same logic
    const newGuias = distribute(guias, 'guias');

    // 6. Merge back
    // Any member not in these lists (e.g. unknown age) stays cleared
    const processedIds = new Set([...newAventureros, ...newConquistadores, ...newGuias].map(m => m.id));
    const others = clearedMembers.filter(m => !processedIds.has(m.id));

    const finalMembers = [...newAventureros, ...newConquistadores, ...newGuias, ...others];

    setMembers(finalMembers);
    alert('Asignación automática completada. Se han distribuido los miembros por edad y género.');
  };

  const handleClearAllSchedules = () => {
    if (window.confirm('¿Estás seguro de eliminar TODOS los itinerarios de limpieza? Esta acción no se puede deshacer.')) {
      setCleaningSchedule([]);
    }
  };

  const [bgDate, setBgDate] = useState(new Date().toISOString().split('T')[0]);

  // Profile View State
  const [viewingMember, setViewingMember] = useState(null);
  const [lastActiveModule, setLastActiveModule] = useState('dashboard');

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [activityFormData, setActivityFormData] = useState({
    title: '',
    type: '',
    date: '',
    time: '',
    location: '',
    description: '',
    uniform: '',
    cost: '',
    transportation: '',
    meetingPoint: '',
    isRanking: false,
    rankingScore: '',
    rankingDeadline: '',
    attendees: [],
    status: 'Pendiente', // Pendiente, En curso, Completado
    endDate: '',
    endTime: '', // Optional end time
    originalDate: '' // Track original date for postponements
  });
  const [activityErrors, setActivityErrors] = useState({});

  // Auto-update activity status logic
  useEffect(() => {
    const updateActivityStatuses = () => {
      const now = new Date();

      const updatedActivities = activities.map(activity => {
        // If already Completed, don't touch it
        if (activity.status === 'Completado') return activity;

        const startDateTime = new Date(`${activity.date}T${activity.time || '00:00'}`);
        const endDateTime = new Date(`${activity.endDate || activity.date}T${activity.endTime || '23:59'}`);

        // Check window
        if (now >= startDateTime && now <= endDateTime) {
          if (activity.status !== 'En curso') {
            return { ...activity, status: 'En curso' };
          }
        } else {
          // If currently 'En curso' but outside window, what to do?
          // If before window, revert to Pendiente?
          // If after window... logic says "Pendiente" or stay "En curso"?
          // User request implies "Automatic if matches", so if it DOESN'T match, it shouldn't be En curso?
          // "Quiero que el estado 'En curso' no pueda ponerse de forma manual. Que sea de forma automática si la fecha y hora coinciden"
          // So if they don't coincide, it shouldn't be "En curso".
          if (activity.status === 'En curso') {
            if (now < startDateTime) return { ...activity, status: 'Pendiente' };
            // If now > endDateTime, it's just past. Maybe leave as En curso or Pendiente?
            // Usually past activities stay pending until marked completed.
            // Let's safe-guard: If it WAS 'En curso' effectively auto-started, but now time passed,
            // it technically isn't "En curso" blindly. But maybe user forgot to close it.
            // Let's leave it as 'En curso' if it's passed, or revert to 'Pendiente'.
            // Safest adherence to "Automatic if matches": If not matches, not En curso.
            // But changing 'En curso' to 'Pendiente' after event finishes feels wrong.
            // Let's only force 'En curso' if matches. If it doesn't match, we don't force UNLESS it was premature.
          }
        }
        return activity;
      });

      // Only update state if there are changes
      const hasChanges = JSON.stringify(updatedActivities) !== JSON.stringify(activities);
      if (hasChanges) {
        setActivities(updatedActivities);
      }
    };

    // Check every minute
    const interval = setInterval(() => {
      if (activities.length > 0) updateActivityStatuses();
    }, 60000);

    // Also run immediately
    if (activities.length > 0) updateActivityStatuses();

    return () => clearInterval(interval);
  }, [activities]); // Re-bind if activities list changes length/content to ensure fresh closure

  // Cuotas state
  const [cuotaPayments, setCuotaPayments] = useState([]);
  const [selectedCuotaDate, setSelectedCuotaDate] = useState(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 6);
    const saturday = new Date(today.setDate(diff));
    return saturday.toISOString().split('T')[0];
  });
  const [cuotaSessionActive, setCuotaSessionActive] = useState(false);
  const [viewDate, setViewDate] = useState(new Date()); // For navigating months in the picker
  const [showDebtReport, setShowDebtReport] = useState(false);
  const [showLatePaymentForm, setShowLatePaymentForm] = useState(false);
  const [latePaymentMember, setLatePaymentMember] = useState(null);
  const [cuotaAmount, setCuotaAmount] = useState(50); // Monto semanal predeterminado
  const [duesStartDate, setDuesStartDate] = useState(''); // Fecha de inicio de cobro de cuotas
  const [skippedSaturdays, setSkippedSaturdays] = useState([]); // Sábados excluidos del cobro
  const [showDuesSettings, setShowDuesSettings] = useState(false);
  const [bulkPayments, setBulkPayments] = useState({}); // { memberId: amount }
  const [masterGuideData, setMasterGuideData] = useState({
    requirements: [],
    progress: {}, // memberId -> { requirementId: { completed: boolean, date: string } }
    evaluationDates: { first: '', second: '', third: '' }
  });
  const [editingRequirement, setEditingRequirement] = useState(null);
  const [viewingGMDetail, setViewingGMDetail] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    age: '',
    bloodType: '',
    gender: '',
    address: '',
    primaryContact: '',
    fatherName: '',
    fatherContact: '',
    motherName: '',
    motherContact: '',
    religion: '',
    baptismDate: '',
    photo: '',
    position: '', // Position in the board of directors
    pathfinderClass: '', // Pathfinder class level
    isMasterGuideCandidate: false, // Additional check for Master Guide Candidate
    unitId: '', // Unit assignment
    unitRole: '', // Role in unit (Captain, Secretary, or empty)
    // Medical fields
    allergies: '',
    medicalCondition: '',
    conditionMedications: '',
    continuousMedications: '',
    emergencyContactName: '',
    emergencyContactRelationship: '',
    emergencyContactPhone: '',
    useParentAsEmergency: 'none', // 'father', 'mother', or 'none'
    doctorName: '',
    doctorPhone: '',
    insuranceProvider: '',
    insuranceNumber: '',
    specialNotes: '',
    // Achievements
    achievements: [] // Array of { achievementId, dateObtained }
  });
  const [errors, setErrors] = useState({});

  // Qualifications State
  const [qualifications, setQualifications] = useState([]); // { memberId: { year: { isAdvanced: bool, scores: {...} } } }
  const [selectedQualificationYear, setSelectedQualificationYear] = useState(new Date().getFullYear());

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const [whatsappUrl, setWhatsappUrl] = useState('https://web.whatsapp.com');

  const pathfinderClasses = [
    { value: 'Friend', label: 'Amigo', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-800' },
    { value: 'Companion', label: 'Compañero', color: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-300 dark:border-red-800' },
    { value: 'Explorer', label: 'Explorador', color: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-300 dark:border-green-800' },
    { value: 'Ranger', label: 'Orientador', color: 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 border-gray-300 dark:border-gray-600' },
    { value: 'Voyager', label: 'Viajero', color: 'bg-rose-100 dark:bg-rose-900/30 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800' },
    { value: 'Guide', label: 'Guía', color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border-yellow-300 dark:border-yellow-800' },
    { value: 'Master Guide', label: 'Aspirante a Guía Mayor', color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800' },
    { value: 'Master Guide Advanced', label: 'Guía Mayor Investido', color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 border-orange-300 dark:border-orange-800' }
  ];

  // Achievements structure
  const availableAchievements = [
    // Regular Classes
    { id: 'friend', name: 'Friend', nameES: 'Amigo', category: 'class', level: 1, color: 'bg-blue-500' },
    { id: 'companion', name: 'Companion', nameES: 'Compañero', category: 'class', level: 2, color: 'bg-red-500' },
    { id: 'explorer', name: 'Explorer', nameES: 'Explorador', category: 'class', level: 3, color: 'bg-green-500' },
    { id: 'ranger', name: 'Ranger', nameES: 'Orientador', category: 'class', level: 4, color: 'bg-gray-500' },
    { id: 'voyager', name: 'Voyager', nameES: 'Viajero', category: 'class', level: 5, color: 'bg-rose-500' },
    { id: 'guide', name: 'Guide', nameES: 'Guía', category: 'class', level: 6, color: 'bg-yellow-500' },

    // Advanced Classes (with bars)
    { id: 'friend-advanced', name: 'Friend Advanced', nameES: 'Amigo Avanzado', category: 'class-advanced', level: 1, color: 'bg-blue-600', includesBar: true },
    { id: 'companion-advanced', name: 'Companion Advanced', nameES: 'Compañero Avanzado', category: 'class-advanced', level: 2, color: 'bg-red-600', includesBar: true },
    { id: 'explorer-advanced', name: 'Explorer Advanced', nameES: 'Explorador Avanzado', category: 'class-advanced', level: 3, color: 'bg-green-600', includesBar: true },
    { id: 'ranger-advanced', name: 'Ranger Advanced', nameES: 'Orientador Avanzado', category: 'class-advanced', level: 4, color: 'bg-gray-600', includesBar: true },
    { id: 'voyager-advanced', name: 'Voyager Advanced', nameES: 'Viajero Avanzado', category: 'class-advanced', level: 5, color: 'bg-rose-600', includesBar: true },
    { id: 'guide-advanced', name: 'Guide Advanced', nameES: 'Guía Avanzado', category: 'class-advanced', level: 6, color: 'bg-yellow-600', includesBar: true },

    // Maximum Achievement
    { id: 'master-guide', name: 'Master Guide', nameES: 'Guía Mayor', category: 'master', level: 7, color: 'bg-purple-600' },

    // Medals
    { id: 'medal-silver', name: 'Silver Medal', nameES: 'Medallón de Plata', category: 'medal', color: 'bg-gray-300 text-gray-800' },
    { id: 'medal-gold', name: 'Gold Medal', nameES: 'Medallón de Oro', category: 'medal', color: 'bg-yellow-400 text-yellow-900' },

    // Special Bars
    { id: 'bar-excellence', name: 'Excellence Bar', nameES: 'Barra de Excelencia', category: 'bar', color: 'bg-indigo-500' },
    { id: 'bar-march', name: 'March Bar', nameES: 'Barra de Marcha', category: 'bar', color: 'bg-teal-500' },
    { id: 'bar-bible', name: 'Bible Bar', nameES: 'Barra de Biblia', category: 'bar', color: 'bg-amber-600' }
  ];

  // Phone formatter helper
  const formatPhone = (value) => {
    if (!value) return '';
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 1) return `+${numbers}`;
    if (numbers.length <= 4) return `+${numbers.slice(0, 1)} (${numbers.slice(1)}`;
    if (numbers.length <= 7) return `+${numbers.slice(0, 1)} (${numbers.slice(1, 4)}) ${numbers.slice(4)}`;
    return `+${numbers.slice(0, 1)} (${numbers.slice(1, 4)}) ${numbers.slice(4, 7)} - ${numbers.slice(7, 11)}`;
  };


  // ========================================
  // STORAGE SYSTEM - LocalStorage + Firebase Ready
  // ========================================

  // Storage keys
  // Storage keys
  const STORAGE_KEYS = {
    MEMBERS: 'clubvencedores_members',
    TRANSACTIONS: 'clubvencedores_transactions',
    ACTIVITIES: 'clubvencedores_activities',
    POINTS: 'clubvencedores_points',
    LOCKED_SATURDAYS: 'clubvencedores_locked_saturdays',
    UNITS: 'clubvencedores_units',
    USERS: 'clubvencedores_users',
    INVENTORY: 'clubvencedores_inventory',
    CUOTA_AMOUNT: 'clubvencedores_cuota_amount',
    MASTER_GUIDE: 'clubvencedores_master_guide',
    FINANCE_CATEGORIES: 'clubvencedores_finance_categories',
    DUES_CONFIG: 'clubvencedores_dues_config',
    TENTS: 'clubvencedores_tents',
    TENT_ASSIGNMENTS: 'clubvencedores_tent_assignments',
    QUALIFICATIONS: 'clubvencedores_qualifications',
    CLEANING_SCHEDULE: 'clubvencedores_cleaning_schedule',
    CLUB_SETTINGS: 'clubvencedores_settings'
  };

  const [clubSettings, setClubSettings] = useState({
    name: 'Unity Club',
    logo: '' // empty string = default logo
  });




  // Load data from Electron Storage
  // Load data from Electron Storage
  const loadFromStorage = async () => {
    try {
      let data = {};

      // 1. Try Electron Storage first
      if (window.electronAPI) {
        data = await window.electronAPI.readData();
      }

      // 2. Fallback to LocalStorage if Electron data is empty (or new install)
      // Check if critical data is missing (e.g., members)
      if (!data.members || data.members.length === 0) {
        console.log('⚠️ Electron storage empty, checking localStorage fallback...');

        const localMembers = localStorage.getItem(STORAGE_KEYS.MEMBERS);
        if (localMembers) {
          console.log('✅ Found data in localStorage! Migrating...');
          data.members = JSON.parse(localMembers);
          // Load other keys...
          if (localStorage.getItem(STORAGE_KEYS.TRANSACTIONS)) data.transactions = JSON.parse(localStorage.getItem(STORAGE_KEYS.TRANSACTIONS));
          if (localStorage.getItem(STORAGE_KEYS.ACTIVITIES)) data.activities = JSON.parse(localStorage.getItem(STORAGE_KEYS.ACTIVITIES));
          if (localStorage.getItem(STORAGE_KEYS.POINTS)) data.points = JSON.parse(localStorage.getItem(STORAGE_KEYS.POINTS));
          if (localStorage.getItem(STORAGE_KEYS.LOCKED_SATURDAYS)) data.lockedSaturdays = JSON.parse(localStorage.getItem(STORAGE_KEYS.LOCKED_SATURDAYS));
          if (localStorage.getItem(STORAGE_KEYS.UNITS)) data.units = JSON.parse(localStorage.getItem(STORAGE_KEYS.UNITS));
          if (localStorage.getItem(STORAGE_KEYS.USERS)) data.users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS));
          if (localStorage.getItem(STORAGE_KEYS.INVENTORY)) data.inventory = JSON.parse(localStorage.getItem(STORAGE_KEYS.INVENTORY));
          if (localStorage.getItem(STORAGE_KEYS.CUOTA_AMOUNT)) data.cuotaAmount = JSON.parse(localStorage.getItem(STORAGE_KEYS.CUOTA_AMOUNT));
          if (localStorage.getItem(STORAGE_KEYS.MASTER_GUIDE)) data.masterGuideData = JSON.parse(localStorage.getItem(STORAGE_KEYS.MASTER_GUIDE));
          if (localStorage.getItem(STORAGE_KEYS.FINANCE_CATEGORIES)) data.financeCategories = JSON.parse(localStorage.getItem(STORAGE_KEYS.FINANCE_CATEGORIES));
          if (localStorage.getItem(STORAGE_KEYS.TENTS)) data.tents = JSON.parse(localStorage.getItem(STORAGE_KEYS.TENTS));
          if (localStorage.getItem(STORAGE_KEYS.TENT_ASSIGNMENTS)) data.tentAssignments = JSON.parse(localStorage.getItem(STORAGE_KEYS.TENT_ASSIGNMENTS));
          if (localStorage.getItem(STORAGE_KEYS.CLEANING_SCHEDULE)) data.cleaningSchedule = JSON.parse(localStorage.getItem(STORAGE_KEYS.CLEANING_SCHEDULE));

          // Optional: Force save to Electron immediately to complete migration
          if (window.electronAPI) {
            await window.electronAPI.writeData(data);
            console.log('✅ Migrated localStorage data to Electron Storage');
          }
        }
      }

      return data;
    } catch (error) {
      console.error('Error loading data:', error);
      return {};
    }
  };

  // Save data to Electron Storage
  const saveToElectron = async (dataToSave) => {
    try {
      if (window.electronAPI) {
        await window.electronAPI.writeData(dataToSave);
        console.log('✅ Datos guardados en Electron Storage');
      }
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  // Export all data as JSON
  const exportAllData = () => {
    try {
      console.log('Starting backup...');

      // Function to handle circular references and large base64 images
      const seen = new WeakSet();
      const replacer = (key, value) => {
        // Handle circular references
        if (typeof value === "object" && value !== null) {
          if (seen.has(value)) {
            return '[Circular]';
          }
          seen.add(value);
        }

        // Optionally truncate very large base64 images to prevent memory issues
        // You can comment out these lines if you want to keep all photos
        if (key === 'photo' && typeof value === 'string' && value.startsWith('data:image')) {
          // Keep photos but log their size
          console.log(`Tamaño de foto: ${Math.round(value.length / 1024)}KB`);
        }

        return value;
      };

      const allData = {
        members: members || [],
        transactions: transactions || [],
        activities: activities || [],
        points: points || [],
        lockedSaturdays: lockedSaturdays || [],
        units: units || [],
        users: users || [],
        inventory: inventory || [],
        cuotaAmount: cuotaAmount || 50,
        masterGuideData: masterGuideData || { requirements: [], progress: {}, evaluationDates: { first: '', second: '', third: '' } },
        financeCategories: financeCategories || [],
        tents: tents || [],
        tentAssignments: tentAssignments || {},
        cleaningSchedule: cleaningSchedule || [],
        exportDate: new Date().toISOString(),
        version: '1.0'
      };

      console.log('Data prepared, stringifying...');

      // Try to stringify with error handling
      let dataStr;
      try {
        dataStr = JSON.stringify(allData, replacer, 2);
      } catch (stringifyError) {
        console.error('Error during stringify:', stringifyError);

        // Try without photos if stringify fails
        if (window.confirm('Fallo al crear copia con fotos. ¿Intentar crear copia sin fotos?')) {
          const dataWithoutPhotos = {
            ...allData,
            members: (allData.members || []).map(m => ({ ...m, photo: m.photo ? '[Photo removed for backup]' : '' })),
            units: (allData.units || []).map(u => ({ ...u, logo: u.logo ? '[Logo removed for backup]' : '' }))
          };
          dataStr = JSON.stringify(dataWithoutPhotos, null, 2);
        } else {
          throw stringifyError;
        }
      }

      console.log(`Backup size: ${Math.round(dataStr.length / 1024)}KB`);

      // Create and download file
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `club-vencedores-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();

      // Clean up
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);

      console.log('✅ Copia de seguridad creada exitosamente');
      alert('✅ Copia de seguridad descargada exitosamente!');

    } catch (error) {
      console.error('Error creando copia de seguridad:', error);
      alert('❌ Error creando copia de seguridad: ' + error.message + '\n\nRevisar consola para detalles.');
    }
  };

  // Export without photos (lighter backup)
  const exportDataWithoutPhotos = () => {
    try {
      console.log('Starting backup without photos...');

      const allData = {
        members: (members || []).map(m => ({ ...m, photo: '' })),
        transactions: transactions || [],
        activities: activities || [],
        points: points || [],
        lockedSaturdays: lockedSaturdays || [],
        units: (units || []).map(u => ({ ...u, logo: '' })),
        users: users || [],
        inventory: inventory || [],
        cuotaAmount: cuotaAmount || 50,
        masterGuideData: masterGuideData || { requirements: [], progress: {}, evaluationDates: { first: '', second: '', third: '' } },

        financeCategories: financeCategories || [],
        tents: tents || [],
        tentAssignments: tentAssignments || {},
        exportDate: new Date().toISOString(),
        version: '1.0',
        note: 'Photos removed for lighter backup'
      };

      const dataStr = JSON.stringify(allData, null, 2);
      console.log(`Backup size (no photos): ${Math.round(dataStr.length / 1024)}KB`);

      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `club-vencedores-backup-no-photos-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();

      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);

      alert('✅ Backup (without photos) downloaded successfully!');

    } catch (error) {
      console.error('Error creando copia de seguridad:', error);
      alert('❌ Error creando copia de seguridad: ' + error.message);
    }
  };

  // Import data from JSON file
  const importAllData = (file) => {
    if (!file) {
      alert('❌ No se seleccionó archivo');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result);

        if (!importedData || typeof importedData !== 'object') {
          throw new Error('Invalid data format');
        }

        if (window.confirm('⚠️ This will replace ALL current data. Are you sure?')) {
          if (importedData.members) setMembers(importedData.members);
          if (importedData.transactions) setTransactions(importedData.transactions);
          if (importedData.activities) setActivities(importedData.activities);
          if (importedData.points) setPoints(importedData.points);
          if (importedData.lockedSaturdays) setLockedSaturdays(importedData.lockedSaturdays);
          if (importedData.units) setUnits(importedData.units);
          if (importedData.users) setUsers(importedData.users);
          if (importedData.inventory) setInventory(importedData.inventory);
          if (importedData.inventory) setInventory(importedData.inventory);
          if (importedData.cuotaAmount) setCuotaAmount(importedData.cuotaAmount);
          if (importedData.masterGuideData) setMasterGuideData(importedData.masterGuideData);
          if (importedData.masterGuideData) setMasterGuideData(importedData.masterGuideData);
          if (importedData.financeCategories) setFinanceCategories(importedData.financeCategories);
          if (importedData.tents) setTents(importedData.tents);
          if (importedData.tentAssignments) setTentAssignments(importedData.tentAssignments);
          if (importedData.cleaningSchedule) setCleaningSchedule(importedData.cleaningSchedule);

          console.log('✅ Data imported successfully');
          alert('✅ Data imported successfully!');
        }
      } catch (error) {
        console.error('Error importando datos:', error);
        alert('❌ Error importando datos: ' + error.message);
      }
    };
    reader.onerror = (error) => {
      console.error('Error leyendo archivo:', error);
      alert('❌ Error leyendo archivo');
    };
    reader.readAsText(file);
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2000000) { // 2MB limit
        alert('La imagen es muy grande. Máximo 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setClubSettings(prev => ({ ...prev, logo: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Clear all data
  const clearAllData = () => {
    if (window.confirm('⚠️ Esto ELIMINARÁ TODOS LOS DATOS permanentemente. ¿Estás absolutamente seguro?')) {
      if (window.confirm('⚠️ Última advertencia: TODOS los datos se perderán. ¿Continuar?')) {
        Object.values(STORAGE_KEYS).forEach(key => {
          localStorage.removeItem(key);
        });

        setMembers([]);
        setTransactions([]);
        setActivities([]);
        setCleaningSchedule([]);
        setPoints([]);
        setLockedSaturdays([]);
        setUnits([]);
        setUnits([]);
        setInventory([]);
        setTents([]);
        setTentAssignments({});

        alert('✅ Todos los datos eliminados!');
        window.location.reload();
      }
    }
  };



  // ========================================
  // PROFILE NAVIGATION HANDLERS
  // ========================================
  const handleViewProfile = (member) => {
    setViewingMember(member);
    setLastActiveModule(activeModule);
    setActiveModule('profile');
  };

  const handleBackFromProfile = () => {
    setViewingMember(null);
    setActiveModule(lastActiveModule);
  };

  // ========================================
  // TENT HANDLERS
  // ========================================
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('🔄 Cargando datos desde Electron Storage...');
        const allData = await loadFromStorage();

        if (allData.members) setMembers(allData.members);
        if (allData.transactions) setTransactions(allData.transactions);
        if (allData.activities) setActivities(allData.activities);
        if (allData.points) setPoints(allData.points);
        if (allData.lockedSaturdays) setLockedSaturdays(allData.lockedSaturdays);
        if (allData.units) setUnits(allData.units);
        if (allData.users) setUsers(allData.users);
        if (allData.inventory) setInventory(allData.inventory);
        if (allData.inventoryCategories && Array.isArray(allData.inventoryCategories)) {
          setInventoryCategories(allData.inventoryCategories);
        } else {
          setInventoryCategories(['Camping Gear', 'Cooking', 'Uniforms', 'Electronics', 'Furniture', 'Flags/Banners', 'Other']);
        }
        if (allData.cuotaAmount) setCuotaAmount(allData.cuotaAmount);
        if (allData.masterGuideData) setMasterGuideData(allData.masterGuideData);
        if (allData.financeCategories) setFinanceCategories(allData.financeCategories);
        if (allData.tents) setTents(allData.tents);
        if (allData.tentAssignments) setTentAssignments(allData.tentAssignments);
        if (allData.duesConfig) {
          setDuesStartDate(allData.duesConfig.startDate || '');
          setSkippedSaturdays(allData.duesConfig.skippedSaturdays || []);
        }
        if (allData.uniformInspections) setUniformInspections(allData.uniformInspections);
        if (allData.memberUniforms) setMemberUniforms(allData.memberUniforms);
        if (allData.uniformItems && Array.isArray(allData.uniformItems)) {
          setUniformItems(allData.uniformItems);
        }
        if (allData.uniformCategories && Array.isArray(allData.uniformCategories)) {
          setUniformCategories(allData.uniformCategories);
        }
        if (allData.qualifications) setQualifications(allData.qualifications);
        if (allData.clubSettings) setClubSettings(allData.clubSettings);

        setDataLoaded(true); // Enable auto-save now that we have loaded data
        console.log('✅ Data loaded successfully!');
      } catch (error) {
        console.error('❌ Error loading data:', error);
        // Optionally set an error state here to show a specific message
      }
    };

    fetchData();
  }, []); // Only run once on mount

  // ========================================
  // AUTO-SAVE DATA ON CHANGES
  // ========================================
  useEffect(() => {
    const saveData = async () => {
      // SAFETY CHECK: Only save if data has been successfully loaded from disk.
      // This prevents overwriting the file with empty state if the initial load failed.
      if (!dataLoaded) return;

      // Secondary check: ensure we at least have users (admin always exists)
      if (users.length === 0) return;

      const dataToSave = {
        members,
        transactions,
        activities,
        points,
        lockedSaturdays,
        units,
        users,
        inventory,
        cuotaAmount,
        masterGuideData,
        financeCategories,
        inventoryCategories,
        tents,
        tentAssignments,
        uniformInspections,
        memberUniforms,
        uniformItems,
        uniformCategories,
        clubSettings,
        duesConfig: {
          startDate: duesStartDate,
          skippedSaturdays
        },
        qualifications,
      };

      try {
        // SANITIZATION STEP:
        // Ensure data is purely JSON-serializable before sending to Electron/IPC.
        // This strips undefined, functions, and symbols which can crash the renderer.
        const cleanData = JSON.parse(JSON.stringify(dataToSave));
        await saveToElectron(cleanData);
      } catch (err) {
        console.error("Error sanitizing/saving data:", err);
      }
    };

    const debounceSave = setTimeout(saveData, 500); // Debounce saves (faster for draft feel)
    return () => clearTimeout(debounceSave);

  }, [members, transactions, activities, points, lockedSaturdays, units, users, cuotaAmount, inventory, inventoryCategories, masterGuideData, financeCategories, duesStartDate, skippedSaturdays, tents, tentAssignments, uniformInspections, memberUniforms, uniformItems, uniformCategories, clubSettings, qualifications]);

  // ========================================

  // Check if user has access to a module
  const hasModuleAccess = (moduleId) => {
    if (!currentUser) return false;
    if (currentUser.role === 'administrator' || currentUser.position === 'Director') return true;

    // Check for explicit allowedModules
    if (currentUser.allowedModules && Array.isArray(currentUser.allowedModules) && currentUser.allowedModules.length > 0) {
      return currentUser.allowedModules.includes(moduleId);
    }

    // Fallback to legacy position-based permissions
    const permissions = {
      'Subdirector': ['dashboard', 'members', 'directive', 'activities', 'inventory', 'idcards', 'ranking', 'communication'],
      'Secretary': ['dashboard', 'members', 'directive', 'parents', 'medical', 'classes', 'units', 'activities', 'ranking', 'inventory', 'settings', 'communication'],
      'Secretario': ['dashboard', 'members', 'directive', 'parents', 'medical', 'classes', 'units', 'activities', 'ranking', 'inventory', 'settings', 'communication'],
      'Treasurer': ['dashboard', 'finances', 'cuotas', 'inventory']
    };

    const userPermissions = permissions[currentUser.position] || [];
    return userPermissions.includes(moduleId);
  };

  // Navigation menu items
  const menuItems = [
    { id: 'dashboard', label: 'Inicio', icon: Home, available: true },
    { id: 'dataclubes', label: 'DataClubes', icon: Globe, available: true },
    {
      id: 'activities',
      label: 'Calendario',
      icon: Calendar,
      available: true,
      submenu: [
        { id: 'ranking', label: 'Ranking', icon: Trophy, available: true },
        { id: 'master_guide', label: 'Programa de Guía Mayor', icon: Award, available: true },
        { id: 'birthdays', label: 'Cumpleaños', icon: Gift, available: true },
        { id: 'cleaning', label: 'Limpieza', icon: RefreshCw, available: true }
      ]
    },
    { id: 'directive', label: 'Directiva', icon: Award, available: true },
    {
      id: 'members',
      label: 'Miembros',
      icon: Users,
      available: true,
      submenu: [
        { id: 'classes', label: 'Clases', icon: BookOpen, available: true },
        { id: 'units', label: 'Unidades', icon: Grid, available: true },
        { id: 'medical', label: 'Registros Médicos', icon: Heart, available: true },
        { id: 'parents', label: 'Padres', icon: UserPlus, available: true },
        { id: 'achievements', label: 'Galardones', icon: Award, available: true },
        { id: 'qualifications', label: 'Calificaciones', icon: BookOpen, available: true }
      ]
    },
    {
      id: 'finances',
      label: 'Finanzas',
      icon: DollarSign,
      available: true,
      submenu: [
        { id: 'cuotas', label: 'Cuotas Semanales', icon: Wallet, available: true }
      ]
    },
    {
      id: 'inventory',
      label: 'Inventario',
      icon: Package,
      available: true,
      submenu: [
        { id: 'inventory_tents', label: 'Carpas', icon: Tent, available: true }
      ]
    },
    {
      id: 'communication',
      label: 'Comunicación',
      icon: MessageCircle,
      available: true,
      submenu: [
        { id: 'comm_groups', label: 'Grupos', icon: Users, available: true },
        { id: 'comm_messaging', label: 'Mensajería Rápida', icon: MessageSquare, available: true },
        { id: 'comm_whatsapp', label: 'WhatsApp Web', icon: MessageCircle, available: true }
      ]
    },
    {
      id: 'uniformity',
      label: 'Uniformidad',
      icon: Shirt,
      available: true
    },
    {
      id: 'reports',
      label: 'Reportes',
      icon: BarChart3,
      available: true,
      submenu: [
        { id: 'idcards', label: 'Carnets', icon: IdCard, available: true }
      ]
    },
    { id: 'points', label: 'Puntaje', icon: Award, available: true },
    { id: 'settings', label: 'Configuración', icon: Settings, available: true }
  ].map(item => ({
    ...item,
    available: item.available && hasModuleAccess(item.id),
    submenu: item.submenu ? item.submenu.map(sub => ({
      ...sub,
      available: sub.available && hasModuleAccess(sub.id)
    })) : undefined
  }));

  // Calculate age from date of birth
  const calculateEdad = (dob) => {
    if (!dob) return '';
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Update age when date of birth changes
  useEffect(() => {
    if (formData.dateOfBirth) {
      const age = calculateEdad(formData.dateOfBirth);
      setFormData(prev => ({ ...prev, age: age.toString() }));
    }
  }, [formData.dateOfBirth]);

  // Validation function
  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'El nombre es obligatorio';
    if (!formData.lastName.trim()) newErrors.lastName = 'El apellido es obligatorio';
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'La fecha de nacimiento es obligatoria';
    if (!formData.bloodType) newErrors.bloodType = 'El tipo de sangre es obligatorio';
    if (!formData.gender) newErrors.gender = 'El género es obligatorio';
    if (!formData.address.trim()) newErrors.address = 'La dirección es obligatoria';
    if (!formData.primaryContact.trim()) newErrors.primaryContact = 'El contacto principal es obligatorio';

    // Parent info only required if under 18
    if (parseInt(formData.age) < 18) {
      if (!formData.fatherName.trim()) newErrors.fatherName = "El nombre del padre es obligatorio";
      if (!formData.motherName.trim()) newErrors.motherName = "El nombre de la madre es obligatorio";
    }

    if (!formData.religion.trim()) newErrors.religion = 'La religión es obligatoria';

    // Medical - Emergency contact is required
    if (!formData.emergencyContactName.trim()) newErrors.emergencyContactName = 'El contacto de emergencia es obligatorio';
    if (!formData.emergencyContactRelationship.trim()) newErrors.emergencyContactRelationship = 'El parentesco es obligatorio';
    if (!formData.emergencyContactPhone.trim()) newErrors.emergencyContactPhone = 'El teléfono de emergencia es obligatorio';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    // Directive Rule: If a member has a position (Director, etc.), they cannot be in a Unit.
    let updates = { [name]: type === 'checkbox' ? checked : value };
    if (name === 'position' && value !== '') {
      updates.unitId = '';
      updates.unitRole = '';
    }

    // Auto-calculate age
    if (name === 'dateOfBirth') {
      updates.age = calculateAge(value);
    }

    setFormData(prev => ({
      ...prev,
      ...updates
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Handle photo upload
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, photo: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      age: '',
      bloodType: '',
      gender: '',
      address: '',
      primaryContact: '',
      fatherName: '',
      fatherContact: '',
      motherName: '',
      motherContact: '',
      religion: '',
      baptismDate: '',
      photo: '',
      position: '',
      pathfinderClass: '',
      isMasterGuideCandidate: false,
      unitId: '',
      unitRole: ''
    });
    setErrors({});
    setEditingMember(null);
  };

  // Add or update member
  const handleSubmit = () => {
    if (!validateForm()) return;

    if (editingMember) {
      setMembers(prev => prev.map(member =>
        member.id === editingMember.id
          ? { ...formData, id: editingMember.id }
          : member
      ));
    } else {
      const newMember = {
        ...formData,
        id: Date.now().toString()
      };
      setMembers(prev => [...prev, newMember]);
    }

    resetForm();
    setShowForm(false);
  };

  // Edit member
  const handleEdit = (member) => {
    setFormData(member);
    setEditingMember(member);
    setShowForm(true);
  };

  // Delete member
  const handleDeleteMember = (memberId) => {
    const member = members.find(m => m.id === memberId);
    if (confirm(`Are you sure you want to delete ${member.firstName} ${member.lastName}? This action cannot be undone.`)) {
      setMembers(prev => prev.filter(m => m.id !== memberId));
    }
  };

  // Delete parent (clear from children)
  const handleDeleteParent = (parentName, type) => {
    const children = members.filter(m =>
      type === 'father' ? m.fatherName === parentName : m.motherName === parentName
    );

    const childrenNames = children.map(c => `${c.firstName} ${c.lastName}`).join(', ');

    if (window.confirm(`¿Estás seguro de eliminar a ${parentName}? Se eliminará de: ${childrenNames}`)) {
      setMembers(prevMembers => prevMembers.map(member => {
        if (type === 'father' && member.fatherName === parentName) {
          return { ...member, fatherName: '', fatherContact: '' };
        }
        if (type === 'mother' && member.motherName === parentName) {
          return { ...member, motherName: '', motherContact: '' };
        }
        return member;
      }));
    }
  };

  // Cancel form
  const handleCancel = () => {
    resetForm();
    setShowForm(false);
  };

  // Filter members based on search
  const filteredMembers = members.filter(member => {
    const searchLower = searchTerm.toLowerCase();
    return (
      member.firstName.toLowerCase().includes(searchLower) ||
      member.lastName.toLowerCase().includes(searchLower) ||
      member.id.includes(searchLower)
    );
  });

  // Position hierarchy for sorting
  const positionOrder = {
    'Director': 1,
    'Assistant Director': 2,
    'Secretary': 3,
    'Chaplain': 4,
    'Counselor': 5,
    'Treasurer': 6,
    'Class Instructor': 7
  };

  // Pathfinder class hierarchy
  const classOrder = {
    'Friend': 1,
    'Companion': 2,
    'Explorer': 3,
    'Ranger': 4,
    'Voyager': 5,
    'Guide': 6,
    'Master Guide': 7,
    'Master Guide Advanced': 8
  };

  // Sort members: First by position (directive), then by pathfinder class, then by name
  const sortedMembers = [...filteredMembers].sort((a, b) => {
    // Check if members have positions (directive members)
    const aHasPosition = a.position && a.position !== '';
    const bHasPosition = b.position && b.position !== '';

    // Directive members always come first
    if (aHasPosition && !bHasPosition) return -1;
    if (!aHasPosition && bHasPosition) return 1;

    // Both have positions - sort by position hierarchy
    if (aHasPosition && bHasPosition) {
      const aOrder = positionOrder[a.position] || 999;
      const bOrder = positionOrder[b.position] || 999;
      if (aOrder !== bOrder) return aOrder - bOrder;
    }

    // Both are regular members - sort by pathfinder class
    if (!aHasPosition && !bHasPosition) {
      const aClass = classOrder[a.pathfinderClass] || 999;
      const bClass = classOrder[b.pathfinderClass] || 999;
      if (aClass !== bClass) return aClass - bClass;
    }

    // Same position or same class - sort by first name
    return a.firstName.localeCompare(b.firstName);
  });

  // Handle sort
  const handleSort = (field) => {
    if (memberSortField === field) {
      setMemberSortOrder(memberSortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setMemberSortField(field);
      setMemberSortOrder('asc');
    }
  };

  // Handle module navigation
  // Handle module navigation
  const handleModuleClick = (moduleId) => {
    // Helper to find module in nested structure
    const findModule = (items, id) => {
      for (const item of items) {
        if (item.id === id) return item;
        if (item.submenu) {
          const found = findModule(item.submenu, id);
          if (found) return found;
        }
      }
      return null;
    };

    const module = findModule(menuItems, moduleId);

    if (module && module.available) {
      setActiveModule(moduleId);
      setShowForm(false);
      setShowFinanceForm(false);
      setShowActivityForm(false);
      resetForm();
    }
  };

  // Finance functions
  const validateFinanceForm = () => {
    const newErrors = {};

    if (!financeFormData.category.trim()) newErrors.category = 'La categoría es requerida';
    if (!financeFormData.amount || parseFloat(financeFormData.amount) <= 0) newErrors.amount = 'Monto válido requerido';
    if (!financeFormData.date) newErrors.date = 'La fecha es requerida';
    if (!financeFormData.paymentMethod) newErrors.paymentMethod = 'Método de pago requerido';

    if (financeFormData.type === 'expense') {
      if (!financeFormData.responsibleId) newErrors.responsibleId = 'Responsable es requerido';
    }

    setFinanceErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFinanceInputChange = (e) => {
    const { name, value } = e.target;
    setFinanceFormData(prev => ({ ...prev, [name]: value }));
    if (financeErrors[name]) setFinanceErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleFinanceFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('El archivo es demasiado grande (Máx 5MB)');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFinanceFormData(prev => ({ ...prev, receipt: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const resetFinanceForm = () => {
    setFinanceFormData({
      type: 'income',
      category: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      description: '',
      paymentMethod: '',
      memberId: '',
      responsibleId: '',
      receipt: '',
      status: 'official'
    });
    setFinanceErrors({});
  };

  const handleFinanceSubmit = () => {
    if (!validateFinanceForm()) return;

    let status = 'official';
    if (financeFormData.type === 'expense' && !financeFormData.receipt) {
      status = 'pending_receipt';
      if (!confirm('No se ha adjuntado factura. El gasto se guardará como "Pendiente de Factura" y generará una deuda al responsable. ¿Continuar?')) {
        return;
      }
    }

    const newTransaction = {
      ...financeFormData,
      id: Date.now().toString(),
      amount: parseFloat(financeFormData.amount),
      status: status
    };

    setTransactions(prev => [...prev, newTransaction]);
    resetFinanceForm();
    resetFinanceForm();
    setShowFinanceForm(false);
  };

  const getSaturdaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const saturdays = [];
    const d = new Date(year, month, 1);

    // Find first saturday
    while (d.getDay() !== 6) {
      d.setDate(d.getDate() + 1);
    }

    // Get all saturdays
    while (d.getMonth() === month) {
      saturdays.push(new Date(d));
      d.setDate(d.getDate() + 7);
    }
    return saturdays;
  };

  const handleGroupPaymentSubmit = () => {
    if (!groupPaymentData.categoryId) {
      alert('Seleccione una categoría');
      return;
    }
    if (groupPaymentData.selectedMembers.length === 0) {
      alert('Seleccione al menos un miembro');
      return;
    }
    if (!groupPaymentData.amount || parseFloat(groupPaymentData.amount) <= 0) {
      alert('Monto inválido');
      return;
    }

    const category = financeCategories.find(c => c.id === groupPaymentData.categoryId);
    const categoryName = category ? category.name : 'Unknown';

    const newTransactions = groupPaymentData.selectedMembers.map(memberId => {
      return {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        type: 'income',
        category: categoryName,
        amount: parseFloat(groupPaymentData.amount),
        date: groupPaymentData.date,
        description: groupPaymentData.description || `Pago Grupal: ${categoryName}`,
        paymentMethod: groupPaymentData.paymentMethod,
        memberId: memberId,
        responsibleId: '',
        receipt: '',
        status: 'official'
      };
    });

    setTransactions(prev => [...prev, ...newTransactions]);
    setShowGroupPaymentForm(false);
    setGroupPaymentData(prev => ({ ...prev, selectedMembers: [], description: '' }));
    alert(`✅ Se registraron ${newTransactions.length} pagos exitosamente.`);
  };

  const calculateFinanceSummary = () => {
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      income,
      expenses,
      balance: income - expenses
    };
  };

  const generateCategoryReport = () => {
    const categoryData = {};

    transactions.forEach(transaction => {
      const category = transaction.category;

      if (!categoryData[category]) {
        categoryData[category] = {
          income: 0,
          expense: 0,
          incomeCount: 0,
          expenseCount: 0,
          transactions: []
        };
      }

      if (transaction.type === 'income') {
        categoryData[category].income += transaction.amount;
        categoryData[category].incomeCount++;
      } else {
        categoryData[category].expense += transaction.amount;
        categoryData[category].expenseCount++;
      }

      categoryData[category].transactions.push(transaction);
    });

    return Object.entries(categoryData).map(([category, data]) => ({
      category,
      ...data,
      total: data.income - data.expense
    })).sort((a, b) => Math.abs(b.total) - Math.abs(a.total));
  };

  const getMemberName = (memberId) => {
    if (!memberId) return 'N/A';
    const member = members.find(m => m.id === memberId);
    return member ? `${member.firstName} ${member.lastName}` : 'N/A';
  };

  const summary = calculateFinanceSummary();

  const generateMonthlyReport = () => {
    const monthlyData = {};

    transactions.forEach(transaction => {
      const date = new Date(transaction.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: monthKey,
          income: 0,
          expense: 0,
          incomeTransactions: [],
          expenseTransactions: [],
          categories: {}
        };
      }

      if (transaction.type === 'income') {
        monthlyData[monthKey].income += transaction.amount;
        monthlyData[monthKey].incomeTransactions.push(transaction);
      } else {
        monthlyData[monthKey].expense += transaction.amount;
        monthlyData[monthKey].expenseTransactions.push(transaction);
      }

      // Track by category
      if (!monthlyData[monthKey].categories[transaction.category]) {
        monthlyData[monthKey].categories[transaction.category] = {
          income: 0,
          expense: 0
        };
      }

      if (transaction.type === 'income') {
        monthlyData[monthKey].categories[transaction.category].income += transaction.amount;
      } else {
        monthlyData[monthKey].categories[transaction.category].expense += transaction.amount;
      }
    });

    return Object.values(monthlyData).sort((a, b) => b.month.localeCompare(a.month));
  };

  const monthlyReport = generateMonthlyReport();

  const categoryReport = generateCategoryReport();

  // Activities functions
  const validateActivityForm = () => {
    const newErrors = {};

    if (!activityFormData.title.trim()) newErrors.title = 'Title  is required';
    if (!activityFormData.type) newErrors.type = 'Activity type  is required';
    if (!activityFormData.date) newErrors.date = 'La fecha es requerida';
    // Time is now optional
    if (!activityFormData.location.trim()) newErrors.location = 'Location  is required';

    setActivityErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleActivityInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setActivityFormData(prev => {
      const newData = {
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      };

      // If setting the date for the very first time or resetting, sync originalDate if empty
      // But we probably only want to set originalDate on creation submit, or keep it if it exists.
      // Logic handled in handleSubmitActivity mostly.

      return newData;
    });

    if (activityErrors[name]) {
      setActivityErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleStatusChange = (activityId, newStatus) => {
    setActivities(prev => prev.map(a => a.id === activityId ? { ...a, status: newStatus } : a));
  };


  const handleAttendeeToggle = (memberId) => {
    setActivityFormData(prev => ({
      ...prev,
      attendees: prev.attendees.includes(memberId)
        ? prev.attendees.filter(id => id !== memberId)
        : [...prev.attendees, memberId]
    }));
  };

  const resetActivityForm = () => {
    setActivityFormData({
      title: '',
      type: '',
      date: '',
      time: '',
      location: '',
      description: '',
      uniform: '',
      cost: '',
      transportation: '',
      meetingPoint: '',
      isRanking: false,
      rankingScore: '',
      rankingDeadline: '',
      attendees: []
    });
    setActivityErrors({});
    setEditingActivity(null);
  };

  const handleActivitySubmit = () => {
    if (!validateActivityForm()) return;

    if (editingActivity) {
      setActivities(prev => prev.map(activity => {
        if (activity.id === editingActivity.id) {
          // Calculate original date logic
          let originalDate = activity.originalDate;
          if (activity.date !== activityFormData.date) {
            // Date changed
            if (!originalDate) {
              originalDate = activity.date; // Use previous date as original
            }
            // If it already had an original date, keep it (it was already postponed)
          }

          return {
            ...activityFormData,
            id: editingActivity.id,
            originalDate: originalDate || activityFormData.date // Fallback to current if never set
          };
        }
        return activity;
      }));
    } else {
      const newActivity = {
        ...activityFormData,
        id: Date.now().toString(),
        originalDate: activityFormData.date // Set original date on creation
      };
      setActivities(prev => [...prev, newActivity]);
    }

    resetActivityForm();
    setShowActivityForm(false);
  };

  const handleEditActivity = (activity) => {
    if (activity.type === 'MasterGuide') {
      setActiveModule('master_guide');
      return;
    }
    setActivityFormData(activity);
    setEditingActivity(activity);
    setShowActivityForm(true);
  };

  const handleDeleteActivity = (activityId) => {
    if (confirm('Are you sure you want to delete this activity?')) {
      setActivities(prev => prev.filter(a => a.id !== activityId));
      setShowActivityForm(false);
      setEditingActivity(null);
    }
  };

  const generatePermissionSlip = (activity) => {
    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow.document.write(`
      <html>
        <head>
          <title>Permission Slip-${activity.title}</title>
          <style>
            body { font-family: 'Times New Roman', serif; padding: 40px; line-height: 1.6; }
            h1 { text-align: center; text-transform: uppercase; font-size: 18pt; margin-bottom: 5px; }
            h2 { text-align: center; font-size: 14pt; font-weight: normal; margin-top: 0; }
            .content { margin-top: 40px; }
            .details { margin: 20px 0; border: 1px solid #ccc; padding: 15px; }
            .signature-line { border-top: 1px solid black; width: 200px; display: inline-block; margin-top: 50px; }
            .row { display: flex; justify-content: space-between; margin-top: 40px; }
          </style>
        </head>
        <body>
          <h1>Club de Conquistadores Vencedores</h1>
          <h2>Parental Permission Form</h2>
          
          <div className="content">
            <p>I, _________________________________________________, hereby authorize my son/daughter,</p>
            <p>_________________________________________________, to participate in the following activity:</p>
            
            <div className="details">
              <p><strong>Activity:</strong> ${activity.title}</p>
              <p><strong>Date:</strong> ${activity.date} at ${activity.time}</p>
              <p><strong>Location:</strong> ${activity.location}</p>
              <p><strong>Meeting Point:</strong> ${activity.meetingPoint || 'Club Headquarters'}</p>
              <p><strong>Transportation:</strong> ${activity.transportation || 'Not specified'}</p>
              <p><strong>Cost:</strong> ${activity.cost ? '$' + activity.cost : 'Free'}</p>
              <p><strong>Uniform:</strong> ${activity.uniform || 'Field Uniform'}</p>
              <p><strong>Notes:</strong> ${activity.description || 'None'}</p>
            </div>

            <p>I understand that the club leadership will take all reasonable safety precautions. However, in case of an emergency where I cannot be reached, I authorize the club staff to obtain necessary medical attention for my child.</p>

            <div className="row">
              <div style="text-align: center;">
                <div className="signature-line"></div>
                <p>Parent/Guardian Signature</p>
              </div>
              <div style="text-align: center;">
                <div className="signature-line"></div>
                <p>Date</p>
              </div>
            </div>
            
            <div style="margin-top: 30px; font-size: 10pt; color: #666;">
              * Please cut and return this portion with payment (if applicable) by the next club meeting.
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const calculateAge = (dob) => {
    if (!dob) return 0;
    const diff = Date.now() - new Date(dob).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  };

  // --- HELPER: GLOBAL/GROUP REPORT PRINTER ---
  const printGlobalReport = (dateToPrint, targetGroup = 'all') => {
    // targetGroup: 'all', 'directive', 'juniors', 'masters'

    // Calculate Group Title
    let reportTitle = "Reporte Global de Uniformidad";
    if (targetGroup === 'directive') reportTitle = "Reporte de Uniformidad - Directiva";
    if (targetGroup === 'juniors') reportTitle = "Reporte de Uniformidad - Unity Club";
    if (targetGroup === 'masters') reportTitle = "Reporte de Uniformidad - Vencedores Máster";

    const printContent = `
      <html>
        <head>
          <title>${reportTitle}</title>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #333; }
            .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #eee; padding-bottom: 20px; }
            .header h1 { margin: 0; font-size: 24px; color: #1a1a1a; }
            .header p { margin: 5px 0 0; color: #666; font-size: 14px; }
            .section { margin-bottom: 30px; page-break-inside: avoid; }
            .section-title { font-size: 16px; font-weight: bold; margin-bottom: 15px; color: #4f46e5; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px; }
            table { w-full; border-collapse: collapse; width: 100%; font-size: 14px; margin-bottom: 10px; }
            th { text-align: left; border-bottom: 1px solid #ccc; padding: 10px; background-color: #f9fafb; font-weight: 600; }
            td { border-bottom: 1px solid #eee; padding: 10px; }
            .badge { display: inline-block; padding: 2px 8px; border-radius: 999px; font-size: 12px; font-weight: 500; }
            .badge-red { background-color: #fef2f2; color: #991b1b; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Club de Conquistadores Vencedores</h1>
            <p>${reportTitle}</p>
            <p>Fecha de Inspección: ${new Date(dateToPrint + 'T12:00:00').toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>

          ${(() => {
        const generateSection = (title, memberList) => {
          const missingList = memberList.map(m => {
            const inspection = uniformInspections.find(i => i.memberId === m.id && i.date === dateToPrint) || {};
            if (!inspection.itemsMissing || inspection.itemsMissing.length === 0) return null;
            const items = inspection.itemsMissing.map(id => uniformItems.find(i => i.id === id)?.label).filter(Boolean);
            return { name: m.firstName + ' ' + m.lastName, items };
          }).filter(Boolean);

          if (missingList.length === 0) return '';

          return `
                   <div class="section">
                     <div class="section-title">${title} (${missingList.length} Incompletos)</div>
                     <table>
                       <thead><tr><th>Nombre</th><th>Faltantes</th></tr></thead>
                       <tbody>
                         ${missingList.map(m => `
                           <tr>
                             <td style="font-weight: 500;">${m.name}</td>
                             <td>${m.items.map(i => `<span class="badge badge-red">${i}</span>`).join(' ')}</td>
                           </tr>
                         `).join('')}
                       </tbody>
                     </table>
                   </div>
                 `;
        };

        const directiveMembers = members.filter(m => m.position && m.position.trim() !== '' && m.position !== 'Ninguno');
        const allRegular = members.filter(m => !m.position || m.position.trim() === '' || m.position === 'Ninguno');

        // Helper for age (reused)
        const getMemberAge = (m) => {
          if (!m.dateOfBirth) return 0;
          const dob = new Date(m.dateOfBirth);
          if (isNaN(dob.getTime())) return 0;
          return Math.abs(new Date(Date.now() - dob.getTime()).getUTCFullYear() - 1970);
        };

        const juniors = allRegular.filter(m => getMemberAge(m) < 16);
        const masters = allRegular.filter(m => getMemberAge(m) >= 16);

        let content = '';
        if (targetGroup === 'all' || targetGroup === 'directive') content += generateSection('Directiva', directiveMembers);
        if (targetGroup === 'all' || targetGroup === 'juniors') content += generateSection('Unity Club (Menores)', juniors);
        if (targetGroup === 'all' || targetGroup === 'masters') content += generateSection('Unity Club Máster', masters);

        return content || '<p style="text-align: center; color: #666;">No hay datos de inspección faltantes para esta fecha en el grupo seleccionado.</p>';
      })()}

          <div style="margin-top: 50px; text-align: center; font-size: 12px; color: #9ca3af;">
            Generado el ${new Date().toLocaleDateString()}
          </div>
        </body>
      </html>
    `;
    const printWindow = window.open('', '', 'width=800,height=800');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    } else {
      alert('Permite las ventanas emergentes para imprimir.');
    }
  };

  // Helper: Translate Positions
  const translatePosition = (position, gender = 'Male') => {
    const isFemale = gender === 'Female' || gender === 'Femenino'; // Handle potential variations

    const translations = {
      // Directiva
      'Director': isFemale ? 'Directora' : 'Director',
      'Assistant Director': isFemale ? 'Subdirectora' : 'Subdirector',
      'Secretary': isFemale ? 'Secretaria' : 'Secretario',
      'Chaplain': isFemale ? 'Capellana' : 'Capellán',
      'Counselor': isFemale ? 'Consejera' : 'Consejero',
      'Treasurer': isFemale ? 'Tesorera' : 'Tesorero',
      'Scribe': isFemale ? 'Secretaria de Unidad' : 'Secretario de Unidad',

      // Instructores
      'Class Instructor': isFemale ? 'Instructora de Clase' : 'Instructor de Clase',
      'Captain': isFemale ? 'Capitana' : 'Capitán',

      // Generic fallbacks just in case
      'DUMC': 'DUMC',
    };
    return translations[position] || position;
  };

  // Helper: Print Member Form
  const printMemberForm = (member) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return alert('Please allow popups for this website');

    const photoSrc = member.photo || '';
    const age = calculateAge(member.dateOfBirth);

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Ficha de Miembro - ${member.firstName} ${member.lastName}</title>
          <style>
            @page { size: A4; margin: 20mm; }
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; line-height: 1.5; -webkit-print-color-adjust: exact; }
            .header { display: flex; align-items: center; border-bottom: 2px solid #b91c1c; padding-bottom: 20px; margin-bottom: 30px; }
            .logo { width: 80px; height: 80px; margin-right: 20px; }
            .title-area { flex: 1; }
            .club-name { font-size: 24px; font-weight: bold; color: #b91c1c; text-transform: uppercase; margin: 0; }
            .doc-title { font-size: 16px; color: #666; font-weight: 500; margin-top: 5px; }
            .grid { display: grid; grid-template-columns: 1fr 2fr; gap: 30px; }
            .photo-box { width: 100%; aspect-ratio: 1; bg-gray-100; border-radius: 12px; overflow: hidden; border: 4px solid #f3f4f6; }
            .photo-box img { width: 100%; height: 100%; object-fit: cover; }
            .photo-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: #f3f4f6; color: #9ca3af; font-size: 40px; }
            .section { margin-bottom: 25px; break-inside: avoid; }
            .section-title { font-size: 14px; font-weight: bold; color: #b91c1c; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; margin-bottom: 15px; }
            .field-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
            .field { margin-bottom: 8px; }
            .label { font-size: 11px; color: #6b7280; font-weight: 600; text-transform: uppercase; display: block; margin-bottom: 2px; }
            .value { font-size: 14px; color: #111827; font-weight: 500; border-bottom: 1px dashed #e5e7eb; padding-bottom: 2px; min-height: 20px; }
            .full-width { grid-column: span 2; }
            .signatures { margin-top: 60px; display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
            .signature-line { border-top: 1px solid #333; padding-top: 10px; text-align: center; font-size: 12px; color: #4b5563; }
            .tag { display: inline-block; padding: 2px 8px; border-radius: 999px; font-size: 12px; font-weight: 600; }
            .tag-red { background: #fef2f2; color: #991b1b; }
            .tag-blue { background: #eff6ff; color: #1e40af; }
          </style>
        </head>
        <body>
          <div class="header">
            <svg class="logo" viewBox="0 0 1080 1080" xmlns="http://www.w3.org/2000/svg">
               <path fill="#b91c1c" d="M540,131.15c-233.86,0-423.44,189.58-423.44,423.44,0,177.66,109.41,329.77,264.53,392.61l26.65-88.18-49.58-99.28,131.75-127.36,212.38-47.24-.93-55.68h-100.38l-30.68-57.34,77.42-48.71,115.45,5.37,75.5,113.97-29.47,156.83-114.71,120.81.34,128.45c157.28-61.82,268.62-215.03,268.62-394.25,0-233.86-189.59-423.44-423.45-423.44ZM385.34,679.43l-23.47,22.69-28.19,27.26-52.35-38.04-39.41-113.65,25.39-44.44,15.91-27.83,1.64-2.87,3.44,8.91,33.2,86.06,59.44,70.45,7.31,8.66-2.91,2.8ZM470.78,596.81l-17.99,17.38-42.88,41.46-62.16-73.72-43.64-113.08,55.27-96.73,26.72,69.26,33.19,86.03,57.42,68.07-5.93,1.33ZM579.9,572.54l-70.05,15.6-64.31-76.26-66.91-173.41,28.09-49.18h85.33l57.81,149.77-30.94,19.46,60.98,114.02ZM637.37,384.01l-61.57,38.72-51.49-133.45h126.82l33.92,96.94-47.68-2.21Z" />
            </svg>
            <div class="title-area">
              <h1 class="club-name">Unity Club</h1>
              <div class="doc-title">Ficha Oficial de Miembro</div>
            </div>
            <div>
              <div style="text-align: right; font-size: 12px; color: #6b7280;">ID: ${member.id.substring(0, 8)}</div>
              <div style="text-align: right; font-size: 12px; color: #6b7280;">Fecha: ${new Date().toLocaleDateString()}</div>
            </div>
          </div>

          <div class="grid">
            <div>
              <div class="photo-box">
                ${photoSrc ? `<img src="${photoSrc}" />` : '<div class="photo-placeholder">👤</div>'}
              </div>
              <div style="margin-top: 20px; text-align: center;">
                <h2 style="margin: 0; font-size: 18px; font-weight: bold; color: #111;">${member.firstName} ${member.lastName}</h2>
                <div style="color: #b91c1c; font-weight: 600; margin-top: 4px;">${translatePosition(member.position, member.gender) || member.pathfinderClass || 'Miembro'}</div>
                ${member.unitId ? `<div style="font-size: 13px; color: #666; margin-top: 4px;">Unidad: ${units.find(u => u.id === member.unitId)?.name || 'Sin Unidad'}</div>` : ''}
              </div>
            </div>

            <div>
              <div class="section">
                <div class="section-title">Información Personal</div>
                <div class="field-grid">
                  <div class="field">
                    <span class="label">Edad</span>
                    <div class="value">${age} años</div>
                  </div>
                  <div class="field">
                    <span class="label">Fecha de Nacimiento</span>
                    <div class="value">${new Date(member.dateOfBirth).toLocaleDateString()}</div>
                  </div>
                  <div class="field">
                    <span class="label">Género</span>
                    <div class="value">${member.gender === 'M' ? 'Masculino' : 'Femenino'}</div>
                  </div>
                  <div class="field">
                    <span class="label">DNI/Cédula</span>
                    <div class="value">${member.dni || 'No registrado'}</div>
                  </div>
                  <div class="full-width field">
                    <span class="label">Dirección</span>
                    <div class="value">${member.address || 'No registrada'}</div>
                  </div>
                </div>
              </div>

              <div class="section">
                <div class="section-title">Contacto</div>
                <div class="field-grid">
                  <div class="field">
                    <span class="label">Teléfono</span>
                    <div class="value">${member.phone || '-'}</div>
                  </div>
                  <div class="field">
                    <span class="label">Email</span>
                    <div class="value">${member.email || '-'}</div>
                  </div>
                </div>
              </div>

              <div class="section">
                <div class="section-title">Datos Médicos</div>
                <div class="field-grid">
                  <div class="field">
                    <span class="label">Tipo de Sangre</span>
                    <div class="value">${member.bloodType || '-'}</div>
                  </div>
                  <div class="field">
                    <span class="label">Alergias</span>
                    <div class="value" style="color: ${member.allergies ? '#b91c1c' : 'inherit'}">${member.allergies || 'Ninguna'}</div>
                  </div>
                </div>
              </div>

              <div class="signatures">
                <div class="signature-line">
                  Firma del Miembro / Padre
                </div>
                <div class="signature-line">
                  Firma del Director
                </div>
              </div>
            </div>
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Helper: Print Medical Record
  const printMedicalRecord = (member) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return alert('Please allow popups for this website');

    const photoSrc = member.photo || '';
    const age = calculateAge(member.dateOfBirth);

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Ficha Médica - ${member.firstName} ${member.lastName}</title>
          <style>
            @page { size: A4; margin: 20mm; }
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; line-height: 1.5; -webkit-print-color-adjust: exact; }
            .header { display: flex; align-items: center; border-bottom: 2px solid #dc2626; padding-bottom: 20px; margin-bottom: 30px; }
            .logo { width: 80px; height: 80px; margin-right: 20px; }
            .title-area { flex: 1; }
            .club-name { font-size: 24px; font-weight: bold; color: #dc2626; text-transform: uppercase; margin: 0; }
            .doc-title { font-size: 16px; color: #666; font-weight: 500; margin-top: 5px; }
            .grid { display: grid; grid-template-columns: 1fr 2fr; gap: 30px; }
            .photo-box { width: 100%; aspect-ratio: 1; bg-gray-100; border-radius: 12px; overflow: hidden; border: 4px solid #f3f4f6; }
            .photo-box img { width: 100%; height: 100%; object-fit: cover; }
            .photo-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: #f3f4f6; color: #9ca3af; font-size: 40px; }
            .section { margin-bottom: 25px; break-inside: avoid; }
            .section-title { font-size: 14px; font-weight: bold; color: #dc2626; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; margin-bottom: 15px; }
            .field-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
            .field { margin-bottom: 8px; }
            .label { font-size: 11px; color: #6b7280; font-weight: 600; text-transform: uppercase; display: block; margin-bottom: 2px; }
            .value { font-size: 14px; color: #111827; font-weight: 500; border-bottom: 1px dashed #e5e7eb; padding-bottom: 2px; min-height: 20px; }
            .full-width { grid-column: span 2; }
            .alert-box { background-color: #fef2f2; border: 1px solid #fca5a5; color: #991b1b; padding: 10px; border-radius: 6px; margin-bottom: 15px; }
            .alert-title { font-weight: bold; font-size: 13px; margin-bottom: 4px; display: flex; align-items: center; gap: 6px; }
            .signatures { margin-top: 60px; display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
            .signature-line { border-top: 1px solid #333; padding-top: 10px; text-align: center; font-size: 12px; color: #4b5563; }
          </style>
        </head>
        <body>
          <div class="header">
            <svg class="logo" viewBox="0 0 1080 1080" xmlns="http://www.w3.org/2000/svg">
               <path fill="#dc2626" d="M540,131.15c-233.86,0-423.44,189.58-423.44,423.44,0,177.66,109.41,329.77,264.53,392.61l26.65-88.18-49.58-99.28,131.75-127.36,212.38-47.24-.93-55.68h-100.38l-30.68-57.34,77.42-48.71,115.45,5.37,75.5,113.97-29.47,156.83-114.71,120.81.34,128.45c157.28-61.82,268.62-215.03,268.62-394.25,0-233.86-189.59-423.44-423.45-423.44ZM385.34,679.43l-23.47,22.69-28.19,27.26-52.35-38.04-39.41-113.65,25.39-44.44,15.91-27.83,1.64-2.87,3.44,8.91,33.2,86.06,59.44,70.45,7.31,8.66-2.91,2.8ZM470.78,596.81l-17.99,17.38-42.88,41.46-62.16-73.72-43.64-113.08,55.27-96.73,26.72,69.26,33.19,86.03,57.42,68.07-5.93,1.33ZM579.9,572.54l-70.05,15.6-64.31-76.26-66.91-173.41,28.09-49.18h85.33l57.81,149.77-30.94,19.46,60.98,114.02ZM637.37,384.01l-61.57,38.72-51.49-133.45h126.82l33.92,96.94-47.68-2.21Z" />
            </svg>
            <div class="title-area">
              <h1 class="club-name">Unity Club</h1>
              <div class="doc-title">Ficha Médica Confidencial</div>
            </div>
            <div>
              <div style="text-align: right; font-size: 12px; color: #6b7280;">ID: ${member.id.substring(0, 8)}</div>
              <div style="text-align: right; font-size: 12px; color: #6b7280;">Impreso: ${new Date().toLocaleDateString()}</div>
            </div>
          </div>

          <div class="grid">
            <div>
              <div class="photo-box">
                ${photoSrc ? `<img src="${photoSrc}" />` : '<div class="photo-placeholder">👤</div>'}
              </div>
              <div style="margin-top: 20px; text-align: center;">
                <h2 style="margin: 0; font-size: 18px; font-weight: bold; color: #111;">${member.firstName} ${member.lastName}</h2>
                <div style="color: #dc2626; font-weight: 600; margin-top: 4px;">${calculateAge(member.dateOfBirth)} Años</div>
                <div style="font-size: 13px; color: #666; margin-top: 4px;">Tipo de Sangre: <strong>${member.bloodType || 'N/A'}</strong></div>
              </div>
            </div>

            <div>
              <div class="section">
                <div class="section-title">Información de Emergencia</div>
                <div class="field-grid">
                  <div class="full-width field">
                    <span class="label">Contacto Principal</span>
                    <div class="value" style="font-weight: bold;">${member.emergencyContactName || '-'}</div>
                  </div>
                  <div class="field">
                    <span class="label">Teléfono Emergencia</span>
                    <div class="value">${member.emergencyContactPhone || '-'}</div>
                  </div>
                  <div class="field">
                    <span class="label">Parentesco</span>
                    <div class="value">-</div>
                  </div>
                </div>
              </div>

              ${member.allergies ? `
                <div class="alert-box">
                  <div class="alert-title">⚠️ ALERGIAS REGISTRADAS</div>
                  <div>${member.allergies}</div>
                </div>
              ` : ''}

              <div class="section">
                <div class="section-title">Detalle Médico</div>
                <div class="field-grid">
                  <div class="full-width field">
                    <span class="label">Condiciones Médicas</span>
                    <div class="value">${member.medicalCondition || 'Ninguna reportada'}</div>
                  </div>
                  <div class="full-width field">
                    <span class="label">Medicamentos (Condición)</span>
                    <div class="value">${member.conditionMedications || 'N/A'}</div>
                  </div>
                  <div class="full-width field">
                    <span class="label">Medicamentos Continuos</span>
                    <div class="value">${member.continuousMedications || 'N/A'}</div>
                  </div>
                </div>
              </div>

              <div class="section">
                <div class="section-title">Atención Profesional</div>
                <div class="field-grid">
                  <div class="field">
                    <span class="label">Doctor / Pediatra</span>
                    <div class="value">${member.doctorName || '-'}</div>
                  </div>
                  <div class="field">
                    <span class="label">Teléfono Doctor</span>
                    <div class="value">${member.doctorPhone || '-'}</div>
                  </div>
                  <div class="field">
                    <span class="label">Seguro Médico</span>
                    <div class="value">${member.insuranceProvider || '-'}</div>
                  </div>
                  <div class="field">
                    <span class="label">Nº Póliza / Afiliación</span>
                    <div class="value">${member.insuranceNumber || '-'}</div>
                  </div>
                </div>
              </div>

              <div class="section">
                <div class="section-title">Notas Especiales</div>
                <div style="border: 1px dashed #e5e7eb; padding: 10px; border-radius: 6px; min-height: 60px; font-size: 14px;">
                  ${member.specialNotes || 'Sin notas adicionales.'}
                </div>
              </div>

              <div class="signatures">
                <div class="signature-line">
                  Firma del Padre / Tutor
                </div>
                <div class="signature-line">
                  Firma del Director / Médico del Club
                </div>
              </div>
            </div>
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // ========================================
  // RENDER: MEMBER PROFILE VIEW
  // ========================================
  // Helper: Print ID Cards
  const printIdCards = (selectedMemberIds) => {
    // Filter actual member objects
    const selectedMembers = members.filter(m => selectedMemberIds.includes(m.id));

    if (selectedMembers.length === 0) return alert('Por favor seleccione al menos un miembro.');

    const printWindow = window.open('', '_blank');
    if (!printWindow) return alert('Please allow popups for this website');

    const cardsHtml = selectedMembers.map(member => {
      const photoSrc = member.photo || '';
      const role = translatePosition(member.position, member.gender) || member.pathfinderClass || 'Miembro';
      const unit = units.find(u => u.id === member.unitId)?.name || 'Unity Club';

      // Determine border color based on class/role
      let borderColor = '#dc2626'; // Default Red
      if (member.position && member.position.includes('Director')) borderColor = '#fbbf24'; // Gold for Directors

      const bloodType = member.bloodType || 'N/A';

      const frontHtml = `
        <div class="card front">
          <div class="top-header">
             ASOCIACIÓN CENTRAL DOMINICANA | ZONA 4 | ASOCIACIÓN CENTRAL DOMINICANA
          </div>
          
          <div class="club-logo-area">
             <svg viewBox="0 0 1080 1080" style="width: 100%; height: 100%;">
                 <path fill="#dc2626" d="M540,131.15c-233.86,0-423.44,189.58-423.44,423.44,0,177.66,109.41,329.77,264.53,392.61l26.65-88.18-49.58-99.28,131.75-127.36,212.38-47.24-.93-55.68h-100.38l-30.68-57.34,77.42-48.71,115.45,5.37,75.5,113.97-29.47,156.83-114.71,120.81.34,128.45c157.28-61.82,268.62-215.03,268.62-394.25,0-233.86-189.59-423.44-423.45-423.44Z" />
             </svg>
          </div>
          
          <div class="photo-area">
             ${photoSrc ? `<img src="${photoSrc}" />` : '<div style="font-size:40px; color:#aaa;">👤</div>'}
          </div>
          
          <div class="info-area">
            <h1 class="member-name">${member.firstName}</h1>
            <h1 class="member-lastname">${member.lastName}</h1>
            <div class="member-id">${member.id.substring(0, 8).toUpperCase()}</div>
          </div>
          
          <div class="blood-type-area">
             <div class="blood-type-val">${bloodType}</div>
             <div class="blood-type-label">TIPO DE SANGRE</div>
          </div>
          
          <div class="bottom-footer">
             AMIGOS DE JESÚS | SIERVOS DE DIOS
             <div class="expiry">EMISIÓN: 2026</div>
          </div>
        </div>
      `;

      const backHtml = `
        <div class="card back">
          <div class="top-header">
             ASOCIACIÓN CENTRAL DOMINICANA | ZONA 4 | ASOCIACIÓN CENTRAL DOMINICANA
          </div>
          
          <div class="data-block">
             <div class="data-row">
                <div class="data-value">${member.dateOfBirth ? new Date(member.dateOfBirth).toLocaleDateString() : '00/00/0000'}</div>
                <div class="data-label">FECHA DE NACIMIENTO</div>
             </div>
             
             <div class="data-row">
                <div class="data-value">${member.emergencyContactPhone || '000-000-0000'} | ${member.emergencyContactName || 'Nombre contacto'}</div>
                <div class="data-label">CONTACTO DE EMERGENCIA</div>
             </div>
             
             <div class="data-row" style="margin-top: 15px;">
                <div class="data-value-lg">${member.medicalCondition || 'Sin condiciones médicas reportadas'}</div>
                <div class="data-label">CONDICIÓN MÉDICA</div>
             </div>
             
             <div class="data-row">
                <div class="data-value-lg">${member.allergies || 'Sin alergias conocidas'}</div>
                <div class="data-label">ALERGIAS</div>
             </div>

             <div class="data-row">
                <div class="data-value-lg">${member.conditionMedications || 'No utiliza medicación permanente'}</div>
                <div class="data-label">MEDICACIÓN</div>
             </div>
             
             <div class="tutor-info">
               INFORMACIÓN SUMINISTRADA POR EL TUTOR LEGAL
             </div>
          </div>
          
          <div class="bottom-footer back-footer">
             <div class="disclaimer">
                Este carné identifica al portador como miembro del Club de Conquistadores y es válido únicamente para actividades oficiales del programa. En caso de pérdida, favor devolver a la Iglesia Adventista del Séptimo Día.
             </div>
             <div class="expiry">EMISIÓN: 2026</div>
          </div>
        </div>
      `;

      return `<div class="card-pair">${frontHtml}${backHtml}</div>`;
    }).join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Carnets Doble Cara - Unity Club</title>
          <style>
            @page { size: A4; margin: 10mm; }
            * { box-sizing: border-box; }
            body { 
              font-family: 'Arial', sans-serif; 
              background: #fff; 
              margin: 0; 
              padding: 0;
            }
            
            .card-pair {
              display: flex;
              gap: 5mm;
              margin-bottom: 5mm;
              page-break-inside: avoid;
            }
            
            .card {
              width: 85.6mm; /* CR80 Width */
              height: 53.98mm; /* CR80 Height */
              border: 1px solid #ddd;
              position: relative;
              overflow: hidden;
              background: white;
            }
            
            /* FRONT DESIGN */
            .card.front {
               background: #f3f4f6;
            }
            
            .top-header {
               position: absolute;
               top: 0; left: 0; right: 0;
               height: 12px;
               background: #a41016; /* Darker red */
               color: white;
               font-size: 4px;
               display: flex;
               align-items: center;
               justify-content: center;
               letter-spacing: 0.5px;
               z-index: 10;
               white-space: nowrap;
               overflow: hidden;
            }
            
            .club-logo-area {
               position: absolute;
               top: 20px;
               left: 10px;
               width: 35px;
               height: 35px;
               z-index: 10;
            }
            
            /* Photo box - positioned left */
            .photo-area {
               position: absolute;
               top: 60px; /* Position needs adjustment visually */
               left: 10px;
               display: none; /* User image reference hides explicit photo box in favor of graphic, but requested "info of each". Let's assume text dominant based on reference layout guesses if photo isn't main feature, OR standard ID. Let's keep basics visible. */
            }
            /* Actually adhering to the described "Red/Gold" heavy graphic usually implies standard layout. */
            
            /* Let's try to match the reference "front" description better visually in generic terms */
            .info-area {
               position: absolute;
               top: 25px;
               left: 55px; 
               z-index: 10;
            }
            
            .member-name, .member-lastname {
               margin: 0;
               font-size: 14px;
               font-weight: 900;
               text-transform: uppercase;
               color: #111;
               line-height: 1;
            }
             .member-id {
               font-size: 10px;
               color: #dc2626;
               font-weight: bold;
               margin-top: 4px;
            }
            
            .blood-type-area {
               position: absolute;
               top: 25px;
               right: 15px;
               text-align: right;
               z-index: 10;
            }
            .blood-type-val {
               font-size: 20px;
               font-weight: 900;
               color: #dc2626;
            }
            .blood-type-label {
               font-size: 5px;
               color: #666;
               font-weight: bold;
            }

            .bottom-footer {
               position: absolute;
               bottom: 0; left: 0; right: 0;
               height: 15px;
               background: #dc2626;
               color: white;
               display: flex;
               justify-content: space-between;
               align-items: center;
               padding: 0 10px;
               font-size: 6px;
               z-index: 20;
            }
            
            /* BACK DESIGN */
            .card.back {
               background: white;
               padding: 15px 10px 15px 10px;
               display: flex;
               flex-direction: column;
               align-items: center;
            }
            
            .data-block {
               width: 100%;
               text-align: center;
               margin-top: 5px;
            }
            
            .data-row {
               margin-bottom: 8px;
               border-bottom: 1px solid #dc2626;
               padding-bottom: 2px;
            }
            
            .data-value {
               font-size: 10px;
               font-weight: bold;
               color: #111;
            }
            .data-value-lg {
               font-size: 9px;
               font-weight: bold;
               color: #111;
            }
            .data-label {
               font-size: 5px;
               color: #dc2626;
               font-style: italic;
               margin-top: 1px;
            }
            
            .tutor-info {
               font-size: 4px; 
               color: #dc2626;
               margin-top: 5px;
               text-transform: uppercase;
            }
            
            .back-footer .disclaimer {
               font-size: 5px;
               text-align: justify;
               line-height: 1.1;
               width: 80%;
            }
          </style>
        </head>
        <body>
          ${cardsHtml}
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // ========================================
  // UNIFORMITY MODULE RENDERER
  // ========================================
  const renderUniformityModule = () => {
    // Helper to get inspection for a member on a specific date
    const getInspection = (memberId, date) => {
      const dateStr = date instanceof Date ? date.toISOString().split('T')[0] : date;
      return uniformInspections.find(i => i.memberId === memberId && i.date === dateStr) || { itemsMissing: [], isComplete: true };
    };

    // Helper to toggle a missing item in inspection
    const toggleInspectionItem = (memberId, date, itemId) => {
      const dateStr = date instanceof Date ? date.toISOString().split('T')[0] : date;
      const existingInspection = getInspection(memberId, dateStr);
      let newItemsMissing = [...(existingInspection.itemsMissing || [])];

      if (newItemsMissing.includes(itemId)) {
        newItemsMissing = newItemsMissing.filter(id => id !== itemId);
      } else {
        newItemsMissing.push(itemId);
      }

      const isComplete = newItemsMissing.length === 0;

      // Update state
      const newInspection = { ...existingInspection, memberId, date: dateStr, itemsMissing: newItemsMissing, isComplete };
      const otherInspections = uniformInspections.filter(i => !(i.memberId === memberId && i.date === dateStr));
      setUniformInspections([...otherInspections, newInspection]);
    };

    // Helper to mark inspection as fully complete
    const markInspectionComplete = (memberId, date) => {
      const dateStr = date instanceof Date ? date.toISOString().split('T')[0] : date;
      const otherInspections = uniformInspections.filter(i => !(i.memberId === memberId && i.date === dateStr));
      setUniformInspections([...otherInspections, { memberId, date: dateStr, itemsMissing: [], isComplete: true }]);
    };

    // Helper to update inventory size/possession
    const updateMemberUniform = (memberId, field, value) => {
      const currentData = memberUniforms[memberId] || {};
      setMemberUniforms({
        ...memberUniforms,
        [memberId]: { ...currentData, [field]: value }
      });
    };

    // CRUD Handlers for Uniform Items
    const openNewItemForm = () => {
      const defaultCategory = uniformCategories.length > 0 ? uniformCategories[0] : '';
      setItemFormData({ label: '', category: defaultCategory, price: 0, gender: 'Unisex', onlyForDirective: false, hasVariants: false, variants: [], sizeType: 'none' });
      setEditingItem(null);
      setShowItemForm(true);
    };

    const openEditItemForm = (item) => {
      setItemFormData({
        ...item,
        gender: item.gender || 'Unisex',
        onlyForDirective: item.onlyForDirective || false,
        hasVariants: !!item.variants && item.variants.length > 0,
        variants: item.variants || [],
        sizeType: item.sizeType || 'none'
      });
      setEditingItem(item);
      setShowItemForm(true);
    };

    const handleSaveItem = () => {
      if (!itemFormData.label) return;

      if (editingItem) {
        setUniformItems(uniformItems.map(item =>
          item.id === editingItem.id ? { ...itemFormData, id: editingItem.id } : item
        ));
      } else {
        const newItem = {
          ...itemFormData,
          id: Date.now().toString(),
          price: parseFloat(itemFormData.price) || 0
        };
        setUniformItems([...uniformItems, newItem]);
      }
      setShowItemForm(false);
    };

    const handleDeleteItem = (itemId) => {
      if (window.confirm('¿Estás seguro de eliminar este elemento?')) {
        setUniformItems(uniformItems.filter(item => item.id !== itemId));
      }
    };

    const handleMoveItemUp = (index) => {
      if (index === 0) return;
      const newItems = [...uniformItems];
      [newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]];
      setUniformItems(newItems);
    };

    const handleMoveItemDown = (index) => {
      if (index === uniformItems.length - 1) return;
      const newItems = [...uniformItems];
      [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
      setUniformItems(newItems);
    };

    // Category Handlers
    const handleAddCategory = () => {
      if (!newUniformCategory.trim()) return;
      if (uniformCategories.includes(newUniformCategory.trim())) {
        alert('Esta categoría ya existe.');
        return;
      }
      setUniformCategories([...uniformCategories, newUniformCategory.trim()]);
      setNewUniformCategory('');
    };

    const handleDeleteCategory = (category) => {
      if (window.confirm(`¿Estás seguro de eliminar la categoría "${category}"?`)) {
        setUniformCategories(uniformCategories.filter(c => c !== category));
      }
    };

    return (
      <div className="animate-fade-in">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <Shirt className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
                Gestión de Uniformidad
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mt-1">Control de inspecciones y tallas de uniformes</p>
            </div>

            <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
              <button
                onClick={() => setUniformityTab('inspection')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${uniformityTab === 'inspection' ? 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white'}`}
              >
                Inspección
              </button>
              <button
                onClick={() => setUniformityTab('inventory')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${uniformityTab === 'inventory' ? 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white'}`}
              >
                Inventario (Tallas)
              </button>
              <button
                onClick={() => setUniformityTab('settings')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${uniformityTab === 'settings' ? 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white'}`}
              >
                Configuración
              </button>
            </div>
          </div>
        </div>

        {/* INSPECTION VIEW */}
        {uniformityTab === 'inspection' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Fecha de Inspección:</label>
                <input
                  type="date"
                  value={bgDate}
                  onChange={(e) => setBgDate(e.target.value)}
                  className="px-3 py-2 border rounded-md text-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                />
              </div>
              <div className="flex gap-2">
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <div className="w-3 h-3 bg-green-100 border border-green-300 rounded-full"></div> Completo
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <div className="w-3 h-3 bg-red-100 border border-red-300 rounded-full"></div> Incompleto
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <span className="text-gray-400 font-bold">M/F</span> Filtro por Sexo
                </div>
              </div>
            </div>

            {/* UNIFORMITY DASHBOARD MODE */}
            {inspectionViewMode === 'dashboard' && (
              <div className="space-y-8 animate-fade-in">
                {/* Main Actions */}
                <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50/50 dark:bg-gray-900/50">
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-full shadow-md mb-4 animate-bounce-subtle">
                    <ClipboardList className="w-12 h-12 text-indigo-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Gestión de Inspecciones</h3>

                  <div className="flex flex-col sm:flex-row gap-4 w-full max-w-2xl">
                    <button
                      onClick={() => setInspectionViewMode('selection')}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white p-6 rounded-xl shadow-md transition-all hover:scale-105 flex flex-col items-center gap-2 group"
                    >
                      <PlusCircle className="w-10 h-10 group-hover:rotate-90 transition-transform" />
                      <span className="font-bold text-xl">Realizar Inspección</span>
                      <span className="text-indigo-200">Seleccionar grupo para inspeccionar</span>
                    </button>
                  </div>
                </div>

                {/* History Table */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-100 dark:border-gray-700">
                  <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-gray-500" />
                      Historial de Informes
                    </h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-900/50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Fecha</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Estado</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {(() => {
                          // Extract unique dates from inspections
                          const dates = [...new Set(uniformInspections.map(i => i.date))].sort().reverse();
                          if (dates.length === 0) {
                            return (
                              <tr>
                                <td colSpan="3" className="px-6 py-8 text-center text-gray-500 italic">
                                  No hay inspecciones registradas.
                                </td>
                              </tr>
                            );
                          }
                          return dates.map(date => (
                            <tr key={date} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                {new Date(date + 'T12:00:00').toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Reporte Generado</span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex justify-end gap-2">
                                <button
                                  onClick={() => printGlobalReport(date)}
                                  className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 flex items-center gap-1"
                                  title="Imprimir Reporte Completo"
                                >
                                  <Printer className="w-4 h-4" />
                                  Imprimir
                                </button>
                                <button
                                  onClick={() => {
                                    if (confirm('¿Estás seguro de que deseas eliminar este reporte? \n\nEsta acción eliminará todos los registros de inspección para esta fecha (' + new Date(date + 'T12:00:00').toLocaleDateString() + ').')) {
                                      setUniformInspections(prev => prev.filter(i => i.date !== date));
                                    }
                                  }}
                                  className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 flex items-center gap-1 ml-4"
                                  title="Eliminar Reporte"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Eliminar
                                </button>
                              </td>
                            </tr>
                          ));
                        })()}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* SELECTION MODE */}
            {inspectionViewMode === 'selection' && (
              <div className="max-w-4xl mx-auto py-12 animate-slide-in">
                <div className="mb-8 text-center">
                  <button onClick={() => setInspectionViewMode('dashboard')} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 mb-4 inline-flex items-center gap-1">
                    &larr; Volver al Panel
                  </button>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Selecciona un Grupo</h2>
                  <p className="text-gray-500 dark:text-gray-400 mt-2">¿Qué grupo deseas inspeccionar hoy?</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <button onClick={() => { setSelectedInspectionGroup('directive'); setInspectionViewMode('list'); }}
                    className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border-t-4 border-purple-500 hover:shadow-xl transition-all hover:-translate-y-1 group">
                    <Award className="w-10 h-10 text-purple-600 mb-4 group-hover:scale-110 transition-transform" />
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Directiva</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-xs">Oficiales</p>
                  </button>

                  <button onClick={() => { setSelectedInspectionGroup('aventureros'); setInspectionViewMode('list'); }}
                    className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border-t-4 border-orange-500 hover:shadow-xl transition-all hover:-translate-y-1 group">
                    <Sun className="w-10 h-10 text-orange-600 mb-4 group-hover:scale-110 transition-transform" />
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Aventureros</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-xs">4 - 9 años</p>
                  </button>

                  <button onClick={() => { setSelectedInspectionGroup('conquistadores'); setInspectionViewMode('list'); }}
                    className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border-t-4 border-blue-500 hover:shadow-xl transition-all hover:-translate-y-1 group">
                    <MapPin className="w-10 h-10 text-blue-600 mb-4 group-hover:scale-110 transition-transform" />
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Conquistadores</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-xs">10 - 15 años</p>
                  </button>

                  <button onClick={() => { setSelectedInspectionGroup('guias_mayores'); setInspectionViewMode('list'); }}
                    className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border-t-4 border-yellow-500 hover:shadow-xl transition-all hover:-translate-y-1 group">
                    <Crown className="w-10 h-10 text-yellow-600 mb-4 group-hover:scale-110 transition-transform" />
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Guías Mayores</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-xs">16+ años</p>
                  </button>
                </div>

                {/* SAVED REPORTS SECTION */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 mt-12">
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-gray-500" />
                    Reportes Disponibles ({new Date(bgDate).toLocaleDateString()})
                  </h3>
                  <div className="space-y-3">
                    {[
                      { id: 'directive', label: 'Directiva', icon: Award, color: 'text-purple-600' },
                      { id: 'aventureros', label: 'Aventureros', icon: Sun, color: 'text-orange-600' },
                      { id: 'conquistadores', label: 'Conquistadores', icon: MapPin, color: 'text-blue-600' },
                      { id: 'guias_mayores', label: 'Guías Mayores', icon: Crown, color: 'text-yellow-600' }
                    ].map(group => (
                      <div key={group.id} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-700 transition-colors">
                        <div className="flex items-center gap-3">
                          <group.icon className={`w-5 h-5 ${group.color}`} />
                          <span className="font-medium text-gray-700 dark:text-gray-300">{group.label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => printGlobalReport(bgDate, group.id)}
                            className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1 text-sm font-medium px-3 py-1.5 rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"
                            title="Imprimir"
                          >
                            <Printer className="w-4 h-4" /> <span className="hidden sm:inline">Imprimir</span>
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`¿Estás seguro de que deseas eliminar el reporte de ${group.label}? \n\nSe borrarán los datos de inspección de este grupo para hoy.`)) {
                                // Logic to identify members of the group
                                const isDirective = (m) => m.position && m.position.trim() !== '' && m.position !== 'Ninguno';
                                const getAge = (m) => {
                                  if (!m.dateOfBirth) return 0;
                                  return Math.abs(new Date(Date.now() - new Date(m.dateOfBirth).getTime()).getUTCFullYear() - 1970);
                                };

                                const groupMemberIds = members.filter(m => {
                                  // Special handling: Directive usually overrides age groups, so we prioritize it
                                  // But for creating reports we want to be strict.
                                  if (group.id === 'directive') return isDirective(m);

                                  // For age groups, exclude directive members to avoid duplicates if that's the desired behavior
                                  // OR keep them if they should be inspected in their age group too. 
                                  // Previous logic excluded directive from age groups: "!isDirective(m)"
                                  if (isDirective(m)) return false;

                                  const age = getAge(m);
                                  if (group.id === 'aventureros') return age >= 4 && age <= 9;
                                  if (group.id === 'conquistadores') return age >= 10 && age <= 15;
                                  if (group.id === 'guias_mayores') return age >= 16;
                                  return false;
                                }).map(m => m.id);

                                setUniformInspections(prev => prev.filter(i => !(i.date === bgDate && groupMemberIds.includes(i.memberId))));
                              }
                            }}
                            className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 flex items-center gap-1 text-sm font-medium px-2 py-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                            title="Eliminar datos del grupo"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* LIST VIEW */}
            <div className={`overflow-x-auto ${inspectionViewMode === 'list' ? 'block' : 'hidden'}`}>
              <div className="mb-4 mt-4 flex justify-between items-center px-6">
                <button onClick={() => setInspectionViewMode('selection')} className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline flex items-center gap-1">
                  &larr; Volver a Selección
                </button>
                <div className="bg-white dark:bg-gray-800 px-3 py-1 rounded shadow-sm text-sm font-medium text-gray-600 dark:text-gray-300">
                  Fecha: {new Date(bgDate).toLocaleDateString()}
                </div>
              </div>
              <div>
                {/* Filter / Sort logic reuse */}
                {(() => {
                  // 1. Separate Directive vs Regular
                  const directiveMembers = members
                    .filter(m => m.position && m.position.trim() !== '' && m.position !== 'Ninguno')
                    .sort((a, b) => {
                      const roleOrder = {
                        'Director': 1, 'Directora': 1,
                        'Subdirector': 2, 'Subdirectora': 2,
                        'Secretario': 3, 'Secretaria': 3,
                        'Tesorero': 4, 'Tesorera': 4,
                        'Capellán': 5, 'Capellana': 5,
                        'Consejero': 6, 'Consejera': 6,
                        'Instructor': 7, 'Instructora': 7
                      };
                      const getHierarchicalLevel = (pos) => {
                        if (!pos) return 99;
                        const cleanPos = pos.split(' ')[0]; // Handle 'Director de...'
                        return roleOrder[cleanPos] || 99;
                      };
                      return getHierarchicalLevel(a.position) - getHierarchicalLevel(b.position);
                    });

                  const allRegularMembers = members.filter(m => !m.position || m.position.trim() === '' || m.position === 'Ninguno');

                  const getMemberAge = (m) => {
                    if (!m.dateOfBirth) return 0;
                    const dob = new Date(m.dateOfBirth);
                    if (isNaN(dob.getTime())) return 0;
                    const ageDifMs = Date.now() - dob.getTime();
                    const ageDate = new Date(ageDifMs);
                    return Math.abs(ageDate.getUTCFullYear() - 1970);
                  };

                  const aventurerosMembers = allRegularMembers.filter(m => {
                    const age = getMemberAge(m);
                    return age >= 4 && age <= 9;
                  });
                  const conquistadoresMembers = allRegularMembers.filter(m => {
                    const age = getMemberAge(m);
                    return age >= 10 && age <= 15;
                  });
                  const guiasMayoresMembers = allRegularMembers.filter(m => {
                    const age = getMemberAge(m);
                    return age >= 16;
                  });

                  const sortRegular = (list) => {
                    const classPriority = {
                      'Amigo': 1, 'Friend': 1,
                      'Compañero': 2, 'Companion': 2,
                      'Explorador': 3, 'Explorer': 3,
                      'Orientador': 4, 'Ranger': 4,
                      'Viajero': 5, 'Voyager': 5,
                      'Guía': 6, 'Guide': 6,
                      'Guía Mayor': 99, 'Master Guide': 99
                    };
                    return list.sort((a, b) => {
                      const classA = classPriority[a.pathfinderClass] || 999;
                      const classB = classPriority[b.pathfinderClass] || 999;
                      if (classA !== classB) return classA - classB;
                      return (a.firstName || '').localeCompare(b.firstName || '');
                    });
                  };

                  const sortedAventureros = sortRegular(aventurerosMembers);
                  const sortedConquistadores = sortRegular(conquistadoresMembers);
                  const sortedGuiasMayores = sortRegular(guiasMayoresMembers);


                  // --- HELPER TO RENDER TABLE SECTIONS ---
                  const renderInspectionTable = (groupMembers, title, icon, colorClass, bgClass) => {
                    if (groupMembers.length === 0) return null;

                    return (
                      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md mb-8 overflow-hidden border border-gray-100 dark:border-gray-700">
                        <div className={`px-6 py-4 flex justify-between items-center ${bgClass} border-b border-gray-100 dark:border-gray-700`}>
                          <h3 className={`text-lg font-bold flex items-center gap-2 ${colorClass}`}>
                            {icon}
                            {title}
                            <span className="bg-white dark:bg-gray-800 bg-opacity-50 dark:bg-opacity-50 px-2 py-0.5 rounded-full text-sm ml-2">
                              {groupMembers.length}
                            </span>
                          </h3>
                        </div>

                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-900/50">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-64">Miembro</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-32">Estado</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Elementos (Clic para marcar faltante)</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-32">Acciones</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                              {groupMembers.map(member => {
                                const inspection = getInspection(member.id, bgDate);
                                const isComplete = inspection.isComplete && (!inspection.itemsMissing || inspection.itemsMissing.length === 0);

                                // Calculate Cost (Reuse logic)
                                const missingItemsForCost = inspection.itemsMissing || [];
                                const missingCost = missingItemsForCost.reduce((total, id) => {
                                  const item = uniformItems.find(i => i.id === id);
                                  if (!item) return total;
                                  // Simplified cost logic calls would go here, omitting for brevity as it's purely display
                                  return total + parseFloat(item.price || 0);
                                }, 0);


                                return (
                                  <tr key={member.id} className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 ${isComplete ? '' : 'bg-red-50/30 dark:bg-red-900/10'}`}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <div className="flex items-center">
                                        <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                                          {member.photo ? (
                                            <img src={member.photo} alt="" className="h-full w-full object-cover" />
                                          ) : (
                                            <span className="text-lg font-medium text-gray-600">
                                              {member.firstName.charAt(0)}{member.lastName.charAt(0)}
                                            </span>
                                          )}
                                        </div>
                                        <div className="ml-4">
                                          <div className="text-sm font-medium text-gray-900 dark:text-white">{member.firstName} {member.lastName}</div>
                                          <div className="text-xs text-gray-500 dark:text-gray-400">{member.position || member.pathfinderClass || 'Miembro'}</div>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${isComplete ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'}`}>
                                        {isComplete ? 'Completo' : 'Incompleto'}
                                      </span>
                                    </td>
                                    <td className="px-6 py-4">
                                      <div className="flex flex-wrap gap-2">
                                        {uniformItems.map(item => {
                                          // Reuse Gender/Directive Filter Logic
                                          const normalizeSex = (s) => {
                                            if (!s) return '';
                                            const lower = s.toLowerCase();
                                            if (lower === 'male' || lower === 'm' || lower === 'masculino') return 'M';
                                            if (lower === 'female' || lower === 'f' || lower === 'femenino') return 'F';
                                            return 'Unisex';
                                          };
                                          const itemGender = item.gender === 'Unisex' ? 'Unisex' : normalizeSex(item.gender);
                                          const memberSex = normalizeSex(member.sex || member.gender);
                                          if (itemGender !== 'Unisex' && itemGender !== memberSex) return null;
                                          const isDirective = member.position && member.position.trim() !== '' && member.position !== 'Ninguno';
                                          if (item.onlyForDirective && !isDirective) return null;


                                          return (
                                            <button
                                              key={item.id}
                                              onClick={() => toggleInspectionItem(member.id, bgDate, item.id)}
                                              className={`px-2 py-1 text-xs border rounded transition-colors ${inspection.itemsMissing?.includes(item.id)
                                                ? 'bg-red-100 border-red-300 text-red-800 font-bold shadow-sm dark:bg-red-900/30 dark:border-red-700 dark:text-red-300'
                                                : 'bg-white border-gray-200 text-gray-500 hover:border-indigo-300 hover:text-indigo-600 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400 dark:hover:border-indigo-400 dark:hover:text-indigo-300'
                                                }`}
                                              title={item.name}
                                            >
                                              {item.label}
                                            </button>
                                          );
                                        })}
                                      </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                      {!isComplete && (
                                        <button
                                          onClick={() => markInspectionComplete(member.id, bgDate)}
                                          className="text-green-600 hover:text-green-900 bg-green-50 px-3 py-1 rounded hover:bg-green-100 transition-colors dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/40"
                                        >
                                          <CheckCircle className="w-4 h-4" />
                                        </button>
                                      )}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>

                        {/* Footer / Report Button */}
                        <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                          <button
                            onClick={() => {
                              // Generate Report Data
                              const report = {
                                title: `Reporte de Uniformidad - ${title}`,
                                date: bgDate,
                                group: title,
                                itemsMissingSummary: {}, // { 'Pañoleta': 5, 'Camisa': 2 }
                                individualMissing: [] // [{ name: 'Juan', missing: ['Camisa'] }]
                              };

                              groupMembers.forEach(m => {
                                const inspection = getInspection(m.id, bgDate);
                                if (inspection.itemsMissing && inspection.itemsMissing.length > 0) {
                                  const missingNames = [];
                                  inspection.itemsMissing.forEach(itemId => {
                                    const item = uniformItems.find(i => i.id === itemId);
                                    if (item) {
                                      missingNames.push(item.label);
                                      report.itemsMissingSummary[item.label] = (report.itemsMissingSummary[item.label] || 0) + 1;
                                    }
                                  });
                                  report.individualMissing.push({
                                    name: `${m.firstName} ${m.lastName}`,
                                    missing: missingNames
                                  });
                                }
                              });

                              // PRINT REPORT FUNCTION
                              const printContent = `
                                  <html>
                                    <head>
                                      <title>${report.title}</title>
                                      <style>
                                        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #333; }
                                        .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #eee; padding-bottom: 20px; }
                                        .header h1 { margin: 0; font-size: 24px; color: #1a1a1a; }
                                        .header p { margin: 5px 0 0; color: #666; font-size: 14px; }
                                        .section { margin-bottom: 30px; }
                                        .section-title { font-size: 16px; font-weight: bold; margin-bottom: 15px; color: #4f46e5; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px; }
                                        table { w-full; border-collapse: collapse; width: 100%; font-size: 14px; }
                                        th { text-align: left; border-bottom: 1px solid #ccc; padding: 10px; background-color: #f9fafb; font-weight: 600; }
                                        td { border-bottom: 1px solid #eee; padding: 10px; }
                                        .total-row td { font-weight: bold; border-top: 2px solid #ccc; }
                                        .badge { display: inline-block; padding: 2px 8px; border-radius: 999px; font-size: 12px; font-weight: 500; }
                                        .badge-red { background-color: #fef2f2; color: #991b1b; }
                                        .empty-state { color: #6b7280; font-style: italic; text-align: center; padding: 20px; background: #f9fafb; border-radius: 8px; }
                                      </style>
                                    </head>
                                    <body>
                                      <div class="header">
                                        <h1>Club de Conquistadores Vencedores</h1>
                                        <p>${report.title}</p>
                                        <p>Fecha de Inspección: ${new Date(bgDate + 'T12:00:00').toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                      </div>

                                      <div class="section">
                                        <div class="section-title">Resumen de Faltantes (Totales)</div>
                                        ${Object.keys(report.itemsMissingSummary).length > 0 ? `
                                          <table>
                                            <thead>
                                              <tr>
                                                <th>Artículo</th>
                                                <th style="text-align: right;">Cantidad Necesaria</th>
                                              </tr>
                                            </thead>
                                            <tbody>
                                              ${Object.entries(report.itemsMissingSummary).map(([item, count]) => `
                                                <tr>
                                                  <td>${item}</td>
                                                  <td style="text-align: right; font-weight: bold;">${count}</td>
                                                </tr>
                                              `).join('')}
                                            </tbody>
                                          </table>
                                        ` : '<div class="empty-state">¡Felicitaciones! No hay elementos faltantes en este grupo.</div>'}
                                      </div>

                                      <div class="section">
                                        <div class="section-title">Detalle por Miembro</div>
                                        ${report.individualMissing.length > 0 ? `
                                          <table>
                                            <thead>
                                              <tr>
                                                <th>Nombre</th>
                                                <th>Elementos Faltantes</th>
                                              </tr>
                                            </thead>
                                            <tbody>
                                              ${report.individualMissing.map(m => `
                                                <tr>
                                                  <td style="font-weight: 500;">${m.name}</td>
                                                  <td>
                                                    ${m.missing.map(item => `<span class="badge badge-red">${item}</span>`).join(' ')}
                                                  </td>
                                                </tr>
                                              `).join('')}
                                            </tbody>
                                          </table>
                                        ` : '<div class="empty-state">Todos los miembros de este grupo tienen su uniforme completo.</div>'}
                                      </div>
                                      
                                      <div style="margin-top: 50px; text-align: center; font-size: 12px; color: #9ca3af;">
                                        Generado automáticamente por el Sistema del Unity Club
                                      </div>
                                    </body>
                                  </html>
                                `;

                              const printWindow = window.open('', '', 'width=800,height=800');
                              printWindow.document.write(printContent);
                              printWindow.document.close();
                              printWindow.focus();
                              setTimeout(() => {
                                printWindow.print();
                                printWindow.close();
                              }, 500);
                            }}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-sm transition-colors"
                          >
                            <Save className="w-4 h-4" />
                            Guardar y Salir
                          </button>
                        </div>
                      </div>
                    );
                  };

                  return (
                    <>
                      {(selectedInspectionGroup === 'all' || selectedInspectionGroup === 'directive') && renderInspectionTable(directiveMembers, "Directiva", <Award className="w-5 h-5" />, "text-purple-700 dark:text-purple-300", "bg-purple-50 dark:bg-purple-900/20")}
                      {(selectedInspectionGroup === 'all' || selectedInspectionGroup === 'aventureros') && renderInspectionTable(sortedAventureros, "Aventureros (4-9)", <Sun className="w-5 h-5" />, "text-orange-700 dark:text-orange-300", "bg-orange-50 dark:bg-orange-900/20")}
                      {(selectedInspectionGroup === 'all' || selectedInspectionGroup === 'conquistadores') && renderInspectionTable(sortedConquistadores, "Conquistadores (10-15)", <MapPin className="w-5 h-5" />, "text-blue-700 dark:text-blue-300", "bg-blue-50 dark:bg-blue-900/20")}
                      {(selectedInspectionGroup === 'all' || selectedInspectionGroup === 'guias_mayores') && renderInspectionTable(sortedGuiasMayores, "Guías Mayores (16+)", <Crown className="w-5 h-5" />, "text-yellow-700 dark:text-yellow-300", "bg-yellow-50 dark:bg-yellow-900/20")}
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        )
        }

        {/* INVENTORY VIEW */}
        {
          uniformityTab === 'inventory' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 dark:bg-gray-900/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider sticky left-0 bg-gray-50 dark:bg-gray-800 z-10 w-48">Miembro</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Talla Camisa</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Talla Pantalón/Falda</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {members.map(member => {
                      const data = memberUniforms[member.id] || {};

                      return (
                        <tr key={member.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                          <td className="px-4 py-3 whitespace-nowrap sticky left-0 bg-white dark:bg-gray-800 z-10">
                            <div className="flex items-center">
                              <div className="h-8 w-8 flex-shrink-0 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs mr-3 dark:text-white">
                                {member.firstName.charAt(0)}{member.lastName.charAt(0)}
                              </div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white">{member.firstName} {member.lastName}</div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <input
                              type="text"
                              className="w-16 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded text-center focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              value={data.shirtSize || ''}
                              onChange={(e) => updateMemberUniform(member.id, 'shirtSize', e.target.value)}
                              placeholder="-"
                            />
                          </td>
                          <td className="px-4 py-3 text-center">
                            <input
                              type="text"
                              className="w-16 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded text-center focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              value={data.pantsSize || ''}
                              onChange={(e) => updateMemberUniform(member.id, 'pantsSize', e.target.value)}
                              placeholder="-"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )
        }

        {/* SETTINGS VIEW */}
        {
          uniformityTab === 'settings' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white">Configuración de Elementos</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">Administra la lista y precios del uniforme.</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowUniformCategoryModal(true)}
                    className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
                  >
                    <List className="w-4 h-4" />
                    Gestionar Categorías
                  </button>
                  <button
                    onClick={openNewItemForm}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Nuevo Elemento
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto border rounded-lg dark:border-gray-700">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-900/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Elemento</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Categoría</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Precio</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {uniformItems.map((item, index) => (
                      <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{item.label}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{item.category}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">${parseFloat(item.price || 0).toFixed(2)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <div className="flex flex-col mr-2">
                              <button
                                onClick={() => handleMoveItemUp(index)}
                                disabled={index === 0}
                                className={`p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded ${index === 0 ? 'text-gray-300 dark:text-gray-600' : 'text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400'}`}
                              >
                                <ChevronUp className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleMoveItemDown(index)}
                                disabled={index === uniformItems.length - 1}
                                className={`p-1 hover:bg-gray-100 rounded ${index === uniformItems.length - 1 ? 'text-gray-300' : 'text-gray-600 hover:text-indigo-600'}`}
                              >
                                <ChevronDown className="w-4 h-4" />
                              </button>
                            </div>
                            <button
                              onClick={() => openEditItemForm(item)}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        }

        {/* Modal for Categories */}
        {
          showUniformCategoryModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-scale-in">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-gray-900">Gestionar Categorías</h3>
                  <button onClick={() => setShowUniformCategoryModal(false)} className="text-gray-400 hover:text-gray-600">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="mb-4 flex gap-2">
                  <input
                    type="text"
                    value={newUniformCategory}
                    onChange={(e) => setNewUniformCategory(e.target.value)}
                    placeholder="Nueva categoría..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <button
                    onClick={handleAddCategory}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {uniformCategories.map((category, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded border">
                      <span className="text-gray-700">{category}</span>
                      <button
                        onClick={() => handleDeleteCategory(category)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )
        }

        {/* Modal for Add/Edit Item */}
        {
          showItemForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6 animate-scale-in">
                <div className="flex justify-between items-center mb-4 sticky top-0 bg-white z-10 pb-2 border-b">
                  <h3 className="text-xl font-bold text-gray-900">
                    {editingItem ? 'Editar Elemento' : 'Nuevo Elemento'}
                  </h3>
                  <button onClick={() => setShowItemForm(false)} className="text-gray-400 hover:text-gray-600">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Elemento</label>
                    <input
                      type="text"
                      value={itemFormData.label}
                      onChange={(e) => setItemFormData({ ...itemFormData, label: e.target.value, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Ej: Camisa, Pañoleta..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                    <select
                      value={itemFormData.category}
                      onChange={(e) => setItemFormData({ ...itemFormData, category: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      {uniformCategories.map((cat, index) => (
                        <option key={index} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sexo (Filtrado Automático)</label>
                    <select
                      value={itemFormData.gender}
                      onChange={(e) => setItemFormData({ ...itemFormData, gender: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="Unisex">Unisex (Todos)</option>
                      <option value="M">Masculino</option>
                      <option value="F">Femenino</option>
                    </select>
                  </div>

                  <div className="flex items-center mb-4">
                    <input
                      type="checkbox"
                      id="onlyForDirective"
                      checked={itemFormData.onlyForDirective}
                      onChange={(e) => setItemFormData({ ...itemFormData, onlyForDirective: e.target.checked })}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="onlyForDirective" className="ml-2 block text-sm text-gray-900">
                      Solo para Directivos (ej: Cordones, Insignias de Cargo)
                    </label>
                  </div>

                  <div className="flex items-center mb-4">
                    <input
                      type="checkbox"
                      id="hasVariants"
                      checked={itemFormData.hasVariants}
                      onChange={(e) => setItemFormData({ ...itemFormData, hasVariants: e.target.checked })}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="hasVariants" className="ml-2 block text-sm text-gray-900">
                      ¿Tiene Variantes de Precio? (ej: Tallas)
                    </label>
                  </div>

                  {!itemFormData.hasVariants ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Precio Estimado ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={itemFormData.price}
                        onChange={(e) => setItemFormData({ ...itemFormData, price: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  ) : (
                    <div className="bg-gray-50 p-3 rounded-lg border">
                      <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Vincular con Talla del Miembro</label>
                        <select
                          value={itemFormData.sizeType}
                          onChange={(e) => setItemFormData({ ...itemFormData, sizeType: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        >
                          <option value="none">-- Sin Vinculación --</option>
                          <option value="shirtSize">Talla de Camisa</option>
                          <option value="pantsSize">Talla de Pantalón/Falda</option>
                        </select>
                        <p className="text-xs text-gray-500 mt-1">Si seleccionas una, el sistema usará la talla del miembro para buscar el precio.</p>
                      </div>

                      <label className="block text-sm font-medium text-gray-700 mb-2">Lista de Variantes</label>
                      {itemFormData.variants.map((variant, idx) => (
                        <div key={idx} className="flex gap-2 mb-2">
                          <input
                            type="text"
                            placeholder="Etiqueta (ej: S, 10, Grande)"
                            value={variant.label}
                            onChange={(e) => {
                              const newVariants = [...itemFormData.variants];
                              newVariants[idx].label = e.target.value;
                              setItemFormData({ ...itemFormData, variants: newVariants });
                            }}
                            className="flex-1 px-2 py-1 border rounded text-sm"
                          />
                          <input
                            type="number"
                            placeholder="Precio"
                            value={variant.price}
                            step="0.01"
                            onChange={(e) => {
                              const newVariants = [...itemFormData.variants];
                              newVariants[idx].price = e.target.value;
                              setItemFormData({ ...itemFormData, variants: newVariants });
                            }}
                            className="w-24 px-2 py-1 border rounded text-sm"
                          />
                          <button
                            onClick={() => {
                              const newVariants = itemFormData.variants.filter((_, i) => i !== idx);
                              setItemFormData({ ...itemFormData, variants: newVariants });
                            }}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => setItemFormData({
                          ...itemFormData,
                          variants: [...itemFormData.variants, { label: '', price: 0 }]
                        })}
                        className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1 mt-2"
                      >
                        <Plus className="w-3 h-3" /> Añadir Variante
                      </button>
                    </div>
                  )}

                  <div className="flex justify-end gap-3 mt-6">
                    <button
                      onClick={() => setShowItemForm(false)}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSaveItem}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                      Guardar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        }
      </div >
    );
  };



  const renderMemberProfile = () => {
    if (!viewingMember) return null;

    const member = viewingMember;
    const age = calculateAge(member.dateOfBirth);
    const unitName = units.find(u => u.id === member.unitId)?.name || 'Sin Asignar';
    const totalPoints = points
      .filter(p => p.memberId === member.id)
      .reduce((sum, p) => sum + parseInt(p.points || 0), 0);
    const attendanceCount = points.filter(p => p.memberId === member.id && p.reason === 'Asistencia').length;

    // --- HELPER LOGIC FOR PROFILE ---

    // 1. Financials
    const memberTransactions = transactions.filter(t => t.memberId === member.id).sort((a, b) => new Date(b.date) - new Date(a.date));
    const totalPaid = memberTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

    // Calculate expected dues (simplified version of handleCalculateDues)
    let expectedDues = 0;
    if (duesStartDate) {
      const start = new Date(duesStartDate);
      const now = new Date();
      // Logic to count Saturdays (simplified for display)
      // For now, we might want to rely on a more robust helper or just show "Paid" vs "History"
      // If we can't easily replicate the complex Saturday counting logic here without code duplication,
      // we'll focus on the Transaction History and Total Paid.
      // *Wait, I can re-use the exact same logic if I copy it or if I extracted it.
      // For this immediate task, let's show the Transaction History and Total Balance (if available from summary or calculated).
    }

    // 2. Uniform Status (Latest Inspection)
    const latestInspectionDate = Object.keys(uniformInspections).sort().pop(); // Get last date
    const latestInspection = latestInspectionDate ? uniformInspections[latestInspectionDate]?.[member.id] : null;
    const missingUniformItems = latestInspection && latestInspection.itemsMissing ?
      latestInspection.itemsMissing.map(id => uniformItems.find(i => i.id === id)).filter(Boolean) : [];

    // 3. Points History
    const recentPoints = points.filter(p => p.memberId === member.id).sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10);

    // 4. Class Translation Helper
    const translateClass = (cls) => {
      const map = {
        'Friend': 'Amigo',
        'Companion': 'Compañero',
        'Explorer': 'Explorador',
        'Ranger': 'Orientador',
        'Voyager': 'Viajero',
        'Guide': 'Guía',
        'Master Guide': 'Guía Mayor',
        'Master Guide Advanced': 'Guía Mayor Investido'
      };
      return map[cls] || cls;
    };

    const isDirective = !!member.position;

    return (
      <div className="bg-gray-100 dark:bg-gray-900 min-h-screen pb-12">
        {/* Cover Image & Header */}
        <div className="bg-white dark:bg-gray-800 shadow-sm mb-6 pb-6">
          <div className="h-48 bg-gradient-to-r from-blue-600 to-indigo-700 relative">
            <button
              onClick={handleBackFromProfile}
              className="absolute top-4 left-4 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full backdrop-blur-sm transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="absolute top-4 right-4 flex gap-2">
              <button
                onClick={() => printMemberForm(member)}
                className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-full backdrop-blur-sm transition-colors flex items-center gap-2 px-4"
              >
                <Printer className="w-4 h-4" />
                <span className="text-sm font-medium">Imprimir Ficha</span>
              </button>
            </div>
          </div>

          <div className="max-w-6xl mx-auto px-6">
            <div className="flex flex-col md:flex-row items-end -mt-16 mb-4 gap-6">
              <div className="relative">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white dark:border-gray-800 shadow-lg bg-gray-200 dark:bg-gray-700 overflow-hidden">
                  {member.photo ? (
                    <img src={member.photo} alt={member.firstName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-600 text-gray-400 dark:text-gray-300">
                      <Users className="w-16 h-16" />
                    </div>
                  )}
                </div>
                <div className={`absolute bottom-2 right-2 w-6 h-6 rounded-full border-2 border-white dark:border-gray-800 ${member.status === 'Inactive' ? 'bg-gray-400' : 'bg-green-500'}`} title={member.status === 'Inactive' ? 'Inactivo' : 'Activo'}></div>
              </div>

              <div className="flex-1 pb-2">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{member.firstName} {member.lastName}</h1>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 px-3 py-1 rounded-full text-sm font-medium">
                    {translatePosition(member.position, member.gender) || translateClass(member.pathfinderClass) || 'Miembro'}
                  </span>
                  {!isDirective && (
                    <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                      <Users className="w-3 h-3" /> {unitName}
                    </span>
                  )}
                  {member.sex && (
                    <span className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-3 py-1 rounded-full text-sm font-medium">
                      {member.sex === 'M' ? 'Masculino' : 'Femenino'}
                    </span>
                  )}
                  <span className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-3 py-1 rounded-full text-sm font-medium">
                    {age} años
                  </span>
                </div>
              </div>

              <div className="flex gap-3 pb-2">
                <button
                  onClick={() => {
                    setEditingMember(member);
                    setFormData(member);
                    setShowForm(true);
                    setActiveModule('members');
                  }}
                  className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 px-4 py-2 rounded-lg font-medium shadow-sm transition-colors flex items-center gap-2"
                >
                  <Edit2 className="w-4 h-4" /> Editar Perfil
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">


            {/* Personal Details Detailed Card - Horizontal Layout */}
            <div className="lg:col-span-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2 border-b dark:border-gray-700 pb-2">
                <IdCard className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                Información Personal
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                {/* COL 1: Basic Info */}
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    Básico
                  </h4>
                  <div>
                    <span className="block text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Fecha de Nacimiento</span>
                    <span className="font-medium text-gray-900 dark:text-white">{new Date(member.dateOfBirth).toLocaleDateString()} ({age} años)</span>
                  </div>
                  <div>
                    <span className="block text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Dirección</span>
                    <span className="font-medium text-gray-900 dark:text-white">{member.address || 'No registrada'}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Teléfono</span>
                    <span className="font-medium text-gray-900 dark:text-white">{formatPhone(member.primaryContact)}</span>
                  </div>
                </div>

                {/* COL 2: Spiritual Life */}
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-blue-500" />
                    Vida Espiritual
                  </h4>
                  <div>
                    <span className="block text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Religión</span>
                    <span className="font-medium text-gray-900 dark:text-white">{member.religion || 'No registrada'}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Bautismo</span>
                    {member.baptismDate ? (
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900 dark:text-white">{new Date(member.baptismDate).toLocaleDateString()}</span>
                        <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                          {(() => {
                            const baptDate = new Date(member.baptismDate);
                            const now = new Date();
                            let years = now.getFullYear() - baptDate.getFullYear();
                            let months = now.getMonth() - baptDate.getMonth();
                            if (months < 0) {
                              years--;
                              months += 12;
                            }
                            if (years > 0) return `${years} año${years !== 1 ? 's' : ''} y ${months} mes${months !== 1 ? 'es' : ''} de bautizado`;
                            return `${months} mes${months !== 1 ? 'es' : ''} de bautizado`;
                          })()}
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-500 dark:text-gray-400 italic">No bautizado</span>
                    )}
                  </div>
                </div>

                {/* COL 3: Medical & Emergency */}
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <Heart className="w-4 h-4 text-red-500" />
                    Salud
                  </h4>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="block text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Sangre</span>
                      <span className="px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 font-bold text-xs inline-block">
                        {member.bloodType || '?'}
                      </span>
                    </div>
                    <div>
                      <span className="block text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Seguro</span>
                      <span className="font-medium text-gray-900 dark:text-white text-xs truncate" title={member.insuranceProvider}>
                        {member.insuranceProvider || 'N/A'}
                      </span>
                    </div>
                  </div>

                  {member.allergies && (
                    <div>
                      <span className="block text-xs text-red-600 dark:text-red-400 font-bold uppercase tracking-wide">Alergias</span>
                      <span className="text-red-700 dark:text-red-300 text-sm bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded block">{member.allergies}</span>
                    </div>
                  )}

                  {member.doctorName && (
                    <div>
                      <span className="block text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Doctor</span>
                      <span className="text-gray-800 dark:text-white text-xs">{member.doctorName} {member.doctorPhone && `(${formatPhone(member.doctorPhone)})`}</span>
                    </div>
                  )}
                </div>

                {/* COL 4: Family & Emergency Contact */}
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-green-600" />
                    Contactos
                  </h4>

                  <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-100 dark:border-red-800 mb-2">
                    <span className="block text-xs text-red-800 dark:text-red-300 uppercase font-bold mb-1">Emergencia</span>
                    <div className="text-sm">
                      <div className="font-bold text-gray-900 dark:text-white">{member.emergencyContactName}</div>
                      <div className="text-gray-600 dark:text-gray-400 text-xs flex flex-col">
                        <span>{member.emergencyContactRelationship}</span>
                        <a href={`tel:${member.emergencyContactPhone}`} className="hover:underline font-medium">{formatPhone(member.emergencyContactPhone)}</a>
                      </div>
                    </div>
                  </div>

                  {(member.fatherName || member.motherName) && (
                    <div className="text-xs space-y-1">
                      {member.fatherName && (
                        <div className="flex justify-between">
                          <span className="text-gray-500 dark:text-gray-400">Padre:</span>
                          <span className="font-medium text-gray-900 dark:text-white truncate max-w-[120px]" title={member.fatherName}>{member.fatherName}</span>
                        </div>
                      )}
                      {member.motherName && (
                        <div className="flex justify-between">
                          <span className="text-gray-500 dark:text-gray-400">Madre:</span>
                          <span className="font-medium text-gray-900 dark:text-white truncate max-w-[120px]" title={member.motherName}>{member.motherName}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

              </div>
            </div>

            {/* COLUMN 1: Uniform & Status */}
            <div className="space-y-6">
              {/* Uniform Status Card */}
              {/* Uniformity Section - Visual & List */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2 border-b dark:border-gray-700 pb-2">
                  <Shirt className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  Uniformidad
                </h3>

                <div className="flex flex-col">
                  {/* Status List */}
                  <div className="w-full">
                    {latestInspection ? (
                      <>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-500 dark:text-gray-400">Última Inspección:</span>
                          <span className="font-medium text-gray-800 dark:text-gray-200">{latestInspectionDate}</span>
                        </div>
                        {missingUniformItems.length === 0 ? (
                          <div className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 p-3 rounded-lg flex items-center gap-2">
                            <CheckCircle className="w-5 h-5" />
                            <span className="font-medium">Uniforme Completo</span>
                          </div>
                        ) : (
                          <div className="bg-red-50 dark:bg-red-900/30 p-3 rounded-lg border border-red-100 dark:border-red-800">
                            <div className="flex items-center gap-2 text-red-700 dark:text-red-300 font-medium mb-2">
                              <AlertTriangle className="w-5 h-5" />
                              <span>Elementos Faltantes:</span>
                            </div>
                            <ul className="list-disc list-inside text-sm text-red-600 dark:text-red-400 space-y-1">
                              {missingUniformItems.map(item => (
                                <li key={item.id}>{item.label}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </>
                    ) : (
                      <p className="text-gray-500 text-sm italic py-4 text-center">No hay inspecciones registradas.</p>
                    )}
                  </div>

                  {/* Sizes */}
                  <div className="mt-4 pt-4 border-t w-full">
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Tallas Registradas</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded">
                        <span className="text-gray-500 dark:text-gray-400 block text-xs">Camisa</span>
                        <span className="font-medium text-gray-900 dark:text-white">{member.shirtSize || '-'}</span>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded">
                        <span className="text-gray-500 dark:text-gray-400 block text-xs">Pantalón/Falda</span>
                        <span className="font-medium text-gray-900 dark:text-white">{member.pantsSize || '-'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Summary - Hide for Directive */}
              {!isDirective && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                    Resumen
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg">
                      <span className="text-indigo-700 font-medium">Puntos Acumulados</span>
                      <span className="text-2xl font-bold text-indigo-800">{totalPoints}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <span className="text-green-700 font-medium">Asistencias</span>
                      <span className="text-2xl font-bold text-green-800">{attendanceCount}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* COLUMN 2: Finances */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm p-6 h-full">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Wallet className="w-5 h-5 text-green-600" />
                    Finanzas
                  </h3>
                  <div className="text-right">
                    <span className="block text-xs text-gray-500 uppercase">Total Pagado</span>
                    <span className="text-xl font-bold text-green-600">{formatCurrency(totalPaid)}</span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Historial de Transacciones</h4>
                  {memberTransactions.length === 0 ? (
                    <p className="text-gray-500 text-sm text-center py-4">No hay transacciones registradas.</p>
                  ) : (
                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                      {memberTransactions.map(t => (
                        <div key={t.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                          <div>
                            <div className="font-medium text-gray-900">{t.category}</div>
                            <div className="text-xs text-gray-500">{new Date(t.date).toLocaleDateString()}</div>
                          </div>
                          <span className={`font-bold ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                            {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* COLUMN 3: Details & Progress */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-yellow-600" />
                  Progreso y Clase
                </h3>

                <div className="mb-6">
                  <div className="text-sm text-gray-500 mb-1">Clase Actual</div>
                  <div className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-indigo-500" />
                    {translateClass(member.pathfinderClass) || 'Sin Clase'}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Últimas Actividades {isDirective ? '' : '(Puntos)'}</h4>

                  {!isDirective ? (
                    recentPoints.length === 0 ? (
                      <p className="text-gray-500 text-sm italic">No hay actividad reciente.</p>
                    ) : (
                      <div className="space-y-3">
                        {recentPoints.map(p => (
                          <div key={p.id} className="text-sm border-l-2 border-indigo-200 pl-3 py-1">
                            <div className="font-medium text-gray-900">{p.reason}</div>
                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                              <span>{new Date(p.date).toLocaleDateString()}</span>
                              <span className="font-bold text-indigo-600">+{p.points} pts</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                  ) : (
                    <p className="text-gray-500 text-sm italic">Las actividades de directiva no acumulan puntos.</p>
                  )}
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    );
  };



  const generateIdCard = (member) => {
    const printWindow = window.open('', '', 'width=800,height=600');
    // Default logo/photo if missing
    const logoSrc = "https://clubvencedores.org/logo.png"; // Replace with actual default or keep empty handling
    const photoSrc = member.photo || "https://via.placeholder.com/150?text=No+Photo";

    printWindow.document.write(`
      <html>
        <head>
          <title>ID Card - ${member.firstName} ${member.lastName}</title>
          <style>
            @media print {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            body { 
              font-family: 'Arial', sans-serif; 
              display: flex; 
              justify-content: center; 
              align-items: center; 
              height: 100vh; 
              margin: 0; 
              background-color: #f0f0f0;
            }
            .id-card {
              width: 350px;
              height: 220px;
              border-radius: 10px;
              background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
              color: white;
              position: relative;
              overflow: hidden;
              box-shadow: 0 4px 15px rgba(0,0,0,0.3);
              display: flex;
              flex-direction: column;
              border: 1px solid #ccc;
            }
            .header {
              display: flex;
              align-items: center;
              padding: 10px;
              background-color: rgba(0,0,0,0.1);
            }
            .logo {
              width: 40px;
              height: 40px;
              margin-right: 10px;
              border-radius: 50%;
              background: white;
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: bold;
              color: #c0392b;
              font-size: 8pt;
            }
            .club-name {
              font-size: 14pt;
              font-weight: bold;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            .body {
              display: flex;
              padding: 15px;
              flex: 1;
            }
            .photo-container {
              width: 90px;
              height: 110px;
              background-color: white;
              border: 3px solid white;
              border-radius: 5px;
              overflow: hidden;
              margin-right: 15px;
              box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            }
            .photo {
              width: 100%;
              height: 100%;
              object-fit: cover;
            }
            .details {
              flex: 1;
              display: flex;
              flex-direction: column;
              justify-content: center;
            }
            .name {
              font-size: 16pt;
              font-weight: bold;
              margin-bottom: 5px;
              text-shadow: 1px 1px 2px rgba(0,0,0,0.2);
            }
            .role {
              font-size: 10pt;
              background-color: rgba(255,255,255,0.2);
              padding: 2px 8px;
              border-radius: 4px;
              display: inline-block;
              margin-bottom: 8px;
              text-transform: uppercase;
              font-weight: bold;
            }
            .info-row {
              font-size: 9pt;
              margin-bottom: 3px;
              opacity: 0.9;
            }
            .footer {
              background-color: #2c3e50;
              padding: 5px 15px;
              font-size: 7pt;
              text-align: right;
              color: #ecf0f1;
            }
            .watermark {
              position: absolute;
              bottom: -20px;
              right: -20px;
              font-size: 100pt;
              opacity: 0.1;
              color: white;
              transform: rotate(-15deg);
              pointer-events: none;
            }
          </style>
        </head>
        <body>
          <div class="id-card">
            <div class="watermark">⚠</div>
            <div class="header">
              <div class="logo">LOG</div>
              <div class="club-name">Unity Club</div>
            </div>
            <div class="body">
              <div class="photo-container">
                <img src="${photoSrc}" class="photo" alt="Photo" />
              </div>
              <div class="details">
                <div class="name">${member.firstName}</div>
                <div class="name">${member.lastName}</div>
                <div class="role">${translatePosition(member.position, member.gender) || member.unitRole || 'Member'}</div>
                <div class="info-row"><strong>Class:</strong> ${member.pathfinderClass || 'N/A'}</div>
                <div class="info-row"><strong>Unit:</strong> ${members.find(m => m.id === member.unitId)?.name || 'Unassigned'}</div>
                <div class="info-row"><strong>ID:</strong> ${member.id.substring(0, 8)}</div>
              </div>
            </div>
            <div class="footer">
              OFFICIAL PATHFINDER CLUB ID CARD • VALID 2026
            </div>
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleCancelActivity = () => {
    resetActivityForm();
    setShowActivityForm(false);
  };

  // Sort activities by date
  const sortedActivities = [...activities].sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.time}`);
    const dateB = new Date(`${b.date}T${b.time}`);
    return dateB - dateA;
  });

  // Get upcoming activities
  const upcomingActivities = activities.filter(activity => {
    const activityDate = new Date(`${activity.date}T${activity.time}`);
    return activityDate >= new Date();
  }).sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.time}`);
    const dateB = new Date(`${b.date}T${b.time}`);
    return dateA - dateB;
  });

  // Get all unique parents from members
  const getAllParents = () => {
    const parentsMap = new Map();

    members.forEach(member => {
      // Add father if exists
      if (member.fatherName && member.fatherName.trim()) {
        const fatherKey = member.fatherName.trim().toLowerCase();

        if (!parentsMap.has(fatherKey)) {
          parentsMap.set(fatherKey, {
            id: `father-${fatherKey}`,
            name: member.fatherName.trim(),
            contact: member.fatherContact || 'N/A',
            type: 'Father',
            children: []
          });
        }
        parentsMap.get(fatherKey).children.push(member);
      }

      // Add mother if exists
      if (member.motherName && member.motherName.trim()) {
        const motherKey = member.motherName.trim().toLowerCase();

        if (!parentsMap.has(motherKey)) {
          parentsMap.set(motherKey, {
            id: `mother-${motherKey}`,
            name: member.motherName.trim(),
            contact: member.motherContact || 'N/A',
            type: 'Mother',
            children: []
          });
        }
        parentsMap.get(motherKey).children.push(member);
      }
    });

    return Array.from(parentsMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  };

  const allParents = getAllParents();

  // Cuotas functions
  const recordCuotaPayment = (memberId, amount, date) => {
    const payment = {
      id: Date.now().toString(),
      memberId,
      amount: parseFloat(amount),
      date,
      timestamp: new Date().toISOString()
    };

    setCuotaPayments(prev => [...prev, payment]);

    // Also add to transactions
    const member = members.find(m => m.id === memberId);
    if (member) {
      const transaction = {
        id: Date.now().toString(),
        type: 'income',
        category: 'Fees',
        amount: parseFloat(amount),
        date: date,
        description: `Fee - ${member.firstName} ${member.lastName}`,
        paymentMethod: 'Cash',
        memberId: memberId
      };
      setTransactions(prev => [...prev, transaction]);
    }
  };

  const getCuotaPaymentsForDate = (date) => {
    return cuotaPayments.filter(payment => payment.date === date);
  };

  const getMemberCuotaTotal = (memberId) => {
    return cuotaPayments
      .filter(payment => payment.memberId === memberId)
      .reduce((sum, payment) => sum + payment.amount, 0);
  };

  const getCuotaPaymentForMemberAndDate = (memberId, date) => {
    return cuotaPayments.find(payment =>
      payment.memberId === memberId && payment.date === date
    );
  };

  const handleSetStartDate = () => {
    const date = window.prompt("Ingrese la fecha de inicio de cobro (YYYY-MM-DD):", duesStartDate);
    if (date !== null) setDuesStartDate(date);
  };

  const toggleSkippedSaturday = () => {
    if (skippedSaturdays.includes(selectedCuotaDate)) {
      setSkippedSaturdays(skippedSaturdays.filter(d => d !== selectedCuotaDate));
    } else {
      setSkippedSaturdays([...skippedSaturdays, selectedCuotaDate]);
    }
  };

  // Get all Saturdays between two dates
  const getSaturdaysBetween = (startDate, endDate) => {
    const saturdays = [];
    const current = new Date(startDate);
    const end = new Date(endDate);

    // Find first Saturday
    while (current.getDay() !== 6) {
      current.setDate(current.getDate() + 1);
    }

    // Collect all Saturdays
    while (current <= end) {
      saturdays.push(new Date(current).toISOString().split('T')[0]);
      current.setDate(current.getDate() + 7);
    }

    return saturdays;
  };

  const handleWaiveDebt = (member) => {
    if (!confirm(`¿Está seguro de eliminar la deuda de ${member.firstName} ${member.lastName}? Esto registrará un "pago" de $0 para las semanas pendientes.`)) return;

    if (!member.debt || !member.debt.missedDates) return;

    const newPayments = member.debt.missedDates.map(date => ({
      id: Date.now() + Math.random().toString(36).substr(2, 9),
      type: 'income',
      category: 'inc_1', // Cuotas
      amount: 0,
      date: date, // The missed saturday date
      description: 'Condonación de deuda (Waiver)',
      paymentMethod: 'Waiver',
      memberId: member.id,
      timestamp: new Date().toISOString(),
      status: 'official'
    }));

    setCuotaPayments([...cuotaPayments, ...newPayments]);

    // Also add to transactions log for transparency
    const newTransactions = newPayments.map(p => ({
      ...p,
      id: `trans_${p.id}`
    }));
    setTransactions([...transactions, ...newTransactions]);
  };

  const handleDeletePayment = (paymentId) => {
    if (!confirm('¿Está seguro de eliminar este registro de pago?')) return;
    setCuotaPayments(cuotaPayments.filter(p => p.id !== paymentId));
  };

  const handleClearHistory = () => {
    if (!confirm('ADVERTENCIA: ¿Está seguro de eliminar TODO el historial de pagos? Esta acción no se puede deshacer.')) return;
    if (!confirm('¿De verdad está seguro? Se perderán todos los registros de cuotas.')) return;
    setCuotaPayments([]);

  };

  const handleBulkSubmit = () => {
    const paymentsToRegister = [];
    const memberIds = Object.keys(bulkPayments);

    if (memberIds.length === 0) {
      alert('No hay montos ingresados para registrar.');
      return;
    }

    if (!confirm(`¿Está seguro de registrar ${memberIds.length} pagos?`)) return;

    memberIds.forEach(memberId => {
      const amount = parseFloat(bulkPayments[memberId]);
      if (amount > 0) {
        paymentsToRegister.push({
          id: Date.now() + Math.random().toString(36).substr(2, 9),
          type: 'income',
          category: 'inc_1', // Cuotas
          amount: amount,
          date: selectedCuotaDate,
          description: 'Pago de Cuota Semanal (Masivo)',
          paymentMethod: 'Efectivo', // Defaulting to Cash for bulk
          memberId: memberId,
          timestamp: new Date().toISOString(),
          status: 'official'
        });
      }
    });

    if (paymentsToRegister.length === 0) return;

    setCuotaPayments([...cuotaPayments, ...paymentsToRegister]);

    // Add to transactions
    const newTransactions = paymentsToRegister.map(p => ({
      ...p,
      id: `trans_${p.id}`
    }));
    setTransactions([...transactions, ...newTransactions]);

    setBulkPayments({}); // Clear form
    alert('Pagos registrados exitosamente.');
  };

  const handleClearAllTransactions = () => {
    if (!confirm('ADVERTENCIA: ¿Está seguro de eliminar TODO el historial de finanzas? Esto borrará ingresos, gastos y facturas.')) return;
    if (!confirm('Esta acción es IRREVERSIBLE. ¿Desea proceder?')) return;

    setTransactions([]);
  };

  // Calculate debt for a member
  const calculateMemberDebt = (memberId) => {
    // Determine start date
    let startDate;
    const memberPayments = cuotaPayments.filter(p => p.memberId === memberId);

    if (duesStartDate) {
      // If a global start date is set, use it
      startDate = new Date(duesStartDate);
    } else if (memberPayments.length > 0) {
      // Fallback: use first payment date if no global start date
      startDate = memberPayments.sort((a, b) =>
        new Date(a.date) - new Date(b.date)
      )[0].date;
      startDate = new Date(startDate);
    } else {
      // Fallback: default to 4 weeks ago
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 28);
    }

    const allSaturdays = getSaturdaysBetween(startDate, new Date());

    // Filter out skipped Saturdays from the expected list
    const validSaturdays = allSaturdays.filter(date => !skippedSaturdays.includes(date));

    // Determine which valid Saturdays have not been paid
    const missedDates = validSaturdays.filter(date => !getCuotaPaymentForMemberAndDate(memberId, date));

    return {
      weeksMissed: missedDates.length,
      amountOwed: missedDates.length * cuotaAmount,
      missedDates
    };
  };

  // Get members with debt
  const getMembersWithDebt = () => {
    return members.map(member => ({
      ...member,
      debt: calculateMemberDebt(member.id)
    })).filter(member => member.debt.weeksMissed > 0)
      .sort((a, b) => b.debt.amountOwed - a.debt.amountOwed);
  };

  // Login function
  const handleLogin = (e) => {
    e.preventDefault();
    setLoginError('');

    const user = users.find(u => u.username === loginUsername && u.password === loginPassword);

    if (user) {
      console.log('Login successful', user);
      setIsAuthenticated(true);
      setCurrentUser(user);
      setLoginUsername('');
      setLoginPassword('');
    } else {
      setLoginError('Invalid username or password');
    }
  };

  // Logout function
  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setActiveModule('dashboard');
    setShowAccountSettings(false);
  };

  // Account settings functions
  const openAccountSettings = () => {
    setAccountFormData({
      name: currentUser.name,
      username: currentUser.username,
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      position: currentUser.position || ''
    });
    setAccountErrors({});
    setActiveModule('account-settings');
  };

  const handleAccountInputChange = (e) => {
    const { name, value } = e.target;
    setAccountFormData(prev => ({ ...prev, [name]: value }));
    if (accountErrors[name]) {
      setAccountErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateAccountForm = () => {
    const errors = {};

    if (!accountFormData.name.trim()) {
      errors.name = 'Name  is required';
    }

    if (!accountFormData.username.trim()) {
      errors.username = 'Username is required';
    }

    // Only validate password if user is trying to change it
    if (accountFormData.newPassword || accountFormData.confirmPassword) {
      if (!accountFormData.currentPassword) {
        errors.currentPassword = 'Current password  is required to change password';
      } else if (accountFormData.currentPassword !== adminUser.password) {
        errors.currentPassword = 'Current password is incorrect';
      }

      if (!accountFormData.newPassword) {
        errors.newPassword = 'New password  is required';
      } else if (accountFormData.newPassword.length < 6) {
        errors.newPassword = 'Password must be at least 6 characters';
      }

      if (accountFormData.newPassword !== accountFormData.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }
    }

    setAccountErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAccountUpdate = () => {
    if (!validateAccountForm()) return;

    const updatedUser = {
      ...currentUser,
      name: accountFormData.name,
      username: accountFormData.username,
      position: accountFormData.position
    };

    // Update password if changed
    if (accountFormData.newPassword) {
      updatedUser.password = accountFormData.newPassword;
    }

    // Update in users array
    setUsers(prev => prev.map(u =>
      u.username === currentUser.username ? updatedUser : u
    ));

    setCurrentUser(updatedUser);
    if (currentUser.role === 'administrator') {
      setAdminUser(updatedUser);
    }

    setShowAccountSettings(false);
    setAccountFormData({
      name: '',
      username: '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      position: ''
    });
  };

  // User Management functions (Admin only)
  const handleNewUserInputChange = (e) => {
    const { name, value } = e.target;
    setNewUserFormData(prev => ({ ...prev, [name]: value }));
    if (newUserErrors[name]) {
      setNewUserErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateNewUserForm = () => {
    const errors = {};

    if (!newUserFormData.name.trim()) errors.name = 'Name  is required';
    if (!newUserFormData.username.trim()) errors.username = 'Username is required';

    // Check if username already exists
    if (users.find(u => u.username === newUserFormData.username && (!editingUser || u.username !== editingUser.username))) {
      errors.username = 'Username already exists';
    }

    if (!editingUser) {
      if (!newUserFormData.password) errors.password = 'Password is required';
      else if (newUserFormData.password.length < 6) errors.password = 'Password must be at least 6 characters';
      if (newUserFormData.password !== newUserFormData.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }
    } else {
      // Only validate password if user is trying to change it
      if (newUserFormData.password) {
        if (newUserFormData.password.length < 6) errors.password = 'Password must be at least 6 characters';
        if (newUserFormData.password !== newUserFormData.confirmPassword) {
          errors.confirmPassword = 'Passwords do not match';
        }
      }
    }

    if (!newUserFormData.position) errors.position = 'Position  is required';

    setNewUserErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddUser = () => {
    if (!validateNewUserForm()) return;

    if (editingUser) {
      // Update existing user
      const updatedUser = {
        ...editingUser,
        name: newUserFormData.name,
        username: newUserFormData.username,
        position: newUserFormData.position,
        role: 'user',
        allowedModules: newUserFormData.allowedModules || []
      };

      if (newUserFormData.password) {
        updatedUser.password = newUserFormData.password;
      }

      setUsers(prev => prev.map(u =>
        u.username === editingUser.username ? updatedUser : u
      ));
    } else {
      // Add new user
      const newUser = {
        name: newUserFormData.name,
        username: newUserFormData.username,
        password: newUserFormData.password,
        position: newUserFormData.position,
        role: 'user',
        allowedModules: newUserFormData.allowedModules || []
      };

      setUsers(prev => [...prev, newUser]);
    }

    setNewUserFormData({
      name: '',
      username: '',
      password: '',
      confirmPassword: '',
      position: '',
      role: 'user',
      allowedModules: []
    });
    setEditingUser(null);
    setShowAddUserForm(false);
  };

  const handleEditUser = (user) => {
    setNewUserFormData({
      name: user.name,
      username: user.username,
      password: '',
      confirmPassword: '',
      position: user.position,
      role: user.role,
      allowedModules: user.allowedModules || []
    });
    setEditingUser(user);
    setShowAddUserForm(true);
  };

  const handleDeleteUser = (username) => {
    if (username === adminUser.username) {
      alert('Cannot delete the main administrator account');
      return;
    }
    if (confirm('Are you sure you want to delete this user?')) {
      setUsers(prev => prev.filter(u => u.username !== username));
    }
  };

  const resetUserForm = () => {
    setNewUserFormData({
      name: '',
      username: '',
      password: '',
      confirmPassword: '',
      position: '',
      role: 'user'
    });
    setEditingUser(null);
    setNewUserErrors({});
  };

  // Inventory functions
  const handleInventoryInputChange = (e) => {
    const { name, value } = e.target;
    setInventoryFormData(prev => ({ ...prev, [name]: value }));
    if (inventoryErrors[name]) {
      setInventoryErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateInventoryForm = () => {
    const errors = {};
    if (!inventoryFormData.name.trim()) errors.name = 'Item name is required';
    if (!inventoryFormData.category) errors.category = 'Category is required';
    if (!inventoryFormData.quantity || parseInt(inventoryFormData.quantity) < 0) errors.quantity = 'Valid quantity is required';
    if (!inventoryFormData.condition) errors.condition = 'Condition is required';

    setInventoryErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const resetInventoryForm = () => {
    setInventoryFormData({
      name: '',
      category: '',
      quantity: '',
      condition: 'Good',
      location: '',
      description: ''
    });
    setEditingInventoryItem(null);
    setInventoryErrors({});
    setShowInventoryForm(false);
  };

  const handleInventorySubmit = () => {
    if (!validateInventoryForm()) return;

    if (editingInventoryItem) {
      setInventory(prev => prev.map(item =>
        item.id === editingInventoryItem.id
          ? { ...inventoryFormData, id: editingInventoryItem.id }
          : item
      ));
    } else {
      const newItem = {
        ...inventoryFormData,
        id: Date.now().toString(),
        dateAdded: new Date().toISOString()
      };
      setInventory(prev => [...prev, newItem]);
    }

    resetInventoryForm();
  };

  const handleEditInventoryItem = (item) => {
    setInventoryFormData(item);
    setEditingInventoryItem(item);
    setShowInventoryForm(true);
  };

  const handleDeleteInventoryItem = (itemId) => {
    if (confirm('Are you sure you want to delete this specific item from inventory?')) {
      setInventory(prev => prev.filter(item => item.id !== itemId));
    }
  };

  // Tent Handlers
  const handleTentInputChange = (e) => {
    const { name, value } = e.target;
    setTentFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetTentForm = () => {
    setTentFormData({
      name: '',
      capacity: 4,
      condition: 'Good',
      brand: '',
      color: ''
    });
    setEditingTent(null);
    setShowTentForm(false);
  };

  const handleTentSubmit = () => {
    if (!tentFormData.name.trim()) {
      alert('Nombre es requerido');
      return;
    }

    if (editingTent) {
      setTents(prev => prev.map(t => t.id === editingTent.id ? { ...tentFormData, id: editingTent.id } : t));
    } else {
      setTents(prev => [...prev, { ...tentFormData, id: Date.now().toString() }]);
    }
    resetTentForm();
  };

  const handleTentPhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTentFormData(prev => ({ ...prev, photo: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddCategory = () => {
    if (newCategory.trim() && !inventoryCategories.includes(newCategory.trim())) {
      setInventoryCategories(prev => [...prev, newCategory.trim()]);
      setNewCategory('');
    }
  };

  const handleDeleteCategory = (category) => {
    // Check if used
    const isUsed = inventory.some(item => item.category === category);
    if (isUsed) {
      alert(`No se puede eliminar la categoría "${category}" porque está asignada a artículos del inventario.`);
      return;
    }
    if (confirm(`¿Estás seguro de eliminar la categoría "${category}"?`)) {
      setInventoryCategories(prev => prev.filter(c => c !== category));
    }
  };

  const handleEditTent = (tent) => {
    setTentFormData(tent);
    setEditingTent(tent);
    setShowTentForm(true);
  };

  const handleDeleteTent = (id) => {
    if (confirm('¿Eliminar esta carpa?')) {
      setTents(prev => prev.filter(t => t.id !== id));
    }
  };

  const handleAssignmentChange = (memberId, isSelected) => {
    if (!currentAssignmentTent || !selectedActivityForAssignment) return;

    // Get current assignments for this tent in this activity
    const activityAssignments = tentAssignments[selectedActivityForAssignment] || {};
    const tentMemberIds = activityAssignments[currentAssignmentTent.id] || [];

    let newTentMemberIds;
    if (isSelected) {
      if (tentMemberIds.includes(memberId)) return;
      // Check capacity
      if (tentMemberIds.length >= parseInt(currentAssignmentTent.capacity)) {
        alert('Carpa llena!');
        return;
      }
      // Check if member is already assigned to another tent for this activity
      for (const tId in activityAssignments) {
        if (tId !== currentAssignmentTent.id && activityAssignments[tId].includes(memberId)) {
          if (!confirm('Este miembro ya está asignado a otra carpa. ¿Moverlo aquí?')) {
            return;
          }
          // Remove from other tent (handled by saving logic below if we update whole activity map)
        }
      }
      newTentMemberIds = [...tentMemberIds, memberId];
    } else {
      newTentMemberIds = tentMemberIds.filter(id => id !== memberId);
    }

    // Update state properly
    setTentAssignments(prev => {
      const prevActivityAssignments = prev[selectedActivityForAssignment] || {};

      // If moving from another tent, we need to clean up
      let cleanedActivityAssignments = { ...prevActivityAssignments };
      if (isSelected) {
        // Remove member from any other tent in this activity
        Object.keys(cleanedActivityAssignments).forEach(tId => {
          if (cleanedActivityAssignments[tId].includes(memberId)) {
            cleanedActivityAssignments[tId] = cleanedActivityAssignments[tId].filter(id => id !== memberId);
          }
        });
      }

      return {
        ...prev,
        [selectedActivityForAssignment]: {
          ...cleanedActivityAssignments,
          [currentAssignmentTent.id]: newTentMemberIds
        }
      };
    });
  };



  const handleInventoryPhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setInventoryFormData(prev => ({ ...prev, photo: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-600 via-red-700 to-red-800 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-700 to-red-900 p-8 text-center">
            <div className="w-64 h-64 mx-auto flex items-center justify-center">
              <ClubLogo darkMode={true} className="w-full h-full object-contain drop-shadow-lg" />
            </div>
          </div>

          {/* Login Form */}
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Iniciar Sesión</h2>

            {loginError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm text-center font-medium">{loginError}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Usuario
                </label>
                <input
                  type="text"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Ingresa tu usuario"
                  autoComplete="username"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contraseña
                </label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Ingresa tu contraseña"
                  autoComplete="current-password"
                />
              </div>

              <button
                onClick={handleLogin}
                className="w-full bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white py-3 rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl"
              >
                Entrar
              </button>
            </div>

            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">
                Club de Conquistadores Adventistas
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Calendar functions
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const getActivitiesForDate = (date) => {
    const regularActivities = activities.filter(activity => activity.date === date);

    // Master Guide Requirements with dates
    const gmRequirements = masterGuideData.requirements
      .filter(req => req.activityDate === date)
      .map(req => ({
        id: req.id,
        title: `GM: ${req.text}`,
        date: req.activityDate,
        type: 'MasterGuide',
        time: 'Todo el día'
      }));

    // Master Guide Evaluation Dates
    const gmEvaluations = [];
    if (masterGuideData.evaluationDates.first === date) {
      gmEvaluations.push({
        id: 'gm-eval-1',
        title: 'GM: 1ra Evaluación',
        date: date,
        type: 'MasterGuide',
        time: 'Todo el día',
        isEvaluation: true
      });
    }
    if (masterGuideData.evaluationDates.second === date) {
      gmEvaluations.push({
        id: 'gm-eval-2',
        title: 'GM: 2da Evaluación',
        date: date,
        type: 'MasterGuide',
        time: 'Todo el día',
        isEvaluation: true
      });
    }
    if (masterGuideData.evaluationDates.third === date) {
      gmEvaluations.push({
        id: 'gm-eval-3',
        title: 'GM: 3ra Evaluación (Investidura)',
        date: date,
        type: 'MasterGuide',
        time: 'Todo el día',
        isEvaluation: true
      });
    }

    return [...regularActivities, ...gmRequirements, ...gmEvaluations];
  };

  const navigateMonth = (direction) => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentMonth(new Date());
  };

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentMonth);
  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Activity type colors
  const getActivityTypeColor = (type) => {
    const colors = {
      'Local': 'bg-blue-100 text-blue-800 border-blue-200',
      'Distrital': 'bg-green-100 text-green-800 border-green-200',
      'Zonal': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'ACD': 'bg-purple-100 text-purple-800 border-purple-200',
      'Union': 'bg-orange-100 text-orange-800 border-orange-200',
      'Mundial': 'bg-red-100 text-red-800 border-red-200',
      'MasterGuide': 'bg-amber-100 text-amber-900 border-amber-300 font-bold'
    };
    return colors[type] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const formatMonthYear = (monthKey) => {
    const [year, month] = monthKey.split('-');
    const date = new Date(year, parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const formatCurrency = (amount) => {
    return `RD$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Main app render - authenticated
  console.log('Rendering main app, isAuthenticated:', isAuthenticated, 'currentUser:', currentUser);

  return (
    <div className="h-screen overflow-hidden bg-gray-100 dark:bg-gray-900 flex transition-colors duration-200">
      {/* Sidebar */}
      <div
        className={`bg-red-800 text-white dark:bg-gray-800 dark:border-r dark:border-gray-700 transition-all duration-300 flex flex-col ${sidebarCollapsed ? 'w-16' : 'w-64'
          } `}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-red-700 dark:border-gray-700 flex items-center justify-between">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center p-0 overflow-hidden">
                {clubSettings?.logo ? (
                  <img src={clubSettings.logo} alt="Club Logo" className="w-full h-full object-contain" />
                ) : (
                  <ClubLogo darkMode={true} className="w-full h-full object-contain" />
                )}
              </div>
              <span className="font-bold text-sm truncate">{clubSettings?.name || 'Unity Club'}</span>
            </div>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-2 hover:bg-red-700 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            {sidebarCollapsed ? <Menu className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-2 overflow-y-auto scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {menuItems.map((item) => {
            if (!item.available) return null;

            const Icon = item.icon;
            const isActive = activeModule === item.id || (item.submenu && item.submenu.some(sub => sub.id === activeModule));
            const hasSubmenu = item.submenu && item.submenu.length > 0;
            const isExpanded = expandedMenus[item.id];

            return (
              <div
                key={item.id}
                className="mb-1"
                onMouseEnter={() => hasSubmenu && setExpandedMenus(prev => ({ ...prev, [item.id]: true }))}
                onMouseLeave={() => hasSubmenu && setExpandedMenus(prev => ({ ...prev, [item.id]: false }))}
              >
                <button
                  onClick={() => handleModuleClick(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all ${isActive
                    ? 'bg-red-700 text-white shadow-lg dark:bg-gray-700'
                    : 'hover:bg-red-700/50 text-red-100 hover:text-white dark:text-gray-400 dark:hover:bg-gray-700/50 dark:hover:text-gray-200'
                    } `}
                  title={sidebarCollapsed ? item.label : ''}
                >
                  <Icon className={`${sidebarCollapsed ? 'w-6 h-6' : 'w-5 h-5'} flex-shrink-0`} />
                  {!sidebarCollapsed && (
                    <>
                      <div className="flex-1 text-left">
                        <div className="text-sm font-medium">{item.label}</div>
                      </div>
                      {hasSubmenu && (
                        isExpanded ? <ChevronDown className="w-4 h-4 opacity-75" /> : <ChevronRight className="w-4 h-4 opacity-75" />
                      )}
                    </>
                  )}
                </button>

                {/* Submenu Items */}
                {!sidebarCollapsed && hasSubmenu && (
                  <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[500px] opacity-100 mt-1' : 'max-h-0 opacity-0 mt-0'} `}>
                    <div className="pl-4 space-y-1">
                      {item.submenu.filter(sub => sub.available).map(sub => {
                        const SubIcon = sub.icon;
                        const isSubActive = activeModule === sub.id;
                        return (
                          <button
                            key={sub.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleModuleClick(sub.id);
                            }}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${isSubActive
                              ? 'bg-red-700 text-white font-medium dark:bg-gray-700'
                              : 'text-red-200 hover:bg-red-700/50 hover:text-white dark:text-gray-400 dark:hover:bg-gray-700/50 dark:hover:text-white'
                              } `}
                          >
                            <div className="w-5 flex justify-center"><div className="w-1.5 h-1.5 rounded-full bg-current opacity-60"></div></div>
                            <div className="flex-1 text-left">{sub.label}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        {!sidebarCollapsed && (
          <div className="p-4 border-t border-red-700 dark:border-gray-700">
            <div className="mb-3">
              <div className="text-xs text-red-300 dark:text-gray-400 mb-1">Logged in as:</div>
              <div className="font-semibold text-white">{currentUser?.name}</div>
              <div className="text-xs text-red-400 dark:text-gray-500">{currentUser?.position || currentUser?.role}</div>

              {currentUser?.role === 'administrator' && (
                <button
                  onClick={() => setActiveModule('user-management')}
                  className="w-full bg-red-900 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-2 mt-2 mb-2 dark:bg-gray-700 dark:hover:bg-gray-600"
                >
                  <Users className="w-4 h-4" />
                  Manage Users
                </button>
              )}

              <button
                onClick={() => setActiveModule('settings')}
                className="w-full bg-red-800 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-2 mb-2 dark:bg-gray-700 dark:hover:bg-gray-600"
              >
                <Settings className="w-4 h-4" />
                Account Settings
              </button>
            </div>
            <button
              onClick={handleLogout}
              className="w-full bg-red-600 hover:bg-red-500 text-white px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-2 dark:bg-red-900/50 dark:hover:bg-red-900"
            >
              <X className="w-4 h-4" />
              Logout
            </button>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Tab Bar Logic */}
        <div className="bg-gray-200 dark:bg-black pt-2 px-2 flex items-end gap-1 overflow-x-auto border-b border-gray-300 dark:border-gray-700 select-none">
          {tabs.map(tab => {
            const isActive = activeTabId === tab.id;
            const TabIcon = tab.icon || FileText;
            return (
              <div
                key={tab.id}
                onClick={() => setActiveTabId(tab.id)}
                className={`
                   group relative flex items-center gap-2 px-4 py-2 rounded-t-lg cursor-pointer min-w-[150px] max-w-[200px] transition-colors
                   ${isActive
                    ? 'bg-white dark:bg-gray-800 text-red-700 dark:text-red-400 shadow-sm z-10'
                    : 'bg-gray-300 dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}
                 `}
              >
                <TabIcon className="w-4 h-4" />
                <span className="text-xs font-medium truncate flex-1">{tab.label}</span>

                {/* Close Tab Button */}
                <button
                  onClick={(e) => handleCloseTab(e, tab.id)}
                  className={`
                     p-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity
                     ${isActive ? 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500' : 'hover:bg-gray-400 dark:hover:bg-gray-600 text-gray-600'}
                   `}
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            );
          })}

          {/* Add New Tab Button */}
          <button
            onClick={handleAddTab}
            className="ml-1 mb-1 p-1.5 rounded-full text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
            title="Nueva Pestaña"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
        {/* Header */}
        {/* Header - Hidden when using WhatsApp Web */}
        {/* Header - Always visible */}
        <div className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700 px-6 py-4 flex items-center justify-between transition-colors duration-200">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{clubSettings?.name || 'Unity Club'}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Sistema de Gestión Integral</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.location.reload()}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-blue-400 transition-colors"
              title="Recargar Página"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-yellow-400 transition-colors"
              title={darkMode ? "Modo Claro" : "Modo Oscuro"}
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <div className="flex items-center gap-2 bg-blue-50 dark:bg-gray-700 text-blue-700 dark:text-blue-300 px-3 py-1.5 rounded-lg font-medium text-sm">
              <Calendar className="w-4 h-4" />
              <span>{new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          <div className={activeModule === 'comm_whatsapp' ? "h-full" : "max-w-7xl mx-auto px-6 py-8"}>
            {/* User Management Modal */}
            {/* Communication Dashboard (Landing Page) */}
            {activeModule === 'communication' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { id: 'comm_groups', label: 'Grupos', icon: Users, desc: 'Gestionar grupos de WhatsApp' },
                  { id: 'comm_messaging', label: 'Mensajería Rápida', icon: MessageSquare, desc: 'Enviar mensajes predefinidos' },
                  { id: 'comm_whatsapp', label: 'WhatsApp Web', icon: MessageCircle, desc: 'Abrir WhatsApp Web' }
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => setActiveModule(item.id)}
                    className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md hover:shadow-lg transition-all flex flex-col items-center text-center gap-4 group border border-transparent hover:border-red-500"
                  >
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-full text-red-600 dark:text-red-400 group-hover:scale-110 transition-transform">
                      <item.icon className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 dark:text-white">{item.label}</h3>
                      <p className="text-gray-500 dark:text-gray-400 mt-2">{item.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Profile View */}
            {activeModule === 'profile' && renderMemberProfile()}

            {/* User Management Module */}
            {activeModule === 'user-management' && currentUser?.role === 'administrator' && (
              <div>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        <Users className="w-7 h-7 text-purple-600 dark:text-purple-400" />
                        User Management
                      </h2>
                      <p className="text-gray-600 dark:text-gray-300 mt-1">Manage system users and their permissions</p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-purple-600">{users.length}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Total Users</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                  {!showAddUserForm ? (
                    <>
                      <div className="mb-6">
                        <button
                          onClick={() => setShowAddUserForm(true)}
                          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors"
                        >
                          <Plus className="w-5 h-5" />
                          Agregar Nuevo Usuario
                        </button>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-purple-50 dark:bg-purple-900/30 border-b dark:border-purple-800">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-purple-900 dark:text-purple-100 uppercase">Nombre</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-purple-900 dark:text-purple-100 uppercase">Usuario</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-purple-900 dark:text-purple-100 uppercase">Posición</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-purple-900 dark:text-purple-100 uppercase">Rol</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-purple-900 dark:text-purple-100 uppercase">Acciones</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y dark:divide-gray-700">
                            {users.map((user) => (
                              <tr key={user.username} className="hover:bg-purple-50 dark:hover:bg-purple-900/20">
                                <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{user.name}</td>
                                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{user.username}</td>
                                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{user.position}</td>
                                <td className="px-6 py-4">
                                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${user.role === 'administrator'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                                    } `}>
                                    {user.role}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-sm">
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => handleEditUser(user)}
                                      className="text-purple-600 dark:text-purple-400 hover:text-purple-900 dark:hover:text-purple-300 font-medium"
                                    >
                                      Editar
                                    </button>
                                    {user.role !== 'administrator' && (
                                      <button
                                        onClick={() => handleDeleteUser(user.username)}
                                        className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 font-medium"
                                      >
                                        Eliminar
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  ) : (
                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <h4 className="text-xl font-bold text-gray-800 dark:text-white">
                          {editingUser ? 'Editar Usuario' : 'Agregar Nuevo Usuario'}
                        </h4>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Nombre Completo <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="name"
                            value={newUserFormData.name}
                            onChange={handleNewUserInputChange}
                            placeholder="Ingrese nombre completo"
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${newUserErrors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} `}
                          />
                          {newUserErrors.name && <p className="text-red-500 text-sm mt-1">{newUserErrors.name}</p>}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Usuario <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="username"
                            value={newUserFormData.username}
                            onChange={handleNewUserInputChange}
                            placeholder="Ingrese nombre de usuario"
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${newUserErrors.username ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} `}
                          />
                          {newUserErrors.username && <p className="text-red-500 text-sm mt-1">{newUserErrors.username}</p>}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Posición <span className="text-red-500">*</span>
                          </label>
                          <select
                            name="position"
                            value={newUserFormData.position}
                            onChange={handleNewUserInputChange}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${newUserErrors.position ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} `}
                          >
                            <option value="">Seleccionar Posición</option>
                            <option value="Assistant Director">Assistant Director</option>
                            <option value="Secretary">Secretary</option>
                            <option value="Treasurer">Treasurer</option>
                          </select>
                          {newUserErrors.position && <p className="text-red-500 text-sm mt-1">{newUserErrors.position}</p>}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Contraseña {!editingUser && <span className="text-red-500">*</span>}
                          </label>
                          <input
                            type="password"
                            name="password"
                            value={newUserFormData.password}
                            onChange={handleNewUserInputChange}
                            placeholder={editingUser ? 'Dejar en blanco para mantener actual' : 'Ingrese contraseña'}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${newUserErrors.password ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} `}
                          />
                          {newUserErrors.password && <p className="text-red-500 text-sm mt-1">{newUserErrors.password}</p>}
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Confirmar Contraseña {!editingUser && <span className="text-red-500">*</span>}
                          </label>
                          <input
                            type="password"
                            name="confirmPassword"
                            value={newUserFormData.confirmPassword}
                            onChange={handleNewUserInputChange}
                            placeholder="Confirmar contraseña"
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${newUserErrors.confirmPassword ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} `}
                          />
                          {newUserErrors.confirmPassword && <p className="text-red-500 text-sm mt-1">{newUserErrors.confirmPassword}</p>}
                        </div>

                        <div className="md:col-span-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                            <span className="font-bold block mb-1">Permisos de Módulos</span>
                            <span className="text-xs font-normal text-gray-500 dark:text-gray-400">Seleccione los módulos visibles para este usuario</span>
                          </label>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {[
                              { id: 'dashboard', label: 'Inicio' },
                              { id: 'activities', label: 'Calendario y Actividades' },
                              { id: 'ranking', label: 'Ranking' },
                              { id: 'master_guide', label: 'Guía Mayor' },
                              { id: 'birthdays', label: 'Cumpleaños' },
                              { id: 'directive', label: 'Directiva' },
                              { id: 'members', label: 'Miembros' },
                              { id: 'classes', label: 'Clases' },
                              { id: 'units', label: 'Unidades' },
                              { id: 'medical', label: 'Registros Médicos' },
                              { id: 'parents', label: 'Padres' },
                              { id: 'finances', label: 'Finanzas' },
                              { id: 'cuotas', label: 'Cuotas' },
                              { id: 'inventory', label: 'Inventario' },
                              { id: 'inventory_tents', label: 'Inventario: Carpas' },
                              { id: 'communication', label: 'Comunicación' },
                              { id: 'uniformity', label: 'Uniformidad' },
                              { id: 'reports', label: 'Reportes y Estadísticas' },
                              { id: 'idcards', label: 'Reportes: Carnets' },
                              { id: 'achievements', label: 'Miembros: Galardones' },
                              { id: 'qualifications', label: 'Miembros: Calificaciones' },
                              { id: 'points', label: 'Puntaje' },
                              { id: 'settings', label: 'Configuración' }
                            ].map(module => (
                              <label key={module.id} className="flex items-center space-x-2 p-2 border rounded hover:bg-gray-50 dark:hover:bg-gray-700 dark:border-gray-600 cursor-pointer transition-colors">
                                <input
                                  type="checkbox"
                                  checked={(newUserFormData.allowedModules || []).includes(module.id)}
                                  onChange={(e) => {
                                    const currentModules = newUserFormData.allowedModules || [];
                                    let updatedModules;
                                    if (e.target.checked) {
                                      updatedModules = [...currentModules, module.id];
                                    } else {
                                      updatedModules = currentModules.filter(id => id !== module.id);
                                    }
                                    setNewUserFormData(prev => ({ ...prev, allowedModules: updatedModules }));
                                  }}
                                  className="rounded text-purple-600 focus:ring-purple-500 w-4 h-4"
                                />
                                <span className="text-sm text-gray-700 dark:text-gray-300">{module.label}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-4 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <button
                          onClick={handleAddUser}
                          className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                        >
                          <Save className="w-5 h-5" />
                          {editingUser ? 'Actualizar Usuario' : 'Crear Usuario'}
                        </button>
                        <button
                          onClick={() => {
                            setShowAddUserForm(false);
                            resetUserForm();
                          }}
                          className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Account Settings Modal */}
            {/* Account Settings Module */}
            {activeModule === 'account-settings' && (
              <div>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        <Settings className="w-7 h-7 text-red-600 dark:text-red-400" />
                        Configuración de Cuenta
                      </h2>
                      <p className="text-gray-600 dark:text-gray-300 mt-1">Administra tu información de cuenta y contraseña</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Información de Cuenta</h4>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Nombre Completo <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={accountFormData.name}
                          onChange={handleAccountInputChange}
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${accountErrors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} `}
                        />
                        {accountErrors.name && <p className="text-red-500 text-sm mt-1">{accountErrors.name}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Usuario <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="username"
                          value={accountFormData.username}
                          onChange={handleAccountInputChange}
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${accountErrors.username ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} `}
                        />
                        {accountErrors.username && <p className="text-red-500 text-sm mt-1">{accountErrors.username}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Rol
                        </label>
                        <input
                          type="text"
                          value={currentUser.role}
                          readOnly
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-600 text-gray-600 dark:text-gray-300"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">El rol no puede ser cambiado</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Posición {currentUser.role !== 'administrator' && <span className="text-red-500">*</span>}
                        </label>
                        {currentUser.role === 'administrator' ? (
                          <>
                            <input
                              type="text"
                              value="Director"
                              readOnly
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                            />
                            <p className="text-xs text-gray-500 mt-1">Administrador es siempre Director</p>
                          </>
                        ) : (
                          <>
                            <select
                              name="position"
                              value={accountFormData.position}
                              onChange={handleAccountInputChange}
                              disabled={currentUser.role === 'administrator'}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 bg-gray-100 dark:bg-gray-700 cursor-not-allowed dark:text-gray-400"
                            >
                              <option value="">Seleccionar Posición</option>
                              <option value="Assistant Director">Subdirector</option>
                              <option value="Secretary">Secretario</option>
                              <option value="Treasurer">Tesorero</option>
                            </select>
                            <p className="text-xs text-gray-500 mt-1">Solo el administrador puede cambiar posiciones</p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-6 mt-6">
                    <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Cambiar Contraseña</h4>
                    <p className="text-sm text-gray-600 mb-4">Dejar en blanco si no quieres cambiar tu contraseña</p>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Contraseña Actual
                        </label>
                        <input
                          type="password"
                          name="currentPassword"
                          value={accountFormData.currentPassword}
                          onChange={handleAccountInputChange}
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 ${accountErrors.currentPassword ? 'border-red-500' : 'border-gray-300'
                            } `}
                          placeholder="Ingrese contraseña actual"
                        />
                        {accountErrors.currentPassword && <p className="text-red-500 text-sm mt-1">{accountErrors.currentPassword}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nueva Contraseña
                        </label>
                        <input
                          type="password"
                          name="newPassword"
                          value={accountFormData.newPassword}
                          onChange={handleAccountInputChange}
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 ${accountErrors.newPassword ? 'border-red-500' : 'border-gray-300'
                            } `}
                          placeholder="Ingrese nueva contraseña (mín 6 caracteres)"
                        />
                        {accountErrors.newPassword && <p className="text-red-500 text-sm mt-1">{accountErrors.newPassword}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Confirmar Nueva Contraseña
                        </label>
                        <input
                          type="password"
                          name="confirmPassword"
                          value={accountFormData.confirmPassword}
                          onChange={handleAccountInputChange}
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 ${accountErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                            } `}
                          placeholder="Confirmar nueva contraseña"
                        />
                        {accountErrors.confirmPassword && <p className="text-red-500 text-sm mt-1">{accountErrors.confirmPassword}</p>}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 mt-8 pt-6 border-t border-gray-200">
                    <button
                      onClick={handleAccountUpdate}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <Save className="w-5 h-5" />
                      Guardar Cambios
                    </button>
                    <button
                      onClick={() => setActiveModule('dashboard')}
                      className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            )}


            {/* Uniformity Module */}
            {activeModule === 'uniformity' && renderUniformityModule()}

            {/* Communication: Groups Module */}
            {activeModule === 'comm_groups' && (
              <div>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    <Users className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
                    Grupos de WhatsApp
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 mt-1">Gestiona los enlaces de invitación a los grupos del club.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {whatsappGroups.map(group => (
                    <div key={group.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 flex flex-col items-start hover:shadow-md transition-shadow">
                      <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 mb-4">
                        <Users className="w-6 h-6" />
                      </div>
                      <h3 className="font-bold text-lg text-gray-800 dark:text-white mb-1">{group.name}</h3>
                      <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 flex-grow">{group.description}</p>

                      {group.link ? (
                        <a
                          href={group.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
                        >
                          <MessageCircle className="w-5 h-5" />
                          Unirme al Grupo
                        </a>
                      ) : (
                        <button className="w-full bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 font-medium py-2 rounded-lg cursor-not-allowed flex items-center justify-center gap-2">
                          <MessageCircle className="w-5 h-5" />
                          Sin Enlace
                        </button>
                      )}
                      <button
                        onClick={() => setEditingGroup(group)}
                        className="mt-2 text-xs text-gray-400 hover:text-gray-600 w-full text-center"
                      >
                        Editar Enlace
                      </button>
                    </div>
                  ))}
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700 p-6 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors">
                    <PlusCircle className="w-12 h-12 text-gray-300 mb-2" />
                    <span className="text-gray-500 dark:text-gray-400 font-medium">Agregar Nuevo Grupo</span>
                  </div>
                </div>

                {/* Edit Group Modal */}
                {editingGroup && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
                      <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Editar Grupo de WhatsApp</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre del Grupo</label>
                          <input
                            type="text"
                            value={editingGroup.name}
                            onChange={(e) => setEditingGroup({ ...editingGroup, name: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Enlace de Invitación</label>
                          <input
                            type="text"
                            value={editingGroup.link}
                            onChange={(e) => setEditingGroup({ ...editingGroup, link: e.target.value })}
                            placeholder="https://chat.whatsapp.com/..."
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descripción</label>
                          <textarea
                            value={editingGroup.description}
                            onChange={(e) => setEditingGroup({ ...editingGroup, description: e.target.value })}
                            rows="3"
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          ></textarea>
                        </div>
                      </div>
                      <div className="flex gap-4 mt-6 justify-end">
                        <button
                          onClick={() => setEditingGroup(null)}
                          className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-medium"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={() => {
                            const updatedGroups = whatsappGroups.map(g => g.id === editingGroup.id ? editingGroup : g);
                            setWhatsappGroups(updatedGroups);
                            setEditingGroup(null);
                          }}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
                        >
                          Guardar Cambios
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Communication: Messaging Module */}
            {activeModule === 'comm_messaging' && (
              <div>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    <MessageSquare className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
                    Mensajería Rápida
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 mt-1">Envía mensajes de WhatsApp predefinidos a los miembros.</p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <div className="p-4 border-b bg-gray-50 dark:bg-gray-900/50 dark:border-gray-700 flex justify-between items-center">
                    <h3 className="font-bold text-gray-700 dark:text-gray-300">Miembros del Club ({members.length})</h3>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Buscar miembro..."
                        className="pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 w-64 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                  <div className="overflow-x-auto h-[600px] overflow-y-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-700 dark:text-gray-300 font-bold uppercase text-xs sticky top-0">
                        <tr>
                          <th className="px-6 py-3 bg-gray-50 dark:bg-gray-800">Nombre</th>
                          <th className="px-6 py-3 bg-gray-50 dark:bg-gray-800">Teléfono</th>
                          <th className="px-6 py-3 text-right bg-gray-50 dark:bg-gray-800">Enviar Mensaje</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {(() => {
                          // Helper logic to determine absence based on selected Points Saturday
                          const getMemberAbsence = (memberId) => {
                            if (!selectedSaturday || !selectedPointsMonth) return false;
                            const record = points.find(p => p.memberId === memberId && p.month === selectedPointsMonth);
                            if (!record || !record.saturdays || !record.saturdays[selectedSaturday]) return false;
                            // Absent if attendance is explicitly unchecked (false) or not marked present?
                            // Based on logic: attendance checkbox sets it to true/false.
                            // If it exists and is not true, they are absent.
                            return record.saturdays[selectedSaturday].attendance !== true;
                          };

                          // Sort members: Absent ones first
                          const sortedMembers = [...members].sort((a, b) => {
                            const absentA = getMemberAbsence(a.id);
                            const absentB = getMemberAbsence(b.id);
                            if (absentA && !absentB) return -1;
                            if (!absentA && absentB) return 1;
                            return a.firstName.localeCompare(b.firstName);
                          });

                          return sortedMembers.map(member => {
                            const isAbsent = getMemberAbsence(member.id);
                            return (
                              <tr key={member.id} className={`${isAbsent ? 'bg-red-50 dark:bg-red-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}>
                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                  {member.firstName} {member.lastName}
                                  {isAbsent && (
                                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border border-red-200 dark:border-red-800">
                                      Ausente
                                    </span>
                                  )}
                                </td>
                                <td className="px-6 py-4 text-gray-500 dark:text-gray-400 font-mono">
                                  {member.primaryContact ? formatPhone(member.primaryContact) : <span className="text-gray-300 italic">Sin número</span>}
                                </td>
                                <td className="px-6 py-4 text-right flex justify-end gap-2">
                                  {messageTemplates.map(template => (
                                    <button
                                      key={template.id}
                                      onClick={() => {
                                        if (!member.primaryContact) return;
                                        const phone = member.primaryContact.replace(/\D/g, '');
                                        const text = encodeURIComponent(template.text.replace('{name}', member.firstName));
                                        const url = `https://web.whatsapp.com/send?phone=${phone}&text=${text}`;

                                        setWhatsappUrl(url);
                                        setActiveModule('comm_whatsapp');
                                      }}
                                      title={template.title}
                                      disabled={!member.primaryContact}
                                      className={`p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${!member.primaryContact ? 'opacity-30 cursor-not-allowed text-gray-400' : ''} ${template.icon === 'UserMinus' && isAbsent ? 'bg-red-100 text-red-600 animate-pulse border border-red-200' : 'text-gray-600 dark:text-gray-400'}`}
                                    >
                                      {template.icon === 'DollarSign' && <DollarSign className="w-4 h-4 text-green-600" />}
                                      {template.icon === 'Bell' && <MessageCircle className="w-4 h-4 text-blue-600" />}
                                      {template.icon === 'UserMinus' && <AlertCircle className={`w-4 h-4 ${isAbsent ? 'text-red-600' : 'text-orange-600'}`} />}
                                    </button>
                                  ))}
                                </td>
                              </tr>
                            );
                          });
                        })()}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Persistent Global Components */}

            {/* WhatsApp Web - Globally Persistent, Visible only when active module */}
            {/* WhatsApp Web - Globally Persistent, Visible only when active module */}
            <div style={{ display: activeModule === 'comm_whatsapp' ? 'flex' : 'none' }} className={`w-full flex-col bg-white dark:bg-gray-900 ${activeModule === 'comm_whatsapp' ? 'h-full' : 'hidden'}`}>
              <div className="bg-green-500 text-white px-4 py-2 flex justify-between items-center shrink-0">
                <span className="font-bold flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  WhatsApp Web
                  {activeModule === 'comm_whatsapp' && (
                    <button
                      onClick={() => setActiveModule('communication')}
                      className="ml-4 bg-green-700 hover:bg-green-800 text-white text-xs px-2 py-1 rounded transition-colors"
                    >
                      Volver
                    </button>
                  )}
                </span>
                <span className="text-xs bg-green-600 px-2 py-1 rounded">Sesión Segura & Persistente</span>
              </div>
              <div className="flex-1 bg-gray-100 dark:bg-gray-900 relative">
                <webview
                  src={whatsappUrl}
                  style={{ width: '100%', height: '100%', border: 'none' }}
                  allowpopups="true"
                  useragent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
                />
              </div>
            </div>

            {/* Inventory Module */}
            {activeModule === 'inventory' && (
              <div>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        <Package className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
                        Gestión de Inventario
                      </h2>
                      <p className="text-gray-600 dark:text-gray-300 mt-1">Rastrea equipo y suministros del club</p>
                    </div>
                    {/* Tabs */}
                    <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
                      <button
                        onClick={() => setInventoryTab('general')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${inventoryTab === 'general' ? 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white'} `}
                      >
                        General
                      </button>
                      <button
                        onClick={() => setInventoryTab('tents')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${inventoryTab === 'tents' ? 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white'} `}
                      >
                        Carpas
                      </button>
                      <button
                        onClick={() => setInventoryTab('loans')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${inventoryTab === 'loans' ? 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white'} `}
                      >
                        Préstamos
                      </button>
                    </div>
                  </div>
                </div>

                {/* Inventory Statistics (Only for General) */}
                {inventoryTab === 'general' && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                      <div className="flex items-center gap-3 mb-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <h3 className="font-semibold text-green-900 dark:text-green-100">Buen Estado</h3>
                      </div>
                      <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                        {inventory.filter(i => i.condition === 'Good' || i.condition === 'New').length}
                      </p>
                    </div>

                    <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
                      <div className="flex items-center gap-3 mb-2">
                        <AlertTriangle className="w-5 h-5 text-yellow-600" />
                        <h3 className="font-semibold text-yellow-900 dark:text-yellow-100">Necesita Reparación</h3>
                      </div>
                      <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
                        {inventory.filter(i => i.condition === 'Fair').length}
                      </p>
                    </div>

                    <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
                      <div className="flex items-center gap-3 mb-2">
                        <X className="w-5 h-5 text-red-600" />
                        <h3 className="font-semibold text-red-900 dark:text-red-100">Roto/Malo</h3>
                      </div>
                      <p className="text-2xl font-bold text-red-700 dark:text-red-300">
                        {inventory.filter(i => i.condition === 'Poor' || i.condition === 'Broken').length}
                      </p>
                    </div>
                  </div>
                )}

                {/* Tents Statistics (Only for Tents Tab) */}
                {inventoryTab === 'tents' && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4 border border-indigo-200 dark:border-indigo-800">
                      <div className="flex items-center gap-3 mb-2">
                        <Tent className="w-5 h-5 text-indigo-600" />
                        <h3 className="font-semibold text-indigo-900 dark:text-indigo-100">Total Carpas</h3>
                      </div>
                      <p className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">
                        {tents.length}
                      </p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <div className="flex items-center gap-3 mb-2">
                        <Users className="w-5 h-5 text-blue-600" />
                        <h3 className="font-semibold text-blue-900">Capacidad Total</h3>
                      </div>
                      <p className="text-2xl font-bold text-blue-700">
                        {tents.reduce((acc, t) => acc + parseInt(t.capacity || 0), 0)}
                      </p>
                    </div>
                  </div>
                )}

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                  {/* General Inventory Content */}
                  {inventoryTab === 'general' && (
                    !showInventoryForm ? (
                      <>
                        <div className="mb-6 flex flex-wrap gap-4">
                          <button
                            onClick={() => {
                              setEditingInventoryItem(null);
                              setInventoryFormData({
                                name: '',
                                category: '',
                                quantity: '',
                                condition: 'Good',
                                location: '',
                                description: '',
                                photo: ''
                              });
                              setShowInventoryForm(true);
                            }}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors"
                          >
                            <Plus className="w-5 h-5" />
                            Agregar Nuevo Artículo
                          </button>

                          <button
                            onClick={() => setShowCategoryModal(true)}
                            className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors"
                          >
                            <Settings className="w-5 h-5" />
                            Categorías
                          </button>
                        </div>

                        {/* Category Management Modal */}
                        {showCategoryModal && (
                          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
                              <div className="bg-gradient-to-r from-gray-800 to-gray-900 dark:from-gray-900 dark:to-black p-6 text-white flex justify-between items-center">
                                <h3 className="text-xl font-bold flex items-center gap-2">
                                  <Grid className="w-6 h-6" />
                                  Categorías de Inventario
                                </h3>
                                <button onClick={() => setShowCategoryModal(false)} className="text-gray-400 hover:text-white">
                                  <X className="w-6 h-6" />
                                </button>
                              </div>
                              <div className="p-6">
                                <div className="flex gap-2 mb-6">
                                  <input
                                    type="text"
                                    value={newCategory}
                                    onChange={(e) => setNewCategory(e.target.value)}
                                    placeholder="Nueva categoría..."
                                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
                                  />
                                  <button
                                    onClick={handleAddCategory}
                                    disabled={!newCategory.trim()}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
                                  >
                                    <Plus className="w-5 h-5" />
                                  </button>
                                </div>
                                <div className="space-y-2 max-h-60 overflow-y-auto">
                                  {inventoryCategories.map(cat => (
                                    <div key={cat} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg group">
                                      <span className="font-medium text-gray-700 dark:text-gray-300">{cat}</span>
                                      <button
                                        onClick={() => handleDeleteCategory(cat)}
                                        className="text-red-400 hover:text-red-600 dark:hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  ))}
                                  {inventoryCategories.length === 0 && (
                                    <p className="text-center text-gray-500 dark:text-gray-400 py-4">No hay categorías definidas</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className="bg-indigo-50 dark:bg-indigo-900/30 border-b dark:border-indigo-900">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-indigo-900 dark:text-indigo-100 uppercase">Foto</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-indigo-900 dark:text-indigo-100 uppercase">Nombre del Artículo</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-indigo-900 dark:text-indigo-100 uppercase">Categoría</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-indigo-900 dark:text-indigo-100 uppercase">Cantidad</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-indigo-900 dark:text-indigo-100 uppercase">Condición</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-indigo-900 dark:text-indigo-100 uppercase">Ubicación</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-indigo-900 dark:text-indigo-100 uppercase">Acciones</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y dark:divide-gray-700">
                              {inventory.map((item) => (
                                <tr key={item.id} className="hover:bg-indigo-50 dark:hover:bg-indigo-900/10">
                                  <td className="px-6 py-4">
                                    {item.photo ? (
                                      <img src={item.photo} alt={item.name} className="w-12 h-12 object-cover rounded-md border border-gray-200 dark:border-gray-700" />
                                    ) : (
                                      <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-md flex items-center justify-center text-gray-400">
                                        <ImageIcon className="w-6 h-6" />
                                      </div>
                                    )}
                                  </td>
                                  <td className="px-6 py-4">
                                    <div className="font-medium text-gray-900 dark:text-white">{item.name}</div>
                                    {item.description && <div className="text-xs text-gray-500 dark:text-gray-400">{item.description}</div>}
                                  </td>
                                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs font-medium text-gray-700 dark:text-gray-300">
                                      {item.category}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{item.quantity}</td>
                                  <td className="px-6 py-4">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${item.condition === 'New' || item.condition === 'Good' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                                      item.condition === 'Fair' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                                        'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                      } `}>
                                      {item.condition}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{item.location || '-'}</td>
                                  <td className="px-6 py-4 text-sm">
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() => handleEditInventoryItem(item)}
                                        className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 font-medium"
                                      >
                                        Editar
                                      </button>
                                      <button
                                        onClick={() => handleDeleteInventoryItem(item.id)}
                                        className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 font-medium"
                                      >
                                        Eliminar
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                              {inventory.length === 0 && (
                                <tr>
                                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                    <Package className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                                    <p>No hay artículos en el inventario</p>
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </>
                    ) : (
                      <div>
                        <div className="flex items-center justify-between mb-6">
                          <h4 className="text-xl font-bold text-gray-800 dark:text-white">
                            {editingInventoryItem ? 'Editar Artículo' : 'Agregar Nuevo Artículo'}
                          </h4>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="md:col-span-2 flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                            {inventoryFormData.photo ? (
                              <div className="relative mb-4 group">
                                <img src={inventoryFormData.photo} alt="Preview" className="h-40 w-auto object-contain rounded-lg shadow-sm" />
                                <button
                                  onClick={() => setInventoryFormData(prev => ({ ...prev, photo: '' }))}
                                  className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                  title="Eliminar foto"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <div className="text-center mb-4 text-gray-400">
                                <ImageIcon className="w-12 h-12 mx-auto mb-2" />
                                <p className="text-sm">Sin foto seleccionada</p>
                              </div>
                            )}
                            <label className="cursor-pointer bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-medium py-2 px-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                              <span className="flex items-center gap-2">
                                <Upload className="w-4 h-4" />
                                Subir Foto
                              </span>
                              <input type="file" className="hidden" accept="image/*" onChange={handleInventoryPhotoChange} />
                            </label>
                          </div>

                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Nombre del Artículo <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              name="name"
                              value={inventoryFormData.name}
                              onChange={handleInventoryInputChange}
                              placeholder="ej. Carpa para 6 Personas"
                              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${inventoryErrors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} `}
                            />
                            {inventoryErrors.name && <p className="text-red-500 text-sm mt-1">{inventoryErrors.name}</p>}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Categoría <span className="text-red-500">*</span>
                            </label>
                            <select
                              name="category"
                              value={inventoryFormData.category}
                              onChange={handleInventoryInputChange}
                              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${inventoryErrors.category ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} `}
                            >
                              <option value="">Seleccionar Categoría</option>
                              {inventoryCategories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                              ))}
                            </select>
                            {inventoryErrors.category && <p className="text-red-500 text-sm mt-1">{inventoryErrors.category}</p>}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Cantidad <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="number"
                              name="quantity"
                              value={inventoryFormData.quantity}
                              onChange={handleInventoryInputChange}
                              min="0"
                              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${inventoryErrors.quantity ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} `}
                            />
                            {inventoryErrors.quantity && <p className="text-red-500 text-sm mt-1">{inventoryErrors.quantity}</p>}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Condición <span className="text-red-500">*</span>
                            </label>
                            <select
                              name="condition"
                              value={inventoryFormData.condition}
                              onChange={handleInventoryInputChange}
                              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${inventoryErrors.condition ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} `}
                            >
                              <option value="New">Nuevo</option>
                              <option value="Good">Bueno</option>
                              <option value="Fair">Regular (Desgaste)</option>
                              <option value="Poor">Malo (Necesita reparación)</option>
                              <option value="Broken">Roto (Inutilizable)</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Ubicación
                            </label>
                            <input
                              type="text"
                              name="location"
                              value={inventoryFormData.location}
                              onChange={handleInventoryInputChange}
                              placeholder="ej. Sala de Almacenamiento A"
                              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                          </div>

                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Descripción/Notas
                            </label>
                            <textarea
                              name="description"
                              value={inventoryFormData.description}
                              onChange={handleInventoryInputChange}
                              rows="3"
                              placeholder="Detalles adicionales..."
                              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                          </div>

                          <div className="md:col-span-2 flex gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                            <button
                              onClick={handleInventorySubmit}
                              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                            >
                              <Save className="w-5 h-5" />
                              {editingInventoryItem ? 'Guardar Cambios' : 'Agregar Artículo'}
                            </button>
                            <button
                              onClick={resetInventoryForm}
                              className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  )}

                  {/* Tents Inventory Content (CRUD) */}
                  {inventoryTab === 'tents' && (
                    !showTentForm ? (
                      <>
                        <div className="mb-6 flex justify-between items-center">
                          <button
                            onClick={() => {
                              setEditingTent(null);
                              setTentFormData({
                                name: '',
                                capacity: 4,
                                condition: 'Good',
                                brand: '',
                                color: '',
                                photo: ''
                              });
                              setShowTentForm(true);
                            }}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors"
                          >
                            <Plus className="w-5 h-5" />
                            Agregar Nueva Carpa
                          </button>
                        </div>

                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className="bg-indigo-50 dark:bg-indigo-900/30 border-b dark:border-indigo-900">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-indigo-900 dark:text-indigo-100 uppercase">Foto</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-indigo-900 dark:text-indigo-100 uppercase">Nombre/ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-indigo-900 dark:text-indigo-100 uppercase">Capacidad</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-indigo-900 dark:text-indigo-100 uppercase">Condición</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-indigo-900 dark:text-indigo-100 uppercase">Marca/Color</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-indigo-900 dark:text-indigo-100 uppercase">Acciones</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y dark:divide-gray-700">
                              {tents.map((tent) => (
                                <tr key={tent.id} className="hover:bg-indigo-50 dark:hover:bg-indigo-900/10">
                                  <td className="px-6 py-4">
                                    {tent.photo ? (
                                      <img src={tent.photo} alt={tent.name} className="w-12 h-12 object-cover rounded-md border border-gray-200 dark:border-gray-700" />
                                    ) : (
                                      <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-md flex items-center justify-center text-gray-400">
                                        <Tent className="w-6 h-6" />
                                      </div>
                                    )}
                                  </td>
                                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{tent.name}</td>
                                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{tent.capacity} Personas</td>
                                  <td className="px-6 py-4">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${tent.condition === 'New' || tent.condition === 'Good' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                                      tent.condition === 'Fair' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                                        'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                      } `}>
                                      {tent.condition}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{tent.brand} {tent.color ? `(${tent.color})` : ''}</td>
                                  <td className="px-6 py-4">
                                    <div className="flex gap-2">
                                      <button onClick={() => handleEditTent(tent)} className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 font-medium">Editar</button>
                                      <button onClick={() => handleDeleteTent(tent.id)} className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 font-medium">Eliminar</button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                              {tents.length === 0 && (
                                <tr><td colSpan="6" className="px-6 py-12 text-center text-gray-500">No hay carpas registradas</td></tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </>
                    ) : (
                      <div>
                        <h4 className="text-xl font-bold text-gray-800 mb-6">{editingTent ? 'Editar Carpa' : 'Agregar Nueva Carpa'}</h4>


                        <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 mb-6">
                          {tentFormData.photo ? (
                            <div className="relative mb-4 group">
                              <img src={tentFormData.photo} alt="Preview" className="h-40 w-auto object-contain rounded-lg shadow-sm" />
                              <button
                                onClick={() => setTentFormData(prev => ({ ...prev, photo: '' }))}
                                className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Eliminar foto"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <div className="text-center mb-4 text-gray-400">
                              <Tent className="w-12 h-12 mx-auto mb-2" />
                              <p className="text-sm">Sin foto seleccionada</p>
                            </div>
                          )}
                          <label className="cursor-pointer bg-white border border-gray-300 text-gray-700 font-medium py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors">
                            <span className="flex items-center gap-2">
                              <Upload className="w-4 h-4" />
                              Subir Foto
                            </span>
                            <input type="file" className="hidden" accept="image/*" onChange={handleTentPhotoChange} />
                          </label>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Nombre/Identificador <span className="text-red-500">*</span></label>
                            <input type="text" name="name" value={tentFormData.name} onChange={handleTentInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" placeholder="ej. Carpa 1" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Capacidad</label>
                            <input type="number" name="capacity" value={tentFormData.capacity} onChange={handleTentInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Condición</label>
                            <select name="condition" value={tentFormData.condition} onChange={handleTentInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                              <option value="New">Nueva</option>
                              <option value="Good">Buena</option>
                              <option value="Fair">Regular</option>
                              <option value="Poor">Mala</option>
                              <option value="Broken">Rota</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Marca</label>
                            <input type="text" name="brand" value={tentFormData.brand} onChange={handleTentInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                            <input type="text" name="color" value={tentFormData.color} onChange={handleTentInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                          </div>
                        </div>
                        <div className="flex gap-4 mt-6 pt-6 border-t">
                          <button onClick={handleTentSubmit} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium">Guardar</button>
                          <button onClick={resetTentForm} className="border border-gray-300 rounded-lg font-medium text-gray-700 px-6 py-3 hover:bg-gray-50">Cancelar</button>
                        </div>
                      </div>
                    )
                  )}

                  {/* Loans Tab Content */}
                  {inventoryTab === 'loans' && (
                    <div>
                      <div className="flex justify-between items-center mb-6">
                        <div>
                          <h3 className="text-xl font-bold text-gray-800">Control de Préstamos</h3>
                          <p className="text-gray-600 text-sm">Administre los artículos prestados a miembros.</p>
                        </div>
                        <button
                          onClick={() => {
                            setShowLoanForm(!showLoanForm);
                            setLoanFormData({
                              itemId: '',
                              memberId: '',
                              borrowerType: 'member',
                              externalName: '',
                              loanDate: new Date().toISOString().split('T')[0],
                              expectedReturnDate: '',
                              notes: ''
                            });
                          }}
                          className={`${showLoanForm ? 'bg-gray-100 text-gray-700' : 'bg-indigo-600 text-white'} px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:opacity-90 transition-colors`}
                        >
                          {showLoanForm ? (
                            <><X className="w-4 h-4" /> Cancelar</>
                          ) : (
                            <><PlusCircle className="w-4 h-4" /> Registrar Préstamo</>
                          )}
                        </button>
                      </div>

                      {showLoanForm ? (
                        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mb-6">
                          <h4 className="font-bold text-gray-800 mb-4">Nuevo Préstamo</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Artículo del Inventario</label>
                              <select
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                value={loanFormData.itemId}
                                onChange={(e) => setLoanFormData({ ...loanFormData, itemId: e.target.value })}
                              >
                                <option value="">-- Seleccionar Artículo --</option>
                                {inventory.filter(i => i.quantity > 0).map(item => (
                                  <option key={item.id} value={item.id}>{item.name} (Disp: {item.quantity})</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">¿A quién se le presta?</label>
                              <div className="flex gap-4 mb-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                  <input
                                    type="radio"
                                    name="borrowerType"
                                    checked={loanFormData.borrowerType === 'member'}
                                    onChange={() => setLoanFormData({ ...loanFormData, borrowerType: 'member' })}
                                    className="text-indigo-600 focus:ring-indigo-500"
                                  />
                                  <span className="text-sm text-gray-700">Miembro del Club</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                  <input
                                    type="radio"
                                    name="borrowerType"
                                    checked={loanFormData.borrowerType === 'external'}
                                    onChange={() => setLoanFormData({ ...loanFormData, borrowerType: 'external' })}
                                    className="text-indigo-600 focus:ring-indigo-500"
                                  />
                                  <span className="text-sm text-gray-700">Persona Externa</span>
                                </label>
                              </div>

                              {loanFormData.borrowerType === 'member' ? (
                                <select
                                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                  value={loanFormData.memberId}
                                  onChange={(e) => setLoanFormData({ ...loanFormData, memberId: e.target.value })}
                                >
                                  <option value="">-- Seleccionar Miembro --</option>
                                  {members.sort((a, b) => a.firstName.localeCompare(b.firstName)).map(m => (
                                    <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>
                                  ))}
                                </select>
                              ) : (
                                <input
                                  type="text"
                                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                  placeholder="Nombre completo de la persona"
                                  value={loanFormData.externalName}
                                  onChange={(e) => setLoanFormData({ ...loanFormData, externalName: e.target.value })}
                                />
                              )}
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de Préstamo</label>
                              <input
                                type="date"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                value={loanFormData.loanDate}
                                onChange={(e) => setLoanFormData({ ...loanFormData, loanDate: e.target.value })}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Esperada de Devolución</label>
                              <input
                                type="date"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                value={loanFormData.expectedReturnDate}
                                onChange={(e) => setLoanFormData({ ...loanFormData, expectedReturnDate: e.target.value })}
                              />
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-sm font-medium text-gray-700 mb-2">Notas / Estado Inicial</label>
                              <textarea
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                rows="2"
                                placeholder="Ej. Se entrega con leve rasguño en la tapa..."
                                value={loanFormData.notes}
                                onChange={(e) => setLoanFormData({ ...loanFormData, notes: e.target.value })}
                              ></textarea>
                            </div>
                          </div>
                          <div className="mt-6 flex justify-end">
                            <button
                              onClick={() => {
                                if (!loanFormData.itemId) return;
                                if (loanFormData.borrowerType === 'member' && !loanFormData.memberId) return;
                                if (loanFormData.borrowerType === 'external' && !loanFormData.externalName) return;

                                const newLoan = {
                                  id: Date.now().toString(),
                                  ...loanFormData,
                                  status: 'active',
                                  returnDate: null
                                };
                                setLoans([...loans, newLoan]);
                                // Decrease inventory quantity logic would go here ideally
                                setShowLoanForm(false);
                              }}
                              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-bold"
                            >
                              Guardar Préstamo
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="overflow-x-auto bg-white rounded-lg shadow-sm border border-gray-200">
                          <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-700 font-bold uppercase text-xs">
                              <tr>
                                <th className="px-6 py-3">Artículo</th>
                                <th className="px-6 py-3">Miembro</th>
                                <th className="px-6 py-3">Fecha Préstamo</th>
                                <th className="px-6 py-3">Devolución Esperada</th>
                                <th className="px-6 py-3">Estado</th>
                                <th className="px-6 py-3 text-right">Acciones</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                              {loans.length === 0 ? (
                                <tr>
                                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                    <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                                    No hay préstamos activos.
                                  </td>
                                </tr>
                              ) : (
                                loans.map(loan => {
                                  const member = members.find(m => m.id === loan.memberId);
                                  const item = inventory.find(i => i.id === loan.itemId);
                                  const isOverdue = loan.expectedReturnDate && new Date(loan.expectedReturnDate) < new Date() && loan.status === 'active';

                                  // Determine borrower name to display
                                  let borrowerName = 'Desconocido';
                                  if (loan.borrowerType === 'external') {
                                    borrowerName = loan.externalName || 'Externo';
                                  } else {
                                    borrowerName = member ? `${member.firstName} ${member.lastName}` : 'Miembro Eliminado';
                                  }

                                  return (
                                    <tr key={loan.id} className="hover:bg-gray-50">
                                      <td className="px-6 py-4 font-medium text-gray-900">
                                        {item ? item.name : 'Artículo Eliminado'}
                                      </td>
                                      <td className="px-6 py-4">
                                        {borrowerName}
                                        {loan.borrowerType === 'external' && (
                                          <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] bg-gray-200 text-gray-600 font-bold uppercase">Ext</span>
                                        )}
                                      </td>
                                      <td className="px-6 py-4">{loan.loanDate}</td>
                                      <td className={`px-6 py-4 ${isOverdue ? 'text-red-600 font-bold' : ''}`}>
                                        {loan.expectedReturnDate || '-'}
                                        {isOverdue && <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded-full">Vencido</span>}
                                      </td>
                                      <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${loan.status === 'active' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                                          {loan.status === 'active' ? 'Activo' : 'Devuelto'}
                                        </span>
                                      </td>
                                      <td className="px-6 py-4 text-right">
                                        {loan.status === 'active' && (
                                          <button
                                            onClick={() => {
                                              const updatedLoans = loans.map(l =>
                                                l.id === loan.id ? { ...l, status: 'returned', returnDate: new Date().toISOString().split('T')[0] } : l
                                              );
                                              setLoans(updatedLoans);
                                            }}
                                            className="text-indigo-600 hover:text-indigo-900 font-medium text-xs border border-indigo-200 px-3 py-1 rounded-md hover:bg-indigo-50"
                                          >
                                            Marcar Devuelto
                                          </button>
                                        )}
                                      </td>
                                    </tr>
                                  );
                                })
                              )}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}

                </div>
              </div>
            )}

            {/* Tents Module (Assignments ONLY) */}
            {activeModule === 'inventory_tents' && (
              <div>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        <Tent className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
                        Asignación de Carpas
                      </h2>
                      <p className="text-gray-600 dark:text-gray-300 mt-1">Asignar miembros a carpas para eventos</p>
                    </div>
                  </div>
                </div>

                {/* Assignment Section */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                    <Users className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                    Asignación de Carpas
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">Seleccione una actividad para asignar miembros a las carpas.</p>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Seleccionar Actividad</label>
                    <select
                      value={selectedActivityForAssignment}
                      onChange={(e) => setSelectedActivityForAssignment(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">-- Seleccionar Actividad --</option>
                      {activities
                        .filter(a => new Date(a.date) >= new Date()) // Only future activities
                        .sort((a, b) => new Date(a.date) - new Date(b.date))
                        .map(activity => (
                          <option key={activity.id} value={activity.id}>
                            {activity.date} - {activity.title} ({activity.type})
                          </option>
                        ))
                      }
                    </select>
                  </div>

                  {selectedActivityForAssignment && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {tents.map(tent => {
                        const assignedMembers = (tentAssignments[selectedActivityForAssignment] && tentAssignments[selectedActivityForAssignment][tent.id]) || [];
                        const isFull = assignedMembers.length >= parseInt(tent.capacity);

                        return (
                          <div key={tent.id} className={`border rounded-lg p-4 ${isFull ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' : 'bg-white dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 shadow-sm'} `}>
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-bold text-gray-800 dark:text-white">{tent.name}</h4>
                              <span className={`text-xs px-2 py-1 rounded-full font-medium ${isFull ? 'bg-red-200 text-red-800 dark:bg-red-900/40 dark:text-red-300' : 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'} `}>
                                {assignedMembers.length} / {tent.capacity}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{tent.brand} - {tent.condition}</p>

                            <div className="space-y-1 mb-4 min-h-[50px]">
                              {assignedMembers.length > 0 ? (
                                assignedMembers.map(memberId => {
                                  const member = members.find(m => m.id === memberId);
                                  return (
                                    <div key={memberId} className="text-sm bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded flex items-center gap-2">
                                      <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                                      <button
                                        onClick={() => member && handleViewProfile(member)}
                                        className="truncate hover:text-indigo-700 dark:hover:text-indigo-300 hover:underline text-left cursor-pointer dark:text-gray-200"
                                      >
                                        {member ? `${member.firstName} ${member.lastName}` : 'Desconocido'}
                                      </button>
                                    </div>
                                  );
                                })
                              ) : (
                                <p className="text-sm text-gray-400 italic">Sin asignaciones</p>
                              )}
                            </div>

                            <button
                              onClick={() => {
                                setCurrentAssignmentTent(tent);
                                setShowAssignmentModal(true);
                              }}
                              className="w-full py-2 border border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400 rounded hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-sm font-medium transition-colors"
                            >
                              Gestionar Ocupantes
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Assignment Modal */}
                {showAssignmentModal && currentAssignmentTent && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
                      <div className="flex items-center justify-between p-6 border-b">
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                          Gestionar Ocupantes - {currentAssignmentTent.name}
                        </h3>
                        <button onClick={() => setShowAssignmentModal(false)} className="text-gray-500 hover:text-gray-700">
                          <X className="w-6 h-6" />
                        </button>
                      </div>

                      <div className="p-6 overflow-y-auto flex-1">
                        <div className="mb-4 flex items-center justify-between bg-blue-50 p-3 rounded-lg border border-blue-100">
                          <span className="text-blue-800 font-medium">Capacidad: {currentAssignmentTent.capacity}</span>
                          <span className="text-blue-800 font-medium">
                            Ocupados: {(tentAssignments[selectedActivityForAssignment]?.[currentAssignmentTent.id] || []).length}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {members.sort((a, b) => a.firstName.localeCompare(b.firstName)).map(member => {
                            const activityAssignments = tentAssignments[selectedActivityForAssignment] || {};
                            const assignedTentId = Object.keys(activityAssignments).find(tId => activityAssignments[tId].includes(member.id));
                            const isAssignedHere = assignedTentId === currentAssignmentTent.id;
                            const isAssignedElsewhere = assignedTentId && !isAssignedHere;
                            const tentName = isAssignedElsewhere ? tents.find(t => t.id === assignedTentId)?.name : '';

                            return (
                              <label key={member.id} className={`flex items-center p-3 rounded border cursor-pointer hover:bg-gray-50 transition-colors ${isAssignedHere ? 'bg-indigo-50 border-indigo-200' : 'border-gray-200'} `}>
                                <input
                                  type="checkbox"
                                  checked={isAssignedHere}
                                  onChange={(e) => handleAssignmentChange(member.id, e.target.checked)}
                                  className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500 mr-3"
                                />
                                <div className="flex-1">
                                  <div className="font-medium text-gray-900">{member.firstName} {member.lastName}</div>
                                  {isAssignedElsewhere && (
                                    <div className="text-xs text-orange-600">En: {tentName || 'Otra carpa'}</div>
                                  )}
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      </div>

                      <div className="p-6 border-t bg-gray-50 rounded-b-lg flex justify-end">
                        <button
                          onClick={() => setShowAssignmentModal(false)}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium"
                        >
                          Hecho
                        </button>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            )}

            {/* Dashboard View-Truncated due to length */}
            {/* DataClubes Module - PERSISTENT RENDERING */}
            <div style={{ display: activeModule === 'dataclubes' ? 'block' : 'none', height: 'calc(100vh - 120px)' }} className="w-full bg-white rounded-lg shadow-lg overflow-hidden flex flex-col">
              <div className="bg-gray-100 dark:bg-gray-800 p-2 border-b flex justify-between items-center px-4">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Portal DataClubes</span>
                <button
                  onClick={handleAutoFillDataClubes}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1.5 rounded-md shadow flex items-center gap-2"
                >
                  <Globe className="w-4 h-4" />
                  Rellenar mis Datos (DO1902340)
                </button>
              </div>
              <webview
                ref={dataclubesWebviewRef}
                src="https://dataclubes.azurewebsites.net/Portal/login"
                style={{ width: '100%', height: '100%' }}
                allowpopups="true"
              ></webview>
            </div>

            {activeModule === 'dashboard' && (
              <div>
                <div className="mb-6">
                  <h2 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    <Home className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                    Panel Principal
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">Resumen General de {clubSettings?.name || 'su Club'}</p>
                </div>

                <div className="mb-6">
                  {/* MAIN CONTENT - STATS */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Clock Widget Removed */}

                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 rounded-lg shadow-md p-6 border border-blue-200 dark:border-blue-700">
                      <div className="flex items-center justify-between mb-3">
                        <Users className="w-10 h-10 text-blue-600 dark:text-blue-300" />
                        <span className="text-3xl font-bold text-blue-900 dark:text-white">{members.length}</span>
                      </div>
                      <h3 className="text-sm font-medium text-blue-700 dark:text-blue-200 uppercase tracking-wide">Total de Miembros</h3>
                      <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">Registrados en el club</p>
                    </div>

                    {(() => {
                      console.log('Rendering Dashboard Widgets...');
                      const getAge = (m) => {
                        if (!m.dateOfBirth) return 0;
                        const dob = new Date(m.dateOfBirth);
                        if (isNaN(dob.getTime())) return 0;
                        const ageDifMs = Date.now() - dob.getTime();
                        const ageDate = new Date(ageDifMs);
                        return Math.abs(ageDate.getUTCFullYear() - 1970);
                      };
                      const regularMembers = members.filter(m => !m.position || m.position.trim() === '');

                      const filterByAge = (min, max) => regularMembers.filter(m => {
                        const age = getAge(m);
                        if (max) return age >= min && age <= max;
                        return age >= min;
                      });

                      const aventurerosList = filterByAge(4, 9);
                      const conquistadoresList = filterByAge(10, 15);
                      const masterList = filterByAge(16);

                      // Gender stats update logic active
                      const getGenderStats = (list) => {
                        const normalize = (str) => str ? str.toLowerCase().trim() : '';
                        const female = list.filter(m => ['female', 'femenino', 'f', 'mujer', 'femenina'].includes(normalize(m.gender))).length;
                        const male = list.filter(m => ['male', 'masculino', 'm', 'hombre', 'varon'].includes(normalize(m.gender))).length;
                        return { female, male };
                      };

                      const avStats = getGenderStats(aventurerosList);
                      const conqStats = getGenderStats(conquistadoresList);
                      const masterStats = getGenderStats(masterList);

                      const renderGenderStats = (stats) => (
                        <div className="flex justify-between mt-3 text-sm font-bold bg-white/50 dark:bg-black/20 p-2 rounded-lg">
                          <span className="flex items-center gap-1.5 text-pink-700 dark:text-pink-300">
                            <span className="w-2.5 h-2.5 rounded-full bg-pink-500"></span>
                            {stats.female} Fem
                          </span>
                          <span className="flex items-center gap-1.5 text-blue-700 dark:text-blue-300">
                            <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                            {stats.male} Masc
                          </span>
                        </div>
                      );

                      return (
                        <>
                          {/* Aventureros Widget */}
                          <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900 dark:to-orange-800 rounded-lg shadow-md p-6 border border-orange-200 dark:border-orange-700">
                            <div className="flex items-center justify-between mb-3">
                              <Sun className="w-10 h-10 text-orange-600 dark:text-orange-300" />
                              <span className="text-3xl font-bold text-orange-900 dark:text-white">{aventurerosList.length}</span>
                            </div>
                            <h3 className="text-sm font-medium text-orange-700 dark:text-orange-200 uppercase tracking-wide">Total Aventureros</h3>
                            <p className="text-xs text-orange-600 dark:text-orange-300 mt-1 mb-2">4 - 9 años</p>
                            {renderGenderStats(avStats)}
                          </div>

                          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900 dark:to-indigo-800 rounded-lg shadow-md p-6 border border-indigo-200 dark:border-indigo-700">
                            <div className="flex items-center justify-between mb-3">
                              <MapPin className="w-10 h-10 text-indigo-600 dark:text-indigo-300" />
                              <span className="text-3xl font-bold text-indigo-900 dark:text-white">{conquistadoresList.length}</span>
                            </div>
                            <h3 className="text-sm font-medium text-indigo-700 dark:text-indigo-200 uppercase tracking-wide">Total Conquistadores</h3>
                            <p className="text-xs text-indigo-600 dark:text-indigo-300 mt-1 mb-2">10 - 15 años</p>
                            {renderGenderStats(conqStats)}
                          </div>

                          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900 dark:to-yellow-800 rounded-lg shadow-md p-6 border border-yellow-200 dark:border-yellow-700">
                            <div className="flex items-center justify-between mb-3">
                              <Crown className="w-10 h-10 text-yellow-600 dark:text-yellow-300" />
                              <span className="text-3xl font-bold text-yellow-900 dark:text-white">{masterList.length}</span>
                            </div>
                            <h3 className="text-sm font-medium text-yellow-700 dark:text-yellow-200 uppercase tracking-wide">Total Guías</h3>
                            <p className="text-xs text-yellow-600 dark:text-yellow-300 mt-1 mb-2">16 años o más</p>
                            {renderGenderStats(masterStats)}
                          </div>
                        </>
                      );
                    })()}

                    <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 rounded-lg shadow-md p-6 border border-green-200 dark:border-green-700">
                      <div className="flex items-center justify-between mb-3">
                        <TrendingUp className="w-10 h-10 text-green-600 dark:text-green-300" />
                        <span className="text-2xl font-bold text-green-900 dark:text-white">{formatCurrency(summary.income)}</span>
                      </div>
                      <h3 className="text-sm font-medium text-green-700 dark:text-green-200 uppercase tracking-wide">Ingresos Totales</h3>
                      <p className="text-xs text-green-600 dark:text-green-300 mt-1">Ganancias históricas</p>
                    </div>

                    <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900 dark:to-red-800 rounded-lg shadow-md p-6 border border-red-200 dark:border-red-700">
                      <div className="flex items-center justify-between mb-3">
                        <TrendingDown className="w-10 h-10 text-red-600 dark:text-red-300" />
                        <span className="text-2xl font-bold text-red-900 dark:text-white">{formatCurrency(summary.expenses)}</span>
                      </div>
                      <h3 className="text-sm font-medium text-red-700 dark:text-red-200 uppercase tracking-wide">Gastos Totales</h3>
                      <p className="text-xs text-red-600 dark:text-red-300 mt-1">Gastos históricos</p>
                    </div>

                    <div className={`bg-gradient-to-br rounded-lg shadow-md p-6 border ${summary.balance >= 0
                      ? 'from-indigo-50 to-indigo-100 dark:from-indigo-900 dark:to-indigo-800 border-indigo-200 dark:border-indigo-700'
                      : 'from-orange-50 to-orange-100 dark:from-orange-900 dark:to-orange-800 border-orange-200 dark:border-orange-700'
                      } `}>
                      <div className="flex items-center justify-between mb-3">
                        <Wallet className={`w-10 h-10 ${summary.balance >= 0 ? 'text-indigo-600 dark:text-indigo-300' : 'text-orange-600 dark:text-orange-300'} `} />
                        <span className={`text-2xl font-bold ${summary.balance >= 0 ? 'text-indigo-900 dark:text-white' : 'text-orange-900 dark:text-white'} `}>
                          {formatCurrency(summary.balance)}
                        </span>
                      </div>
                      <h3 className={`text-sm font-medium uppercase tracking-wide ${summary.balance >= 0 ? 'text-indigo-700 dark:text-indigo-200' : 'text-orange-700 dark:text-orange-200'
                        } `}>Balance Actual</h3>
                      <p className={`text-xs mt-1 ${summary.balance >= 0 ? 'text-indigo-600 dark:text-indigo-300' : 'text-orange-600 dark:text-orange-300'} `}>
                        {summary.balance >= 0 ? 'Balance positivo' : 'Déficit'}
                      </p>

                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mt-6 transition-colors duration-200">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Acciones Rápidas</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <button
                        onClick={() => {
                          setActiveModule('members');
                          setShowForm(true);
                        }}
                        className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg border border-red-200 dark:border-red-800 transition-colors"
                      >
                        <UserPlus className="w-6 h-6 text-red-600 dark:text-red-400" />
                        <div className="text-left">
                          <div className="font-medium text-red-900 dark:text-red-100">Agregar Miembro</div>
                          <div className="text-xs text-red-600 dark:text-red-300">Registrar nuevo conquistador</div>
                        </div>
                      </button>

                      <button
                        onClick={() => {
                          setActiveModule('finances');
                          setShowFinanceForm(true);
                        }}
                        className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-800 transition-colors"
                      >
                        <Plus className="w-6 h-6 text-green-600 dark:text-green-400" />
                        <div className="text-left">
                          <div className="font-medium text-green-900 dark:text-green-100">Agregar Transacción</div>
                          <div className="text-xs text-green-600 dark:text-green-300">Registrar ingreso o gasto</div>
                        </div>
                      </button>

                      <button
                        onClick={() => setActiveModule('members')}
                        className="flex items-center gap-3 p-4 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg border border-purple-200 dark:border-purple-800 transition-colors"
                      >
                        <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        <div className="text-left">
                          <div className="font-medium text-purple-900 dark:text-purple-100">Ver Miembros</div>
                          <div className="text-xs text-purple-600 dark:text-purple-300">Ver todos los conquistadores</div>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Horizontal Birthday Widget */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mt-6 border border-purple-100 dark:border-purple-900/30 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-purple-50 dark:bg-purple-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>

                  <div className="flex items-center justify-between mb-4 relative z-10">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                      <Cake className="w-6 h-6 text-purple-600" />
                      Cumpleaños
                      <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-2">Este mes y el próximo</span>
                    </h3>
                    <span className="bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 text-xs font-bold px-3 py-1 rounded-full">
                      {members.filter(m => {
                        if (!m.dateOfBirth) return false;
                        const today = new Date();
                        const currentMonth = today.getMonth(); // 0-11
                        const currentDay = today.getDate();
                        const nextMonth = (currentMonth + 1) % 12;

                        // Parse manually to avoid timezone issues
                        const parts = m.dateOfBirth.split('-');
                        if (parts.length !== 3) return false;

                        // YYYY-MM-DD
                        const dobMonth = parseInt(parts[1], 10) - 1; // 0-11
                        const dobDay = parseInt(parts[2], 10);

                        if (dobMonth === nextMonth) return true;
                        if (dobMonth === currentMonth) {
                          return dobDay >= currentDay;
                        }
                        return false;
                      }).length} festejados
                    </span>
                  </div>

                  <div className="flex gap-4 overflow-x-auto pb-4 pt-2 relative z-10 custom-scrollbar">
                    {(() => {
                      const today = new Date();
                      const currentMonth = today.getMonth();
                      const nextMonth = (currentMonth + 1) % 12;

                      const upcoming = members.filter(m => {
                        if (!m.dateOfBirth) return false;
                        const dobParts = m.dateOfBirth.split('-');
                        if (dobParts.length !== 3) return false;

                        const dobMonth = parseInt(dobParts[1], 10) - 1;
                        const dobDay = parseInt(dobParts[2], 10);

                        if (dobMonth === nextMonth) return true;
                        if (dobMonth === currentMonth) {
                          return dobDay >= today.getDate();
                        }
                        return false;
                      }).sort((a, b) => {
                        const partsA = a.dateOfBirth.split('-');
                        const partsB = b.dateOfBirth.split('-');

                        const monthA = parseInt(partsA[1], 10) - 1;
                        const monthB = parseInt(partsB[1], 10) - 1;
                        const dayA = parseInt(partsA[2], 10);
                        const dayB = parseInt(partsB[2], 10);

                        const groupA = monthA === currentMonth ? 0 : 1;
                        const groupB = monthB === currentMonth ? 0 : 1;

                        if (groupA !== groupB) return groupA - groupB;
                        return dayA - dayB;
                      });

                      if (upcoming.length === 0) {
                        return (
                          <div className="w-full flex flex-col items-center justify-center text-center p-8 bg-purple-50 dark:bg-purple-900/20 rounded-xl border-dashed border-2 border-purple-200 dark:border-purple-800">
                            <Calendar className="w-10 h-10 text-purple-300 dark:text-purple-400 mb-2" />
                            <p className="text-sm text-purple-500 dark:text-purple-300 font-medium">No hay cumpleaños este mes ni el próximo.</p>
                          </div>
                        );
                      }

                      return upcoming.map(member => {
                        const dob = new Date(member.dateOfBirth);
                        const isCurrentMonth = dob.getMonth() === currentMonth;

                        let relevantYear = today.getFullYear();
                        if (currentMonth === 11 && dob.getMonth() === 0) {
                          relevantYear = today.getFullYear() + 1;
                        }
                        const ageTurning = relevantYear - dob.getFullYear();

                        const parts = member.dateOfBirth.split('-');
                        const dayStr = parseInt(parts[2], 10);
                        const monthStr = dob.toLocaleString('es-ES', { month: 'long' });

                        const cardBg = isCurrentMonth ? 'bg-white dark:bg-gray-700 border-purple-100 dark:border-purple-900/40 shadow-sm' : 'bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-700 opacity-80';
                        const textColor = isCurrentMonth ? 'text-gray-800 dark:text-gray-100' : 'text-gray-600 dark:text-gray-400';
                        const accentColor = isCurrentMonth ? 'text-purple-700 dark:text-purple-300' : 'text-gray-500 dark:text-gray-500';

                        return (
                          <div key={member.id} className={`flex-shrink-0 w-64 ${cardBg} p-4 rounded-xl border hover:shadow-md transition-shadow group cursor-pointer`}>
                            <div className="flex items-center gap-3 mb-3">
                              {member.photo ? (
                                <img src={member.photo} className={`w-12 h-12 rounded-full object-cover border-2 shadow-sm ${isCurrentMonth ? 'border-white dark:border-gray-600' : 'border-gray-200 dark:border-gray-700 grayscale'}`} alt="" />
                              ) : (
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold border-2 shadow-sm ${isCurrentMonth ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-500 dark:text-purple-300 border-white dark:border-gray-600' : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 border-gray-100 dark:border-gray-700'}`}>
                                  {member.firstName[0]}
                                </div>
                              )}
                              <div className="min-w-0">
                                <div className={`font-bold text-sm truncate ${textColor}`}>{member.firstName} {member.lastName}</div>
                                <div className="text-xs text-gray-400">Cumple {ageTurning} años</div>
                              </div>
                            </div>

                            <div className={`flex items-center justify-between rounded-lg p-2 px-3 ${isCurrentMonth ? 'bg-purple-50 dark:bg-purple-900/30' : 'bg-gray-100 dark:bg-gray-800'}`}>
                              <div className={`text-xs font-semibold uppercase ${accentColor}`}>
                                {dayStr} {monthStr}
                              </div>
                              {isCurrentMonth && (
                                <span className="text-[10px] font-medium text-purple-600 dark:text-purple-300 bg-white dark:bg-gray-700 px-2 py-0.5 rounded-full border border-purple-100 dark:border-purple-800">
                                  Este Mes
                                </span>
                              )}
                              {!isCurrentMonth && (
                                <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-700 px-2 py-0.5 rounded-full border border-gray-200 dark:border-gray-700">
                                  Próximo Mes
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              </div>
            )}

            {/* Members Module */}
            {activeModule === 'members' && !showForm && (
              <div>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        <Users className="w-7 h-7 text-red-600 dark:text-red-500" />
                        Gestión de Miembros
                      </h2>
                      <p className="text-gray-600 dark:text-gray-400 mt-1">Administra y organiza todos los conquistadores</p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-red-600 dark:text-red-400">{members.length}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Total de Miembros</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
                  <div className="flex gap-4 flex-wrap items-center">
                    <div className="flex-1 min-w-64">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="text"
                          placeholder="Buscar por nombre o ID..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => setShowForm(true)}
                      className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2"
                    >
                      <Plus className="w-5 h-5" />
                      Agregar Miembro
                    </button>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                  {filteredMembers.length === 0 ? (
                    <div className="text-center py-12">
                      <UserPlus className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 dark:text-gray-400 text-lg">No hay miembros registrados aún</p>
                    </div>
                  ) : (
                    <div className="space-y-8">
                      {(() => {
                        try {
                          const directiveMembers = sortedMembers.filter(m => m.position && m.position.trim() !== '');
                          let regularMembers = sortedMembers.filter(m => !m.position || m.position.trim() === '');

                          const classPriority = {
                            'Friend': 1, 'Amigo': 1,
                            'Companion': 2, 'Compañero': 2,
                            'Explorer': 3, 'Explorador': 3,
                            'Ranger': 4, 'Orientador': 4,
                            'Voyager': 5, 'Viajero': 5,
                            'Guide': 6, 'Guía': 6,
                            'Master Guide': 7, 'Guía Mayor': 7,
                            'Master Guide Advanced': 8, 'Guía Mayor Investido': 8
                          };

                          regularMembers.sort((a, b) => {
                            const priorityA = classPriority[a.pathfinderClass] || 99;
                            const priorityB = classPriority[b.pathfinderClass] || 99;

                            if (priorityA !== priorityB) {
                              return priorityA - priorityB;
                            }
                            // Secondary sort: Alphabetical by name (Safe check)
                            const nameA = (a.firstName || '') + (a.lastName || '');
                            const nameB = (b.firstName || '') + (b.lastName || '');
                            return nameA.localeCompare(nameB);
                          });

                          // Split into Master (16+) and Junior (<16)
                          const getMemberAge = (m) => {
                            if (!m.dateOfBirth) return 0; // Default to 0 if missing
                            const dob = new Date(m.dateOfBirth);
                            if (isNaN(dob.getTime())) return 0; // Default to 0 if invalid
                            const ageDifMs = Date.now() - dob.getTime();
                            const ageDate = new Date(ageDifMs);
                            return Math.abs(ageDate.getUTCFullYear() - 1970);
                          };

                          const masterMembers = regularMembers.filter(m => getMemberAge(m) >= 16);
                          const juniorMembers = regularMembers.filter(m => getMemberAge(m) < 16);

                          // Helper to render table
                          const renderTable = (membersList, title, icon, colorClass, bgClass) => {
                            if (!membersList || membersList.length === 0) return null;
                            return (
                              <div className="overflow-hidden bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-100 dark:border-gray-700">
                                <div className={`px-6 py-4 border-b border-gray-100 dark:border-gray-700 ${bgClass} flex items-center justify-between`}>
                                  <h3 className={`text-lg font-bold flex items-center gap-2 ${colorClass}`}>
                                    {icon}
                                    {title}
                                  </h3>
                                  <span className={`text-xs font-bold px-2 py-1 rounded-full bg-white dark:bg-gray-800 ${colorClass}`}>
                                    {membersList.length}
                                  </span>
                                </div>
                                <div className="overflow-x-auto">
                                  <table className="w-full">
                                    <thead className="bg-gray-50 dark:bg-gray-900/50 border-b dark:border-gray-700">
                                      <tr>
                                        <th className="pl-24 pr-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Nombre</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Edad</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Género</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Tipo Sangre</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Clase</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Acciones</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                      {membersList.map((member) => (
                                        <tr key={member.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                          <td className="px-6 py-4">
                                            <div className="flex items-center gap-6">
                                              <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0 border-2 border-white dark:border-gray-600 shadow-sm">
                                                {member.photo ? (
                                                  <img
                                                    src={member.photo}
                                                    alt={member.firstName}
                                                    className="w-full h-full object-cover"
                                                  />
                                                ) : (
                                                  <Users className="w-5 h-5 text-gray-400" />
                                                )}
                                              </div>
                                              <div>
                                                <button
                                                  onClick={() => handleViewProfile(member)}
                                                  className="text-sm font-bold text-gray-800 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 mb-0.5 hover:underline text-left block flex items-center gap-1.5"
                                                >
                                                  {member.firstName} {member.lastName}
                                                  {member.baptismDate && (
                                                    <img
                                                      src={adventistLogo}
                                                      alt="Bautizado"
                                                      className="w-4 h-4"
                                                      title={`Bautizado: ${new Date(member.baptismDate).toLocaleDateString()}`}
                                                    />
                                                  )}
                                                </button>
                                                <div className="flex flex-wrap gap-1">
                                                  {member.position && member.position !== '' && (
                                                    <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 flex items-center gap-1">
                                                      <Award className="w-3 h-3" />
                                                      {translatePosition(member.position, member.gender)}
                                                    </span>
                                                  )}
                                                  {member.unitId && (() => {
                                                    const unit = units.find(u => u.id === member.unitId);
                                                    return unit ? (
                                                      <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 flex items-center gap-1">
                                                        <Grid className="w-3 h-3" />
                                                        {unit.name}
                                                      </span>
                                                    ) : null;
                                                  })()}
                                                  {member.unitRole && member.unitRole !== '' && (
                                                    <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full border flex items-center gap-1 ${member.unitRole === 'Captain'
                                                      ? 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800'
                                                      : 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                                                      } `}>
                                                      {member.unitRole}
                                                    </span>
                                                  )}
                                                </div>
                                              </div>
                                            </div>
                                          </td>
                                          <td className="px-6 py-4 text-sm font-medium text-gray-600 dark:text-gray-300">{member.age || getMemberAge(member)} años</td>
                                          <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{member.gender === 'Female' ? 'Femenino' : 'Masculino'}</td>
                                          <td className="px-6 py-4 text-center">
                                            {member.bloodType ? (
                                              <span className="px-2 py-1 text-xs font-bold rounded-full bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-100 dark:border-red-800">
                                                {member.bloodType}
                                              </span>
                                            ) : <span className="text-gray-400 dark:text-gray-500">-</span>}
                                          </td>
                                          <td className="px-6 py-4">
                                            {member.pathfinderClass ? (
                                              <span className={`px-2 py-1 text-xs font-bold capitalize tracking-wider rounded-full border whitespace-nowrap ${pathfinderClasses.find(c => c.value === member.pathfinderClass)?.color || 'bg-gray-100 text-gray-800 border-gray-200'
                                                }`}>
                                                {pathfinderClasses.find(c => c.value === member.pathfinderClass)?.label || member.pathfinderClass}
                                              </span>
                                            ) : (
                                              <span className="text-gray-400 dark:text-gray-500">-</span>
                                            )}
                                          </td>
                                          <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                              <button
                                                onClick={() => handleEdit(member)}
                                                className="p-1.5 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                                                title="Editar"
                                              >
                                                <Edit2 className="w-4 h-4" />
                                              </button>
                                              <button
                                                onClick={() => printMemberForm(member)}
                                                className="p-1.5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                                title="Imprimir Ficha"
                                              >
                                                <FileText className="w-4 h-4" />
                                              </button>
                                              <button
                                                onClick={() => handleDeleteMember(member.id)}
                                                className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                                title="Eliminar"
                                              >
                                                <Trash2 className="w-4 h-4" />
                                              </button>
                                            </div>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            );
                          };

                          return (
                            <>
                              {renderTable(
                                directiveMembers,
                                "Directiva",
                                <Award className="w-5 h-5" />,
                                "text-purple-700 dark:text-purple-300",
                                "bg-purple-50 dark:bg-purple-900/20"
                              )}
                              {renderTable(
                                masterMembers,
                                "Unity Club Máster",
                                <Crown className="w-5 h-5" />,
                                "text-yellow-700 dark:text-yellow-300",
                                "bg-yellow-50 dark:bg-yellow-900/20"
                              )}
                              {renderTable(
                                juniorMembers,
                                "Unity Club",
                                <Users className="w-5 h-5" />,
                                "text-indigo-700 dark:text-indigo-300",
                                "bg-indigo-50 dark:bg-indigo-900/20"
                              )}
                            </>
                          );
                        } catch (error) {
                          console.error("Error rendering members:", error);
                          return (
                            <div className="p-8 text-center text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                              <h3 className="text-lg font-bold mb-2">Error al mostrar la lista de miembros</h3>
                              <p>Ocurrió un problema al procesar los datos de algunos miembros.</p>
                              <pre className="mt-4 text-xs bg-white dark:bg-gray-800 p-4 rounded text-left overflow-auto max-h-40 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-300">
                                {error.message}
                              </pre>
                            </div>
                          );
                        }
                      })()}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Member Form */}
            {activeModule === 'members' && showForm && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
                    {editingMember ? 'Editar Miembro' : 'Agregar Nuevo Miembro'}
                  </h3>
                  <button onClick={handleCancel} className="text-gray-500 hover:text-gray-700">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nombre <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${errors.firstName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} `}
                    />
                    {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Apellido <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${errors.lastName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} `}
                    />
                    {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Fecha de Nacimiento <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${errors.dateOfBirth ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} `}
                    />
                    {errors.dateOfBirth && <p className="text-red-500 text-sm mt-1">{errors.dateOfBirth}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Edad</label>
                    <input
                      type="text"
                      name="age"
                      value={formData.age}
                      readOnly
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-600 text-gray-900 dark:text-gray-300 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Tipo de Sangre <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="bloodType"
                      value={formData.bloodType}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${errors.bloodType ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} `}
                    >
                      <option value="">Select</option>
                      {bloodTypes.map(type => <option key={type} value={type}>{type}</option>)}
                    </select>
                    {errors.bloodType && <p className="text-red-500 text-sm mt-1">{errors.bloodType}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Género <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${errors.gender ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} `}
                    >
                      <option value="">Seleccionar</option>
                      <option value="Male">Masculino</option>
                      <option value="Female">Femenino</option>
                    </select>
                    {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender}</p>}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Dirección <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${errors.address ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} `}
                    />
                    {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Contacto Principal <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="primaryContact"
                      value={formatPhone(formData.primaryContact)}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        handleInputChange({ target: { name: 'primaryContact', value } });
                      }}
                      placeholder="+1 (809) 555-1234"
                      className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${errors.primaryContact ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} `}
                    />
                    {errors.primaryContact && <p className="text-red-500 text-sm mt-1">{errors.primaryContact}</p>}
                  </div>

                  {/* Parents Information - Only if under 18 */}
                  {parseInt(formData.age) < 18 && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Nombre del Padre <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="fatherName"
                          value={formData.fatherName}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${errors.fatherName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} `}
                        />
                        {errors.fatherName && <p className="text-red-500 text-sm mt-1">{errors.fatherName}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Contacto del Padre</label>
                        <input
                          type="tel"
                          name="fatherContact"
                          value={formatPhone(formData.fatherContact)}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '');
                            handleInputChange({ target: { name: 'fatherContact', value } });
                          }}
                          placeholder="+1 (809) 555-1234"
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Nombre de la Madre <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="motherName"
                          value={formData.motherName}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${errors.motherName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} `}
                        />
                        {errors.motherName && <p className="text-red-500 text-sm mt-1">{errors.motherName}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Contacto de la Madre</label>
                        <input
                          type="tel"
                          name="motherContact"
                          value={formatPhone(formData.motherContact)}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '');
                            handleInputChange({ target: { name: 'motherContact', value } });
                          }}
                          placeholder="+1 (809) 555-1234"
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                    </>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Religión <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="religion"
                      value={formData.religion}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${errors.religion ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} `}
                    />
                    {errors.religion && <p className="text-red-500 text-sm mt-1">{errors.religion}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Cargo <span className="text-gray-500 dark:text-gray-400 text-xs">(Opcional)</span>
                    </label>
                    <select
                      name="position"
                      value={formData.position}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">Ninguno (Miembro Regular)</option>
                      <option value="Director">Director</option>
                      <option value="Assistant Director">Subdirector</option>
                      <option value="Secretary">Secretario/a</option>
                      <option value="Chaplain">Capellán</option>
                      <option value="Counselor">Consejero/a</option>
                      <option value="Treasurer">Tesorero/a</option>
                      <option value="DUMC">DUMC</option>
                      <option value="Class Instructor">Instructor de Clase</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Fecha de Bautismo</label>
                    <input
                      type="date"
                      name="baptismDate"
                      value={formData.baptismDate}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  {/* Club Information Section */}
                  <div className="md:col-span-2 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                      <Award className="w-5 h-5 text-red-600 dark:text-red-500" />
                      Información del Club
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Clase
                        </label>
                        <select
                          name="pathfinderClass"
                          value={formData.pathfinderClass || ''}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                          <option value="">Seleccionar Clase</option>
                          {pathfinderClasses.map(pc => (
                            <option key={pc.value} value={pc.value}>{pc.label}</option>
                          ))}
                        </select>
                        {(formData.pathfinderClass !== 'Master Guide' && formData.pathfinderClass !== 'Master Guide Advanced') && (
                          <div className="mt-2 flex items-center">
                            <input
                              type="checkbox"
                              id="isMasterGuideCandidate"
                              name="isMasterGuideCandidate"
                              checked={formData.isMasterGuideCandidate || false}
                              onChange={handleInputChange}
                              className="w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
                            />
                            <label htmlFor="isMasterGuideCandidate" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                              También es Aspirante a Guía Mayor
                            </label>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Unidad
                        </label>
                        <select
                          name="unitId"
                          value={formData.unitId || ''}
                          onChange={handleInputChange}
                          disabled={!!formData.position} // Disable if Directive
                          className={`w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${!!formData.position ? 'bg-gray-100 dark:bg-gray-600' : ''}`}
                        >
                          <option value="">Seleccionar Unidad</option>
                          {units.filter(unit => {
                            // If DOB is not set, allow all (or none? - allowing all for better UX before input)
                            if (!formData.dateOfBirth) return true;

                            const age = calculateAge(formData.dateOfBirth);
                            const type = unit.clubType || 'conquistadores';

                            if (type === 'aventureros') return age >= 4 && age <= 9;
                            if (type === 'conquistadores') return age >= 10 && age <= 15;
                            if (type === 'guias') return age >= 16;
                            return true;
                          }).map(unit => (
                            <option key={unit.id} value={unit.id}>{unit.name} ({unit.clubType || 'Conquistadores'})</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Rol en Unidad
                        </label>
                        <select
                          name="unitRole"
                          value={formData.unitRole || ''}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                          <option value="">Ninguno</option>
                          <option value="Captain">Capitán</option>
                          <option value="Secretary">Secretario</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Medical Information Section */}
                  <div className="md:col-span-2 mt-6 pt-6 border-t border-gray-200">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <Heart className="w-5 h-5 text-red-600" />
                      Información Médica
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Alergias <span className="text-gray-500 text-xs">(Opcional)</span>
                        </label>
                        <textarea
                          name="allergies"
                          value={formData.allergies}
                          onChange={handleInputChange}
                          placeholder="Listar alergias conocidas..."
                          rows="3"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Condición Médica <span className="text-gray-500 text-xs">(Opcional)</span>
                        </label>
                        <textarea
                          name="medicalCondition"
                          value={formData.medicalCondition}
                          onChange={handleInputChange}
                          placeholder="Diabetes, Asma, Epilepsia, etc."
                          rows="3"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Medicamentos para Condición <span className="text-gray-500 text-xs">(Opcional)</span>
                        </label>
                        <textarea
                          name="conditionMedications"
                          value={formData.conditionMedications}
                          onChange={handleInputChange}
                          placeholder="Medicamentos relacionados a condición médica..."
                          rows="3"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Medicamentos Continuos <span className="text-gray-500 text-xs">(Opcional)</span>
                        </label>
                        <textarea
                          name="continuousMedications"
                          value={formData.continuousMedications}
                          onChange={handleInputChange}
                          placeholder="Medicamentos tomados diariamente..."
                          rows="3"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                        />
                      </div>

                      <div className="md:col-span-2 bg-red-50 p-4 rounded-lg border border-red-200">
                        <h4 className="text-sm font-bold text-red-900 mb-3 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" />
                          Contacto de Emergencia (Obligatorio)
                        </h4>

                        <div className="mb-4 space-y-2">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="useParentAsEmergency"
                              value="father"
                              checked={formData.useParentAsEmergency === 'father'}
                              onChange={(e) => {
                                setFormData(prev => ({
                                  ...prev,
                                  useParentAsEmergency: e.target.value,
                                  emergencyContactName: prev.fatherName,
                                  emergencyContactRelationship: 'Father',
                                  emergencyContactPhone: prev.fatherContact
                                }));
                              }}
                              className="w-4 h-4 text-red-600"
                            />
                            <span className="text-sm font-medium text-gray-700">Usar Padre como Contacto de Emergencia</span>
                          </label>

                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="useParentAsEmergency"
                              value="mother"
                              checked={formData.useParentAsEmergency === 'mother'}
                              onChange={(e) => {
                                setFormData(prev => ({
                                  ...prev,
                                  useParentAsEmergency: e.target.value,
                                  emergencyContactName: prev.motherName,
                                  emergencyContactRelationship: 'Mother',
                                  emergencyContactPhone: prev.motherContact
                                }));
                              }}
                              className="w-4 h-4 text-red-600"
                            />
                            <span className="text-sm font-medium text-gray-700">Usar Madre como Contacto de Emergencia</span>
                          </label>

                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="useParentAsEmergency"
                              value="none"
                              checked={formData.useParentAsEmergency === 'none'}
                              onChange={(e) => {
                                setFormData(prev => ({
                                  ...prev,
                                  useParentAsEmergency: e.target.value,
                                  emergencyContactName: '',
                                  emergencyContactRelationship: '',
                                  emergencyContactPhone: ''
                                }));
                              }}
                              className="w-4 h-4 text-red-600"
                            />
                            <span className="text-sm font-medium text-gray-700">Otro Contacto de Emergencia</span>
                          </label>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Nombre Contacto de Emergencia <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              name="emergencyContactName"
                              value={formData.emergencyContactName}
                              onChange={handleInputChange}
                              disabled={formData.useParentAsEmergency !== 'none'}
                              className={`w-full px-4 py-2 border rounded-lg ${formData.useParentAsEmergency !== 'none' ? 'bg-gray-100' : ''
                                } ${errors.emergencyContactName ? 'border-red-500' : 'border-gray-300'} `}
                            />
                            {errors.emergencyContactName && <p className="text-red-500 text-sm mt-1">{errors.emergencyContactName}</p>}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Relationship (Parentesco) <span className="text-red-500">*</span>
                            </label>
                            <select
                              name="emergencyContactRelationship"
                              value={formData.emergencyContactRelationship}
                              onChange={handleInputChange}
                              disabled={formData.useParentAsEmergency !== 'none'}
                              className={`w-full px-4 py-2 border rounded-lg ${formData.useParentAsEmergency !== 'none' ? 'bg-gray-100' : ''
                                } ${errors.emergencyContactRelationship ? 'border-red-500' : 'border-gray-300'} `}
                            >
                              <option value="">Seleccionar Parentesco</option>
                              <option value="Father">Padre</option>
                              <option value="Mother">Madre</option>
                              <option value="Grandparent">Abuelo/a</option>
                              <option value="Sibling">Hermano/a</option>
                              <option value="Uncle/Aunt">Tío/a</option>
                              <option value="Spouse">Esposo/a</option>
                              <option value="Guardian">Tutor</option>
                              <option value="Other">Otro</option>
                            </select>
                            {errors.emergencyContactRelationship && <p className="text-red-500 text-sm mt-1">{errors.emergencyContactRelationship}</p>}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Teléfono de Emergencia <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="tel"
                              name="emergencyContactPhone"
                              value={formatPhone(formData.emergencyContactPhone)}
                              onChange={(e) => {
                                if (formData.useParentAsEmergency === 'none') {
                                  const value = e.target.value.replace(/\D/g, '');
                                  handleInputChange({ target: { name: 'emergencyContactPhone', value } });
                                }
                              }}
                              disabled={formData.useParentAsEmergency !== 'none'}
                              placeholder="+1 (809) 555-1234"
                              className={`w-full px-4 py-2 border rounded-lg ${formData.useParentAsEmergency !== 'none' ? 'bg-gray-100' : ''
                                } ${errors.emergencyContactPhone ? 'border-red-500' : 'border-gray-300'} `}
                            />
                            {errors.emergencyContactPhone && <p className="text-red-500 text-sm mt-1">{errors.emergencyContactPhone}</p>}
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nombre Doctor/Pediatra <span className="text-gray-500 text-xs">(Opcional)</span>
                        </label>
                        <input
                          type="text"
                          name="doctorName"
                          value={formData.doctorName}
                          onChange={handleInputChange}
                          placeholder="Dr. Juan Pérez"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Teléfono Doctor/Pediatra <span className="text-gray-500 text-xs">(Opcional)</span>
                        </label>
                        <input
                          type="tel"
                          name="doctorPhone"
                          value={formatPhone(formData.doctorPhone)}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '');
                            handleInputChange({ target: { name: 'doctorPhone', value } });
                          }}
                          placeholder="+1 (809) 555-1234"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Aseguradora <span className="text-gray-500 text-xs">(Opcional)</span>
                        </label>
                        <input
                          type="text"
                          name="insuranceProvider"
                          value={formData.insuranceProvider}
                          onChange={handleInputChange}
                          placeholder="e.g., ARS Palic, Humano, SENASA"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Número de Seguro <span className="text-gray-500 text-xs">(Opcional)</span>
                        </label>
                        <input
                          type="text"
                          name="insuranceNumber"
                          value={formData.insuranceNumber}
                          onChange={handleInputChange}
                          placeholder="Póliza de seguro o número de afiliado"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Notas Médicas Especiales <span className="text-gray-500 text-xs">(Opcional)</span>
                        </label>
                        <textarea
                          name="specialNotes"
                          value={formData.specialNotes}
                          onChange={handleInputChange}
                          placeholder="Cualquier otra información médica importante..."
                          rows="3"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Photo Upload Section */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Foto del Miembro <span className="text-gray-500 text-xs">(Opcional)</span>
                    </label>

                    <div className="flex items-start gap-4">
                      {/* Photo Preview */}
                      <div className="flex-shrink-0">
                        <div className="w-32 h-32 rounded-lg overflow-hidden bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center border-2 border-gray-300">
                          {formData.photo ? (
                            <img
                              src={formData.photo}
                              alt="Member preview"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Users className="w-16 h-16 text-gray-400" />
                          )}
                        </div>
                      </div>

                      {/* Upload Controls */}
                      <div className="flex-1">
                        <div className="flex flex-col gap-3">
                          <input
                            type="file"
                            id="photo-upload"
                            accept="image/*"
                            onChange={handlePhotoChange}
                            className="hidden"
                          />
                          <label
                            htmlFor="photo-upload"
                            className="cursor-pointer inline-flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {formData.photo ? 'Cambiar Foto' : 'Subir Foto'}
                          </label>

                          {formData.photo && (
                            <button
                              type="button"
                              onClick={() => setFormData(prev => ({ ...prev, photo: '' }))}
                              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                            >
                              <X className="w-5 h-5" />
                              Eliminar Foto
                            </button>
                          )}

                          <p className="text-xs text-gray-500">
                            Recommended: Square image, at least 400x400px. Max 5MB.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 mt-8">
                  <button
                    onClick={handleSubmit}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium flex items-center justify-center gap-2"
                  >
                    <Save className="w-5 h-5" />
                    {editingMember ? 'Actualizar' : 'Guardar'}
                  </button>
                  <button
                    onClick={handleCancel}
                    className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}

            {/* Directive Module */}
            {activeModule === 'directive' && (
              <>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        <Award className="w-7 h-7 text-purple-600 dark:text-purple-400" />
                        Directiva del Club
                      </h2>
                      <p className="text-gray-600 dark:text-gray-300 mt-1">Equipo de liderazgo y administración</p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-purple-600">
                        {members.filter(m => m.position && m.position.trim() !== '').length}
                      </div>
                      <div className="text-sm text-gray-500">Miembros Directiva</div>
                    </div>
                  </div>
                </div>

                {(() => {
                  const getHierarchicalLevel = (position) => {
                    if (['Director', 'Assistant Director', 'Secretary', 'Chaplain'].includes(position)) return 1;
                    if (['Counselor', 'Treasurer', 'DUMC'].includes(position)) return 2;
                    if (['Class Instructor'].includes(position)) return 3;
                    return 4; // Others
                  };

                  const getLevelTitle = (level) => {
                    switch (level) {
                      case 1: return 'Nivel 1 - Administrativa';
                      case 2: return 'Nivel 2 - Consejería y Staff';
                      case 3: return 'Nivel 3 - Instructoría';
                      default: return 'Otros Cargos';
                    }
                  };

                  const translatePosition = (position) => {
                    const translations = {
                      'Director': 'Director',
                      'Assistant Director': 'Subdirector',
                      'Secretary': 'Secretario/a',
                      'Chaplain': 'Capellán',
                      'Counselor': 'Consejero/a',
                      'Treasurer': 'Tesorero/a',
                      'DUMC': 'DUMC',
                      'Class Instructor': 'Instructor de Clase'
                    };
                    return translations[position] || position;
                  };

                  const directiveMembers = members
                    .filter(m => m.position && m.position.trim() !== '');

                  // Sort members
                  const sortMembers = (list) => {
                    const roleOrder = [
                      'Director', 'Assistant Director', 'Secretary', 'Chaplain',
                      'Counselor', 'Treasurer', 'DUMC',
                      'Class Instructor'
                    ];
                    return list.sort((a, b) => {
                      const idxA = roleOrder.indexOf(a.position);
                      const idxB = roleOrder.indexOf(b.position);
                      if (idxA !== idxB && idxA !== -1 && idxB !== -1) return idxA - idxB;
                      return `${a.firstName} ${a.lastName} `.localeCompare(`${b.firstName} ${b.lastName} `);
                    });
                  };

                  // Group by level
                  const levels = { 1: [], 2: [], 3: [], 4: [] };
                  directiveMembers.forEach(member => {
                    const level = getHierarchicalLevel(member.position);
                    levels[level].push(member);
                  });

                  // Calculate stats for summary
                  const totalMembers = members.length;
                  const totalLeaders = directiveMembers.length;
                  const uniquePositions = new Set(directiveMembers.map(m => m.position)).size;
                  const totalCounselors = directiveMembers.filter(m => m.position === 'Counselor').length;

                  return (
                    <div className="space-y-12">
                      {directiveMembers.length === 0 ? (
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
                          <Award className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            No hay miembros en la directiva aún
                          </h3>
                          <p className="text-gray-500 mb-6">
                            Comienza a construir el equipo de liderazgo asignando cargos a los miembros.
                          </p>
                          <button
                            onClick={() => {
                              setActiveModule('members');
                              setShowForm(true);
                            }}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium inline-flex items-center gap-2"
                          >
                            <Plus className="w-5 h-5" />
                            Agregar Miembro con Cargo
                          </button>
                        </div>
                      ) : (
                        <>
                          {[1, 2, 3, 4].map(level => {
                            const levelMembers = sortMembers(levels[level]);
                            if (levelMembers.length === 0) return null;

                            return (
                              <div key={level}>
                                <div className="mb-6">
                                  <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                                    <Award className={`w-6 h-6 ${level === 1 ? 'text-purple-600' : level === 2 ? 'text-indigo-600' : 'text-blue-600'} `} />
                                    {getLevelTitle(level)}
                                    <span className="text-sm font-normal text-gray-500 ml-2">
                                      ({levelMembers.length})
                                    </span>
                                  </h3>
                                  <div className={`h-1 w-20 rounded-full mt-2 ${level === 1 ? 'bg-purple-600' : level === 2 ? 'bg-indigo-600' : 'bg-blue-600'} `}></div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                  {levelMembers.map(member => (
                                    <div key={member.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all overflow-hidden group">
                                      <div className={`h-2 w-full ${level === 1 ? 'bg-purple-600' : level === 2 ? 'bg-indigo-600' : 'bg-blue-600'} `}></div>
                                      <div className="p-5 flex flex-col items-center text-center">
                                        <div className="w-20 h-20 mb-3 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 ring-2 ring-offset-2 ring-gray-200 dark:ring-gray-600 dark:ring-offset-gray-800 group-hover:ring-purple-400 transition-all">
                                          {member.photo ? (
                                            <img src={member.photo} alt={member.firstName} className="w-full h-full object-cover" />
                                          ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400 font-bold text-xl">
                                              {member.firstName[0]}{member.lastName[0]}
                                            </div>
                                          )}
                                        </div>

                                        <button
                                          onClick={() => handleViewProfile(member)}
                                          className="font-bold text-gray-900 dark:text-white text-lg leading-tight mb-1 hover:text-purple-700 dark:hover:text-purple-400 transition-colors"
                                        >
                                          {member.firstName} {member.lastName}
                                        </button>
                                        <div className="text-sm font-medium text-purple-700 dark:text-purple-300 mb-3 bg-purple-50 dark:bg-purple-900/30 px-3 py-1 rounded-full">
                                          {translatePosition(member.position, member.gender)}
                                        </div>

                                        <div className="w-full pt-3 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center mt-auto">

                                          {member.primaryContact && (
                                            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                              <Phone className="w-3 h-3" />
                                              {formatPhone(member.primaryContact)}
                                            </div>
                                          )}

                                          <button
                                            onClick={() => {
                                              handleEdit(member);
                                              setActiveModule('members');
                                            }}
                                            className="ml-auto text-gray-400 dark:text-gray-500 hover:text-purple-600 dark:hover:text-purple-400 p-1 rounded-full hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                                            title="Editar"
                                          >
                                            <Edit2 className="w-4 h-4" />
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          })}

                          {/* Summary Card */}
                          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg shadow-lg p-6 mt-8">
                            <h3 className="text-xl font-bold text-white mb-4">Resumen de Liderazgo</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div className="bg-white/20 rounded-lg p-4 text-center">
                                <div className="text-3xl font-bold text-white mb-1">{totalLeaders}</div>
                                <div className="text-sm text-purple-100">Total Líderes</div>
                              </div>
                              <div className="bg-white/20 rounded-lg p-4 text-center">
                                <div className="text-3xl font-bold text-white mb-1">{totalMembers}</div>
                                <div className="text-sm text-purple-100">Total Miembros</div>
                              </div>
                              <div className="bg-white/20 rounded-lg p-4 text-center">
                                <div className="text-3xl font-bold text-white mb-1">{uniquePositions}</div>
                                <div className="text-sm text-purple-100">Cargos Ocupados</div>
                              </div>
                              <div className="bg-white/20 rounded-lg p-4 text-center">
                                <div className="text-3xl font-bold text-white mb-1">{totalCounselors}</div>
                                <div className="text-sm text-purple-100">Consejeros</div>
                              </div>
                            </div>
                          </div>

                          {/* Quick Action */}
                          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mt-6">
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="text-lg font-bold text-gray-800 dark:text-white">¿Necesitas agregar más líderes?</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                  Agrega nuevos miembros y asígnales cargos de liderazgo
                                </p>
                                <p className="text-xs text-purple-600 dark:text-purple-400 mt-2 font-medium">
                                  💡 Nota: Puedes tener múltiples Consejeros e Instructores
                                </p>
                              </div>
                              <button
                                onClick={() => {
                                  setActiveModule('members');
                                  setShowForm(true);
                                }}
                                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2"
                              >
                                <UserPlus className="w-5 h-5" />
                                Agregar Miembro
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })()}
              </>
            )}

            {/* Parents Module */}
            {activeModule === 'parents' && (
              <div>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        <UserPlus className="w-7 h-7 text-blue-600" />
                        Directorio de Padres
                      </h2>
                      <p className="text-gray-600 dark:text-gray-300 mt-1">Información de contacto de padres y tutores</p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-blue-600">
                        {(() => {
                          const uniqueParents = new Set();
                          members.forEach(member => {
                            if (member.fatherName) uniqueParents.add(member.fatherName);
                            if (member.motherName) uniqueParents.add(member.motherName);
                          });
                          return uniqueParents.size;
                        })()}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Total de Padres</div>
                    </div>
                  </div>
                </div>

                {members.length === 0 ? (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
                    <UserPlus className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400 text-lg">No hay miembros registrados aún</p>
                    <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">Agrega miembros para ver la información de sus padres</p>
                  </div>
                ) : (
                  <>
                    {/* Fathers Section */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
                      <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                        <Users className="w-6 h-6 text-blue-600" />
                        Padres
                      </h3>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-blue-50 dark:bg-blue-900/30 border-b dark:border-blue-800">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-blue-900 dark:text-blue-100 uppercase">Nombre</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-blue-900 dark:text-blue-100 uppercase">Contacto</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-blue-900 dark:text-blue-100 uppercase">Hijos</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-blue-900 dark:text-blue-100 uppercase">Acciones</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y dark:divide-gray-700">
                            {(() => {
                              const fathersMap = new Map();
                              members.forEach(member => {
                                if (member.fatherName) {
                                  if (!fathersMap.has(member.fatherName)) {
                                    fathersMap.set(member.fatherName, {
                                      name: member.fatherName,
                                      contact: member.fatherContact || 'N/A',
                                      children: []
                                    });
                                  }
                                  fathersMap.get(member.fatherName).children.push({
                                    name: `${member.firstName} ${member.lastName}`,
                                    member: member
                                  });
                                }
                              });

                              return Array.from(fathersMap.values()).sort((a, b) => a.name.localeCompare(b.name)).map((father, index) => (
                                <tr key={index} className="hover:bg-blue-50 dark:hover:bg-blue-900/20">
                                  <td className="px-6 py-4">
                                    <div className="font-medium text-gray-900 dark:text-white">{father.name}</div>
                                  </td>
                                  <td className="px-6 py-4">
                                    <div className="text-gray-700 dark:text-gray-300">{father.contact}</div>
                                  </td>
                                  <td className="px-6 py-4">
                                    <div className="flex flex-wrap gap-2">
                                      {father.children.map((child, i) => (
                                        <button
                                          key={i}
                                          onClick={() => handleViewProfile(child.member)}
                                          className="px-3 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 text-xs font-semibold rounded-full hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                                        >
                                          {child.name}
                                        </button>
                                      ))}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4">
                                    <button
                                      onClick={() => handleDeleteParent(father.name, 'father')}
                                      className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 font-medium"
                                    >
                                      Eliminar
                                    </button>
                                  </td>
                                </tr>
                              ));
                            })()}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Mothers Section */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                      <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                        <Users className="w-6 h-6 text-pink-600" />
                        Madres
                      </h3>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-pink-50 dark:bg-pink-900/30 border-b dark:border-pink-800">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-pink-900 dark:text-pink-100 uppercase">Nombre</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-pink-900 dark:text-pink-100 uppercase">Contacto</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-pink-900 dark:text-pink-100 uppercase">Hijos</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-pink-900 dark:text-pink-100 uppercase">Acciones</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y dark:divide-gray-700">
                            {(() => {
                              const mothersMap = new Map();
                              members.forEach(member => {
                                if (member.motherName) {
                                  if (!mothersMap.has(member.motherName)) {
                                    mothersMap.set(member.motherName, {
                                      name: member.motherName,
                                      contact: member.motherContact || 'N/A',
                                      children: []
                                    });
                                  }
                                  mothersMap.get(member.motherName).children.push({
                                    name: `${member.firstName} ${member.lastName}`,
                                    member: member
                                  });
                                }
                              });

                              return Array.from(mothersMap.values()).sort((a, b) => a.name.localeCompare(b.name)).map((mother, index) => (
                                <tr key={index} className="hover:bg-pink-50 dark:hover:bg-pink-900/20">
                                  <td className="px-6 py-4">
                                    <div className="font-medium text-gray-900 dark:text-white">{mother.name}</div>
                                  </td>
                                  <td className="px-6 py-4">
                                    <div className="text-gray-700 dark:text-gray-300">{mother.contact}</div>
                                  </td>
                                  <td className="px-6 py-4">
                                    <div className="flex flex-wrap gap-2">
                                      {mother.children.map((child, i) => (
                                        <button
                                          key={i}
                                          onClick={() => handleViewProfile(child.member)}
                                          className="px-3 py-1 bg-pink-100 dark:bg-pink-900/50 text-pink-800 dark:text-pink-200 text-xs font-semibold rounded-full hover:bg-pink-200 dark:hover:bg-pink-800 transition-colors"
                                        >
                                          {child.name}
                                        </button>
                                      ))}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4">
                                    <button
                                      onClick={() => handleDeleteParent(mother.name, 'mother')}
                                      className="text-red-600 hover:text-red-900 font-medium"
                                    >
                                      Eliminar
                                    </button>
                                  </td>
                                </tr>
                              ));
                            })()}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}




            {/* Units Module */}
            {activeModule === 'units' && (
              <div>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        <Grid className="w-7 h-7 text-teal-600" />
                        Gestión de Unidades
                      </h2>
                      <p className="text-gray-600 dark:text-gray-300 mt-1">Organiza miembros en unidades con capitanes y secretarios</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleAutoFillUnits}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg font-medium flex items-center gap-2"
                        title="Asignar miembros automáticamente por edad y género"
                      >
                        <Users className="w-5 h-5" />
                        Auto-Llenar
                      </button>
                      <button
                        onClick={() => {
                          setShowUnitForm(true);
                          setEditingUnit(null);
                          setUnitFormData({ name: '', logo: '', clubType: 'conquistadores', gender: 'Mixed', captainId: '', secretaryId: '' });
                        }}
                        className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2"
                      >
                        <Plus className="w-5 h-5" />
                        Agregar Nueva Unidad
                      </button>
                    </div>
                  </div>
                </div>

                {/* Unit Form Modal */}
                {showUnitForm && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-2xl">
                      <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                        <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
                          {editingUnit ? 'Editar Unidad' : 'Agregar Nueva Unidad'}
                        </h3>
                        <button
                          onClick={() => setShowUnitForm(false)}
                          className="text-gray-500 hover:text-gray-700 p-2"
                        >
                          <X className="w-6 h-6" />
                        </button>
                      </div>

                      <div className="p-6 space-y-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Unit Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={unitFormData.name}
                            onChange={(e) => setUnitFormData({ ...unitFormData, name: e.target.value })}
                            placeholder="e.g., Águilas, Leones, Tigres"
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nombre de la Unidad <span className="text-red-500">*</span>
                          </label>
                          <div className="flex items-start gap-4">
                            <div className="flex-shrink-0">
                              <div className="w-24 h-24 rounded-lg overflow-hidden bg-gradient-to-br from-teal-100 to-cyan-100 dark:from-teal-900 dark:to-cyan-900 flex items-center justify-center border-2 border-gray-300 dark:border-gray-600">
                                {unitFormData.logo ? (
                                  <img src={unitFormData.logo} alt="Unit logo" className="w-full h-full object-cover" />
                                ) : (
                                  <Grid className="w-12 h-12 text-teal-400" />
                                )}
                              </div>
                            </div>
                            <div className="flex-1">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onloadend = () => {
                                      setUnitFormData({ ...unitFormData, logo: reader.result });
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              />
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Recomendado: Imagen cuadrada, al menos 200x200px</p>
                            </div>
                          </div>
                        </div>


                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Tipo de Club <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={unitFormData.clubType}
                            onChange={(e) => {
                              setUnitFormData({
                                ...unitFormData,
                                clubType: e.target.value,
                                captainId: '', // Reset selections when type changes
                                secretaryId: ''
                              });
                            }}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          >
                            <option value="aventureros">Aventureros (4-9 años)</option>
                            <option value="conquistadores">Conquistadores (10-15 años)</option>
                            <option value="guias">Guías Mayores (16+ años)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Género de la Unidad <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={unitFormData.gender}
                            onChange={(e) => {
                              setUnitFormData({
                                ...unitFormData,
                                gender: e.target.value,
                                captainId: '', // Reset selections when gender changes might invalidate them
                                secretaryId: ''
                              });
                            }}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          >
                            <option value="Mixed">Mixta (Todos)</option>
                            <option value="Male">Masculina (Varones)</option>
                            <option value="Female">Femenina (Hembras)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Capitán de Unidad <span className="text-gray-500 dark:text-gray-400 text-xs">(Opcional)</span>
                          </label>
                          <select
                            value={unitFormData.captainId}
                            onChange={(e) => setUnitFormData({ ...unitFormData, captainId: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          >
                            <option value="">Seleccionar Capitán</option>
                            {members.filter(m => {
                              // Filter by position (none) AND age range based on club type
                              if (m.position && m.position !== '') return false;

                              const age = calculateAge(m.dateOfBirth);

                              // Gender Filter
                              if (unitFormData.gender === 'Male' && (m.gender !== 'Male' && m.gender !== 'M')) return false;
                              if (unitFormData.gender === 'Female' && (m.gender !== 'Female' && m.gender !== 'F')) return false;

                              if (unitFormData.clubType === 'aventureros') return age >= 4 && age <= 9;
                              if (unitFormData.clubType === 'conquistadores') return age >= 10 && age <= 15;
                              if (unitFormData.clubType === 'guias') return age >= 16;
                              return true;
                            }).map((member) => (
                              <option key={member.id} value={member.id}>
                                {member.firstName} {member.lastName} ({calculateAge(member.dateOfBirth)} años)
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Secretario de Unidad <span className="text-gray-500 dark:text-gray-400 text-xs">(Opcional)</span>
                          </label>
                          <select
                            value={unitFormData.secretaryId}
                            onChange={(e) => setUnitFormData({ ...unitFormData, secretaryId: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          >
                            <option value="">Seleccionar Secretario</option>
                            {members.filter(m => {
                              // Filter by position (none) AND age range based on club type
                              if (m.position && m.position !== '') return false;

                              const age = calculateAge(m.dateOfBirth);

                              // Gender Filter
                              if (unitFormData.gender === 'Male' && (m.gender !== 'Male' && m.gender !== 'M')) return false;
                              if (unitFormData.gender === 'Female' && (m.gender !== 'Female' && m.gender !== 'F')) return false;

                              if (unitFormData.clubType === 'aventureros') return age >= 4 && age <= 9;
                              if (unitFormData.clubType === 'conquistadores') return age >= 10 && age <= 15;
                              if (unitFormData.clubType === 'guias') return age >= 16;
                              return true;
                            }).map((member) => (
                              <option key={member.id} value={member.id}>
                                {member.firstName} {member.lastName} ({calculateAge(member.dateOfBirth)} años)
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="flex gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                          <button
                            onClick={() => {
                              if (!unitFormData.name.trim()) {
                                alert('Por favor ingrese un nombre para la unidad');
                                return;
                              }

                              if (editingUnit) {
                                setUnits(units.map(u => u.id === editingUnit.id ? { ...editingUnit, ...unitFormData } : u));

                                // Update members with new roles
                                const updatedMembers = members.map(m => {
                                  if (m.id === unitFormData.captainId) {
                                    return { ...m, unitId: editingUnit.id, unitRole: 'Captain' };
                                  }
                                  if (m.id === unitFormData.secretaryId) {
                                    return { ...m, unitId: editingUnit.id, unitRole: 'Secretary' };
                                  }
                                  if (m.unitId === editingUnit.id && m.unitRole &&
                                    m.id !== unitFormData.captainId && m.id !== unitFormData.secretaryId) {
                                    return { ...m, unitRole: '' };
                                  }
                                  return m;
                                });
                                setMembers(updatedMembers);
                              } else {
                                const newUnit = {
                                  id: Date.now().toString(),
                                  ...unitFormData
                                };
                                setUnits([...units, newUnit]);

                                // Assign roles to members
                                const updatedMembers = members.map(m => {
                                  if (m.id === unitFormData.captainId) {
                                    return { ...m, unitId: newUnit.id, unitRole: 'Captain' };
                                  }
                                  if (m.id === unitFormData.secretaryId) {
                                    return { ...m, unitId: newUnit.id, unitRole: 'Secretary' };
                                  }
                                  return m;
                                });
                                setMembers(updatedMembers);
                              }

                              setShowUnitForm(false);
                              setUnitFormData({ name: '', logo: '', clubType: 'conquistadores', gender: 'Mixed', captainId: '', secretaryId: '' });
                            }}
                            className="flex-1 bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg font-medium flex items-center justify-center gap-2"
                          >
                            <Save className="w-5 h-5" />
                            {editingUnit ? 'Actualizar Unidad' : 'Crear Unidad'}
                          </button>
                          <button
                            onClick={() => setShowUnitForm(false)}
                            className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Units List */}
                {units.length === 0 ? (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
                    <Grid className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400 text-lg">No unidades creadas aún</p>
                    <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">Click "Agregar Nueva Unidad" para crear tu primera unidad</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {units.map((unit) => {
                      const unitMembers = members.filter(m => m.unitId === unit.id);
                      const captain = members.find(m => m.id === unit.captainId);
                      const secretary = members.find(m => m.id === unit.secretaryId);

                      return (
                        <div key={unit.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                          <div className="p-6 bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 border-b border-teal-200 dark:border-teal-800">
                            <div className="flex items-start gap-4 mb-4">
                              <div className="w-16 h-16 rounded-lg overflow-hidden bg-white dark:bg-gray-700 flex items-center justify-center flex-shrink-0 border-2 border-teal-200 dark:border-teal-800">
                                {unit.logo ? (
                                  <img src={unit.logo} alt={unit.name} className="w-full h-full object-cover" />
                                ) : (
                                  <Grid className="w-8 h-8 text-teal-400" />
                                )}
                              </div>
                              <div className="flex-1">
                                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-1">{unit.name}</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-300">{unitMembers.length} miembro{unitMembers.length !== 1 ? 's' : ''}</p>
                              </div>
                            </div>

                            {/* Leaders */}
                            <div className="space-y-2">
                              {captain && (
                                <div className="flex items-center gap-2 text-sm">
                                  <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 rounded font-semibold text-xs">
                                    {unit.gender === 'Female' ? 'Capitana' : 'Capitán'}
                                  </span>
                                  <span className="text-gray-700 dark:text-gray-200">{captain.firstName} {captain.lastName}</span>
                                </div>
                              )}
                              {secretary && (
                                <div className="flex items-center gap-2 text-sm">
                                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded font-semibold text-xs">
                                    {unit.gender === 'Female' ? 'Secretaria' : 'Secretario'}
                                  </span>
                                  <span className="text-gray-700 dark:text-gray-200">{secretary.firstName} {secretary.lastName}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="p-4">
                            <div className="flex gap-2 mb-3">
                              <button
                                onClick={() => {
                                  setEditingUnit(unit);
                                  setUnitFormData({
                                    name: unit.name,
                                    logo: unit.logo,
                                    clubType: unit.clubType || 'conquistadores',
                                    gender: unit.gender || 'Mixed',
                                    captainId: unit.captainId || '',
                                    secretaryId: unit.secretaryId || ''
                                  });
                                  setShowUnitForm(true);
                                }}
                                className="flex-1 px-3 py-2 text-sm bg-teal-600 hover:bg-teal-700 text-white rounded font-medium"
                              >
                                <Edit2 className="w-4 h-4 inline mr-1" />
                                Editar
                              </button>
                              <button
                                onClick={() => {
                                  if (window.confirm(`¿Eliminar unidad "${unit.name}" ? Los miembros serán asignados como 'sin unidad'.`)) {
                                    setUnits(units.filter(u => u.id !== unit.id));
                                    // Remove unit assignment from members
                                    const updatedMembers = members.map(m =>
                                      m.unitId === unit.id ? { ...m, unitId: '', unitRole: '' } : m
                                    );
                                    setMembers(updatedMembers);
                                  }
                                }}
                                className="px-3 py-2 text-sm border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded font-medium"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>

                            {/* Assign Members */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Asignar Miembros:</label>
                              <select
                                onChange={(e) => {
                                  const memberId = e.target.value;
                                  if (memberId) {
                                    const updatedMembers = members.map(m =>
                                      m.id === memberId ? { ...m, unitId: unit.id, unitRole: '' } : m
                                    );
                                    setMembers(updatedMembers);
                                    e.target.value = '';
                                  }
                                }}
                                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              >
                                <option value="">Seleccionar miembro para añadir...</option>
                                {members.filter(m => {
                                  // Must not have a unit assigned
                                  if (m.unitId && m.unitId !== '') return false;
                                  // Must not have a directive position
                                  if (m.position && m.position !== '') return false;

                                  // Filter by age based on club type
                                  const age = calculateAge(m.dateOfBirth);
                                  const type = unit.clubType || 'conquistadores'; // Default if missing
                                  const safeGender = unit.gender || 'Mixed';

                                  // Check Gender
                                  if (safeGender === 'Male' && (m.gender !== 'Male' && m.gender !== 'M')) return false;
                                  if (safeGender === 'Female' && (m.gender !== 'Female' && m.gender !== 'F')) return false;

                                  if (type === 'aventureros') return age >= 4 && age <= 9;
                                  if (type === 'conquistadores') return age >= 10 && age <= 15;
                                  if (type === 'guias') return age >= 16;

                                  return true;
                                }).map((member) => (
                                  <option key={member.id} value={member.id}>
                                    {member.firstName} {member.lastName} ({calculateAge(member.dateOfBirth)} años)
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Unit Members List */}
                            {unitMembers.length > 0 && (
                              <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
                                {unitMembers.map((member) => (
                                  <div key={member.id} className="flex items-center gap-2 p-2 border rounded hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-700">
                                    <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-600 flex items-center justify-center flex-shrink-0">
                                      {member.photo ? (
                                        <img src={member.photo} alt={member.firstName} className="w-full h-full object-cover" />
                                      ) : (
                                        <Users className="w-4 h-4 text-gray-400 dark:text-gray-300" />
                                      )}
                                    </div>
                                    <span className="flex-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                                      {member.firstName} {member.lastName}
                                      {member.unitRole && (
                                        <span className={`ml-2 px-2 py-0.5 text-xs font-semibold rounded ${member.unitRole === 'Captain' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
                                          } `}>
                                          {member.unitRole === 'Captain'
                                            ? (unit.gender === 'Female' ? 'Capitana' : 'Capitán')
                                            : (unit.gender === 'Female' ? 'Secretaria' : 'Secretario')}
                                        </span>
                                      )}
                                    </span>
                                    <button
                                      onClick={() => {
                                        const updatedMembers = members.map(m =>
                                          m.id === member.id ? { ...m, unitId: '', unitRole: '' } : m
                                        );
                                        setMembers(updatedMembers);

                                        // If removing captain or secretary, update unit
                                        if (unit.captainId === member.id || unit.secretaryId === member.id) {
                                          const updatedUnits = units.map(u => {
                                            if (u.id === unit.id) {
                                              return {
                                                ...u,
                                                captainId: u.captainId === member.id ? '' : u.captainId,
                                                secretaryId: u.secretaryId === member.id ? '' : u.secretaryId
                                              };
                                            }
                                            return u;
                                          });
                                          setUnits(updatedUnits);
                                        }
                                      }}
                                      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}



            {/* Achievements Module */}
            {activeModule === 'achievements' && (
              <div>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        <Award className="w-7 h-7 text-yellow-600 dark:text-yellow-500" />
                        Logros y Honores
                      </h2>
                      <p className="text-gray-600 dark:text-gray-300 mt-1">Seguimiento de clases, barras y medallas para cada miembro</p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-yellow-600">{members.length}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Total Miembros</div>
                    </div>
                  </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/40 dark:to-purple-800/40 rounded-lg p-4 border-2 border-purple-200 dark:border-purple-800">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple-600 dark:text-purple-300 text-sm font-semibold">Guías Mayores</p>
                        <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                          {members.filter(m => m.achievements?.some(a => a.achievementId === 'master-guide')).length}
                        </p>
                      </div>
                      <Award className="w-10 h-10 text-purple-400" />
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/40 dark:to-yellow-800/40 rounded-lg p-4 border-2 border-yellow-200 dark:border-yellow-800">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-yellow-600 dark:text-yellow-300 text-sm font-semibold">Medallas de Oro</p>
                        <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">
                          {members.filter(m => m.achievements?.some(a => a.achievementId === 'medal-gold')).length}
                        </p>
                      </div>
                      <Award className="w-10 h-10 text-yellow-400" />
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-lg p-4 border-2 border-gray-300 dark:border-gray-600">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600 dark:text-gray-300 text-sm font-semibold">Medallas de Plata</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {members.filter(m => m.achievements?.some(a => a.achievementId === 'medal-silver')).length}
                        </p>
                      </div>
                      <Award className="w-10 h-10 text-gray-400" />
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/40 dark:to-indigo-800/40 rounded-lg p-4 border-2 border-indigo-200 dark:border-indigo-800">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-indigo-600 dark:text-indigo-300 text-sm font-semibold">Total Logros</p>
                        <p className="text-2xl font-bold text-indigo-900 dark:text-indigo-100">
                          {members.reduce((sum, m) => sum + (m.achievements?.length || 0), 0)}
                        </p>
                      </div>
                      <Award className="w-10 h-10 text-indigo-400" />
                    </div>
                  </div>
                </div>

                {/* Members Grid */}
                {members.length === 0 ? (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
                    <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No hay miembros registrados aún</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {sortedMembers.map((member) => {
                      const memberAchievements = member.achievements || [];

                      return (
                        <div key={member.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                          {/* Member Header */}
                          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 p-4 border-b border-yellow-100 dark:border-yellow-900/30">
                            <div className="flex items-center gap-3">
                              <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                                {member.photo ? (
                                  <img src={member.photo} alt={member.firstName} className="w-full h-full object-cover" />
                                ) : (
                                  <Users className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                                )}
                              </div>
                              <div className="flex-1">
                                <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                                  {member.firstName} {member.lastName}
                                </h3>
                                <div className="flex gap-2 text-sm text-gray-600 dark:text-gray-300">
                                  <span>Edad: {member.age}</span>
                                  <span>•</span>
                                  <span className="font-semibold text-yellow-700 dark:text-yellow-400">{memberAchievements.length} Logro{memberAchievements.length !== 1 ? 's' : ''}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Achievements Display */}
                          <div className="p-4">
                            {memberAchievements.length === 0 ? (
                              <div className="text-center py-8 text-gray-400">
                                <Award className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                <p className="text-sm">Sin logros aún</p>
                              </div>
                            ) : (
                              <div className="space-y-4">
                                {/* Classes */}
                                {(() => {
                                  const classes = memberAchievements.filter(a => {
                                    const achievement = availableAchievements.find(aa => aa.id === a.achievementId);
                                    return achievement && (achievement.category === 'class' || achievement.category === 'class-advanced' || achievement.category === 'master');
                                  });

                                  if (classes.length === 0) return null;

                                  return (
                                    <div>
                                      <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Clases:</h4>
                                      <div className="flex flex-wrap gap-2">
                                        {classes.map((a) => {
                                          const achievement = availableAchievements.find(aa => aa.id === a.achievementId);
                                          if (!achievement) return null;
                                          return (
                                            <div key={a.achievementId} className="relative group">
                                              <div className={`${achievement.color} text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1`}>
                                                {achievement.includesBar && <span className="text-yellow-300">⭐</span>}
                                                {achievement.nameES}
                                              </div>
                                              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                                                {new Date(a.dateObtained).toLocaleDateString()}
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  );
                                })()}

                                {/* Medals */}
                                {(() => {
                                  const medals = memberAchievements.filter(a => {
                                    const achievement = availableAchievements.find(aa => aa.id === a.achievementId);
                                    return achievement && achievement.category === 'medal';
                                  });

                                  if (medals.length === 0) return null;

                                  return (
                                    <div>
                                      <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Medallas:</h4>
                                      <div className="flex flex-wrap gap-2">
                                        {medals.map((a) => {
                                          const achievement = availableAchievements.find(aa => aa.id === a.achievementId);
                                          if (!achievement) return null;
                                          return (
                                            <div key={a.achievementId} className="relative group">
                                              <div className={`${achievement.color} px-3 py-1 rounded-full text-xs font-semibold border-2`}>
                                                🏅 {achievement.nameES}
                                              </div>
                                              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                                                {new Date(a.dateObtained).toLocaleDateString()}
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  );
                                })()}

                                {/* Special Bars */}
                                {(() => {
                                  const bars = memberAchievements.filter(a => {
                                    const achievement = availableAchievements.find(aa => aa.id === a.achievementId);
                                    return achievement && achievement.category === 'bar';
                                  });

                                  if (bars.length === 0) return null;

                                  return (
                                    <div>
                                      <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Barras Especiales:</h4>
                                      <div className="flex flex-wrap gap-2">
                                        {bars.map((a) => {
                                          const achievement = availableAchievements.find(aa => aa.id === a.achievementId);
                                          if (!achievement) return null;
                                          return (
                                            <div key={a.achievementId} className="relative group">
                                              <div className={`${achievement.color} text-white px-3 py-1 rounded text-xs font-semibold`}>
                                                {achievement.nameES}
                                              </div>
                                              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                                                {new Date(a.dateObtained).toLocaleDateString()}
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  );
                                })()}
                              </div>
                            )}

                            {/* Add/Remove Achievements */}
                            <div className="mt-4 pt-4 border-t dark:border-gray-700">
                              <details className="group">
                                <summary className="cursor-pointer list-none flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded hover:bg-gray-100 dark:hover:bg-gray-600">
                                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">Gestionar Logros</span>
                                  <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400 group-open:rotate-180 transition-transform" />
                                </summary>

                                <div className="mt-3 space-y-3 max-h-96 overflow-y-auto">
                                  {/* Classes Section */}
                                  <div>
                                    <h5 className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-2 uppercase">Clases:</h5>
                                    <div className="grid grid-cols-2 gap-2">
                                      {availableAchievements
                                        .filter(a => a.category === 'class' || a.category === 'class-advanced' || a.category === 'master')
                                        .map((achievement) => {
                                          const hasAchievement = memberAchievements.some(ma => ma.achievementId === achievement.id);
                                          return (
                                            <button
                                              key={achievement.id}
                                              onClick={() => {
                                                const updatedMembers = members.map(m => {
                                                  if (m.id === member.id) {
                                                    if (hasAchievement) {
                                                      return {
                                                        ...m,
                                                        achievements: (m.achievements || []).filter(a => a.achievementId !== achievement.id)
                                                      };
                                                    } else {
                                                      return {
                                                        ...m,
                                                        achievements: [
                                                          ...(m.achievements || []),
                                                          {
                                                            achievementId: achievement.id,
                                                            dateObtained: new Date().toISOString()
                                                          }
                                                        ]
                                                      };
                                                    }
                                                  }
                                                  return m;
                                                });
                                                setMembers(updatedMembers);
                                              }}
                                              className={`text-xs p-2 rounded border-2 transition-all ${hasAchievement
                                                ? `${achievement.color} text-white border-transparent`
                                                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-gray-400'
                                                } `}
                                            >
                                              {hasAchievement ? '✓ ' : ''}{achievement.nameES}
                                            </button>
                                          );
                                        })}
                                    </div>
                                  </div>

                                  {/* Medals Section */}
                                  <div>
                                    <h5 className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-2 uppercase">Medallas:</h5>
                                    <div className="grid grid-cols-2 gap-2">
                                      {availableAchievements
                                        .filter(a => a.category === 'medal')
                                        .map((achievement) => {
                                          const hasAchievement = memberAchievements.some(ma => ma.achievementId === achievement.id);
                                          return (
                                            <button
                                              key={achievement.id}
                                              onClick={() => {
                                                const updatedMembers = members.map(m => {
                                                  if (m.id === member.id) {
                                                    if (hasAchievement) {
                                                      return {
                                                        ...m,
                                                        achievements: (m.achievements || []).filter(a => a.achievementId !== achievement.id)
                                                      };
                                                    } else {
                                                      return {
                                                        ...m,
                                                        achievements: [
                                                          ...(m.achievements || []),
                                                          {
                                                            achievementId: achievement.id,
                                                            dateObtained: new Date().toISOString()
                                                          }
                                                        ]
                                                      };
                                                    }
                                                  }
                                                  return m;
                                                });
                                                setMembers(updatedMembers);
                                              }}
                                              className={`text-xs p-2 rounded border-2 transition-all ${hasAchievement
                                                ? `${achievement.color} border-transparent`
                                                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-gray-400'
                                                } `}
                                            >
                                              {hasAchievement ? '✓ ' : ''}🏅 {achievement.nameES}
                                            </button>
                                          );
                                        })}
                                    </div>
                                  </div>

                                  {/* Special Bars Section */}
                                  <div>
                                    <h5 className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-2 uppercase">Barras Especiales:</h5>
                                    <div className="grid grid-cols-2 gap-2">
                                      {availableAchievements
                                        .filter(a => a.category === 'bar')
                                        .map((achievement) => {
                                          const hasAchievement = memberAchievements.some(ma => ma.achievementId === achievement.id);
                                          return (
                                            <button
                                              key={achievement.id}
                                              onClick={() => {
                                                const updatedMembers = members.map(m => {
                                                  if (m.id === member.id) {
                                                    if (hasAchievement) {
                                                      return {
                                                        ...m,
                                                        achievements: (m.achievements || []).filter(a => a.achievementId !== achievement.id)
                                                      };
                                                    } else {
                                                      return {
                                                        ...m,
                                                        achievements: [
                                                          ...(m.achievements || []),
                                                          {
                                                            achievementId: achievement.id,
                                                            dateObtained: new Date().toISOString()
                                                          }
                                                        ]
                                                      };
                                                    }
                                                  }
                                                  return m;
                                                });
                                                setMembers(updatedMembers);
                                              }}
                                              className={`text-xs p-2 rounded border-2 transition-all ${hasAchievement
                                                ? `${achievement.color} text-white border-transparent`
                                                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-gray-400'
                                                } `}
                                            >
                                              {hasAchievement ? '✓ ' : ''}{achievement.nameES}
                                            </button>
                                          );
                                        })}
                                    </div>
                                  </div>
                                </div>
                              </details>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )
            }

            {/* Qualifications Module */}
            {
              activeModule === 'qualifications' && (
                <div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                          <BookOpen className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
                          Sistema de Calificaciones
                        </h2>
                        <p className="text-gray-600 dark:text-gray-300 mt-1">Gestión de puntajes para clases Progresivas y Avanzadas</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <label className="text-sm text-indigo-600 dark:text-indigo-400 font-semibold block mb-1">Año</label>
                          <select
                            value={selectedQualificationYear}
                            onChange={(e) => setSelectedQualificationYear(parseInt(e.target.value))}
                            className="border border-indigo-200 dark:border-indigo-700 rounded-lg px-3 py-1 font-bold text-indigo-900 dark:text-indigo-100 bg-indigo-50 dark:bg-indigo-900/30"
                          >
                            <option value={2024}>2024</option>
                            <option value={2025}>2025</option>
                            <option value={2026}>2026</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Statistics Cards */}
                  {(() => {
                    const regularMembers = members.filter(m => !m.position || m.position === '');
                    let topClass = { name: 'N/A', score: 0, member: 'N/A' };
                    let topUnit = { name: 'N/A', avg: 0 };

                    // Calculate Top Performer
                    let maxScore = -1;
                    regularMembers.forEach(m => {
                      const qual = qualifications.find(q =>
                        q.memberId === m.id && q.year === selectedQualificationYear
                      ) || { scores: { progWork: 0, progExam: 0, progCamp: 0, advWork: 0, advCamp: 0 }, isAdvanced: false };

                      const progTotal = (qual.scores.progWork || 0) + (qual.scores.progExam || 0) + (qual.scores.progCamp || 0);
                      const advTotal = (qual.scores.advWork || 0) + (qual.scores.advCamp || 0);
                      const finalAvg = qual.isAdvanced ? (progTotal + advTotal) / 2 : progTotal;

                      if (finalAvg > maxScore) {
                        maxScore = finalAvg;
                        topClass = { name: m.pathfinderClass || 'Sin Clase', score: finalAvg, member: `${m.firstName} ${m.lastName}` };
                      }
                    });

                    return (
                      <div className="space-y-6 mb-6">
                        {/* Top Individual */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/40 dark:to-indigo-800/40 rounded-lg p-4 border border-indigo-200 dark:border-indigo-800 shadow-sm">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="p-2 bg-white dark:bg-indigo-900/50 rounded-full text-indigo-600 dark:text-indigo-300 shadow-sm"><Trophy className="w-5 h-5" /></div>
                              <h3 className="font-bold text-indigo-900 dark:text-indigo-100">Mejor Rendimiento (Individual)</h3>
                            </div>
                            <div className="text-2xl font-bold text-indigo-800 dark:text-indigo-200">{topClass.member}</div>
                            <div className="text-sm text-indigo-600 dark:text-indigo-300">
                              Promedio: <span className="font-bold">{topClass.score.toFixed(1)}</span> • Clase: {topClass.name}
                            </div>
                          </div>

                          <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/40 dark:to-purple-800/40 rounded-lg p-4 border border-purple-200 dark:border-purple-800 shadow-sm relative overflow-hidden">
                            <div className="absolute right-0 top-0 w-24 h-24 bg-purple-200 dark:bg-purple-800 rounded-full blur-2xl opacity-50 -mr-8 -mt-8"></div>
                            <div className="flex items-center gap-3 mb-2 relative z-10">
                              <div className="p-2 bg-white dark:bg-purple-900/50 rounded-full text-purple-600 dark:text-purple-300 shadow-sm"><Users className="w-5 h-5" /></div>
                              <h3 className="font-bold text-purple-900 dark:text-purple-100">Total Evaluados</h3>
                            </div>
                            <div className="text-3xl font-bold text-purple-800 dark:text-purple-200 relative z-10">{regularMembers.length}</div>
                            <div className="text-sm text-purple-600 dark:text-purple-300 relative z-10">Miembros Regulares</div>
                          </div>
                        </div>

                        {/* Best By Class */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-4">
                          <h4 className="font-bold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
                            <Award className="w-5 h-5 text-amber-500" />
                            Mejores por Clase
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {pathfinderClasses.map(cls => {
                              // Find top score for this class
                              let bestInClass = { member: 'N/A', score: -1 };
                              const classMembers = regularMembers.filter(m => m.pathfinderClass === cls.value);

                              if (classMembers.length === 0) return null;

                              classMembers.forEach(m => {
                                const qual = qualifications.find(q => q.memberId === m.id && q.year === selectedQualificationYear)
                                  || { scores: { progWork: 0, progExam: 0, progCamp: 0, advWork: 0, advCamp: 0 }, isAdvanced: false };

                                const progTotal = (qual.scores.progWork || 0) + (qual.scores.progExam || 0) + (qual.scores.progCamp || 0);
                                const advTotal = (qual.scores.advWork || 0) + (qual.scores.advCamp || 0);
                                const avg = qual.isAdvanced ? (progTotal + advTotal) / 2 : progTotal;

                                if (avg > bestInClass.score) {
                                  bestInClass = { member: `${m.firstName} ${m.lastName}`, score: avg };
                                }
                              });

                              if (bestInClass.score === -1) return null;

                              return (
                                <div key={cls.value} className={`p-3 rounded border ${cls.color.replace('text-', 'border-').split(' ')[0]} bg-opacity-50 flex justify-between items-center`}>
                                  <div>
                                    <div className="text-xs font-bold uppercase opacity-70">{cls.label}</div>
                                    <div className="font-semibold">{bestInClass.member}</div>
                                  </div>
                                  <div className="text-xl font-bold">{bestInClass.score.toFixed(0)}</div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Best By Unit */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-4">
                          <h4 className="font-bold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
                            <Grid className="w-5 h-5 text-teal-600" />
                            Mejores por Unidad (Promedio)
                          </h4>
                          <div className="space-y-2">
                            {units.map(unit => {
                              const unitMembers = regularMembers.filter(m => m.unitId === unit.id);
                              if (unitMembers.length === 0) return null;

                              let totalUnitScore = 0;
                              let count = 0;

                              unitMembers.forEach(m => {
                                const qual = qualifications.find(q => q.memberId === m.id && q.year === selectedQualificationYear)
                                  || { scores: { progWork: 0, progExam: 0, progCamp: 0, advWork: 0, advCamp: 0 }, isAdvanced: false };

                                const progTotal = (qual.scores.progWork || 0) + (qual.scores.progExam || 0) + (qual.scores.progCamp || 0);
                                const advTotal = (qual.scores.advWork || 0) + (qual.scores.advCamp || 0);
                                const avg = qual.isAdvanced ? (progTotal + advTotal) / 2 : progTotal;
                                totalUnitScore += avg;
                                count++;
                              });

                              const unitAvg = count > 0 ? totalUnitScore / count : 0;

                              return { unit, avg: unitAvg, count };
                            })
                              .filter(Boolean)
                              .sort((a, b) => b.avg - a.avg)
                              .map((item, index) => (
                                <div key={item.unit.id} className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded transition-colors">
                                  <div className="flex items-center gap-3">
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${index === 0 ? 'bg-yellow-400 text-yellow-900' : index === 1 ? 'bg-gray-300 text-gray-800' : 'bg-orange-200 text-orange-800'}`}>
                                      {index + 1}
                                    </div>
                                    <span className="font-semibold text-gray-800 dark:text-white">{item.unit.name}</span>
                                    <span className="text-xs text-gray-500">({item.count} miembros)</span>
                                  </div>
                                  <div className="font-mono font-bold text-teal-600">{item.avg.toFixed(1)}</div>
                                </div>
                              ))}
                          </div>
                        </div>

                      </div>
                    );
                  })()}

                  <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-gray-800 text-white">
                            <th rowSpan="2" className="px-4 py-3 text-left">Miembro</th>
                            <th rowSpan="2" className="px-4 py-3 text-left">Clase</th>
                            <th colSpan="3" className="px-4 py-2 text-center bg-gray-700 border-l border-gray-600">Clase Progresiva</th>
                            <th colSpan="3" className="px-4 py-2 text-center bg-gray-700 border-l border-gray-600">Clase Avanzada</th>
                            <th rowSpan="2" className="px-4 py-3 text-center bg-indigo-900 w-24">Promedio<br />Final</th>
                          </tr>
                          <tr className="bg-gray-700 text-gray-200 text-xs">
                            <th className="px-2 py-2 text-center w-20 border-l border-gray-600">Cuadernillo<br />(25%)</th>
                            <th className="px-2 py-2 text-center w-20">Examen<br />(25%)</th>
                            <th className="px-2 py-2 text-center w-20">Campa.<br />(50%)</th>

                            <th className="px-2 py-2 text-center w-16 border-l border-gray-600">¿Cursa?</th>
                            <th className="px-2 py-2 text-center w-20">Cuadernillo<br />(50%)</th>
                            <th className="px-2 py-2 text-center w-20">Campa.<br />(50%)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                          {(() => {
                            const regularMembers = members.filter(m => !m.position || m.position === '');

                            return regularMembers.map((member) => {
                              const qual = qualifications.find(q =>
                                q.memberId === member.id && q.year === selectedQualificationYear
                              ) || {
                                memberId: member.id,
                                year: selectedQualificationYear,
                                isAdvanced: false,
                                scores: { progWork: 0, progExam: 0, progCamp: 0, advWork: 0, advCamp: 0 }
                              };

                              const updateScore = (field, value) => {
                                const newVal = Math.max(0, parseInt(value) || 0); // Ensure positive integer
                                // Cap values based on rules could be done here, but standard input max is user friendly

                                setQualifications(prev => {
                                  const existingIndex = prev.findIndex(q => q.memberId === member.id && q.year === selectedQualificationYear);
                                  if (existingIndex >= 0) {
                                    const updated = [...prev];
                                    updated[existingIndex] = {
                                      ...updated[existingIndex],
                                      scores: { ...updated[existingIndex].scores, [field]: newVal }
                                    };
                                    return updated;
                                  } else {
                                    return [...prev, {
                                      ...qual,
                                      scores: { ...qual.scores, [field]: newVal }
                                    }];
                                  }
                                });
                              };

                              const toggleAdvanced = (e) => {
                                const checked = e.target.checked;
                                setQualifications(prev => {
                                  const existingIndex = prev.findIndex(q => q.memberId === member.id && q.year === selectedQualificationYear);
                                  if (existingIndex >= 0) {
                                    const updated = [...prev];
                                    updated[existingIndex] = { ...updated[existingIndex], isAdvanced: checked };
                                    return updated;
                                  } else {
                                    return [...prev, { ...qual, isAdvanced: checked }];
                                  }
                                });
                              };

                              const progTotal = (qual.scores.progWork || 0) + (qual.scores.progExam || 0) + (qual.scores.progCamp || 0);
                              const advTotal = (qual.scores.advWork || 0) + (qual.scores.advCamp || 0);
                              const finalAvg = qual.isAdvanced ? ((progTotal + advTotal) / 2) : progTotal;

                              const inputBaseClass = "w-full text-center border-gray-300 dark:border-gray-600 rounded text-sm focus:ring-indigo-500 focus:border-indigo-500 p-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-white";

                              return (
                                <tr key={member.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 group bg-white dark:bg-gray-800">
                                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white border-r border-gray-100 dark:border-gray-700">
                                    <div className="flex items-center gap-2">
                                      {member.photo ? (
                                        <img src={member.photo} className="w-8 h-8 rounded-full object-cover" alt="" />
                                      ) : (
                                        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-xs font-bold text-gray-500 dark:text-gray-400">
                                          {member.firstName[0]}
                                        </div>
                                      )}
                                      <div>
                                        <div className="font-bold">{member.firstName} {member.lastName}</div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">{member.unitId ? units.find(u => u.id === member.unitId)?.name : 'Sin Unidad'}</div>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300 border-r border-gray-100 dark:border-gray-700">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${pathfinderClasses.find(c => c.value === member.pathfinderClass)?.color || 'bg-gray-100'
                                      }`}>
                                      {pathfinderClasses.find(c => c.value === member.pathfinderClass)?.label || 'Sin Clase'}
                                    </span>
                                  </td>

                                  {/* Progresiva Inputs */}
                                  <td className="px-2 py-3 text-center bg-blue-50/30 dark:bg-blue-900/10">
                                    <input type="number" min="0" max="25" value={qual.scores.progWork || 0} onChange={(e) => updateScore('progWork', e.target.value)} className={inputBaseClass} placeholder="0-25" />
                                  </td>
                                  <td className="px-2 py-3 text-center bg-blue-50/30 dark:bg-blue-900/10">
                                    <input type="number" min="0" max="25" value={qual.scores.progExam || 0} onChange={(e) => updateScore('progExam', e.target.value)} className={inputBaseClass} placeholder="0-25" />
                                  </td>
                                  <td className="px-2 py-3 text-center border-r border-gray-100 dark:border-gray-700 bg-blue-50/30 dark:bg-blue-900/10">
                                    <input type="number" min="0" max="50" value={qual.scores.progCamp || 0} onChange={(e) => updateScore('progCamp', e.target.value)} className={inputBaseClass} placeholder="0-50" />
                                  </td>

                                  {/* Avanzada Inputs & Toggle */}
                                  <td className="px-2 py-3 text-center bg-purple-50/30 dark:bg-purple-900/10">
                                    <input type="checkbox" checked={qual.isAdvanced || false} onChange={toggleAdvanced} className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500 cursor-pointer" />
                                  </td>
                                  <td className="px-2 py-3 text-center bg-purple-50/30 dark:bg-purple-900/10">
                                    <input type="number" min="0" max="50" disabled={!qual.isAdvanced} value={qual.scores.advWork || 0} onChange={(e) => updateScore('advWork', e.target.value)} className={`${inputBaseClass} ${!qual.isAdvanced ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500' : ''}`} placeholder="0-50" />
                                  </td>
                                  <td className="px-2 py-3 text-center border-r border-gray-100 dark:border-gray-700 bg-purple-50/30 dark:bg-purple-900/10">
                                    <input type="number" min="0" max="50" disabled={!qual.isAdvanced} value={qual.scores.advCamp || 0} onChange={(e) => updateScore('advCamp', e.target.value)} className={`${inputBaseClass} ${!qual.isAdvanced ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500' : ''}`} placeholder="0-50" />
                                  </td>

                                  {/* Final Average */}
                                  <td className="px-4 py-3 text-center bg-gray-50 dark:bg-gray-800 dark:group-hover:bg-gray-700 transition-colors">
                                    <div className="relative pt-1">
                                      <div className={`text-lg font-bold ${finalAvg >= 70 ? 'text-green-600' : finalAvg >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                                        {finalAvg.toFixed(1)}
                                      </div>
                                      <div className="overflow-hidden h-1.5 mb-1 text-xs flex rounded bg-gray-200 dark:bg-gray-700">
                                        <div style={{ width: `${finalAvg}%` }} className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${finalAvg >= 70 ? 'bg-green-500' : finalAvg >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              );
                            });
                          })()}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )
            }
            {/* Medical Records Module */}
            {
              activeModule === 'medical' && (
                <div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                          <Heart className="w-7 h-7 text-red-600 dark:text-red-400" />
                          Registros Médicos
                        </h2>
                        <p className="text-gray-600 dark:text-gray-300 mt-1">Información de salud y contactos de emergencia</p>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-red-600">{members.length}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Total Miembros</div>
                      </div>
                    </div>
                  </div>

                  {members.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
                      <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 dark:text-gray-400 text-lg">No hay miembros registrados aún</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {sortedMembers.map((member) => (
                        <div key={member.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                          {/* Member Header */}
                          <div className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 p-4 border-b border-red-100 dark:border-red-900/30">
                            <div className="flex items-center gap-3">
                              <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                                {member.photo ? (
                                  <img src={member.photo} alt={member.firstName} className="w-full h-full object-cover" />
                                ) : (
                                  <Users className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                                )}
                              </div>
                              <div>
                                <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                                  {member.firstName} {member.lastName}
                                </h3>
                                <div className="flex gap-2 text-sm text-gray-600 dark:text-gray-300">
                                  <span>Edad: {member.age}</span>
                                  <span>•</span>
                                  <span className="font-semibold text-red-700 dark:text-red-400">Sangre: {member.bloodType}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Medical Information */}
                          <div className="p-4 space-y-4">
                            {/* Allergies */}
                            {member.allergies && (
                              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                                <div className="flex items-start gap-2">
                                  <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                                  <div>
                                    <div className="font-semibold text-yellow-900 dark:text-yellow-100 text-sm">Alergias</div>
                                    <div className="text-sm text-yellow-800 dark:text-yellow-200 mt-1">{member.allergies}</div>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Medical Condition */}
                            {member.medicalCondition && (
                              <div>
                                <div className="font-semibold text-gray-700 dark:text-gray-300 text-sm mb-1">Condición Médica</div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">{member.medicalCondition}</div>
                              </div>
                            )}

                            {/* Condition Medications */}
                            {member.conditionMedications && (
                              <div>
                                <div className="font-semibold text-gray-700 dark:text-gray-300 text-sm mb-1">Medicamentos para Condición</div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">{member.conditionMedications}</div>
                              </div>
                            )}

                            {/* Continuous Medications */}
                            {member.continuousMedications && (
                              <div>
                                <div className="font-semibold text-gray-700 dark:text-gray-300 text-sm mb-1">Medicamentos Continuos</div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">{member.continuousMedications}</div>
                              </div>
                            )}

                            {/* Emergency Contact */}
                            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                              <div className="font-semibold text-red-900 dark:text-red-100 text-sm mb-2 flex items-center gap-2">
                                <Phone className="w-4 h-4" />
                                Contacto de Emergencia
                              </div>
                              <div className="space-y-1 text-sm">
                                <div className="text-gray-700 dark:text-gray-300">
                                  <span className="font-medium">Nombre:</span> {member.emergencyContactName || '-'}
                                </div>
                                <div className="text-gray-700 dark:text-gray-300">
                                  <span className="font-medium">Teléfono:</span> {formatPhone(member.emergencyContactPhone) || '-'}
                                </div>
                              </div>
                            </div>

                            {/* Doctor Information */}
                            {(member.doctorName || member.doctorPhone) && (
                              <div>
                                <div className="font-semibold text-gray-700 dark:text-gray-300 text-sm mb-2">Doctor/Pediatra</div>
                                <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                                  {member.doctorName && <div>Nombre: {member.doctorName}</div>}
                                  {member.doctorPhone && <div>Teléfono: {formatPhone(member.doctorPhone)}</div>}
                                </div>
                              </div>
                            )}

                            {/* Insurance Information */}
                            {(member.insuranceProvider || member.insuranceNumber) && (
                              <div>
                                <div className="font-semibold text-gray-700 dark:text-gray-300 text-sm mb-2">Seguro Médico</div>
                                <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                                  {member.insuranceProvider && <div>Proveedor: {member.insuranceProvider}</div>}
                                  {member.insuranceNumber && <div>Número: {member.insuranceNumber}</div>}
                                </div>
                              </div>
                            )}

                            {/* Special Notes */}
                            {member.specialNotes && (
                              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                <div className="font-semibold text-blue-900 dark:text-blue-100 text-sm mb-1">Notas Médicas Especiales</div>
                                <div className="text-sm text-blue-800 dark:text-blue-200">{member.specialNotes}</div>
                              </div>
                            )}

                            {/* No Medical Info */}
                            {!member.allergies && !member.medicalCondition && !member.conditionMedications &&
                              !member.continuousMedications && !member.doctorName && !member.insuranceProvider &&
                              !member.specialNotes && (
                                <div className="text-center py-6 text-gray-400 text-sm">
                                  <Heart className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                  <p>No hay información médica registrada</p>
                                </div>
                              )}
                          </div>

                          {/* Actions */}
                          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-100 dark:border-gray-700 grid grid-cols-2 gap-3">
                            <button
                              onClick={() => printMedicalRecord(member)}
                              className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
                            >
                              <Printer className="w-4 h-4" />
                              Imprimir Ficha
                            </button>
                            <button
                              onClick={() => handleEdit(member)}
                              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                              Editar
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            }
            {/* Classes Module */}
            {
              activeModule === 'classes' && (
                <div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                          <BookOpen className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
                          Clases de Conquistadores
                        </h2>
                        <p className="text-gray-600 dark:text-gray-300 mt-1">Asignar clases a cada miembro</p>
                      </div>
                    </div>
                  </div>

                  {/* Members by Class */}
                  <div className="space-y-6">
                    {pathfinderClasses.map((pClass) => {
                      const membersInClass = members.filter(m =>
                        m.pathfinderClass === pClass.value
                      );

                      return (
                        <div key={pClass.value} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                          <div className={`p-4 border-b-2 ${pClass.color} flex items-center justify-between`}>
                            <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                              {pClass.value === 'Master Guide' && <span className="text-yellow-600">⭐</span>}
                              {pClass.value === 'Master Guide Advanced' && <span className="text-orange-600">⭐⭐</span>}
                              {pClass.label}
                            </h3>
                            <span className="text-2xl font-bold">{membersInClass.length}</span>
                          </div>

                          {membersInClass.length > 0 ? (
                            <div className="p-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {membersInClass.map((member) => (
                                  <div key={member.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-700">
                                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-600 flex items-center justify-center flex-shrink-0">
                                      {member.photo ? (
                                        <img src={member.photo} alt={member.firstName} className="w-full h-full object-cover" />
                                      ) : (
                                        <Users className="w-6 h-6 text-gray-400 dark:text-gray-300" />
                                      )}
                                    </div>
                                    <div className="flex-1">
                                      <div className="font-medium text-gray-900 dark:text-white">{member.firstName} {member.lastName}</div>
                                      <div className="text-sm text-gray-500 dark:text-gray-400">Edad: {member.age}</div>
                                    </div>

                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="p-8 text-center text-gray-400 dark:text-gray-500">
                              <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-50" />
                              <p>No hay miembros en esta clase</p>
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {/* Unassigned Members */}
                    {(() => {
                      const unassignedMembers = members.filter(m =>
                        (!m.pathfinderClass || m.pathfinderClass === '') && (!m.position || m.position === '')
                      );

                      if (unassignedMembers.length === 0) return null;

                      return (
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                          <div className="p-4 bg-gray-100 dark:bg-gray-700 border-b-2 border-gray-300 dark:border-gray-600 flex items-center justify-between">
                            <h3 className="text-xl font-bold text-gray-700 dark:text-gray-200">Miembros Sin Asignar</h3>
                            <span className="text-2xl font-bold text-gray-700 dark:text-gray-200">{unassignedMembers.length}</span>
                          </div>

                          <div className="p-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {unassignedMembers.map((member) => (
                                <div key={member.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-700">
                                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-600 flex items-center justify-center flex-shrink-0">
                                    {member.photo ? (
                                      <img src={member.photo} alt={member.firstName} className="w-full h-full object-cover" />
                                    ) : (
                                      <Users className="w-6 h-6 text-gray-400 dark:text-gray-300" />
                                    )}
                                  </div>
                                  <div className="flex-1">
                                    <div className="font-medium text-gray-900 dark:text-white">{member.firstName} {member.lastName}</div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">Edad: {member.age}</div>
                                  </div>

                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )
            }
            {/* Points System Module */}
            {
              activeModule === 'points' && (
                <div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                          <Award className="w-7 h-7 text-yellow-600 dark:text-yellow-400" />
                          Sistema de Puntos
                        </h2>
                        <p className="text-gray-600 dark:text-gray-300 mt-1">Rastrea los puntos de los miembros para cada sábado del mes</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-sm text-gray-500 dark:text-gray-400">Seleccionar Mes</div>
                          <input
                            type="month"
                            value={selectedPointsMonth}
                            onChange={(e) => {
                              setSelectedPointsMonth(e.target.value);
                              setSelectedSaturday('');
                            }}
                            className="mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Points Legend */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
                    <h3 className="text-base font-bold text-gray-800 dark:text-white mb-3">Categorías de Puntos</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 2xl:grid-cols-8 gap-2">
                      <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
                        <div className="text-lg font-bold text-blue-600">+5</div>
                        <div>
                          <div className="text-sm font-semibold text-blue-900 dark:text-blue-100">Punt.</div>
                          <div className="text-xs text-blue-700 dark:text-blue-200">Antes 4:30</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-2 bg-purple-50 dark:bg-purple-900/20 rounded border border-purple-200 dark:border-purple-800">
                        <div className="text-lg font-bold text-purple-600">+5</div>
                        <div>
                          <div className="text-sm font-semibold text-purple-900 dark:text-purple-100">Biblia</div>
                          <div className="text-xs text-purple-700 dark:text-purple-200">Trae Biblia</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-2 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-800">
                        <div className="text-lg font-bold text-green-600">+5</div>
                        <div>
                          <div className="text-sm font-semibold text-green-900 dark:text-green-100">Uniforme</div>
                          <div className="text-xs text-green-700 dark:text-green-200">Correcto</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-2 bg-indigo-50 dark:bg-indigo-900/20 rounded border border-indigo-200 dark:border-indigo-800">
                        <div className="text-lg font-bold text-indigo-600">+5</div>
                        <div>
                          <div className="text-sm font-semibold text-indigo-900 dark:text-indigo-100">Disc.</div>
                          <div className="text-xs text-indigo-700 dark:text-indigo-200">Conducta</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-2 bg-orange-50 dark:bg-orange-900/20 rounded border border-orange-200 dark:border-orange-800">
                        <div className="text-lg font-bold text-orange-600">+5</div>
                        <div>
                          <div className="text-sm font-semibold text-orange-900 dark:text-orange-100">Tarea</div>
                          <div className="text-xs text-orange-700 dark:text-orange-200">Deberes</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-2 bg-pink-50 dark:bg-pink-900/20 rounded border border-pink-200 dark:border-pink-800">
                        <div className="text-lg font-bold text-pink-600">+10</div>
                        <div>
                          <div className="text-sm font-semibold text-pink-900 dark:text-pink-100">Culto Vie</div>
                          <div className="text-xs text-pink-700 dark:text-pink-200">Asistencia</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-2 bg-rose-50 dark:bg-rose-900/20 rounded border border-rose-200 dark:border-rose-800">
                        <div className="text-lg font-bold text-rose-600">+10</div>
                        <div>
                          <div className="text-sm font-semibold text-rose-900 dark:text-rose-100">Culto Sáb</div>
                          <div className="text-xs text-rose-700 dark:text-rose-200">Asistencia</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-2 bg-cyan-50 dark:bg-cyan-900/20 rounded border border-cyan-200 dark:border-cyan-800">
                        <div className="text-lg font-bold text-cyan-600">+5</div>
                        <div>
                          <div className="text-sm font-semibold text-cyan-900 dark:text-cyan-100">Esc. Sabática</div>
                          <div className="text-xs text-cyan-700 dark:text-cyan-200">Clase</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Saturday Selection */}
                  {(() => {
                    const [year, month] = selectedPointsMonth.split('-');
                    const firstDay = new Date(parseInt(year), parseInt(month) - 1, 1);
                    const lastDay = new Date(parseInt(year), parseInt(month), 0);
                    const saturdays = [];

                    for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
                      if (d.getDay() === 6) {
                        saturdays.push(new Date(d));
                      }
                    }

                    // Filter members - exclude directive members
                    const regularMembers = members.filter(member =>
                      !member.position || member.position === ''
                    );

                    if (regularMembers.length === 0) {
                      return (
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
                          <Award className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                          <p className="text-gray-500 dark:text-gray-400 text-lg">No hay miembros regulares para rastrear</p>
                          <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">Solo los miembros regulares (no directiva) aparecen en el sistema de puntos</p>
                        </div>
                      );
                    }

                    if (saturdays.length === 0) {
                      return (
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
                          <Calendar className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                          <p className="text-gray-500 dark:text-gray-400 text-lg">No hay sábados en el mes seleccionado</p>
                          <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">Seleccione un mes diferente</p>
                        </div>
                      );
                    }

                    return (
                      <>
                        {/* Saturday Selector */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
                          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Seleccionar Sábado para Editar</h3>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {saturdays.map((saturday, idx) => {
                              const dateKey = saturday.toISOString().split('T')[0];
                              const isLocked = lockedSaturdays.includes(dateKey);
                              const isSelected = selectedSaturday === dateKey;

                              return (
                                <button
                                  key={idx}
                                  onClick={() => !isLocked && setSelectedSaturday(dateKey)}
                                  disabled={isLocked}
                                  className={`p-4 rounded-lg border-2 transition-all ${isSelected
                                    ? 'border-yellow-600 bg-yellow-50 dark:bg-yellow-900/30 shadow-md'
                                    : isLocked
                                      ? 'border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 cursor-not-allowed opacity-60'
                                      : 'border-gray-300 dark:border-gray-600 hover:border-yellow-400 dark:hover:border-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20'
                                    } `}
                                >
                                  <div className="text-center">
                                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Sábado</div>
                                    <div className="text-2xl font-bold text-gray-800 dark:text-white">{saturday.getDate()}</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                      {saturday.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })}
                                    </div>
                                    {isLocked && (
                                      <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded text-xs font-semibold">
                                        <span>✓</span> Guardado
                                      </div>
                                    )}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Points Entry Table - Only if Saturday is selected */}
                        {selectedSaturday ? (
                          <>
                            {(() => {
                              const isLocked = lockedSaturdays.includes(selectedSaturday);
                              const selectedDate = new Date(selectedSaturday);

                              return (
                                <>
                                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-4">
                                    <div className="flex items-center justify-between mb-4">
                                      <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                                        Puntos del Sábado {selectedDate.getDate()} - {selectedDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                                      </h3>
                                      {isLocked ? (
                                        <div className="flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg font-semibold">
                                          <span className="text-xl">✓</span>
                                          <span>Guardado y Bloqueado</span>
                                        </div>
                                      ) : (
                                        <button
                                          onClick={() => {
                                            if (window.confirm(`¿Guardar y bloquear puntos del Sábado ${selectedDate.getDate()}? No podrás editarlos después de guardar.`)) {
                                              setLockedSaturdays(prev => [...prev, selectedSaturday]);
                                              setSelectedSaturday('');
                                            }
                                          }}
                                          className="flex items-center gap-2 px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-semibold transition-colors"
                                        >
                                          <Save className="w-5 h-5" />
                                          Guardar y Bloquear
                                        </button>
                                      )}
                                    </div>

                                    <div className="overflow-x-auto">
                                      {(() => {
                                        // 1. Sort Units
                                        const clubTypeOrder = { 'guias': 1, 'conquistadores': 2, 'aventureros': 3 };
                                        const genderOrder = { 'Female': 1, 'Mixed': 2, 'Male': 3 };

                                        const sortedUnits = [...units].sort((a, b) => {
                                          const typeA = clubTypeOrder[a.clubType] || 99;
                                          const typeB = clubTypeOrder[b.clubType] || 99;
                                          if (typeA !== typeB) return typeA - typeB;

                                          const genderA = genderOrder[a.gender] || 99;
                                          const genderB = genderOrder[b.gender] || 99;
                                          if (genderA !== genderB) return genderA - genderB;

                                          return a.name.localeCompare(b.name);
                                        });

                                        // 2. Group members by Unit
                                        const membersByUnit = {};
                                        sortedUnits.forEach(unit => {
                                          membersByUnit[unit.id] = regularMembers.filter(m => m.unitId === unit.id);
                                        });
                                        // Members without unit
                                        const membersNoUnit = regularMembers.filter(m => !m.unitId);

                                        // 3. Render function for a list of members
                                        const renderMemberTable = (unitName, unitMembers, unitData = null) => {
                                          if (unitMembers.length === 0) return null;

                                          // Sort members within unit: Captain -> Secretary -> Alphabetical
                                          const sortedUnitMembers = [...unitMembers].sort((a, b) => {
                                            if (unitData) {
                                              const isCapA = a.id === unitData.captainId;
                                              const isCapB = b.id === unitData.captainId;
                                              if (isCapA && !isCapB) return -1;
                                              if (!isCapA && isCapB) return 1;

                                              const isSecA = a.id === unitData.secretaryId;
                                              const isSecB = b.id === unitData.secretaryId;
                                              if (isSecA && !isSecB) return -1;
                                              if (!isSecA && isSecB) return 1;
                                            }
                                            return a.firstName.localeCompare(b.firstName);
                                          });

                                          return (
                                            <div key={unitName} className="mb-8">
                                              <div className="flex items-center gap-2 mb-2 px-2 border-l-4 border-yellow-500">
                                                <h4 className="text-lg font-bold text-gray-800 dark:text-gray-200 uppercase">{unitName}</h4>
                                                {unitData && (
                                                  <span className="text-xs px-2 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                                                    {unitData.clubType === 'guias' ? 'Guías Mayores' : unitData.clubType === 'conquistadores' ? 'Conquistadores' : 'Aventureros'}
                                                  </span>
                                                )}
                                              </div>
                                              <table className="w-full border-collapse">
                                                <thead className="bg-gradient-to-r from-yellow-600 to-orange-600 dark:from-yellow-700 dark:to-orange-700 text-white text-sm">
                                                  <tr>
                                                    <th className="px-4 py-3 text-left font-semibold rounded-tl-lg">#</th>
                                                    <th className="px-4 py-3 text-left font-semibold">Nombre</th>
                                                    <th className="px-2 py-3 text-center font-semibold text-xs md:text-sm">Asist.<br /><span className="opacity-75 font-normal">Also</span></th>
                                                    <th className="px-2 py-3 text-center font-semibold text-xs md:text-sm">Punt.<br /><span className="opacity-75 font-normal">(+5)</span></th>
                                                    <th className="px-2 py-3 text-center font-semibold text-xs md:text-sm">Biblia<br /><span className="opacity-75 font-normal">(+5)</span></th>
                                                    <th className="px-2 py-3 text-center font-semibold text-xs md:text-sm">Unif.<br /><span className="opacity-75 font-normal">(+5)</span></th>
                                                    <th className="px-2 py-3 text-center font-semibold text-xs md:text-sm">Disc.<br /><span className="opacity-75 font-normal">(+5)</span></th>
                                                    <th className="px-2 py-3 text-center font-semibold text-xs md:text-sm">Tarea<br /><span className="opacity-75 font-normal">(+5)</span></th>
                                                    <th className="px-2 py-3 text-center font-semibold text-xs md:text-sm">C. Vie<br /><span className="opacity-75 font-normal">(+10)</span></th>
                                                    <th className="px-2 py-3 text-center font-semibold text-xs md:text-sm">C. Sáb<br /><span className="opacity-75 font-normal">(+10)</span></th>
                                                    <th className="px-2 py-3 text-center font-semibold text-xs md:text-sm rounded-tr-lg">E. Sab<br /><span className="opacity-75 font-normal">(+5)</span></th>
                                                    <th className="px-4 py-3 text-center font-semibold">Total</th>
                                                  </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                                                  {sortedUnitMembers.map((member, idx) => {
                                                    const memberPoints = points.find(p =>
                                                      p.memberId === member.id &&
                                                      p.month === selectedPointsMonth
                                                    ) || { memberId: member.id, month: selectedPointsMonth, saturdays: {} };

                                                    const satPoints = memberPoints.saturdays[selectedSaturday] || {};
                                                    const total = (satPoints.punctuality || 0) +
                                                      (satPoints.bible || 0) +
                                                      (satPoints.uniform || 0) +
                                                      (satPoints.discipline || 0) +
                                                      (satPoints.homework || 0) +
                                                      (satPoints.worshipFriday || 0) +
                                                      (satPoints.worshipSaturday || 0) +
                                                      (satPoints.sabbathSchool || 0);

                                                    const isPresent = satPoints.attendance === true;

                                                    // Determine role label
                                                    let roleLabel = null;
                                                    if (unitData) {
                                                      if (member.id === unitData.captainId) roleLabel = { text: 'Capitán', color: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30' };
                                                      if (member.id === unitData.secretaryId) roleLabel = { text: 'Secretario', color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30' };
                                                    }

                                                    return (
                                                      <tr key={member.id} className="hover:bg-yellow-50 dark:hover:bg-yellow-900/10 border-b dark:border-gray-700 transition-colors">
                                                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-white text-sm">{idx + 1}</td>
                                                        <td className="px-4 py-3">
                                                          <div className="font-medium text-gray-900 dark:text-white flex flex-col">
                                                            <span>{member.firstName} {member.lastName}</span>
                                                            {roleLabel && (
                                                              <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded w-fit mt-0.5 ${roleLabel.color}`}>
                                                                {roleLabel.text}
                                                              </span>
                                                            )}
                                                          </div>
                                                        </td>

                                                        {/* Attendance Column */}
                                                        <td className="px-2 py-3 text-center">
                                                          <input
                                                            type="checkbox"
                                                            checked={isPresent}
                                                            disabled={isLocked}
                                                            onChange={(e) => {
                                                              const checked = e.target.checked;
                                                              setPoints(prev => {
                                                                const existing = prev.find(p => p.memberId === member.id && p.month === selectedPointsMonth);
                                                                if (existing) {
                                                                  return prev.map(p => {
                                                                    if (p.memberId === member.id && p.month === selectedPointsMonth) {
                                                                      return {
                                                                        ...p,
                                                                        saturdays: {
                                                                          ...p.saturdays,
                                                                          [selectedSaturday]: {
                                                                            ...p.saturdays[selectedSaturday],
                                                                            attendance: checked
                                                                          }
                                                                        }
                                                                      };
                                                                    }
                                                                    return p;
                                                                  });
                                                                } else {
                                                                  return [...prev, {
                                                                    memberId: member.id,
                                                                    month: selectedPointsMonth,
                                                                    saturdays: {
                                                                      [selectedSaturday]: {
                                                                        attendance: checked
                                                                      }
                                                                    }
                                                                  }];
                                                                }
                                                              });
                                                            }}
                                                            className={`w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-yellow-600 focus:ring-yellow-500 bg-white dark:bg-gray-700 ${isLocked ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}
                                                          />
                                                        </td>

                                                        {['punctuality', 'bible', 'uniform', 'discipline', 'homework', 'worshipFriday', 'worshipSaturday', 'sabbathSchool'].map((category) => {
                                                          const maxPoints = (category === 'worshipFriday' || category === 'worshipSaturday') ? 10 : 5;
                                                          const currentPoints = satPoints[category] || 0;

                                                          return (
                                                            <td key={category} className="px-1 py-2 text-center">
                                                              {isLocked ? (
                                                                <div className={`inline-block w-8 py-1 rounded text-sm font-semibold ${currentPoints > 0
                                                                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                                                                  : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                                                                  } `}>
                                                                  {currentPoints}
                                                                </div>
                                                              ) : (
                                                                <input
                                                                  type="number"
                                                                  min="0"
                                                                  max={maxPoints}
                                                                  value={currentPoints}
                                                                  onChange={(e) => {
                                                                    const value = Math.min(maxPoints, Math.max(0, parseInt(e.target.value) || 0));

                                                                    setPoints(prev => {
                                                                      const existing = prev.find(p => p.memberId === member.id && p.month === selectedPointsMonth);
                                                                      if (existing) {
                                                                        return prev.map(p => {
                                                                          if (p.memberId === member.id && p.month === selectedPointsMonth) {
                                                                            return {
                                                                              ...p,
                                                                              saturdays: {
                                                                                ...p.saturdays,
                                                                                [selectedSaturday]: {
                                                                                  ...p.saturdays[selectedSaturday],
                                                                                  [category]: value
                                                                                }
                                                                              }
                                                                            };
                                                                          }
                                                                          return p;
                                                                        });
                                                                      } else {
                                                                        return [...prev, {
                                                                          memberId: member.id,
                                                                          month: selectedPointsMonth,
                                                                          saturdays: {
                                                                            [selectedSaturday]: {
                                                                              [category]: value
                                                                            }
                                                                          }
                                                                        }];
                                                                      }
                                                                    });
                                                                  }}
                                                                  className={`w-10 md:w-12 px-1 py-1 text-center text-sm border rounded font-semibold bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${currentPoints > 0
                                                                    ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700 text-green-700 dark:text-green-300'
                                                                    : 'border-gray-300 dark:border-gray-600'
                                                                    } `}
                                                                />
                                                              )}
                                                            </td>
                                                          );
                                                        })}
                                                        <td className="px-4 py-3 text-center">
                                                          <div className="inline-block px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 rounded font-bold text-lg">
                                                            {total}
                                                          </div>
                                                        </td>
                                                      </tr>
                                                    );
                                                  })}
                                                </tbody>
                                              </table>
                                            </div>
                                          );
                                        };

                                        return (
                                          <>
                                            {sortedUnits.map(unit =>
                                              renderMemberTable(unit.name, membersByUnit[unit.id] || [], unit)
                                            )}
                                            {/* Members without unit */}
                                            {renderMemberTable('Sin Unidad', membersNoUnit)}
                                          </>
                                        );
                                      })()}
                                    </div>
                                  </div>
                                </>
                              );
                            })()}
                          </>
                        ) : (
                          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
                            <Calendar className="w-16 h-16 text-yellow-300 mx-auto mb-4" />
                            <p className="text-gray-600 dark:text-gray-300 text-lg font-semibold">Selecciona un sábado para ingresar puntos</p>
                            <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">Elige entre los botones de sábado arriba</p>
                          </div>
                        )}

                        {/* Summary Statistics */}
                        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/40 dark:to-yellow-800/40 rounded-lg shadow-md p-6 border border-yellow-200 dark:border-yellow-800">
                            <div className="flex items-center justify-between mb-3">
                              <Award className="w-10 h-10 text-yellow-600 dark:text-yellow-400" />
                              <span className="text-3xl font-bold text-yellow-900 dark:text-yellow-100">
                                {(() => {
                                  let max = 0;
                                  let topMember = '';
                                  regularMembers.forEach(member => {
                                    const memberPoints = points.find(p =>
                                      p.memberId === member.id &&
                                      p.month === selectedPointsMonth
                                    );
                                    if (memberPoints) {
                                      let total = 0;
                                      Object.values(memberPoints.saturdays).forEach(sat => {
                                        total += (sat.punctuality || 0) + (sat.bible || 0) + (sat.uniform || 0) +
                                          (sat.discipline || 0) + (sat.homework || 0) + (sat.worship || 0) + (sat.participation || 0);
                                      });
                                      if (total > max) {
                                        max = total;
                                        topMember = `${member.firstName} ${member.lastName} `;
                                      }
                                    }
                                  });
                                  return max;
                                })()}
                              </span>
                            </div>
                            <h3 className="text-sm font-medium text-yellow-700 dark:text-yellow-300 uppercase tracking-wide">Puntaje Más Alto</h3>
                            <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                              {(() => {
                                let max = 0;
                                let topMember = 'Sin puntajes aún';
                                regularMembers.forEach(member => {
                                  const memberPoints = points.find(p =>
                                    p.memberId === member.id &&
                                    p.month === selectedPointsMonth
                                  );
                                  if (memberPoints) {
                                    let total = 0;
                                    Object.values(memberPoints.saturdays).forEach(sat => {
                                      total += (sat.punctuality || 0) + (sat.bible || 0) + (sat.uniform || 0) +
                                        (sat.discipline || 0) + (sat.homework || 0) + (sat.worship || 0) + (sat.participation || 0);
                                    });
                                    if (total > max) {
                                      max = total;
                                      topMember = `${member.firstName} ${member.lastName} `;
                                    }
                                  }
                                });
                                return topMember;
                              })()}
                            </p>
                          </div>

                          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/40 dark:to-blue-800/40 rounded-lg shadow-md p-6 border border-blue-200 dark:border-blue-800">
                            <div className="flex items-center justify-between mb-3">
                              <Users className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                              <span className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                                {Math.round((() => {
                                  let total = 0;
                                  let count = 0;
                                  regularMembers.forEach(member => {
                                    const memberPoints = points.find(p =>
                                      p.memberId === member.id &&
                                      p.month === selectedPointsMonth
                                    );
                                    if (memberPoints && Object.keys(memberPoints.saturdays).length > 0) {
                                      Object.values(memberPoints.saturdays).forEach(sat => {
                                        total += (sat.punctuality || 0) + (sat.bible || 0) + (sat.uniform || 0) +
                                          (sat.discipline || 0) + (sat.homework || 0) + (sat.worship || 0) + (sat.participation || 0);
                                      });
                                      count++;
                                    }
                                  });
                                  return count > 0 ? total / count : 0;
                                })())}
                              </span>
                            </div>
                            <h3 className="text-sm font-medium text-blue-700 dark:text-blue-300 uppercase tracking-wide">Puntaje Promedio</h3>
                            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Por miembro este mes</p>
                          </div>

                          <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/40 dark:to-green-800/40 rounded-lg shadow-md p-6 border border-green-200 dark:border-green-800">
                            <div className="flex items-center justify-between mb-3">
                              <TrendingUp className="w-10 h-10 text-green-600 dark:text-green-400" />
                              <span className="text-3xl font-bold text-green-900 dark:text-green-100">
                                {(() => {
                                  let total = 0;
                                  points.forEach(p => {
                                    if (p.month === selectedPointsMonth) {
                                      // Only count if member is not in directive
                                      const member = members.find(m => m.id === p.memberId);
                                      if (member && (!member.position || member.position === '')) {
                                        Object.values(p.saturdays).forEach(sat => {
                                          total += (sat.punctuality || 0) + (sat.bible || 0) + (sat.uniform || 0) +
                                            (sat.discipline || 0) + (sat.homework || 0) + (sat.worship || 0) + (sat.participation || 0);
                                        });
                                      }
                                    }
                                  });
                                  return total;
                                })()}
                              </span>
                            </div>
                            <h3 className="text-sm font-medium text-green-700 dark:text-green-300 uppercase tracking-wide">Puntos Totales</h3>
                            <p className="text-xs text-green-600 dark:text-green-400 mt-1">Todos los miembros combinados</p>
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              )
            }
            {/* Finanzas Module */}
            {
              activeModule === 'finances' && !showFinanceForm && (
                <>
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                          <DollarSign className="w-7 h-7 text-green-600 dark:text-green-400" />
                          Finanzas
                        </h2>
                        <p className="text-gray-600 dark:text-gray-300 mt-1">Seguimiento de ingresos, gastos y salud financiera</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/40 p-3 rounded-lg border border-green-200 dark:border-green-800">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-green-700 dark:text-green-300">Ingresos Totales</span>
                          <TrendingUp className="w-4 h-4 text-green-600" />
                        </div>
                        <div className="text-lg font-bold text-green-900 dark:text-green-100">
                          {formatCurrency(summary.income)}
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-900/40 p-3 rounded-lg border border-red-200 dark:border-red-800">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-red-700 dark:text-red-300">Gastos Totales</span>
                          <TrendingDown className="w-4 h-4 text-red-600" />
                        </div>
                        <div className="text-lg font-bold text-red-900 dark:text-red-100">
                          {formatCurrency(summary.expenses)}
                        </div>
                      </div>

                      <div className={`bg-gradient-to-br p-3 rounded-lg border ${summary.balance >= 0
                        ? 'from-indigo-50 to-indigo-100 border-indigo-200 dark:from-indigo-900/20 dark:to-indigo-900/40 dark:border-indigo-800'
                        : 'from-orange-50 to-orange-100 border-orange-200 dark:from-orange-900/20 dark:to-orange-900/40 dark:border-orange-800'
                        } `}>
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-sm font-medium ${summary.balance >= 0 ? 'text-indigo-700 dark:text-indigo-300' : 'text-orange-700 dark:text-orange-300'
                            } `}>Balance</span>
                          <Wallet className={`w-4 h-4 ${summary.balance >= 0 ? 'text-indigo-600' : 'text-orange-600'
                            } `} />
                        </div>
                        <div className={`text-lg font-bold ${summary.balance >= 0 ? 'text-indigo-900 dark:text-indigo-100' : 'text-orange-900 dark:text-orange-100'
                          } `}>
                          {formatCurrency(summary.balance)}
                        </div>
                      </div>
                    </div>

                    {/* Financial Charts Section */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
                      <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6">Distribución Financiera</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Income Chart */}
                        <div>
                          <h4 className="text-center font-medium text-gray-600 dark:text-gray-300 mb-4">Ingresos por Categoría</h4>
                          <div className="h-48">
                            {transactions.filter(t => t.type === 'income').length > 0 ? (
                              <div className="flex flex-row items-center h-full">
                                {/* Chart Side */}
                                <div className="w-5/12 h-full">
                                  <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                      <Pie
                                        data={(() => {
                                          const incomeData = {};
                                          transactions
                                            .filter(t => t.type === 'income')
                                            .forEach(t => {
                                              incomeData[t.category] = (incomeData[t.category] || 0) + t.amount;
                                            });
                                          return Object.entries(incomeData).map(([name, value]) => ({ name, value }));
                                        })()}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={35}
                                        outerRadius={55}
                                        paddingAngle={2}
                                        dataKey="value"
                                      >
                                        {(() => {
                                          const incomeData = {};
                                          transactions
                                            .filter(t => t.type === 'income')
                                            .forEach(t => {
                                              incomeData[t.category] = (incomeData[t.category] || 0) + t.amount;
                                            });
                                          const colors = ['#059669', '#10B981', '#34D399', '#6EE7B7', '#A7F3D0'];
                                          return Object.keys(incomeData).map((entry, index) => (
                                            <Cell key={`cell - ${index} `} fill={colors[index % colors.length]} />
                                          ));
                                        })()}
                                      </Pie>
                                      <Tooltip formatter={(value) => formatCurrency(value)} />
                                    </PieChart>
                                  </ResponsiveContainer>
                                </div>

                                {/* List Side */}
                                <div className="w-7/12 h-full overflow-y-auto pl-2 pr-1 custom-scrollbar">
                                  <div className="space-y-2">
                                    {(() => {
                                      const incomeData = {};
                                      transactions
                                        .filter(t => t.type === 'income')
                                        .forEach(t => {
                                          incomeData[t.category] = (incomeData[t.category] || 0) + t.amount;
                                        });
                                      const totalIncome = Object.values(incomeData).reduce((a, b) => a + b, 0);
                                      const colors = ['#059669', '#10B981', '#34D399', '#6EE7B7', '#A7F3D0'];

                                      return Object.entries(incomeData).map(([name, value], index) => (
                                        <div key={index} className="flex items-center justify-between text-xs group hover:bg-gray-50 dark:hover:bg-gray-700 p-1 rounded">
                                          <div className="flex items-center gap-2 overflow-hidden">
                                            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: colors[index % colors.length] }}></div>
                                            <span className="font-medium text-gray-700 dark:text-gray-300 truncate" title={name}>{name}</span>
                                          </div>
                                          <div className="text-right flex-shrink-0">
                                            <div className="font-bold text-gray-900 dark:text-white">{formatCurrency(value)}</div>
                                            <div className="text-[10px] text-gray-500 dark:text-gray-400">{((value / totalIncome) * 100).toFixed(0)}%</div>
                                          </div>
                                        </div>
                                      ));
                                    })()}
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="h-full flex flex-col items-center justify-center text-gray-400 border border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
                                <BarChart3 className="w-8 h-8 mb-2 opacity-50" />
                                <p className="text-sm">No hay ingresos registrados</p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Expenses Chart */}
                        <div>
                          <h4 className="text-center font-medium text-gray-600 dark:text-gray-300 mb-4">Gastos por Categoría</h4>
                          <div className="h-48">
                            {transactions.filter(t => t.type === 'expense').length > 0 ? (
                              <div className="flex flex-row items-center h-full">
                                {/* Chart Side */}
                                <div className="w-5/12 h-full">
                                  <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                      <Pie
                                        data={(() => {
                                          const expenseData = {};
                                          transactions
                                            .filter(t => t.type === 'expense')
                                            .forEach(t => {
                                              expenseData[t.category] = (expenseData[t.category] || 0) + t.amount;
                                            });
                                          return Object.entries(expenseData).map(([name, value]) => ({ name, value }));
                                        })()}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={35}
                                        outerRadius={55}
                                        paddingAngle={2}
                                        dataKey="value"
                                      >
                                        {(() => {
                                          const expenseData = {};
                                          transactions
                                            .filter(t => t.type === 'expense')
                                            .forEach(t => {
                                              expenseData[t.category] = (expenseData[t.category] || 0) + t.amount;
                                            });
                                          const colors = ['#DC2626', '#EF4444', '#F87171', '#FCA5A5', '#FECACA'];
                                          return Object.keys(expenseData).map((entry, index) => (
                                            <Cell key={`cell - ${index} `} fill={colors[index % colors.length]} />
                                          ));
                                        })()}
                                      </Pie>
                                      <Tooltip formatter={(value) => formatCurrency(value)} />
                                    </PieChart>
                                  </ResponsiveContainer>
                                </div>

                                {/* List Side */}
                                <div className="w-7/12 h-full overflow-y-auto pl-2 pr-1 custom-scrollbar">
                                  <div className="space-y-2">
                                    {(() => {
                                      const expenseData = {};
                                      transactions
                                        .filter(t => t.type === 'expense')
                                        .forEach(t => {
                                          expenseData[t.category] = (expenseData[t.category] || 0) + t.amount;
                                        });
                                      const totalExpenses = Object.values(expenseData).reduce((a, b) => a + b, 0);
                                      const colors = ['#DC2626', '#EF4444', '#F87171', '#FCA5A5', '#FECACA'];

                                      return Object.entries(expenseData).map(([name, value], index) => (
                                        <div key={index} className="flex items-center justify-between text-xs group hover:bg-gray-50 dark:hover:bg-gray-700 p-1 rounded">
                                          <div className="flex items-center gap-2 overflow-hidden">
                                            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: colors[index % colors.length] }}></div>
                                            <span className="font-medium text-gray-700 dark:text-gray-300 truncate" title={name}>{name}</span>
                                          </div>
                                          <div className="text-right flex-shrink-0">
                                            <div className="font-bold text-gray-900 dark:text-white">{formatCurrency(value)}</div>
                                            <div className="text-[10px] text-gray-500 dark:text-gray-400">{((value / totalExpenses) * 100).toFixed(0)}%</div>
                                          </div>
                                        </div>
                                      ));
                                    })()}
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="h-full flex flex-col items-center justify-center text-gray-400 border border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
                                <BarChart3 className="w-8 h-8 mb-2 opacity-50" />
                                <p className="text-sm">No hay gastos registrados</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Debt Report Section - Pending Receipts */}
                  {(() => {
                    const pendingTransactions = transactions.filter(t => t.status === 'pending_receipt');
                    if (pendingTransactions.length > 0) {
                      const debtByMember = {};
                      pendingTransactions.forEach(t => {
                        if (!debtByMember[t.responsibleId]) {
                          debtByMember[t.responsibleId] = {
                            member: members.find(m => m.id === t.responsibleId),
                            total: 0,
                            count: 0
                          };
                        }
                        debtByMember[t.responsibleId].total += t.amount;
                        debtByMember[t.responsibleId].count++;
                      });

                      return (
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6 border-l-4 border-orange-500 dark:border-orange-500">
                          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                            <AlertTriangle className="w-6 h-6 text-orange-500" />
                            Deudas por Facturas Pendientes
                          </h3>
                          <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">Los siguientes miembros de la directiva tienen gastos registrados sin comprobante oficial.</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {Object.values(debtByMember).map((debt, idx) => (
                              <div key={idx} className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
                                <div className="flex items-center gap-3 mb-3">
                                  <div className="w-10 h-10 bg-orange-200 dark:bg-orange-800 rounded-full flex items-center justify-center text-orange-700 dark:text-orange-200 font-bold">
                                    {debt.member ? debt.member.firstName[0] : '?'}
                                  </div>
                                  <div>
                                    <div className="font-bold text-gray-800 dark:text-white leading-tight">{debt.member ? `${debt.member.firstName} ${debt.member.lastName} ` : 'Desconocido'}</div>
                                    <div className="text-xs text-gray-600 dark:text-gray-400">{debt.member?.position || 'Sin cargo'}</div>
                                  </div>
                                </div>
                                <div className="flex justify-between items-end border-t border-orange-200 pt-2">
                                  <div className="text-xs text-orange-800 dark:text-orange-200 bg-orange-100 dark:bg-orange-900/50 px-2 py-1 rounded-full">{debt.count} facturas pendientes</div>
                                  <div className="text-xl font-bold text-orange-700 dark:text-orange-300">{formatCurrency(debt.total)}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}

                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
                    <div className="flex gap-4 flex-wrap">
                      <button
                        onClick={() => setShowFinanceForm(true)}
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2"
                      >
                        <Plus className="w-5 h-5" />
                        Agregar Transacción
                      </button>
                      <button
                        onClick={() => {
                          setShowGroupPaymentForm(true);
                          setGroupPaymentData(prev => ({ ...prev, categoryId: '', amount: '', selectedMembers: [] }));
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2"
                      >
                        <Users className="w-5 h-5" />
                        Pagos Grupales
                      </button>
                      <button
                        onClick={() => setShowMonthlyReport(!showMonthlyReport)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2"
                      >
                        <FileText className="w-5 h-5" />
                        {showMonthlyReport ? 'Ocultar' : 'Ver'} Reporte Mensual
                      </button>
                      <button
                        onClick={() => setShowCategoryReport(!showCategoryReport)}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2"
                      >
                        <BarChart3 className="w-5 h-5" />
                        {showCategoryReport ? 'Ocultar' : 'Ver'} Reporte de Categoría
                      </button>
                      <button
                        onClick={() => setShowCategoryManager(!showCategoryManager)}
                        className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2"
                      >
                        <Settings className="w-5 h-5" />
                        {showCategoryManager ? 'Ocultar' : 'Gestionar'} Categorías
                      </button>
                      <button
                        onClick={handleClearAllTransactions}
                        className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 ml-auto"
                        title="Borrar todo el historial"
                      >
                        <Trash2 className="w-5 h-5" />
                        Eliminar Todo
                      </button>
                    </div>
                  </div>

                  {showCategoryManager && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
                      <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
                        <Settings className="w-6 h-6 text-amber-600" />
                        Gestor de Categorías
                      </h3>
                      <form onSubmit={(e) => {
                        e.preventDefault();
                        const fd = new FormData(e.target);
                        const isFixed = fd.get('isFixedPrice') === 'on';
                        const newCat = {
                          id: Date.now().toString(),
                          name: fd.get('name'),
                          type: fd.get('type'),
                          isFixedPrice: isFixed,
                          defaultAmount: isFixed ? fd.get('defaultAmount') : null
                        };
                        setFinanceCategories(prev => [...prev, newCat]);
                        e.target.reset();
                      }} className="flex flex-wrap gap-4 mb-6 items-end bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                        <div className="flex-1 min-w-[200px]">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre de Categoría</label>
                          <input name="name" required className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white" placeholder="Ej: Ventas, Transporte..." />
                        </div>
                        <div className="w-40">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo</label>
                          <select name="type" className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                            <option value="income">Ingreso</option>
                            <option value="expense">Gasto</option>
                          </select>
                        </div>
                        <div className="flex items-center gap-2 mb-3">
                          <input type="checkbox" name="isFixedPrice" id="isFixedPrice" className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-green-600 focus:ring-green-500 bg-white dark:bg-gray-800"
                            onChange={(e) => {
                              const amountInput = document.getElementById('defaultAmountContainer');
                              if (amountInput) amountInput.style.display = e.target.checked ? 'block' : 'none';
                            }}
                          />
                          <label htmlFor="isFixedPrice" className="text-sm font-medium text-gray-700 dark:text-gray-300 select-none cursor-pointer">Precio Fijo</label>
                        </div>
                        <div id="defaultAmountContainer" className="w-32" style={{ display: 'none' }}>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Monto ($)</label>
                          <input name="defaultAmount" type="number" step="0.01" className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white" placeholder="0.00" />
                        </div>
                        <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 flex items-center gap-2">
                          <Plus className="w-5 h-5" /> Agregar
                        </button>
                      </form>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-green-600" /> Ingresos
                          </h4>
                          <div className="space-y-2 max-h-60 overflow-y-auto">
                            {financeCategories.filter(c => c.type === 'income').map(cat => (
                              <div key={cat.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600">
                                <div className="flex items-center gap-2">
                                  <span className="text-gray-800 dark:text-white">{cat.name}</span>
                                  {cat.isFixedPrice && (
                                    <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded-full">
                                      ${cat.defaultAmount}
                                    </span>
                                  )}
                                </div>
                                <button
                                  onClick={() => {
                                    if (confirm('¿Eliminar categoría?')) setFinanceCategories(prev => prev.filter(c => c.id !== cat.id));
                                  }}
                                  className="text-gray-400 hover:text-red-500"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                            <TrendingDown className="w-4 h-4 text-red-600" /> Gastos
                          </h4>
                          <div className="space-y-2 max-h-60 overflow-y-auto">
                            {financeCategories.filter(c => c.type === 'expense').map(cat => (
                              <div key={cat.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600">
                                <span className="text-gray-800 dark:text-white">{cat.name}</span>
                                <button
                                  onClick={() => {
                                    if (confirm('¿Eliminar categoría?')) setFinanceCategories(prev => prev.filter(c => c.id !== cat.id));
                                  }}
                                  className="text-gray-400 hover:text-red-500"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {showMonthlyReport && monthlyReport.length > 0 && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
                      <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Reporte Mensual</h3>
                      <div className="space-y-4">
                        {monthlyReport.map((month) => (
                          <div key={month.month} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="text-lg font-semibold text-gray-800 dark:text-white">{formatMonthYear(month.month)}</h4>
                              <div className={`text-lg font-bold ${month.income - month.expense >= 0 ? 'text-green-600' : 'text-red-600'
                                } `}>
                                Neto: {formatCurrency(month.income - month.expense)}
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                                <div className="text-sm text-green-700 dark:text-green-300">Ingreso</div>
                                <div className="text-xl font-bold text-green-900 dark:text-green-100">{formatCurrency(month.income)}</div>
                              </div>
                              <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                                <div className="text-sm text-red-700 dark:text-red-300">Gastos</div>
                                <div className="text-xl font-bold text-red-900 dark:text-red-100">{formatCurrency(month.expense)}</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {showCategoryReport && categoryReport.length > 0 && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
                      <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Reporte de Categoría</h3>
                      <div className="space-y-3">
                        {categoryReport.map((cat) => (
                          <div key={cat.category} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="text-lg font-semibold text-gray-800 dark:text-white">{cat.category}</h4>
                              <div className={`font-bold ${cat.total >= 0 ? 'text-green-600' : 'text-red-600'} `}>
                                {formatCurrency(cat.total)}
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="text-sm">
                                <span className="text-green-600 dark:text-green-400">Ingresos: {formatCurrency(cat.income)}</span>
                              </div>
                              <div className="text-sm">
                                <span className="text-red-600 dark:text-red-400">Gastos: {formatCurrency(cat.expense)}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                    {transactions.length === 0 ? (
                      <div className="text-center py-12">
                        <DollarSign className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-gray-400 text-lg">No hay transacciones aún</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Fecha</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Estado</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Tipo</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Categoría</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Descripción</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Responsable</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Monto</th>
                              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Acciones</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y dark:divide-gray-700">
                            {transactions.map((transaction) => (
                              <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 border-b dark:border-gray-700">
                                <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-200">{new Date(transaction.date).toLocaleDateString()}</td>
                                <td className="px-6 py-4">
                                  {transaction.status === 'pending_receipt' ? (
                                    <div className="flex flex-col items-start gap-1">
                                      <div className="flex items-center gap-1 text-orange-600 dark:text-orange-300 bg-orange-100 dark:bg-orange-900/40 px-2 py-1 rounded-full text-xs w-fit">
                                        <AlertTriangle className="w-3 h-3" /> Pendiente
                                      </div>
                                      <button
                                        onClick={() => setResolvingTransaction(transaction)}
                                        className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium underline mt-1"
                                      >
                                        Resolver Deuda
                                      </button>
                                    </div>
                                  ) : transaction.status === 'repaid' ? (
                                    <div className="flex items-center gap-1 text-purple-600 dark:text-purple-300 bg-purple-100 dark:bg-purple-900/40 px-2 py-1 rounded-full text-xs w-fit">
                                      <CheckCircle className="w-3 h-3" /> Saldado
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-1 text-green-600 dark:text-green-300 bg-green-100 dark:bg-green-900/40 px-2 py-1 rounded-full text-xs w-fit">
                                      <CheckCircle className="w-3 h-3" /> Oficial
                                    </div>
                                  )}
                                </td>
                                <td className="px-6 py-4">
                                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${transaction.type === 'income' ? 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300'
                                    } `}>
                                    {transaction.type === 'income' ? 'Ingreso' : 'Gasto'}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{transaction.category}</td>
                                <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                                  <div>{transaction.description || '-'}</div>
                                  {transaction.receipt && (
                                    <button
                                      onClick={() => {
                                        const newWindow = window.open();
                                        newWindow.document.write(`< iframe src = "${transaction.receipt}" frameborder = "0" style = "border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen ></iframe > `);
                                      }}
                                      className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 text-xs flex items-center gap-1 mt-1"
                                    >
                                      <FileText className="w-3 h-3" /> Ver Factura
                                    </button>
                                  )}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                                  {transaction.responsibleId ? (
                                    (() => {
                                      const m = members.find(mem => mem.id === transaction.responsibleId);
                                      return m ? `${m.firstName} ${m.lastName} ` : 'Desconocido';
                                    })()
                                  ) : '-'}
                                </td>
                                <td className="px-6 py-4">
                                  <span className={`font-semibold ${transaction.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                                    } `}>
                                    {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                  <button
                                    onClick={() => {
                                      if (confirm('¿Estás seguro de que deseas eliminar esta transacción? Esta acción no se puede deshacer.')) {
                                        setTransactions(prev => prev.filter(t => t.id !== transaction.id));
                                      }
                                    }}
                                    className="text-gray-400 hover:text-red-600 transition-colors p-1"
                                    title="Eliminar transacción"
                                  >
                                    <Trash2 className="w-5 h-5" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </>
              )
            }

            {/* Resolve Debt Modal */}
            {
              resolvingTransaction && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-bold text-gray-800 dark:text-white">Resolver Deuda Pendiente</h3>
                      <button onClick={() => setResolvingTransaction(null)} className="text-gray-500 hover:text-gray-700">
                        <X className="w-6 h-6" />
                      </button>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded mb-4 text-sm text-gray-700 dark:text-gray-300">
                      <p><span className="font-bold">Gasto:</span> {resolvingTransaction.category}</p>
                      <p><span className="font-bold">Monto:</span> {formatCurrency(resolvingTransaction.amount)}</p>
                      <p><span className="font-bold">Fecha:</span> {new Date(resolvingTransaction.date).toLocaleDateString()}</p>
                    </div>

                    <div className="space-y-4">
                      <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <h4 className="font-bold text-indigo-700 dark:text-indigo-400 mb-2">Opción A: Subir Factura</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Si has encontrado el comprobante, súbelo aquí para oficializar el gasto.</p>
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setTransactions(prev => prev.map(t =>
                                  t.id === resolvingTransaction.id ? { ...t, receipt: reader.result, status: 'official' } : t
                                ));
                                setResolvingTransaction(null);
                                alert('✅ Factura subida. Gasto oficializado.');
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="w-full text-sm text-gray-500 dark:text-gray-400"
                        />
                      </div>

                      <div className="relative">
                        <div className="absolute inset-0 flex items-center" aria-hidden="true">
                          <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                        </div>
                        <div className="relative flex justify-center">
                          <span className="bg-white dark:bg-gray-800 px-2 text-sm text-gray-500">O</span>
                        </div>
                      </div>

                      <div className="border rounded-lg p-4 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors border-red-100 dark:border-red-900/30">
                        <h4 className="font-bold text-red-700 dark:text-red-400 mb-2">Opción B: Saldar Deuda (Reembolso)</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Si no hay factura, el responsable debe devolver el dinero. Esto registrará un ingreso automatico por reembolso.</p>
                        <button
                          onClick={() => {
                            if (confirm(`¿Confirmas que se ha recibido el reembolso de ${formatCurrency(resolvingTransaction.amount)}?`)) {
                              const reimbursement = {
                                id: Date.now().toString(),
                                type: 'income',
                                category: 'Reembolsos',
                                amount: resolvingTransaction.amount,
                                date: new Date().toISOString().split('T')[0],
                                description: `Reembolso de gasto: ${resolvingTransaction.description || resolvingTransaction.category} `,
                                paymentMethod: 'Efectivo', // Default
                                status: 'official'
                              };

                              setTransactions(prev => {
                                // Update original to 'repaid' and add reimbursement
                                return [
                                  ...prev.map(t => t.id === resolvingTransaction.id ? { ...t, status: 'repaid' } : t),
                                  reimbursement
                                ];
                              });
                              setResolvingTransaction(null);
                              alert('✅ Deuda saldada. Se ha registrado el reembolso.');
                            }
                          }}
                          className="w-full py-2 bg-red-600 text-white rounded font-medium hover:bg-red-700"
                        >
                          Saldar Deuda
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            }

            {/* Finance Form */}
            {
              activeModule === 'finances' && showFinanceForm && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-white">Agregar Transacción</h3>
                    <button onClick={() => { setShowFinanceForm(false); resetFinanceForm(); }} className="text-gray-500 hover:text-gray-700">
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Tipo <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="type"
                        value={financeFormData.type}
                        onChange={handleFinanceInputChange}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="income">Ingreso</option>
                        <option value="expense">Gasto</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Categoría <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="category"
                        value={financeFormData.category}
                        onChange={handleFinanceInputChange}
                        className={`w-full px-4 py-2 border rounded-lg ${financeErrors.category ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                      >
                        <option value="">Seleccionar Categoría...</option>
                        {financeCategories
                          .filter(c => c.type === financeFormData.type)
                          .map(cat => (
                            <option key={cat.id} value={cat.name}>{cat.name}</option>
                          ))
                        }
                      </select>
                      {financeErrors.category && <p className="text-red-500 text-sm mt-1">{financeErrors.category}</p>}
                    </div>

                    {financeFormData.type === 'expense' && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Responsable (Directiva) <span className="text-red-500">*</span>
                          </label>
                          <select
                            name="responsibleId"
                            value={financeFormData.responsibleId}
                            onChange={handleFinanceInputChange}
                            className={`w-full px-4 py-2 border rounded-lg ${financeErrors.responsibleId ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                          >
                            <option value="">Seleccionar Responsable...</option>
                            {members.filter(m => m.position && m.position.trim() !== '').map(m => (
                              <option key={m.id} value={m.id}>{m.firstName} {m.lastName} - {m.position}</option>
                            ))}
                          </select>
                          {financeErrors.responsibleId && <p className="text-red-500 text-sm mt-1">{financeErrors.responsibleId}</p>}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Factura / Comprobante
                          </label>
                          <input
                            type="file"
                            accept="image/*,application/pdf"
                            onChange={handleFinanceFileChange}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Obligatorio para oficializar. Si no se adjunta, quedará como pendiente (Deuda).</p>
                        </div>
                      </>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Monto <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="amount"
                        value={financeFormData.amount}
                        onChange={handleFinanceInputChange}
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        className={`w-full px-4 py-2 border rounded-lg ${financeErrors.amount ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                      />
                      {financeErrors.amount && <p className="text-red-500 text-sm mt-1">{financeErrors.amount}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        name="date"
                        value={financeFormData.date}
                        onChange={handleFinanceInputChange}
                        className={`w-full px-4 py-2 border rounded-lg ${financeErrors.date ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                      />
                      {financeErrors.date && <p className="text-red-500 text-sm mt-1">{financeErrors.date}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Método de Pago <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="paymentMethod"
                        value={financeFormData.paymentMethod}
                        onChange={handleFinanceInputChange}
                        className={`w-full px-4 py-2 border rounded-lg ${financeErrors.paymentMethod ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                      >
                        <option value="">Seleccionar</option>
                        <option value="Cash">Efectivo</option>
                        <option value="Bank Transfer">Transferencia Bancaria</option>
                        <option value="Credit Card">Tarjeta de Crédito</option>
                        <option value="Mobile Payment">Pago Móvil</option>
                      </select>
                      {financeErrors.paymentMethod && <p className="text-red-500 text-sm mt-1">{financeErrors.paymentMethod}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Miembro (Opcional)</label>
                      <select
                        name="memberId"
                        value={financeFormData.memberId}
                        onChange={handleFinanceInputChange}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="">Seleccionar (Opcional)</option>
                        {members.map(m => (
                          <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>
                        ))}
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
                      <textarea
                        name="description"
                        value={financeFormData.description}
                        onChange={handleFinanceInputChange}
                        rows="3"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="flex gap-4 mt-8">
                    <button
                      onClick={handleFinanceSubmit}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium flex items-center justify-center gap-2"
                    >
                      <Save className="w-5 h-5" />
                      Guardar Transacción
                    </button>
                    <button
                      onClick={() => { setShowFinanceForm(false); resetFinanceForm(); }}
                      className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )
            }

            {/* Cuotas (Fees) Module */}
            {
              activeModule === 'finances' && showGroupPaymentForm && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                      <Users className="w-8 h-8 text-blue-600" />
                      Pagos Grupales
                    </h3>
                    <button onClick={() => setShowGroupPaymentForm(false)} className="text-gray-500 hover:text-gray-700">
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column: Settings */}
                    <div className="lg:col-span-1 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Categoría (Precio Fijo)</label>
                        <select
                          value={groupPaymentData.categoryId}
                          onChange={(e) => {
                            const cat = financeCategories.find(c => c.id === e.target.value);
                            setGroupPaymentData(prev => ({
                              ...prev,
                              categoryId: e.target.value,
                              amount: cat ? (cat.defaultAmount || '') : ''
                            }));
                          }}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                          <option value="">Seleccionar Categoría...</option>
                          {financeCategories.filter(c => c.isFixedPrice && c.type === 'income').map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name} - ${cat.defaultAmount}</option>
                          ))}
                        </select>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Solo aparecen categorías configuradas con precio fijo.</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Monto por Persona</label>
                        <input
                          type="number"
                          value={groupPaymentData.amount}
                          onChange={e => setGroupPaymentData(prev => ({ ...prev, amount: e.target.value }))}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha</label>
                        <input
                          type="date"
                          value={groupPaymentData.date}
                          onChange={e => setGroupPaymentData(prev => ({ ...prev, date: e.target.value }))}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Método de Pago</label>
                        <select
                          value={groupPaymentData.paymentMethod}
                          onChange={e => setGroupPaymentData(prev => ({ ...prev, paymentMethod: e.target.value }))}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                          <option value="Cash">Efectivo</option>
                          <option value="Bank Transfer">Transferencia Bancaria</option>
                          <option value="Mobile Payment">Pago Móvil</option>
                        </select>
                      </div>

                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                        <div className="text-sm text-blue-800 font-medium mb-1">Resumen</div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-gray-600">Miembros:</span>
                          <span className="font-bold">{groupPaymentData.selectedMembers.length}</span>
                        </div>
                        <div className="flex justify-between items-center text-lg font-bold text-blue-900 border-t border-blue-200 pt-2 mt-2">
                          <span>Total:</span>
                          <span>${((parseFloat(groupPaymentData.amount) || 0) * groupPaymentData.selectedMembers.length).toFixed(2)}</span>
                        </div>
                      </div>

                      <button
                        onClick={handleGroupPaymentSubmit}
                        disabled={groupPaymentData.selectedMembers.length === 0 || !groupPaymentData.categoryId}
                        className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2"
                      >
                        <Save className="w-5 h-5" />
                        Registrar Pagos
                      </button>
                    </div>

                    {/* Right Column: Member Selection */}
                    <div className="lg:col-span-2 border dark:border-gray-600 rounded-lg overflow-hidden flex flex-col h-[500px]">
                      <div className="bg-gray-50 dark:bg-gray-700 p-3 border-b dark:border-gray-600 flex items-center gap-4">
                        <div className="relative flex-1">
                          <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Buscar miembro..."
                            value={groupPaymentSearchTerm}
                            onChange={e => setGroupPaymentSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-500 rounded-lg bg-white dark:bg-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                          />
                        </div>
                        <label className="flex items-center gap-2 font-medium text-gray-700 dark:text-gray-300 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            className="w-5 h-5 text-blue-600 rounded border-gray-300 dark:border-gray-500 focus:ring-blue-500 bg-white dark:bg-gray-600"
                            onChange={(e) => {
                              const filtered = members.filter(m =>
                                (m.firstName + ' ' + m.lastName).toLowerCase().includes(groupPaymentSearchTerm.toLowerCase())
                              );
                              if (e.target.checked) {
                                const ids = filtered.map(m => m.id);
                                setGroupPaymentData(prev => ({
                                  ...prev,
                                  selectedMembers: [...new Set([...prev.selectedMembers, ...ids])]
                                }));
                              } else {
                                const visibleIds = filtered.map(m => m.id);
                                setGroupPaymentData(prev => ({
                                  ...prev,
                                  selectedMembers: prev.selectedMembers.filter(id => !visibleIds.includes(id))
                                }));
                              }
                            }}
                          />
                          Seleccionar Todos
                        </label>
                      </div>

                      <div className="overflow-y-auto flex-1 p-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {members
                            .filter(m => (m.firstName + ' ' + m.lastName).toLowerCase().includes(groupPaymentSearchTerm.toLowerCase()))
                            .sort((a, b) => a.firstName.localeCompare(b.firstName))
                            .map(member => (
                              <label
                                key={member.id}
                                className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${groupPaymentData.selectedMembers.includes(member.id)
                                  ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700'
                                  : 'hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-700'
                                  }`}
                              >
                                <input
                                  type="checkbox"
                                  className="w-5 h-5 text-blue-600 rounded mr-3 border-gray-300 dark:border-gray-500 focus:ring-blue-500 bg-white dark:bg-gray-600"
                                  checked={groupPaymentData.selectedMembers.includes(member.id)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setGroupPaymentData(prev => ({
                                        ...prev,
                                        selectedMembers: [...prev.selectedMembers, member.id]
                                      }));
                                    } else {
                                      setGroupPaymentData(prev => ({
                                        ...prev,
                                        selectedMembers: prev.selectedMembers.filter(id => id !== member.id)
                                      }));
                                    }
                                  }}
                                />
                                <div className="flex items-center gap-3">
                                  {member.photo ? (
                                    <img src={member.photo} alt="" className="w-10 h-10 rounded-full object-cover" />
                                  ) : (
                                    <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center text-gray-500 dark:text-gray-400 font-bold">
                                      {member.firstName[0]}
                                    </div>
                                  )}
                                  <div>
                                    <div className="font-semibold text-gray-800 dark:text-white">{member.firstName} {member.lastName}</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">{member.position || 'Miembro'}</div>
                                  </div>
                                </div>
                              </label>
                            ))
                          }
                          {members.length === 0 && (
                            <div className="col-span-2 text-center py-8 text-gray-500">No hay miembros registrados</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            }

            {
              activeModule === 'cuotas' && (
                <>
                  {!cuotaSessionActive ? (
                    <div className="max-w-xl mx-auto mt-12 bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden">
                      <div className="bg-green-600 p-6 text-white text-center">
                        <Wallet className="w-16 h-16 mx-auto mb-4 opacity-90" />
                        <h2 className="text-3xl font-bold">Cuotas Semanales</h2>
                        <p className="opacity-90 mt-2">Seleccione la fecha para gestionar los pagos</p>
                      </div>
                      <div className="p-8">
                        <div className="mb-6">
                          <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2 text-lg">Fecha de Cobro (Sábado)</label>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Seleccione un sábado disponible.</p>

                          {/* Month Navigator */}
                          <div className="flex items-center justify-between mb-4 bg-gray-50 dark:bg-gray-700 p-2 rounded-lg">
                            <button
                              onClick={() => {
                                const d = new Date(viewDate);
                                d.setMonth(d.getMonth() - 1);
                                setViewDate(d);
                              }}
                              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full"
                            >
                              <ChevronLeft className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                            </button>
                            <span className="font-bold text-gray-800 dark:text-white text-lg capitalize">
                              {viewDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' })}
                            </span>
                            <button
                              onClick={() => {
                                const d = new Date(viewDate);
                                d.setMonth(d.getMonth() + 1);
                                setViewDate(d);
                              }}
                              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full"
                            >
                              <ChevronRight className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                            </button>
                          </div>

                          {/* Saturday Grid */}
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {getSaturdaysInMonth(viewDate).map(date => {
                              const dateStr = date.toISOString().split('T')[0];
                              const isSelected = selectedCuotaDate === dateStr;
                              return (
                                <button
                                  key={dateStr}
                                  onClick={() => setSelectedCuotaDate(dateStr)}
                                  className={`
                                  flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all
                                  ${isSelected
                                      ? 'border-green-500 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 font-bold shadow-md'
                                      : 'border-gray-200 dark:border-gray-600 hover:border-green-300 dark:hover:border-green-500 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300'
                                    }
                                `}
                                >
                                  <span className="text-xs uppercase">Sábado</span>
                                  <span className="text-2xl">{date.getDate()}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg flex items-start gap-3 mb-8">
                          <AlertCircle className="w-6 h-6 text-blue-600 shrink-0 mt-0.5" />
                          <div>
                            <h4 className="font-semibold text-blue-900 dark:text-blue-100">¿Sabías qué?</h4>
                            <p className="text-sm text-blue-800 dark:text-blue-200 mt-1">
                              Puedes registrar pagos adelantados o pasados seleccionando otra fecha.
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => setCuotaSessionActive(true)}
                          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3"
                        >
                          <CheckCircle className="w-6 h-6" />
                          Comenzar Gestión
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <button
                                onClick={() => setCuotaSessionActive(false)}
                                className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                title="Cambiar Fecha"
                              >
                                <ArrowLeft className="w-6 h-6" />
                              </button>
                              <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                                <Wallet className="w-7 h-7 text-green-600" />
                                Cuotas: {new Date(selectedCuotaDate).toLocaleDateString()}
                              </h2>
                            </div>
                            <p className="text-gray-600 dark:text-gray-300 ml-9">Gstión de pagos semanales de miembros</p>
                          </div>
                          <div className="text-right">
                            <div className="text-3xl font-bold text-green-600">
                              {formatCurrency(cuotaPayments.reduce((sum, p) => sum + p.amount, 0))}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Total Recaudado</div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
                        <div className="flex items-center justify-end flex-wrap gap-4">
                          <div className="flex gap-2">
                            <div className="mr-auto"></div>
                            <button
                              onClick={() => setShowDebtReport(!showDebtReport)}
                              className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2"
                            >
                              <TrendingDown className="w-5 h-5" />
                              {showDebtReport ? 'Ocultar' : 'Ver'} Deudores
                            </button>
                            <button
                              onClick={() => setShowLatePaymentForm(true)}
                              className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2"
                            >
                              Cargos por Mora
                            </button>
                            <button
                              onClick={() => setShowDuesSettings(true)}
                              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2"
                              title="Configuración de Cuotas"
                            >
                              <Settings className="w-5 h-5" />
                              Configuración
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Dues Settings Modal */}
                      {showDuesSettings && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg p-6">
                            <div className="flex justify-between items-center mb-6">
                              <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                                <Settings className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                                Configuración de Cuotas
                              </h3>
                              <button onClick={() => setShowDuesSettings(false)} className="text-gray-500 hover:text-gray-700">
                                <X className="w-6 h-6" />
                              </button>
                            </div>

                            <div className="space-y-6">
                              {/* Start Date Config */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Fecha de Inicio de Cobro:</label>
                                <div className="flex gap-2">
                                  <input
                                    type="date"
                                    value={duesStartDate}
                                    onChange={(e) => setDuesStartDate(e.target.value)}
                                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                  />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Las cuotas se calcularán a partir de esta fecha.</p>
                              </div>

                              <hr className="border-gray-200" />

                              {/* Skipped Saturdays Config */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Sábados Excluidos (Feriados/Cancelados):</label>
                                <div className="flex gap-2 mb-4">
                                  <input
                                    type="date"
                                    value={selectedCuotaDate}
                                    onChange={(e) => setSelectedCuotaDate(e.target.value)}
                                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                  />
                                  <button
                                    onClick={() => {
                                      if (selectedCuotaDate && !skippedSaturdays.includes(selectedCuotaDate)) {
                                        setSkippedSaturdays([...skippedSaturdays, selectedCuotaDate]);
                                      }
                                    }}
                                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium"
                                  >
                                    Excluir
                                  </button>
                                </div>

                                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 max-h-48 overflow-y-auto border border-gray-200 dark:border-gray-600">
                                  {skippedSaturdays.length === 0 ? (
                                    <p className="text-sm text-gray-500 text-center">No hay sábados excluidos</p>
                                  ) : (
                                    <ul className="space-y-2">
                                      {skippedSaturdays.sort().map(date => (
                                        <li key={date} className="flex items-center justify-between bg-white dark:bg-gray-600 p-2 rounded shadow-sm">
                                          <span className="text-sm font-medium text-gray-700 dark:text-white">
                                            {new Date(date).toLocaleDateString()}
                                          </span>
                                          <button
                                            onClick={() => setSkippedSaturdays(skippedSaturdays.filter(d => d !== date))}
                                            className="text-red-500 hover:text-red-700 p-1"
                                            title="Eliminar de lista"
                                          >
                                            <Trash2 className="w-4 h-4" />
                                          </button>
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="mt-8 flex justify-between items-center">
                              <button
                                onClick={handleClearHistory}
                                className="text-red-600 hover:text-red-800 text-sm font-medium hover:underline"
                              >
                                Borrar Historial Completo
                              </button>
                              <button
                                onClick={() => setShowDuesSettings(false)}
                                className="bg-gray-800 hover:bg-gray-900 text-white px-6 py-2 rounded-lg font-medium"
                              >
                                Cerrar
                              </button>
                            </div>
                          </div>
                        </div>
                      )}


                      {showDebtReport && (
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6 border-2 border-orange-200 dark:border-orange-800">
                          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                            <TrendingDown className="w-6 h-6 text-orange-600" />
                            Reporte de Deudores
                          </h3>

                          {getMembersWithDebt().length === 0 ? (
                            <div className="text-center py-8">
                              <div className="text-green-600 text-lg font-semibold mb-2">¡Todo al día! ✓</div>
                              <p className="text-gray-600">No hay miembros con cuotas pendientes</p>
                            </div>
                          ) : (
                            <div className="overflow-x-auto">
                              <table className="w-full">
                                <thead className="bg-orange-50 dark:bg-orange-900/20 border-b dark:border-orange-900/30">
                                  <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-orange-900 dark:text-orange-200 uppercase">Miembro</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-orange-900 dark:text-orange-200 uppercase">Semanas de Atrasho</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-orange-900 dark:text-orange-200 uppercase">Monto Adeudado</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-orange-900 dark:text-orange-200 uppercase">Pagar (Monto)</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-orange-900 dark:text-orange-200 uppercase">Acción</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y">
                                  {getMembersWithDebt().map((member) => (
                                    <tr key={member.id} className="hover:bg-orange-50 dark:hover:bg-orange-900/10">
                                      <td className="px-6 py-4">
                                        <div className="font-medium text-gray-900 dark:text-white">
                                          {member.firstName} {member.lastName}
                                        </div>
                                      </td>
                                      <td className="px-6 py-4">
                                        <span className="px-3 py-1 text-sm font-semibold rounded-full bg-orange-100 text-orange-800">
                                          {member.debt.weeksMissed} semanas
                                        </span>
                                      </td>
                                      <td className="px-6 py-4">
                                        <span className="text-lg font-bold text-orange-600">
                                          {formatCurrency(member.debt.amountOwed)}
                                        </span>
                                      </td>
                                      <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                          <span className="text-gray-500 font-bold">$</span>
                                          <input
                                            type="number"
                                            min="0"
                                            step="1"
                                            placeholder="0"
                                            className="w-24 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 outline-none"
                                            value={bulkPayments[member.id] || ''}
                                            onChange={(e) => setBulkPayments({
                                              ...bulkPayments,
                                              [member.id]: e.target.value
                                            })}
                                          />
                                        </div>
                                      </td>
                                      <td className="px-6 py-4">
                                        <button
                                          onClick={() => handleWaiveDebt(member)}
                                          className="text-red-600 hover:text-red-900 font-medium ml-4"
                                          title="Eliminar deuda (Exonerar)"
                                        >
                                          <Trash2 className="w-5 h-5" />
                                        </button>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                              <div className="p-4 bg-orange-50 dark:bg-orange-900/20 border-t border-orange-100 dark:border-orange-900/30 flex justify-end">
                                <button
                                  onClick={handleBulkSubmit}
                                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-bold shadow-md flex items-center gap-2"
                                >
                                  <DollarSign className="w-5 h-5" />
                                  Registrar Pagos Masivos
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {showLatePaymentForm && (
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6 border-2 border-yellow-200 dark:border-yellow-800">
                          <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-gray-800 dark:text-white">Registrar Cargos por Mora</h3>
                            <button
                              onClick={() => {
                                setShowLatePaymentForm(false);
                                setLatePaymentMember(null);
                              }}
                              className="text-gray-500 hover:text-gray-700"
                            >
                              <X className="w-6 h-6" />
                            </button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Seleccionar Miembro <span className="text-red-500">*</span>
                              </label>
                              <select
                                value={latePaymentMember?.id || ''}
                                onChange={(e) => {
                                  const member = members.find(m => m.id === e.target.value);
                                  setLatePaymentMember(member);
                                }}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              >
                                <option value="">Seleccionar...</option>
                                {members.map(member => (
                                  <option key={member.id} value={member.id}>
                                    {member.firstName} {member.lastName}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Monto por Semana</label>
                              <input
                                type="number"
                                value={cuotaAmount}
                                onChange={(e) => setCuotaAmount(parseFloat(e.target.value) || 0)}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              />
                            </div>
                          </div>

                          {latePaymentMember && (
                            <div className="mt-6">
                              <h4 className="font-semibold text-gray-800 dark:text-white mb-3">Fechas Pendientes:</h4>
                              <div className="max-h-60 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-700">
                                {calculateMemberDebt(latePaymentMember.id).missedDates.map(date => (
                                  <div key={date} className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-600 rounded">
                                    <span className="text-sm text-gray-700 dark:text-gray-200">
                                      {new Date(date).toLocaleDateString('es-ES', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                      })}
                                    </span>
                                    <button
                                      onClick={() => {
                                        recordCuotaPayment(latePaymentMember.id, cuotaAmount, date);
                                      }}
                                      className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded text-sm"
                                    >
                                      Pagar {formatCurrency(cuotaAmount)}
                                    </button>
                                  </div>
                                ))}
                              </div>

                              <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                                <div className="flex items-center justify-between">
                                  <span className="font-medium text-yellow-900 dark:text-yellow-100">Total a Pagar:</span>
                                  <span className="text-xl font-bold text-yellow-600">
                                    {formatCurrency(calculateMemberDebt(latePaymentMember.id).amountOwed)}
                                  </span>
                                </div>
                                <button
                                  onClick={() => {
                                    const debt = calculateMemberDebt(latePaymentMember.id);
                                    debt.missedDates.forEach(date => {
                                      recordCuotaPayment(latePaymentMember.id, cuotaAmount, date);
                                    });
                                    setShowLatePaymentForm(false);
                                    setLatePaymentMember(null);
                                  }}
                                  className="w-full mt-3 bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-lg font-semibold"
                                >
                                  Pagar Todo
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                        {members.length === 0 ? (
                          <div className="text-center py-12">
                            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500 text-lg">No hay miembros aún. Agregue miembros primero.</p>
                          </div>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="w-full">
                              <thead className="bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600">
                                <tr>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Miembro</th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Total Pagado</th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Pagar (Monto)</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y dark:divide-gray-700">
                                {members.map((member) => {
                                  const existingPayment = getCuotaPaymentForMemberAndDate(member.id, selectedCuotaDate);
                                  const totalPaid = getMemberCuotaTotal(member.id);

                                  return (
                                    <tr key={member.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                      <td className="px-6 py-4">
                                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                                          {member.firstName} {member.lastName}
                                        </div>
                                      </td>
                                      <td className="px-6 py-4">
                                        <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                                          {formatCurrency(totalPaid)}
                                        </span>
                                      </td>
                                      <td className="px-6 py-4">
                                        {existingPayment ? (
                                          <div className="flex items-center gap-2">
                                            <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                                              {formatCurrency(existingPayment.amount)}
                                            </span>
                                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                                              ✓ Pagado
                                            </span>
                                          </div>
                                        ) : (
                                          <div className="flex items-center gap-2">
                                            <span className="text-gray-500 font-bold">$</span>
                                            <input
                                              type="number"
                                              min="0"
                                              step="1"
                                              placeholder="0"
                                              className="w-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                              value={bulkPayments[member.id] || ''}
                                              onChange={(e) => setBulkPayments({
                                                ...bulkPayments,
                                                [member.id]: e.target.value
                                              })}
                                            />
                                          </div>
                                        )}
                                      </td>

                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                            <div className="p-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-100 dark:border-gray-600 flex justify-end">
                              <button
                                onClick={handleBulkSubmit}
                                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-bold shadow-md flex items-center gap-2"
                              >
                                <DollarSign className="w-5 h-5" />
                                Registrar Pagos Masivos
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mt-6">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Historial de Pagos</h3>
                        {cuotaPayments.length === 0 ? (
                          <p className="text-gray-500 dark:text-gray-400 text-center py-8">No hay pagos registrados aún.</p>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="w-full">
                              <thead className="bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600">
                                <tr>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Miembro</th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Monto</th>
                                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Acción</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y">
                                {cuotaPayments
                                  .filter(p => !p.paymentMethod || p.paymentMethod !== 'Waiver')
                                  .slice().reverse().map((payment) => {
                                    const member = members.find(m => m.id === payment.memberId);
                                    return (
                                      <tr key={payment.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 text-sm">{new Date(payment.date).toLocaleDateString()}</td>
                                        <td className="px-4 py-3 text-sm">
                                          {member ? `${member.firstName} ${member.lastName} ` : 'Desconocido'}
                                        </td>
                                        <td className="px-4 py-3 text-sm font-semibold text-green-600">
                                          {formatCurrency(payment.amount)}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-right">
                                          <button
                                            onClick={() => handleDeletePayment(payment.id)}
                                            className="text-gray-400 hover:text-red-600 transition-colors"
                                            title="Eliminar registro"
                                          >
                                            <Trash2 className="w-4 h-4" />
                                          </button>
                                        </td>
                                      </tr>
                                    );
                                  })}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </>
              )
            }

            {
              activeModule === 'birthdays' && (
                <div className="space-y-6">
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                          <Gift className="w-7 h-7 text-purple-600" />
                          Cumpleaños
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">Calendario de celebración de vida</p>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-purple-600">{members.length}</div>
                        <div className="text-sm text-gray-500">Miembros</div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {Array.from({ length: 12 }, (_, i) => {
                      const monthDate = new Date(2025, i, 1);
                      const monthName = monthDate.toLocaleString('es-ES', { month: 'long' });
                      const monthMembers = members.filter(m => {
                        if (!m.dateOfBirth) return false;
                        // Safe month extraction using 'UTC' parts to avoid timezone shifts if stored as YYYY-MM-DD
                        // Assuming dateOfBirth is YYYY-MM-DD string
                        const parts = m.dateOfBirth.split('-');
                        if (parts.length === 3) {
                          return parseInt(parts[1]) - 1 === i;
                        }
                        return new Date(m.dateOfBirth).getMonth() === i;
                      }).sort((a, b) => {
                        const dayA = a.dateOfBirth.split('-')[2] || 0;
                        const dayB = b.dateOfBirth.split('-')[2] || 0;
                        return parseInt(dayA) - parseInt(dayB);
                      });

                      return (
                        <div key={i} className={`bg-white dark:bg-gray-800 rounded-lg shadow-md border-t-4 ${monthMembers.length > 0 ? 'border-purple-500' : 'border-gray-200 dark:border-gray-700'}`}>
                          <div className="p-4 bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600 flex justify-between items-center">
                            <h3 className="font-bold text-gray-800 dark:text-white capitalize">{monthName}</h3>
                            <span className={`text-xs px-2 py-1 rounded-full ${monthMembers.length > 0 ? 'bg-purple-100 text-purple-800' : 'bg-gray-200 text-gray-500'}`}>
                              {monthMembers.length}
                            </span>
                          </div>
                          <div className="p-4">
                            {monthMembers.length === 0 ? (
                              <p className="text-sm text-gray-400 italic text-center">Sin cumpleaños</p>
                            ) : (
                              <ul className="space-y-3">
                                {monthMembers.map(member => {
                                  // Extract day safely
                                  const day = member.dateOfBirth.split('-')[2] || '??';

                                  return (
                                    <li key={member.id} className="flex items-center gap-3">
                                      {member.photo ? (
                                        <img src={member.photo} className="w-8 h-8 rounded-full object-cover" alt="" />
                                      ) : (
                                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-400">
                                          <Users className="w-4 h-4" />
                                        </div>
                                      )}
                                      <div>
                                        <div className="text-sm font-medium text-gray-900 dark:text-white">{member.firstName} {member.lastName}</div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                          Día {day} • {calculateAge(member.dateOfBirth)} años
                                        </div>
                                      </div>
                                    </li>
                                  );
                                })}
                              </ul>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )
            }

            {
              (activeModule === 'activities' || activeModule === 'ranking') && !showActivityForm && (
                <>
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
                    {activeModule === 'activities' ? (
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                            <Calendar className="w-7 h-7 text-blue-600" />
                            Actividades & Calendario
                          </h2>
                          <div className="flex items-center gap-4 mt-2">
                            <button
                              onClick={() => setCurrentMonth(new Date(year, month - 1, 1))}
                              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              <ChevronLeft className="w-5 h-5" />
                            </button>
                            <span className="text-lg font-semibold text-gray-700 dark:text-gray-200 capitalize">
                              {new Date(year, month).toLocaleString('es-ES', { month: 'long', year: 'numeric' })}
                            </span>
                            <button
                              onClick={() => setCurrentMonth(new Date(year, month + 1, 1))}
                              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              <ChevronRight className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => setCurrentMonth(new Date())}
                              className="text-xs text-blue-600 hover:underline"
                            >
                              Hoy
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => {
                              setEditingActivity(null);
                              setShowActivityForm(true);
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
                          >
                            <Plus className="w-5 h-5" />
                            Nueva Actividad
                          </button>
                          <div className="text-right">
                            <div className="text-3xl font-bold text-blue-600">{activities.length}</div>
                            <div className="text-sm text-gray-500">Actividades Totales</div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-2xl font-bold text-amber-600 flex items-center gap-2">
                            <Trophy className="w-7 h-7 text-amber-600" />
                            Sistema de Ranking del Club
                          </h2>
                          <p className="text-gray-600 mt-1">Rastrea actividades de alto valor y fechas límite para el ranking del club</p>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-bold text-amber-600">
                            {activities.filter(a => a.isRanking).length}
                          </div>
                          <div className="text-sm text-gray-500">Actividades de Ranking</div>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )
            }

            {/* CLEANING TAB - RENDERED AS MODULE */}
            {
              activeModule === 'cleaning' && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">Cronograma: Miércoles y Viernes</h3>
                    <div className="flex gap-2 items-center">
                      <label className="text-sm text-gray-600 dark:text-gray-400">Generar para:</label>
                      <select
                        className="border rounded px-2 py-1 bg-white dark:bg-gray-700 dark:text-white"
                        id="cleaningMonths"
                      >
                        <option value="1">1 Mes</option>
                        <option value="3">3 Meses</option>
                        <option value="6">6 Meses</option>
                      </select>
                      <input type="date" id="cleaningStart" defaultValue={new Date().toISOString().split('T')[0]} className="border rounded px-2 py-1 bg-white dark:bg-gray-700 dark:text-white" />
                      <button
                        onClick={() => {
                          const months = parseInt(document.getElementById('cleaningMonths').value);
                          const start = document.getElementById('cleaningStart').value;
                          generateCleaningSchedule(start, months);
                        }}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Generar
                      </button>
                      <button
                        onClick={handleClearAllSchedules}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 ml-2 whitespace-nowrap"
                      >
                        <Trash2 className="w-4 h-4" />
                        Eliminar Todos
                      </button>
                    </div>
                  </div>

                  <div className="space-y-8">
                    {cleaningSchedule.length === 0 ? (
                      <div className="text-center py-12 bg-gray-50 dark:bg-gray-700/30 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-600">
                        <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 dark:text-gray-400">No hay cronograma de limpieza generado.</p>
                        <p className="text-sm text-gray-400">Usa el botón de arriba para generar la rotación automática.</p>
                      </div>
                    ) : (
                      cleaningSchedule.map(month => (
                        <div key={month.id} className="border dark:border-gray-700 rounded-xl overflow-hidden">
                          <div className="bg-gray-100 dark:bg-gray-700 p-4 flex justify-between items-center">
                            <h4 className="text-lg font-bold text-indigo-900 dark:text-indigo-200 capitalize">
                              {new Date(month.month + '-02').toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                            </h4>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setCleaningSchedule(prev => prev.filter(m => m.id !== month.id))}
                                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full transition-colors"
                                title="Eliminar este itinerario"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Supervisor:</span>
                              <select
                                value={month.supervisorId}
                                onChange={(e) => {
                                  const newVal = e.target.value;
                                  setCleaningSchedule(prev => prev.map(m => m.id === month.id ? { ...m, supervisorId: newVal } : m));
                                }}
                                className="border rounded px-2 py-1 text-sm bg-white dark:bg-gray-600 dark:text-white dark:border-gray-500"
                              >
                                <option value="">-- Seleccionar Directivo --</option>
                                {/* Assuming Directive members should be here. Or all users. Let's use 'members' filtered by role/position if possible, or all */}
                                {members.filter(m => m.position && m.position !== 'Member' && m.position !== 'Miembro').map(m => (
                                  <option key={m.id} value={m.name}>{m.firstName} {m.lastName} ({m.position})</option>
                                ))}
                                {users.map(u => (
                                  <option key={'u-' + u.username} value={u.name}>{u.name} (Usuario)</option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <div className="divide-y dark:divide-gray-700">
                            {month.weeks.map(week => (
                              <div key={week.id} className="p-4 bg-white dark:bg-gray-800 flex flex-col md:flex-row items-center gap-4">
                                <div className="w-full md:w-1/4">
                                  <div className="font-semibold text-gray-700 dark:text-gray-300">Semana {week.weekRange}</div>
                                  <div className="text-xs text-gray-500">Miércoles y Viernes</div>
                                </div>

                                <div className="flex-1 w-full">
                                  <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                                    {week.team.map(memberId => {
                                      const mem = members.find(m => m.id === memberId);
                                      return mem ? (
                                        <div key={memberId} className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm border ${mem.gender === 'Male' || mem.gender === 'M'
                                          ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800'
                                          : 'bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-900/30 dark:text-pink-300 dark:border-pink-800'
                                          }`}>
                                          <span>{mem.firstName} {mem.lastName}</span>
                                        </div>
                                      ) : <span key={memberId} className="text-red-500 text-xs">Miembro no encontrado</span>;
                                    })}
                                  </div>
                                </div>

                                <div>
                                  <button
                                    title="Marcar como Completado"
                                    onClick={() => {
                                      setCleaningSchedule(prev => prev.map(m => ({
                                        ...m,
                                        weeks: m.weeks.map(w => w.id === week.id ? { ...w, completed: !w.completed } : w)
                                      })));
                                    }}
                                    className={`p-2 rounded-full ${week.completed ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                                  >
                                    <CheckCircle className="w-5 h-5" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )
            }

            {/* Calendar Grid - Only for Activities */}
            {
              activeModule === 'activities' && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mb-6">
                  <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700">
                    {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
                      <div key={day} className="bg-gray-50 dark:bg-gray-800 px-3 py-3 text-center">
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{day}</span>
                      </div>
                    ))}

                    {Array.from({ length: startingDayOfWeek }).map((_, index) => (
                      <div key={`empty - ${index} `} className="bg-gray-50 dark:bg-gray-900/50 min-h-32 p-2"></div>
                    ))}

                    {Array.from({ length: daysInMonth }).map((_, index) => {
                      const day = index + 1;
                      const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                      const currentDate = new Date(dateString + 'T00:00:00');

                      // Filter activities that fall on this day (start date, or within range)
                      const dayActivities = activities.filter(activity => {
                        const startDate = new Date(activity.date + 'T00:00:00');
                        const endDate = activity.endDate ? new Date(activity.endDate + 'T00:00:00') : startDate;
                        return currentDate >= startDate && currentDate <= endDate;
                      }).sort((a, b) => {
                        // PRIMARY SORT: Duration (Longer first)
                        // SECONDARY SORT: ID (Stable sort)
                        const aDuration = (new Date(a.endDate || a.date) - new Date(a.date));
                        const bDuration = (new Date(b.endDate || b.date) - new Date(b.date));
                        if (aDuration !== bDuration) return bDuration - aDuration;
                        return a.id.localeCompare(b.id);
                      });

                      const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();

                      return (
                        <div
                          key={day}
                          className={`bg-white dark:bg-gray-800 min-h-32 border-t border-l dark:border-gray-700 flex flex-col ${isToday ? 'bg-blue-50 dark:bg-blue-900/20' : ''} `}
                        >
                          <div className={`p-2 text-sm font-semibold mb-1 ${isToday ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'} `}>
                            {day}
                            {isToday && <span className="ml-1 text-xs">(Hoy)</span>}
                          </div>
                          <div className="flex-1 flex flex-col gap-[1px]"> {/* Gap 1px to separate stack */}
                            {dayActivities.map(activity => {
                              const startDate = new Date(activity.date + 'T00:00:00');
                              const endDate = activity.endDate ? new Date(activity.endDate + 'T00:00:00') : startDate;

                              const isStart = currentDate.getTime() === startDate.getTime();
                              const isEnd = currentDate.getTime() === endDate.getTime();
                              const isMiddle = !isStart && !isEnd;
                              const isSingleDay = isStart && isEnd;

                              return (
                                <button
                                  key={activity.id}
                                  onClick={() => handleEditActivity(activity)}
                                  className={`
                                text-left px-2 py-1 text-xs border-y 
                                ${getActivityTypeColor(activity.type)} 
                                hover:brightness-95 transition-all
                                ${isSingleDay ? 'mx-1 rounded border-x mb-1' : ''}
                                ${isStart && !isSingleDay ? 'ml-1 mr-0 rounded-l border-l border-r-0 mb-1 z-10' : ''}
                                ${isMiddle ? 'mx-[-1px] rounded-none border-x-0 mb-1 z-0 relative' : ''} 
                                ${isEnd && !isSingleDay ? 'mr-1 ml-0 rounded-r border-r border-l-0 mb-1 z-10' : ''}
                                h-auto min-h-[28px] flex flex-col justify-center
                              `}
                                  style={{
                                    width: isMiddle ? 'calc(100% + 2px)' : 'auto'
                                  }}
                                >
                                  {(isStart || isSingleDay || (new Date(currentDate).getDay() === 0)) && (
                                    <div className="font-medium truncate leading-tight">{activity.title}</div>
                                  )}
                                  {/* Show Details only on start or single day, or maybe blindly if space allows? 
                                  Let's keep it clean: Title always if Start/Single. 
                                  If Middle/End, only showing empty bar color might be confusing if user doesn't see the start.
                                  Let's try showing title on Every Cell but truncated? 
                                  No, continuous visual usually implies text only on first block or if wrapping.
                                  Let's show text on Start, Single, and Sundays (start of week row).
                              */}

                                  {isSingleDay && (
                                    <div className="text-[10px] opacity-75">{activity.time}</div>
                                  )}
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )
            }

            {
              activeModule === 'activities' && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Tipos de Actividad</h4>
                  <div className="flex flex-wrap gap-3">
                    {['Local', 'Distrital', 'Zonal', 'ACD', 'Union', 'Mundial'].map(type => (
                      <div key={type} className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded border ${getActivityTypeColor(type)} `}></div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">{type}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            }



            {/* Ranking Activities List - Only for Ranking Module */}
            {
              activeModule === 'ranking' && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                  <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white">Lista de Actividades de Ranking</h3>
                  </div>
                  {activities.filter(a => a.isRanking).length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                      No se encontraron actividades de ranking.
                    </div>
                  ) : (
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                          <th className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300">Actividad</th>
                          <th className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300">Puntaje</th>
                          <th className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300">Fecha Límite</th>
                          <th className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300">Estado</th>
                          <th className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300 text-right">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {activities.filter(a => a.isRanking).sort((a, b) => new Date(a.date) - new Date(b.date)).map((activity) => {
                          const isPast = new Date(activity.date) < new Date();
                          const deadline = activity.rankingDeadline ? new Date(activity.rankingDeadline) : null;
                          const isDeadlinePast = deadline && deadline < new Date();

                          return (
                            <tr key={activity.id} className="hover:bg-amber-50 dark:hover:bg-amber-900/10">
                              <td className="px-6 py-4">
                                <div className="font-bold text-gray-900 dark:text-white">{activity.title}</div>
                                <div className="text-xs text-gray-500">{new Date(activity.date).toLocaleDateString()}</div>
                              </td>
                              <td className="px-6 py-4">
                                <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-bold border border-amber-200">
                                  🏆 {activity.rankingScore || 0}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                                {activity.rankingDeadline ? new Date(activity.rankingDeadline).toLocaleDateString() : 'Sin Fecha Límite'}
                              </td>
                              <td className="px-6 py-4">
                                {isPast
                                  ? <span className="text-green-600 flex items-center gap-1 font-medium"><CheckCircle className="w-4 h-4" /> Completado</span>
                                  : (isDeadlinePast
                                    ? <span className="text-red-500 font-medium">Vencido</span>
                                    : <span className="text-blue-600 font-medium">Próximo</span>
                                  )
                                }
                              </td>
                              <td className="px-6 py-4 text-right">
                                <button
                                  onClick={() => handleEditActivity(activity)}
                                  className="text-blue-600 hover:text-blue-800 font-medium mr-3"
                                >
                                  Detalles
                                </button>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              )
            }

            {/* Activities List - Standard */}
            {
              activeModule === 'activities' && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Lista de Actividades</h3>
                  <div className="space-y-3 max-h-[600px] overflow-y-auto">
                    {sortedActivities.length === 0 ? (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
                        <Calendar className="w-10 h-10 mx-auto mb-2 opacity-20" />
                        <p>No hay actividades registradas</p>
                      </div>
                    ) : (
                      sortedActivities.map((activity) => (
                        <div key={activity.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center">
                          {/* Left Side: Trophy Icon (Vertically Centered relative to entire card) */}
                          <div className="w-[30px] flex justify-center mr-4 flex-shrink-0 self-center">
                            {activity.isRanking && (
                              <Trophy className="w-5 h-5 text-amber-500" title="Actividad de Ranking" />
                            )}
                          </div>

                          {/* Right Side: Main Content */}
                          <div className="flex-1 min-w-0">
                            {/* Top Row: Title | Type | Status | Actions */}
                            <div className="grid grid-cols-[1fr_100px_140px_auto] gap-4 items-center mb-1">
                              {/* Title */}
                              <div className="font-semibold text-gray-900 dark:text-white truncate" title={activity.title}>
                                {activity.title}
                              </div>

                              {/* Type */}
                              <div className="w-[100px] flex-shrink-0 flex items-center">
                                <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getActivityTypeColor(activity.type)} w-full text-center truncate`}>
                                  {activity.type}
                                </span>
                              </div>

                              {/* Status Selector */}
                              <div className="w-[140px] flex-shrink-0">
                                <select
                                  value={activity.status || 'Pendiente'}
                                  onChange={(e) => handleStatusChange(activity.id, e.target.value)}
                                  className={`w-full px-2 py-0.5 text-xs font-semibold rounded-full border cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1 transition-all ${activity.status === 'Completado' ? 'bg-green-100 text-green-700 border-green-200 focus:ring-green-500' :
                                    activity.status === 'En curso' ? 'bg-blue-100 text-blue-700 border-blue-200 focus:ring-blue-500' :
                                      'bg-yellow-100 text-yellow-700 border-yellow-200 focus:ring-yellow-500'
                                    }`}
                                  onClick={(e) => e.stopPropagation()} // Prevent parent click
                                >
                                  <option value="Pendiente">Pendiente</option>
                                  <option value="En curso" disabled>En curso (Auto)</option>
                                  <option value="Completado">Completado</option>
                                </select>
                              </div>

                              {/* Actions */}
                              <div className="flex gap-2 justify-end">
                                <button
                                  onClick={() => generatePermissionSlip(activity)}
                                  className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white text-sm font-medium flex items-center gap-1 bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 px-3 py-1 rounded"
                                >
                                  <Printer className="w-4 h-4" />
                                  Boleta
                                </button>
                                <button
                                  onClick={() => handleEditActivity(activity)}
                                  className="text-blue-600 hover:text-blue-900 text-sm font-medium flex items-center gap-1"
                                >
                                  Ver <ChevronRight className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteActivity(activity.id)}
                                  className="text-red-600 hover:text-red-900 text-sm font-medium p-1 hover:bg-red-50 rounded"
                                  title="Delete Activity"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>

                            {/* Row 2: Details (Date, Location, Uniform, Postponed) */}
                            <div className="text-xs text-gray-500 flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
                              {/* Date & Time */}
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5 opacity-70" />
                                <span>
                                  {new Date(activity.date).toLocaleDateString('es-ES', {
                                    weekday: 'short',
                                    day: 'numeric',
                                    month: 'short'
                                  })}
                                  {activity.endDate && activity.endDate !== activity.date && (
                                    ` - ${new Date(activity.endDate).toLocaleDateString('es-ES', {
                                      weekday: 'short',
                                      day: 'numeric',
                                      month: 'short'
                                    })}`
                                  )}
                                  {activity.time ? ` • ${activity.time}` : ''}
                                  {activity.endTime ? ` - ${activity.endTime}` : ''}
                                </span>
                              </div>

                              {/* Location */}
                              <div className="flex items-center gap-1 max-w-[200px] truncate" title={activity.location}>
                                <MapPin className="w-3.5 h-3.5 opacity-70" />
                                <span>{activity.location}</span>
                              </div>

                              {/* Uniform */}
                              {activity.uniform && (
                                <div className="flex items-center gap-1">
                                  <Shirt className="w-3.5 h-3.5 opacity-70" />
                                  <span>{activity.uniform}</span>
                                </div>
                              )}

                              {/* Attendees Count */}
                              <div className="flex items-center gap-1">
                                <Users className="w-3.5 h-3.5 opacity-70" />
                                <span>{activity.attendees.length}</span>
                              </div>

                              {/* Postponed Indicator */}
                              {activity.originalDate && activity.originalDate !== activity.date && (
                                <span className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-full bg-red-50 text-red-600 border border-red-100 ml-auto" title={`Fecha original: ${new Date(activity.originalDate).toLocaleDateString()}`}>
                                  <AlertCircle className="w-3 h-3" />
                                  Pospuesto
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )
            }

            {/* Activity Form */}
            {/* Activity Form (Modal) */}
            {(activeModule === 'activities' || activeModule === 'ranking') && showActivityForm && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 transition-opacity animate-in fade-in backdrop-blur-sm">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                  <div className="sticky top-0 bg-white dark:bg-gray-800 p-6 border-b border-gray-100 dark:border-gray-700 z-10 flex items-center justify-between shrink-0">
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
                      {editingActivity ? 'Editar Actividad' : 'Agregar Actividad'}
                    </h3>
                    <button onClick={handleCancelActivity} className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full p-2 transition-colors">
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                  <div className="p-6 overflow-y-auto">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Título <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="title"
                          value={activityFormData.title}
                          onChange={handleActivityInputChange}
                          placeholder="ej., Reunión Semanal, Campamento"
                          className={`w-full px-4 py-2 border rounded-lg ${activityErrors.title ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                        />
                        {activityErrors.title && <p className="text-red-500 text-sm mt-1">{activityErrors.title}</p>}
                      </div>
                      {/* Ranking Section */}
                      <div className="md:col-span-2 bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                        <div className="flex items-center gap-2 mb-4">
                          <input
                            type="checkbox"
                            id="isRanking"
                            name="isRanking"
                            checked={activityFormData.isRanking}
                            onChange={(e) => setActivityFormData(prev => ({ ...prev, isRanking: e.target.checked }))}
                            className="w-5 h-5 text-yellow-600 rounded focus:ring-yellow-500"
                          />
                          <label htmlFor="isRanking" className="font-bold text-gray-800 dark:text-white flex items-center gap-2 cursor-pointer">
                            <Trophy className="w-5 h-5 text-yellow-600" />
                            Incluir en el Sistema de Ranking del Club
                          </label>
                        </div>

                        {activityFormData.isRanking && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-7">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Puntos de Puntaje
                              </label>
                              <input
                                type="number"
                                name="rankingScore"
                                value={activityFormData.rankingScore}
                                onChange={handleActivityInputChange}
                                placeholder="e.g. 500"
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Fecha Límite
                              </label>
                              <input
                                type="date"
                                name="rankingDeadline"
                                value={activityFormData.rankingDeadline}
                                onChange={handleActivityInputChange}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                      {/* Status and Type Row */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-2">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Estado
                          </label>
                          <select
                            name="status"
                            value={activityFormData.status || 'Pendiente'}
                            onChange={handleActivityInputChange}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          >
                            <option value="Pendiente">Pendiente</option>
                            <option value="En curso" disabled>En curso (Auto)</option>
                            <option value="Completado">Completado</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Nivel <span className="text-red-500">*</span>
                          </label>
                          <select
                            name="type"
                            value={activityFormData.type}
                            onChange={handleActivityInputChange}
                            className={`w-full px-4 py-2 border rounded-lg ${activityErrors.type ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                          >
                            <option value="">Seleccionar</option>
                            <option value="Local">Local</option>
                            <option value="Distrital">Distrital</option>
                            <option value="Zonal">Zonal</option>
                            <option value="ACD">ACD</option>
                            <option value="Union">Union</option>
                            <option value="Mundial">Mundial</option>
                          </select>
                          {activityErrors.type && <p className="text-red-500 text-sm mt-1">{activityErrors.type}</p>}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Fecha Inicio <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          name="date"
                          value={activityFormData.date}
                          onChange={handleActivityInputChange}
                          className={`w-full px-4 py-2 border rounded-lg ${activityErrors.date ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                        />
                        {activityErrors.date && <p className="text-red-500 text-sm mt-1">{activityErrors.date}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Fecha Cierre (Opcional)
                        </label>
                        <input
                          type="date"
                          name="endDate"
                          value={activityFormData.endDate || ''}
                          onChange={handleActivityInputChange}
                          min={activityFormData.date} // Cannot be before start date
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Hora (Opcional)
                        </label>
                        <input
                          type="time"
                          name="time"
                          value={activityFormData.time}
                          onChange={handleActivityInputChange}
                          className={`w-full px-4 py-2 border rounded-lg ${activityErrors.time ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                        />
                        {activityErrors.time && <p className="text-red-500 text-sm mt-1">{activityErrors.time}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Hora Final (Opcional)
                        </label>
                        <input
                          type="time"
                          name="endTime"
                          value={activityFormData.endTime || ''}
                          onChange={handleActivityInputChange}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Ubicación <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="location"
                          value={activityFormData.location}
                          onChange={handleActivityInputChange}
                          placeholder="ej., Salón de la Iglesia"
                          className={`w-full px-4 py-2 border rounded-lg ${activityErrors.location ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                        />
                        {activityErrors.location && <p className="text-red-500 text-sm mt-1">{activityErrors.location}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Uniforme</label>
                        <select
                          name="uniform"
                          value={activityFormData.uniform}
                          onChange={handleActivityInputChange}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                          <option value="">Seleccionar (Opcional)</option>
                          <option value="Type A">Tipo A</option>
                          <option value="Type B">Tipo B</option>
                          <option value="Type C">Tipo C</option>
                          <option value="Sports">Deportes</option>
                          <option value="Formal">Formal</option>
                        </select>
                      </div>

                      {/* Logistics Section */}
                      <div className="md:col-span-2 pt-4 border-t border-gray-200 dark:border-gray-600">
                        <h4 className="font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                          <MapPin className="w-5 h-5 text-gray-500" />
                          Logística y Detalles
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Costo ($)
                            </label>
                            <input
                              type="number"
                              name="cost"
                              value={activityFormData.cost}
                              onChange={handleActivityInputChange}
                              placeholder="0.00"
                              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Transporte
                            </label>
                            <input
                              type="text"
                              name="transportation"
                              value={activityFormData.transportation}
                              onChange={handleActivityInputChange}
                              placeholder="ej. Autobús, Padres"
                              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Punto de Encuentro
                            </label>
                            <input
                              type="text"
                              name="meetingPoint"
                              value={activityFormData.meetingPoint}
                              onChange={handleActivityInputChange}
                              placeholder="ej. Estacionamiento de la Iglesia"
                              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
                        <textarea
                          name="description"
                          value={activityFormData.description}
                          onChange={handleActivityInputChange}
                          rows="3"
                          placeholder="Detalles sobre la actividad..."
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Asistentes (Opcional)</label>
                        {members.length === 0 ? (
                          <p className="text-gray-500 text-sm">No hay miembros disponibles. Agrega miembros primero.</p>
                        ) : (
                          <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 max-h-60 overflow-y-auto bg-gray-50 dark:bg-gray-700">
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                              {members.map((member) => (
                                <label key={member.id} className="flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={activityFormData.attendees.includes(member.id)}
                                    onChange={() => handleAttendeeToggle(member.id)}
                                    className="w-4 h-4 text-blue-600"
                                  />
                                  <span className="text-sm text-gray-700 dark:text-gray-300">
                                    {member.firstName} {member.lastName}
                                  </span>
                                </label>
                              ))}
                            </div>
                          </div>
                        )}
                        <p className="text-xs text-gray-500 mt-2">
                          {activityFormData.attendees.length} seleccionados
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4 mt-8">
                      <button
                        onClick={handleActivitySubmit}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center justify-center gap-2"
                      >
                        <Save className="w-5 h-5" />
                        {editingActivity ? 'Actualizar' : 'Guardar'}
                      </button>
                      <button
                        onClick={handleCancelActivity}
                        className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
                      >
                        Cancelar
                      </button>
                      {editingActivity && (
                        <button
                          onClick={() => handleDeleteActivity(editingActivity.id)}
                          className="px-6 py-3 border border-red-300 rounded-lg font-medium text-red-600 hover:bg-red-50 flex items-center justify-center gap-2"
                        >
                          <Trash2 className="w-5 h-5" />
                          Eliminar
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ID Cards Module */}
            {activeModule === 'idcards' && (
              <div>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        <IdCard className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
                        Generador de Carnets
                      </h2>
                      <p className="text-gray-600 dark:text-gray-400 mt-1">Selecciona los miembros para generar sus carnets</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {selectedForIdCard.length} seleccionados
                      </span>
                      <button
                        onClick={() => {
                          if (selectedForIdCard.length === members.length) {
                            setSelectedForIdCard([]);
                          } else {
                            setSelectedForIdCard(members.map(m => m.id));
                          }
                        }}
                        className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg font-medium transition-colors"
                      >
                        {selectedForIdCard.length === members.length ? 'Deseleccionar Todos' : 'Seleccionar Todos'}
                      </button>
                      <button
                        onClick={() => printIdCards(selectedForIdCard)}
                        disabled={selectedForIdCard.length === 0}
                        className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors ${selectedForIdCard.length > 0
                          ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                          }`}
                      >
                        <Printer className="w-4 h-4" />
                        Imprimir Carnets
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {members.map((member) => {
                      const isSelected = selectedForIdCard.includes(member.id);
                      return (
                        <div
                          key={member.id}
                          onClick={() => {
                            if (isSelected) {
                              setSelectedForIdCard(prev => prev.filter(id => id !== member.id));
                            } else {
                              setSelectedForIdCard(prev => [...prev, member.id]);
                            }
                          }}
                          className={`cursor-pointer border-2 rounded-lg p-4 flex gap-4 items-center transition-all ${isSelected
                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 dark:border-indigo-400'
                            : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                            }`}
                        >
                          <div className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${isSelected
                            ? 'bg-indigo-600 border-indigo-600 text-white'
                            : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600'
                            }`}>
                            {isSelected && <Check className="w-3 h-3" />}
                          </div>

                          <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden flex-shrink-0 border border-gray-200 dark:border-gray-600">
                            {member.photo ? (
                              <img src={member.photo} alt={member.firstName} className="w-full h-full object-cover" />
                            ) : (
                              <Users className="w-6 h-6 text-gray-400 m-auto mt-2.5" />
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-bold text-gray-800 dark:text-white truncate">
                              {member.firstName} {member.lastName}
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {translatePosition(member.position, member.gender) || member.pathfinderClass || 'Miembro'}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}


            {/* Reports Module */}
            {
              activeModule === 'reports' && (
                <div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                          <BarChart3 className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
                          Reportes y Estadísticas
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">Visión general del estado del club</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {/* Membership Stats */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                      <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                        <Users className="w-5 h-5 text-blue-600" />
                        Miembros por Clase
                      </h3>
                      <div className="space-y-3">
                        {pathfinderClasses.map(pc => {
                          const count = members.filter(m => m.pathfinderClass === pc.value).length;
                          if (count === 0) return null;
                          return (
                            <div key={pc.value} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                              <span className="text-gray-700 dark:text-gray-300 font-medium">{pc.label}</span>
                              <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-3 py-1 rounded-full text-xs font-bold">{count}</span>
                            </div>
                          );
                        })}
                        <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                          <span className="text-gray-700 dark:text-gray-300 font-medium">Sin Clase Asignada</span>
                          <span className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 px-3 py-1 rounded-full text-xs font-bold">
                            {members.filter(m => !m.pathfinderClass).length}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                      <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                        <Grid className="w-5 h-5 text-teal-600" />
                        Miembros por Unidad
                      </h3>
                      <div className="space-y-3">
                        {(() => {
                          const counts = {};
                          members.forEach(m => {
                            const unit = units.find(u => u.id === m.unitId);
                            const name = unit ? unit.name : 'Sin Unidad';
                            counts[name] = (counts[name] || 0) + 1;
                          });
                          return Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([name, count]) => (
                            <div key={name} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                              <span className="text-gray-700 dark:text-gray-300 font-medium">{name}</span>
                              <span className="bg-teal-100 dark:bg-teal-900/30 text-teal-800 dark:text-teal-300 px-3 py-1 rounded-full text-xs font-bold">{count}</span>
                            </div>
                          ));
                        })()}
                      </div>
                    </div>

                    {/* Productivity / Activities Report */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                      <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                        <Target className="w-5 h-5 text-green-600" />
                        Productividad del Club (Actividades)
                      </h3>
                      <div className="flex flex-col items-center justify-center h-64">
                        {activities.length === 0 ? (
                          <p className="text-gray-500">No hay actividades registradas</p>
                        ) : (
                          <>
                            <div className="relative w-48 h-48">
                              <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                  <Pie
                                    data={[
                                      { name: 'Completadas', value: activities.filter(a => a.status === 'Completado').length, fill: '#10B981' }, // Green
                                      { name: 'Pendientes/En Curso', value: activities.filter(a => a.status !== 'Completado').length, fill: '#E5E7EB' } // Gray
                                    ]}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    startAngle={90}
                                    endAngle={-270}
                                    dataKey="value"
                                  >
                                    <Cell key="cell-0" fill="#10B981" />
                                    <Cell key="cell-1" fill="#E5E7EB" />
                                  </Pie>
                                </PieChart>
                              </ResponsiveContainer>
                              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-4xl font-bold text-gray-800 dark:text-white">
                                  {Math.round((activities.filter(a => a.status === 'Completado').length / activities.length) * 100)}%
                                </span>
                                <span className="text-xs text-gray-500 uppercase font-semibold">Completado</span>
                              </div>
                            </div>
                            <div className="mt-4 flex gap-6 text-sm">
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                <span className="text-gray-600 dark:text-gray-300">
                                  {activities.filter(a => a.status === 'Completado').length} Completadas
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-gray-200"></div>
                                <span className="text-gray-600 dark:text-gray-300">
                                  {activities.length} Totales
                                </span>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Financial Reports */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
                      Reporte Financiero Mensual
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-green-50 dark:bg-green-900/20 border-b dark:border-green-900/30">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-green-900 dark:text-green-300 uppercase">Mes</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-green-900 dark:text-green-300 uppercase">Ingresos</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-green-900 dark:text-green-300 uppercase">Gastos</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-green-900 dark:text-green-300 uppercase">Balance</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y dark:divide-gray-700">
                          {monthlyReport.map((item, index) => (
                            <tr key={index} className="hover:bg-green-50 dark:hover:bg-green-900/10">
                              <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{item.month}</td>
                              <td className="px-6 py-4 text-green-600 dark:text-green-400">{formatCurrency(item.income)}</td>
                              <td className="px-6 py-4 text-red-600 dark:text-red-400">{formatCurrency(item.expense)}</td>
                              <td className={`px-6 py-4 font-bold ${item.income - item.expense >= 0 ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'} `}>
                                {formatCurrency(item.income - item.expense)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )
            }

            {/* Master Guide Program Module */}
            {
              activeModule === 'master_guide' && (
                <div>
                  {/* Navigation / Header */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                          <Award className="w-7 h-7 text-amber-600 dark:text-amber-400" />
                          Programa de Guía Mayor
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">Gestión de requisitos y aspirantes</p>
                      </div>
                      {viewingGMDetail && (
                        <button
                          onClick={() => setViewingGMDetail(null)}
                          className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          <ArrowLeft className="w-5 h-5" />
                          Volver
                        </button>
                      )}
                    </div>
                  </div>

                  {/* VIEW: Requirements Management */}
                  {viewingGMDetail === 'requirements' ? (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                      <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
                        <CheckSquare className="w-6 h-6 text-indigo-600" />
                        Administrar Requisitos
                      </h3>

                      {/* Add Requirement Form */}
                      <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg border border-gray-200 dark:border-gray-600 mb-8">
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="font-semibold text-gray-700 dark:text-white">{editingRequirement ? 'Editar Requisito' : 'Agregar Nuevo Requisito'}</h4>
                          {editingRequirement && (
                            <button
                              onClick={() => setEditingRequirement(null)}
                              className="text-sm text-gray-500 hover:text-gray-700 underline"
                            >
                              Cancelar Edición
                            </button>
                          )}
                        </div>
                        <form onSubmit={(e) => {
                          e.preventDefault();
                          const formData = new FormData(e.target);

                          if (editingRequirement) {
                            setMasterGuideData(prev => ({
                              ...prev,
                              requirements: prev.requirements.map(r => r.id === editingRequirement.id ? {
                                ...r,
                                text: formData.get('text'),
                                evidence: formData.get('evidence'),
                                evaluation: formData.get('evaluation'),
                                activityDate: formData.get('activityDate')
                              } : r)
                            }));
                            setEditingRequirement(null);
                          } else {
                            const newReq = {
                              id: Date.now().toString(),
                              text: formData.get('text'),
                              evidence: formData.get('evidence'),
                              evaluation: formData.get('evaluation'),
                              activityDate: formData.get('activityDate')
                            };
                            setMasterGuideData(prev => ({
                              ...prev,
                              requirements: [...prev.requirements, newReq]
                            }));
                          }
                          e.target.reset();
                        }}>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div className="md:col-span-2">
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Requisito</label>
                              <textarea
                                name="text"
                                required
                                rows="3"
                                className="w-full px-3 py-2 border rounded-lg resize-y bg-white dark:bg-gray-600 text-gray-900 dark:text-white border-gray-300 dark:border-gray-500"
                                placeholder="Ej: Leer el libro..."
                                defaultValue={editingRequirement?.text || ''}
                                key={editingRequirement ? `text-${editingRequirement.id} ` : 'text-new'}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Evaluación</label>
                              <select
                                name="evaluation"
                                required
                                className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-600 text-gray-900 dark:text-white border-gray-300 dark:border-gray-500"
                                defaultValue={editingRequirement?.evaluation || 'first'}
                                key={editingRequirement ? `eval - ${editingRequirement.id} ` : 'eval-new'}
                              >
                                <option value="first">Primera Evaluación</option>
                                <option value="second">Segunda Evaluación</option>
                                <option value="third">Tercera Evaluación</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha de Actividad (Opcional)</label>
                              <input
                                name="activityDate"
                                type="date"
                                className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-600 text-gray-900 dark:text-white border-gray-300 dark:border-gray-500"
                                defaultValue={editingRequirement?.activityDate || ''}
                                key={editingRequirement ? `date - ${editingRequirement.id} ` : 'date-new'}
                              />
                            </div>
                            <div className="md:col-span-3">
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Forma de Evidencia</label>
                              <input
                                name="evidence"
                                required
                                type="text"
                                className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-600 text-gray-900 dark:text-white border-gray-300 dark:border-gray-500"
                                placeholder="Ej: Informe de lectura, Certificado..."
                                defaultValue={editingRequirement?.evidence || ''}
                                key={editingRequirement ? `evidence - ${editingRequirement.id} ` : 'evidence-new'}
                              />
                            </div>
                          </div>
                          <button type="submit" className={`px-4 py-2 text-white rounded-lg font-medium shadow-md ${editingRequirement ? 'bg-orange-600 hover:bg-orange-700' : 'bg-indigo-600 hover:bg-indigo-700'} `}>
                            {editingRequirement ? 'Guardar Cambios' : 'Agregar Requisito'}
                          </button>
                        </form>
                      </div>

                      {/* Requirements List */}

                    </div>
                  ) : viewingGMDetail ? (
                    // VIEW: Member Progress Detail
                    (() => {
                      const member = members.find(m => m.id === viewingGMDetail);
                      if (!member) return <div>Miembro no encontrado</div>;

                      const toggleRequirement = (reqId) => {
                        setMasterGuideData(prev => {
                          const memberProgress = prev.progress[member.id] || {};
                          const currentStatus = memberProgress[reqId];
                          const isCompleted = currentStatus?.completed;

                          return {
                            ...prev,
                            progress: {
                              ...prev.progress,
                              [member.id]: {
                                ...memberProgress,
                                [reqId]: {
                                  completed: !isCompleted,
                                  date: new Date().toISOString()
                                }
                              }
                            }
                          };
                        });
                      };

                      return (
                        <div className="space-y-6">
                          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 flex items-center gap-4">
                            <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden flex-shrink-0">
                              {member.photo ? <img src={member.photo} className="w-full h-full object-cover" /> : <Users className="w-8 h-8 m-auto mt-4 text-gray-400" />}
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-gray-800 dark:text-white">{member.firstName} {member.lastName}</h3>
                              <p className="text-amber-600 dark:text-amber-400 font-medium">Aspirante a Guía Mayor</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {['first', 'second', 'third'].map((period, idx) => (
                              <div key={period} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                                <div className="bg-amber-600 px-4 py-3 text-white font-bold flex justify-between items-center">
                                  <div className="flex items-center gap-2">
                                    <span>{idx + 1}ª Evaluación</span>
                                    {masterGuideData.evaluationDates[period] && (
                                      <span className="text-xs bg-amber-700 px-2 py-1 rounded">{masterGuideData.evaluationDates[period]}</span>
                                    )}
                                  </div>
                                  <button
                                    onClick={() => {
                                      if (confirm(`¿Marcar TODA la ${idx + 1}ª evaluación como completada para ${member.firstName}?`)) {
                                        setMasterGuideData(prev => {
                                          const reqsInPeriod = prev.requirements.filter(r => r.evaluation === period);
                                          const memberProgress = { ...(prev.progress[member.id] || {}) };

                                          reqsInPeriod.forEach(req => {
                                            memberProgress[req.id] = { completed: true, date: new Date().toISOString() };
                                          });

                                          return {
                                            ...prev,
                                            progress: { ...prev.progress, [member.id]: memberProgress }
                                          };
                                        });
                                      }
                                    }}
                                    className="text-xs bg-white text-amber-700 px-2 py-1 rounded hover:bg-gray-100 flex items-center gap-1 font-bold"
                                    title="Marcar todo como completado"
                                  >
                                    <CheckCircle className="w-3 h-3" /> Completar
                                  </button>
                                </div>
                                <div className="p-4 space-y-4">
                                  {masterGuideData.requirements.filter(r => r.evaluation === period).map(req => {
                                    const isCompleted = masterGuideData?.progress?.[member.id]?.[req.id]?.completed;
                                    return (
                                      <label key={req.id} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer transition-colors border border-transparent hover:border-gray-200 dark:hover:border-gray-500">
                                        <div className="pt-0.5">
                                          <input
                                            type="checkbox"
                                            checked={!!isCompleted}
                                            onChange={() => toggleRequirement(req.id)}
                                            className="w-5 h-5 text-amber-600 rounded focus:ring-amber-500"
                                          />
                                        </div>
                                        <div>
                                          <div className={`font-medium whitespace-pre-wrap ${isCompleted ? 'text-gray-500 line-through' : 'text-gray-800'} `}>
                                            {req.text}
                                          </div>
                                          <div className="text-xs text-gray-500 mt-1">Evidencia: {req.evidence}</div>
                                        </div>
                                      </label>
                                    );
                                  })}
                                  {masterGuideData.requirements.filter(r => r.evaluation === period).length === 0 && (
                                    <div className="text-center text-gray-400 text-sm py-4">Sin requisitos asignados</div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })()
                  ) : (
                    // VIEW: Dashboard & Member List
                    <div className="space-y-6">
                      {/* Settings Card */}
                      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                          <h3 className="text-lg font-bold text-gray-800 dark:text-white">Fechas de Evaluación</h3>
                          <button
                            onClick={() => setViewingGMDetail('requirements')}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                          >
                            <Settings className="w-5 h-5" />
                            Administrar Requisitos
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {['first', 'second', 'third'].map((period, idx) => (
                            <div key={period}>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{idx + 1}ª Evaluación</label>
                              <input
                                type="date"
                                value={masterGuideData.evaluationDates[period]}
                                onChange={(e) => setMasterGuideData(prev => ({
                                  ...prev,
                                  evaluationDates: { ...prev.evaluationDates, [period]: e.target.value }
                                }))}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Added Requirements List (Moved) */}
                      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                          <CheckSquare className="w-5 h-5 text-indigo-600" />
                          Requisitos Agregados
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {['first', 'second', 'third'].map((period, idx) => (
                            <div key={period} className="border dark:border-gray-600 rounded-lg overflow-hidden flex flex-col">
                              <div className="bg-gray-100 dark:bg-gray-700 px-4 py-2 border-b dark:border-gray-600 font-bold text-gray-700 dark:text-gray-200">
                                {idx + 1}ª Evaluación
                              </div>
                              <div className="divide-y dark:divide-gray-700 flex-grow bg-gray-50 dark:bg-gray-800 max-h-60 overflow-y-auto">
                                {masterGuideData.requirements.filter(r => r.evaluation === period).map(req => (
                                  <div key={req.id} className="p-3 flex items-start justify-between hover:bg-white dark:hover:bg-gray-700 transition-colors group">
                                    <div className="text-sm">
                                      <p className="font-medium text-gray-900 dark:text-gray-200 whitespace-pre-wrap">{req.text}</p>
                                      <div className="flex gap-2 text-xs mt-0.5">
                                        <span className="text-gray-500">Evidencia: {req.evidence}</span>
                                        {req.activityDate && (
                                          <span className="text-amber-600 font-semibold">
                                            📅 {new Date(req.activityDate + 'T00:00:00').toLocaleDateString()}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex gap-1">
                                      <button
                                        onClick={() => {
                                          setEditingRequirement(req);
                                          setViewingGMDetail('requirements');
                                        }}
                                        className="text-gray-400 hover:text-indigo-600 p-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity"
                                        title="Editar"
                                      >
                                        <Edit2 className="w-4 h-4" />
                                      </button>
                                      <button
                                        onClick={() => {
                                          if (confirm('¿Eliminar requisito?')) {
                                            setMasterGuideData(prev => ({
                                              ...prev,
                                              requirements: prev.requirements.filter(r => r.id !== req.id)
                                            }));
                                          }
                                        }}
                                        className="text-gray-400 hover:text-red-500 p-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity"
                                        title="Eliminar"
                                      >
                                        <X className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                                {masterGuideData.requirements.filter(r => r.evaluation === period).length === 0 && (
                                  <div className="p-4 text-center text-gray-400 text-xs italic">Sin requisitos</div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Aspirants List */}
                      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                          <Users className="w-5 h-5 text-amber-600" />
                          Aspirantes a Guía Mayor
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {members.filter(m => m.pathfinderClass === 'Master Guide' || m.isMasterGuideCandidate).map(member => {
                            // Calculate Progress
                            const totalReqs = masterGuideData.requirements.length;
                            const completedReqs = Object.values(masterGuideData.progress[member.id] || {}).filter(p => p.completed).length;
                            const progressPercent = totalReqs > 0 ? Math.round((completedReqs / totalReqs) * 100) : 0;

                            return (
                              <div key={member.id} className="border dark:border-gray-600 rounded-lg p-5 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                <div className="flex items-center gap-4 mb-4">
                                  <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden flex-shrink-0">
                                    {member.photo ? <img src={member.photo} className="w-full h-full object-cover" /> : <Users className="w-6 h-6 m-auto mt-3 text-gray-400" />}
                                  </div>
                                  <div className="min-w-0">
                                    <h4 className="font-bold text-gray-900 dark:text-white truncate">{member.firstName} {member.lastName}</h4>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{member.unitId ? (units.find(u => u.id === member.unitId)?.name || 'Sin Unidad') : 'Sin Unidad'}</p>
                                  </div>
                                </div>

                                <div className="mb-4">
                                  <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-600 dark:text-gray-400">Progreso General</span>
                                    <span className="font-bold text-amber-600 dark:text-amber-500">{progressPercent}%</span>
                                  </div>
                                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                    <div className="bg-amber-500 h-2 rounded-full" style={{ width: `${progressPercent}% ` }}></div>
                                  </div>
                                </div>

                                <button
                                  onClick={() => setViewingGMDetail(member.id)}
                                  className="w-full py-2 bg-amber-50 text-amber-700 font-medium rounded-lg border border-amber-200 hover:bg-amber-100 transition-colors dark:bg-gray-700 dark:text-amber-400 dark:border-gray-600 dark:hover:bg-gray-600"
                                >
                                  Gestionar Progreso
                                </button>
                              </div>
                            );
                          })}
                          {members.filter(m => m.pathfinderClass === 'Master Guide' || m.isMasterGuideCandidate).length === 0 && (
                            <div className="col-span-full py-12 text-center bg-gray-50 rounded-lg border border-dashed border-gray-300">
                              <Award className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                              <p className="text-gray-500">No hay miembros registrados como "Aspirante a Guía Mayor"</p>
                              <p className="text-sm text-gray-400 mt-1">Edita un miembro y asignale la clase "Aspirante a Guía Mayor" para verlo aquí.</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            }

            {
              activeModule === 'settings' && (
                <div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                          <Settings className="w-7 h-7 text-gray-600 dark:text-gray-400" />
                          Configuración y Gestión de Datos
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">Respalda, restaura y configura tu sistema</p>
                      </div>
                    </div>
                  </div>



                  {/* Club Identity Settings */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                      <ImageIcon className="w-5 h-5 text-indigo-600" />
                      Identidad del Club
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Nombre del Club
                        </label>
                        <input
                          type="text"
                          value={clubSettings.name}
                          onChange={(e) => setClubSettings(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                          placeholder="Ej. Unity Club"
                        />
                        <p className="text-xs text-gray-500 mt-1">Este nombre aparecerá en la barra lateral y encabezados.</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Logo del Club
                        </label>
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 flex items-center justify-center overflow-hidden">
                            {clubSettings.logo ? (
                              <img src={clubSettings.logo} alt="Preview" className="w-full h-full object-contain" />
                            ) : (
                              <div className="w-full h-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                                <span className="text-2xl font-bold text-gray-400 dark:text-gray-500">
                                  {(clubSettings.name || 'C').charAt(0).toUpperCase()}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleLogoUpload}
                              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-indigo-900/30 dark:file:text-indigo-300"
                            />
                            <div className="flex gap-2 mt-2">
                              {clubSettings.logo && (
                                <button
                                  onClick={() => setClubSettings(prev => ({ ...prev, logo: '' }))}
                                  className="text-xs text-red-600 hover:text-red-800 dark:text-red-400 font-medium flex items-center gap-1"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Eliminar Logo
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Data Management Section */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Local Storage Status */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                      <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                        <Save className="w-5 h-5 text-blue-600" />
                        Estado de Almacenamiento Local
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                          <span className="font-medium text-gray-700 dark:text-gray-300">Miembros</span>
                          <span className="text-blue-700 dark:text-blue-300 font-bold">{members.length}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded">
                          <span className="font-medium text-gray-700 dark:text-gray-300">Transacciones</span>
                          <span className="text-green-700 dark:text-green-300 font-bold">{transactions.length}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded">
                          <span className="font-medium text-gray-700 dark:text-gray-300">Actividades</span>
                          <span className="text-purple-700 dark:text-purple-300 font-bold">{activities.length}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                          <span className="font-medium text-gray-700 dark:text-gray-300">Registros de Puntos</span>
                          <span className="text-yellow-700 dark:text-yellow-300 font-bold">{points.length}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-teal-50 dark:bg-teal-900/20 rounded">
                          <span className="font-medium text-gray-700 dark:text-gray-300">Unidades</span>
                          <span className="text-teal-700 dark:text-teal-300 font-bold">{units.length}</span>
                        </div>
                        <div className="mt-4 p-3 bg-green-100 dark:bg-green-900/40 border border-green-300 dark:border-green-800 rounded">
                          <p className="text-sm text-green-800 dark:text-green-200 font-semibold">✅ Autoguardado activado</p>
                          <p className="text-xs text-green-700 dark:text-green-300 mt-1">Todos los cambios se guardan automáticamente en tu navegador</p>
                        </div>
                      </div>
                    </div>

                    {/* Backup & Restore */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                      <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-orange-600" />
                        Respaldo y Restauración
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <button
                            onClick={exportAllData}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center justify-center gap-2"
                          >
                            <TrendingDown className="w-5 h-5" />
                            Descargar Respaldo Completo
                          </button>
                          <p className="text-xs text-gray-500 mt-2">
                            Incluye todos los datos con fotos y logos
                          </p>
                        </div>

                        <div>
                          <button
                            onClick={exportDataWithoutPhotos}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium flex items-center justify-center gap-2"
                          >
                            <TrendingDown className="w-5 h-5" />
                            Descargar Respaldo (Sin Fotos)
                          </button>
                          <p className="text-xs text-gray-500 mt-2">
                            Respaldo más ligero sin fotos (recomendado si falla el respaldo)
                          </p>
                        </div>

                        <div>
                          <input
                            type="file"
                            accept=".json"
                            id="import-data"
                            className="hidden"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                importAllData(e.target.files[0]);
                              }
                            }}
                          />
                          <label
                            htmlFor="import-data"
                            className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium flex items-center justify-center gap-2 cursor-pointer"
                          >
                            <TrendingUp className="w-5 h-5" />
                            Restaurar desde Respaldo
                          </label>
                          <p className="text-xs text-gray-500 mt-2">
                            Importar datos desde un archivo de respaldo anterior
                          </p>
                        </div>

                        <div className="border-t pt-4">
                          <button
                            onClick={clearAllData}
                            className="w-full bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium flex items-center justify-center gap-2"
                          >
                            <Trash2 className="w-5 h-5" />
                            Borrar Todos los Datos
                          </button>
                          <p className="text-xs text-red-600 mt-2 font-semibold">
                            ⚠️ Advertencia: ¡Esta acción no se puede deshacer!
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Firebase Cloud Sync - Coming Soon */}
                  <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-lg shadow-md p-6 border-2 border-orange-200 dark:border-orange-800">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                      <Settings className="w-5 h-5 text-orange-600" />
                      Sincronización en la Nube (Firebase) - Listo para Configurar
                    </h3>

                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4">
                      <p className="text-gray-700 dark:text-gray-300 mb-3">
                        ¡Tu sistema está <strong>listo para la integración con Firebase</strong>! Sigue estos pasos para habilitar la sincronización en la nube:
                      </p>

                      <div className="space-y-3 text-sm">
                        <div className="flex gap-3">
                          <div className="flex-shrink-0 w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold">1</div>
                          <div>
                            <p className="font-semibold text-gray-800 dark:text-white">Crear Proyecto Firebase</p>
                            <p className="text-gray-600 dark:text-gray-400">Ve a <a href="https://console.firebase.google.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 underline">console.firebase.google.com</a></p>
                            <p className="text-gray-600 dark:text-gray-400">Haz clic en "Agregar proyecto" y sigue el asistente</p>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <div className="flex-shrink-0 w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold">2</div>
                          <div>
                            <p className="font-semibold text-gray-800 dark:text-white">Habilitar Base de Datos Firestore</p>
                            <p className="text-gray-600 dark:text-gray-400">En tu proyecto Firebase, ve a "Firestore Database"</p>
                            <p className="text-gray-600 dark:text-gray-400">Haz clic en "Crear base de datos" y selecciona "Comenzar en modo de prueba"</p>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <div className="flex-shrink-0 w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold">3</div>
                          <div>
                            <p className="font-semibold text-gray-800 dark:text-white">Obtener Claves de Configuración</p>
                            <p className="text-gray-600 dark:text-gray-400">Ve a Configuración del Proyecto → General</p>
                            <p className="text-gray-600 dark:text-gray-400">Desplázate hasta "Tus apps" y copia el objeto de configuración</p>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <div className="flex-shrink-0 w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold">4</div>
                          <div>
                            <p className="font-semibold text-gray-800 dark:text-white">Proporcionar Configuración al Desarrollador</p>
                            <p className="text-gray-600 dark:text-gray-400">Envía la configuración de Firebase para integrar con este sistema</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                      <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">✨ Beneficios de Firebase:</p>
                      <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 ml-4">
                        <li>☁️ Accede a los datos desde cualquier dispositivo</li>
                        <li>🔄 Sincronización en tiempo real</li>
                        <li>👥 Múltiples usuarios pueden colaborar</li>
                        <li>💾 Respaldos automáticos en la nube por Google</li>
                        <li>🔒 Seguro y encriptado</li>
                        <li>📱 Funciona en móvil y escritorio</li>
                      </ul>
                    </div>
                  </div>

                  {/* Current Storage Info */}
                  <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Configuración Actual</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded">
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Método de Almacenamiento</p>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">Almacenamiento Local</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Basado en el navegador</p>
                      </div>
                      <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded">
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Sincronización en Nube</p>
                        <p className="text-lg font-bold text-orange-600 dark:text-orange-400">No Configurado</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Sigue los pasos arriba para habilitar</p>
                      </div>
                      <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded">
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Autoguardado</p>
                        <p className="text-lg font-bold text-green-600 dark:text-green-400">Habilitado</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Cambios guardados automáticamente</p>
                      </div>
                      <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded">
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Versión</p>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">1.0</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Sistema Unity Club</p>
                      </div>
                    </div>
                  </div>
                </div>
              )
            }
          </div >
        </div >
      </div >
    </div >
  );
};


// Render the application

const ClubVencedoresApp = () => (
  <ErrorBoundary>
    <ClubVencedoresSystem />
  </ErrorBoundary>
);

export default ClubVencedoresApp;