const mongoose = require('mongoose')

async function connect(){
    try{
        await mongoose.connect('mongodb://localhost:27017/thuc_tap_nodejs');
        console.log('Connect Successfully')
    }catch(error){
        console.log('Fail')
    }
}

module.exports = {connect}