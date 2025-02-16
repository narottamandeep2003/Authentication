const express = require('express');
const session = require('express-session');
const app = express();
const port = 3000;

// In-memory storage for users and todos
let users = [
    { username: 'user1', password: 'password1' },
    { username: 'user2', password: 'password2' }
];

let todos = {
    user1: [],
    user2: []
};

// Middleware to parse the request body
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Session setup
app.use(session({
    secret: 'secret_key',
    resave: false,
    saveUninitialized: true
}));

// View engine setup (EJS)
app.set('view engine', 'ejs');

// Routes

// Home page
app.get('/', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    const userTodos = todos[req.session.user.username];
    res.render('index', { username: req.session.user.username, todos: userTodos });
});


// Login page
app.get('/login', (req, res) => {
    if (req.session.user) {
        return res.redirect('/');
    }
    res.render('login', { error: null });  // Pass an empty error or null if no error
});

// Login handling
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
        req.session.user = user;
        return res.redirect('/');
    }
    res.render('login', { error: 'Invalid credentials' });  // Pass error message
});


// Logout
app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login');
    });
});

// Add a new to-do
app.post('/add-todo', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    const { todo } = req.body;
    todos[req.session.user.username].push(todo);
    res.redirect('/');
});

// Remove a to-do
app.post('/remove-todo', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    const { todo } = req.body;
    todos[req.session.user.username] = todos[req.session.user.username].filter(t => t !== todo);
    res.redirect('/');
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
