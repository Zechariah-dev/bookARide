const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Driver = require('../models/Driver');
const Trip = require('../models/Trip');
const jwtSecret = process.env.JWT_SECRET;

const register = async (req, res) => {
  const { firstname, lastname, email, password } = req.body;

  const existingUser = await User.find({ email: email });

  if (existingUser) {
    res.status(201).json({
      message: "Email already registered, please proceed to login"
    })
  } else {
    const newUser = new User({ firstname, lastname, email, password });
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(newUser.password, salt, (err, hash) => {
        if (err) console.log(err);
        newUser.password = hash;
        newUser.save()
          .then(user => {
            res.json({
              message: "Registration successful",
              user: user
            })
          })
          .catch(err => {
            console.log(err);
          })

      })
    })
  }
}

const login = async (req, res) => {
  const { email, password } = req.body;
  const loginUser = await User.findOne({ email: email });
  if (loginUser) {
    bcrypt.compare(password, loginUser.password, async (err, isMatch) => {
      if (err) console.log(err);
      if (isMatch) {
        jwt.sign({ email: email }, jwtSecret, { expiresIn: '1h' }, (err, token) => {
          res.cookie('auth', token);
          res.status(200).json({
            message: "login successful",
            token: token,
            user: loginUser.email
          })
        })
      } else {
        res.status(404).json({
          message: "User not found, please register"
        })
      }
    })
  }
}

const request = async (req, res) => {
  // console.log(req.params.passenger)
  const { currentLocation, destination, departure } = req.body;
  const totalPassenger = req.params.passenger;
  const token = req.cookies.auth;
  let requestUser = null;

  jwt.verify(token, jwtSecret, async (err, authData) => {
    if (err) {
      res.json({
        message: "please sign in again"
      })
    } else {
      requestUser = authData.email
    }
  })

  const availableDrivers = await Driver.find({ available: true });
  const totalAvailableDriver = availableDrivers.length;
  const capacityArray = [];

  for (i = 0; i < totalAvailableDriver; i++) {
    // console.log(availableDrivers[i].capacity)
    let driverEmail = availableDrivers[i].email;
    let driverCapacity = availableDrivers[i].capacity;
    if (driverCapacity >= totalPassenger) {
      capacityArray.push({ driverEmail, driverCapacity });
    }
  }

  function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1));
  }

  let capLength = capacityArray.length;
  console.log(capLength);
  if (capLength > 0) {
    let randomNumber = getRandomNumber(1, capLength);
    let randomDriver = capacityArray[randomNumber];
    const updatedDriver = await Driver.updateOne({ email: randomDriver.driverEmail }, { $set: { available: false } });
    const newTrip = new Trip({ currentLocation, destination, driver: randomDriver.driverEmail, departure, user: requestUser })
    const savedTrip = await newTrip.save();
    // console.log(randomNumber);
    res.json({ newTrip })
  } else {
    res.json({
      message: "No available driver for your requested capacity"
    })
    // console.log("present sir");
  }
}

const arrived = async (req, res) => {
  const { driver, rating } = req.body;
  const token = req.cookies.auth;
  let requestUser = null;

  jwt.verify(token, jwtSecret, async (err, authData) => {
    if (err) {
      res.json({
        message: "please sign in again"
      })
    } else {
      requestUser = authData.email
    }
  })


  const completedTrip = await Trip.findOneAndDelete({ driver: driver })
  if (completedTrip) {
    const freeDriver = await Driver.findOne({ email: driver });

    prevRating = freeDriver.rating;
    newRating = ((prevRating + parseFloat(rating)) / 2).toFixed(2)

    //setting new driver properties
    freeDriver.available = true;
    freeDriver.rating = newRating;

    await freeDriver.save();

    res.json({
      message: "Thank for using our service",
      driver: freeDriver,
      user: requestUser
    })
  } else {
    res.status(404).json({
      message: " request not found"
    })
  }



}

module.exports = {
  register, login, request, arrived
}
