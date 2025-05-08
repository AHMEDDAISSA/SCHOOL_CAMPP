import { useCallback, useReducer } from 'react';
import dashboardReducer from '../state/dashboardReducer';
import Toast from 'react-native-toast-message';
import { 
  fetchStatistics, 
  fetchListings, 
  fetchUsers 
} from '../../../services/api';

const useAdminData = () => {
  // Use reducer for complex state management
  const [state, dispatch] = useReducer(dashboardReducer, {
    loading: true,
    refreshing: false,
    statistics: null,
    listings: [],
    users: [],
    filterStatus: 'all',
    error: null
  });

  // Load data function
  const loadData = useCallback(async () => {
    dispatch({ type: 'FETCH_START' });
    try {
      // Load dashboard data in parallel for better performance
      const [stats, listingsData, usersData] = await Promise.all([
        fetchStatistics(),
        fetchListings(),
        fetchUsers()
      ]);
      
      dispatch({ 
        type: 'FETCH_SUCCESS', 
        payload: { 
          statistics: stats, 
          listings: listingsData, 
          users: usersData 
        } 
      });
    } catch (error) {
      console.error('Error loading admin data:', error);
      dispatch({ type: 'FETCH_ERROR', payload: error.message });
      
      Toast.show({
        type: 'error',
        text1: 'Erreur de chargement',
        text2: 'Impossible de charger les données',
        visibilityTime: 3000,
        topOffset: 50
      });
    }
  }, []);

  // Refresh function
  const onRefresh = useCallback(() => {
    dispatch({ type: 'SET_REFRESHING' });
    loadData();
  }, [loadData]);

  // Filter listings handler
  const handleFilterChange = useCallback((status) => {
    dispatch({ type: 'SET_FILTER_STATUS', payload: status });
  }, []);

  return {
    state,
    dispatch,
    loadData,
    onRefresh,
    handleFilterChange
  };
};

export default useAdminData;