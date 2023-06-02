import type { Request, Response, NextFunction } from "express"

import { createDocWithId } from "../firebase/helpers"
import { publishesCollection } from "../firebase/config"

/**
 * @dev A function to create a publish doc in Firestore for use to inform the UI when the publish is updated
 */
export async function onPublishUpdated(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { publishId } = req.body as { publishId: string }

    await createDocWithId({
      collectionName: publishesCollection,
      docId: publishId,
      data: {
        status: "updated",
      },
    })

    res.status(200).json({ status: "Ok" })
  } catch (error) {
    next(error)
  }
}
