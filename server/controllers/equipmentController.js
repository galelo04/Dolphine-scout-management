const db = require("../config/DBmanager");

module.exports.getEquipments = async (req, res) => {
    try {
        const query = `SELECT * FROM "Equipment"`;
        const params = [];
        const result = await db.query(query, params);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "no equipment found" });
        }

        return res.json(result.rows);
    } catch (error) {
        console.log("Error executing query", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

module.exports.getEquipment = async (req, res) => {
    const { equipment_id } = req.params;
    try {
        const query = `SELECT * FROM "Equipment" WHERE "Equipment_ID" = $1`;
        const params = [equipment_id];
        const result = await db.query(query, params);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Equipment not found" });
        }
        return res.json(result.rows[0]);
    } catch (error) {
        console.log("Error executing query", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

module.exports.addEquipment = async (req, res) => {
    const { name, quantity, date, location_id } = req.body;
      console.log(
        'name',
        name,
        'quant',
        quantity,
        'date',
        date,
        'loc',
        location_id
      );
    try {
        const query = `INSERT INTO "Equipment" ("Ename", "Quantity", "AddedDate", "Location_ID") VALUES ($1, $2, $3, $4) RETURNING *`; // return inserted Equipment
        const params = [name, quantity, date, location_id];
        const result = await db.query(query, params);
        console.log(result.rows);
        return res.status(201).json({ message: "Added Equipment successfully", Equipment: result[0] });
    } catch (error) {
        console.log("Error executing query", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

module.exports.updateEquipment = async (req, res) => {
    const { equipment_id } = req.params;
    const { name, quantity, date, location_id } = req.body;
    console.log("in controller", name, quantity, location_id, date, equipment_id);
    try {
        const query = `UPDATE "Equipment" SET "Ename" = $1, "Quantity" = $2, "AddedDate" = $3, "Location_ID" = $4 WHERE "Equipment_ID" = $5 RETURNING *`;
        const params = [name, quantity, date, location_id, equipment_id];
        const result = await db.query(query, params);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Equipment not found" });
        }
        return res.json({ message: "Equipment updated successfully", Equipment: result[0] });
    } catch (error) {
        console.log("Error executing query", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

module.exports.deleteEquipment = async (req, res) => {
    const { equipment_id } = req.params;
    try {
        const query = `DELETE FROM "Equipment" WHERE "Equipment_ID" = $1`;
        const params = [equipment_id];
        const result = await db.query(query, params);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Equipment not found" });
        }
        return res.status(200).json({ message: "Deleted Equipment successfully" });
    } catch (error) {
        console.log("Error executing query", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
