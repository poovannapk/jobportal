export type Persona = "employee" | "employer";
export type EmployeeView = "home" | "jobs" | "saved" | "profile" | "applications" | "alerts";
export type EmployerView = "overview" | "post-job" | "manage-jobs" | "resdex" | "pipeline" | "credits" | "ats";
export type Stage = "New" | "Shortlisted" | "Interview" | "Offer";
export type JobStatus = "Published" | "Draft" | "Paused";
export type Job = {
    id: string;
    title: string;
    company: string;
    logo: string;
    rating: number;
    location: string;
    salary: string;
    experience: string;
    skills: string[];
    match: number;
    posted: string;
    applicants: number;
    workplace: "Remote" | "Hybrid" | "Onsite";
    description: string;
    status: JobStatus;
};
export type Candidate = {
    id: string;
    name: string;
    title: string;
    location: string;
    experience: string;
    notice: string;
    expectedCtc: string;
    skills: string[];
    active: string;
    score: number;
    stage: Stage;
    email: string;
    phone: string;
    contacted: boolean;
    downloaded: boolean;
};
export type Profile = {
    name: string;
    title: string;
    company: string;
    currentCtc: string;
    expectedCtc: string;
    notice: string;
    location: string;
    skills: string;
    resumeName: string;
};
export type Application = {
    id: string;
    jobId: string;
    status: "Applied" | "Viewed" | "Shortlisted" | "Interview" | "Offer";
    appliedAt: string;
};
export type Alert = {
    id: string;
    keyword: string;
    location: string;
    frequency: string;
};
export type Credits = {
    profileDownloads: number;
    jobCredits: number;
    seatsUsed: number;
    seatsTotal: number;
};
export type AuthUser = {
    name: string;
    email: string;
    persona: Persona;
};
