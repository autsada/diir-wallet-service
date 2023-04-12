/**
 * Enum for contract's role.
 */
export enum Role {
  DEFAULT = "DEFAULT_ADMIN_ROLE",
  ADMIN = "ADMIN_ROLE",
  UPGRADER = "UPGRADER_ROLE",
}

export type CheckRoleParams = {
  role: Role
  address: string
  key: string
}

/**
 * Input data required for creating a Profile NFT.
 * @param key {string} - wallet's key
 * @param data.to {string} - an address to mint the nft to
 * @param data.name {string} - a given station name (lowercase)
 * @param data.uri {string} - a uri of the station
 */
export type MintStationInput = {
  key: string
  data: {
    to: string
    name: string
    uri: string
  }
}

/**
 * Input data required to send tips to a station owner.
 * @param key {string} - wallet's key
 * @param data.to {string} - a station owner address
 * @param data.qty {number} - a quantity of the tips
 */
export type MintTipInput = {
  key: string
  data: {
    to: string
    qty: number
  }
}
