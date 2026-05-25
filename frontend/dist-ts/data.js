export const initialJobs = [
    {
        id: "job-1",
        title: "Senior Backend Engineer",
        company: "FinEdge Systems",
        logo: "FE",
        rating: 4.1,
        location: "Bengaluru",
        salary: "28-55 LPA",
        experience: "5-10 yrs",
        skills: ["Java", "Kafka", "PostgreSQL", "Spring Boot"],
        match: 94,
        posted: "2h ago",
        applicants: 182,
        workplace: "Hybrid",
        description: "Own high-throughput services, marketplace APIs, event streams, and search indexing pipelines.",
        status: "Published"
    },
    {
        id: "job-2",
        title: "Platform Search Engineer",
        company: "TalentCloud",
        logo: "TC",
        rating: 4.4,
        location: "Hyderabad",
        salary: "22-42 LPA",
        experience: "4-8 yrs",
        skills: ["OpenSearch", "Node.js", "Redis", "AWS"],
        match: 89,
        posted: "Today",
        applicants: 96,
        workplace: "Remote",
        description: "Build candidate and job search ranking, facets, autocomplete, and recruiter sourcing experiences.",
        status: "Published"
    },
    {
        id: "job-3",
        title: "Engineering Manager - Marketplace",
        company: "HireStack",
        logo: "HS",
        rating: 4,
        location: "Pune",
        salary: "45-80 LPA",
        experience: "10-15 yrs",
        skills: ["Architecture", "People Mgmt", "SaaS", "Hiring"],
        match: 81,
        posted: "1d ago",
        applicants: 54,
        workplace: "Onsite",
        description: "Lead teams building recruiter SaaS, candidate journeys, ATS integrations, and marketplace workflows.",
        status: "Published"
    },
    {
        id: "job-4",
        title: "Principal Data Engineer",
        company: "InsightGrid",
        logo: "IG",
        rating: 4.3,
        location: "Bengaluru",
        salary: "38-68 LPA",
        experience: "8-13 yrs",
        skills: ["Spark", "Kafka", "Airflow", "Python"],
        match: 84,
        posted: "3d ago",
        applicants: 73,
        workplace: "Hybrid",
        description: "Design pipelines for profile enrichment, recruiter analytics, recommendations, and marketplace intelligence.",
        status: "Published"
    }
];
export const initialCandidates = [
    {
        id: "cand-1",
        name: "Ajay Kumar",
        title: "Senior Java Backend Engineer",
        location: "Bengaluru",
        experience: "8 yrs",
        notice: "30 days",
        expectedCtc: "42 LPA",
        skills: ["Java", "Spring Boot", "Kafka", "PostgreSQL"],
        active: "Active 12m ago",
        score: 92,
        stage: "Shortlisted",
        email: "ajay.kumar@example.com",
        phone: "+91 98765 43210",
        contacted: false,
        downloaded: false
    },
    {
        id: "cand-2",
        name: "Priya Menon",
        title: "Search Platform Engineer",
        location: "Hyderabad",
        experience: "6 yrs",
        notice: "Serving notice",
        expectedCtc: "36 LPA",
        skills: ["OpenSearch", "Python", "Redis", "AWS"],
        active: "Active today",
        score: 88,
        stage: "Interview",
        email: "priya.menon@example.com",
        phone: "+91 99887 77665",
        contacted: true,
        downloaded: false
    },
    {
        id: "cand-3",
        name: "Rohan Mehta",
        title: "Distributed Systems Engineer",
        location: "Pune",
        experience: "9 yrs",
        notice: "60 days",
        expectedCtc: "48 LPA",
        skills: ["Go", "Kafka", "Kubernetes", "MySQL"],
        active: "Active 2d ago",
        score: 84,
        stage: "New",
        email: "rohan.mehta@example.com",
        phone: "+91 91234 56780",
        contacted: false,
        downloaded: false
    },
    {
        id: "cand-4",
        name: "Meera Iyer",
        title: "Engineering Manager",
        location: "Chennai",
        experience: "12 yrs",
        notice: "45 days",
        expectedCtc: "68 LPA",
        skills: ["Architecture", "Hiring", "Java", "SaaS"],
        active: "Active 4h ago",
        score: 79,
        stage: "Offer",
        email: "meera.iyer@example.com",
        phone: "+91 90000 11122",
        contacted: true,
        downloaded: true
    }
];
export const initialProfile = {
    name: "Ajay Kumar",
    title: "Senior Backend Engineer",
    company: "Razorpay",
    currentCtc: "28 LPA",
    expectedCtc: "42 LPA",
    notice: "30 days",
    location: "Bengaluru",
    skills: "Java, Spring Boot, Kafka, PostgreSQL, AWS, Redis",
    resumeName: "Ajay_Kumar_Resume.pdf"
};
export const initialAlerts = [
    { id: "alert-1", keyword: "Java Kafka", location: "Bengaluru", frequency: "Daily" },
    { id: "alert-2", keyword: "Remote Backend", location: "India", frequency: "Instant" }
];
export const initialCredits = {
    profileDownloads: 3820,
    jobCredits: 148,
    seatsUsed: 12,
    seatsTotal: 18
};
//# sourceMappingURL=data.js.map