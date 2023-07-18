import { CreateToken } from "../Middlewares/auth.js";
import { Student } from "../Models/Student.model.js";
import { generateRandomNumber } from "../Helper/CodeGeneration.js";
import { SendEmail } from "../Helper/SendEamail.js";

export const Verify_Email_Student = async (req, res) => {
  try {
    const { email } = req.body;
    if (email) {
      Student.findByEmail(email, (err, result1) => {
        if (err) throw err;
        else {
          if (result1.Found === true) {
            // Generate Random Code and send Email
            const code = generateRandomNumber();
            const Text = `The Code to reset your Password is :\n\ ${code}`;
            SendEmail(email, "Re-set Password", Text, (err, info) => {
              // Yahan Kam hona hai
              if (err) throw err;
              else {
                Student.setDefaultPasswordStudent(
                  email,
                  { student_default_password: code },
                  (err, result) => {
                    if (err) {
                      res.send({ err }).status(401);
                      return;
                    } else {
                      if (result.insertId) {
                        res.send({ insertId: result.insertId }).status(200);
                        return;
                      }
                    }
                  }
                );
              }
            });
          } else {
            res.status(400).send({ err: "Incorrect Email" });
          }
        }
      });
    } else {
      res.send({ err: "Email Required" }).status(400);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "An error occurred",
      error: error.message,
    });
  }
};

export const AuthUser_Student = async (req, res) => {
  try {
    const { code, email } = req.body;
    if (code) {
      Student.findDefaultPasswordStudent(email, (err, result) => {
        if (err) {
          res.send({ err }).status(403);
        } else {
          if (result.Found && result[0].student_default_password) {
            if (result[0].student_default_password === code) {
              const token = CreateToken({ id: email }, "Student Reset Password ");
              res.send({ response: "Correct Code", token: token }).status(200);
            } else {
              res.send({ err: "Wrong Code Entered" }).status(400);
            }
          } else {
            res
              .send({ err: "Email Not Found Or Reset Is Not Required" })
              .status(400);
          }
        }
      });
    } else {
      res.send({ err: "Code Required" }).status(400);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "An error occurred",
      error: error.message,
    });
  }
};

export const Reset_Password_Student = async (req, res) => {
  try {
    const { id, password } = req.body;
    Student.updateByEmail(id, { student_password: password }, (err, result) => {
      if (err) res.send({ err }).status(400);
      else {
        Student.setDefaultPasswordStudent(
          id,
          { student_default_password: null },
          (err, info) => {
            if (err) res.send({ err }).status(400);
            else {
              res
                .send({ msg: "Password re-set has been done. Now Login" })
                .status(200);
            }
          }
        );
      }
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "An error occurred",
      error: error.message,
    });
  }
};