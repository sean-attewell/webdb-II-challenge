const express = require('express');
const helmet = require('helmet');
const knex = require('knex');

const server = express();

server.use(express.json());
server.use(helmet());

const db = knex({
  client: 'sqlite3',
  useNullAsDefault: true,
  connection: {
    filename: './data/lambda.sqlite3',
  },
})

// endpoints here

// addZoo
server.post('/api/zoos/', (req, res) => {
  db('zoos').insert(req.body)
    .then(arrayOfId => {
      return db('zoos').where({ id: arrayOfId[0] })
    })
    .then(arrayOfZoo => {
      res.status(201).json(arrayOfZoo[0])
    })
    .catch(err => {
      res.json({ error: "Some useful error message" });
    })
});


// getAllZoos
server.get('/api/zoos', async (req, res) => {
  try {
    const allZoos = await db('zoos');
    res.status(200).json(allZoos);
  } catch (error) {
    res.status(500).json({ error });
  }
});

// get zoo by ID
server.get('/api/zoos/:id', async (req, res) => {
  try {
    const zoo = await db('zoos').where({ id: req.params.id });
    if (zoo.length) {
      res.status(200).json(zoo[0]);
    } else {
      res.status(404).json({ message: "id doesn't exist " })
    }
  } catch (error) {
    res.status(500).json({ error });
  }
});


// deleteZooByID
server.delete('/api/zoos/:id', async (req, res) => {
  try {
    const numOfAffectedRows = await db('zoos').where({ id: req.params.id }).del();
    if (numOfAffectedRows > 0) {
      res.status(200).json({ message: `Zoo ${req.params.id} has been deleted.` });
    } else {
      res.status(404).json({ message: `The zoo with ID ${req.params.id} does not exist.` });
    }
  } catch (err) {
    res.status(500).json({ error: "The zoo could not be removed" });
  }
});

// server.delete('/api/zoos/:id', (req, res) => {
//   db('zoos').where({ id: req.params.id}).del()
//   .then(numOfAffectedRows => {
//       res.status(200).end();
//   })
//   .catch(err => {
//       res.json({message: "Failed to delete"})
//   })
// });


// updateZooById
server.put('/api/zoos/:id', async (req, res) => {
  const { id } = req.params;
  if (!req.body.name) {
    res.status(400).json({ errorMessage: "Please provide name for the zoo." });
  } else {
    try {
      const numOfAffectedRows = await db('zoos').where({ id }).update(req.body);
      if (numOfAffectedRows > 0) {
        const newZoo = await db('zoos').where({ id }).first()
        res.status(200).json(newZoo);
      } else {
        res.status(404).json({ message: `The zoo with ID ${id} does not exist.` });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "The zoo information could not be modified." });
    }
  }
});

// server.put('/api/zoos/:id', (req, res) => {
//   db('zoos').where({ id: req.params.id }).update(req.body)
//     .then(numOfAffectedRows => {
//       return db('zoos').where({ id: req.params.id }).first()
//     })
//     .then(zoo => {
//       res.json(zoo)
//     })
//     .catch(err => {
//       res.status(500).json(err);
//     })
// });


const port = 3300;
server.listen(port, function () {
  console.log(`\n=== Web API Listening on http://localhost:${port} ===\n`);
});
