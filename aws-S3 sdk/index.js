require("dotenv/config");
const express = require('express');
const hbs = require('hbs')
// Multer add the multiple file
const multer = require ("multer");
const AWS = require ("aws-sdk");
// uuid add the unique id individual
const uuid = require ("uuid");
const app = express();
const port = process.env.PORT || 3000

app.set('view engine' , 'hbs');

const storage = multer.memoryStorage({
    destination: function(req, file ,callback){
        callback(null, "")
    }
})

const s3 = new AWS.S3()

const upload = multer({storage}).single("image");

app.get("/", (req,res) => {
    res.render("index");
})




app.post('./upload' , upload , (req, res) => {
    let myFile = req.file.originalname.split(",")
    const fileType = myFile[myFile.length - 1]

    const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key:`${uuid}.${fileType}`,
        Body: req.file.buffer
    }
    

    s3.upload(params, (error, data) => {
        if(error){
            res.stauts(500).send(error);
        }
        res.stauts(200).send(data);
    })

  let presignedGetURL = s3.getSignedUrl("getObject" , {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key:`${uuid()}.${fileType}`,
        Expire: 1000*5 // Time to expire
   });
   console.log(presignedGetURL, "presignedGetURL")
})

app.listen(port,() => {
    console.log(`server is up at ${port}`);
})