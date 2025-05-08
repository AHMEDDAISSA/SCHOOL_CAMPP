const dashboardReducer = (state, action) => {
    switch (action.type) {
      case 'FETCH_START':
        return { ...state, loading: true, error: null };
      case 'FETCH_SUCCESS':
        return { 
          ...state, 
          loading: false, 
          statistics: action.payload.statistics || state.statistics,
          listings: action.payload.listings || state.listings,
          users: action.payload.users || state.users,
          error: null,
          refreshing: false
        };
      case 'FETCH_ERROR':
        return { 
          ...state, 
          loading: false, 
          error: action.payload, 
          refreshing: false 
        };
      case 'SET_REFRESHING':
        return { ...state, refreshing: true };
      case 'SET_FILTER_STATUS':
        return { ...state, filterStatus: action.payload };
      case 'UPDATE_LISTING_STATUS':
        return {
          ...state,
          listings: state.listings.map(listing => 
            listing.id === action.payload.id 
              ? { ...listing, status: action.payload.status } 
              : listing
          )
        };
      case 'UPDATE_USER_STATUS':
        return {
          ...state,
          users: state.users.map(user => 
            user.id === action.payload.id 
              ? { ...user, isBlocked: action.payload.isBlocked } 
              : user
          )
        };
      default:
        return state;
    }
  };
  
  export default dashboardReducer;