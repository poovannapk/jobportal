import { useMemo, useState, type Dispatch, type ReactNode, type SetStateAction } from "react";
import {
  Activity,
  Bell,
  BookOpen,
  Building2,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronDown,
  CircleCheck,
  CircleDollarSign,
  ClipboardList,
  Clock3,
  Crown,
  Database,
  FileSearch,
  FileText,
  Filter,
  Gauge,
  GitBranch,
  Globe2,
  KanbanSquare,
  Link2,
  LockKeyhole,
  LogOut,
  Mail,
  MapPin,
  Menu,
  MessageSquareText,
  Network,
  Phone,
  Plus,
  Search,
  Server,
  Settings,
  HelpCircle,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Star,
  Trash2,
  UploadCloud,
  UserRound,
  Users,
  WalletCards,
  Webhook,
  Zap
} from "lucide-react";
import { initialAlerts, initialCandidates, initialCredits, initialJobs, initialProfile } from "./data.js";
import type { Alert, Application, AuthUser, Candidate, Credits, EmployeeView, EmployerView, Job, Persona, Profile, Stage } from "./types.js";
import {
  Avatar,
  CompactList,
  EmptyState,
  Input,
  Logo,
  Metric,
  MetricPanel,
  SectionHeader,
  SectionTitle,
  Select,
  SkillRow,
  TextArea,
  card,
  coralButton,
  initials,
  labelFor,
  primaryButton,
  secondaryButton
} from "./components/common.js";

export function App() {
  const [persona, setPersona] = useState<Persona>("employee");
  const [employeeView, setEmployeeView] = useState<EmployeeView>("home");
  const [employerView, setEmployerView] = useState<EmployerView>("overview");
  const [jobs, setJobs] = useState<Job[]>(initialJobs);
  const [candidates, setCandidates] = useState<Candidate[]>(initialCandidates);
  const [profile, setProfile] = useState<Profile>(initialProfile);
  const [applications, setApplications] = useState<Application[]>([]);
  const [savedJobs, setSavedJobs] = useState<string[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>(initialAlerts);
  const [credits, setCredits] = useState<Credits>(initialCredits);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [authMode, setAuthMode] = useState<"login" | "register" | "employer-login" | null>(null);
  const [atsProviders, setAtsProviders] = useState<Record<string, boolean>>({ Workday: true, Greenhouse: false, "SAP SuccessFactors": false });
  const [query, setQuery] = useState("Java Kafka");
  const [location, setLocation] = useState("Bengaluru");
  const [workMode, setWorkMode] = useState("Any");
  const [selectedJobId, setSelectedJobId] = useState(jobs[0].id);
  const [toast, setToast] = useState("Every page is interactive. Data is stored in local React state.");
  const [headerSearchOpen, setHeaderSearchOpen] = useState(false);
  const [profileDrawerOpen, setProfileDrawerOpen] = useState(false);

  const notify = (message: string) => setToast(message);

  const filteredJobs = useMemo(() => {
    const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
    return jobs.filter((job) => {
      const haystack = `${job.title} ${job.company} ${job.skills.join(" ")}`.toLowerCase();
      const queryMatch = terms.length === 0 || terms.some((term) => haystack.includes(term));
      const locationMatch = !location || job.location.toLowerCase().includes(location.toLowerCase());
      const modeMatch = workMode === "Any" || job.workplace === workMode;
      return queryMatch && locationMatch && modeMatch && job.status === "Published";
    });
  }, [jobs, location, query, workMode]);

  const selectedJob = jobs.find((job) => job.id === selectedJobId) ?? jobs[0];

  const applyToJob = (jobId: string) => {
    if (applications.some((application) => application.jobId === jobId)) {
      notify("You have already applied to this job.");
      return;
    }
    setApplications((current) => [...current, { id: `app-${Date.now()}`, jobId, status: "Applied", appliedAt: new Date().toLocaleDateString() }]);
    setJobs((current) => current.map((job) => (job.id === jobId ? { ...job, applicants: job.applicants + 1 } : job)));
    notify("Application submitted and visible in Application Tracker.");
  };

  const toggleSavedJob = (jobId: string) => {
    setSavedJobs((current) => {
      const exists = current.includes(jobId);
      notify(exists ? "Job removed from saved jobs." : "Job saved.");
      return exists ? current.filter((id) => id !== jobId) : [...current, jobId];
    });
  };

  const publishJob = (job: Omit<Job, "id" | "logo" | "rating" | "match" | "posted" | "applicants" | "status">) => {
    if (credits.jobCredits <= 0) {
      notify("No job posting credits available.");
      return;
    }
    const nextJob: Job = {
      ...job,
      id: `job-${Date.now()}`,
      logo: job.company.slice(0, 2).toUpperCase(),
      rating: 4.2,
      match: 78,
      posted: "Just now",
      applicants: 0,
      status: "Published"
    };
    setJobs((current) => [nextJob, ...current]);
    setCredits((current) => ({ ...current, jobCredits: current.jobCredits - 1 }));
    setEmployerView("manage-jobs");
    notify("Job published. One job credit consumed.");
  };

  const saveJobDraft = (job: Omit<Job, "id" | "logo" | "rating" | "match" | "posted" | "applicants" | "status">) => {
    const draftJob: Job = {
      ...job,
      id: `job-${Date.now()}`,
      logo: job.company.slice(0, 2).toUpperCase(),
      rating: 4.2,
      match: 72,
      posted: "Draft",
      applicants: 0,
      status: "Draft"
    };
    setJobs((current) => [draftJob, ...current]);
    setEmployerView("manage-jobs");
    notify("Job draft saved in Manage Jobs.");
  };

  const updateCandidate = (candidateId: string, patch: Partial<Candidate>) => {
    setCandidates((current) => current.map((candidate) => (candidate.id === candidateId ? { ...candidate, ...patch } : candidate)));
    notify("Candidate pipeline updated.");
  };

  const bulkMessageCandidates = () => {
    setCandidates((current) => current.map((candidate) => ({ ...candidate, contacted: true })));
    notify("Bulk message queued for all pipeline candidates.");
  };

  const downloadProfile = (candidateId: string) => {
    if (credits.profileDownloads <= 0) {
      notify("No profile download credits available.");
      return;
    }
    setCandidates((current) => current.map((candidate) => (candidate.id === candidateId ? { ...candidate, downloaded: true } : candidate)));
    setCredits((current) => ({ ...current, profileDownloads: current.profileDownloads - 1 }));
    notify("Profile downloaded. One credit consumed.");
  };

  const contactCandidate = (candidateId: string) => {
    setCandidates((current) => current.map((candidate) => (candidate.id === candidateId ? { ...candidate, contacted: true } : candidate)));
    notify("Candidate contact task created.");
  };

  const connectAts = (provider: string) => {
    setAtsProviders((current) => ({ ...current, [provider]: !current[provider] }));
    notify(`${provider} connection toggled.`);
  };

  if (!authUser) {
    return (
      <div className="min-h-screen bg-white text-slate-900">
        <PublicHeader
          onLogin={() => {
            setPersona("employee");
            setAuthMode("login");
          }}
          onRegister={() => {
            setPersona("employee");
            setAuthMode("register");
          }}
          onEmployerLogin={() => {
            setPersona("employer");
            setAuthMode("employer-login");
          }}
          setEmployeeView={setEmployeeView}
        />
        <PublicLanding
          query={query}
          location={location}
          setQuery={setQuery}
          setLocation={setLocation}
          onSearch={() => {
            setPersona("employee");
            setEmployeeView("jobs");
            setAuthMode("login");
          }}
        />
        <Footer
          setPersona={setPersona}
          setEmployeeView={setEmployeeView}
          setEmployerView={setEmployerView}
          lockedPersona={null}
        />
        {authMode && (
          <AuthModal
            mode={authMode}
            persona={persona}
            onClose={() => setAuthMode(null)}
            onSwitch={setAuthMode}
            onSubmit={(user) => {
              setAuthUser(user);
              setPersona(user.persona);
              setAuthMode(null);
              notify(`${authMode === "register" ? "Registered" : "Logged in"} as ${user.name}.`);
            }}
          />
        )}
      </div>
    );
  }

  const activePersona = authUser.persona;

  return (
    <div className="min-h-screen bg-[#f7f5f0] text-slate-900">
      <Header
        persona={activePersona}
        setPersona={setPersona}
        employeeView={employeeView}
        setEmployeeView={setEmployeeView}
        employerView={employerView}
        setEmployerView={setEmployerView}
        authUser={authUser}
        onAuth={setAuthMode}
        onLogout={() => {
          setAuthUser(null);
          setProfileDrawerOpen(false);
          setPersona("employee");
          setEmployeeView("home");
          setEmployerView("overview");
          notify("Logged out.");
        }}
        onOpenSearch={() => setHeaderSearchOpen(true)}
        onOpenProfile={() => setProfileDrawerOpen(true)}
      />
      {profileDrawerOpen && activePersona === "employee" && (
        <ProfileDrawer
          user={authUser}
          onClose={() => setProfileDrawerOpen(false)}
          onLogout={() => {
            setProfileDrawerOpen(false);
            setAuthUser(null);
            setPersona("employee");
            setEmployeeView("home");
            notify("Logged out.");
          }}
          setEmployeeView={setEmployeeView}
        />
      )}
      {headerSearchOpen && (
        <HeaderSearchOverlay
          query={query}
          location={location}
          setQuery={setQuery}
          setLocation={setLocation}
          onClose={() => setHeaderSearchOpen(false)}
          onSearch={() => {
            setHeaderSearchOpen(false);
            setPersona("employee");
            setEmployeeView("jobs");
            setSelectedJobId(filteredJobs[0]?.id ?? selectedJobId);
          }}
        />
      )}
      <StatusBar toast={toast} savedCount={savedJobs.length} applicationsCount={applications.length} />
      <main>
        {activePersona === "employee" && employeeView === "home" && (
          <EmployeeHome
            query={query}
            location={location}
            setQuery={setQuery}
            setLocation={setLocation}
            jobs={filteredJobs}
            setEmployeeView={setEmployeeView}
            setSelectedJobId={setSelectedJobId}
            applyToJob={applyToJob}
            toggleSavedJob={toggleSavedJob}
            savedJobs={savedJobs}
          />
        )}
        {activePersona === "employee" && employeeView === "jobs" && (
          <JobSearchPage
            query={query}
            location={location}
            workMode={workMode}
            setQuery={setQuery}
            setLocation={setLocation}
            setWorkMode={setWorkMode}
            jobs={filteredJobs}
            selectedJob={selectedJob}
            setSelectedJobId={setSelectedJobId}
            applyToJob={applyToJob}
            toggleSavedJob={toggleSavedJob}
            savedJobs={savedJobs}
          />
        )}
        {activePersona === "employee" && employeeView === "saved" && (
          <SavedJobs
            jobs={jobs.filter((job) => savedJobs.includes(job.id))}
            applyToJob={applyToJob}
            toggleSavedJob={toggleSavedJob}
            setEmployeeView={setEmployeeView}
            setSelectedJobId={setSelectedJobId}
          />
        )}
        {activePersona === "employee" && employeeView === "profile" && (
          <EmployeeProfile profile={profile} setProfile={setProfile} notify={notify} />
        )}
        {activePersona === "employee" && employeeView === "applications" && (
          <EmployeeApplications applications={applications} jobs={jobs} alerts={alerts} setAlerts={setAlerts} notify={notify} />
        )}
        {activePersona === "employer" && employerView === "overview" && (
          <EmployerOverview jobs={jobs} candidates={candidates} credits={credits} setEmployerView={setEmployerView} />
        )}
        {activePersona === "employer" && employerView === "post-job" && <PostJob publishJob={publishJob} saveJobDraft={saveJobDraft} />}
        {activePersona === "employer" && employerView === "manage-jobs" && (
          <ManageJobs jobs={jobs} setJobs={setJobs} notify={notify} />
        )}
        {activePersona === "employer" && employerView === "resdex" && (
          <Resdex candidates={candidates} downloadProfile={downloadProfile} contactCandidate={contactCandidate} />
        )}
        {activePersona === "employer" && employerView === "pipeline" && (
          <Pipeline candidates={candidates} updateCandidate={updateCandidate} bulkMessageCandidates={bulkMessageCandidates} />
        )}
        {activePersona === "employer" && employerView === "credits" && <Credits credits={credits} setCredits={setCredits} notify={notify} />}
        {activePersona === "employer" && employerView === "ats" && <Ats providers={atsProviders} connectAts={connectAts} />}
        <ArchitectureBand />
      </main>
      <Footer
        setPersona={setPersona}
        setEmployeeView={setEmployeeView}
        setEmployerView={setEmployerView}
        lockedPersona={activePersona}
      />
      {authMode && (
        <AuthModal
          mode={authMode}
          persona={persona}
          onClose={() => setAuthMode(null)}
          onSwitch={setAuthMode}
          onSubmit={(user) => {
            setAuthUser(user);
            setPersona(user.persona);
            setAuthMode(null);
            notify(`${authMode === "login" ? "Logged in" : "Registered"} as ${user.name}.`);
          }}
        />
      )}
    </div>
  );
}

function Header({
  persona,
  setPersona,
  employeeView,
  setEmployeeView,
  employerView,
  setEmployerView,
  authUser,
  onAuth,
  onLogout,
  onOpenSearch,
  onOpenProfile
}: {
  persona: Persona;
  setPersona: (persona: Persona) => void;
  employeeView: EmployeeView;
  setEmployeeView: (view: EmployeeView) => void;
  employerView: EmployerView;
  setEmployerView: (view: EmployerView) => void;
  authUser: AuthUser | null;
  onAuth: (mode: "login" | "register" | "employer-login") => void;
  onLogout: () => void;
  onOpenSearch: () => void;
  onOpenProfile: () => void;
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4">
        <button className="flex items-center gap-2" onClick={() => (persona === "employee" ? setEmployeeView("home") : setEmployerView("overview"))}>
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-teal-700 font-black text-white">P</span>
          <span className="text-xl font-black tracking-normal text-slate-950">Placd</span>
        </button>
        <nav className="flex flex-wrap items-center gap-6 text-base font-bold text-slate-700">
          {persona === "employee" ? (
            <>
              <MegaNavItem active={employeeView === "home" || employeeView === "jobs"} label="Jobs" badge="2" columns={[
                { title: "Recommended jobs", links: [["Recommended Jobs", () => setEmployeeView("home")], ["NVites", () => setEmployeeView("jobs"), "5 New"], ["Application status", () => setEmployeeView("applications"), "19 Updates"], ["Saved jobs", () => setEmployeeView("saved")]] },
                { title: "Explore jobs", links: [["Search jobs", () => setEmployeeView("jobs")], ["Remote jobs", () => setEmployeeView("jobs")], ["MNC jobs", () => setEmployeeView("jobs")], ["Startup jobs", () => setEmployeeView("jobs")]] }
              ]} />
              <MegaNavItem active={employeeView === "profile"} label="Companies" columns={[
                { title: "Discover", links: [["Top companies", () => setEmployeeView("home")], ["Company reviews", () => setEmployeeView("home")], ["Interview questions", () => setEmployeeView("applications")]] }
              ]} />
              <MegaNavItem active={employeeView === "applications"} label="Services" badge="1" wide columns={[
                { title: "Resume writing", links: [["Text resume", () => setEmployeeView("profile")], ["Visual resume", () => setEmployeeView("profile")], ["Resume critique", () => setEmployeeView("profile")], ["Jobs4u", () => setEmployeeView("jobs")]] },
                { title: "Get recruiter's attention", links: [["Resume display", () => setEmployeeView("profile")], ["AI mock interview", () => setEmployeeView("applications")], ["Basic and premium plans", () => setEmployeeView("profile")]] },
                { title: "Free resume resources", links: [["Resume maker", () => setEmployeeView("profile")], ["Resume quality score", () => setEmployeeView("profile")], ["Job letter samples", () => setEmployeeView("profile")], ["Promotional offer", () => setEmployeeView("jobs"), "New"]] }
              ]} />
            </>
          ) : (
            <>
              <TopNav active={employerView === "overview"} label="Dashboard" onClick={() => setEmployerView("overview")} />
              <TopNav active={employerView === "post-job"} label="Post Job" onClick={() => setEmployerView("post-job")} />
              <TopNav active={employerView === "manage-jobs"} label="Manage Jobs" onClick={() => setEmployerView("manage-jobs")} />
              <TopNav active={employerView === "resdex"} label="Resdex" onClick={() => setEmployerView("resdex")} />
              <TopNav active={employerView === "pipeline"} label="Pipeline" onClick={() => setEmployerView("pipeline")} />
              <TopNav active={employerView === "credits"} label="Credits" onClick={() => setEmployerView("credits")} />
              <TopNav active={employerView === "ats"} label="ATS" onClick={() => setEmployerView("ats")} />
            </>
          )}
        </nav>
        {persona === "employee" && (
          <button className="hidden min-w-[280px] items-center justify-between rounded-full border border-slate-200 bg-white px-5 py-3 text-left text-slate-500 shadow-sm transition hover:border-teal-200 hover:shadow-md lg:flex" onClick={onOpenSearch}>
            <span>Search jobs here</span>
            <span className="grid h-10 w-10 place-items-center rounded-full bg-teal-700 text-white"><Search size={19} /></span>
          </button>
        )}
        <div className="flex flex-wrap items-center gap-2">
          {!authUser && (
            <div className="grid grid-cols-2 rounded-full border border-slate-200 bg-slate-100 p-1">
              <button className={`rounded-full px-4 py-2 text-sm font-black ${persona === "employee" ? "bg-white text-teal-800 shadow-sm" : "text-slate-600"}`} onClick={() => setPersona("employee")}>Employee</button>
              <button className={`rounded-full px-4 py-2 text-sm font-black ${persona === "employer" ? "bg-white text-teal-800 shadow-sm" : "text-slate-600"}`} onClick={() => setPersona("employer")}>Employer</button>
            </div>
          )}
          {authUser ? (
            persona === "employee" ? (
              <button className="flex items-center gap-3 rounded-full border border-slate-200 bg-white py-1 pl-3 pr-2 shadow-sm transition hover:border-teal-200 hover:shadow-md" onClick={onOpenProfile}>
                <Menu className="text-slate-500" size={22} />
                <span className="relative">
                  <Avatar label={initials(authUser.name)} />
                  <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-red-500 px-1 text-xs font-black text-white">2</span>
                </span>
              </button>
            ) : (
              <button className={secondaryButton} onClick={onLogout}>{authUser.name}</button>
            )
          ) : (
            <>
              <button className={secondaryButton} onClick={() => onAuth("login")}>Login</button>
              <button className="rounded-full bg-[#db6b4d] px-5 py-2 font-black text-white" onClick={() => onAuth("register")}>Register</button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

function StatusBar({ toast, savedCount, applicationsCount }: { toast: string; savedCount: number; applicationsCount: number }) {
  return (
    <div className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm">
        <span className="font-bold text-teal-800">{toast}</span>
        <div className="flex gap-3 text-slate-600">
          <span>{savedCount} saved jobs</span>
          <span>{applicationsCount} applications</span>
        </div>
      </div>
    </div>
  );
}

function PublicHeader({
  onLogin,
  onRegister,
  onEmployerLogin,
  setEmployeeView
}: {
  onLogin: () => void;
  onRegister: () => void;
  onEmployerLogin: () => void;
  setEmployeeView: (view: EmployeeView) => void;
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-100 bg-white shadow-sm">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-5 px-4 py-5">
        <button className="flex items-center gap-3" onClick={() => setEmployeeView("home")}>
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-teal-700 font-black text-white">P</span>
          <span className="text-3xl font-black text-teal-800">Placd</span>
        </button>
        <nav className="flex items-center gap-8 text-lg font-bold text-slate-700">
          <button>Jobs</button>
          <button>Companies</button>
          <button>Services</button>
        </nav>
        <div className="flex items-center gap-3">
          <button className="rounded-full border border-teal-700 px-8 py-3 font-black text-teal-800" onClick={onLogin}>Login</button>
          <button className="rounded-full bg-coral-500 px-8 py-3 font-black text-white" onClick={onRegister}>Register</button>
          <div className="group relative border-l border-slate-200 pl-4">
            <button className="flex items-center gap-1 py-3 text-lg font-bold">For employers <ChevronDown size={16} /></button>
            <div className="invisible absolute right-0 top-[calc(100%-2px)] z-40 grid w-56 gap-4 rounded-[24px] bg-white p-7 text-slate-600 opacity-0 shadow-2xl transition group-hover:visible group-hover:opacity-100">
              <button className="text-left hover:text-teal-800">Buy online</button>
              <button className="text-left hover:text-teal-800">Talent cloud</button>
              <button className="text-left hover:text-teal-800" onClick={onEmployerLogin}>Employer Login</button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

function PublicLanding({
  query,
  location,
  setQuery,
  setLocation,
  onSearch
}: {
  query: string;
  location: string;
  setQuery: (value: string) => void;
  setLocation: (value: string) => void;
  onSearch: () => void;
}) {
  return (
    <main className="overflow-hidden bg-white">
      <section className="bg-gradient-to-b from-white to-[#fbfbff] px-4 py-20 text-center">
        <h1 className="text-4xl font-black tracking-normal text-slate-950 md:text-6xl">Find your dream job now</h1>
        <p className="mt-4 text-2xl text-slate-900">5 lakh+ jobs for you to explore</p>
        <div className="mx-auto mt-12 max-w-5xl">
          <SearchBar query={query} location={location} setQuery={setQuery} setLocation={setLocation} onSearch={onSearch} compact />
        </div>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {["sfcc front end", "ui ux", "sfcc"].map((term) => (
            <button className="rounded-full border border-slate-200 px-5 py-2 text-slate-600" key={term} onClick={() => setQuery(term)}>{term}</button>
          ))}
        </div>
      </section>
      <PublicCategoryGrid setQuery={setQuery} onSearch={onSearch} />
      <PublicCompanies setQuery={setQuery} onSearch={onSearch} />
      <SponsoredCompanies setQuery={setQuery} onSearch={onSearch} />
      <InterviewPrep />
      <AppDownloadBand />
    </main>
  );
}

function PublicCategoryGrid({ setQuery, onSearch }: { setQuery: (value: string) => void; onSearch: () => void }) {
  const categories = ["Remote", "MNC", "Supply Chain", "Software & IT", "HR", "Fresher", "Startup", "Analytics", "Fortune 500", "Banking", "Project Mgmt"];
  return (
    <section className="mx-auto grid max-w-7xl gap-5 px-4 py-10 sm:grid-cols-2 lg:grid-cols-5">
      {categories.map((category) => (
        <button className="flex min-h-20 items-center justify-between rounded-2xl border border-slate-200 bg-white px-6 text-left text-lg font-black shadow-sm" key={category} onClick={() => { setQuery(category); onSearch(); }}>
          <span>{category}</span><ChevronDown className="-rotate-90 text-slate-500" size={18} />
        </button>
      ))}
    </section>
  );
}

function PublicCompanies({ setQuery, onSearch }: { setQuery: (value: string) => void; onSearch: () => void }) {
  const groups = ["MNCs", "Fintech", "FMCG & Retail", "Startups", "Edtech"];
  const companies = ["Datamatics", "Reliance Industries", "Optum", "Empower", "Cognizant"];
  return (
    <section className="mx-auto max-w-7xl px-4 py-14">
      <h2 className="text-center text-3xl font-black">Top companies hiring now</h2>
      <div className="mt-10 flex gap-5 overflow-x-auto pb-3">
        {groups.map((group) => <CompanyGroupCard key={group} title={group} count={group === "MNCs" ? "2.4K+" : "150+"} />)}
      </div>
      <h2 className="mt-16 text-center text-3xl font-black">Featured companies actively hiring</h2>
      <div className="mt-8 flex gap-5 overflow-x-auto pb-3">
        {companies.map((company, index) => (
          <article className="min-w-72 rounded-2xl border border-slate-200 bg-white p-7 text-center shadow-sm" key={company}>
            <Logo label={company.slice(0, 2).toUpperCase()} large />
            <h3 className="mt-5 text-xl font-black">{company}</h3>
            <p className="mt-2 text-slate-500"><Star className="inline fill-amber-400 text-amber-400" size={15} /> {(3.4 + index / 10).toFixed(1)} - {index + 2}K+ reviews</p>
            <p className="mx-auto mt-6 max-w-48 text-slate-700">Leading digital and technology company.</p>
            <button className={`${secondaryButton} mt-7`} onClick={() => { setQuery(company); onSearch(); }}>View jobs</button>
          </article>
        ))}
      </div>
    </section>
  );
}

function CompanyGroupCard({ title, count }: { title: string; count: string }) {
  return (
    <article className="min-w-72 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-xl font-black">{title} <ChevronDown className="-rotate-90 inline" size={18} /></h3>
      <p className="mt-2 text-slate-500">{count} are actively hiring</p>
      <div className="mt-6 grid grid-cols-4 gap-3">
        {["A", "B", "C", "D"].map((logo) => <span className="grid h-12 place-items-center rounded-xl border border-slate-200 font-black text-teal-800" key={logo}>{logo}</span>)}
      </div>
    </article>
  );
}

function SponsoredCompanies({ setQuery, onSearch }: { setQuery: (value: string) => void; onSearch: () => void }) {
  const companies = ["VXI Global Solutions", "McAfee", "Staples India", "SMFG India", "ValueLabs", "GAP", "Ati Robotics", "DLF Ltd"];
  return (
    <section className="mx-auto max-w-7xl px-4 py-14">
      <h2 className="text-center text-3xl font-black">Sponsored companies</h2>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        {["All", "IT Services", "Technology", "Healthcare", "Manufacturing", "BFSI", "BPM"].map((tab) => <button className="rounded-full border border-slate-300 px-5 py-2 font-bold" key={tab}>{tab}</button>)}
      </div>
      <div className="mt-9 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {companies.map((company, index) => (
          <button className="rounded-2xl border border-slate-200 bg-white p-7 text-center shadow-sm" key={company} onClick={() => { setQuery(company); onSearch(); }}>
            <Logo label={company.slice(0, 2).toUpperCase()} large />
            <h3 className="mt-5 text-xl font-black">{company}</h3>
            <p className="mt-3 text-slate-500"><Star className="inline fill-amber-400 text-amber-400" size={15} /> {(3.3 + index / 10).toFixed(1)} - {300 + index * 80} reviews</p>
            <SkillRow skills={["B2B", "Product", "Corporate"].slice(0, 2)} />
          </button>
        ))}
      </div>
    </section>
  );
}

function InterviewPrep() {
  return (
    <section className="mx-auto grid max-w-7xl gap-5 px-4 py-16 lg:grid-cols-[360px_minmax(0,1fr)_320px]">
      <div className="rounded-[28px] bg-[#fff3e8] p-10">
        <UserRound size={96} />
        <h2 className="mt-12 text-3xl font-black">Prepare for your next interview</h2>
      </div>
      <section className="rounded-[28px] border border-slate-200 bg-white p-7 shadow-sm">
        <h2 className="text-2xl font-black">Interview questions by company</h2>
        <div className="mt-7 grid gap-4 md:grid-cols-2">
          {["Flipkart", "Byjus", "TCS", "Cognizant", "Amazon", "Accenture"].map((company) => (
            <button className="flex items-center justify-between rounded-2xl border border-slate-200 p-4 text-left" key={company}><span><strong className="block">{company}</strong><small className="text-slate-500">1.7K+ Interviews</small></span><ChevronDown className="-rotate-90" /></button>
          ))}
        </div>
      </section>
      <section className="rounded-[28px] border border-slate-200 bg-white p-7 shadow-sm">
        <h2 className="text-2xl font-black">Interview questions by role</h2>
        {["Software Engineer", "Business Analyst", "Consultant", "Financial Analyst", "Sales & Marketing", "Quality Engineer"].map((role) => <button className="block w-full border-b border-slate-200 py-4 text-left" key={role}>{role} <span className="text-slate-500">(2.8K+ questions)</span></button>)}
      </section>
    </section>
  );
}

function AppDownloadBand() {
  return (
    <section className="mx-auto mb-16 grid max-w-7xl gap-6 rounded-[28px] border border-slate-200 bg-[#f2efff] p-10 md:grid-cols-[minmax(0,1fr)_360px]">
      <div>
        <h2 className="text-3xl font-black">Get real-time job updates on the app</h2>
        <p className="mt-3 text-lg text-slate-600">Apply faster, track recruiters, and get alerts for jobs matching your profile.</p>
        <div className="mt-7 flex max-w-md rounded-full bg-white p-2 shadow-sm"><input className="flex-1 bg-transparent px-5 outline-none" placeholder="Enter mobile number..." /><button className={primaryButton}>Get link</button></div>
      </div>
      <div className="grid place-items-center rounded-3xl bg-white p-8 text-center"><strong className="text-5xl text-teal-800">P</strong><span className="mt-2 block text-slate-500">Scan to download</span></div>
    </section>
  );
}

function HeaderSearchOverlay({
  query,
  location,
  setQuery,
  setLocation,
  onClose,
  onSearch
}: {
  query: string;
  location: string;
  setQuery: (value: string) => void;
  setLocation: (value: string) => void;
  onClose: () => void;
  onSearch: () => void;
}) {
  const [experience, setExperience] = useState("Select experience");
  return (
    <div className="fixed inset-0 z-40 bg-slate-950/35" onClick={onClose}>
      <section className="border-b border-slate-200 bg-white px-4 py-8 shadow-xl" onClick={(event) => event.stopPropagation()}>
        <div className="mx-auto flex max-w-7xl items-center gap-8">
          <button className="hidden items-center gap-3 md:flex" onClick={onClose}>
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-teal-700 font-black text-white">P</span>
            <span className="text-3xl font-black text-teal-800">Placd</span>
          </button>
          <form className="grid flex-1 gap-3 rounded-full border border-slate-200 bg-white p-3 shadow-lg shadow-slate-200/70 lg:grid-cols-[minmax(0,1.25fr)_220px_minmax(0,0.8fr)_auto] lg:items-center" onSubmit={(event) => {
            event.preventDefault();
            onSearch();
          }}>
            <label className="flex min-h-12 items-center gap-3 border-slate-200 px-4 lg:border-r">
              <Search className="text-slate-500" size={22} />
              <input className="w-full bg-transparent text-lg font-semibold outline-none placeholder:text-slate-400" value={query} onChange={(event) => setQuery(event.target.value)} autoFocus placeholder="Enter keyword / designation / companies" />
            </label>
            <label className="relative flex min-h-12 items-center border-slate-200 px-4 lg:border-r">
              <select className="w-full appearance-none bg-transparent text-lg font-semibold text-slate-500 outline-none" value={experience} onChange={(event) => setExperience(event.target.value)}>
                {["Select experience", "0-2 years", "3-5 years", "6-10 years", "10+ years"].map((option) => <option key={option}>{option}</option>)}
              </select>
              <ChevronDown className="pointer-events-none absolute right-4 text-slate-600" size={20} />
            </label>
            <label className="flex min-h-12 items-center gap-3 px-4">
              <MapPin className="text-slate-500" size={21} />
              <input className="w-full bg-transparent text-lg font-semibold outline-none placeholder:text-slate-400" value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Enter location" />
            </label>
            <button className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-teal-700 px-8 text-lg font-black text-white transition hover:bg-teal-800" type="submit">
              <Search size={20} /> Search
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}

function ProfileDrawer({
  user,
  onClose,
  onLogout,
  setEmployeeView
}: {
  user: AuthUser;
  onClose: () => void;
  onLogout: () => void;
  setEmployeeView: (view: EmployeeView) => void;
}) {
  const go = (view: EmployeeView) => {
    setEmployeeView(view);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/35" onClick={onClose}>
      <aside className="ml-auto h-full w-full max-w-[500px] overflow-y-auto rounded-l-[32px] bg-white p-9 shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <div className="flex justify-end">
          <button className="text-3xl text-slate-500" onClick={onClose}>×</button>
        </div>
        <section className="grid grid-cols-[auto_minmax(0,1fr)] gap-5">
          <div className="relative grid h-24 w-24 place-items-center rounded-full border-4 border-emerald-500 bg-emerald-50">
            <Avatar label={initials(user.name)} large />
            <span className="absolute -bottom-4 rounded-full bg-white px-3 py-1 text-sm font-black text-emerald-600">100%</span>
          </div>
          <div>
            <h2 className="text-2xl font-black">{user.name}</h2>
            <p className="mt-1 text-slate-600">Technical Lead at HCL Technologies</p>
            <button className="mt-4 font-black text-teal-800" onClick={() => go("profile")}>View & Update Profile</button>
          </div>
        </section>

        <button className="mt-9 flex w-full items-center justify-between rounded-2xl border border-amber-200 bg-amber-50 p-4 text-left text-lg font-black text-slate-900" onClick={() => go("profile")}>
          <span className="inline-flex items-center gap-3"><Crown className="text-amber-600" size={22} />Upgrade to Placd Pro</span>
          <ChevronDown className="-rotate-90 text-amber-800" size={20} />
        </button>

        <section className="mt-7 border-t border-slate-200 pt-7">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-lg font-black">Your profile performance</h3>
            <span className="text-sm text-slate-500">Last 90 days</span>
          </div>
          <div className="grid grid-cols-2 divide-x divide-slate-200 rounded-2xl bg-slate-50 p-5 text-center">
            <button onClick={() => go("jobs")}>
              <strong className="text-3xl">6567<span className="text-red-500">•</span></strong>
              <span className="mt-2 block font-bold">Search Appearances</span>
              <small className="mt-2 block font-black text-teal-800">View all</small>
            </button>
            <button onClick={() => go("applications")}>
              <strong className="text-3xl">237<span className="text-red-500">•</span></strong>
              <span className="mt-2 block font-bold">Recruiter Actions</span>
              <small className="mt-2 block font-black text-teal-800">View all</small>
            </button>
          </div>
        </section>

        <nav className="mt-7 grid gap-1">
          <ProfileDrawerLink icon={<Menu size={20} />} label="Placd Blog" onClick={() => go("home")} />
          <ProfileDrawerLink icon={<Settings size={20} />} label="Settings" onClick={() => go("profile")} />
          <ProfileDrawerLink icon={<HelpCircle size={20} />} label="FAQs" onClick={() => go("applications")} />
          <ProfileDrawerLink icon={<LogOut size={20} />} label="Logout" onClick={onLogout} />
        </nav>
      </aside>
    </div>
  );
}

function ProfileDrawerLink({ icon, label, onClick }: { icon: ReactNode; label: string; onClick: () => void }) {
  return (
    <button className="flex items-center gap-4 rounded-2xl px-1 py-4 text-left text-lg font-bold hover:bg-slate-50" onClick={onClick}>
      <span className="text-slate-500">{icon}</span>
      {label}
    </button>
  );
}

function EmployeeHome(props: {
  query: string;
  location: string;
  setQuery: (value: string) => void;
  setLocation: (value: string) => void;
  jobs: Job[];
  setEmployeeView: (view: EmployeeView) => void;
  setSelectedJobId: (id: string) => void;
  applyToJob: (id: string) => void;
  toggleSavedJob: (id: string) => void;
  savedJobs: string[];
}) {
  return (
    <>
      <section className="bg-[#f3f6fb]">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 xl:grid-cols-[300px_minmax(0,1fr)_300px]">
          <CandidateProfileRail setEmployeeView={props.setEmployeeView} />
          <main className="grid gap-5">
            <PromoStrip />
            <RecommendedCarousel
              jobs={props.jobs}
              savedJobs={props.savedJobs}
              setSelectedJobId={props.setSelectedJobId}
              setEmployeeView={props.setEmployeeView}
              applyToJob={props.applyToJob}
              toggleSavedJob={props.toggleSavedJob}
            />
            <ProfileMatchInsights jobs={props.jobs} setSelectedJobId={props.setSelectedJobId} setEmployeeView={props.setEmployeeView} />
            <TopCompanies />
            <BlogUpdates setQuery={props.setQuery} setEmployeeView={props.setEmployeeView} />
          </main>
          <RightLearningRail setQuery={props.setQuery} setEmployeeView={props.setEmployeeView} />
        </div>
      </section>
    </>
  );
}

function CandidateProfileRail({ setEmployeeView }: { setEmployeeView: (view: EmployeeView) => void }) {
  return (
    <aside className="grid h-fit gap-5">
      <section className="rounded-[28px] border border-slate-200 bg-white p-6 text-center shadow-sm">
        <div className="mx-auto grid h-24 w-24 place-items-center rounded-full border-4 border-emerald-500 bg-emerald-50">
          <Avatar label="AP" large />
        </div>
        <strong className="mt-4 block text-xl">Poovanna P.K</strong>
        <span className="mt-1 block text-sm text-slate-600">Technical Lead @ HCL Technologies</span>
        <span className="mt-3 block text-sm text-slate-400">Last updated yesterday</span>
        <button className={`${primaryButton} mt-5`} onClick={() => setEmployeeView("profile")}>View profile</button>
      </section>
      <section className="rounded-[22px] bg-[#eaf4ff] p-5">
        <div className="flex items-center gap-2">
          <strong className="text-xl">Profile performance</strong>
          <Gauge className="text-slate-500" size={17} />
        </div>
        <div className="mt-4 grid grid-cols-2 divide-x divide-slate-300">
          <button className="text-left" onClick={() => setEmployeeView("jobs")}><span className="block text-sm">Search appearances</span><strong className="mt-1 block text-2xl text-teal-800">6567</strong></button>
          <button className="pl-5 text-left" onClick={() => setEmployeeView("applications")}><span className="block text-sm">Recruiter actions</span><strong className="mt-1 block text-2xl text-teal-800">236</strong></button>
        </div>
        <button className="mt-5 flex w-full items-center justify-between rounded-2xl bg-white p-4 text-left font-bold" onClick={() => setEmployeeView("profile")}>
          <span className="inline-flex items-center gap-2"><Zap className="text-coral-500" size={18} />Get 3X boost to your profile performance</span>
          <ChevronDown className="-rotate-90" size={16} />
        </button>
      </section>
      <section className="rounded-[22px] bg-white p-5 shadow-sm">
        <SectionTitle icon={<Menu />} title="My home" detail="Quick links" />
        <div className="grid gap-2">
          {[
            ["Application status", "applications"],
            ["Saved jobs", "saved"],
            ["Profile updates", "profile"]
          ].map(([label, view]) => (
            <button className="rounded-xl px-3 py-2 text-left font-bold text-slate-600 hover:bg-slate-50" key={label} onClick={() => setEmployeeView(view as EmployeeView)}>{label}</button>
          ))}
        </div>
      </section>
    </aside>
  );
}

function PromoStrip() {
  return (
    <section className="grid overflow-hidden rounded-[28px] bg-white shadow-sm md:grid-cols-[1fr_210px]">
      <div className="p-7">
        <span className="font-black text-coral-500">More work than most people realise.</span>
        <h2 className="mt-1 max-w-xl text-2xl font-black text-slate-950">Finding a job is a job in itself. Do it well with Placd Pro.</h2>
      </div>
      <div className="grid place-items-center bg-[#fff3e8] p-6">
        <button className="rounded-full bg-coral-500 px-8 py-4 font-black text-white">Know more</button>
      </div>
    </section>
  );
}

function RecommendedCarousel({
  jobs,
  savedJobs,
  setSelectedJobId,
  setEmployeeView,
  applyToJob,
  toggleSavedJob
}: {
  jobs: Job[];
  savedJobs: string[];
  setSelectedJobId: (id: string) => void;
  setEmployeeView: (view: EmployeeView) => void;
  applyToJob: (id: string) => void;
  toggleSavedJob: (id: string) => void;
}) {
  const tabs = ["Profile (65)", "Applies (75)", "Preferences (75)", "You might like (75)"];
  return (
    <section className="min-w-0 rounded-[28px] bg-white p-4 shadow-sm sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-black sm:text-2xl">Recommended jobs for you</h2>
        <button className="w-fit font-black text-teal-800" onClick={() => setEmployeeView("jobs")}>View all</button>
      </div>
      <div className="-mx-4 mt-5 overflow-x-auto border-b border-slate-200 px-4 sm:mx-0 sm:px-0">
        <div className="flex min-w-max gap-5 text-base font-black text-slate-500 sm:gap-8 sm:text-lg">
          {tabs.map((tab, index) => (
            <button className={`shrink-0 whitespace-nowrap pb-3 ${index === 0 ? "border-b-4 border-slate-950 text-slate-950" : ""}`} key={tab}>
              {tab}
            </button>
          ))}
        </div>
      </div>
      <div className="-mx-4 mt-6 flex snap-x gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
        {jobs.slice(0, 5).map((job) => (
          <article className="w-[82vw] min-w-[260px] max-w-[320px] shrink-0 snap-start rounded-2xl border border-slate-200 p-5 sm:w-72" key={job.id}>
            <div className="flex items-start justify-between"><Logo label={job.logo} /><span className="text-sm text-slate-500">{job.posted}</span></div>
            <button className="mt-4 text-left" onClick={() => { setSelectedJobId(job.id); setEmployeeView("jobs"); }}>
              <h3 className="font-black">{job.title}</h3>
              <p className="mt-1 truncate text-slate-600">{job.company} <Star className="inline fill-amber-400 text-amber-400" size={14} /> {job.rating}</p>
            </button>
            <Meta items={[[<MapPin size={15} />, job.location], [<Globe2 size={15} />, job.workplace]]} />
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button className={`${secondaryButton} px-3`} onClick={() => toggleSavedJob(job.id)}>{savedJobs.includes(job.id) ? "Saved" : "Save"}</button>
              <button className={`${primaryButton} px-3`} onClick={() => applyToJob(job.id)}>Apply</button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function RightLearningRail({ setQuery, setEmployeeView }: { setQuery: (value: string) => void; setEmployeeView: (view: EmployeeView) => void }) {
  return (
    <aside className="grid h-fit gap-5">
      <section className="overflow-hidden rounded-[22px] bg-white shadow-sm">
        <div className="grid h-32 place-items-center bg-slate-900 text-coral-500">
          <BookOpen size={46} />
        </div>
        <div className="p-5">
          <h3 className="text-lg font-black">Non verbal reasoning questions and answers for 2026</h3>
          <button className="mt-5 font-black text-teal-800" onClick={() => { setQuery("Interview"); setEmployeeView("jobs"); }}>Know more</button>
        </div>
      </section>
      <section className="rounded-[22px] bg-white p-5 shadow-sm">
        <SectionTitle icon={<Building2 />} title="Explore by category" detail="Popular paths" />
        {["MNC", "Fortune 500", "Engineering", "Banking", "Internship"].map((item) => (
          <button className="mb-3 flex w-full items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 font-bold" key={item} onClick={() => { setQuery(item); setEmployeeView("jobs"); }}>
            {item}<ChevronDown className="-rotate-90" size={16} />
          </button>
        ))}
      </section>
    </aside>
  );
}

function JobSearchPage(props: {
  query: string;
  location: string;
  workMode: string;
  setQuery: (value: string) => void;
  setLocation: (value: string) => void;
  setWorkMode: (value: string) => void;
  jobs: Job[];
  selectedJob: Job;
  setSelectedJobId: (id: string) => void;
  applyToJob: (id: string) => void;
  toggleSavedJob: (id: string) => void;
  savedJobs: string[];
}) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <SearchBar query={props.query} location={props.location} setQuery={props.setQuery} setLocation={props.setLocation} onSearch={() => {
        props.setSelectedJobId(props.jobs[0]?.id ?? props.selectedJob.id);
      }} compact />
      <div className="mt-6 grid gap-5 lg:grid-cols-[260px_minmax(0,1fr)_340px]">
        <Filters workMode={props.workMode} setWorkMode={props.setWorkMode} setLocation={props.setLocation} />
        <div className="grid gap-4">
          <SectionHeader title="Search results" detail={`${props.jobs.length} jobs matching your preferences`} />
          {props.jobs.length === 0 ? <EmptyState title="No jobs found" detail="Try changing search, location, or work mode." /> : props.jobs.map((job) => (
            <JobCard key={job.id} job={job} selected={props.selectedJob.id === job.id} saved={props.savedJobs.includes(job.id)} onSelect={() => props.setSelectedJobId(job.id)} onApply={() => props.applyToJob(job.id)} onSave={() => props.toggleSavedJob(job.id)} />
          ))}
        </div>
        <JobPreview job={props.selectedJob} saved={props.savedJobs.includes(props.selectedJob.id)} onApply={() => props.applyToJob(props.selectedJob.id)} onSave={() => props.toggleSavedJob(props.selectedJob.id)} />
      </div>
    </section>
  );
}

function SavedJobs({
  jobs,
  applyToJob,
  toggleSavedJob,
  setEmployeeView,
  setSelectedJobId
}: {
  jobs: Job[];
  applyToJob: (id: string) => void;
  toggleSavedJob: (id: string) => void;
  setEmployeeView: (view: EmployeeView) => void;
  setSelectedJobId: (id: string) => void;
}) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <SectionHeader title="Saved jobs" detail={`${jobs.length} saved opportunities`} />
      <div className="mt-5 grid gap-4">
        {jobs.length === 0 ? <EmptyState title="No saved jobs" detail="Save jobs from search results and they will appear here." /> : jobs.map((job) => (
          <JobCard key={job.id} job={job} saved onSelect={() => {
            setSelectedJobId(job.id);
            setEmployeeView("jobs");
          }} onApply={() => applyToJob(job.id)} onSave={() => toggleSavedJob(job.id)} />
        ))}
      </div>
    </section>
  );
}

function EmployerOverview({ jobs, candidates, credits, setEmployerView }: { jobs: Job[]; candidates: Candidate[]; credits: Credits; setEmployerView: (view: EmployerView) => void }) {
  const offers = [
    ["Job Posting", "Publish jobs and reach active candidates across skills, cities, and notice periods.", "post-job"],
    ["Resume Database (Resdex)", "Search verified talent with Boolean filters, profile credits, and saved searches.", "resdex"],
    ["Expert Assist", "Let hiring specialists shortlist candidates for urgent or high-volume hiring.", "pipeline"],
    ["Employer Branding", "Promote your company story and improve inbound candidate quality.", "manage-jobs"],
    ["Talent Pulse", "Track hiring supply, demand, and compensation movement across roles.", "credits"],
    ["AI REX", "AI-assisted sourcing workflows for faster recruiter productivity.", "resdex"]
  ] as const;
  const businessCards = [
    ["Large companies & enterprises", "Fill any role, from leadership to technology positions.", "Reduce manual screening with workflows and smart trends."],
    ["Small & medium businesses", "Post local and national openings with speed.", "Shortlist candidates without a large recruiting team."],
    ["Consultants & agencies", "Source high volume profiles faster with Resdex.", "Track candidates in shared pipeline boards."]
  ];
  const updates = ["Understanding the Recruitment Process in HRM", "Free Job Posting: Step-by-Step Guide", "What is a Job Posting?", "How to hire faster with talent data"];
  const faqs = ["How can recruiters sign up for a Placd account?", "How does pricing work for recruiter plans and job posting?", "What support, insight, and team collaboration features are offered?", "How secure is my recruiter account?", "How can I find the right candidates using Resdex?", "What features does Placd provide for bulk hiring?"];

  return (
    <main className="bg-white text-slate-950">
      <section className="bg-[#050b18] text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-center">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.35em] text-slate-300">Talent Decoder</p>
            <h1 className="mt-4 max-w-3xl text-4xl font-black md:text-6xl">Decode India's largest talent pool with the power of AI</h1>
            <p className="mt-5 max-w-xl text-lg text-slate-300">10 crore+ registered jobseekers for all your talent needs. Most advanced recruitment AI for sourcing, posting, and pipeline tracking.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button className={primaryButton} onClick={() => setEmployerView("credits")}>Explore our products</button>
              <button className="rounded-full border border-white/30 px-6 py-3 font-black text-white" onClick={() => setEmployerView("resdex")}>Search talent</button>
            </div>
          </div>
          <section className="rounded-3xl bg-white p-6 text-slate-950 shadow-2xl">
            <div className="grid grid-cols-2 rounded-full bg-slate-100 p-1 text-sm font-black">
              <button className="rounded-full bg-white py-2 shadow-sm">Request callback</button>
              <button className="py-2 text-slate-500">Help me choose</button>
            </div>
            <div className="mt-5 grid gap-3">
              <Input label="Full name" value="Acme Recruiter" />
              <Input label="Mobile number" value="+91 9818882211" />
              <Input label="Work email" value="recruiter@acme.com" />
              <div className="grid grid-cols-2 gap-2"><Input label="Company" value="Acme" /><Input label="Hiring city" value="Bengaluru" /></div>
              <button className={primaryButton} onClick={() => setEmployerView("post-job")}>Request callback</button>
            </div>
          </section>
        </div>
      </section>

      <section className="bg-gradient-to-r from-[#eef3ff] to-[#fff1fb] px-4 py-10">
        <div className="mx-auto max-w-7xl rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div><p className="text-sm text-slate-500">Powered by</p><h2 className="text-2xl font-black text-teal-800">Placd talent cloud</h2><p className="text-slate-500">One-stop solution: Search, Discover, Engage.</p></div>
            <div className="flex flex-wrap gap-3 text-sm font-black text-slate-500"><span>recruit</span><span>resdex</span><span>select</span><span>campus</span></div>
          </div>
          <div className="mt-7 flex gap-4 overflow-x-auto pb-2">
            {offers.slice(0, 4).map(([title, detail, view]) => (
              <button className="min-w-64 rounded-2xl border border-slate-200 p-5 text-left" key={title} onClick={() => setEmployerView(view)}>
                <strong>{title}</strong><p className="mt-3 text-sm text-slate-500">{detail}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16">
        <h2 className="text-center text-3xl font-black">What Placd offers</h2>
        <p className="mt-2 text-center text-slate-500">World-class hiring from planning and branding to sourcing, screening, and outreach.</p>
        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {offers.map(([title, detail, view], index) => (
            <button className="rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg" key={title} onClick={() => setEmployerView(view)}>
              <div className={`grid h-28 place-items-center rounded-2xl ${index % 2 ? "bg-emerald-50" : "bg-indigo-50"}`}><BriefcaseBusiness className="text-teal-800" size={36} /></div>
              <h3 className="mt-5 text-xl font-black">{title}</h3>
              <p className="mt-2 min-h-14 text-slate-600">{detail}</p>
              <span className="mt-4 block font-black text-teal-800">View plans</span>
            </button>
          ))}
        </div>
      </section>

      <section className="bg-[#f5f7fb] px-4 py-16">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-center text-3xl font-black">Hiring made simple for every business</h2>
          <div className="mt-9 grid gap-5 lg:grid-cols-3">
            {businessCards.map(([title, first, second]) => (
              <article className="overflow-hidden rounded-2xl bg-white shadow-sm" key={title}>
                <div className="grid h-44 place-items-end bg-slate-900 p-5 text-white"><h3 className="text-2xl font-black">{title}</h3></div>
                <div className="grid gap-4 p-6 text-slate-600"><p>{first}</p><p>{second}</p><button className={secondaryButton} onClick={() => setEmployerView("post-job")}>Request callback</button></div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16">
        <h2 className="text-center text-3xl font-black">What's new happening</h2>
        <div className="mt-9 flex gap-5 overflow-x-auto pb-3">
          {updates.map((title) => (
            <article className="min-w-72 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" key={title}>
              <div className="h-36 rounded-2xl bg-gradient-to-br from-slate-100 to-indigo-100" />
              <h3 className="mt-5 font-black">{title}</h3>
              <p className="mt-2 text-sm text-slate-500">Recruiter insights, process guides, and hiring playbooks for modern teams.</p>
              <button className="mt-4 font-black text-teal-800">Read more</button>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-6">
        <div className="grid gap-4 rounded-2xl bg-purple-100 p-8 md:grid-cols-[1fr_auto] md:items-center">
          <div><h2 className="text-2xl font-black">Not sure which offering is right for you?</h2><p className="text-slate-600">Leave your contact details and we'll get back to you shortly.</p></div>
          <button className={primaryButton} onClick={() => setEmployerView("credits")}>Request callback</button>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16">
        <h2 className="text-center text-3xl font-black">Here's why recruiters trust us</h2>
        <div className="mt-9 grid gap-5 md:grid-cols-3">
          {["Reduced hiring turnaround with AI-assisted sourcing.", "One of the most reliable sources for tech talent.", "Strong database quality and recruiter workflows."].map((quote, index) => (
            <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm" key={quote}>
              <p className="text-slate-600">"{quote}"</p>
              <strong className="mt-5 block">Recruiter {index + 1}</strong>
              <span className="text-sm text-slate-500">Talent acquisition leader</span>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-16">
        <h2 className="text-center text-3xl font-black">Frequently asked questions</h2>
        <div className="mt-8 divide-y divide-slate-200">
          {faqs.map((faq) => <button className="flex w-full items-center justify-between py-5 text-left font-bold" key={faq}>{faq}<Plus size={18} /></button>)}
        </div>
      </section>
    </main>
  );
}

function EmployeeProfile({ profile, setProfile, notify }: { profile: Profile; setProfile: (profile: Profile) => void; notify: (message: string) => void }) {
  const [draft, setDraft] = useState(profile);
  const completion = Math.round((Object.values(draft).filter(Boolean).length / Object.values(draft).length) * 100);
  return (
    <section className="mx-auto grid max-w-7xl gap-5 px-4 py-8 lg:grid-cols-[340px_minmax(0,1fr)]">
      <ProfileMiniCard profile={draft} completion={completion} />
      <section className={`${card} p-5`}>
        <SectionTitle icon={<UserRound />} title="Profile engine" detail="Editable fields update recommendations" />
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {(Object.keys(draft) as Array<keyof Profile>).filter((key) => key !== "resumeName").map((key) => (
            <Input key={key} label={labelFor(key)} value={draft[key]} onChange={(value) => setDraft({ ...draft, [key]: value })} />
          ))}
        </div>
        <div className="mt-4 grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-[auto_minmax(0,1fr)_auto] md:items-center">
          <UploadCloud className="text-teal-700" />
          <div><strong>{draft.resumeName}</strong><span className="block text-sm text-slate-500">Resume parser output refreshes profile search index</span></div>
          <button className={secondaryButton} onClick={() => setDraft({ ...draft, resumeName: `Resume_${Date.now()}.pdf` })}>Replace</button>
        </div>
        <SkillMatrix skills={draft.skills.split(",").map((skill) => skill.trim()).filter(Boolean)} />
        <button className={`${primaryButton} mt-5`} onClick={() => {
          setProfile(draft);
          notify("Profile saved. Sourcing refresh event queued.");
        }}>Save profile</button>
      </section>
    </section>
  );
}

function EmployeeApplications({ applications, jobs, alerts, setAlerts, notify }: { applications: Application[]; jobs: Job[]; alerts: Alert[]; setAlerts: Dispatch<SetStateAction<Alert[]>>; notify: (message: string) => void }) {
  const [newAlert, setNewAlert] = useState({ keyword: "Java Backend", location: "Bengaluru", frequency: "Daily" });
  return (
    <section className="mx-auto grid max-w-7xl gap-5 px-4 py-8 lg:grid-cols-[minmax(0,1fr)_360px]">
      <section className={`${card} p-5`}>
        <SectionTitle icon={<ClipboardList />} title="Application tracker" detail={`${applications.length} active applications`} />
        {applications.length === 0 ? <EmptyState title="No applications yet" detail="Apply to a job and it will appear here." /> : applications.map((application) => {
          const job = jobs.find((item) => item.id === application.jobId);
          return (
            <div className="mb-4 rounded-2xl border border-slate-200 p-4" key={application.id}>
              <h3 className="font-black">{job?.title ?? "Unknown job"}</h3>
              <p className="text-sm text-slate-500">{job?.company} - Applied {application.appliedAt}</p>
              {["Applied", "Viewed", "Shortlisted", "Interview"].map((step) => <TimelineItem key={step} title={step} detail={step === application.status ? "Current status" : "Workflow step"} state={step === application.status ? "active" : "done"} />)}
            </div>
          );
        })}
      </section>
      <section className={`${card} p-5`}>
        <SectionTitle icon={<Bell />} title="Job alerts" detail="Create and delete alerts" />
        <div className="grid gap-2">
          <Input label="Keyword" value={newAlert.keyword} onChange={(value) => setNewAlert({ ...newAlert, keyword: value })} />
          <Input label="Location" value={newAlert.location} onChange={(value) => setNewAlert({ ...newAlert, location: value })} />
          <Select label="Frequency" value={newAlert.frequency} options={["Instant", "Daily", "Weekly"]} onChange={(value) => setNewAlert({ ...newAlert, frequency: value })} />
          <button className={primaryButton} onClick={() => {
            setAlerts((current) => [...current, { id: `alert-${Date.now()}`, ...newAlert }]);
            notify("Job alert created.");
          }}>Create alert</button>
        </div>
        <div className="mt-5 grid gap-3">
          {alerts.map((alert) => (
            <div className="grid grid-cols-[1fr_auto] gap-2 rounded-xl bg-slate-50 p-3" key={alert.id}>
              <div><strong>{alert.keyword}</strong><span className="block text-sm text-slate-500">{alert.location} - {alert.frequency}</span></div>
              <button className={secondaryButton} onClick={() => {
                setAlerts((current) => current.filter((item) => item.id !== alert.id));
                notify("Job alert deleted.");
              }}><Trash2 size={16} /></button>
            </div>
          ))}
        </div>
      </section>
    </section>
  );
}

function PostJob({
  publishJob,
  saveJobDraft
}: {
  publishJob: (job: Omit<Job, "id" | "logo" | "rating" | "match" | "posted" | "applicants" | "status">) => void;
  saveJobDraft: (job: Omit<Job, "id" | "logo" | "rating" | "match" | "posted" | "applicants" | "status">) => void;
}) {
  const [draft, setDraft] = useState({ title: "Senior Backend Engineer", company: "Acme Technologies", location: "Bengaluru", salary: "28-55 LPA", experience: "5-10 yrs", workplace: "Hybrid" as Job["workplace"], skills: "Java, Kafka, PostgreSQL, Spring Boot", description: "Own distributed services, Kafka event streams, profile search integrations, and high-availability APIs." });
  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <div className={`${card} p-5`}>
        <SectionTitle icon={<Plus />} title="Post a job" detail="Publishes into employer jobs and decrements credits" />
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {(["title", "company", "location", "salary", "experience"] as const).map((key) => <Input key={key} label={labelFor(key)} value={draft[key]} onChange={(value) => setDraft({ ...draft, [key]: value })} />)}
          <Select label="Workplace" value={draft.workplace} options={["Remote", "Hybrid", "Onsite"]} onChange={(value) => setDraft({ ...draft, workplace: value as Job["workplace"] })} />
        </div>
        <Input label="Required skills" value={draft.skills} onChange={(value) => setDraft({ ...draft, skills: value })} />
        <TextArea label="Job description" value={draft.description} onChange={(value) => setDraft({ ...draft, description: value })} />
        <SkillRow skills={draft.skills.split(",").map((skill) => skill.trim()).filter(Boolean)} />
        <div className="mt-4 flex flex-wrap gap-2">
          <button className={secondaryButton} onClick={() => saveJobDraft({ ...draft, skills: draft.skills.split(",").map((skill) => skill.trim()).filter(Boolean) })}>Save draft</button>
          <button className={primaryButton} onClick={() => publishJob({ ...draft, skills: draft.skills.split(",").map((skill) => skill.trim()).filter(Boolean) })}>Publish job</button>
        </div>
      </div>
    </section>
  );
}

function ManageJobs({ jobs, setJobs, notify }: { jobs: Job[]; setJobs: Dispatch<SetStateAction<Job[]>>; notify: (message: string) => void }) {
  const updateStatus = (jobId: string, status: Job["status"]) => {
    setJobs((current) => current.map((job) => (job.id === jobId ? { ...job, status } : job)));
    notify(`Job moved to ${status}.`);
  };
  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <SectionHeader title="Manage jobs" detail="Edit status, pause, publish, and view applicants" />
      <div className="mt-5 grid gap-4">
        {jobs.map((job) => (
          <article className={`${card} grid gap-3 p-5 md:grid-cols-[auto_minmax(0,1fr)_180px_auto] md:items-center`} key={job.id}>
            <Logo label={job.logo} />
            <div><strong>{job.title}</strong><p className="text-sm text-slate-500">{job.location} - {job.applicants} applicants - {job.status}</p></div>
            <Select label="Status" value={job.status} options={["Published", "Draft", "Paused"]} onChange={(value) => updateStatus(job.id, value as Job["status"])} />
            <button className={secondaryButton} onClick={() => notify(`${job.applicants} applicants opened for ${job.title}.`)}>Applicants</button>
          </article>
        ))}
      </div>
    </section>
  );
}

function Resdex({ candidates, downloadProfile, contactCandidate }: { candidates: Candidate[]; downloadProfile: (candidateId: string) => void; contactCandidate: (candidateId: string) => void }) {
  const [term, setTerm] = useState("Java Kafka");
  const [city, setCity] = useState("Bengaluru");
  const [hideContacted, setHideContacted] = useState(false);
  const terms = term.toLowerCase().split(/\s+/).filter(Boolean);
  const results = candidates.filter((candidate) => {
    const haystack = `${candidate.title} ${candidate.skills.join(" ")}`.toLowerCase();
    const termMatch = terms.length === 0 || terms.some((item) => haystack.includes(item));
    const cityMatch = !city || candidate.location.toLowerCase().includes(city.toLowerCase());
    return termMatch && cityMatch && (!hideContacted || !candidate.contacted);
  });
  return (
    <section className="mx-auto grid max-w-7xl gap-5 px-4 py-8 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div className={`${card} p-5`}>
        <SectionTitle icon={<SlidersHorizontal />} title="Boolean talent search" detail="Filters update results immediately" />
        <Input label="Boolean / keyword query" value={term} onChange={setTerm} />
        <Input label="Location" value={city} onChange={setCity} />
        <label className="mt-3 flex items-center gap-2 font-bold text-slate-700"><input type="checkbox" checked={hideContacted} onChange={(event) => setHideContacted(event.target.checked)} />Hide contacted candidates</label>
      </div>
      <div className={`${card} p-5`}>
        <SectionTitle icon={<WalletCards />} title="Search summary" detail="Live result set" />
        <Metric icon={<Users />} label="Results" value={String(results.length)} />
        <Metric icon={<FileText />} label="Downloaded" value={String(candidates.filter((candidate) => candidate.downloaded).length)} />
        <Metric icon={<Mail />} label="Contacted" value={String(candidates.filter((candidate) => candidate.contacted).length)} />
      </div>
      <div className={`${card} p-5 lg:col-span-2`}>
        <SectionTitle icon={<Search />} title="Candidate results" detail={`${results.length} matches`} />
        {results.length === 0 ? <EmptyState title="No candidates found" detail="Try a wider query or clear filters." /> : results.map((candidate) => <CandidateCard key={candidate.id} candidate={candidate} onDownload={() => downloadProfile(candidate.id)} onContact={() => contactCandidate(candidate.id)} />)}
      </div>
    </section>
  );
}

function Pipeline({
  candidates,
  updateCandidate,
  bulkMessageCandidates
}: {
  candidates: Candidate[];
  updateCandidate: (candidateId: string, patch: Partial<Candidate>) => void;
  bulkMessageCandidates: () => void;
}) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-4 flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <SectionTitle icon={<KanbanSquare />} title="Recruitment management system" detail="Move candidates across stages" />
        <button className={primaryButton} onClick={bulkMessageCandidates}><MessageSquareText size={18} /> Bulk message</button>
      </div>
      <div className="grid gap-4 overflow-x-auto xl:grid-cols-4">
        {(["New", "Shortlisted", "Interview", "Offer"] as Stage[]).map((stage) => (
          <div className="min-h-[520px] rounded-2xl border border-slate-200 bg-white" key={stage}>
            <header className="flex items-center justify-between border-b border-slate-100 p-4"><strong>{stage}</strong><span className="grid h-7 min-w-7 place-items-center rounded-full bg-slate-100 text-sm">{candidates.filter((candidate) => candidate.stage === stage).length}</span></header>
            {candidates.filter((candidate) => candidate.stage === stage).map((candidate) => (
              <article className="m-3 grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3" key={candidate.id}>
                <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-3"><Avatar label={initials(candidate.name)} /><div><h3 className="font-black">{candidate.name}</h3><p className="text-sm text-slate-500">{candidate.title}</p><span className="text-sm text-slate-500">{candidate.notice} notice</span></div></div>
                <Select label="Move to" value={candidate.stage} options={["New", "Shortlisted", "Interview", "Offer"]} onChange={(value) => updateCandidate(candidate.id, { stage: value as Stage })} />
              </article>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}

function Credits({ credits, setCredits, notify }: { credits: Credits; setCredits: Dispatch<SetStateAction<Credits>>; notify: (message: string) => void }) {
  return (
    <section className="mx-auto grid max-w-7xl gap-5 px-4 py-8 md:grid-cols-2 xl:grid-cols-4">
      <MetricPanel icon={<Users />} label="Recruiter seats" value={`${credits.seatsUsed} / ${credits.seatsTotal}`} detail="active seats" />
      <MetricPanel icon={<FileText />} label="Profile downloads" value={String(credits.profileDownloads)} detail="available credits" />
      <MetricPanel icon={<BriefcaseBusiness />} label="Job credits" value={String(credits.jobCredits)} detail="available postings" />
      <MetricPanel icon={<LockKeyhole />} label="Tenant roles" value="4" detail="admin, manager, recruiter, viewer" />
      <section className={`${card} p-5 md:col-span-2`}>
        <SectionTitle icon={<WalletCards />} title="Top up credits" detail="Buttons update balances" />
        <div className="flex flex-wrap gap-2">
          <button className={primaryButton} onClick={() => { setCredits((current) => ({ ...current, profileDownloads: current.profileDownloads + 100 })); notify("Added 100 profile downloads."); }}>Add 100 downloads</button>
          <button className={primaryButton} onClick={() => { setCredits((current) => ({ ...current, jobCredits: current.jobCredits + 10 })); notify("Added 10 job credits."); }}>Add 10 job credits</button>
          <button className={secondaryButton} onClick={() => { setCredits((current) => ({ ...current, seatsUsed: Math.min(current.seatsTotal, current.seatsUsed + 1) })); notify("Recruiter seat assigned."); }}>Assign seat</button>
        </div>
      </section>
    </section>
  );
}

function Ats({ providers, connectAts }: { providers: Record<string, boolean>; connectAts: (provider: string) => void }) {
  return (
    <section className="mx-auto grid max-w-7xl gap-5 px-4 py-8 lg:grid-cols-[minmax(0,1fr)_340px]">
      <section className={`${card} p-5`}>
        <SectionTitle icon={<Webhook />} title="ATS integrations" detail="Connectors are interactive" />
        {Object.entries(providers).map(([provider, connected]) => (
          <article className="grid gap-3 border-t border-slate-100 py-4 first:border-t-0 md:grid-cols-[auto_minmax(0,1fr)_auto] md:items-center" key={provider}>
            <Webhook className="text-teal-700" size={18} />
            <div><strong>{provider}</strong><span className="block text-sm text-slate-500">{connected ? "Connected - outbound applications enabled" : "Available connector"}</span></div>
            <button className={connected ? secondaryButton : primaryButton} onClick={() => connectAts(provider)}>{connected ? "Disconnect" : "Connect"}</button>
          </article>
        ))}
      </section>
      <section className={`${card} p-5`}>
        <SectionTitle icon={<Link2 />} title="Webhook delivery" detail="Latest candidate exports" />
        <CompactList items={["Ajay Kumar sent to WD-REQ-2026-44891", "Priya Menon sent to WD-REQ-2026-44892", "Retry scheduled for WD-REQ-2026-44710"]} />
      </section>
    </section>
  );
}

function AuthModal({ mode, persona, onClose, onSwitch, onSubmit }: { mode: "login" | "register" | "employer-login"; persona: Persona; onClose: () => void; onSwitch: (mode: "login" | "register" | "employer-login") => void; onSubmit: (user: AuthUser) => void }) {
  const effectivePersona: Persona = mode === "employer-login" ? "employer" : persona;
  const [name, setName] = useState(effectivePersona === "employee" ? "Ajay Kumar" : "Acme Recruiter");
  const [email, setEmail] = useState(effectivePersona === "employee" ? "ajay@example.com" : "recruiter@acme.com");
  const [password, setPassword] = useState("password123");
  const [mobile, setMobile] = useState("9876543210");
  const [workStatus, setWorkStatus] = useState<"experienced" | "fresher">("experienced");
  if (mode === "login" || mode === "employer-login") {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950/35">
        <aside className="ml-auto grid h-full w-full max-w-[620px] content-start gap-6 rounded-l-[32px] bg-white p-8 shadow-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black">{mode === "employer-login" ? "Employer Login" : "Login"}</h2>
            <button className="text-3xl text-slate-500" onClick={onClose}>X</button>
          </div>
          {mode === "login" && <button className="justify-self-end font-black text-teal-800" onClick={() => onSwitch("register")}>Register for free</button>}
          {mode === "employer-login" && <p className="rounded-2xl bg-teal-50 p-4 font-bold text-teal-900">Recruiter SaaS access for jobs, Resdex, credits, and ATS integrations.</p>}
          <Input label="Email ID / Username" value={email} onChange={setEmail} />
          <Input label="Password" value={password} onChange={setPassword} />
          <button className={primaryButton} disabled={!email || !password} onClick={() => onSubmit({ name, email, persona: effectivePersona })}>Login</button>
          <button className="font-black text-teal-800">Use OTP to Login</button>
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-sm text-slate-400"><span className="h-px bg-slate-200" />Or<span className="h-px bg-slate-200" /></div>
          <button className={`${secondaryButton} w-full border-teal-700 text-teal-800`} onClick={() => onSubmit({ name: mode === "employer-login" ? "Google Recruiter" : "Google User", email: "google.user@example.com", persona: effectivePersona })}>Sign in with Google</button>
        </aside>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#f5f7fb] p-4">
      <div className="mx-auto flex max-w-7xl items-center justify-between py-5">
        <button className="flex items-center gap-2" onClick={onClose}><span className="grid h-10 w-10 place-items-center rounded-xl bg-teal-700 font-black text-white">P</span><span className="text-2xl font-black">Placd</span></button>
        <button className="text-lg" onClick={() => onSwitch("login")}>Already Registered? <span className="font-black text-teal-800">Login here</span></button>
      </div>
      <div className="mx-auto grid max-w-7xl gap-10 py-8 lg:grid-cols-[380px_minmax(0,1fr)]">
        <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-9 text-center">
          <div className="mx-auto grid h-44 w-44 place-items-center rounded-full bg-slate-100"><UserRound className="text-slate-800" size={76} /></div>
          <h2 className="mt-7 text-2xl font-black">On registering, you can</h2>
          <div className="mt-6 grid gap-5 text-left text-lg text-slate-700">
            {["Build your profile and let recruiters find you", "Get job postings delivered right to your email", "Find a job and grow your career"].map((item) => <span className="inline-flex gap-2" key={item}><CircleCheck className="mt-1 text-emerald-500" size={18} />{item}</span>)}
          </div>
        </aside>
        <section className="rounded-[28px] bg-white p-10 shadow-sm">
          <h1 className="text-3xl font-black">Create your Placd profile</h1>
          <p className="mt-1 text-lg text-slate-500">Search and apply to jobs from a high-scale job marketplace</p>
          <div className="mt-8 grid gap-5 lg:grid-cols-[minmax(0,1fr)_220px]">
            <div className="grid gap-5">
              <Input label="Full name*" value={name} onChange={setName} />
              <Input label="Email ID*" value={email} onChange={setEmail} />
              <Input label="Password*" value={password} onChange={setPassword} />
              <Input label="Mobile number*" value={mobile} onChange={setMobile} />
              <div>
                <strong>Work status*</strong>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  {[
                    ["experienced", "I'm experienced", "I have work experience excluding internships"],
                    ["fresher", "I'm a fresher", "I am a student or haven't worked after graduation"]
                  ].map(([value, title, detail]) => (
                    <button className={`rounded-2xl border p-5 text-left ${workStatus === value ? "border-teal-700 bg-teal-50" : "border-slate-200 bg-white"}`} key={value} onClick={() => setWorkStatus(value as "experienced" | "fresher")}>
                      <strong className="block text-lg">{title}</strong>
                      <span className="mt-1 block text-slate-500">{detail}</span>
                    </button>
                  ))}
                </div>
              </div>
              <label className="flex items-start gap-3 text-slate-500"><input className="mt-1" type="checkbox" />Send me important updates and promotions via SMS, email, and WhatsApp</label>
              <p className="text-sm text-slate-500">By clicking Register, you agree to the <span className="font-bold text-teal-800">Terms and Conditions</span> and <span className="font-bold text-teal-800">Privacy Policy</span>.</p>
              <button className={primaryButton} disabled={!name || !email || !password || !mobile} onClick={() => onSubmit({ name, email, persona: "employee" })}>Register now</button>
            </div>
            <div className="hidden border-l border-slate-200 pl-8 lg:block">
              <span className="block text-center text-slate-400">Continue with</span>
              <button className={`${secondaryButton} mt-4 w-full border-teal-700 text-teal-800`} onClick={() => onSubmit({ name: "Google User", email: "google.user@example.com", persona: "employee" })}>Google</button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function SearchBar({ query, location, setQuery, setLocation, onSearch, compact = false }: { query: string; location: string; setQuery: (value: string) => void; setLocation: (value: string) => void; onSearch: () => void; compact?: boolean }) {
  const [experience, setExperience] = useState("Experience");
  const experienceOptions = ["Experience", "0-2 yrs", "3-5 yrs", "6-10 yrs", "10+ yrs"];
  return (
    <form className={`mt-6 rounded-[28px] border border-slate-200 bg-white p-3 shadow-xl shadow-slate-200/70 ${compact ? "mt-0" : ""}`} onSubmit={(event) => { event.preventDefault(); onSearch(); }}>
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1.3fr)_180px_minmax(0,1fr)_auto] lg:items-center">
        <label className="flex min-h-14 items-center gap-3 rounded-2xl bg-slate-50 px-4"><Search className="text-teal-700" size={20} /><input className="bg-transparent text-base outline-none" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Skills, designation, companies" /></label>
        <label className="relative flex min-h-14 items-center rounded-2xl bg-slate-50 px-4">
          <select className="w-full appearance-none bg-transparent font-bold text-slate-700 outline-none" value={experience} onChange={(event) => setExperience(event.target.value)}>
            {experienceOptions.map((option) => <option key={option}>{option}</option>)}
          </select>
          <ChevronDown className="pointer-events-none absolute right-4 text-slate-500" size={17} />
        </label>
        <label className="flex min-h-14 items-center gap-3 rounded-2xl bg-slate-50 px-4"><MapPin className="text-teal-700" size={20} /><input className="bg-transparent text-base outline-none" value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Location" /></label>
        <button className={coralButton} type="submit">Search</button>
      </div>
    </form>
  );
}

function JobCard({ job, selected = false, saved, onSelect, onApply, onSave }: { job: Job; selected?: boolean; saved: boolean; onSelect: () => void; onApply: () => void; onSave: () => void }) {
  return (
    <article className={`${card} p-5 transition hover:-translate-y-0.5 hover:shadow-md ${selected ? "ring-2 ring-teal-700" : ""}`}>
      <div className="grid gap-4 md:grid-cols-[auto_minmax(0,1fr)_auto]">
        <button onClick={onSelect}><Logo label={job.logo} /></button>
        <div>
          <button className="text-left" onClick={onSelect}><h3 className="font-black">{job.title}</h3><p className="mt-1 text-sm text-slate-500">{job.company} - {job.rating} rating</p></button>
          <Meta items={[[<MapPin size={15} />, job.location], [<CircleDollarSign size={15} />, job.salary], [<Activity size={15} />, job.experience], [<Globe2 size={15} />, job.workplace]]} />
          <p className="mt-3 leading-6 text-slate-700">{job.description}</p>
          <SkillRow skills={job.skills} />
        </div>
        <div className="flex flex-col gap-2 md:items-end">
          <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-black text-teal-800">{job.match}% match</span>
          <span className="text-sm text-slate-500">{job.posted}</span>
          <button className={secondaryButton} onClick={onSave}>{saved ? "Saved" : "Save"}</button>
          <button className={primaryButton} onClick={onApply}>Apply</button>
        </div>
      </div>
    </article>
  );
}

function JobPreview({ job, saved, onApply, onSave }: { job: Job; saved: boolean; onApply: () => void; onSave: () => void }) {
  return (
    <aside className={`${card} h-fit p-5 lg:sticky lg:top-24`}>
      <SectionTitle icon={<FileText />} title="Job preview" detail="Apply workflow" />
      <Logo label={job.logo} large />
      <h2 className="mt-4 text-xl font-black">{job.title}</h2>
      <p className="mb-4 text-slate-500">{job.company}</p>
      <Metric icon={<MapPin />} label="Location" value={job.location} />
      <Metric icon={<CircleDollarSign />} label="Salary" value={job.salary} />
      <Metric icon={<Activity />} label="Experience" value={job.experience} />
      <div className="my-4 grid gap-1 rounded-2xl bg-teal-50 p-4"><strong>{job.match}% profile match</strong><span className="text-sm text-slate-500">Matched on {job.skills.slice(0, 3).join(", ")}</span></div>
      <div className="grid gap-2"><button className={`${primaryButton} w-full`} onClick={onApply}>Apply with resume</button><button className={`${secondaryButton} w-full`} onClick={onSave}>{saved ? "Saved" : "Save job"}</button></div>
    </aside>
  );
}

function ProfileMiniCard({ profile = initialProfile, completion = 86 }: { profile?: Profile; completion?: number }) {
  return (
    <section className={`${card} p-5`}>
      <div className="flex items-center gap-3"><Avatar label={initials(profile.name)} large /><div><h2 className="font-black">{profile.name}</h2><p className="text-sm text-slate-500">{profile.title}</p></div></div>
      <div className="my-5"><div className="mb-2 flex justify-between text-sm"><span>Profile strength</span><strong>{completion}%</strong></div><div className="h-2 overflow-hidden rounded-full bg-slate-200"><div className="h-full bg-teal-700" style={{ width: `${completion}%` }} /></div></div>
      <Metric icon={<Gauge />} label="Expected CTC" value={profile.expectedCtc} />
      <Metric icon={<Clock3 />} label="Notice" value={profile.notice} />
      <Metric icon={<MapPin />} label="Preferred" value={profile.location} />
    </section>
  );
}

function Filters({ workMode, setWorkMode, setLocation }: { workMode: string; setWorkMode: (value: string) => void; setLocation: (value: string) => void }) {
  return (
    <aside className={`${card} h-fit p-5`}>
      <SectionTitle icon={<Filter />} title="Filters" detail="Refine results" />
      <Select label="Work mode" value={workMode} options={["Any", "Remote", "Hybrid", "Onsite"]} onChange={setWorkMode} />
      <div className="mt-4 grid gap-2">{["Bengaluru", "Hyderabad", "Pune", ""].map((city) => <button className="rounded-xl bg-slate-50 px-4 py-3 text-left font-bold text-slate-700" key={city || "all"} onClick={() => setLocation(city)}>{city || "All locations"}</button>)}</div>
    </aside>
  );
}

function TopCompanies() {
  return (
    <section className={`${card} p-5`}>
      <SectionHeader title="Top companies hiring now" detail="Explore by employer brand" />
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {["FinEdge", "TalentCloud", "HireStack", "InsightGrid"].map((company) => <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4" key={company}><Logo label={company.slice(0, 2).toUpperCase()} /><strong className="mt-3 block">{company}</strong><span className="text-sm text-slate-500">Actively hiring</span></div>)}
      </div>
    </section>
  );
}

function ProfileMatchInsights({ jobs, setSelectedJobId, setEmployeeView }: { jobs: Job[]; setSelectedJobId: (id: string) => void; setEmployeeView: (view: EmployeeView) => void }) {
  const topMatches = jobs
    .slice()
    .sort((first, second) => second.match - first.match)
    .slice(0, 3);
  const averageMatch = topMatches.length > 0 ? Math.round(topMatches.reduce((sum, job) => sum + job.match, 0) / topMatches.length) : 0;
  const weeklyStats = [
    ["Profile views", "186", "+28%"],
    ["Recruiter searches", "42", "+11%"],
    ["Apply matches", String(topMatches.length), `${averageMatch}% avg`]
  ];

  return (
    <section className={`${card} p-5`}>
      <SectionHeader title="How your applies matched your profile in last 7 days?" detail="Based on skills, experience, location, salary, and work mode" />
      <div className="mt-5 grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
        <div className="rounded-2xl bg-teal-50 p-5">
          <span className="text-sm font-bold text-teal-900">Profile match score</span>
          <strong className="mt-2 block text-5xl text-teal-900">{averageMatch}%</strong>
          <p className="mt-3 text-sm leading-6 text-slate-600">Your best matches are coming from backend platform roles with Kafka, Java, and database experience.</p>
          <button className={`${primaryButton} mt-4`} onClick={() => setEmployeeView("profile")}>Improve profile</button>
        </div>
        <div className="grid gap-4">
          <div className="grid gap-3 sm:grid-cols-3">
            {weeklyStats.map(([label, value, trend]) => (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4" key={label}>
                <span className="text-sm text-slate-500">{label}</span>
                <strong className="mt-1 block text-2xl">{value}</strong>
                <small className="font-bold text-teal-800">{trend}</small>
              </div>
            ))}
          </div>
          <div className="grid gap-3">
            {topMatches.map((job) => (
              <button className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-left transition hover:border-teal-300 hover:bg-teal-50/40 md:grid-cols-[auto_minmax(0,1fr)_auto] md:items-center" key={job.id} onClick={() => {
                setSelectedJobId(job.id);
                setEmployeeView("jobs");
              }}>
                <Logo label={job.logo} />
                <span>
                  <strong className="block">{job.title}</strong>
                  <small className="text-slate-500">{job.company} - {job.location} - {job.experience}</small>
                </span>
                <span className="rounded-full bg-teal-700 px-3 py-1 text-xs font-black text-white">{job.match}% match</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function BlogUpdates({ setQuery, setEmployeeView }: { setQuery: (value: string) => void; setEmployeeView: (view: EmployeeView) => void }) {
  const posts = [
    { title: "How to write a resume that passes recruiter search filters", category: "Resume tips", read: "6 min read", query: "Resume" },
    { title: "Top backend skills Indian product companies are hiring for", category: "Career trends", read: "8 min read", query: "Java Kafka" },
    { title: "Notice period negotiation guide for experienced engineers", category: "Interview prep", read: "5 min read", query: "Senior Engineer" }
  ];

  return (
    <section className={`${card} p-5`}>
      <SectionHeader title="Stay updated with our blogs" detail="Career advice, hiring trends, salary insights, and interview preparation" />
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        {posts.map((post) => (
          <article className="grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4" key={post.title}>
            <span className="w-fit rounded-full bg-white px-3 py-1 text-xs font-black text-teal-800">{post.category}</span>
            <h3 className="text-lg font-black leading-6">{post.title}</h3>
            <div className="flex items-center justify-between text-sm text-slate-500">
              <span>{post.read}</span>
              <button className="font-black text-teal-800" onClick={() => {
                setQuery(post.query);
                setEmployeeView("jobs");
              }}>Explore jobs</button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function CandidateCard({ candidate, onDownload, onContact }: { candidate: Candidate; onDownload: () => void; onContact: () => void }) {
  return (
    <article className="grid gap-4 border-t border-slate-100 py-4 first:border-t-0 md:grid-cols-[auto_minmax(0,1fr)_auto]">
      <Avatar label={initials(candidate.name)} />
      <div><div className="flex justify-between gap-3"><h3 className="font-black">{candidate.name}</h3><span className="h-fit rounded-full bg-teal-50 px-3 py-1 text-xs font-black text-teal-800">{candidate.score}</span></div><p className="text-sm text-slate-500">{candidate.title}</p><Meta items={[[<MapPin size={15} />, candidate.location], [<Activity size={15} />, candidate.experience], [<Clock3 size={15} />, candidate.notice], [<CircleDollarSign size={15} />, candidate.expectedCtc]]} /><SkillRow skills={candidate.skills} /><div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-500"><span className="inline-flex items-center gap-1"><Mail size={14} /> {candidate.email}</span><span className="inline-flex items-center gap-1"><Phone size={14} /> {candidate.phone}</span></div></div>
      <div className="flex flex-col gap-2 md:items-end"><span className="text-sm text-slate-500">{candidate.active}</span><button className={secondaryButton} onClick={onDownload}>{candidate.downloaded ? "Downloaded" : "Download"}</button><button className={primaryButton} onClick={onContact}>{candidate.contacted ? "Contacted" : "Contact"}</button></div>
    </article>
  );
}

function ArchitectureBand() {
  const steps = [["Web", "React employee and employer portal", <Server key="server" />], ["API", "JWT, tenant isolation, validation", <ShieldCheck key="api" />], ["Postgres", "Profiles, jobs, credits, applications", <Database key="db" />], ["Kafka", "Outbox events and workers", <GitBranch key="kafka" />], ["OpenSearch", "Jobs and Resdex search", <Search key="search" />], ["ATS", "Workday webhook sync", <Webhook key="ats" />]] as const;
  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <div className={`${card} p-5`}>
        <SectionTitle icon={<Network />} title="How the platform works" detail="Frontend to backend data flow" />
        <div className="flex items-stretch gap-3 overflow-x-auto pb-1">
          {steps.map(([title, detail, icon], index) => (
            <div className="flex items-center gap-3" key={title}>
              <div className="grid min-h-32 w-40 content-start gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <div className="text-teal-700">{icon}</div>
                <strong>{title}</strong>
                <span className="text-sm leading-5 text-slate-500">{detail}</span>
              </div>
              {index < steps.length - 1 && <ChevronDown className="-rotate-90 text-slate-400" size={18} />}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer({
  setPersona,
  setEmployeeView,
  setEmployerView,
  lockedPersona = null
}: {
  setPersona: (persona: Persona) => void;
  setEmployeeView: (view: EmployeeView) => void;
  setEmployerView: (view: EmployerView) => void;
  lockedPersona?: Persona | null;
}) {
  const goEmployee = (view: EmployeeView) => {
    if (lockedPersona === "employer") return;
    setPersona("employee");
    setEmployeeView(view);
  };
  const goEmployer = (view: EmployerView) => {
    if (lockedPersona === "employee") return;
    setPersona("employer");
    setEmployerView(view);
  };

  if (lockedPersona === "employee") {
    return <EmployeeFooter goEmployee={goEmployee} />;
  }

  if (lockedPersona === "employer") {
    return <EmployerFooter goEmployer={goEmployer} />;
  }

  return (
    <footer className="border-t border-slate-200 bg-slate-950 text-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 lg:grid-cols-[1.2fr_1fr_1fr_1fr]">
        <section>
          <button className="flex items-center gap-2" onClick={() => goEmployee("home")}>
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-teal-600 font-black text-white">P</span>
            <span className="text-xl font-black">Placd</span>
          </button>
          <p className="mt-4 max-w-sm text-sm leading-6 text-slate-300">A dual-sided hiring marketplace for job seekers, recruiters, Resdex sourcing, job applications, credits, and ATS integrations.</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {lockedPersona !== "employer" && <button className="rounded-full bg-white px-4 py-2 text-sm font-black text-slate-950" onClick={() => goEmployee("jobs")}>Find jobs</button>}
            {lockedPersona !== "employee" && <button className="rounded-full border border-slate-700 px-4 py-2 text-sm font-black text-white" onClick={() => goEmployer("post-job")}>Post a job</button>}
          </div>
        </section>
        {lockedPersona !== "employer" && <FooterColumn title="Job seekers" links={[
          ["Search jobs", () => goEmployee("jobs")],
          ["Saved jobs", () => goEmployee("saved")],
          ["Profile", () => goEmployee("profile")],
          ["Applications", () => goEmployee("applications")]
        ]} />}
        {lockedPersona !== "employee" && <FooterColumn title="Employers" links={[
          ["Recruiter dashboard", () => goEmployer("overview")],
          ["Post job", () => goEmployer("post-job")],
          ["Manage jobs", () => goEmployer("manage-jobs")],
          ["Resdex search", () => goEmployer("resdex")]
        ]} />}
        <FooterColumn title="Platform" links={[
          ...(lockedPersona !== "employee" ? [
            ["Pipeline RMS", () => goEmployer("pipeline")] as [string, () => void],
            ["Credits", () => goEmployer("credits")] as [string, () => void],
            ["ATS integrations", () => goEmployer("ats")] as [string, () => void]
          ] : []),
          ["Architecture", () => window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" })]
        ]} />
      </div>
      <div className="border-t border-slate-800">
        <div className="mx-auto flex max-w-7xl flex-wrap justify-between gap-3 px-4 py-4 text-sm text-slate-400">
          <span>© 2026 Placd Marketplace</span>
          <span>Privacy · Terms · Security · Support</span>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: Array<[string, () => void]> }) {
  return (
    <section>
      <h3 className="font-black">{title}</h3>
      <div className="mt-4 grid gap-3">
        {links.map(([label, onClick]) => (
          <button className="w-fit text-left text-sm text-slate-300 transition hover:text-white" key={label} onClick={onClick}>{label}</button>
        ))}
      </div>
    </section>
  );
}

function EmployeeFooter({ goEmployee }: { goEmployee: (view: EmployeeView) => void }) {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 lg:grid-cols-[220px_1fr_1fr_1fr_380px]">
        <section>
          <button className="flex items-center gap-3" onClick={() => goEmployee("home")}>
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-teal-600 font-black text-white">P</span>
            <span className="text-3xl font-black">Placd</span>
          </button>
          <h3 className="mt-14 font-black">Connect with us</h3>
          <div className="mt-4 flex gap-5 text-slate-300">
            {["f", "ig", "x", "in"].map((item) => <span className="grid h-6 w-6 place-items-center rounded bg-slate-800 text-xs font-black" key={item}>{item}</span>)}
          </div>
        </section>
        <FooterColumnLight links={[
          ["About us", () => goEmployee("home")],
          ["Careers", () => goEmployee("jobs")],
          ["Employer home", () => goEmployee("home")],
          ["Sitemap", () => goEmployee("home")],
          ["Credits", () => goEmployee("profile")]
        ]} />
        <FooterColumnLight links={[
          ["Help center", () => goEmployee("applications")],
          ["Summons/Notices", () => goEmployee("home")],
          ["Grievances", () => goEmployee("home")],
          ["Report issue", () => goEmployee("applications")]
        ]} />
        <FooterColumnLight links={[
          ["Privacy policy", () => goEmployee("home")],
          ["Terms & conditions", () => goEmployee("home")],
          ["Fraud alert", () => goEmployee("home")],
          ["Trust & safety", () => goEmployee("home")]
        ]} />
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-8">
          <h3 className="text-2xl font-black">Apply on the go</h3>
          <p className="mt-2 text-slate-300">Get real-time job updates on our App</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <button className="rounded-lg bg-white px-5 py-3 font-black text-slate-950">Google Play</button>
            <button className="rounded-lg bg-white px-5 py-3 font-black text-slate-950">App Store</button>
          </div>
        </section>
      </div>
    </footer>
  );
}

function EmployerFooter({ goEmployer }: { goEmployer: (view: EmployerView) => void }) {
  return (
    <footer className="bg-[#061225] text-slate-100">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 md:grid-cols-2 xl:grid-cols-4">
        <EmployerFooterColumn title="Recruiter services" links={[
          ["Job Posting", () => goEmployer("post-job")],
          ["Resume Database (Resdex)", () => goEmployer("resdex")],
          ["Assisted Hiring", () => goEmployer("pipeline")],
          ["Employer Branding", () => goEmployer("overview")],
          ["Talent Pulse", () => goEmployer("credits")]
        ]} />
        <EmployerFooterColumn title="Information" links={[
          ["About us", () => goEmployer("overview")],
          ["Clients", () => goEmployer("manage-jobs")],
          ["Careers", () => goEmployer("post-job")],
          ["Terms & Conditions", () => goEmployer("overview")],
          ["Privacy policy", () => goEmployer("overview")],
          ["Jobseeker home", () => goEmployer("overview")],
          ["FAQs", () => goEmployer("ats")]
        ]} />
        <EmployerFooterColumn title="Legal" links={[
          ["Grievances", () => goEmployer("overview")],
          ["Summons and Notice", () => goEmployer("overview")],
          ["Trust and Safety", () => goEmployer("overview")],
          ["Whitehat", () => goEmployer("overview")]
        ]} />
        <section>
          <h3 className="font-black text-white">Customer support</h3>
          <p className="mt-5 leading-7 text-slate-300">Toll Free: 1800 102 5558<br />(10:00 AM to 6:00 PM, Mon - Sat)<br />support@Placd.com</p>
        </section>
      </div>
      <div className="mx-auto grid max-w-7xl gap-10 px-4 pb-16 md:grid-cols-2 xl:grid-cols-4">
        <section>
          <h3 className="font-black text-white">Sales enquiries</h3>
          <p className="mt-5 leading-7 text-slate-300">India:<br />Toll Free: 1800 102 2558<br />+91 - 9818882211<br />sales@Placd.com</p>
        </section>
        <section><p className="leading-7 text-slate-300">USA:<br />Toll Free: +1 866 557 3340<br />usa@Placd.com<br /><br />Europe/UK:<br />+44 808 120 2323<br />europe@Placd.com</p></section>
        <section><p className="leading-7 text-slate-300">South East Asia / AUS / NZ / Africa:<br />Mobile: +91 - 9266381188<br />asiapacific@Placd.com<br />africa@Placd.com</p></section>
        <section><p className="leading-7 text-slate-300">Middle East & others:<br />Mobile: +91 - 9818317555<br />middleeast@Placd.com</p></section>
      </div>
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 border-t border-slate-800 px-4 py-8">
        <button className="flex items-center gap-2" onClick={() => goEmployer("overview")}><span className="grid h-9 w-9 place-items-center rounded-xl bg-white font-black text-teal-800">P</span><span className="text-2xl font-black">Placd</span></button>
        <span className="text-slate-300">© 2026 Placd Recruiting. All Rights Reserved</span>
        <div className="flex gap-3"><span className="grid h-8 w-8 place-items-center rounded-full bg-white text-sm font-black text-slate-950">in</span><span className="grid h-8 w-8 place-items-center rounded-full bg-white text-sm font-black text-slate-950">yt</span></div>
      </div>
    </footer>
  );
}

function FooterColumnLight({ links }: { links: Array<[string, () => void]> }) {
  return (
    <section className="grid content-start gap-5 text-lg">
      {links.map(([label, onClick]) => <button className="w-fit text-left text-slate-300 hover:text-white" key={label} onClick={onClick}>{label}</button>)}
    </section>
  );
}

function EmployerFooterColumn({ title, links }: { title: string; links: Array<[string, () => void]> }) {
  return (
    <section>
      <h3 className="font-black text-white">{title}</h3>
      <div className="mt-5 grid gap-3">
        {links.map(([label, onClick]) => <button className="w-fit text-left text-slate-300 hover:text-white" key={label} onClick={onClick}>{label}</button>)}
      </div>
    </section>
  );
}

function SkillMatrix({ skills }: { skills: string[] }) {
  return (
    <div className="mt-5">
      <SectionTitle icon={<Sparkles />} title="Skills matrix" detail="Used for recommendations and recruiter search" />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{skills.map((skill, index) => <div className="grid gap-1 rounded-2xl border border-slate-200 bg-slate-50 p-3" key={skill}><strong>{skill}</strong><span className="text-sm text-slate-500">{index < 4 ? "Advanced" : "Intermediate"}</span></div>)}</div>
    </div>
  );
}

function TimelineItem({ title, detail, state }: { title: string; detail: string; state: string }) {
  const color = state === "pending" ? "text-slate-400" : state === "active" ? "text-teal-700" : "text-emerald-700";
  return <div className="grid grid-cols-[auto_1fr] gap-3 border-t border-slate-100 py-3 first:border-t-0"><CheckCircle2 className={color} size={18} /><div><strong>{title}</strong><span className="block text-sm text-slate-500">{detail}</span></div></div>;
}

function TopNav({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return <button className={`${active ? "text-teal-800" : "text-slate-700"} hover:text-teal-800`} onClick={onClick}>{label}</button>;
}

function MegaNavItem({
  active,
  label,
  badge,
  columns,
  wide = false
}: {
  active: boolean;
  label: string;
  badge?: string;
  wide?: boolean;
  columns: Array<{ title: string; links: Array<[string, () => void, string?]> }>;
}) {
  return (
    <div className="group relative">
      <button className={`relative py-3 ${active ? "text-teal-800 after:absolute after:inset-x-0 after:bottom-0 after:h-1 after:rounded-full after:bg-coral-500" : "hover:text-teal-800"}`}>
        {label}
        {badge && <span className="absolute -right-4 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-red-500 px-1 text-xs font-black text-white">{badge}</span>}
      </button>
      <div className={`invisible fixed left-4 right-4 top-20 z-50 max-h-[calc(100vh-6rem)] overflow-y-auto rounded-[28px] border border-slate-100 bg-white p-6 opacity-0 shadow-2xl shadow-slate-300/60 transition group-hover:visible group-hover:opacity-100 md:p-8 lg:absolute lg:left-1/2 lg:right-auto lg:top-[calc(100%-2px)] lg:max-h-none lg:-translate-x-1/2 lg:overflow-visible ${wide ? "lg:w-[880px]" : "lg:w-[440px]"}`}>
        <div className={`grid gap-8 ${columns.length > 2 ? "lg:grid-cols-3" : columns.length > 1 ? "md:grid-cols-2" : "grid-cols-1"}`}>
          {columns.map((column) => (
            <section className="border-b border-slate-200 pb-5 last:border-b-0 last:pb-0 md:border-b-0 md:border-r md:pb-0 md:pr-7 md:last:border-r-0 md:last:pr-0" key={column.title}>
              <h3 className="mb-4 text-lg font-black text-slate-950">{column.title}</h3>
              <div className="grid gap-3">
                {column.links.map(([item, onClick, pill]) => (
                  <button className="flex items-center justify-between text-left text-slate-600 hover:text-teal-800" key={item} onClick={onClick}>
                    <span>{item}</span>
                    {pill && <span className="rounded-full border border-red-100 bg-red-50 px-3 py-1 text-xs font-black text-red-500">{pill}</span>}
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}

function Meta({ items }: { items: Array<[ReactNode, string]> }) {
  return <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-600">{items.map(([icon, label]) => <span className="inline-flex items-center gap-1" key={label}>{icon} {label}</span>)}</div>;
}
