import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { InputSelect } from "./components/InputSelect";
import { Instructions } from "./components/Instructions";
import { Transactions } from "./components/Transactions";
import { useEmployees } from "./hooks/useEmployees";
import { usePaginatedTransactions } from "./hooks/usePaginatedTransactions";
import { useTransactionsByEmployee } from "./hooks/useTransactionsByEmployee";
import { EMPTY_EMPLOYEE } from "./utils/constants";
import { Employee, Transaction } from "./utils/types";

export function App() {
  const { data: employees, ...employeeUtils } = useEmployees();
  const { data: paginatedTransactions, ...paginatedTransactionsUtils } = usePaginatedTransactions();
  const { data: transactionsByEmployee, ...transactionsByEmployeeUtils } = useTransactionsByEmployee();
  const [isLoading, setIsLoading] = useState(false);
  // Bug 5: Employees filter not available during loading more data
  // Solution: We need to keep track of loading state for employees and transactions
  const [isEmployeesLoading, setIsEmployeesLoading] = useState(false);
  const [isTransactionsLoading, setIsTransactionsLoading] = useState(false);
  // Bug 6: View more button not working as expected
  // Solution: We need to keep track of whether we are filtering by employee or not
  const [isFilteredByEmployee, setIsFilteredByEmployee] = useState(false);
  /* 
  Bug 4: Clicking on View More button not showing correct data
  Solution: We need to keep track of all transactions in a single state
  Instead of relying solely on paginatedTransactions.data or transactionsByEmployee, 
  maintain a separate state in your component that accumulates all transactions 
  as they are loaded.
  */

  // New state for accumulating all transactions
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);

  /*
  Bug 7: Approving a transaction won't persist the new value
  Solution: We need to keep track of the approval state of each transaction
  */

  // State to track approval status of each transaction
const [transactionApprovals, setTransactionApprovals] = useState({});

// Function to update transaction approval
    const setTransactionApproval = useCallback((transactionId: any, approved: any) => {
      setTransactionApprovals((prevApprovals) => ({
        ...prevApprovals,
        [transactionId]: approved
      }));
    }, []);

  const loadAllTransactions = useCallback(async () => {
    setIsTransactionsLoading(true);
    setIsEmployeesLoading(true);
    setIsFilteredByEmployee(false); 
  
    await employeeUtils.fetchAll();
    setIsEmployeesLoading(false);
  
    await paginatedTransactionsUtils.fetchAll();
    if (paginatedTransactions?.data) {
      setAllTransactions(prev => [...prev, ...paginatedTransactions.data]);
    }
  
    setIsTransactionsLoading(false);
  }, [employeeUtils, paginatedTransactionsUtils, transactionsByEmployeeUtils]);
  
  // Additional useEffect to handle updates to paginatedTransactions?.data
  useEffect(() => {
    if (paginatedTransactions?.data) {
      setAllTransactions(prev => [...prev, ...paginatedTransactions.data]);
    }
  }, [paginatedTransactions?.data]);
  
  const loadTransactionsByEmployee = useCallback(
    async (employeeId: string) => {
      setIsTransactionsLoading(true);
      paginatedTransactionsUtils.invalidateData();
  
      // Reset allTransactions before fetching new data
      setAllTransactions([]);
  
      await transactionsByEmployeeUtils.fetchById(employeeId);
      setIsFilteredByEmployee(true);
      setIsTransactionsLoading(false);
    },
    [paginatedTransactionsUtils, transactionsByEmployeeUtils]
  );
  
  
  // Add useEffect for transactionsByEmployee
  useEffect(() => {
    if (transactionsByEmployee) {
      setAllTransactions(transactionsByEmployee);
    } else {
      setAllTransactions([]); // Reset if no data or empty data
    }
  }, [transactionsByEmployee]);

  useEffect(() => {
    if (employees === null && !employeeUtils.loading  ) {
      loadAllTransactions();
    }
  }, [employeeUtils.loading, employees, loadAllTransactions]);

  useEffect(() => {
    if (isFilteredByEmployee) {
      setAllTransactions(transactionsByEmployee ?? []);
    }
  }, [transactionsByEmployee, isFilteredByEmployee]);
  

  return (
    <Fragment>
      <main className="MainContainer">
        <Instructions />

        <hr className="RampBreak--l" />
        {/* 
        Bug 3: Cannot select All Employees after selecting an employee
        Solution: Modify the onChange handler to handle the case 
        where the selectedEmployee is null.

        We want to check if the selected employee is either null or matches the EMPTY_EMPLOYEE (used to represent 'All Employees').
        If it matches, call loadAllTransactions to load transactions without employee filtering.
        Otherwise, call loadTransactionsByEmployee with the selected employee's id.
        */}
        <InputSelect<Employee>
          isLoading={isEmployeesLoading}
          defaultValue={EMPTY_EMPLOYEE}
          items={employees === null ? [] : [EMPTY_EMPLOYEE, ...employees]}
          label="Filter by employee"
          loadingLabel="Loading employees"
          parseItem={(item) => ({
            value: item.id,
            label: `${item.firstName} ${item.lastName}`,
          })}
          onChange={async (selectedEmployee) => {
            if (selectedEmployee === null || selectedEmployee.id === EMPTY_EMPLOYEE.id) {
              // When selecting "All Employees", reset the filtered state and load all transactions
              setIsFilteredByEmployee(false);
              await loadAllTransactions();
            } else {
              // When selecting a specific employee, load transactions for that employee
              await loadTransactionsByEmployee(selectedEmployee.id);
            }
          }}
        />

        <div className="RampBreak--l" />

        <div className="RampGrid">
  <Transactions transactions={allTransactions} />

  {!isFilteredByEmployee && paginatedTransactions?.nextPage !== null && (
    <button
      className="RampButton"
      disabled={isTransactionsLoading}
      onClick={async () => {
        await loadAllTransactions()
      }}
    >
      View More
    </button>
  )}
</div>

      </main>
    </Fragment>
  );
}
