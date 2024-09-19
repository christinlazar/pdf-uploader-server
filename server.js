const express = require('express')
const upload = require('./utils/multer')
const bodyParser = require('body-parser')
const cors = require('cors')
const { PDFDocument } = require('pdf-lib')
const path = require('path')
const fs = require('fs')
const app = express()
const PORT = 5000
app.use(bodyParser.json())
app.use(express.urlencoded({extended:true}))

app.use(cors({
    origin: ["https://pdf-uploader-client-8lof.vercel.app"],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    optionsSuccessStatus: 200,
}));




app.get('/',()=>{
    res.send("hi")
})

app.post('/upload',upload.single('pdf'),async (req,res)=>{
    try {
        if(!req.file){
            return res.json({success:false})
        }else{
            return res.json({success:true})
        }
    }catch (error) {
        console.error(error.message)
    }
})

app.post('/extract',upload.single('pdf'),async (req,res)=>{
   const filePath = path.join(__dirname, req.file.path)
    const pagesToExtract = JSON.parse(req.body.pages)
    try {
        const pdfBytes = fs.readFileSync(filePath)
        const pdfDoc = await PDFDocument.load(pdfBytes)
        const newDoc = await PDFDocument.create()
        for(let page of pagesToExtract){
            const[copiedPage] = await newDoc.copyPages(pdfDoc,[page - 1])
            newDoc.addPage(copiedPage)
        }
        const newPdfBytes = await newDoc.save()
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename="extracted.pdf"',
          });
      
          res.send(Buffer.from(newPdfBytes));
    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: error.message });
    }finally {
        fs.unlink(filePath, (err) => {
          if (err) console.error('Error deleting file:', err);
        });
      }
})

// app.listen(PORT,()=>{
//     console.log( `server is running on port ${PORT}` )
// })

module.exports = app;