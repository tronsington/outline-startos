import { storeJson } from './fileModels/store.json'
import { sdk } from './sdk'
import { POSTGRES_DB, POSTGRES_PATH, POSTGRES_USER } from './utils'

export const { createBackup, restoreInit } = sdk.setupBackups(async () =>
  sdk.Backups.withPgDump({
    imageId: 'postgres',
    dbVolume: 'pgdata',
    mountpoint: POSTGRES_PATH,
    pgdataPath: '/data',
    database: POSTGRES_DB,
    user: POSTGRES_USER,
    password: async () => {
      const password = await storeJson.read((s) => s.pgPassword).once()
      if (!password) throw new Error('No pgPassword found in store.json')
      return password
    },
  })
    .addVolume('storage')
    .addVolume('main'),
)
