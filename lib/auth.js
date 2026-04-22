'use client';

import { useRouter } from 'next/navigation';

// Default admin credentials
export const ADMIN_USER = {
  email: 'waseemraza013@gmail.com',
  username: 'waseem_raza',
  password: 'admin@1122'
};


/**
 * Logs out the current user by clearing cookies and redirecting to login
 * Implementation without any libraries, just using browser APIs
 */
export async function logout() {
  // Clear authentication cookie
  document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';

  // Redirect to login page
  window.location.href = '/login';
}

/**
 * Custom hook to handle logout with redirection
 * @returns {Function} Logout function
 */
export function useLogout() {
  const router = useRouter();

  return () => {
    // Clear authentication cookie
    document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';

    // Use router for navigation within the app
    router.push('/login');
  };
}

/**
 * Simple function to check if user is logged in
 * @returns {boolean} Whether the user is logged in
 */
export function isLoggedIn() {
  if (typeof document === 'undefined') return false;
  // Check if auth cookie exists
  return document.cookie.includes('auth_token=');
}

/**
 * Check if user is authenticated (alias for isLoggedIn)
 * @returns {boolean} Whether the user is authenticated
 */
export function isAuthenticated() {
  return isLoggedIn();
}

/**
 * Mock login function that sets a cookie
 * @param {string} email User's email
 * @param {string} password User's password
 * @returns {Object} Login result with success and message properties
 */
export function login(email, password) {
  try {
    console.log(`Login attempt: ${email} / ${password}`);
    console.log(`Expected: ${ADMIN_USER.email} / ${ADMIN_USER.password}`);

    // Check if credentials match
    if (email === ADMIN_USER.email && password === ADMIN_USER.password) {
      // Set auth cookie for 24 hours
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 1);
      document.cookie = `auth_token=admin_token; expires=${expiryDate.toUTCString()}; path=/;`;

      console.log('Login successful, cookie set');
      return { success: true, message: 'Login successful' };
    }

    console.log('Invalid credentials');
    return { success: false, message: 'Invalid email or password' };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, message: 'An error occurred during login' };
  }
}
