import { useEffect, useState } from "react";

import { useContractRead } from "wagmi";

import { ethers } from "ethers";


function CurrentReward(props) {
  const [stakeReward, setStakeReward] = useState(0);

  // Get current rewards accumulated so far
  const { data: dataStakeReward } = useContractRead({
    ...props.stakingWalletContract,
    functionName: "currentReward",
    args: [props.walletId],
    watch: true,
  });

  useEffect(() => {
    if (dataStakeReward) {
      const result = ethers.utils.formatEther(dataStakeReward);
      setStakeReward(result);
    }
  }, [dataStakeReward]);

  return <>{stakeReward} WEB3</>;
}

export default CurrentReward;
