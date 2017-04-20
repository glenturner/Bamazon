var mysql = require('mysql');
var inquirer = require('inquirer');
var Table = require('console.table');
var colors = require('colors');

//establish connection
  var connection = mysql.createConnection({
    host    :'localHost',
    user    :'root',
    password  :'root',
    port    :'8889',
    database    :'Bamazon'
  });

// Check to see if connection is successful
connection.connect(function(err){
  if(err) throw err;
  console.log('Connected as id ' + connection.threadId);
  displayInventory();
});

var managerView = function () {
    // ask user what product and how many they would like to buy
    inquirer.prompt([
        {
            type: 'list',
            name: 'diplay',
            message: 'What would you like to do?',
            choices: ['Products for Sale', 'Display Low Inventory', 'Add to Inventory', 'Add New Product', 'Disconnect']
        }
    ]).then(function (data) {
        switch (data.display) {
            case 'Products for Sale':
                console.log('Current Inventory:');
                displayInventory();
                break;
            case 'Display Low Inventory':
                console.log('Low Inventory:');
                displayInventory();
                break;
            case 'Add to Inventory':
                console.log('Add Inventory:');
                addInventory();
                break;
            case 'Add New Product':
                console.log('Add New Product:');
                newProduct();
                break;
            case 'Disconnect':
                console.log('You are signed out!');
                connection.end();
                break;
            default:
                console.log('Error.')
        } // end switch //
    }); // end .then //
}; // end managerview //

var displayInventory = function() {
    var displayInvQuery = 'SELECT * FROM `products`';
    connection.query(displayInvQuery, function (err, res) {
        if (err) throw err;

     console.table(res);
      

        managerView();
    }); // end connection.query
}; // end showAllInventory()



