import React , { useState } from "react";
import EmployeeTable from "./components/EmployeeTable";
import EmployeeForm from "./components/EmployeeForm";

import './App.css';

function App() {
  const [refreshFlag, setRefreshFlag] = useState(false); //used to refresh after add/edit I guess

  const triggerRefresh = () => setRefreshFlag(!refreshFlag);

  return (
    <div style={{ maxWidth: "900px", margin: "20px auto", fontFamily: "Arial" }}>
      <h1>Employee Management System</h1>
      
      {/* Employee Table */}
      <div style={{ marginTop: "40px" }}>
        <EmployeeTable refreshFlag={refreshFlag} />
      </div>  


    </div>
  );
}

export default App;
