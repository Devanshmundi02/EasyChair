const mongoose = require('mongoose');
const mongoURI = 'mongodb+srv://EasyChair07:Echair07@aaaddg.cdg5cao.mongodb.net/?retryWrites=true&w=majority'
const mongoDB = async () => {
    await mongoose.connect(mongoURI, { useNewUrlParser: true }, async (err, result) => {
        if (err) {
            console.log("---", err)
        }
        else {
            console.log("connected successfully");
        }
    });
}

module.exports = mongoDB;