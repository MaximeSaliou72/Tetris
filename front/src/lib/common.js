export function storeTokenInLocalStorage(data) {
    localStorage.setItem('token', data.token);
  }
  
  export function getTokenFromLocalStorage() {
    return localStorage.getItem('token');
  }
  
  export async function getAuthenticatedUser() {
    const defaultReturnObject = null ;
    try {
      const token = getTokenFromLocalStorage();
      if (!token) {
        return defaultReturnObject;
      }
    }
    catch (err) {
      console.log('getAuthenticatedUser, Something Went Wrong', err);
      return defaultReturnObject;
    }
  }