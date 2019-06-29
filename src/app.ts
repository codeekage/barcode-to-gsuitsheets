import * as express from 'express'
import * as cors from 'cors'
import SheetServices from './plugin/sheet.plugin'
export const app = express()
app.use(cors())

const sheetServices = new SheetServices()
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
      req.query.token
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
    const token = await sheetServices.barcodeCreate(req.params.code)
    res.send(token)
  } catch (error) {
    console.error('BARCODE [GET] ERROR', error)
    res.status(500).send(error)
    next(error)
  }
})


