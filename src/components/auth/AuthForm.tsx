import { createClient } from "@/utils/supabase/server";
import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";

const AuthForm = () => {
  const supabaseClient = createClient();

  return (
    <div className="flex justify-center">
      <SupabaseAuth
        supabaseClient={supabaseClient}
        redirectTo="http://localhost:3000/en/"
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
        providers={["google"]}
        socialLayout="horizontal"
      />
    </div>
  );
};

export default AuthForm;
