/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { ITip, ITipInterface } from "../../contracts/ITip";

const _abi = [
  {
    inputs: [
      {
        internalType: "uint256",
        name: "qty",
        type: "uint256",
      },
    ],
    name: "calculateTips",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "qty",
        type: "uint256",
      },
    ],
    name: "mint",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
    ],
    name: "withdraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

export class ITip__factory {
  static readonly abi = _abi;
  static createInterface(): ITipInterface {
    return new utils.Interface(_abi) as ITipInterface;
  }
  static connect(address: string, signerOrProvider: Signer | Provider): ITip {
    return new Contract(address, _abi, signerOrProvider) as ITip;
  }
}
