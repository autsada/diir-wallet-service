/**
 * For use to interact with the Station Contract.
 */

import { utils } from "ethers"

import { getContractWrite, getContractRead } from "./wallet"
import StationContract_Localhost from "../abi/localhost/DiiRStation.json"
import StationContract_Testnet from "../abi/testnet/DiiRStation.json"
import type { DiiRStation } from "../typechain-types"
import type {
  StationMintedEvent,
  TipsTransferredEvent,
} from "../typechain-types/contracts/StationContract.sol/DiiRStation"
import {
  Role,
  CheckRoleParams,
  MintStationInput,
  Environment,
  SendTipsInput,
} from "../types"

const { NODE_ENV, PRIVATE_KEY_LOCAL, PRIVATE_KEY_TESTNET } = process.env
const env = NODE_ENV as Environment

const adminKey =
  env === "development" ? PRIVATE_KEY_LOCAL! : PRIVATE_KEY_TESTNET!

/**
 * Get the conract for write.
 * @param key a wallet private key
 */
export function getStationContractWrite(key: string) {
  const contract = getContractWrite({
    privateKey: key,
    address:
      env === "test"
        ? StationContract_Testnet.address
        : StationContract_Localhost.address,
    contractInterface:
      env === "test"
        ? StationContract_Testnet.abi
        : StationContract_Localhost.abi,
  }) as DiiRStation

  return contract
}

/**
 * Get the contract for read
 */
export function getStationContractRead() {
  const contract = getContractRead({
    address:
      env === "test"
        ? StationContract_Testnet.address
        : StationContract_Localhost.address,
    contractInterface:
      env === "test"
        ? StationContract_Testnet.abi
        : StationContract_Localhost.abi,
  }) as DiiRStation

  return contract
}

/**
 * The function to check caller's role.
 * @dev see CheckRoleParams
 * @return hasRole {boolean}
 */
export async function checkUserRole({ role, address, key }: CheckRoleParams) {
  const profileContract = getStationContractWrite(key)
  const formattedBytes =
    role === Role.DEFAULT
      ? utils.formatBytes32String("")
      : utils.keccak256(utils.toUtf8Bytes(role))
  const hasGivenRole = await profileContract.hasRole(formattedBytes, address)

  return hasGivenRole
}

/**
 * The function to mint a DiiR Station NFT by admin.
 * Use this function for user's first NFT to subsidize gas for users
 * @param input - see MintStationInput
 */
export async function mintTokenByAdmin({ to, name }: MintStationInput["data"]) {
  // Validate the given name.
  const isNameValid = validateName(name)
  if (!isNameValid) throw new Error("This name is invalid or taken")

  const stationContract = getStationContractWrite(adminKey)

  // Only for the user's first NFT
  const balance = await stationContract.balanceOf(to)
  if (balance.toNumber() > 0) throw new Error("Not allow")

  const txn = await stationContract.mint(to, name.toLowerCase())
  const txnRct = await txn.wait()
  const event = txnRct.events?.find((ev) => ev.event === "StationMinted")
  if (!event) return null

  const args = (event as StationMintedEvent).args
  if (!args) return null

  const [tokenId] = args

  return tokenId.toNumber()
}

/**
 * The function to mint a DiiR Station NFT.
 * @param input - see MintStationInput
 */
export async function mintToken(input: MintStationInput) {
  const {
    key,
    data: { to, name },
  } = input

  // Validate the given name.
  const isNameValid = validateName(name)
  if (!isNameValid) throw new Error("This name is invalid or taken")

  const stationContract = getStationContractWrite(key)
  const txn = await stationContract.mint(to, name.toLowerCase())
  const txnRct = await txn.wait()
  const event = txnRct.events?.find((ev) => ev.event === "StationMinted")
  if (!event) return null

  const args = (event as StationMintedEvent).args
  if (!args) return null

  const [tokenId] = args

  return tokenId.toNumber()
}

/**
 * The function to check if a given station name is valid
 * @param name
 * @return {valid} boolean
 */
export async function validateName(name: string): Promise<boolean> {
  const stationContract = getStationContractRead()
  const valid = await stationContract.validateName(name.toLowerCase())

  return valid
}

/**
 * The function to calculate tips in wei for the given usd amount
 * @param qty
 */
export async function calulateTips(qty: number) {
  const stationContract = getStationContractRead()
  const tips = await stationContract.calculateTips(qty)

  return tips
}

/**
 * The function to send tips to station owner.
 * @param input - see MintStationInput
 */
export async function sendTips(input: SendTipsInput) {
  const {
    key,
    data: { to, qty },
  } = input
  const stationContract = getStationContractWrite(key)

  // Calculate tips amount for the given quantity
  const tips = await calulateTips(qty)
  const txn = await stationContract.tip(to.toLowerCase(), qty, {
    value: tips,
  })
  const txnRct = await txn.wait()
  const event = txnRct.events?.find((ev) => ev.event === "TipsTransferred")
  if (!event) return null

  const args = (event as TipsTransferredEvent).args
  if (!args) return null
  const [from, receiver, amount, fee] = args

  return {
    from,
    to: receiver,
    amount: utils.formatEther(amount),
    fee: utils.formatEther(fee),
  }
}
