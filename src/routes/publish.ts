import express from "express"

import { auth } from "../middlewares/auth"
import { onPublishUpdated } from "../controllers/publish"

export const publishesRouter = express.Router()

publishesRouter.post("/update", auth, onPublishUpdated)
