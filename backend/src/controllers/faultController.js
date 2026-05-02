import { supabase } from "../db/supabase.js";

// CREATE
export const createSession = async (req, res) => {
  const { data, error } = await supabase
    .from("fault_sessions")
    .insert([req.body]);

  if (error) return res.status(500).json(error);

  res.json(data);
};

// GET ALL
export const getSessions = async (req, res) => {
  const { data, error } = await supabase
    .from("fault_sessions")
    .select("*");

  if (error) return res.status(500).json(error);

  res.json(data);
};

// UPDATE vehicle_in
export const finishSession = async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from("fault_sessions")
    .update({ vehicle_in: req.body.vehicle_in })
    .eq("id", id);

  if (error) return res.status(500).json(error);

  res.json(data);
};