import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface TrialState {
  isTrialStarted: boolean
  trialStartDate: Date | null
  trialEndDate: Date | null
  isTrialExpired: boolean
  startTrial: () => Promise<void>
  checkTrialStatus: () => void
  syncWithServer: (sessionUser: any) => void
  reset: () => void // Nova função para resetar o estado
}

export const useTrialStore = create<TrialState>()(
  persist(
    (set, get) => ({
      isTrialStarted: false,
      trialStartDate: null,
      trialEndDate: null,
      isTrialExpired: false,

      syncWithServer: async (user) => {
        if (!user) return;
        
        const trialStart = user.trialStartDate ? new Date(user.trialStartDate) : null
        const trialEnd = user.trialEndDate ? new Date(user.trialEndDate) : null
        
        set({
          isTrialStarted: !!trialStart,
          trialStartDate: trialStart,
          trialEndDate: trialEnd,
          isTrialExpired: (trialEnd ? new Date() > trialEnd : false)
        })

      },

      startTrial: async () => {
        try {
          const response = await fetch('/api/start-trial', {
            method: 'POST',
          })

          if (!response.ok) {
            throw new Error('Failed to start trial')
          }

          const data = await response.json()

          set({
            isTrialStarted: true,
            trialStartDate: new Date(data.trialStartDate),
            trialEndDate: new Date(data.trialEndDate),
            isTrialExpired: false,
          })
        } catch (error) {
          console.error('Error starting trial:', error)
          throw error
        }
      },

      checkTrialStatus: () => {
        const { trialEndDate } = get()
        if (!trialEndDate) return
        
        const now = new Date()
        const endDate = new Date(trialEndDate)
        
        set({
          isTrialExpired: now > endDate
        })
      },

      reset: () => {
        set({
          isTrialStarted: false,
          trialStartDate: null,
          trialEndDate: null,
          isTrialExpired: false,
        })
      }
    }),
    {
      name: 'trial-storage',
      partialize: (state) => ({
        isTrialStarted: state.isTrialStarted,
        trialStartDate: state.trialStartDate,
        trialEndDate: state.trialEndDate,
        isTrialExpired: state.isTrialExpired,
      }),
    }
  )
)