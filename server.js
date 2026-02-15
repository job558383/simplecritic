const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// === Connectie maken ===
let db;
(async () => {
  try {
    db = await mysql.createConnection({
      host: "database-5019734125.webspace-host.com",
      user: "dbu463470",
      password: "Sammy2006StratoDB34!?",
      database: "dbs15323527",
    });

    console.log("Connected to MySQL database.");

    // === Maak de tabel aan als die nog niet bestaat ===
    await db.execute(`
      CREATE TABLE IF NOT EXISTS media (
        id INT PRIMARY KEY AUTO_INCREMENT,
        type VARCHAR(255),
        pictureUrl VARCHAR(255),
        subtype VARCHAR(255),
        title VARCHAR(255),
        universe VARCHAR(255),
        genre VARCHAR(255),
        year INT,
        through VARCHAR(255),
        runtime INT,
        starring VARCHAR(255),
        director VARCHAR(255),
        rating DOUBLE,
        extra TEXT,
        itemtype VARCHAR(255),
        dateadded DATETIME,
        userID VARCHAR(255)
      )
    `);
    console.log("Table 'media' ready.");
  } catch (err) {
    console.error("Database connection failed:", err.message);
    process.exit(1);
  }
})();

// === GET /items endpoint ===
app.get("/items", async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT * FROM media");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// === POST /additem ===
app.post("/additem", async (req, res) => {
  const data = req.body;

  if (!data.title || !data.type || !data.rating) {
    return res.status(400).json({ error: "Obligatory fields are empty" });
  }

  try {
    const [result] = await db.execute(
      `INSERT INTO media 
        (type, pictureUrl, subtype, title, universe, genre, year, through, runtime, starring, director, rating, extra, itemtype, dateadded, userID)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.type ?? null,
        data.pictureUrl ?? null,
        data.subtype ?? null,
        data.title ?? null,
        data.universe ?? null,
        data.genre ?? null,
        data.year ?? null,
        data.through ?? null,
        data.runtime ?? null,
        data.starring ?? null,
        data.director ?? null,
        data.rating ?? null,
        data.extra ?? null,
        data.itemtype ?? null,
        data.dateadded ?? null,
        data.userID ?? null,
      ],
    );
    res
      .status(201)
      .json({ message: "Successfully added item", id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// === PUT /updaterating/:id ===
app.put("/updaterating/:id", async (req, res) => {
  const ratingId = Number(req.params.id);
  const data = req.body;

  try {
    const [result] = await db.execute(
      `UPDATE media SET
         type = COALESCE(?, type),
         pictureUrl = COALESCE(?, pictureUrl),
         subtype = COALESCE(?, subtype),
         title = COALESCE(?, title),
         universe = COALESCE(?, universe),
         genre = COALESCE(?, genre),
         year = COALESCE(?, year),
         through = COALESCE(?, through),
         runtime = COALESCE(?, runtime),
         starring = COALESCE(?, starring),
         director = COALESCE(?, director),
         rating = COALESCE(?, rating),
         extra = COALESCE(?, extra),
         dateadded = COALESCE(?, dateadded)
       WHERE id = ?`,
      [
        data.type,
        data.pictureUrl,
        data.subtype,
        data.title,
        data.universe,
        data.genre,
        data.year,
        data.through,
        data.runtime,
        data.starring,
        data.director,
        data.rating,
        data.extra,
        data.dateadded,
        ratingId,
      ],
    );
    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Item not found" });
    res.json({ message: "Item updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// === DELETE /deleterating/:id ===
app.delete("/deleterating/:id", async (req, res) => {
  const ratingId = parseInt(req.params.id);

  try {
    const [result] = await db.execute("DELETE FROM media WHERE id = ?", [
      ratingId,
    ]);
    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Item not found" });
    res
      .status(200)
      .json({ message: `Beoordeling met ID ${ratingId} verwijderd.` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log("Server running on port" + PORT);
});
