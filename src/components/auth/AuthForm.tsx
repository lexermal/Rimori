import { createClient } from "@/utils/supabase/server";
import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { ViewType } from "@supabase/auth-ui-shared";
import React from "react";

const AuthForm = () => {
  const supabaseClient = createClient();

  const [view, setView] = React.useState("sign_in" as ViewType);
  // console.log(view);

  return (
    <>
      <h2 className="text-2xl font-semibold mb-4">
        {view === "sign_in" ? "Login" : (view === "sign_up" ? "Register" : "Reset Password")}
      </h2>
      <div className="flex justify-center flex-col">
        <SupabaseAuth
          supabaseClient={supabaseClient}
          view={view}
          showLinks={false}
          localization={{
            variables: {
              sign_up: {
                email_input_placeholder: "",
                password_input_placeholder: "",
                email_label: "Your (university) email address",
              },
              sign_in: {
                email_input_placeholder: "",
                password_input_placeholder: "",
                email_label: "Your (university) email address",
              }
            }
          }}
          appearance={{
            extend: false,
            // needed instead of theme because auth ui broken on ssr
            className: {
              anchor:
                "text-sm underline mx-auto text-black/70 hover:text-black/50 transition-all",
              button:
                "bg-zinc-900 my-5 text-white rounded-lg p-2 hover:bg-zinc-700 transition-all",
              container: "flex flex-col",
              divider: "",
              input:
                "flex h-9 w-full rounded-md border border-input transition-all bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
              label: "mt-3 flex flex-col text-start text-md font-semibold mb-1",
              loader: "",
              message: "text-red-500 text-center block mt-3",
            },
          }}
          // providers={["google"]}
          providers={[]}
          socialLayout="horizontal"
        />
        <div className="flex flex-col items-center">
          <button
            className={"text-sm underline mx-auto text-black/70 hover:text-black/50 transition-all "+(view === "forgotten_password" ? "hidden" : "")}
            onClick={() => setView(view === "sign_in" ? "sign_up" : "sign_in")}
          >
            {view === "sign_in" ? "Don't have an account? Register" : "Already have an account? Log in"}
          </button>
          <button
            className={"text-sm underline mx-auto text-black/70 hover:text-black/50 transition-all "+(view === "sign_up" ? "hidden" : "")}
            onClick={() => setView(view === "forgotten_password" ? "sign_in" : "forgotten_password")}
          >
            {view === "forgotten_password" ? "Back to login" : "Forgot your password?"}
          </button>
        </div>
      </div>
    </>
  );
};

export default AuthForm;
