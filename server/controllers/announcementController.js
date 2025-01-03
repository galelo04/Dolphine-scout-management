const db = require("../config/DBmanager");

module.exports.getAnnouncements = async (req, res) => {
    try {
        const query = `SELECT * FROM "Announcement"`;
        const params = [];
        const result = await db.query(query, params);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "no announcements found" });
        }

        return res.json(result.rows);
    } catch (error) {
        console.log("Error executing query", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

module.exports.getAnnouncement = async (req, res) => {
    const { announcement_id } = req.params;
    try {
        const query = `SELECT * FROM "Announcement" WHERE "Announcement_ID" = $1`;
        const params = [announcement_id];
        const result = await db.query(query, params);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Announcement not found" });
        }
        return res.json(result.rows[0]);
    } catch (error) {
        console.log("Error executing query", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

module.exports.addAnnouncement = async (req, res) => {
    const { content, date, priority, visibility, leader_id } = req.body;
    try {
        const query = `INSERT INTO "Announcement" ("Content", "CreateDate", "Priority", "Visibility", "ScoutLeader_ID") VALUES ($1, $2, $3, $4, $5) RETURNING *`;
        const params = [content, date, priority, visibility, leader_id];
        const result = await db.query(query, params);
        return res.status(201).json({ message: "Added Announcement successfully", Announcement: result[0] });
    } catch (error) {
        console.log("Error executing query", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

module.exports.updateAnnouncement = async (req, res) => {
    const { announcement_id } = req.params;
    const { content, date, priority, visibility, leader_id } = req.body;
    console.log(
      content,
      date,
      priority,
      visibility,
      leader_id,
      announcement_id
    );

    try {
        const query = `UPDATE "Announcement" SET "Content" = $1, "CreateDate" = $2, "Priority" = $3, "Visibility" = $4, "ScoutLeader_ID" = $5 WHERE "Announcement_ID" = $6 RETURNING *`;
        const params = [content, date, priority, visibility, leader_id, announcement_id];
        const result = await db.query(query, params);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Announcement not found" });
        }
        return res.json({ message: "Announcement updated successfully", Announcement: result[0] });
    } catch (error) {
        console.log("Error executing query", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

module.exports.deleteAnnouncement = async (req, res) => {
    const { announcement_id } = req.params;
    try {
        const query = `DELETE FROM "Announcement" WHERE "Announcement_ID" = $1`;
        const params = [announcement_id];
        const result = await db.query(query, params);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Announcement not found" });
        }
        return res.status(200).json({ message: "Deleted Announcement successfully" });
    } catch (error) {
        console.log("Error executing query", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
