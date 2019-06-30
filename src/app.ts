import * as express from 'express'
import * as cors from 'cors'
import SheetServices from './plugin/sheet.plugin'
import BatchService from './helper/firebase.query';
export const app = express()
app.use(cors())

const sheetServices = new SheetServices()
const batchServices  = new BatchService()
/* 
app.use((err :any, req : Request, res : Response, next : NextFunction) => {
    console.error(err.stack)
     res.status(500).send('Something broke!')
}) */

app.get('/oauth', async (req, res, next) => {
  try {
    const token = await sheetServices.getTokenURL()
    res.redirect(token)
  } catch (error) {
    console.error('OAUTH [GET] ERROR', error)
    res.status(500).send(error)
    next()
  }
})

app.get('/sheet', async (req, res, next) => {
  try {
    const token = await sheetServices.setToken(req.query.token)
    res.send(token)
  } catch (error) {
    console.error('SHEET [GET] ERROR', error)
    res.status(500).send(error)
    next(error)
  }
})

app.get('/create', async (req, res, next) => {
  try {
    const token = await sheetServices.createSheet(
      req.query.title,
      req.query.token,
      req.query.batch,
      req.query.key,
      req.query.sheet
    )
    res.send(token)
  } catch (error) {
    console.error('CREATE [GET] ERROR', error)
    res.status(500).send(error)
    next(error)
  }
})


app.get('/barcode/:code', async (req, res, next) => {
  try {
    const token = await sheetServices.barcodeCreate(req.params.code, req.params.key)
    res.send(token)
  } catch (error) {
    console.error('BARCODE [GET] ERROR', error)
    res.status(500).send(error)
    next(error)
  }
})

app.post('/batch', async (req, res, next) => {
  try {
    const {batchName, document} = req.body
    const token = await batchServices.addBatch(batchName, document)
    res.send(token)
  } catch (error) {
    console.error('BATCH [POST] ERROR', error)
    res.status(500).send(error)
    next(error)
  }
})

app.get('/batch', async (req, res, next) => {
  try {
    const token = await batchServices.getAllBatch()
    res.send(token)
  } catch (error) {
    console.error('BATCH [GET ALL] ERROR', error)
    res.status(500).send(error)
    next(error)
  }
})

app.get('/batch/:name', async (req, res, next) => {
  try {
    const token = await batchServices.getBatch(req.params.name)
    res.send(token)
  } catch (error) {
    console.error('BATCH [GET] ERROR', error)
    res.status(500).send(error)
    next(error)
  }
})



