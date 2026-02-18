// Utility functions for permission checking
import { roles, hasPermission, canAccessRoute } from '../config/roleConfig';

/**
 * Check if user has specific permission
 * @param {string} userRole - User's role
 * @param {string} permission - Permission to check
 * @returns {boolean} True if user has permission
 */
export const checkPermission = (userRole, permission) => {
  return hasPermission(userRole, permission);
};

/**
 * Check if user can access a specific route
 * @param {string} userRole - User's role
 * @param {string} path - Route path
 * @returns {boolean} True if user can access route
 */
export const checkRouteAccess = (userRole, path) => {
  return canAccessRoute(userRole, path);
};

/**
 * Get user's default redirect path after login
 * @param {string} userRole - User's role
 * @returns {string} Default redirect path
 */
export const getDefaultRedirect = (userRole) => {
  const defaultRedirects = {
    [roles.ADMIN]: '/admin/dashboard',
    [roles.OPERATOR]: '/operator/dashboard',
    [roles.KONSELOR]: '/konselor/dashboard',
    [roles.USER]: '/user/dashboard'
  };
  
  return defaultRedirects[userRole] || '/';
};

/**
 * Filter menu items based on user role
 * @param {Array} menuItems - Menu items to filter
 * @param {string} userRole - User's role
 * @returns {Array} Filtered menu items
 */
export const filterMenuByRole = (menuItems, userRole) => {
  if (!menuItems || !userRole) return [];
  
  return menuItems.filter(item => {
    // If item has roles property, check if user role is included
    if (item.roles && Array.isArray(item.roles)) {
      return item.roles.includes(userRole);
    }
    // If no roles specified, show to all authenticated users
    return true;
  });
};

/**
 * Check if user is admin or has higher privileges
 * @param {string} userRole - User's role
 * @returns {boolean} True if user is admin or operator
 */
export const isAdminOrOperator = (userRole) => {
  return userRole === roles.ADMIN || userRole === roles.OPERATOR;
};

/**
 * Check if user is konselor
 * @param {string} userRole - User's role
 * @returns {boolean} True if user is konselor
 */
export const isKonselor = (userRole) => {
  return userRole === roles.KONSELOR;
};

/**
 * Check if user is regular user
 * @param {string} userRole - User's role
 * @returns {boolean} True if user is regular user
 */
export const isRegularUser = (userRole) => {
  return userRole === roles.USER;
};

/**
 * Get role display name
 * @param {string} role - Role key
 * @returns {string} Display name
 */
export const getRoleDisplayName = (role) => {
  const roleNames = {
    [roles.ADMIN]: 'Administrator',
    [roles.OPERATOR]: 'Operator',
    [roles.KONSELOR]: 'Konselor',
    [roles.USER]: 'Pengguna'
  };
  
  return roleNames[role] || 'Pengguna';
};

export default {
  checkPermission,
  checkRouteAccess,
  getDefaultRedirect,
  filterMenuByRole,
  isAdminOrOperator,
  isKonselor,
  isRegularUser,
  getRoleDisplayName
};