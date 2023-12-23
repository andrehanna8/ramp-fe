import { useCallback, useState } from "react";
import { useCustomFetch } from "src/hooks/useCustomFetch";
import { SetTransactionApprovalParams } from "src/utils/types";
import { TransactionPane } from "./TransactionPane";
import { SetTransactionApprovalFunction, TransactionsComponent } from "./types";

export const Transactions: TransactionsComponent = ({ transactions }) => {
  const { fetchWithoutCache, loading } = useCustomFetch();
  // Bug 7: Approving a transaction won't persist the new value
  // Solution: We need to keep track of the approval state of each transaction
  const [transactionApprovals, setTransactionApprovals] = useState({});

  const setTransactionApproval = useCallback<SetTransactionApprovalFunction>(
    async ({ transactionId, newValue }) => {
      await fetchWithoutCache<void, SetTransactionApprovalParams>("setTransactionApproval", {
        transactionId,
        value: newValue,
      });

      // Update the transaction approvals state
      setTransactionApprovals(prev => ({
        ...prev,
        [transactionId]: newValue
      }));
    },
    [fetchWithoutCache]
  );

  if (transactions === null) {
    return <div className="RampLoading--container">Loading...</div>;
  }

  return (
    <div data-testid="transaction-container">
      {transactions.map((transaction) => (
        <TransactionPane
          key={transaction.id}
          transaction={transaction}
          loading={loading}
          setTransactionApproval={setTransactionApproval}
          transactionApprovals={transactionApprovals} 
        />
      ))}
    </div>
  );
};
