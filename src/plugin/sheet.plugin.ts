import { google } from 'googleapis'
import key from './key'
import axios from 'axios'

export interface Result {
  success: boolean
  data?: any | undefined
}

export default class SheetServices {
  private SCOPES = 'https://www.googleapis.com/auth/spreadsheets'
  private BARCODE_URL = 'https://api.barcodelookup.com/v2/products'
  OAuth() {
    const { client_secret, client_id, redirect_uris } = key['installed']
    const OAuth = new google.auth.OAuth2(
      client_id,
      client_secret,
      redirect_uris[0]
    )
    return OAuth
  }
  async getTokenURL() {
    try {
      const AUTH_URL = this.OAuth().generateAuthUrl({
        access_type: 'offline',
        scope: this.SCOPES,
      })
      return Promise.resolve(AUTH_URL)
    } catch (error) {
      console.error(error)
      return Promise.reject(error)
    }
  }
  async setToken(user_token: string) {
    try {
      const authToken = await this.OAuth().getToken(user_token)
      this.OAuth().setCredentials(authToken['tokens'])
      return Promise.resolve({ success: true, tokens: authToken['tokens'] })
    } catch (error) {
      console.error('SetToken Error', error)
      return Promise.reject({ success: false, error })
    }
  }
  async createSheet(sheetTitle: string, userToken: string): Promise<Result> {
    try {
      const auth = this.OAuth()
      const token = await this.setToken(userToken)
      auth.setCredentials(token['tokens'])
      const sheet = google.sheets({ version: 'v4', auth })
      const create = await sheet.spreadsheets.create({
        requestBody: {
          properties: {
            title: sheetTitle,
          },
        },
        fields: 'spreadsheetId',
        auth,
      })

      const data: any[] = []
      const barcodes = [
        381371019410,
        5000204689204,
        9780140157376,
        3185370000335,
      ]


      for (const codes of barcodes) {
        data.push(await this.barcodeCreate(codes))
      }

      const update = await sheet.spreadsheets.values.update({
        range: 'Sheet1!A1:M10',
        spreadsheetId: create['data']['spreadsheetId'],
        requestBody: {
          values: [...data],
          majorDimension: 'ROWS',
        },
        valueInputOption: 'RAW',
      })
      return Promise.resolve({ success: true, update })
    } catch (error) {
      console.error('Create SpreadSheet Error', error)
      return Promise.reject({ success: false, error })
    }
  }

  async barcodeCreate(codes: number) {
    try {
      const res = await axios.get(
        `${
          this.BARCODE_URL
        }?barcode=${codes}&formatted=y&key=oiyzttv0a1o8lu2qtpsfp7n6yarmrh`
      )
      const data = res.data.products[0]
      return await [
        data['barcode_number'],
        data['product_name'],
        data['description'],
        data['width'],
        data['label'],
        data['brand'],
        data['weight'],
        data['price'],
      ]
    } catch (error) {
      console.error('Create SpreadSheet Error', error)
      return error
    }
  }
}
