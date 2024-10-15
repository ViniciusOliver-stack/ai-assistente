import {create} from "zustand"

interface Team {
    id: string;
    name: string;
    description: string | null;
    createdAt: Date;
    updatedAt: Date;
}

interface TeamStore {
    selectedTeamId: string | null;
    setSelectedTeamId: (id: string) => void;
}

  const useTeamStore = create<TeamStore>((set) => ({
    selectedTeamId: null,
    setSelectedTeamId: (id) => set({ selectedTeamId: id }),
  }));
  
  export default useTeamStore;