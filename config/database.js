if(process.env.NODE_ENV === 'production'){
    module.exports = {mongoURI: 'mongodb://CHANGEME'}
  } else {
    module.exports = {mongoURI: 'mongodb://localhost:27017/bookaride'}
  }
