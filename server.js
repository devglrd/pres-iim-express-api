import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import mysql from "mysql";
import bcrypt from 'bcrypt';

const PORT = 6001;

let app = express();
app.use(cors());
//PEermet de parser le body
app.use(bodyParser.json());
//permet l'analyse des données encodées dans l'URL avec la la qs bibliothèque
app.use(bodyParser.urlencoded({extended: false}));


/// c'est api n'est pas securisé et elle est suceptible d'avoir des injections sql
// au niveau des POST ET PUT, il faudrais utilisé un package comme sanitizer.sanitize afin
// d'avoir de la donnée clean, mais je penses que ça seras deja bien pour commcner, pourquoi pas donner au eleve un defis de rendre l'api plus securise !


//INFORMATION BDD
let db = mysql.createConnection({
    host: "127.0.0.1",
    user: "root",
    password: "",
    database: "test-pres-iim"
});

//Function de connection
db.connect((err) => {
    if (err) {
        console.log(`Une erreur c'est produite lors de la connection a la bdd ${err}`)
    }
    console.log(`Connectée !`);
});

//GET METHOD
app.get('/api/users', (req, res) => {
    const sql = `SELECT * FROM users ORDER BY id DESC`;
    db.query(sql, (err, result) => {
        if (err) res.state(500).json({"error": err});
        res.status(200).json({"data": result});
    });
});

//GET METHOD
app.get('/api/users/:id', (req, res) => {
    if (parseInt(req.params.id)) {
        const sql = `SELECT * from users WHERE id = ${db.escape(req.params.id)}`;
        db.query(sql, (err, result) => {
            if (err) res.state(500).json({"error": err});
            res.status(200).json({"data": result});
        });
    } else {
        res.status(300).json({"error": "You should pass a integer value"});
    }
});


//POST METHOD
app.post('/api/users', (req, res) => {

    if (!req.body.name || !req.body.email || !req.body.adresse || !req.body.password) {
        res.status(500).json({"error": "Missing data"})
    }
    let password = req.body.password;
    let saltRounds = 10;
    let hash = bcrypt.hashSync(password, saltRounds);
    const sql = `INSERT INTO users (name, email, adresse, password) VALUES ('${req.body.name}', '${req.body.email}', '${req.body.adresse}', '${hash}')`;
    db.query(sql, (err, result) => {
        if (err) res.state(500).json({"error": err});
        res.status(200).json({"data": result});
    });
});

//PUT METHOD
app.put('/api/users/:id', (req, res) => {
    if (parseInt(req.params.id)) {
        if (!req.body.name || !req.body.email || !req.body.adresse || !req.body.password) {
            res.status(500).json({"error": "Missing data"})
        } else {
            let password = req.body.password;
            let saltRounds = 10;
            let hash = bcrypt.hashSync(password, saltRounds);
            const sql = `UPDATE users SET name = "${req.body.name}", email = "${req.body.email}", adresse = "${req.body.adresse}", password = "${hash}" WHERE id = ${db.escape(req.params.id)}`;
            console.log(sql);
            db.query(sql, (err, result) => {
                if (err) res.state(500).json({"error": err});
                res.status(200).json({"data": result});
            });
        }
    } else {
        res.status(300).json({"error": "You should pass a integer value"});
    }
});


//DELETE METHOD
app.delete('/api/users/:id', (req, res) => {
    if (parseInt(req.params.id)) {
        const sql = `DELETE FROM users WHERE id = ${db.escape(req.params.id)}`;
        console.log(sql);
        db.query(sql, (err, result) => {
            if (err) res.state(500).json({"error": err});
            res.status(200).json({"data": result});
        });
    } else {
        res.status(300).json({"error": "You should pass a integer value"});
    }
});


//LISTEN APP
app.listen(PORT, () => {
    console.log(`listen on port ${PORT}`)
});
