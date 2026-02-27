// Utility to reset petty cash requests
export const resetPettyCashData = () => {
  if (typeof window !== 'undefined') {
    try {
      // Clear petty cash store from localStorage
      localStorage.removeItem('pettyCashStore');
      console.log('✅ Petty cash data cleared from localStorage');
      
      // Reload the page to reinitialize with empty data
      window.location.reload();
    } catch (error) {
      console.error('Error clearing petty cash data:', error);
    }
  }
};

// Auto-run on import if URL has reset parameter
if (typeof window !== 'undefined' && window.location.search.includes('resetPettyCash=true')) {
  resetPettyCashData();
}
