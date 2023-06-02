import express from "express"

import { onUploadFinished } from "../controllers/upload"

export const uploadRouter = express.Router()

// This route doesn't require auth as it will be called from the webhook endpoint on the Gateway service
uploadRouter.post("/finished", onUploadFinished)
