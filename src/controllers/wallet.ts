import type { Request, Response, NextFunction } from "express"

import { generateWallet, generateWalletDev, getBalance } from "../lib/wallet"
import { walletsCollection } from "../firebase/config"
import { createDocWithId, getDocById } from "../firebase/helpers"
import { badRequestErrMessage } from "../lib/constants"
import type { Wallet, Environment } from "../types"

const { NODE_ENV } = process.env
const env = NODE_ENV as Environment

/**
 * @dev The function to generate blockchain wallet.
 * @dev Required user's auth uid
 */
export async function createWallet(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { uid } = req
    if (!uid) throw new Error(badRequestErrMessage)

    let walletAddress: string = ""

    const walletDoc = await getDocById<Wallet>({
      collectionName: walletsCollection,
      docId: uid,
    })

    if (walletDoc && walletDoc.address && walletDoc.key) {
      // If user already has a wallet.
      walletAddress = walletDoc.address
    } else {
      // No wallet found, create a new one
      const wallet =
        env === "development"
          ? await generateWalletDev()
          : await generateWallet()

      // Create a new doc in "wallets" collection.
      await createDocWithId<typeof wallet>({
        collectionName: walletsCollection,
        docId: uid,
        data: {
          address: wallet.address.toLowerCase(),
          key: wallet.key,
        },
      })
      walletAddress = wallet.address.toLowerCase()
    }

    res.status(200).json({ address: walletAddress, uid })
  } catch (error) {
    next(error)
  }
}

/**
 * @dev The function to get balance of the wallet
 */
export async function getWalletBalance(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { address } = req.params as { address: string }
    const balance = await getBalance(address)

    res.status(200).json({ balance })
  } catch (error) {
    next(error)
  }
}
