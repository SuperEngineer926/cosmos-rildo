import Web3 from 'web3';
import WalletConnectProvider from '@walletconnect/web3-provider';
import WalletLink from 'walletlink';
import Web3Modal from 'web3modal';
import { ethers } from 'ethers';
import { MerkleTree } from 'merkletreejs';
import keccak256 from 'keccak256';
import _ from 'lodash';
import contractAbi from './abi.json';
import values from './allowlist';

const INFURA_ID = 'c31e1f10f5e540aeabf40419532cbbb6';

let CONTRACT_ADDRESS = '0x84df1ceee2a66e1dc4d2a171c30be54774b192e3';
let NETWORK = 'rinkeby';

const web3 = new Web3(Web3.givenProvider || `https://${NETWORK}.infura.io/v3/${INFURA_ID}`);

//default provider infura
let provider = new ethers.providers.Web3Provider(web3.currentProvider);
let signer;
let web3Modal;

// create an instance of contract
let cosmosContract = new ethers.Contract(
  CONTRACT_ADDRESS,
  contractAbi,
  provider
);


const providerOptions = {
  walletconnect: {
    package: WalletConnectProvider,
    options: {
        infuraId: INFURA_ID,
    },
  },
  'custom-walletlink': {
      display: {
          logo: 'https://play-lh.googleusercontent.com/wrgUujbq5kbn4Wd4tzyhQnxOXkjiGqq39N4zBvCHmxpIiKcZw_Pb065KTWWlnoejsg',
          name: 'Coinbase Wallet',
      },
      options: {
          appName: 'Coinbase',
          networkUrl: `https://${NETWORK}.infura.io/v3/${INFURA_ID}`,
          chainId: 1,
      },
      package: WalletLink,
      connector: async (_, options) => {
        const { appName, networkUrl, chainId } = options
        const walletLink = new WalletLink({
            appName,
        });
        const provider = walletLink.makeWeb3Provider(networkUrl, chainId);
        await provider.enable();
        return provider;
    }
  }
}

if (typeof window !== 'undefined') {
  web3Modal = new Web3Modal({
    network: NETWORK,
    cacheProvider: false,
    providerOptions,
  });
}

// verify checksum address and change price to wei
values.forEach(function(value) {
  value.address = ethers.utils.getAddress(value.address);
  value.price = ethers.utils.parseEther(value.price);
});

// connect to web3modal and instantiate the contracts with the same provider
const connectWeb3 = async () =>{
  const instance = await web3Modal.connect();

  provider = new ethers.providers.Web3Provider(instance);
  signer = provider.getSigner();

  let address = await signer.getAddress();

  // new instance of contract with signer
  cosmosContract = new ethers.Contract(
    CONTRACT_ADDRESS,
    contractAbi,
    signer
  );

  return address;
}

// force to use infura provider to get totalsupply on page loading
const getTotalSupply = async () => {
  let contract = new web3.eth.Contract(contractAbi, CONTRACT_ADDRESS);
  let totalSupply = await contract.methods.totalSupply().call();
  return totalSupply;
}

const isSaleActive = async () => {
  let saleState = await cosmosContract.saleActive();
  return saleState;
}
const isAllowListActive = async () => {
  let allowList = await cosmosContract.allowListActive();
  return allowList;
}

// values is an array of objects with keys: address, amount, price
const createMerkleRoot = (values) => {
  const leaves = values.map((v) =>
    ethers.utils.solidityKeccak256(
      ["address", "uint256", "uint256"],
      [v.address, _.toInteger(v.amount), v.price]
    )
  );

  const tree = new MerkleTree(leaves, keccak256, { sort: true });
  const root = tree.getHexRoot();

  return { root, tree };
};


// get the proof from an object with keys: address, amount, price
const getProof = (value) => {
  const { root, tree } = createMerkleRoot(values);

  const leaf = ethers.utils.solidityKeccak256(
    ["address", "uint256", "uint256" ],
    [value.address, value.amount, value.price]
  );
  const proof = tree.getHexProof(leaf);

  return proof;
};

// find the amount from a values list, or return undefined
const getAmountFromValues = (address) => {
  return _.find(values, { address });
};

export {
  getTotalSupply,
  connectWeb3,
  isSaleActive,
  isAllowListActive,
  getAmountFromValues,
  getProof,
  cosmosContract,
  provider,
  web3Modal,
};