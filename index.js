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




app.get('/',(req,res)=>{
    res.send("hi")
})

app.post("/test",(req,res)=>{
    res.status(201).json("POST REQUEST ACCEPTED")
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

app.post('/extract', upload.single('pdf'), async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
  
    const pagesToExtract = JSON.parse(req.body.pages);
    
    try {
      // Get the PDF buffer directly from memory
      const pdfBytes = req.file.buffer;
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const newDoc = await PDFDocument.create();
  
      for (let page of pagesToExtract) {
        const [copiedPage] = await newDoc.copyPages(pdfDoc, [page - 1]);
        newDoc.addPage(copiedPage);
      }
  
      const newPdfBytes = await newDoc.save();
  
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="extracted.pdf"',
      });
  
      res.send(Buffer.from(newPdfBytes));
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: error.message });
    }
  });
  

app.listen(PORT,()=>{
    console.log( `server is running on port ${PORT}` )
})

// module.exports = app;