import type { Request, Response, NextFunction } from "express"

import { getWallet } from "../firebase/helpers"
import { mintToken, validateName, getTokenURI } from "../lib/stationContract"
import { decrypt } from "../lib/kms"
import { MintStationInput } from "../types"
import { authError, inputError } from "../lib/constants"

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

    const { to, name, uri } = req.body as MintStationInput["data"]

    // Validate input.
    if (!to || !name || !uri) throw new Error(inputError)

    // Validate the given name
    const formattedName = name.toLowerCase()

    const valid = await validateName(formattedName)

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
        name: formattedName,
        uri,
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

    const valid = await validateName(name.toLowerCase())

    res.status(200).json({ valid })
  } catch (error) {
    res.status(200).json({ valid: false })
  }
}

/**
 * A route to get a station token uri.
 */
export async function getStationTokenURI(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { tokenId } = req.params as { tokenId: string }
    const uri = await getTokenURI(Number(tokenId))

    res.status(200).json({ uri })
  } catch (error) {
    next(error)
  }
}
