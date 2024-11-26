// types/teams.d.ts

interface User {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
    emailVerified: Date | null;
    createdAt: Date;
    updatedAt: Date;
    planId: string | null;
    totalTeams: number;
    totalMembers: number;
    stripeCustomerId: string | null;
    stripeSubscriptionId: string | null;
    stripeSubscriptionStatus: string | null;
    stripePriceId: string | null;
  }
  
  interface TeamMember {
    user: User;
    role: string;
    userId: string;
    teamId: string;
    joinedAt: Date;
  }
  
  interface Team {
    id: string;
    name: string;
    description: string | null; // Mudado de string | undefined para string | null
    members: TeamMember[];
    ownerId: string | null; // Mudado de string | undefined para string | null
    createdAt: Date;
    updatedAt: Date;
  }
  
  interface TeamResponse {
    team: Team;
    membersCount: number;
    membersLimit: number;
  }