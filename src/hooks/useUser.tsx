import { User } from "@supabase/auth-helpers-nextjs";
import { useSessionContext, useUser as useSupaUser } from "@supabase/auth-helpers-react";
import { createContext, useContext } from "react";

type UserContextType = {
  accessToken: string | null;
  user: User | null;
  isLoading: boolean;
  logout: () => Promise<void>;
};

export const UserContext = createContext<UserContextType | undefined>(undefined);

export interface Props {
  [propname: string]: any;
}

export const MyUserContextProvider = (props: Props) => {
  const { session, isLoading: isLoadingUser, supabaseClient: supabase } = useSessionContext();
  const user = useSupaUser();
  const accessToken = session?.access_token ?? null;

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const value = {
    user,
    accessToken,
    isLoading: isLoadingUser,
    logout,
  };

  return <UserContext.Provider value={value} {...props} />;
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within MyUserContextProvider");
  }
  return context;
};
