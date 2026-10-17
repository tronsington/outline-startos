import { sdk } from '../sdk'
import { setAppUrl } from './setAppUrl'
import { setOidc } from './setOidc'

export const actions = sdk.Actions.of().addAction(setAppUrl).addAction(setOidc)
