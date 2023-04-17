import type { Request, Response, NextFunction } from "express"

import { throwError } from "../lib/utils"
import { inputError } from "../lib/constants"
import { auth } from "../firebase/config"
import { UserRecord } from "firebase-admin/auth"

/**
 * @dev A function to verify id token and get Firebase auth user uid
 */
export async function checkAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { uid } = req

    res.status(200).json({ uid })
  } catch (error) {
    next(error)
  }
}

/**
 * @dev A function to create a Firebase Auth user anonymously using wallet address
 */
export async function createUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { address } = req.body as { address: string }
    if (!address) throwError(400, inputError)

    // If user doesn't exist, create a new user
    let user: UserRecord | null = null

    // Wrap with try/catch to prevent throw if user not found
    try {
      user = await auth.getUser(address)
    } catch (error) {
      user = null
    }

    if (!user) {
      user = await auth.createUser({ uid: address })
    }

    res.status(200).json({ user })
  } catch (error) {
    next(error)
  }
}

/**
 * @dev A function to get user's provider
 */
export async function getProvider(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { uid } = req
    // If user doesn't exist, create a new user
    let user: UserRecord | null = null

    // Wrap with try/catch to prevent throw if user not found
    try {
      user = await auth.getUser(uid || "")
    } catch (error) {
      user = null
    }

    res.status(200).json({
      provider: !user
        ? null
        : !user.email && !user.phoneNumber && user.uid.startsWith("0x")
        ? "WALLET"
        : "TRADITIONAL",
    })
  } catch (error) {
    next(error)
  }
}
