import crypto from 'crypto'
import { Mppx } from 'mppx/server'
import { xpr } from 'mppx-xpr-network'

const mppSecretKey = process.env.MPP_SECRET_KEY || crypto.randomBytes(32).toString('base64')

export const mppx = Mppx.create({
  methods: [xpr.charge({ recipient: process.env.XPR_RECIPIENT || 'charliebot' })],
  secretKey: mppSecretKey,
})
