/**
 * For use to interact with the Tip Contract.
 */

import { getContractWrite, getContractRead } from "./wallet"
import TipContract_Localhost from "../abi/localhost/DiiRTip.json"
import TipContract_Testnet from "../abi/testnet/DiiRTip.json"
import { DiiRTip } from "../typechain-types"
import { Environment, MintTipInput } from "../types"

const { NODE_ENV } = process.env
const env = NODE_ENV as Environment

/**
 * Get the conract for write.
 * @param key a wallet private key
 */
export function getTipContractWrite(key: string) {
  const contract = getContractWrite({
    privateKey: key,
    address:
      env === "test"
        ? TipContract_Testnet.address
        : TipContract_Localhost.address,
    contractInterface:
      env === "test" ? TipContract_Testnet.abi : TipContract_Localhost.abi,
  }) as DiiRTip

  return contract
}

/**
 * Get the contract for read
 */
export function getTipContractRead() {
  const contract = getContractRead({
    address:
      env === "test"
        ? TipContract_Testnet.address
        : TipContract_Localhost.address,
    contractInterface:
      env === "test" ? TipContract_Testnet.abi : TipContract_Localhost.abi,
  }) as DiiRTip

  return contract
}

/**
 * The function to send tips and mint a token.
 * @param input - see MintStationInput
 */
export async function mintToken(input: MintTipInput) {
  const {
    key,
    data: { to, qty },
  } = input
  const tipContract = getTipContractWrite(key)

  // Calculate tips amount for the given quantity
  const tips = await calulateTips(qty)
  const transaction = await tipContract.mint(to, qty, {
    value: tips,
  })
  await transaction.wait()
}

/**
 * The function to calculate tips for the given quantity
 * @param qty
 */
export async function calulateTips(qty: number) {
  const tipContract = getTipContractRead()
  const tips = await tipContract.calculateTips(qty)

  return tips
}
