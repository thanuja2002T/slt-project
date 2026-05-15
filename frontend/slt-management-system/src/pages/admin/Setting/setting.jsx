import "./setting.css";
import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";

export default function Settings() {

  const [password, setPassword] = useState("");

  const [memberInput, setMemberInput] = useState("");
  const [vehicleInput, setVehicleInput] = useState("");

  const [members, setMembers] = useState([]);
  const [vehicles, setVehicles] = useState([]);

  const [success, setSuccess] = useState("");

  const loadData = async () => {

    // PASSWORD
    const { data: settingsData } = await supabase
      .from("app_settings")
      .select("*")
      .limit(1);

    if (settingsData && settingsData.length > 0) {
      setPassword(settingsData[0].admin_password || "");
    }

    // MEMBERS
    const { data: memberData } = await supabase
      .from("team_members")
      .select("*")
      .order("id", { ascending: true });

    if (memberData) {
      setMembers(memberData);
    }

    // VEHICLES
    const { data: vehicleData } = await supabase
      .from("vehicles")
      .select("*")
      .order("id", { ascending: true });

    if (vehicleData) {
      setVehicles(vehicleData);
    }
  };

  useEffect(() => {

    const fetchData = async () => {
      await loadData();
    };

    fetchData();

  }, []);

  // SUCCESS TOAST
  const showSuccess = (msg) => {

    setSuccess(msg);

    setTimeout(() => {
      setSuccess("");
    }, 2500);
  };

  // SAVE PASSWORD
  const savePassword = async () => {

    const { data } = await supabase
      .from("app_settings")
      .select("*")
      .limit(1);

    if (data.length > 0) {

      await supabase
        .from("app_settings")
        .update({
          admin_password: password
        })
        .eq("id", data[0].id);

    } else {

      await supabase
        .from("app_settings")
        .insert([
          {
            admin_password: password
          }
        ]);
    }

    showSuccess("Password Updated");
  };

  // ADD MEMBER
  const addMember = async () => {

    if (!memberInput.trim()) return;

    await supabase
      .from("team_members")
      .insert([
        {
          member_name: memberInput
        }
      ]);

    setMemberInput("");

    await loadData();

    showSuccess("Member Added");
  };

  // DELETE MEMBER
  const deleteMember = async (id, name) => {

    await supabase
      .from("team_members")
      .delete()
      .eq("id", id);

    await loadData();

    showSuccess(`${name} Removed`);
  };

  // ADD VEHICLE
  const addVehicle = async () => {

    if (!vehicleInput.trim()) return;

    await supabase
      .from("vehicles")
      .insert([
        {
          vehicle_number: vehicleInput
        }
      ]);

    setVehicleInput("");

    await loadData();

    showSuccess("Vehicle Added");
  };

  // DELETE VEHICLE
  const deleteVehicle = async (id, name) => {

    await supabase
      .from("vehicles")
      .delete()
      .eq("id", id);

    await loadData();

    showSuccess(`${name} Removed`);
  };

  return (
    <div className="settings-page">

      {/* TOAST */}
      {success && (
        <div className="success-toast">
          {success}
        </div>
      )}

      <h1>Admin Settings</h1>

      {/* PASSWORD */}
      <div className="settings-submit-card">

        <h2>Admin Password</h2>

        <input
          className="main-input"
          type="text"
          placeholder="Enter admin password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button onClick={savePassword}>
          Save Password
        </button>

      </div>

      {/* MEMBERS */}
      <div className="settings-submit-card">

        <h2>Team Members</h2>

        

          <input
            className="main-input"
            type="text"
            placeholder="Add member"
            value={memberInput}
            onChange={(e) => setMemberInput(e.target.value)}
          />

          <button onClick={addMember}>
            Add
          </button>

      

        <div className="list-wrap">

          {members.map((m) => (
            <div className="item-chip" key={m.id}>

              {m.member_name}

              <span onClick={() => deleteMember(m.id, m.member_name)}>
                ×
              </span>

            </div>
          ))}

        </div>

      </div>

      {/* VEHICLES */}
      <div className="settings-submit-card">

        <h2>Vehicle Numbers</h2>

        

          <input
            className="main-input"
            type="text"
            placeholder="Add vehicle"
            value={vehicleInput}
            onChange={(e) => setVehicleInput(e.target.value)}
          />

          <button onClick={addVehicle}>
            Add
          </button>

        

        <div className="list-wrap">

          {vehicles.map((v) => (
            <div className="item-chip" key={v.id}>

              {v.vehicle_number}

              <span onClick={() => deleteVehicle(v.id, v.vehicle_number)}>
                ×
              </span>

            </div>
          ))}

        </div>

      </div>

    </div>
  );
}