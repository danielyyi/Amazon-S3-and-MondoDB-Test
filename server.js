const aws = require('aws-sdk')
const express = require('express')
const multer = require('multer')
const multerS3 = require('multer-s3')
const uuid = require('uuid').v4
const MongoClient = require('mongodb').MongoClient
const path = require('path')

const app = express();

MongoClient.connect('mongodb+srv://yidan23:Bote61did@cluster0.f34jv.mongodb.net/myFirstDatabase?retryWrites=true&w=majority', 
{useNewUrlParser : true, useUnifiedTopology: true})
.then(client => {
    console.log("Mongo Connected!")
    const db = client.db('myFirstDatabase')
    const collection = db.collection('FileUpload')
    app.locals.imageCollection = collection
})

const s3 = new aws.S3( {apiVersion: '2006-03-01'})

//export AWS_ACCESS_KEY_ID=AKIARW6PBZSO5AUFZTE3
//export AWS_SECRET_ACCESS_KEY=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

const upload = multer({
    storage: multerS3({
        s3, 
        bucket: 'yidan-fileupload',
        acl: 'public-read',

        metadata: (req, file, cb) =>{
            cb(null, {fieldName: file.fieldname})
        },
        key: (req, file, cb) =>{
            const ext = path.extname(file.originalname)
            cb(null, `${uuid()}${ext}`)
        }
    })
})

app.use(express.static('public'));

app.post('/upload', upload.single('appImage'), (req, res)=>{
    const imageCollection = req.app.locals.imageCollection
    const uploaded = req.file.location
    console.log(req.file)

    imageCollection.insertOne({filePath: uploaded})
    .then(result=>{
        return res.json({status: 'OK', ...result})
    })
})

app.get('/images', (req, res)=>{
    const imageCollection = req.app.locals.imageCollection;
    imageCollection.find({})
        .toArray()
        .then(images =>{
            const paths = images.map(({filePath}) => ({filePath}))
            return res.json(paths);
        })
})

app.listen(3005, ()=>console.log("App is listening"))