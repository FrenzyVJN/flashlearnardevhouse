interface ProjectStep {
    title: string;
    description: string;
}
  
export interface ProjectCardProps {
    id: number;
    title: string;
    description: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    timeRequired: string;
    imageUrl: string;
    rating: number;
    materials: string[];
    steps: ProjectStep[];
    index?: number;
}
  
export interface UserData {
    password: string
    name: string
    username: string
    bio: string
    avatar: string
    level: string
    projects: number
    followers: number
    following: number
    joinedDate: string
    badges: string[]
    completedProjects: ProjectCardProps[]
}