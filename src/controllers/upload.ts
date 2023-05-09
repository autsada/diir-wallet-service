import type { Request, Response, NextFunction } from "express"

import { createDocWithId } from "../firebase/helpers"
import { uploadsCollection } from "../firebase/config"

/**
 * @dev A function to create an upload doc in Firestore for use to inform the UI when upload task finished
 */
export async function onUploadFinished(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { publishId } = req.body as { publishId: string }

    await createDocWithId({
      collectionName: uploadsCollection,
      docId: publishId,
      data: {
        status: "finished",
      },
    })

    res.status(200).json({ status: "Ok" })
  } catch (error) {
    next(error)
  }
}
