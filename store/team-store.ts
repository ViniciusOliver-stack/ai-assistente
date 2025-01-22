import {create} from "zustand"

interface TeamStore {
  selectedTeamId: string | null;
  selectedAgentId: string | null;
  selectedAgentName: string | null;
  selectedInstanceId: string | null;
  setSelectedTeamId: (id: string) => void;
  setSelectedAgentId: (id: string) => void;
  setSelectedInstanceId: (id: string) => void;
  setSelectedAgentName: (name: string) => void;
}

  const useTeamStore = create<TeamStore>((set) => ({
    selectedTeamId: null,
    selectedAgentId: null,
    selectedInstanceId: null,
    selectedAgentName: null,
    setSelectedTeamId: (id) => set({ selectedTeamId: id }),
    setSelectedAgentName: (id) => set({ selectedAgentName: id }),
    setSelectedAgentId: (id) => set({ selectedAgentId: id }),
    setSelectedInstanceId: (id) => set({ selectedInstanceId: id }),
  }));
  
  export default useTeamStore;