const bcrypt = require('bcrypt');
const User = require('../models/user');

exports.adminPanel = async (req, res) => {
  try {
    const users = await User.find();
    res.render('adminPanel', { title: 'Admin Panel', users, errorAdmin: req.session.errorAdmin });
    req.session.errorAdmin = null;
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

exports.addUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      req.session.errorAdmin = 'User with this username already exists';
      res.redirect('/admin');
      return;
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();

    res.redirect('/admin');
  } catch (error) {
    console.error(error);
    req.session.errorAdmin = 'Error occurred while adding user';
    res.redirect('/admin');
  }
};


exports.deleteUser = async (req, res) => {
  const userId = req.params.id;
  try {
    await User.findByIdAndDelete(userId);
    res.redirect('/admin');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};

exports.editUserPage = async (req, res) => {
  const userId = req.params.id;
  try {
    const user = await User.findById(userId).select('-password');
    res.render('editUser', { user });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};

exports.editUser = async (req, res) => {
  const userId = req.params.id;
  const { username } = req.body;
  try {
    await User.findByIdAndUpdate(userId, { username });
    res.redirect('/admin');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};
