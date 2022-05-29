import Web3 from "web3";
import Tx from "@ethereumjs/tx";

const rpcURL = `https://ropsten.infura.io/v3/${process.env.INFURA_PROJECT_ID}`;
const web3 = new Web3(rpcURL);

export function useContract() {
  console.log(web3);
}
