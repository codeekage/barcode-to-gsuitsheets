import FirebaseService from './firebase.helper'

export interface Result {
  success: boolean
  data?: any | undefined
}

export default class BatchService extends FirebaseService {
  async addBatch(batchName: string, document: number[]): Promise<Result> {
    try {
      const batch = await this.firestore.collection('barcodes')
      const docCount = await batch.doc(batchName).get()
      if (docCount.exists) {
        throw new Error(`Collection ${batchName} Already Exist`)
      }
      await batch.doc(batchName).set({ codes: document })
      return Promise.reject({ success: true, document })
    } catch (error) {
      console.log(error)
      return Promise.reject(error)
    }
  }

  async getBatch(batchName: string): Promise<Result> {
    try {
      const batch = await this.firestore
        .collection(`barcodes`)
        .doc(batchName)
        .get()
      return Promise.resolve({ success: true, data : batch.data() })
    } catch (error) {
      console.log(error)
      return Promise.reject(error)
    }
  }

  async getAllBatch(): Promise<Result> {
    try {
      const result: any[] = []
      const batch = await this.firestore.collection(`barcodes`).get()
      batch.forEach(async data => {
        await result.push(data.data())
      })
      return Promise.resolve({ success: true, data : result })
    } catch (error) {
      console.log(error)
      return Promise.reject(error)
    }
  }
}
