/**
 * A route to create wallets for users
 */

import express from "express"

import {
  createWallet,
  getWalletAddress,
  getWalletBalance,
} from "../controllers/wallet"
import { auth } from "../middlewares/auth"

export const walletRouter = express.Router()

walletRouter.get("/balance/:address", getWalletBalance)
walletRouter.get("/address", auth, getWalletAddress)
walletRouter.post("/create", auth, createWallet)
