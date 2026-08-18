// Validation Middleware
// Request validation and input sanitization

export const validateIncidentPayload = (req, res, next) => {
  const { machineId, severity, title } = req.body;

  if (!machineId || typeof machineId !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Invalid or missing machineId',
    });
  }

  if (severity && !['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(severity)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid severity level',
    });
  }

  if (!title || typeof title !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Invalid or missing title',
    });
  }

  next();
};

export default validateIncidentPayload;
