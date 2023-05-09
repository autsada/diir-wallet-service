import path from "path"
import dotenv from "dotenv"
dotenv.config({ path: path.join(__dirname, "../.env") })
import express from "express"
import cors from "cors"
import http from "http"

import "./firebase/config"
import * as router from "./routes"
import { errorHandler } from "./middlewares/error"
import { createIdTokenfromCustomToken } from "./lib/test"

const { PORT } = process.env

const app = express()
app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
app.use(cors())

/**
 * This route is for testing only
 */
// =============
app.get("/id-token", async (req, res, next) => {
  try {
    const { uid } = req.body as { uid: string }
    const result = await createIdTokenfromCustomToken(uid)

    res.status(200).json({ token: result })
  } catch (error) {
    console.log("error: ", error)
    next(error)
  }
})
// =============

app.use("/auth", router.authRouter)
app.use("/wallet", router.walletRouter)
app.use("/station", router.stationRouter)
app.use("/upload", router.uploadRouter)
app.use(errorHandler)

// Create the HTTP server
const httpServer = http.createServer(app)

httpServer.listen({ port: PORT || 8000 }, () => {
  console.log(`Server ready at port: ${PORT}`)
})

// createIdTokenfromCustomToken("JhSuD3P0gTNPXFwd7EoCbPzqxNF3")
// createIdTokenfromCustomToken("vHa6ZB9H2kNo2OCun0hqRr5OaTi1")
// createIdTokenfromCustomToken("K2K85T4o0JNWUjkarDkUjLxNhcB2")
// createIdTokenfromCustomToken("2HEFRzVUJBOFGJohNYzx5xUr42Z2")
