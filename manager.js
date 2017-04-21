var mysql = require('mysql');
var inquirer = require('inquirer');
var Table = require('console.table');
var colors = require('colors');

//establish connection
var connection = mysql.createConnection({
    host: 'localHost',
    user: 'root',
    password: 'root',
    port: '8889',
    database: 'Bamazon'
});

// Check to see if connection is successful
connection.connect(function(err) {
    if (err) throw err;
    console.log('Connected as id '.inverse + connection.threadId);
    managerView();
});

var displayTable = function() {
    let query = 'SELECT * FROM products';
    connection.query(query, function(error, res, field) {
        console.log('*****************************************************'.inverse.green);
        console.table(res);
        console.log('*****************************************************'.inverse.green);
    });
};

var managerView = function() {
    // ask user what product and how many they would like to buy
    inquirer.prompt([{
        type: 'list',
        name: 'next',
        message: 'What would you like to do?',
        choices: ['View Products for Sale', 'View Low Inventory', 'Add to Inventory', 'Add New Product', 'Disconnect']
    }]).then(function(data) {
        switch (data.next) {
            case 'View Products for Sale':
                console.log('Inventory in stock:');
                displayInventory();
                break;
            case 'View Low Inventory':
                console.log('Here is are the products that need to be restocked:');
                displayLowInventory();
                break;
            case 'Add to Inventory':
                console.log('Add to Inventory:');
                addInventory();
                break;
            case 'Add New Product':
                console.log('Add New Product:');
                addProduct();
                break;
            case 'Disconnect':
                console.log('You have signed out!');
                connection.end();
                break;
            default:
                console.log('Something went wrong.')
        } // end switch()
    }); // end .then
}; // end welcomeToWork()

var displayInventory = function() {
    let displayInvQuery = 'SELECT * FROM `products`';
    connection.query(displayInvQuery, function(err, res) {
        if (err) throw err;
        // displays table // 
        console.log("************************************************************************.".inverse.green);
        console.table(res);
        console.log("************************************************************************.".inverse.green);

        managerView();
    }); // end connection.query // 
}; // end showAllInventory // 

var displayLowInventory = function() {
    let lowInvQuery = 'SELECT * FROM `products` WHERE `stock_quantity` < 10';
    connection.query(lowInvQuery, function(err, res) {
        // displays table //
        console.log("*********************************************************************************".inverse.red);
        console.table(res);
        console.log("*********************************************************************************".inverse.red);
        if (err) throw err;
        if (res > 10) {
            console.log('All Inventory is stocked to par.'.inverse.green);
        }

        managerView();
    }); // end connection.query //
}; // end displayLowInventory // 

var addInventory = function() {
    displayTable();
    console.log('Restock Inventory'.inverse.yellow);
    inquirer.prompt([{
            type: 'input',
            name: 'productId',
            message: 'Enter product ID number of item to Restock'.inverse.yellow,
            validate: function(value) {
                var valid = !isNaN(parseFloat(value));
                return valid || 'Please enter a number';
            },
            filter: Number
        },
        {
            type: 'input',
            name: 'quantity',
            message: 'Number to Restock'.inverse.yellow,
            validate: function(value) {
                var valid = !isNaN(parseFloat(value));
                return valid || 'Please enter a number';
            },
            filter: Number
        }
    ]).then(function(answer) {
        // query database for selected item id
        var addInvQuery = 'SELECT * FROM `products` WHERE ?';
        connection.query(addInvQuery, [{
            id: answer.productId
        }], function(err, res) {
            if (err) throw err;
            // add inventory to existing stock_quantity
            var newInv = res[0].stock_quantity + answer.quantity;
            connection.query("UPDATE `products` SET ? WHERE ?", [{
                    stock_quantity: newInv
                },
                {
                    id: res[0].id
                }
            ], function(err, res) {
                if (err) throw err;
                console.log('Restock successful.'.inverse.green);
                inquirer.prompt([{
                    type: 'list',
                    name: 'next',
                    message: 'Please use the arrow to pick an option on the menu.',
                    choices: ['Add More Inventory', 'Main Menu', 'Disconnect']
                }]).then(function(data) {
                    switch (data.next) {
                        // if user selects to continue shopping, display products
                        case 'Add More Inventory':
                            addInventory();
                            break;
                        case 'Main Menu':
                            managerView();
                            break;
                        case 'Disconnect':
                            console.log('You have signed out!'.inverse.cyan);
                            // end server connection
                            connection.end();
                            break;
                        default:
                            console.log('Error!'.inverse.red);
                    } // end switch // 
                }); // end .then //
            }); // end connection.query update // 
        }); // end connection.query inv //
    }); // end .then //

}; // end addInventory // 

var addProduct = function() {
    console.log('Enter product information:'.inverse);
    inquirer.prompt([

        {
            type: 'input',
            name: 'itemName',
            message: 'Item Name'
        },
        {
            type: 'input',
            name: 'deptName',
            message: 'Department'
        },
        {
            type: 'input',
            name: 'price',
            message: 'Price US$',
            validate: function(value) {
                var valid = !isNaN(parseFloat(value));
                return valid || 'Please enter a number';
            },
            filter: Number
        },
        {
            type: 'input',
            name: 'quantity',
            message: 'Stock Quantity',
            validate: function(value) {
                var valid = !isNaN(parseFloat(value));
                return valid || 'Please enter a number';
            },
            filter: Number
        }
    ]).then(function(answer) {
        connection.query("INSERT INTO products SET ?", {
            product_name: answer.itemName,
            department_name: answer.deptName,
            price: answer.price,
            stock_quantity: answer.quantity,
        }, function(err, res) {
            console.log('Product added sucessfully!'.inverse.green);
            inquirer.prompt([{
                type: 'list',
                name: 'doNext',
                message: 'What would you like to do?',
                choices: ['Add Another Product', 'Main Menu', 'Disconnect']
            }]).then(function(data) {
                switch (data.doNext) {
                    // if user selects to continue shopping, display products //
                    case 'Add More Inventory':
                        addProduct();
                        break;
                    case 'Main Menu':
                        managerView();
                        break;
                    case 'Disconnect':
                        console.log('Goodbye!');
                        // end server connection // 
                        connection.end();
                        break;
                    default:
                        console.log('something went wrong')
                } // end switch // 
            }); // end .then Next //
        }); // end connection.query insert to products //
    }); // end .then new product inquirer prompt //
}; // end newProduct //