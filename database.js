const mongoose= require('mongoose')

var connection = mongoose.connect('mongodb+srv://admin:3571592486@cluster0.ebc1x.mongodb.net/Users?retryWrites=true&w=majority',{ useNewUrlParser: true ,useUnifiedTopology: true })
if(connection){
    console.log("Conexão ao mongodb")
}else{
    console.log("Erro ao conectar ao mongodb")
}
module.exports = connection;