var userDB=require('./models/user')

const bcrypt = require('bcrypt');

//create and save new user
exports.create=(req,res)=>{

    const saltRounds = 10; // choose a value that works for you
const plainTextPassword = req.body.password;

    //validate request
    bcrypt.hash(plainTextPassword, saltRounds, function(err, hashedPassword) {
        if (err) {
          // handle error
        } else {
          const user = new userDB({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password
          });
      
          // save user in the database
          user.save()
            .then(data => {
              res.redirect('/add-user');
            })
            .catch(err => {
              res.status(500).send({
                message: err.message || "some error occurred while creating a create operation"
              });
            });
        }
      });
   

}



//retrive and  new user

exports.find=(req,res)=>{

    if (req.query.id) {
        const id=req.query.id
        userDB.findById(id)
        .then(data=>{
            if (!data) {
                res.status(400).send({message:"Data to update can note be empty"});
               

                
            }else{
                res.send(data)
            }
        })
        .catch(err=>{
            res.send(500).send({message:"Error user id"+id})
        })

        
    }else{

        userDB.find()
        .then(user=>{
            res.send(user)
        })
        .catch(err=>{
            res.status.send({message:err.message||"error occured while user information"})
        })

    }


   
}


//update

exports.update = (req, res) => {
    if (!req.body) {
      return res.status(400).send({ message: "Data to update cannot be empty" });
    }
  
    const id = req.params.id;
    userDB.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
      .then(data => {
        if (!data) {
          res.status(404).send({ message: `Cannot update user with id=${id}. Maybe user not found!` });
        } else {
          res.send(data);
        }
      })
      .catch(err => {
        res.status(500).send({ message: "Error updating user information" });
      });
  };
exports.delete = (req, res) => {
    const id = req.params.id;

    userDB.findByIdAndDelete(id)
        .then(data => {
            if (!data) {
                res.status(404).send({ message: `Cannot delete user with ${id}. Maybe user not found.` });
            } else {
                res.send({ message: "User was deleted successfully!" });
            }
        })
        .catch(err => {
            res.status(500).send({ message: "Error deleting user information " + id });
        });
};



