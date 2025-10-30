// Helper to retrieve the currently selected store id
export function getActiveStoreId() {
  try {
    return localStorage.getItem('storeId');
  } catch {
    return null;
  }
}

export function getActiveStoreName() {
  try {
    return localStorage.getItem('storeName');
  } catch {
    return null;
  }
}
