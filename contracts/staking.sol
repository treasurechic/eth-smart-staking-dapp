// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./wallet.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableMap.sol";

contract Staking is ERC20 {
    event WalletCreate(uint256 walletId, address _address);
    event WalletDeposit(uint256 walletId, uint256 amount);
    event StakeEth(uint256 walletId, uint256 amount, uint256 startTime);
    event UnStakeEth(uint256 walletId, uint256 amount, uint256 numStocksReward);
    event WalletWithdraw(uint256 walletId, address _to, uint256 amount);
    // You can use a struct or mapping to keep track of all the current stakes in the staking pool.
    using EnumerableMap for EnumerableMap.UintToAddressMap;

    // Make sure to track the wallet, the total amount of ETH staked, the start time of the stake and the
    // end time of the stake
    struct StakeWallet {
        Wallet user;
        uint256 stakedAmount;
        uint256 sinceBlock;
        uint256 untilBlock;
    }

    StakeWallet[] private stakeWallets;

    EnumerableMap.UintToAddressMap private walletsStaked;

    // This defines the total percentage of reward(WEB3 ERC20 token) to be accumulated per second
    uint256 public constant percentPerBlock = 1; // Bonus Exercise: use more granular units

    // Define the ERC20 token
    constructor() ERC20("WEB3 ERC20", "WEB3") {}

    function walletCreate()
        public
        returns (uint256 walletId, address _address)
    {
        Wallet wallet = new Wallet();
        stakeWallets.push(StakeWallet(wallet, 0, 0, 0));
        uint256 walletid = stakeWallets.length - 1;
        emit WalletCreate(walletId, address(wallet));
        return (walletid, address(wallet));
    }

    function getWallets() public view returns (StakeWallet[] memory) {
        return stakeWallets;
    }

    // Let users deposit any amount of ETH into their wallet
    function walletDeposit(
        uint256 _walletId
    ) public payable isWalletOwner(_walletId) {
        StakeWallet storage stakeWallet = stakeWallets[_walletId];
        stakeWallet.user.deposit{value: msg.value}();
        emit WalletDeposit(_walletId, msg.value);
    }

    function walletBalance(uint256 _walletId) public view returns (uint256) {
        StakeWallet storage stakeWallet = stakeWallets[_walletId];
        return stakeWallet.user.balanceOf();
    }

    function walletWithdraw(
        uint256 _walletId,
        address payable _to,
        uint256 _amount
    ) public payable isWalletOwner(_walletId) {
        StakeWallet storage stakeWallet = stakeWallets[_walletId];
        stakeWallet.user.withdraw(_to, _amount);
        emit WalletWithdraw(_walletId, _to, _amount);
    }

    function stakeEth(
        uint256 _walletId,
        uint256 _amount
    ) public isWalletOwner(_walletId) {
        StakeWallet storage stakeWallet = stakeWallets[_walletId];
        //  Ensure that the wallet balance is non-zero and enough before staking
        uint256 currentBalance = stakeWallet.user.balanceOf();
        require(currentBalance > 0, "Wallet Balance needs to be non-zero");
        require(
            currentBalance >= _amount,
            "You do not have enought ETH to stake"
        );

        // Transfer ETH from the wallet(Wallet contract) to the staking pool(this contract)
        stakeWallet.user.withdraw(payable(address(this)), _amount);

        // Reward with WEB3 tokens that the user had accumulated previously
        uint256 totalUnclaimedRewards = currentReward(_walletId);
        _mint(msg.sender, totalUnclaimedRewards);

        stakeWallet.stakedAmount += _amount;
        stakeWallet.sinceBlock = block.timestamp;
        stakeWallet.untilBlock = 0;

        walletsStaked.set(_walletId, address(stakeWallet.user));

        emit StakeEth(_walletId, _amount, block.timestamp);
    }

    function currentStake(uint256 _walletId) public view returns (uint256) {
        StakeWallet storage stakeWallet = stakeWallets[_walletId];
        return stakeWallet.stakedAmount;
    }

    function currentReward(uint256 _walletId) public view returns (uint256) {
        StakeWallet storage stakeWallet = stakeWallets[_walletId];
        uint256 stakedForBlocks = (block.timestamp - stakeWallet.sinceBlock);
        uint256 totalUnclaimedRewards = (stakeWallet.stakedAmount *
            stakedForBlocks *
            percentPerBlock) / 100;
        return totalUnclaimedRewards;
    }

    function totalAddressesStaked() public view returns (uint256) {
        return walletsStaked.length();
    }

    function isWalletStaked(uint256 _walletId) public view returns (bool) {
        return walletsStaked.contains(_walletId);
    }

    function unstakeEth(
        uint256 _walletId
    ) public payable isWalletOwner(_walletId) {
        StakeWallet storage stakeWallet = stakeWallets[_walletId];
        // Ensure that the user hasn't already unstaked previously
        require(stakeWallet.untilBlock == 0, "Already unstaked");
        // Transfer ETH from the staking pool(this contract) to the wallet(Wallet contract)
        uint256 currentBalance = stakeWallet.stakedAmount;
        payable(address(stakeWallet.user)).transfer(currentBalance);
        // Reward with WEB3 tokens that the user had accumulated so far
        uint256 rewardAmount = currentReward(_walletId);
        _mint(msg.sender, rewardAmount);

        stakeWallet.untilBlock = block.timestamp;
        stakeWallet.sinceBlock = 0;
        stakeWallet.stakedAmount = 0;

        walletsStaked.remove(_walletId);
        emit UnStakeEth(_walletId, stakeWallet.stakedAmount, rewardAmount);
    }

    receive() external payable {}

    modifier isWalletOwner(uint256 walletId) {
        require(msg.sender != address(0), "Invalid owner");
        StakeWallet storage stakeWallet = stakeWallets[walletId];

        require(
            stakeWallet.user.owner() == msg.sender,
            "Not the owner of the wallet"
        );
        _;
    }
}
