
export const verifyAdmin = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: User not authenticated.",
      });
    }

    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Admin access required.",
      });
    }
    
    next();
  } catch (error) {
    console.error("Admin verification failed:", error.message);
    res.status(500).json({
      success: false,
      message: "Internal server error while verifying admin.",
    });
  }
};
