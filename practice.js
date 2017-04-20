var inquirer = require('inquirer'),
    Table = require('cli-table'),
    mysql = require('mysql');

var connection = mysql.createConnection({
    host: 'localhost',
    port: 8889,

    // Your username
    user: 'root',

    // Your password
    password: 'root',
    database: 'Bamazon'
});

// establishes connection with database and runs showProducts()
connection.connect(function (err) {
    if (err) throw err;
    console.log('Hello Manager! Welcome to work. You\'re connected as id ' + connection.threadId + '.');
    welcomeToWork();
});

var welcomeToWork = function () {
    // ask user what product and how many they would like to buy
    inquirer.prompt([
        {
            type: 'list',
            name: 'toDo',
            message: 'What would you like to do?',
            choices: ['View Products for Sale', 'View Low Inventory', 'Add to Inventory', 'Add New Product', 'Disconnect']
        }
    ]).then(function (data) {
        switch (data.toDo) {
            case 'View Products for Sale':
                console.log('Inventory in stock:');
                showAllInventory();
                break;
            case 'View Low Inventory':
                console.log('Low Inventory:');
                showLowInventory();
                break;
            case 'Add to Inventory':
                console.log('Add to Inventory:');
                addInventory();
                break;
            case 'Add New Product':
                console.log('Add New Product:');
                newProduct();
                break;
            case 'Disconnect':
                console.log('Goodbye!');
                connection.end();
                break;
            default:
                console.log('Something went wrong.')
        } // end switch()
    }); // end .then
}; // end welcomeToWork()

var showAllInventory = function() {
    var allInvQuery = 'SELECT * FROM `products`';
    connection.query(allInvQuery, function (err, res) {
        if (err) throw err;

        // initializes new cli-table
        var table = new Table({
            head: ['Product ID', 'Product Name', 'Price', 'Inventory']
            , colWidths: [13, 40, 10, 12]
        });

        for (var i = 0; i < res.length; i++) {
            table.push(
                [res[i].id, res[i].product_name, res[i].price, res[i].stock_quantity]
            );
        }

        console.log(table.toString());

        welcomeToWork();
    }); // end connection.query
}; // end showAllInventory()

var showLowInventory = function() {
    var lowInvQuery = 'SELECT * FROM `products` WHERE `stock_quantity` < 5';
    connection.query(lowInvQuery, function (err, res) {
        if (err) throw err;
        if (res > 0) {
        // initializes new cli-table
        var table = new Table({
            head: ['Product ID', 'Product Name', 'Price', 'Inventory']
            , colWidths: [13, 40, 10, 12]
        });

        for (var i = 0; i < res.length; i++) {
            table.push(
                [res[i].id, res[i].product_name, res[i].price, res[i].stock_quantity]
            );
        }

        console.log(table.toString());
        } else {
            console.log('There are at least 5 units in stock of all items at this time.');
        }
        welcomeToWork();
    }); // end connection.query
}; // end showLowInventory()

var addInventory = function() {
    console.log('add inventory');
    inquirer.prompt([
        {
            type: 'input',
            name: 'productId',
            message: 'Enter product ID number of item to Restock',
            validate: function (value) {
                var valid = !isNaN(parseFloat(value));
                return valid || 'Please enter a number';
            },
            filter: Number
        },
        {
            type: 'input',
            name: 'quantity',
            message: 'Number to Restock',
            validate: function (value) {
                var valid = !isNaN(parseFloat(value));
                return valid || 'Please enter a number';
            },
            filter: Number
        }
    ]).then(function (answer) {
        // query database for selected item id
        var addInvQuery = 'SELECT * FROM `products` WHERE ?';
        connection.query(addInvQuery, [{id: answer.productId}], function (err, res) {
            if (err) throw err;
            // add inventory to existing stock_quantity
            var newInv = res[0].stock_quantity + answer.quantity;
            connection.query("UPDATE `products` SET ? WHERE ?", [
                {
                    stock_quantity: newInv
                },
                {
                    id: res[0].id
                }
            ], function (err, res) {
                if (err) throw err;
                console.log('Restock successful.');
                inquirer.prompt([
                    {
                        type: 'list',
                        name: 'doNext',
                        message: 'What would you like to do?',
                        choices: ['Add More Inventory', 'Main Menu', 'Disconnect']
                    }
                ]).then(function (data) {
                    switch (data.doNext) {
                        // if user selects to continue shopping, display products
                        case 'Add More Inventory':
                            addInventory();
                            break;
                        case 'Main Menu':
                            welcomeToWork();
                            break;
                        case 'Disconnect':
                            console.log('Goodbye!');
                            // end server connection
                            connection.end();
                            break;
                        default:
                            console.log('something went wrong')
                    } // end switch()
                }); // end .then
            }); // end connection.query update
        }); // end connection.query addInvQuery
    }); // end .then

}; // end addInventory()

var newProduct = function() {
    console.log('Please enter new product details:');
    inquirer.prompt([
        {
            type: 'input',
            name: 'itemName',
            message: 'Item Name'
        },
        {
            type: 'input',
            name: 'deptName',
            message: 'Department Name'
        },
        {
            type: 'input',
            name: 'price',
            message: 'Price',
            validate: function (value) {
                var valid = !isNaN(parseFloat(value));
                return valid || 'Please enter a number';
            },
            filter: Number
        },
        {
            type: 'input',
            name: 'quantity',
            message: 'Stock Quantity',
            validate: function (value) {
                var valid = !isNaN(parseFloat(value));
                return valid || 'Please enter a number';
            },
            filter: Number
        }
    ]).then(function (answer) {
        connection.query("INSERT INTO products SET ?", {
            product_name: answer.itemName,
            department_name: answer.deptName,
            price: answer.price,
            stock_quantity: answer.quantity
        }, function (err, res) {
            console.log('New product added.');
            inquirer.prompt([
                {
                    type: 'list',
                    name: 'doNext',
                    message: 'What would you like to do?',
                    choices: ['Add Another Product', 'Main Menu', 'Disconnect']
                }
            ]).then(function (data) {
                switch (data.doNext) {
                    // if user selects to continue shopping, display products
                    case 'Add More Inventory':
                        newProduct();
                        break;
                    case 'Main Menu':
                        welcomeToWork();
                        break;
                    case 'Disconnect':
                        console.log('Goodbye!');
                        // end server connection
                        connection.end();
                        break;
                    default:
                        console.log('something went wrong')
                } // end switch()
            }); // end .then() doNext
        }); // end connection.query insert to products
    }); // end .then() new product inquirer prompt
}; // end newProduct()