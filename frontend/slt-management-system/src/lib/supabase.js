import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://zumbavrapveglilziueu.supabase.co";
const supabaseKey = "sb_publishable_lAMCpxjR8_qnAUFg5OrZTQ_Fle3VRA9";

export const supabase = createClient(
  supabaseUrl,
  supabaseKey
);