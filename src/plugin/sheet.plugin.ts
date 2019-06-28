import { google } from 'googleapis'
import key from './key'

export default class SheetServices {
  private SCOPES = 'https://www.googleapis.com/auth/spreadsheets'

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
  async createSheet(sheetTitle: string, userToken: string) {
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
      const update = await sheet.spreadsheets.values.update({
        range: 'Sheet1!A1:D5',
        spreadsheetId: create['data']['spreadsheetId'],
        requestBody: {
          values: [
            ['Item', 'Cost', 'Stocked', 'Ship Date'],
            ['Wheel', '$20.50', '4', '3/1/2016'],
            ['Door', '$15', '2', '3/15/2016'],
            ['Engine', '$100', '1', '30/20/2016'],
            ['Totals', '=SUM(B2:B4)', '=SUM(C2:C4)', '=MAX(D2:D4)'],
          ],
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
}
