const db = require('../config/DBmanager');
const { cloudinary } = require('../utils/cloudinary');

exports.getEvents = async (req, res) => {
  try {
    const query = `select * from "Event"`;
    const events = await db.query(query);
    if (events.rows.length === 0) {
      return res.status(404).json({ message: 'No events found' });
    }
    return res.status(200).json(events.rows);
  } catch (error) {
    console.log('Error executing query', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getEvent = async (req, res) => {
  const { event_id } = req.params;
  try {
    const query = `select * from "Event" where "Event_ID" = $1`;
    const params = [event_id];
    const event = await db.query(query, params);

    if (event.rows.length === 0) {
      return res.status(404).json({ message: 'Event not found' });
    }
    return res.status(200).json(event.rows[0]);
  } catch (error) {
    console.log('Error executing query', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

exports.addEvent = async (req, res) => {
  const { Budget, Ename, Edate, Location_ID, ScoutLeader_ID } = req.body;
  try {
    const query = `INSERT INTO "Event" ("Budget", "Ename", "Edate", "Location_ID", "ScoutLeader_ID") VALUES ($1, $2, $3, $4, $5) RETURNING *`;
    const params = [Budget, Ename, Edate, Location_ID, ScoutLeader_ID];
    const event = await db.query(query, params);
    if (req.files) {
      req.files.forEach(async (file) => {
        const query = `INSERT INTO "Media" ("UploadDate", "Link", "Description", "Type", "Event_ID", "ScoutLeader_ID")
               VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`;
        const params = [
          new Date(),
          file.path,
          file.filename,
          'Image',
          event.rows[0].Event_ID,
          ScoutLeader_ID,
        ];
        const media = await db.query(query, params);
      });
    }
    return res
      .status(201)
      .json({ message: 'Added Event successfully', Event: event.rows[0] });
  } catch (error) {
    console.log('Error executing query', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

exports.deleteEvent = async (req, res) => {
  const { event_id } = req.params;
  try {
    const fetchMediaQuery = `SELECT "Description" FROM "Media" WHERE "Event_ID" = $1`;
    const mediaResult = await db.query(fetchMediaQuery, [event_id]);
    const mediaDescriptions = mediaResult.rows.map((row) => row.Description);

    for (const description of mediaDescriptions) {
      try {
        const result = await cloudinary.uploader.destroy(description);
      } catch (error) {
        console.error(
          `Failed to delete from Cloudinary: ${description}`,
          error
        );
      }
    }

    const deleteEventQuery = `DELETE FROM "Event" WHERE "Event_ID" = $1 RETURNING *`;
    const eventResult = await db.query(deleteEventQuery, [event_id]);
    if (eventResult.rows.length === 0) {
      return res.status(404).json({ message: 'Event not found' });
    }

    return res
      .status(200)
      .json({ message: 'Event and associated media deleted successfully' });
  } catch (error) {
    console.error('Error executing query', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

exports.updateEvent = async (req, res) => {
  const { event_id } = req.params;
  const { Budget, Ename, Edate, Location_ID, ScoutLeader_ID } = req.body;
  if (ScoutLeader_ID) {
    try {
      const query = `SELECT * FROM "ScoutLeader" WHERE "User_ID" = $1`;
      const params = [ScoutLeader_ID];
      const scoutLeader = await db.query(query, params);
      if (scoutLeader.rows.length === 0) {
        return res.status(404).json({ message: 'ScoutLeader not found' });
      }
    } catch (error) {
      console.log('Error executing query', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
  if (Location_ID) {
    try {
      const query = `SELECT * FROM "Location" WHERE "Location_ID" = $1`;
      const params = [Location_ID];
      const location = await db.query(query, params);
      if (location.rows.length === 0) {
        return res.status(404).json({ message: 'Location not found' });
      }
    } catch (error) {
      console.log('Error executing query', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
  try {
    if (
      !Budget &&
      !Ename &&
      !Edate &&
      !Location_ID &&
      !ScoutLeader_ID &&
      !req.files
    ) {
      return res.status(400).json({ message: 'No fields to update' });
    }
    const updateFields = [];
    const params = [event_id];
    if (Budget) {
      updateFields.push(`"Budget" = $${params.length + 1}`);
      params.push(Budget);
    }
    if (Ename) {
      updateFields.push(`"Ename" = $${params.length + 1}`);
      params.push(Ename);
    }
    if (Edate) {
      updateFields.push(`"Edate" = $${params.length + 1}`);
      params.push(Edate);
    }
    if (Location_ID) {
      updateFields.push(`"Location_ID" = $${params.length + 1}`);
      params.push(Location_ID);
    }
    if (ScoutLeader_ID) {
      updateFields.push(`"ScoutLeader_ID" = $${params.length + 1}`);
      params.push(ScoutLeader_ID);
    }
    const query = `UPDATE "Event" SET ${updateFields.join(
      ', '
    )} WHERE "Event_ID" = $1 RETURNING *`;
    const event = await db.query(query, params);
    if (event.rows.length === 0) {
      return res.status(404).json({ message: 'Event not found' });
    }
    if (req.files) {
      req.files.forEach(async (file) => {
        const query = `INSERT INTO "Media" ("UploadDate", "Link", "Description", "Type", "Event_ID", "ScoutLeader_ID")
               VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`;
        const params = [
          new Date(),
          file.path,
          file.filename,
          'Image',
          event_id,
          ScoutLeader_ID,
        ];
        const media = await db.query(query, params);
      });
    }
    return res
      .status(200)
      .json({ message: 'Event updated successfully', Event: event.rows[0] });
  } catch (error) {
    console.log('Error executing query', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getEventAttendees = async (req, res) => {
  const { event_id } = req.params;
  try {
    const query = `SELECT 
    ea.*,
    u."User_ID" as "Scout_ID",
    u."Fname",
    u."Lname",
    u."Phonenum",
    u."email",
    u."role",
    e.*
FROM 
    "EventAttendance" ea
JOIN 
    "User" u ON u."User_ID" = ea."Scout_ID"
JOIN 
    "Event" e ON e."Event_ID" = ea."Event_ID"
WHERE e."Event_ID" = $1;
`;
    const eventAttendees = await db.query(query, [event_id]);
    return res.status(200).json(eventAttendees.rows);
  } catch (error) {
    console.log('Error executing query', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

exports.addEventAttendee = async (req, res) => {
  const { event_id } = req.params;
  const { Scout_ID } = req.body;
  try {
    const query = `INSERT INTO "EventAttendance" ("Event_ID", "Scout_ID") VALUES ($1, $2) RETURNING *`;
    const params = [event_id, Scout_ID];
    const eventAttendance = await db.query(query, params);
    return res.status(201).json({
      message: 'Added Event Attendance successfully',
      EventAttendance: eventAttendance.rows[0],
    });
  } catch (error) {
    console.log('Error executing query', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

exports.deleteEventAttendee = async (req, res) => {
  const { event_id, scout_id } = req.params;
  try {
    const query = `DELETE FROM "EventAttendance" WHERE "Event_ID" = $1 AND "Scout_ID" = $2 RETURNING *`;
    const params = [event_id, scout_id];
    const eventAttendance = await db.query(query, params);
    if (eventAttendance.rows.length === 0) {
      return res.status(404).json({ message: 'Event Attendance not found' });
    }
    return res
      .status(200)
      .json({ message: 'Event Attendance deleted successfully' });
  } catch (error) {
    console.log('Error executing query', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getEventMedia = async (req, res) => {
  const { event_id } = req.params;
  try {
    const query = `SELECT * FROM "Media" WHERE "Event_ID" = $1`;
    const params = [event_id];
    const media = await db.query(query, params);
    return res.status(200).json(media.rows);
  } catch (error) {
    console.log('Error executing query', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
