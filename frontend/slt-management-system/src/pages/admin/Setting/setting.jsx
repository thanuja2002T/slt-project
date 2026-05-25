import "./setting.css";
import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";

export default function Settings() {

  /* =========================
     STATES
  ========================= */

  const [adminPassword, setAdminPassword] =
    useState("");

  const [loginPassword, setLoginPassword] =
    useState("");

  const [memberInput, setMemberInput] =
    useState("");

  const [vehicleInput, setVehicleInput] =
    useState("");

  const [teamInput, setTeamInput] =
    useState("");

  const [members, setMembers] =
    useState([]);

  const [vehicles, setVehicles] =
    useState([]);

  const [teams, setTeams] =
    useState([]);

  const [success, setSuccess] =
    useState("");

  /* =========================
     LOAD DATA
  ========================= */

  const loadData = async () => {

    // SETTINGS
    const { data: settingsData } =
      await supabase
        .from("app_settings")
        .select("*")
        .limit(1);

    if (
      settingsData &&
      settingsData.length > 0
    ) {

      setAdminPassword(
        settingsData[0]
          .admin_password || ""
      );

      setLoginPassword(
        settingsData[0]
          .login_password || ""
      );
    }

    // MEMBERS
    const { data: memberData } =
      await supabase
        .from("team_members")
        .select("*")
        .order("id", {
          ascending: true
        });

    if (memberData) {
      setMembers(memberData);
    }

    // VEHICLES
    const { data: vehicleData } =
      await supabase
        .from("vehicles")
        .select("*")
        .order("id", {
          ascending: true
        });

    if (vehicleData) {
      setVehicles(vehicleData);
    }

    // TEAMS
    const { data: teamData } =
      await supabase
        .from("teams")
        .select("*")
        .order("id", {
          ascending: true
        });

    if (teamData) {
      setTeams(teamData);
    }
  };

  /* =========================
     USE EFFECT
  ========================= */

  useEffect(() => {

    const timer =
      setTimeout(() => {

        loadData();

      }, 0);

    return () =>
      clearTimeout(timer);

  }, []);

  /* =========================
     SUCCESS TOAST
  ========================= */

  const showSuccess = (msg) => {

    setSuccess(msg);

    setTimeout(() => {

      setSuccess("");

    }, 2500);
  };

  /* =========================
     SAVE PASSWORDS
  ========================= */

  const savePasswords =
    async () => {

      const { data } =
        await supabase
          .from("app_settings")
          .select("*")
          .limit(1);

      if (
        data &&
        data.length > 0
      ) {

        await supabase
          .from("app_settings")
          .update({
            admin_password:
              adminPassword,

            login_password:
              loginPassword
          })
          .eq("id", data[0].id);

      } else {

        await supabase
          .from("app_settings")
          .insert([
            {
              admin_password:
                adminPassword,

              login_password:
                loginPassword
            }
          ]);
      }

      showSuccess(
        "Passwords Updated"
      );
    };

  /* =========================
     ADD MEMBER
  ========================= */

  const addMember = async () => {

    if (
      !memberInput.trim()
    ) return;

    await supabase
      .from("team_members")
      .insert([
        {
          member_name:
            memberInput
        }
      ]);

    setMemberInput("");

    await loadData();

    showSuccess(
      "Member Added"
    );
  };

  /* =========================
     DELETE MEMBER
  ========================= */

  const deleteMember =
    async (id, name) => {

      await supabase
        .from("team_members")
        .delete()
        .eq("id", id);

      await loadData();

      showSuccess(
        `${name} Removed`
      );
    };

  /* =========================
     ADD VEHICLE
  ========================= */

  const addVehicle =
    async () => {

      if (
        !vehicleInput.trim()
      ) return;

      await supabase
        .from("vehicles")
        .insert([
          {
            vehicle_number:
              vehicleInput
          }
        ]);

      setVehicleInput("");

      await loadData();

      showSuccess(
        "Vehicle Added"
      );
    };

  /* =========================
     DELETE VEHICLE
  ========================= */

  const deleteVehicle =
    async (id, name) => {

      await supabase
        .from("vehicles")
        .delete()
        .eq("id", id);

      await loadData();

      showSuccess(
        `${name} Removed`
      );
    };

  /* =========================
     ADD TEAM
  ========================= */

  const addTeam = async () => {

    if (
      !teamInput.trim()
    ) return;

    await supabase
      .from("teams")
      .insert([
        {
          team_name:
            teamInput
        }
      ]);

    setTeamInput("");

    await loadData();

    showSuccess(
      "Team Added"
    );
  };

  /* =========================
     DELETE TEAM
  ========================= */

  const deleteTeam =
    async (id, name) => {

      await supabase
        .from("teams")
        .delete()
        .eq("id", id);

      await loadData();

      showSuccess(
        `${name} Removed`
      );
    };

  /* =========================
     JSX
  ========================= */

  return (

    <div className="settings-page">

      {/* TOAST */}
      {success && (

        <div className="success-toast">
          {success}
        </div>

      )}

      <h1>
        Admin Settings
      </h1>

      {/* PASSWORDS */}
      <div className="settings-submit-card">

        <h2>
          App Passwords
        </h2>

        <input
          className="main-input"
          type="text"
          placeholder="Admin Password"
          value={adminPassword}
          onChange={(e) =>
            setAdminPassword(
              e.target.value
            )
          }
        />

        <input
          className="main-input"
          type="text"
          placeholder="Login Password"
          value={loginPassword}
          onChange={(e) =>
            setLoginPassword(
              e.target.value
            )
          }
        />

        <button
          onClick={savePasswords}
        >
          Save Passwords
        </button>

      </div>

      {/* TEAMS */}
      <div className="settings-submit-card">

        <h2>
          Teams
        </h2>

        <input
          className="main-input"
          type="text"
          placeholder="Add Team"
          value={teamInput}
          onChange={(e) =>
            setTeamInput(
              e.target.value
            )
          }
        />

        <button
          onClick={addTeam}
        >
          Add Team
        </button>

        <div className="list-wrap">

          {teams.map((t) => (

            <div
              className="item-chip"
              key={t.id}
            >

              {t.team_name}

              <span
                onClick={() =>
                  deleteTeam(
                    t.id,
                    t.team_name
                  )
                }
              >
                ×
              </span>

            </div>

          ))}

        </div>

      </div>

      {/* MEMBERS */}
      <div className="settings-submit-card">

        <h2>
          Team Members
        </h2>

        <input
          className="main-input"
          type="text"
          placeholder="Add member"
          value={memberInput}
          onChange={(e) =>
            setMemberInput(
              e.target.value
            )
          }
        />

        <button
          onClick={addMember}
        >
          Add Member
        </button>

        <div className="list-wrap">

          {members.map((m) => (

            <div
              className="item-chip"
              key={m.id}
            >

              {m.member_name}

              <span
                onClick={() =>
                  deleteMember(
                    m.id,
                    m.member_name
                  )
                }
              >
                ×
              </span>

            </div>

          ))}

        </div>

      </div>

      {/* VEHICLES */}
      <div className="settings-submit-card">

        <h2>
          Vehicle Numbers
        </h2>

        <input
          className="main-input"
          type="text"
          placeholder="Add vehicle"
          value={vehicleInput}
          onChange={(e) =>
            setVehicleInput(
              e.target.value
            )
          }
        />

        <button
          onClick={addVehicle}
        >
          Add Vehicle
        </button>

        <div className="list-wrap">

          {vehicles.map((v) => (

            <div
              className="item-chip"
              key={v.id}
            >

              {v.vehicle_number}

              <span
                onClick={() =>
                  deleteVehicle(
                    v.id,
                    v.vehicle_number
                  )
                }
              >
                ×
              </span>

            </div>

          ))}

        </div>

      </div>

    </div>
  );
}