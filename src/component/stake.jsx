import React, { useEffect, useState } from "react";

import { useContractRead } from "wagmi";

import { ethers } from "ethers";

import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";

function Stake(props) {
  const [balance, setBalance] = useState(0);
  const [show, setShow] = useState(false);

  // Stake ETH to the staking pool
  const stakeEth = async () => {
    if (balance >= 10) {
      const amount = ethers.utils.parseEther("10");
      await props.contract.stakeEth(props.walletId, amount);
    }
    setShow(false);
  };

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  // Get balance of ETH in the wallet
  const { data: dataBalance } = useContractRead({
    ...props.stakingWalletContract,
    functionName: "walletBalance",
    watch: true,
    args: [props.walletId],
  });

  useEffect(() => {
    if (dataBalance) {
      const result = ethers.utils.formatEther(dataBalance);
      setBalance(result);
    }
  }, [dataBalance]);

  return (
    <>
      <Button variant="primary" onClick={handleShow}>
        Stake 10 ETH
      </Button>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Stake ETH to the staking pool</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          This will stake 10 ETH from your wallet to the staking pool and you
          will start to earn rewards in the form of WEB3 ERC20 tokens. Please
          ensure you have upto 10 ETH in your wallet to proceed.
          <br />
          <br />
          You're about to stake 10 ETH
          <br />
          <br />
          You currently have{" "}
          <span style={{ fontWeight: "bold" }}>{balance} ETH</span> in this
          wallet.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          {balance >= 10 ? (
            <Button variant="primary" onClick={stakeEth}>
              Confirm
            </Button>
          ) : (
            <Button variant="secondary" onClick={stakeEth}>
              Nothing enough balance to stake
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default Stake;
