//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose")
const _ = require('lodash')

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect('mongodb+srv://admin-Fadil:fadil123@cluster0.2sslb.mongodb.net/todolistDB?retryWrites=true&w=majority', {useNewUrlParser: true, useUnifiedTopology: true})

const itemsSchema = {
  name: String
}

const Item = mongoose.model('item', itemsSchema)

const buy_food = new Item({
  name: 'buy_item'
})

const cook_food = new Item({
  name: 'cook_food'
})

const eat_food = new Item({
  name: 'eat_food'
})

const defaultItems = [buy_food, cook_food, eat_food]

const listSchema = {
  name: String,
  items: [itemsSchema]
}

const List = mongoose.model('List', listSchema)


app.get("/", function(req, res) {

  Item.find({}, function(err, foundItems){
    if (foundItems.length === 0){
      Item.insertMany(defaultItems, function(err){
        if (err) {
          console.log(err)
        } else {
          console.log('inserted')
        }
      })
      res.redirect('/')
    } else {
      res.render("list", {listTitle: 'Today', newListItems: foundItems});
    }
  })
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list

  const item =  new Item ({
    name: itemName
  })

  if (listName === 'Today'){
    item.save()
    res.redirect('/')
  } else {
    List.findOne({name: listName}, function(err, foundList) {
      foundList.items.push(item)
      foundList.save()
      res.redirect('/' + listName)
    }
    )}
}
);

app.post('/delete', function(req, res){
  const checkedItemId = req.body.checkbox
  const listName = req.body.listName

  if (listName === 'Today') {
    Item.findByIdAndRemove(checkedItemId, function(err){
      if (!err) {
        console.log('deleted!')
        res.redirect('/')
      } 
    })
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
      if (!err) {
        res.redirect('/' + listName)
      }
    })
  }


})

app.get('/:anything', function(req, res){
  const route = _.capitalize(req.params.anything)
  
  
  List.findOne({name:route}, function(err, foundList){
    if (!err) {
      if (!foundList) {
        const list = new List ({
          name: route,
          items: defaultItems
        })
    
      list.save()

      res.redirect('/' + route)
      } else {
        res.render('list', {listTitle:foundList.name, newListItems:foundList.items })
      }
    }
  })
    

})

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
