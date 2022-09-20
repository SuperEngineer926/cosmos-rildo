import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import TearDropButton from '../../../../components/shared/teardrop-button';
import {
  connectWeb3,
  getTotalSupply,
  isSaleActive,
  isAllowListActive,
  getAmountFromValues,
  getProof,
  cosmosContract,
} from '../../../../../ethereum/web3Modal';
// NOTE: context is for testing ONLY. Remove once endpoint/contract is connected.
import { META_MASK_STATUS } from '../../context/constants';
import { useMintContext } from '../../context';

let contractNetwork = 4;
let etherscanLink =
  contractNetwork === 1
    ? "https://etherscan.io/tx"
    : "https://rinkeby.etherscan.io/tx";

const MINT_BUTTON_LABELS = {
  [META_MASK_STATUS.notConnected]: () => 'Connect Wallet',
  [META_MASK_STATUS.connecting]: () => 'Connecting...',
  [META_MASK_STATUS.connected]: (quantity, price) => `Mint ${quantity} - ${(quantity * price).toFixed(2)} ETH`,
  [META_MASK_STATUS.minting]: (quantity) => `Minting ${quantity} Camp Cosmos...`,
};

const MintButton = () => {
  const { metaMaskData, mintData, setMetaMaskData, setMintData, setNotification } = useMintContext();
  const { status } = metaMaskData;
  const { price, quantity } = mintData;

  const [disabled, setDisabled] = useState(false);
  const [label, setLabel] = useState('');

  const handleOnClick = async () => {
    const saleActive = await isSaleActive();
    const allowListActive = await isAllowListActive();
    if (status === META_MASK_STATUS.notConnected) {
      setMetaMaskData((prevProps) => ({
        ...prevProps,
        status: META_MASK_STATUS.connecting,
      }));
      const address = await connectWeb3();
      const value = getAmountFromValues(address);

      // if allow list active get allow to mint value
      if (allowListActive) {
        if (value === undefined) {
        // keep mintData
          setMintData((prevProps) => ({
            ...prevProps,
            total: 0,
            remaining: 0,
          }));
        } else {
          let valuePrice = ethers.utils.formatEther(value.price);
          const allowListMinted = await cosmosContract.getAllowListMinted(address);

          let availableToMint = Number(value.amount) - Number(allowListMinted);
          // update role later
          setMintData((prevProps) => ({
            ...prevProps,
            price: Number(valuePrice),
            // quantity: 0,
            // role: ROLES.public,
            total: value.amount,
            // totalSupply: 9000,
            remaining: availableToMint,
          }));
        }
      }
      setMetaMaskData((prevProps) => ({
        ...prevProps,
        status: META_MASK_STATUS.connected,
        address: address,
      }));
    }

    // click to mint
    if (status === META_MASK_STATUS.connected) {
      setMetaMaskData((prevProps) => ({
        ...prevProps,
        status: META_MASK_STATUS.minting,
      }));

      const numberToMint = mintData.quantity;

      const price = ethers.utils.parseEther(`${mintData.price}`);
      const amountInWei = price.mul(numberToMint);

      const overrides = {
        from: metaMaskData.address,
        value: amountInWei.toString(),
        gasLimit: undefined,
      }
      let gasEstimate;
      let hash;
      try {
        if (saleActive) {
          gasEstimate = await cosmosContract.estimateGas.mint(numberToMint, overrides);

          gasEstimate = gasEstimate.mul(
            ethers.BigNumber.from("125").div(ethers.BigNumber.from("100"))
          );

          overrides.gasLimit = gasEstimate;

          const tx = await cosmosContract.mint(numberToMint, overrides);

          const receipt = await tx.wait();
          hash = receipt.transactionHash;

        } else if (allowListActive) {
          const value = getAmountFromValues(metaMaskData.address);
          const proof = getProof(value);

          overrides.value = value.price.mul(numberToMint);

          gasEstimate = await cosmosContract.estimateGas.mintAllowList(
            numberToMint,
            value.amount,
            value.price,
            proof,
            overrides
          );

          gasEstimate = gasEstimate.mul(ethers.BigNumber.from("125").div(ethers.BigNumber.from("100")))
          overrides.gasLimit = gasEstimate;

          const tx = await cosmosContract.mintAllowList(
            numberToMint,
            value.amount,
            value.price,
            proof,
            overrides
          );

          const receipt = await tx.wait();
          hash = receipt.transactionHash;
        }
        // need to show this somewhere
        console.log(
          `Thanks for minting! Your tx link is <a href='${etherscanLink}/${hash}' target="_blank" >${hash.slice(0, 4)}...${hash.slice(-4)}</a>`
        );
        setNotification({
          content: `Thanks for minting! Your tx link is '${etherscanLink}/${hash}'`,
          severity: 'success',
        });

        // update totalSupply
        const ts = await getTotalSupply();
        setMintData((prevProps) => ({
          ...prevProps,
          totalSupply: ts.toString(),
          remaining: prevProps.remaining - mintData.quantity,
        }));
      } catch(err) {
        // need to show the err somewhere
        console.log(err);
        setNotification({
          content: 'Something went wrong and you were not able to mint, please try again',
          severity: 'error',
        });
      }
      setMetaMaskData((prevProps) => ({
        ...prevProps,
        status: META_MASK_STATUS.connected,
      }));
    }
  };

  useEffect(() => {
    setLabel(MINT_BUTTON_LABELS[META_MASK_STATUS[status]](quantity, price));
    setDisabled(status === META_MASK_STATUS.connecting || status === META_MASK_STATUS.minting);
  }, [price, quantity, status]);

  return (
    <TearDropButton
      ariaLabel="Mint action button"
      className="mint-button"
      disabled={disabled}
      onClick={handleOnClick}
    >
      {label}
    </TearDropButton>
  );
};

export default MintButton;
