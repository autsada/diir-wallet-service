import type { Request, Response, NextFunction } from "express"

import { getWallet } from "../firebase/helpers"
import {
  mintTokenByAdmin,
  mintToken,
  validateName,
  calulateTips,
  sendTips,
} from "../lib/stationContract"
import { decrypt } from "../lib/kms"
import { MintStationInput, SendTipsInput } from "../types"
import { authError, inputError } from "../lib/constants"

/**
 * A route to mint a DiiR Station NFT.
 */
export async function mintStationNFTByAdmin(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { uid } = req
    // Validate auth.
    if (!uid) throw new Error(authError)

    const { to, name } = req.body as MintStationInput["data"]

    // Validate input.
    if (!to || !name) throw new Error(inputError)

    const valid = await validateName(name)

    if (!valid) throw new Error("The given name is taken or invalid")

    // Mint a DiiR NFT
    const tokenId = await mintTokenByAdmin({
      to,
      name,
    })

    res.status(200).json({ tokenId })
  } catch (error) {
    next(error)
  }
}

/**
 * A route to mint a DiiR Station NFT.
 */
export async function mintStationNFT(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { uid } = req
    // Validate auth.
    if (!uid) throw new Error(authError)

    const { to, name } = req.body as MintStationInput["data"]

    // Validate input.
    if (!to || !name) throw new Error(inputError)

    const valid = await validateName(name)

    if (!valid) throw new Error("The given name is taken or invalid")

    // Get encrypted key
    const { key: encryptedKey } = await getWallet(uid)
    // Decrypt the key
    const key = await decrypt(encryptedKey)

    // Mint a DiiR NFT
    const tokenId = await mintToken({
      key,
      data: {
        to,
        name,
      },
    })

    res.status(200).json({ tokenId })
  } catch (error) {
    next(error)
  }
}

/**
 * A route to validate a given station name.
 */
export async function validateStationName(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { name } = req.body as { name: string }
    // Validate input.
    if (!name) throw new Error("name is required.")

    const valid = await validateName(name)

    res.status(200).json({ valid })
  } catch (error) {
    next(error)
  }
}

/**
 * A route to calculate tips amount from a given usd.
 */
export async function checkTipsAmount(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { qty } = req.body as { qty: string }
    // Validate input.
    if (!qty || typeof Number(qty) !== "number")
      throw new Error("Invalid input")

    const tips = await calulateTips(Number(qty))

    res.status(200).json({ tips })
  } catch (error) {
    next(error)
  }
}

/**
 * A route to send tips to station owner.
 */
export async function transferTips(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { uid } = req
    // Validate auth.
    if (!uid) throw new Error(authError)

    const { to, qty } = req.body as SendTipsInput["data"]
    // Validate input.
    if (!to || !qty || typeof Number(qty) !== "number")
      throw new Error("Invalid input")

    // Get encrypted key
    const { key: encryptedKey } = await getWallet(uid)
    // Decrypt the key
    const key = await decrypt(encryptedKey)

    // Mint a DiiR NFT
    const result = await sendTips({
      key,
      data: {
        to,
        qty: Number(qty),
      },
    })

    res.status(200).json({ result })
  } catch (error) {
    next(error)
  }
}
