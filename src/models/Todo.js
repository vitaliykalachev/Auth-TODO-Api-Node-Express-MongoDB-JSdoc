const {Schema, model} = require('mongoose')

const Todo = new Schema({
    title: {type: String, required: true},
    description: {type: String, required: true}
    
})

module.exports = model('Todo', Todo)