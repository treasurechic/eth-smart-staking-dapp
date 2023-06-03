import React, { useState } from "react";

import { ethers } from "ethers";

import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import { useContractRead } from "wagmi";

function Withdraw(props) {
  const [show, setShow] = useState(false);
  const [ethToUseForWithdrawal, setEthToUseForWithdrawal] = useState(0);
  const [ethAddrToUseForWithdrawal, setEthAddrToUseForWithdrawal] = useState(
    ethers.constants.AddressZero
  );

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  // Get balance of ETH in the wallet
  const { data: dataBalance } = useContractRead({
    ...props.stakingWalletContract,
    functionName: "walletBalance",
    watch: true,
    args: [props.walletId],
  });

  // Withdraw ETH from the wallet
  const walletWithdraw = async () => {
    const balance = ethers.utils.formatEther(dataBalance);
    if (
      ethToUseForWithdrawal > 0 &&
      ethAddrToUseForWithdrawal !== ethers.constants.AddressZero &&
      ethToUseForWithdrawal <= balance
    ) {
      await props.contract.walletWithdraw(
        props.walletId,
        ethAddrToUseForWithdrawal,
        ethers.utils.parseEther(ethToUseForWithdrawal)
      );
      setEthToUseForWithdrawal(0);
      setEthAddrToUseForWithdrawal(ethers.constants.AddressZero);
      setShow(false);
    }
  };

  return (
    <>
      <Button variant="danger" onClick={handleShow}>
        Withdraw ETH
      </Button>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Withdraw ETH from the wallet</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3" controlId="numberInEthWithdraw">
              <Form.Control
                type="text"
                placeholder="Enter the amount in ETH"
                onChange={(e) => setEthToUseForWithdrawal(e.target.value)}
              />
              <Form.Control
                type="text"
                placeholder="Enter the ETH address to withdraw to"
                onChange={(e) => setEthAddrToUseForWithdrawal(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            disabled={
              dataBalance && ethers.utils.formatEther(dataBalance) === "0.0"
            }
            onClick={walletWithdraw}
          >
            Withdraw
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default Withdraw;
