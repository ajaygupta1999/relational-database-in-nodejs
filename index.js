const express = require("express");
const app = express();
var mysql      = require('mysql');
var bodyParser = require("body-parser");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended : true }));




var db = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  database : 'mysqldb'
});



db.connect((err) => {
    if(err){
        console.log(err);
    }else{
       console.log("Mysql database is connected");
    }
});


app.get("/" , (req, res) => {
    console.log("running server on home page");
    return res.json({ message : "Hey my server is running" });
});


app.get("/createdb" , async (req , res) => {
    try{
        let sql = 'CREATE DATABASE SQLTEST';
        db.query(sql , (err , result) => {
            if(err){
                console.log(err);
                return res.json({ error :  err });
            }

            console.log(result);
            return res.json({ result : result });
        });
    }catch(err){
        console.log(err.message)
    }
});



app.get("/updatedata" , async (req , res) => {
    try{
        // Insert value in user1 table ==
        // let sql = "INSERT INTO user1 VALUES (?,?,?,?)";
        // db.query(sql , [ "NULL" , "ajay" , "gupta" , "ajay gupta2"] ,  (err , result) => {
        //     if(err){
        //         return res.json({ err : err });
        //     }

        //     return res.json({  result : result });
        // });

        // get all rows from database
        let sql = "SELECT * FROM user1";
        db.query(sql , (err , rows , fields) => {
            if(err) 
               return res.json({ err });

            console.log(rows[0].firstname);
            return res.json({ rows , fields });
        });
        // return res.json(result);

    }catch(err){
        console.log(err.message);
    }
});


// Create all tables ==
app.get("/create/user" , (req , res) => {

    // User table == 
    let sql = `CREATE TABLE user (
        id int AUTO_INCREMENT PRIMARY KEY,
        name varchar(250) NOT NULL
    )`;

    db.query(sql , (err , result) => {
        if(err){
           return res.status(500).json({
                error : err.message
           });
        }

        console.log("user table is created");  
        return res.json("user table is created");
    });

});




app.get("/create/photo" , (req , res) => {
        // console.log("user table is created");  
        // photo = {
        //    id
        //    name,
        //    imgurl,
        //    des,
        // }
        let sqlofphoto = `CREATE TABLE photo (
            id int AUTO_INCREMENT PRIMARY KEY,
            name varchar(100) NOT NULL,
            imgurl varchar(500) NOT NULL,
            des varchar(500) NOT NULL
        )`;

        db.query(sqlofphoto , (err , result) => {
            if(err){
                return res.status(500).json({
                  error : err.message
                }); 
            }

            console.log("photo table is created");
            return res.json("photo table is created");
        });
});




app.get("/create/comment" , (req , res) => {
    // comment = {
    //     id
    //     text,
    //     userid,
    //     photoid
    // }
    let sqlcomment = `create table comment (
        id int AUTO_INCREMENT PRIMARY KEY,
        des varchar(100) NOT NULL,
        userid int,
        photoid int,
        foreign key (photoid) references photo(id)
        on delete set null,
        foreign key (userid) references user(id)
        on delete set null
    )`;

    db.query(sqlcomment , (err , result) => {
        if(err){
            return res.status(500).json({
            error : err.message
            }); 
        }

        console.log("comment table is created");
        return res.json("comment table is created");
    });
});




app.get("/create/like" , (req , res) => {
        let sqllike = `create table liketable (
            id int AUTO_INCREMENT PRIMARY KEY,
            userid int,
            photoid int,
            foreign key (userid) references user (id)
            on delete set null,
            foreign key (photoid) references photo (id)
            on delete set null
        )`;

        db.query(sqllike , (err , result) => {
            if(err){
                return res.status(500).json({
                    error : err.message
                }); 
            }

            console.log("like table is created");
        });
});





app.get("/create/userphoto" , (req , res) => {
        //  user-photo = {
        //     userid,
        //     photoid
        // }

        let sqluserphoto = `create table userphot (
            userid int,
            photoid int,
            primary key(userid , photoid),
            foreign key (userid) references user(id)
            on delete cascade,
            foreign key (photoid) references photo(id)
            on delete cascade
        )`;

        db.query(sqluserphoto , (err , result) => {
            if(err){
                return res.status(500).json({
                error : err.message
                }); 
            }

            console.log("user photo table is created");
        });
});



// Create new user and login him
app.post("/create/newuser" , (req , res) => {
    try{
        let { name } = req.body;
        let sql = `insert into user values (? , ?)`;

        db.query(sql , ["NULL" , name] , (err , result) => {
            if(err){
                console.log(err);
                return res.status(500).json({
                    message : err.message
                });
            }

            return res.json("User is created successfully");
        });

    }catch(err){
        console.log(err);
        return res.status(500).json({
            message : err.message
        });
    }
});



app.post("/user/:id/post/photo" , (req , res) => {
    let { name , imgurl , des } = req.body;
    let sql = `insert into photo values(? , ? , ? , ?)`;
    db.query(sql , ["NULL" , name , imgurl , des] , (err , rows , field) => {
        if(err){
            console.log(err);
            return res.status(500).json({
                message : err.message
            });
        }

        let searchall = `select * from photo`;
        db.query(searchall , (err , rows , fields) => {
            if(err){
                console.log(err);
                return res.status(500).json({
                    message : err.message
                });
            }
            
            let lastdata = rows[rows.length - 1];
            let photoid = lastdata.id;
            console.log("photo id => " , photoid);
            let createdrel = 'insert into userphot values (? , ?)';
            db.query(createdrel , [ req.params.id , photoid ] , (err , result) =>{
                if(err){
                    console.log(err);
                    return res.status(500).json({
                        message : err.message
                    });
                }

                console.log("photo is successfully created");
                return res.json({ result });
            }) 
        });
        // let userphotoconnect = `insert into userphot values (?,?)`;
        // db.query(userphotoconnect , [req.params.id , ])

    });
})


app.post("/user/:userid/comment/photo/:photoid" , (req , res) => {
    let searchuser = `select * from user where id=?`;
    db.query(searchuser , [req.params.userid] , (err, rows , fields) => {
        if(err){
            console.log(err);
            return res.status(500).json({
                message : err.message
            });
        }

        if(rows.length > 0){
            let searchphoto = `select * from photo where id=?`;
            db.query(searchphoto , [ req.params.photoid ], (err , rows , fields) => {
                if(err){
                    console.log(err);
                    return res.status(500).json({
                        message : err.message
                    });
                }

                if(rows.length > 0){
                    console.log("Photo is found");
                    let createcomment = `insert into comment values (? , ? , ? , ?)`;
                    db.query(createcomment, ["NULL" , req.body.text, req.params.userid , req.params.photoid ] , (err , rows , field) => {
                        if(err){
                            console.log(err);
                            return res.status(500).json({
                                message : err.message
                            });
                        }

                        console.log("Comment is created");
                        return res.json({  rows });
                    })
                }
            })
        }else{
            return res.status(500).json({
                message : "User not found"
            });
        }
    });
});




app.delete("/delete/photo/:id" , (req , res) => {
    let deletephoto = `delete from photo where id=${req.params.id}`;

    db.query(deletephoto , (err , result) => {
        if(err){
            console.log(err);
            return res.status(500).json({
                message : err.message
            });
        }

        return res.json("deleted successfully");
    })
})



app.get("/user/:id/allphotos" , (req , res) => {
    // Find user 
    // user-photo == all photos
    let finduser = `select * from user where id=${req.params.id}`;
    db.query(finduser , (err , rowsss  ,fields) => {
        if(err){
            console.log(err);
            return res.status(500).json({
                message : err.message
            });
        }

        if(rowsss.length > 0){
            let findallphotosofuser = `select * from userphot where userid=${req.params.id}`;
            db.query(findallphotosofuser , (err , rows , fields) => {
                if(err){
                    console.log(err);
                    return res.status(500).json({
                        message : err.message
                    });
                }

                console.log(rows);
                let photosidtupple = "(";
                for(var i = 0 ; i < rows.length ; i++){
                    if(i === rows.length - 1){
                        photosidtupple = photosidtupple +  rows[i].photoid + ")";
                    }else{
                        photosidtupple = photosidtupple +  rows[i].photoid + ",";
                    }
                }

                console.log(photosidtupple);

                let findallphotos = `select * from photo where id in ${photosidtupple}`;
                db.query(findallphotos , (err , rowss , field) => {
                    if(err){
                        console.log(err);
                        return res.status(500).json({
                            message : err.message
                        });
                    }

                    console.log(rowss);
                    return res.json({ rowss });
                });
            })

        }else{
            return res.status(500).json({
                message : "User not found"
            });
        }
    })
     
})







app.listen(8000 , () => {
    console.log("Server is running");
});