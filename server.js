//Import Modules
const express = require('express');
const path = require('path');
const db = require('./db/db.json');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

//ADD TEST
const PORT = process.env.PORT || 3001;

//Instinitiate Express
const app = express();

//Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// GET Route for Notes Page a
app.get('/notes', (req, res) =>
  res.sendFile(path.join(__dirname, '/public/notes.html'))
);

// GET Route for API
app.get('/api/notes', (req, res) => res.json(db));

// POST Route for API
app.post('/api/notes', (req, res) => {
  const { title, text } = req.body;
  const userID = uuidv4();

  if (title && text) {
    // Generate a unique id for the a new note
    const newNote = {
      title,
      text,
      id: userID, // Use uuid.v4() to generate a unique id
    };

    // Add the new note to the db.json array
    db.push(newNote);

    // Write the updated notes back to db.json
    fs.writeFile('./db/db.json', JSON.stringify(db), (err) => {
      if (err) {
        console.error(err);
        res.status(500).json('Error writing to db.json');
        return;
      }

      const response = {
        status: 'success',
        body: newNote,
      };

      res.json(response);
    });
  } else {
    res.status(400).json('Title and text are required');
  }
});

// DELETE Route for API
app.delete('/api/notes/:id', (req, res) => {
    const noteId = req.params.id;
  
    // Find the index of the note with the given id in the db array
    const noteIndex = db.findIndex((note) => note.id === noteId);
  
    if (noteIndex !== -1) {
      // Remove the note from the db array
      db.splice(noteIndex, 1);
  
      // Write the updated notes back to db.json
      fs.writeFile('./db/db.json', JSON.stringify(db), (err) => {
        if (err) {
          console.error(err);
          res.status(500).json('Error writing to db.json');
          return;
        }
  
        res.json({ status: 'success', message: 'Note deleted successfully' });
      });
    } else {
      res.status(404).json('Note not found');
    }
  });

// GET Route for homepage
app.get('*', (req, res) =>
  res.sendFile(path.join(__dirname, '/public/index.html'))
);

app.listen(PORT, () =>
  console.log(`App listening at http://localhost:${PORT}`)
);