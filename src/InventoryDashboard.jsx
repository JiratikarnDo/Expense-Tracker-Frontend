import React, { useState, useEffect } from "react";
import axios from "axios";
import "./expense.css";

const API_BASE = "http://localhost:5000"; // Flask backend

function ExpenseTracker() {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({
    total_income: 0,
    total_expense: 0,
    balance: 0,
  });

  const [form, setForm] = useState({
    date: "",
    type: "",
    category: "",
    amount: "",
    note: "",
  });

  const [view, setView] = useState("all"); // all | income | expense
  const [filter, setFilter] = useState({
    startDate: "",
    endDate: "",
    sort: "latest", // latest | oldest | high | low
  });

  // โหลดข้อมูลจาก backend
  const fetchData = () => {
    axios
      .get(`${API_BASE}/transactions`)
      .then((res) => setTransactions(res.data))
      .catch((err) => console.error(err));

    axios
      .get(`${API_BASE}/summary`)
      .then((res) => setSummary(res.data))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchData();
  }, []);

  // เพิ่ม transaction
  const addTransaction = (e) => {
    e.preventDefault();
    if (!form.date || !form.type || !form.category || !form.amount) {
      alert("กรอกข้อมูลให้ครบ");
      return;
    }

    axios
      .post(`${API_BASE}/transactions`, form)
      .then(() => {
        setForm({ date: "", type: "", category: "", amount: "", note: "" });
        fetchData();
      })
      .catch((err) => console.error(err));
  };

  // ฟังก์ชัน filter + sort
  const getFilteredTransactions = () => {
    return transactions
      .filter((t) => {
        if (filter.startDate && new Date(t.date) < new Date(filter.startDate))
          return false;
        if (filter.endDate && new Date(t.date) > new Date(filter.endDate))
          return false;
        return true;
      })
      .sort((a, b) => {
        if (filter.sort === "latest") return new Date(b.date) - new Date(a.date);
        if (filter.sort === "oldest") return new Date(a.date) - new Date(b.date);
        if (filter.sort === "high") return b.amount - a.amount;
        if (filter.sort === "low") return a.amount - b.amount;
        return 0;
      })
      .filter((t) => view === "all" || t.type === view);
  };

  return (
    <div className="container">
      <h2>💰 Expense Tracker</h2>

      {/* ฟอร์มเพิ่มรายการ */}
      <form onSubmit={addTransaction} className="form">
        <input
          type="date"
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
        />

        <select
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
        >
          <option value="">เลือกประเภท</option>
          <option value="income">รายรับ</option>
          <option value="expense">รายจ่าย</option>
        </select>

        <select
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
        >
          <option value="">เลือกหมวดหมู่</option>
          <option value="อาหาร">อาหาร</option>
          <option value="เดินทาง">เดินทาง</option>
          <option value="ที่พัก">ที่พัก</option>
          <option value="บันเทิง">บันเทิง</option>
          <option value="สุขภาพ">สุขภาพ</option>
          <option value="การศึกษา">การศึกษา</option>
          <option value="ของใช้">ของใช้</option>
          <option value="เสื้อผ้า">เสื้อผ้า</option>
          <option value="งานอดิเรก">งานอดิเรก</option>
          <option value="อื่นๆ">อื่นๆ</option>
        </select>

        <input
          type="number"
          placeholder="จำนวนเงิน"
          value={form.amount}
          onChange={(e) => setForm({ ...form, amount: e.target.value })}
        />

        <input
          type="text"
          placeholder="บันทึกเพิ่มเติม"
          value={form.note}
          onChange={(e) => setForm({ ...form, note: e.target.value })}
        />

        <button type="submit">เพิ่ม</button>
      </form>

      {/* Dashboard */}
      <div className="dashboard">
        <h3>📊 Dashboard</h3>
        <div className="dashboard-cards">
          <div className="card income">
            <h4>รายรับรวม</h4>
            <p>{summary.total_income} บาท</p>
          </div>
          <div className="card expense">
            <h4>รายจ่ายรวม</h4>
            <p>{summary.total_expense} บาท</p>
          </div>
          <div className="card balance">
            <h4>คงเหลือ</h4>
            <p>{summary.balance} บาท</p>
          </div>
        </div>

        {/* Toggle */}
        <div className="view-toggle">
          <button
            className={view === "all" ? "active" : ""}
            onClick={() => setView("all")}
          >
            ทั้งหมด
          </button>
          <button
            className={view === "income" ? "active" : ""}
            onClick={() => setView("income")}
          >
            เฉพาะรายรับ
          </button>
          <button
            className={view === "expense" ? "active" : ""}
            onClick={() => setView("expense")}
          >
            เฉพาะรายจ่าย
          </button>
        </div>
      </div>

      {/* Filter & Sort */}
      <div className="filters">
        <label>จาก: </label>
        <input
          type="date"
          value={filter.startDate}
          onChange={(e) => setFilter({ ...filter, startDate: e.target.value })}
        />
        <label>ถึง: </label>
        <input
          type="date"
          value={filter.endDate}
          onChange={(e) => setFilter({ ...filter, endDate: e.target.value })}
        />

        <select
          value={filter.sort}
          onChange={(e) => setFilter({ ...filter, sort: e.target.value })}
        >
          <option value="latest">วันที่ใหม่สุด</option>
          <option value="oldest">วันที่เก่าสุด</option>
          <option value="high">จำนวนเงินมากสุด</option>
          <option value="low">จำนวนเงินน้อยสุด</option>
        </select>
      </div>

      {/* ตารางแสดงรายการ */}
      <table>
        <thead>
          <tr>
            <th>วันที่</th>
            <th>ประเภท</th>
            <th>หมวดหมู่</th>
            <th>จำนวนเงิน</th>
            <th>หมายเหตุ</th>
          </tr>
        </thead>
        <tbody>
          {getFilteredTransactions().map((t) => (
            <tr key={t.id}>
              <td>{t.date}</td>
              <td>{t.type === "income" ? "รายรับ" : "รายจ่าย"}</td>
              <td>{t.category}</td>
              <td>{t.amount}</td>
              <td>{t.note}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ExpenseTracker;
