/**
 * Role Check Middleware
 * 
 * Enforces role-based access control (RBAC).
 * Roles: farmer, distributor, admin
 * 
 * Usage:
 *   requireRole('farmer')
 *   requireRole(['farmer', 'distributor'])
 */

/**
 * Require specific role(s)
 * @param {string|string[]} allowedRoles - Role(s) to allow
 * @returns {function} Express middleware
 */
function requireRole(allowedRoles) {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  
  return function roleMiddleware(req, res, next) {
    if (!req.user) {
      return res.status(401).json({
        error: 'غير مصرح',
        message: 'Authentication required'
      });
    }
    
    const userRole = req.user.role || req.user.user_metadata?.role;
    
    if (!roles.includes(userRole)) {
      return res.status(403).json({
        error: 'ممنوع',
        message: `Role '${userRole}' not allowed. Required: ${roles.join(' or ')}`
      });
    }
    
    next();
  };
}

/**
 * Require admin only
 */
function requireAdmin(req, res, next) {
  return requireRole('admin')(req, res, next);
}

/**
 * Require farmer (includes admin for cross-privilege)
 */
function requireFarmer(req, res, next) {
  const auth = requireRole(['farmer', 'admin']);
  return auth(req, res, next);
}

/**
 * Require distributor (includes admin for cross-privilege)
 */
function requireDistributor(req, res, next) {
  const auth = requireRole(['distributor', 'admin']);
  return auth(req, res, next);
}

/**
 * Check if user has specific role (sync, no middleware)
 */
function hasRole(user, role) {
  if (!user) return false;
  const userRole = user.role || user.user_metadata?.role;
  return role === 'admin' ? userRole === 'admin' : ['farmer', 'admin'].includes(userRole);
}

const roleCheck = {
  requireRole,
  requireAdmin,
  requireFarmer,
  requireDistributor,
  hasRole
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = roleCheck;
}

if (typeof window !== 'undefined') {
  window.roleCheck = roleCheck;
}