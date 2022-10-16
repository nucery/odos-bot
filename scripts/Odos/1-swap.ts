import { OdosRouter } from '../../typechain-types';
import {BigNumber, ContractReceipt, ContractTransaction} from "ethers";
import {formatEther} from "ethers/lib/utils";
const { ethers } = require('hardhat');

const log = console.log
// ! important
const contractName = 'OdosRouter';
const contractAddress = '0xa32ee1c40594249eb3183c10792bcf573d4da47c';
const unit = ethers.constants.WeiPerEther;

export async function waitTx(txRequest: Promise<ContractTransaction>): Promise<ContractReceipt> {
  const txResponse = await txRequest;
  console.log('txHash: ', txResponse.hash)
  // console.log('input data: ', txResponse.data)
  return await txResponse.wait(1);
}

const toHuman = (x: BigNumber, fractionDigits = 2) => {
  return formatEther(x)
};

const main = async () => {
    // init
    const [operator] = await ethers.getSigners();
    const balance = await ethers.provider.getBalance(operator.address);
    log(contractName, contractAddress);
    log('operator.address: ', operator.address, toHuman(balance));

    // 1. get instance
    const contract = (await ethers.getContractAt(contractName, contractAddress)).connect(
        operator
    ) as OdosRouter;

    const msgValue = unit.mul(1).div(100) // matic

    const executor = '0x8Fd175fda06AEB02d8e10D3b9DeAD8A122D4d9d8'
    const inputToken = {
      tokenAddress: '0x0000000000000000000000000000000000000000',
      amountIn: msgValue,
      receiver: executor,
      permit: '0x',
    }

    const inputs = [inputToken]

    const outputToken = {
      tokenAddress: '0x980111ae1B84E50222C8843e3A7a038F36Fecd2b',
      relativeValue: 1,
      receiver: operator.address,
    }

    const outputs = [outputToken]

    const valueOutQuote = unit.mul(10).div(100)
    // const valueOutMin = unit.mul(10).div(100)
    const valueOutMin = unit.mul(1).div(1000000)
    const pathDefinition = '0x0102030006010102030001010102011eff0000000000000000000000000000009ae7cbe16ba387101048b6da1f2b11604a4ab2534c28f48448720e9000907bc2611f73022fdce1fa'

    await waitTx(contract.swap(
      inputs,
      outputs,
      valueOutQuote,
      valueOutMin,
      executor,
      pathDefinition,

      {
        value: msgValue
      }
    ))
};

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
