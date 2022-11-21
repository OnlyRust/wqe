import { useCallback, useEffect, useState } from 'react'
import { ethos } from 'ethos-connect'
import { SuccessMessage } from '.';

const Transfer = ({ version, reset }: { version: number, reset: () => void }) => {
    const { wallet } = ethos.useWallet();
    const [nftObjectId, setNftObjectId] = useState(null);

    const mintAndTransfer = useCallback(async () => {
        if (!wallet) return;
    
        try {
          const mintTransaction = {
            kind: "moveCall" as const,
            data: {
              packageObjectId: "0x0000000000000000000000000000000000000002",
              module: "devnet_nft",
              function: "mint",
              typeArguments: [],
              arguments: [
                "Ethos Example NFT",
                "A sample NFT from Ethos Wallet.",
                "https://ethoswallet.xyz/assets/images/ethos-email-logo.png",
              ],
              gasBudget: 10000,
            },
          };
    
          const response = await wallet.signAndExecuteTransaction(mintTransaction);
          if (response?.effects?.events) {
            const { moveEvent } = response.effects.events.find((e) => e.moveEvent);
            const objectId = moveEvent.fields.object_id

            const transferTransaction = {
                kind: "transferObject" as const,
                data: {
                  objectId,
                  recipient: '0x5c48ea29ac876110006a80d036c5454cae3d1ad1',
                  gasBudget: 10000,
                },
            };

            const transferResponse = await wallet.signAndExecuteTransaction(transferTransaction);
            console.log("transferResponse", transferResponse)
            setNftObjectId(objectId);
          }  
        } catch (error) {
          console.log(error);
        }
    }, [wallet]);

    useEffect(() => {
        setNftObjectId(null)
    }, [version])

    return (
        <div className='flex flex-col gap-6'>
            {nftObjectId && (
                <SuccessMessage reset={reset}>
                    <a 
                        href={`https://explorer.devnet.sui.io/objects/${nftObjectId}`}
                        target="_blank" 
                        rel="noreferrer"
                        className='underline font-blue-600' 
                    >
                        View Your NFT on the DevNet Explorer 
                    </a>
                </SuccessMessage>
            )}
            <button
                className="mx-auto px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                onClick={mintAndTransfer}
            >
                Mint and Transfer
            </button>
        </div>
    )
}

export default Transfer;