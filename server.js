const express = require('express');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const session = require('express-session'); // Add session middleware
const app = express();

// Set the view engine to EJS
app.set('view engine', 'ejs');

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// Middleware to parse incoming requests
app.use(bodyParser.urlencoded({ extended: true }));

// Session middleware
app.use(
  session({
    secret: 'your_secret_key', // Replace with your secret key
    resave: false,
    saveUninitialized: false,
  })
);

// Middleware to include current date and time
app.use((req, res, next) => {
  res.locals.currentDateTime = new Date().toLocaleString();
  res.locals.user = req.session.user || null; // Add user session info to locals
  next();
});

// Routes
app.get('/', (req, res) => res.render('home'));
app.get('/pets', (req, res) => res.render('pets'));
app.get('/find_dog_cat', (req, res) => res.render('find_dog_cat'));
app.get('/dog_care', (req, res) => res.render('dog_care'));
app.get('/cat_care', (req, res) => res.render('cat_care'));
app.get('/contact_us', (req, res) => res.render('contact_us'));
app.get('/Disclaimer', (req, res) => res.render('disclaimer'));
app.get('/register', (req, res) => res.render('register', { errorMessage: '', successMessage: '' }));
app.get('/login', (req, res) => res.render('login', { errorMessage: '' }));
//loggout
app.get('/logout', (req, res) => {
  req.session.destroy(err => {
      if (err) {
          console.error(err);
          return res.status(500).send('Error logging out');
      }
      res.send('You have been logged out successfully');
  });
});
// Middleware to check if the user is logged in
function isAuthenticated(req, res, next) {
  if (req.session.user) {
    return next();
  }
  res.redirect('/login');
}

// Rehabilitate Route (Pet registration form, requires login)
app.get('/rehabilitate', isAuthenticated, (req, res) => res.render('rehabilitate'));

// Register Route
app.post('/register', (req, res) => {
  const { username, password } = req.body;

  // Validate username and password format
  const usernameRegex = /^[a-zA-Z0-9]+$/;
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{4,}$/;

  if (!usernameRegex.test(username) || !passwordRegex.test(password)) {
    return res.render('register', {
      errorMessage: 'Invalid username or password format.',
      successMessage: '',
    });
  }

  // Check for existing user
  fs.readFile(path.join(__dirname, 'data', 'login.txt'), 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading file:', err);
      return res.status(500).render('register', {
        errorMessage: 'Server error. Please try again later.',
        successMessage: '',
      });
    }

    const users = data.split('\n');
    const existingUser = users.find((user) => user.split(':')[0] === username);

    if (existingUser) {
      return res.render('register', {
        errorMessage: 'Username is already taken. Please choose another one.',
        successMessage: '',
      });
    }

    // Append new user to data/login.txt
    const newUser = `${username}:${password}\n`;
    fs.appendFile(path.join(__dirname, 'data', 'login.txt'), newUser, (err) => {
      if (err) {
        console.error('Error writing to file:', err);
        return res.status(500).render('register', {
          errorMessage: 'Server error. Please try again later.',
          successMessage: '',
        });
      }
      res.render('register', {
        errorMessage: '',
        successMessage: 'Registration successful! You can now login.',
      });
    });
  });
});

// Login Route
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const credentials = `${username}:${password}`;

  // Read data/login.txt and check credentials
  fs.readFile(path.join(__dirname, 'data', 'login.txt'), 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading file:', err);
      return res.status(500).render('login', { errorMessage: "Server error. Please try again later." });
    }
    const users = data.split('\n');
    if (users.includes(credentials)) {
      req.session.user = username; // Set session user
      res.redirect('/rehabilitate'); // Redirect to pet registration page
    } else {
      res.status(401).render('login', { errorMessage: "Invalid username or password. Please try again." });
    }
  });
});

// Logout Route
app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/'); // Redirect to home after logout
  });
});

// Pet Registration Route (form submission)
app.post('/register_pet', isAuthenticated, (req, res) => {
  const { petName, petType, breed, age, gender, notes, precaution, username, email } = req.body;

  // Read the current pet data to determine the next ID
  fs.readFile(path.join(__dirname, 'data', 'pets.txt'), 'utf8', (err, data) => {
    if (err && err.code !== 'ENOENT') {
      console.error('Error reading pets file:', err);
      return res.status(500).send('Server error');
    }

    // Ensure each line starts with "User: " to be counted as an entry
    const pets = data ? data.split('\n\n').filter(line => line.startsWith('User: ')) : [];
    const nextId = pets.length + 1; // Calculate the next ID based on the number of entries

    const owner = req.session.user;

    // Construct a formatted string for petInfo
    const petInfo = `User: ${nextId}
Owner: ${owner}
Name of Pet: ${petName}
Type of Pet: ${petType}
Breed of Pet: ${breed}
Age of Pet: ${age}
Gender of Pet: ${gender}
Notes: ${notes}
Precaution to be Taken: ${precaution}
Username: ${username}
User Email: ${email}\n\n`;

    // Append the new pet information to the file
    fs.appendFile(path.join(__dirname, 'data', 'pets.txt'), petInfo, (err) => {
      if (err) {
        console.error('Error writing to pets file:', err);
        return res.status(500).send('Server error');
      }
      res.send('Pet registration successful');
    });
  });
});
// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
