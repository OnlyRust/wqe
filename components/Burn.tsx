import { useCallback, useEffect, useState } from 'react'
import { ethos } from 'ethos-connect'
import { SuccessMessage } from '.';
import { ETHOS_EXAMPLE_CONTRACT } from '../lib/constants';

const Burn = ({ version, reset }: { version: number, reset: () => void }) => {
    const { wallet } = ethos.useWallet();
    const [transactionId, setTransactionId] = useState<string | null>(null);

    const clone = useCallback(async () => {
        if (!wallet) return;
    
        try {
          const mintTransaction = {
            kind: "moveCall" as const,
            data: {
              packageObjectId: ETHOS_EXAMPLE_CONTRACT,
              module: "example",
              function: "mint",
              typeArguments: [],
              arguments: [],
              gasBudget: 10000,
            },
          };
    
          const response = await wallet.signAndExecuteTransaction(mintTransaction);
          if (response?.effects?.events) {
            const { newObject: { objectId } } = response.effects.events.find((e) => e.newObject);
            
            const burnTransaction = {
              kind: "moveCall" as const,
              data: {
                packageObjectId: ETHOS_EXAMPLE_CONTRACT,
                module: "example",
                function: "burn",
                typeArguments: [],
                arguments: [
                  objectId
                ],
                gasBudget: 10000,
              },
            };
            

            const burnResponse = await wallet.signAndExecuteTransaction(burnTransaction);
            setTransactionId(burnResponse.effects.transactionDigest)
          }  
        } catch (error) {
          console.log(error);
        }
    }, [wallet]);

    useEffect(() => {
      setTransactionId(null)
    }, [version])

    return (
        <div className='flex flex-col gap-6'>
            {transactionId && (
                <SuccessMessage reset={reset}>
                    <a 
                        href={`https://explorer.sui.io/transactions/${encodeURI(transactionId)}`}
                        target="_blank" 
                        rel="noreferrer"
                        className='underline font-blue-600' 
                    >
                        View NFT burn transaction on the DevNet Explorer
                    </a>
                </SuccessMessage>
            )}
            <button
                className="mx-auto px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                onClick={clone}
            >
                Burn NFT
            </button>
        </div>
    )
}

export default Burn;