const express = require("express");
const Employee = require("../models/Employee");
const auth = require("../middleware/auth");
const logSecurityEvent = require("../middleware/logger");
const {
  body,
  param,
  query,
  validationResult,
} = require("express-validator");

const router = express.Router();


// ========================================
// POST - Create Employee
// ========================================

router.post(
  "/employees",
  auth,
  [
    body("first_name")
  .trim()
  .notEmpty()
  .withMessage("First name is required")
  .isLength({ min: 2, max: 50 })
  .withMessage("First name must be between 2 and 50 characters"),
    body("last_name")
  .trim()
  .notEmpty()
  .withMessage("Last name is required")
  .isLength({ min: 2, max: 50 })
  .withMessage("Last name must be between 2 and 50 characters"),
   
  body("email")
      .isEmail()
      .withMessage("Valid email is required"),

  body("position")
  .trim()
  .notEmpty()
  .withMessage("Position is required")
  .isLength({ min: 2, max: 100 })
  .withMessage("Position must be between 2 and 100 characters"),
    body("salary")
      .isFloat({ gt: 0 })
      .withMessage("Salary must be a positive number"),

    body("date_of_joining")
      .isISO8601()
      .withMessage("Valid date of joining is required"),

      body("department")
  .trim()
  .notEmpty()
  .withMessage("Department is required")
  .isLength({ min: 2, max: 100 })
  .withMessage("Department must be between 2 and 100 characters"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);

     if (!errors.isEmpty()) {
  logSecurityEvent(
    "VALIDATION_FAILED",
    `route=${req.method} ${req.originalUrl} errors=${errors
      .array()
      .map((error) => error.msg)
      .join(", ")}`
  );

  return res.status(400).json({
    errors: errors.array(),
  });
}

      const {
        first_name,
        last_name,
        email,
        position,
        salary,
        date_of_joining,
        department,
      } = req.body;

      const newEmployee = new Employee({
        first_name,
        last_name,
        email,
        position,
        salary,
        date_of_joining,
        department,
        user_id: req.userId,
      });

      await newEmployee.save();

      res.status(201).json({
        message: "Employee created successfully",
        employee: newEmployee,
      });

    } catch (error) {
      console.log(error);

      if (error.code === 11000) {
        return res.status(400).json({
          message: "Employee email already exists",
        });
      }

      res.status(500).json({
        message: "Server error",
      });
    }
  }
);


// ========================================
// GET - Get All Employees
// ========================================

router.get("/employees", auth, async (req, res) => {
  try {
    const employees = await Employee.find({
      user_id: req.userId,
    });

    res.status(200).json(employees);

  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server error",
    });
  }
});


// ========================================
// GET - Get Employee by ID
// ========================================

router.get(
  "/employees/:eid",
  auth,
  [
    param("eid")
      .isMongoId()
      .withMessage("Invalid employee ID"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);

    if (!errors.isEmpty()) {
  logSecurityEvent(
    "VALIDATION_FAILED",
    `route=${req.method} ${req.originalUrl} errors=${errors
      .array()
      .map((error) => error.msg)
      .join(", ")}`
  );

  return res.status(400).json({
    errors: errors.array(),
  });
}

      const employee = await Employee.findOne({
        _id: req.params.eid,
        user_id: req.userId,
      });

      if (!employee) {
  logSecurityEvent(
    "AUTHORIZATION_DENIED_OR_NOT_FOUND",
    `method=${req.method} path=${req.originalUrl} userId=${req.userId}`
  );

  return res.status(404).json({
    message: "Employee not found",
  });
}

      res.status(200).json(employee);

    } catch (error) {
      console.log(error);

      res.status(500).json({
        message: "Server error",
      });
    }
  }
);


// ========================================
// PUT - Update Employee
// ========================================

router.put(
  "/employees/:eid",
  auth,
  [
    param("eid")
      .isMongoId()
      .withMessage("Invalid employee ID"),

   body("first_name")
  .trim()
  .notEmpty()
  .withMessage("First name is required")
  .isLength({ min: 2, max: 50 })
  .withMessage("First name must be between 2 and 50 characters"),
    
  body("last_name")
  .trim()
  .notEmpty()
  .withMessage("Last name is required")
  .isLength({ min: 2, max: 50 })
  .withMessage("Last name must be between 2 and 50 characters"),

    body("email")
      .isEmail()
      .withMessage("Valid email is required"),

    body("position")
  .trim()
  .notEmpty()
  .withMessage("Position is required")
  .isLength({ min: 2, max: 100 })
  .withMessage("Position must be between 2 and 100 characters"),

    body("salary")
      .isFloat({ gt: 0 })
      .withMessage("Salary must be a positive number"),

    body("date_of_joining")
      .isISO8601()
      .withMessage("Valid date of joining is required"),

   body("department")
  .trim()
  .notEmpty()
  .withMessage("Department is required")
  .isLength({ min: 2, max: 100 })
  .withMessage("Department must be between 2 and 100 characters"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
  logSecurityEvent(
    "VALIDATION_FAILED",
    `route=${req.method} ${req.originalUrl} errors=${errors
      .array()
      .map((error) => error.msg)
      .join(", ")}`
  );

  return res.status(400).json({
    errors: errors.array(),
  });
}

      const {
        first_name,
        last_name,
        email,
        position,
        salary,
        date_of_joining,
        department,
      } = req.body;

      const updatedEmployee = await Employee.findOneAndUpdate(
        {
          _id: req.params.eid,
          user_id: req.userId,
        },
        {
          first_name,
          last_name,
          email,
          position,
          salary,
          date_of_joining,
          department,
        },
        {
          returnDocument: "after",
          runValidators: true,
        }
      );

      if (!updatedEmployee) {
        return res.status(404).json({
          message: "Employee not found",
        });
      }

      res.status(200).json({
        message: "Employee updated successfully",
        employee: updatedEmployee,
      });

    } catch (error) {
      console.log(error);

      if (error.code === 11000) {
        return res.status(400).json({
          message: "Employee email already exists",
        });
      }

      res.status(500).json({
        message: "Server error",
      });
    }
  }
);


// ========================================
// DELETE - Delete Employee
// ========================================

router.delete(
  "/employees",
  auth,
  [
    query("eid")
      .isMongoId()
      .withMessage("Invalid employee ID"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({
          errors: errors.array(),
        });
      }

      const employee = await Employee.findOneAndDelete({
        _id: req.query.eid,
        user_id: req.userId,
      });

   if (!employee) {
  return res.status(404).json({
    message: "Employee not found",
  });
}

     res.status(204).send();

    } catch (error) {
      console.log(error);

      res.status(500).json({
        message: "Server error",
      });
    }
  }
);


module.exports = router;