const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const tripSchema = new Schema({
    currentLocation: {
        type: String,
        required: true
    },
    destination: {
        type: String,
        required: true
    },
    driver: {
        type: String,
    },
    user: {
        type: String,
    },
    passenger: {
        type: String
    },
    departure: {
        type: String,
        default: Date.now
    }
});

const tripModel = mongoose.model('trip', tripSchema);

module.exports = tripModel;