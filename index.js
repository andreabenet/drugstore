const express = require("express");
const bodyParser = require("body-parser");
const uniqid = require("uniqid");
const mongoose = require("mongoose");
const app = express();
app.use(bodyParser.json());

mongoose.connect("mongodb://localhost/drugstore", { useNewUrlParser: true });

const Drug = mongoose.model("Drug", {
  name: {
    type: String,
    default: ""
  },
  quantity: {
    type: Number
  }
});

const drugstore = [];

// Route pour creer un medoc
app.post("/drug", async (req, res) => {
  const name = req.body.name;
  const quantity = Number(req.body.quantity);
  if (name === undefined || isNaN(quantity)) {
    // Check des params reçus
    return res.status(400).send({
      error: {
        message: "Bad request"
      }
    });
  }
  // if the drug already exists
  const ifExist = await Drug.findOne({ name: name });
  if (ifExist !== null) {
    return res.status(200).send({
      error: { message: "Drug already exists" }
    });
  }

  // On genere le nouveau medoc
  try {
    const newDrug = new Drug({
      name: req.body.name,
      quantity: req.body.quantity
    });
    await newDrug.save();
    res.json({ message: "Created" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Route pour lister les medocs
app.get("/drug", async (req, res) => {
  try {
    const drugs = await Drug.find();
    res.json(drugs);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
  //  res.send(drugstore);
});

// Route pour envoyer la quantite les medocs
app.get("/drug/:id/quantity", (req, res) => {
  const id = req.params.id;

  for (let i = 0; i < drugstore.length; i++) {
    if (drugstore[i]._id === id) {
      return res.send({ quantity: drugstore[i].quantity });
    }
  }

  // Si j'arrive ici c'est que le medicament avec l'id reçu n'a pas ete trouve
  return res.status(400).send({
    error: {
      message: "Bad request"
    }
  });
});

// Route pour ajouter des medocs
app.put("/drug/add", async (req, res) => {
  const id = req.body.id;
  const quantity = Number(req.body.quantity);

  if (id === undefined || isNaN(quantity)) {
    return res.status(400).send({
      error: {
        message: "Bad request"
      }
    });
  }

  try {
    const drug = await Drug.findOne({ _id: id });
    drug.quantity += quantity;
    await drug.save();
    return res.status(200).json(drug);
  } catch (error) {
    res.status(400).json({ error: { message: "Bad request" } });
  }
});

// Route pour renomer un medoc
app.put("/drug/rename", async (req, res) => {
  const id = req.body.id;
  const name = req.body.name;

  if (id === undefined || isNaN(quantity)) {
    return res.status(400).send({
      error: {
        message: "Bad request"
      }
    });
  }

  try {
    const drug = await Drug.findOne({ _id: id });
    drug.name = name;
    await drug.save();
    return res.status(200).json(drug);
  } catch (error) {
    res.status(400).json({ error: { message: "Bad request" } });
  }
});

app.put("/drug/remove", async (req, res) => {
  const id = req.body.id;
  const quantity = Number(req.body.quantity);

  if (id === undefined || isNaN(quantity)) {
    return res.status(400).send({
      error: {
        message: "Bad request"
      }
    });
  }

  try {
    const drug = await Drug.findOne({ _id: id });
    if (drug.quantity < quantity) {
      return res.status(400).send({
        error: {
          message: "Invalid quantity"
        }
      });
    }
    drug.quantity -= quantity;
    await drug.save();
    return res.status(200).json(drug);
  } catch (error) {
    res.status(400).json({ error: { message: "Bad request" } });
  }
});

app.delete("/drug", async (req, res) => {
  const id = req.body.id;

  if (id === undefined) {
    return res.status(400).send("id is wrong");
  }

  try {
    const drug = await Drug.findOne({ _id: id });
    await drug.remove();
    return res.status(200).send("ok");
  } catch (error) {
    res.status(400).json({ error: { message: "Bad request" } });
  }

  // for (let i = 0; i < drugstore.length; i++) {
  //   if (drugstore[i]._id === id) {
  //     drugstore.splice(i, 1); // Ici on supprime le Ieme medoc
  //     return res.send("Ok");
  //   }
  // }
  // // Si j'arrive ici c'est que le medicament avec l'id reçu n'a pas ete trouve
  // return res.status(400).send({
  //   error: {
  //     message: "Bad request"
  //   }
  // });
});

app.listen(3000, () => {
  console.log("Server started");
});
