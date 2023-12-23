import { InputCheckbox } from "../InputCheckbox";
import { TransactionPaneComponent } from "./types";

export const TransactionPane: TransactionPaneComponent = ({
  transaction,
  loading,
  transactionApprovals,
  setTransactionApproval: consumerSetTransactionApproval,
}) => {
  // Use the approval status from the parent component
  const isApproved = transactionApprovals[transaction.id] ?? transaction.approved;

  return (
    <div className="RampPane">
      <div className="RampPane--content">
        <p className="RampText">{transaction.merchant}</p>
        <b>{moneyFormatter.format(transaction.amount)}</b>
        <p className="RampText--hushed RampText--s">
          {transaction.employee.firstName} {transaction.employee.lastName} - {transaction.date}
        </p>
      </div>
      <InputCheckbox
        id={transaction.id}
        checked={isApproved}
        disabled={loading}
        onChange={async (newValue) => {
          // Update the approval status in the parent component
          await consumerSetTransactionApproval({
            transactionId: transaction.id,
            newValue,
          });
        }}
      />
    </div>
  );
};

const moneyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});
