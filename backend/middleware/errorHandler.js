/**
 * Error Handler Middleware
 * 
 * Catches all unhandled errors, returns JSON response,
 * and logs to data_audit_log for ethics compliance.
 */

const supabase = require('../config/supabase');

/**
 * Global error handler
 * @param {Error} err - Error object
 * @param {object} req - Express request
 * @param {object} res - Express response
 * @param {function} next - Next middleware (unused)
 */
async function errorHandler(err, req, res, next) {
  console.error('ERROR:', err.message);
  console.error('STACK:', err.stack);
  
  const isOperational = err.isOperational || false;
  const statusCode = isOperational ? err.statusCode : 500;
  
  const errorResponse = {
    error: getErrorKey(err),
    message: isOperational ? err.message : 'خطأ داخلي',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  };
  
  res.status(statusCode).json(errorResponse);
  
  if (!isOperational) {
    await logToAudit(req, err);
  }
}

/**
 * Map error to Arabic key
 */
function getErrorKey(err) {
  const keys = {
    400: 'طلب غير صالح',
    401: 'غير مصرح',
    403: 'ممنوع',
    404: 'غير موجود',
    409: 'تعارض',
    422: 'خطأ في البيانات',
    429: 'طلبات كثيرة',
    500: 'خطأ داخلي',
    503: 'خدمة غير متاحة'
  };
  
  return keys[err.statusCode] || 'خطأ未知';
}

/**
 * Log to data_audit_log for ethics compliance
 */
async function logToAudit(req, err) {
  try {
    const auditEntry = {
      event_type: 'error',
      user_id: req.user?.id || null,
      event_data: {
        path: req.path,
        method: req.method,
        error: err.message,
        stack: err.stack?.slice(0, 500)
      },
      created_at: new Date().toISOString()
    };
    
    await supabase.from('data_audit_log').insert(auditEntry);
  } catch (auditError) {
    console.error('Audit log failed:', auditError.message);
  }
}

/**
 * Async wrapper for route handlers
 */
function asyncHandler(fn) {
  return function asyncMiddleware(req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Not found handler
 */
function notFoundHandler(req, res) {
  res.status(404).json({
    error: 'غير موجود',
    message: `مسار غير موجود: ${req.method} ${req.originalUrl}`
  });
}

const errorHandlerMiddleware = {
  errorHandler,
  notFoundHandler,
  asyncHandler,
  getErrorKey
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = errorHandlerMiddleware;
}

if (typeof window !== 'undefined') {
  window.errorHandlerMiddleware = errorHandlerMiddleware;
}