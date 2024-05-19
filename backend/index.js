import express from "express"
import mysql from "mysql2"
import cors from "cors"
import dotenv from "dotenv"

dotenv.config()

const app = express()

const dbHost = process.env.DB_HOST;
const dbUser = process.env.DB_USER;
const dbPass = process.env.DB_PASS;
const dbName = process.env.DB_NAME;

console.log("dbHost", dbHost)
console.log("dbUser", dbUser)
console.log("dbPass", dbPass)
console.log("dbName", dbName) 
console.log("ApiKey", ApiKey) 

const db = mysql.createConnection({
    host:       dbHost,
    user:       dbUser,
    password:   dbPass,
    database:   dbName
})

// app.use(express.json())
// app.use(cors())

app.get("/", (req, res) => {
    res.json("hello this is the backend")
})

app.get("/teams", (req, res) => {
    const q = "SELECT * FROM teams"
    db.query(q, (err, data) => {
        if (err) return res.json(err)
        return res.json(data)
    })
})

// app.post("/books", (req, res) => {
//     const q = "INSERT INTO books (`title`, `desc`, `price`, `cover`) VALUES (?)"
//     const values = [
//         req.body.title,
//         req.body.desc,
//         req.body.price,
//         req.body.cover
//     ]

//     db.query(q, [values], (err, data) => {
//         if (err) return res.json(err)
//         return res.json("Book has been created.")
//     });
// });

// app.delete("/books/:id", (req, res) => {
//     const bookId = req.params.id;
//     const q = "DELETE FROM books WHERE id = ?";

//     db.query(q, [bookId], (err, data) => {
//         if (err) return res.json(err);
//         return res.json("Book has been delete successfully.")
//     });
// });

// app.put("/books/:id", (req, res) => {
//     const bookId = req.params.id;
//     const q = "UPDATE books SET `title` = ?, `desc` = ?, `price` = ?, `cover` = ? WHERE id = ?";

//     const values = [
//         req.body.title,
//         req.body.desc,
//         req.body.price,
//         req.body.cover
//     ]

//     db.query(q, [...values, bookId], (err, data) => {
//         if (err) return res.json(err);
//         return res.json("Book has been updated successfully.")
//     });
// });

app.listen(8800, () => {
    console.log("Connected to backend!")
})