'use client'

import { useState } from 'react'

export default function Home() {
  const [session, setSession] = useState<any>(null)
  const [joke, setJoke] = useState<string | null>(null)
  const [txId, setTxId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const connectWallet = async () => {
    try {
      setError(null)
      const { default: ProtonWebSDK } = await import('@proton/web-sdk')
      const result = await ProtonWebSDK({
        transportOptions: {
          requestAccount: 'mpp-starter',
          requestStatus: true,
        },
        chainId: '384da888112027f0321850a169f737c33e53b388aad48b5adace4bab97f437e0',
        endpoints: ['https://api.protonnz.com'],
        appName: 'MPP XPR Starter',
        appLogo: 'https://xprnetwork.org/logo.png',
      })
      setSession(result.session)
    } catch (err: any) {
      setError(err.message || 'Failed to connect wallet')
    }
  }

  const buyJoke = async () => {
    if (!session) {
      setError('Connect your wallet first')
      return
    }

    setLoading(true)
    setError(null)
    setJoke(null)
    setTxId(null)

    try {
      // Step 1: Hit the endpoint, get 402 challenge
      const res = await fetch('/api/joke')

      if (res.status === 402) {
        const paymentHeader = res.headers.get('X-Payment')
        if (!paymentHeader) throw new Error('No payment header in 402 response')
        const payment = JSON.parse(paymentHeader)

        // Step 2: Sign and broadcast the transfer
        const tx = await session.transact({
          actions: [{
            account: 'eosio.token',
            name: 'transfer',
            authorization: [session.auth],
            data: {
              from: session.auth.actor.toString(),
              to: payment.recipient,
              quantity: payment.amount,
              memo: payment.memo || '',
            },
          }],
        })

        const transactionId = tx.processed?.id || tx.transaction_id
        setTxId(transactionId)

        // Step 3: Retry with receipt
        const paidRes = await fetch('/api/joke', {
          headers: {
            'X-Payment-Receipt': transactionId,
          },
        })

        const data = await paidRes.json()
        setJoke(data.joke)
      } else {
        const data = await res.json()
        setJoke(data.joke)
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col items-center justify-center p-8">
      <div className="max-w-lg w-full space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-green-400">🔑 MPP XPR Starter</h1>
          <p className="text-gray-400">
            Machine Payments Protocol on XPR Network.
            <br />
            Buy a joke for 1 XPR. Zero gas fees.
          </p>
        </div>

        <div className="space-y-4">
          {!session ? (
            <button
              onClick={connectWallet}
              className="w-full py-3 px-6 bg-green-500 hover:bg-green-400 text-gray-950 font-bold rounded-lg transition-colors"
            >
              Connect WebAuth Wallet
            </button>
          ) : (
            <div className="text-center space-y-4">
              <p className="text-green-400 text-sm">
                ✓ Connected as <span className="font-mono font-bold">{session.auth.actor.toString()}</span>
              </p>
              <button
                onClick={buyJoke}
                disabled={loading}
                className="w-full py-3 px-6 bg-green-500 hover:bg-green-400 disabled:bg-gray-700 disabled:text-gray-500 text-gray-950 font-bold rounded-lg transition-colors"
              >
                {loading ? 'Processing...' : 'Buy a Joke (1 XPR)'}
              </button>
            </div>
          )}
        </div>

        {joke && (
          <div className="bg-gray-900 border border-green-500/30 rounded-lg p-6 space-y-3">
            <p className="text-lg">{joke}</p>
            {txId && (
              <a
                href={`https://explorer.xprnetwork.org/transaction/${txId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-400 text-sm hover:underline block"
              >
                View transaction on explorer →
              </a>
            )}
          </div>
        )}

        {error && (
          <div className="bg-red-950 border border-red-500/30 rounded-lg p-4">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <div className="text-center text-gray-600 text-xs space-y-1">
          <p>Powered by <a href="https://mpp.dev" className="text-green-400 hover:underline">MPP</a> + <a href="https://xprnetwork.org" className="text-green-400 hover:underline">XPR Network</a></p>
          <p>
            <a href="https://www.npmjs.com/package/mppx-xpr-network" className="text-green-400 hover:underline">npm</a> · <a href="https://github.com/charliebot87/mpp-xpr-starter" className="text-green-400 hover:underline">source</a> · <a href="https://blog.charliebot.dev" className="text-green-400 hover:underline">blog</a>
          </p>
        </div>
      </div>
    </div>
  )
}
