var app = require("express")();
var http = require("http").createServer(app);
var io = require("socket.io")(http);
const cors=require('cors')
var clients = {};
var msgs = [];
var date = new Date();
var bodyParser = require("body-parser");
const connection = require("./database");
const User = require("./user");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const jwt = require("jwt-simple");
var secret="ASdasdasdasdasdawd454aw5daw6"
//const salt = bcrypt.genSaltSync(saltRounds);

//Parte das rotas com app
//Rota para cadastro de usuario e retorno de token

//Adicionando middleware para o express
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors())


//Rota para cadastro de usuários, já encriptando o password do usuário.
app.post("/signup", (req, res) => {
  const user = { ...req.body };
  if (user.name && user.password && user.email) {
    bcrypt.hash(user.password, saltRounds).then(function (hash) {
      var createUser = User.create({
        name: user.name,
        email: user.email,
        pwd: hash,
      });
      if (createUser) {
        return res.json({
          status: 204,
          message: "Cadastrado com sucesso.",
        });
      } else {
        res.json({
          status: 404,
          message: "Valores informados inválidos",
        });
      }
    });
  }
});

//Rota para signin e retorno do token para usuário
app.post("/signin", async(req, resp) => {
  const now = Math.floor(Date.now() / 1000);
  const user = { ...req.body };
  if (user.email && user.password) {
 await User.findOne({ email: user.email })
      .then((res) => {
      bcrypt.compare(user.password, res.pwd, function(err, result) {  
        if(result){
          const payload = {
            name: res.name,
            email: res.email,
            nickanme:res.nickname,
            url:res.url,
            iat: now,
            exp: now + 60 * 60 * 24,
          };  
          resp.json({        
            token: jwt.encode(payload, secret)
          });  
        }else{
      resp.json({
        status:404,
        message:"Password inválido."
      })
        }
               
      })    
       
      })
      .catch((err) => {
       resp.json({ status: 404, message: "Usuário não encontrado." });
      });
  }

});


//Rota para validar token
app.post('/validate',(req,res)=>{
const token=req.body.token
try{
  if(token){
    var decoded = jwt.decode(token, secret);
    if(new Date(decoded.exp*1000)>new Date()){
      return res.send(decoded)
  }else{
    return res.json({
        status:401,
        message:"Token expirado."
      })
    } 
  }
}
catch(e){
  //problema com o token
  res.json({
    status:404,
    message:"Token inválido"
  })
}
  })

// Parte do chat com SocketIO
io.on("connection", function (client) {
  //juntando client ao server com join
  client.on("join", function (name) {
    //console.log("Joined: " + name);
    clients[name] = name;
    //client.emit("update", "You have connected to the server.");
    client.broadcast.emit("update", clients);
    client.emit("update", clients);
    client.emit("chat", msgs);
  });
  client.on("send", function (msg) {
    //console.log("Message: " + msg);
    msg.push(client.id);
    msg.push(date.toLocaleString());
    msgs.push(msg);
    client.broadcast.emit("chat", msgs);
    client.emit("chat", msgs);
  });

  client.on("disconnect", function () {
    delete clients[client.id];
    io.emit("update", clients);
  });
});

http.listen(4000, () => {
  console.log("Server running on port 4000");
});
