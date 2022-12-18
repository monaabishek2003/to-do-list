//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const lodash = require("lodash");

const app = express();
// mongoose.connect("mongodb+srv://monaabishek:monaabishek@cluster0.3lsknj5.mongodb.net/todolist");
mongoose.connect("mongodb://localhost:27017/todoDB");
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
const day = date.getDate();


const itemsschema = mongoose.Schema({
  name:String
});
const listschema = mongoose.Schema({
  name:String,
  items:[itemsschema]
});

const List = mongoose.model("List",listschema);
const Item = mongoose.model("Item",itemsschema);



var item1 = {
  name:"how to change you"
}



const item2 = new Item({
  name:"Hit the + button to add a new Item"
});
const item3 = new Item({
  name:"<--Hit this to delete an item"
});
const defaultItems = [item1,item2,item3];


app.get("/", function(req, res) {
  Item.find({},function(err,founditems){
    if (founditems.length === 0){
      Item.insertMany(defaultItems,function(err){
        if (err){
          console.log(err);
        }else{
          console.log("the default items has been saved sucessfully")
        }
      });
      res.redirect("/")
    }else {
      res.render("list", {listTitle: day, newListItems: founditems});
    }
  });
});
// app.get("/:customListName",function(req,res){

//   const customListName = lodash.capitalize(req.params.customListName);
//   List.findOne({name:customListName},function(err,foundlist){
//     if(!err){
//       if(!foundlist){
//         const list = new List({
//           name:customListName,
//           items:defaultItems
//         })
//         list.save()
//         res.redirect("/"+customListName);
//       }else{
//         res.render("list", {listTitle:foundlist.name , newListItems: foundlist.items});
//       }
//     }else{
//       console.log(err);
//     }
//   })

// });

app.get("/:CustomListName",(req,res)=>{
  const customListName = lodash.capitalize(req.params.CustomListName);
  List.findOne({name:customListName},(err,foundlist)=>{
    if(!err){
      if(!foundlist){
        const list = new List({
          name:customListName,
          items:defaultItems
        });
        list.save();
        res.redirect("/"+customListName);
      }else{
        res.render("list",{listTitle:foundlist.name,newListItems:foundlist.items});
      }
    }else{
      console.log(err);
    }
  })
})




app.post("/", (req,res) =>{
  const itemName = req.body.newItem;
  const listName = req.body.list;
  console.log(itemName,listName,day);

  const item = new Item({
    name:itemName
  });
  if (listName === day) {
    item.save();
    res.redirect("/");  
   } else {
    List.findOne({name:listName},function(err,foundlist){
      if(err){
        console.log(err);
      }
        foundlist.items.push(item);
        foundlist.save();
        res.redirect("/"+listName);
      
    });
  };
});


app.post("/delete",function(req,res){
  const delitemid = req.body.checkbox;
  const listName = req.body.list;
  if (listName === day) {
    Item.findByIdAndDelete(delitemid,function(err){
      if (err){
        console.log(err);
      }else{
        console.log("sucessfully deleted")
        console.log(listName)
        res.redirect("/")
      }
    }) 
   }else{
     console.log(delitemid,listName)
     List.findOneAndUpdate(
      {name:listName},
      {$pull:{items:{_id:delitemid}}},
      function(err,foundlist){
        if(err){
          console.log(err);
        }else{
          res.redirect("/"+listName)
        }
      }
      );
     
   }
});


// app.get("/work", function(req,res){
//   res.render("list", {listTitle: "Work List", newListItems: workItems});
// });

// app.get("/about", function(req, res){
//   res.render("about");
// });

app.listen(process.env.PORT || 4000,function(){
  console.log("your server is running sucessfully")
})