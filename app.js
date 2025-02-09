const express = require("express");
const { MongoClient } = require("mongodb");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

let db;
const client = new MongoClient("mongodb://localhost:27017", {
    useUnifiedTopology: true,
});

client
    .connect()
    .then(() => {
        db = client.db("IIT");
        console.log("mongodb connected");

        return db.command({ ping: 1 });
    })
    .then(() => {
        console.log("MongoDB connection is alive.");
    })
    .catch((err) => {
        console.error("mongodb unconnected", err);
        process.exit(1);
    });

process.on("SIGINT", async () => {
    await client.close();
    console.log("MongoDB connection closed.");
    process.exit(0);
});

// ดึงข้อมูลทั้งหมด
app.get('/number', async (req, res) => {
    try {
        const number = await db.collection("number").find().toArray();
        res.json(number);
    } catch (err) {
        res.json("error");
    }
});

// ดูเฉพาะตัวที่หา name
app.get('/number/ID/:ID', async (req, res) => {
    try {
        const ID = req.params.ID;
        const student = await db.collection("number").findOne({ ID: parseInt(ID) });

        if (!student) {
            return res.status(404).json({ message: "Not found" });
        }

        res.json(student);
    } catch (err) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.post('/number', async (req, res) => {
    try {
        const { ID, name } = req.body;

        // Validation: Check if ID and name are provided and ID is a valid number
        if (!ID || !name) {
            return res.status(400).json({ error: "Missing ID or name" });
        }

        const numericID = Number(ID);

        // Validate if ID is a valid number
        if (isNaN(numericID)) {
            return res.status(400).json({ error: "Invalid ID format" });
        }

        // Insert data into the database
        const number = await db.collection("number").insertOne({ ID: numericID, name });

        // Return a response with the inserted document data
        res.status(201).json({
            message: "Number added successfully",
            insertedID: number.insertedId,
            data: {
                ID: numericID,
                name
            }
        });
    } catch (err) {
        console.error(err);  // Log the error for debugging
        res.status(500).json({ error: "Internal Server Error" });
    }
});


// ลบข้อมูล
app.delete('/number/:ID', async (req, res) => {
    try {
        const ID = req.params.ID;
        const result = await db.collection("number").deleteOne({ ID: parseInt(ID) });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: "Student not found" });
        }

        res.json({ message: "Student deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.listen(3000, () => {
    console.log('Server started : success');
});

