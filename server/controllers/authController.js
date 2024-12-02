const bcrypt = require("bcrypt");
const db = require("../config/DBmanager");
const jwtGenerator = require("../utils/jwtGenerator");
exports.register = async (req, res) => {
  const { email, Fname, Lname, password, PhoneNum } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = `INSERT INTO "User" ("email", "Fname", "Lname", "password", "Phonenum") VALUES ($1, $2, $3, $4, $5) 
    returning *`;
    const params = [email, Fname, Lname, hashedPassword, PhoneNum];
    const result = await db.query(query, params);
    return res.status(201).json({
      message: "User registered successfully",
      user: { id: result.rows[0].User_ID, email, Fname, Lname }, // needed to revisit this
    });
  } catch (error) {
    console.log("Error executing query", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const query = `SELECT * FROM "User" WHERE "email" = $1`;
    const params = [email];
    const result = await db.query(query, params);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const token = jwtGenerator(user.User_ID);
    return res.status(200).json({
      message: "User logged in successfully",
      token,
      user: {
        id: user.User_ID,
        email: user.email,
        Fname: user.Fname,
        Lname: user.Lname,
      },
    });
  } catch (error) {
    console.log("Error executing query", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};