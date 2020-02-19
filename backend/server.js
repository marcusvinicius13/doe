const express = require('express');
const nunjucks = require('nunjucks');

//Configurando o Servidor
const server = express();

//Configurar o servidor para apresentar arquivos estáticos
server.use(express.static('public'));

//Configurando a tmplate engine
nunjucks.configure('./', {
  express: server,
  noCache:true,
});

//habilitar o body do formulário
server.use(express.urlencoded({extended: true}));

// Configurar a conexão com o banco de dados
const Pool = require('pg').Pool;
const db = new Pool(
  {
    user: 'postgres',
    password: 'docker',
    host: '192.168.99.100',
    port: 5432,
    database: 'doe',
  }
);


//Configurando a apresentação da página
server.get('/', function (req, res){

  const donors = db.query('SELECT * FROM donors', function (err, result) {
    //Fluxo de erro
    if (err) return res.send('Erro ao inserir os dados.');
    
    //Lista de doadores
    const donors = result.rows;
    return res.render('index.html', {donors});
  });
});

server.post('/', function(req, res) {

  //Pegar dados do formulário
  const {name, email, blood} = req.body;

  // Valida as variáveis
  if(name == '' || email == '' || blood == '') {
    return res.send('Todos os campos são obrigatórios');
  }

  //Adicionar no banco de dados.
  const query = `
    INSERT INTO donors ("name", "email", "blood") 
    VALUES ($1,$2,$3)`;

  const values = [name, email, blood];

  db.query(query, values, function(err) {
    //Fluxo de erro
    if (err) return res.send('Erro ao inserir os dados.');

    //Fluxo ideal
    return res.redirect('/');
  });
});

// Ligar o servidor e permitindo acesso na porta 3000
server.listen(3000, function() {
  console.log('Server startad');
});