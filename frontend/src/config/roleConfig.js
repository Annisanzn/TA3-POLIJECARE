// Konfigurasi role dan permission
export const roles = {
  ADMIN: 'admin',
  OPERATOR: 'operator',
  KONSELOR: 'konselor',
  USER: 'user'
};

export const permissions = {
  // Admin permissions
  [roles.ADMIN]: [
    'manage_users',
    'manage_operators',
    'manage_konselors',
    'view_all_reports',
    'manage_system_settings'
  ],
  
  // Operator permissions
  [roles.OPERATOR]: [
    'manage_users',
    'manage_reports',
    'manage_categories',
    'manage_schedules',
    'manage_announcements',
    'view_dashboard'
  ],
  
  // Konselor permissions
  [roles.KONSELOR]: [
    'view_own_schedule',
    'manage_counseling_sessions',
    'view_assigned_reports',
    'manage_counseling_materials',
    'view_dashboard'
  ],
  
  // User permissions
  [roles.USER]: [
    'create_report',
    'view_own_reports',
    'schedule_counseling',
    'view_counseling_history',
    'view_dashboard'
  ]
};

// Route access configuration
export const routeAccess = {
  // Public routes
  PUBLIC: [
    '/',
    '/login',
    '/register',
    '/about',
    '/articles',
    '/contact'
  ],
  
  // Role-based routes
  [roles.ADMIN]: [
    '/admin/*'
  ],
  
  [roles.OPERATOR]: [
    '/operator/*'
  ],
  
  [roles.KONSELOR]: [
    '/konselor/*'
  ],
  
  [roles.USER]: [
    '/user/*'
  ]
};

// Default redirect paths after login
export const defaultRedirects = {
  [roles.ADMIN]: '/admin/dashboard',
  [roles.OPERATOR]: '/operator/dashboard',
  [roles.KONSELOR]: '/konselor/dashboard',
  [roles.USER]: '/user/dashboard'
};

// Check if user has permission
export const hasPermission = (userRole, permission) => {
  if (!userRole || !permissions[userRole]) return false;
  return permissions[userRole].includes(permission);
};

// Check if user can access route
export const canAccessRoute = (userRole, path) => {
  // Public routes are accessible to everyone
  if (routeAccess.PUBLIC.some(publicPath => 
    path === publicPath || path.startsWith(publicPath.replace('*', ''))
  )) {
    return true;
  }
  
  // Check role-based routes
  if (userRole && routeAccess[userRole]) {
    return routeAccess[userRole].some(rolePath => 
      path === rolePath || path.startsWith(rolePath.replace('*', ''))
    );
  }
  
  return false;
};

export default {
  roles,
  permissions,
  routeAccess,
  defaultRedirects,
  hasPermission,
  canAccessRoute
};