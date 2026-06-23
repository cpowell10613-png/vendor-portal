"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://coszkltkccotalepkybn.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNvc3prbHRrY2NvdGFsZXBreWJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIxMzAxMTUsImV4cCI6MjA5NzcwNjExNX0.iHMDEFy8MhD7C7kWIhNKX4WRleuKZB2ZiZ1b9oIol5Q"
);

export default function App() {
  const [view, setView] = useState("vendor");
  const [invoices, setInvoices] = useState<any[]>([]);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    const { data, error } = await supabase.from("invoices").select("*");
    if (error) {
      console.error(error);
      return;
    }
    setInvoices(data);
  };

  return (
    <div style={{ padding: 20 }}>
      <div style={{ marginBottom: 20 }}>
        <button onClick={() => setView("vendor")}>Vendor Portal</button>
        <button onClick={() => setView("admin")} style={{ marginLeft: 10 }}>
          Admin Dashboard
        </button>
      </div>

      {view === "vendor" ? (
        <VendorPortal fetchInvoices={fetchInvoices} />
      ) : (
        <AdminDashboard invoices={invoices} fetchInvoices={fetchInvoices} />
      )}
    </div>
  );
}

function VendorPortal({ fetchInvoices }) {
  const [invoice, setInvoice] = useState({
    vendor: "",
    project: "",
    amount: "",
    invoiceNumber: ""
  });

  const projects = [
    "Kitchen Remodel - Smith",
    "Office Buildout - Johnson",
    "HVAC Upgrade - Williams"
  ];

  const handleSubmit = async () => {
    const { error } = await supabase.from("invoices").insert([
      {
        vendor: invoice.vendor,
        project: invoice.project,
        amount: invoice.amount,
        invoice_number: invoice.invoiceNumber,
        status: "Submitted"
      }
    ]);

    if (error) {
      console.error(error);
      alert("Error submitting invoice");
      return;
    }

    alert("Invoice submitted successfully!");
    fetchInvoices();
  };

  return (
    <div>
      <h2>Vendor Invoice Submission</h2>

      <input
        placeholder="Vendor Name"
        onChange={(e) =>
          setInvoice({ ...invoice, vendor: e.target.value })
        }
      />
      <br /><br />

      <input
        placeholder="Invoice Number"
        onChange={(e) =>
          setInvoice({ ...invoice, invoiceNumber: e.target.value })
        }
      />
      <br /><br />

      <input
        type="number"
        placeholder="Amount"
        onChange={(e) =>
          setInvoice({ ...invoice, amount: e.target.value })
        }
      />
      <br /><br />

      <select
        onChange={(e) =>
          setInvoice({ ...invoice, project: e.target.value })
        }
      >
        <option>Select Project</option>
        {projects.map((p) => (
          <option key={p}>{p}</option>
        ))}
      </select>

      <br /><br />

      <button onClick={handleSubmit}>Submit Invoice</button>
    </div>
  );
}

function AdminDashboard({ invoices, fetchInvoices }) {
  const updateStatus = async (id, status) => {
    await supabase.from("invoices").update({ status }).eq("id", id);
    fetchInvoices();
  };

  return (
    <div>
      <h2>Admin Dashboard</h2>

      {invoices.length === 0 && <p>No invoices submitted yet.</p>}

      {invoices.map((inv) => (
        <div
          key={inv.id}
          style={{
            border: "1px solid #ccc",
            padding: 10,
            marginBottom: 10
          }}
        >
          <div><strong>Vendor:</strong> {inv.vendor}</div>
          <div><strong>Project:</strong> {inv.project}</div>
          <div><strong>Invoice #:</strong> {inv.invoice_number}</div>
          <div><strong>Amount:</strong> ${inv.amount}</div>
          <div><strong>Status:</strong> {inv.status}</div>

          <div style={{ marginTop: 10 }}>
            <button onClick={() => updateStatus(inv.id, "Approved")}>
              Approve
            </button>
            <button onClick={() => updateStatus(inv.id, "Rejected")}>
              Reject
            </button>
            <button onClick={() => updateStatus(inv.id, "Posted to QBO")}>
              Post to QBO
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
