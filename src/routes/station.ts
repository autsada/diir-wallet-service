import express from "express"

import {
  mintStationNFT,
  validateStationName,
  getStationTokenURI,
} from "../controllers/station"
import { auth } from "../middlewares/auth"

export const stationRouter = express.Router()

stationRouter.post("/validate", validateStationName)
stationRouter.post("/mint", auth, mintStationNFT)
stationRouter.get("/uri/:tokenId", getStationTokenURI)
