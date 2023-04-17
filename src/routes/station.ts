import express from "express"

import {
  mintStationNFTByAdmin,
  mintStationNFT,
  validateStationName,
  checkTipsAmount,
  transferTips,
} from "../controllers/station"
import { auth } from "../middlewares/auth"

export const stationRouter = express.Router()

stationRouter.post("/validate", validateStationName) // No auth required
stationRouter.post("/mint-first", auth, mintStationNFTByAdmin) // Required auth
stationRouter.post("/mint", auth, mintStationNFT) // Required auth
stationRouter.post("/tips/check", checkTipsAmount) // No auth required
stationRouter.post("/tips/send", auth, transferTips) // Required auth
