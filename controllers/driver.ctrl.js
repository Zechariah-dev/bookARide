const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Driver = require('../models/Driver')
const Trip = require('../models/Trip')

const jwtSecret = process.env.JWT_SECRET;


const register = async (req, res) => {
  // accountDetails is an array
  const { firstname, lastname, email, password } = req.body;

  const existingDriver = await Driver.findOne({ email: email });

  if (existingDriver) {
    res.json({
      message: "Email already registered, please proceed to login"
    })
  } else {
    const newDriver = new Driver({ firstname, lastname, email, password });
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(newDriver.password, salt, (err, hash) => {
        if (err) throw err;
        newDriver.password = hash;
        newDriver.save()
          .then(driver => {
            res.json({
              message: "Registration successful",
              driver: driver
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
  const loginDriver = await Driver.findOne({ email: email });
  if (loginDriver) {
    bcrypt.compare(password, loginDriver.password, async (err, isMatch) => {
      if (err) throw err;
      if (isMatch) {
        const updatedDriver = await Driver.updateOne({ email: email }, { $set: { available: true } });
        jwt.sign({ email: email }, jwtSecret, { expiresIn: '1h' }, (err, token) => {
          res.cookie('auth', token);
          res.status(200).json({
            message: "login successful",
            token: token,
            driver: loginDriver.email,
            available: true
          })
        })
      } else {
        res.json({
          message: "User not found, please register"
        })
      }
    })
  }
}

const addDetails = async (req, res) => {
  const { carModel, plateNumber, capacity, accountName, accountNumber, bankName } = req.body;

  const token = req.cookies.auth;
  let requestEmail = null;
  // console.log('present sir')

  jwt.verify(token, jwtSecret, async (err, authData) => {
    if (err) {
      res.json({
        message: "please sign in again"
      })
    } else {
      requestEmail = authData.email
    }
  })

  try {
    const requestedDriver = await Driver.findOne({ email: requestEmail })
    //adding New Details
    requestedDriver.plateNumber = plateNumber;
    requestedDriver.carModel = carModel;
    requestedDriver.capacity = capacity;
    requestedDriver.accountNumber = accountNumber;
    requestedDriver.accountName = accountName;
    requestedDriver.bankName = bankName;



    //pushing accountDetails
    // requestedDriver.accountDetails.push({accountName: accountName, accoutNumber: accoutNumber})
    // console.log(requestedDriver.accountDetails);

    const savedDriver = await requestedDriver.save();
    if (savedDriver) {
      res.json({
        message: "Details updated successfully",
        driver: savedDriver
      })
    } else {
      consol.log('wahala wa o');
    }
  } catch (err) {
    console.log(err);
  }

}

const checkBooking = async (req, res) => {
  const token = req.cookies.auth;
  let requestedDriver = null;

  jwt.verify(token, jwtSecret, async (err, authData) => {
    if (err) {
      res.json({
        message: "Problem verifying token, please log in"
      })
    } else {
      requestedDriver = authData.email;
    }
  })

  const activeBooking = await Trip.findOne({ driver: requestedDriver});

  if(activeBooking) {
    res.json({
      message: "You have a request remember punctuallity is important",
      customer: activeBooking.user,
      currentLocation: activeBooking.currentLocation,
      destination: activeBooking.destinaion,
      passenger: activeBooking.passenger,
      timeOfDeparture: activeBooking.departure
    })
  } else {
    res.json({
      message: "You have no active booking"
    })
  }
}

module.exports = {
  register, login, addDetails, checkBooking
}
