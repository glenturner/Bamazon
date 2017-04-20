var mysql = require('mysql');
var inquirer = require('inquirer');
var Table = require('console.table');
var colors = require('colors');
var itemQty;
/*var quantity;*/
var showTable;
var cartTotal;
var cartArray = [];
var itemArray = [];
var checkOutTotal;


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
});

var query = 'SELECT * FROM products';

connection.query(query, function(error, res, field){
console.log('****************************************************************************************'.green);
console.table(res);
console.log('*****************************************************************************************'.green);
customerRequest();
});


function customerRequest(cartTotal){
  // prompt customer for item id and,
  // validate their response against the number of items available
   inquirer.prompt([
        {
            type: 'input',
            name: 'item_id',
            message: 'What would you like to buy? (enter item ID number)'.inverse,
            validate: function (value) {
                var valid = !isNaN(parseFloat(value));
                return valid || 'Please enter a number';
            },
            filter: Number
        },
        {
            type: 'input',
            name: 'quantity',
            message: 'How many would you like to buy?'.inverse,
            validate: function (value) {
                var valid = !isNaN(parseFloat(value));
                return valid || 'Please enter a number';
            },
            filter: Number
        }
    ]).then(function (answer) {
        // check to see if inventory of selected product is available
        var inventoryQuery = 'SELECT * FROM `products` WHERE ? AND `stock_quantity` >= ?';
        connection.query(inventoryQuery, [{id: answer.item_id}, answer.quantity], function (err, res) {
            if (err) throw err;
            // if result of query is > 0, there is enough quantity available
            if (res.length > 0) {
                purchase(res, answer.quantity);
                  connection.query(query, function(error, res, field){
                    console.log('************************************'.green);
                    console.table(res);
                    console.log('************************************'.green);
                  });          

            } else {
               
                console.log('********************************************'.red);
                console.log(colors.red.inverse('Sorry, we do not have enough inventory to cover your order.'));
                console.log('********************************************'.red);
                customerRequest();
            }
        }); // end connection.query


    }); // end .then
    
} /*End of customerRequest*/

var purchase = function (purchaseItem, userQuant) {
    // calculate user's total
    var total = (purchaseItem[0].price * userQuant);
    var item = (purchaseItem[0].product_name);
    itemArray.push(item);
    console.log(colors.green.inverse("Items in cart: " + " " + itemArray +  ","));

    // array that hold all the values for the shopping cart // 
    cartArray.push(total);
    // This shows each value of each item in the array //
    console.log(colors.yellow.inverse("Amount for each item your cart $US Dollars: " + cartArray));
    cartTotal = total;
    var currentTotal = cartTotal;
    console.log(colors.blue.inverse('Your order for ' + userQuant + ' ' + purchaseItem[0].product_name + ' has been added to your cart.'));
    var cartItems = purchaseItem[0].product_name;
    var cartQuant = userQuant;
    updateSales(purchaseItem, total);
    // subtract amount purchased from stock quantity
    var newQuant = purchaseItem[0].stock_quantity - userQuant;
    // update database table `products`
    connection.query("UPDATE `products` SET ? WHERE ?", [
        {
            stock_quantity: newQuant
        },
        {
            id: purchaseItem[0].id
        }
    ], function (err, res) {
        if (err) throw err;
       /* console.log('Great Choice!'.cyan);*/
        inquirer.prompt([
            {
                type: 'list',
                name: 'action',
                message: 'What would you like to do?'.inverse,
                choices: ['Continue Shopping', 'Checkout']
            }
        ]).then(function (data) {
            switch (data.action) {
                // if user selects to continue shopping, display products
                case 'Continue Shopping':
                    console.log(colors.green.inverse("Your balance is now: " + currentTotal));
                    console.log(colors.inverse('Here\'s what we have in stock:'));
                    connection.query(query, function(error, res, field){
                    console.log('**********************************************************'.cyan);
                    console.table(res);
                    console.log('**********************************************************'.cyan);
                    customerRequest(cartTotal);
                  }); 
                    break;
                case 'Checkout':
                     function cartValue (total, num) {
                        return total + num;
                    }
                     checkOutTotal = cartArray.reduce(cartValue);
                    console.log('***************************************************************************************************'.blue);
                    console.table(purchaseItem, total);
                    console.log(colors.blue.inverse('Your order for ' + itemArray + ' is processing. Your total is: $' + checkOutTotal + " " + '.'));
                    console.log(colors.blue.inverse('Thanks for you purchase!'));
                    console.log('****************************************************************************************************'.blue);
                    currentTotal = 0;
                    console.log(colors.green.inverse("Your balance is now: " + currentTotal));
                    // end server connection
                    connection.end();
                    break;
                default:
                    console.log('Error!'.inverse.red)
            } // end switch
        }); // end .Then
    }); // end connection.query
}; // end purchase


var updateSales = function (purchaseItem, totalRev) {
    // updates `products` table with revenue information per item
    var salesQuery = 'SELECT * FROM `products` WHERE ?';
    connection.query(salesQuery, [{id: purchaseItem[0].id}], function (err, res) {
        if (err) throw err;
        // add new transRevenue to any existing revenue // 
        var newTotalSales = res[0].product_sales + totalRev;
        connection.query("UPDATE `products` SET ? WHERE ?", [
                {
                    product_sales: newTotalSales
                },
                {
                    id: res[0].id
                }
                
            ], function (err, res) {
                if (err) throw err;
            }
        ); // end connection.query update `products`
    }); // end connection.query salesQuery // 
}; // end updateSales //

var checkOut = function (purchaseItem, purchaseTotal,receipt ){
  // let receiptQuery = 'SELECT * FROM `products` WHERE `stock_quantity` < 10';
  //   connection.query(lowInvQuery, function (err, res) {
  //     // displays table //
  //     console.log("*********************************************************************************".inverse.red);
  //     console.table(res);
  //     console.log("*********************************************************************************".inverse.red);
  //       if (err) throw err;
  //       if (res > 10) {
  //           console.log('All Inventory is stocked to par.'.inverse.green);
  //       } 
};




