// src/components/Payout_dashboard.jsx
import React, { useState } from "react";
import DashboardSidebar from "./Dashboard_sidebar";
import "../styles/payout_dashboard.css";

const dummyHistory = [
  { id: 1, date: "26 Jul 2024", method: "payoneer", amount: 84, fee: 8.4, payable: 75.6, status: "Completed" },
  { id: 2, date: "26 Jul 2024", method: "payoneer", amount: 84, fee: 8.4, payable: 75.6, status: "Declined" },
  { id: 3, date: "26 Jul 2024", method: "payoneer", amount: 84, fee: 8.4, payable: 75.6, status: "Declined" },
  { id: 4, date: "26 Jul 2024", method: "paypal",   amount: 83, fee: 8.3, payable: 74.7, status: "Pending" },
];

export default function PayoutDashboard() {
  const [method, setMethod] = useState("Paypal");
  const [amount, setAmount] = useState("");

  return (
    <div className="dz-with-shell">
      <DashboardSidebar user={{ name: "Alex", avatar: "/assets/avatar.png" }} />

      <main className="dz-main dz-shell-main-padding">
        {/* Balance + Withdraw */}
        <section className="payout-balance">
          <h2>Balance: <span>$516.00</span></h2>
          <div className="payout-form">
            <input
              type="text"
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              placeholder="Payout Method"
            />
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Amount"
            />
            <button className="payout-btn">Withdraw</button>
          </div>
        </section>

        {/* Payout History */}
        <section className="payout-history">
          <h3>Payout History</h3>
          <table className="payout-table">
            <thead>
              <tr>
                <th>SL</th>
                <th>Date</th>
                <th>Method</th>
                <th>Amount</th>
                <th>Service Fee</th>
                <th>Payable</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {dummyHistory.map((row) => (
                <tr key={row.id}>
                  <td>{row.id}</td>
                  <td>{row.date}</td>
                  <td>{row.method}</td>
                  <td>${row.amount.toFixed(2)}</td>
                  <td>${row.fee.toFixed(2)}</td>
                  <td>${row.payable.toFixed(2)}</td>
                  <td>
                    <span className={`payout-status ${row.status.toLowerCase()}`}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
}
