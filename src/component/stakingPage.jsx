import { ConnectButton } from "@rainbow-me/rainbowkit";

import Container from "react-bootstrap/Container";

import Button from "react-bootstrap/Button";
import Row from "react-bootstrap/Row";
import Table from "react-bootstrap/Table";

import { ethers } from "ethers";
import { useContract, useContractRead, useSigner } from "wagmi";

import Staking from "../artifacts/contracts/staking.sol/Staking.json";

import CurrentReward from "./currentReward";
import Deposit from "./deposit";
import StakedBalance from "./stakedBalance";
import StakingPoolInfo from "./stakingPoolInfo";
import Unstake from "./unstake";
import WalletBalance from "./walletBalance";
import Withdraw from "./withdraw";
import Stake from "./stake";

export const StakingPage = () => {
  // Create a contract instance
  const { data: signer } = useSigner();

  const stakingWalletContract = {
    address: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
    abi: Staking.abi,
  };


  const contract = useContract({
    ...stakingWalletContract,
    signerOrProvider: signer,
  });

  // Create a new wallet
  const walletCreate = async () => {
    await contract.walletCreate();
  };

  // Get the total list of wallets
  const { data: wallets } = useContractRead({
    ...stakingWalletContract,
    functionName: "getWallets",
    watch: true,
  });


  return (
    <div className="container py-5">
      <div className="mb-5">
        <ConnectButton />
      </div>

      <StakingPoolInfo stakingWalletContract={stakingWalletContract} />

      <br />

      <Container>
        <Row>
          <h3 className="font-bold mb-5">{"My Wallets"}</h3>
        </Row>
        <Row>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Wallet Id</th>
                <th>Deposit</th>
                <th>Current Balance</th>

                <th>Withdraw</th>
                <th>Staked?</th>
                <th>Stake</th>
                <th>Current Stake</th>
                <th>Unstake</th>
                <th>Current Staked Rewards</th>
              </tr>
            </thead>
            <tbody>
              {wallets &&
                wallets.map((wallet, i) => {
                  return (
                    <tr key={i}>
                      <td>{i}</td>
                      <td>
                        <Deposit contract={contract} walletId={i} />
                      </td>
                      <td>
                        <WalletBalance
                          stakingWalletContract={stakingWalletContract}
                          walletId={i}
                        />
                      </td>
                      <td>
                        <Withdraw stakingWalletContract={stakingWalletContract} contract={contract} walletId={i} />
                      </td>
                      <td>
                        {ethers.utils.formatEther(wallet.stakedAmount) > 0
                          ? "Yes"
                          : "No"}
                      </td>
                      <td>
                        <Stake
                          stakingWalletContract={stakingWalletContract}
                          contract={contract}
                          walletId={i}
                        />
                      </td>
                      <td>
                        <StakedBalance
                          stakingWalletContract={stakingWalletContract}
                          walletId={i}
                        />
                      </td>
                      <td>
                        <Unstake
                          stakingWalletContract={stakingWalletContract}
                          contract={contract}
                          walletId={i}
                        />
                      </td>
                      <td>
                        <CurrentReward
                          stakingWalletContract={stakingWalletContract}
                          contract={contract}
                          walletId={i}
                        />
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </Table>
        </Row>
      </Container>

      <Container>
        <Row>
          <Button onClick={walletCreate}>Create a new Wallet</Button>
        </Row>
      </Container>
    </div>
  );
};
