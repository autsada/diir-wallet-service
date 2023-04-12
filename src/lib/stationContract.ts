/**
 * For use to interact with the Station Contract.
 */

import { utils } from "ethers"

import { getContractWrite, getContractRead } from "./wallet"
import StationContract_Localhost from "../abi/localhost/DiiRStation.json"
import StationContract_Testnet from "../abi/testnet/DiiRProfile.json"
import type { DiiRStation } from "../typechain-types"
import type { StationMintedEvent } from "../typechain-types/contracts/StationContract.sol/DiiRStation"
import { Role, CheckRoleParams, MintStationInput, Environment } from "../types"

const { NODE_ENV } = process.env
const env = NODE_ENV as Environment

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
 * The function to mint a DiiR Station NFT.
 * @param input - see MintStationInput
 */
export async function mintToken(input: MintStationInput) {
  const {
    key,
    data: { to, name, uri },
  } = input

  // Validate the given name.
  const isNameValid = validateName(name)
  if (!isNameValid) throw new Error("This name is invalid or taken")

  const stationContract = getStationContractWrite(key)
  const txn = await stationContract.mint(to, name, uri)
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
  const valid = await stationContract.validateName(name)

  return valid
}

/**
 * A function to get a station owner address by a given name.
 * @param name {string} - a station name
 * @return {owner}
 */
export async function getStationOwner(name: string): Promise<string> {
  const stationContract = getStationContractRead()
  const owner = await stationContract.stationOwner(name)
  return owner
}

/**
 * A function to get token uri.
 * @param tokenId {number} a token id
 * @return uri {string}
 */
export async function getTokenURI(tokenId: number): Promise<string> {
  const stationContract = getStationContractRead()
  const uri = await stationContract.tokenURI(tokenId)
  return uri
}
