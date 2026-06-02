import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { ClerkProvider, SignIn, SignUp, Show, useClerk } from "@clerk/react";
import { publishableKeyFromHost } from "@clerk/react/internal";
import { shadcn } from "@clerk/themes";
import { useEffect, useRef, Component, ReactNode } from "react";
import { useLocation } from "wouter";
import { CommandPaletteProvider } from "@/components/CommandPalette";

// Pages
import Dashboard from "@/pages/dashboard";
import Leads from "@/pages/leads";
import Customers from "@/pages/customers";
import Projects from "@/pages/projects";
import Estimates from "@/pages/estimates";
import Invoices from "@/pages/invoices";
import Crew from "@/pages/crew";
import Schedule from "@/pages/schedule";
import Tasks from "@/pages/tasks";
import Materials from "@/pages/materials";
import SettingsPage from "@/pages/settings";

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
});

function getClerkConfig() {
  try {
    const clerkPubKey = publishableKeyFromHost(
      window.location.hostname,
      import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
    );
    const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;
    return { clerkPubKey, clerkProxyUrl, valid: !!clerkPubKey };
  } catch (e) {
    console.error("Error initializing Clerk config:", e);
    return { clerkPubKey: "", clerkProxyUrl: "", valid: false };
  }
}

const basePath = (import.meta.env.BASE_PATH || "").replace(/\/$/, "");

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

const clerkAppearance = {
  theme: shadcn,
  cssLayerName: "clerk",
  variables: {
    colorPrimary: "hsl(183, 100%, 50%)",
    colorBackground: "hsl(227, 38%, 10%)",
    colorInput: "hsl(227, 31%, 17%)",
  },
  elements: {
    rootBox: "w-full flex justify-center",
    cardBox: "bg-card rounded-2xl w-[440px] max-w-full overflow-hidden border border-white/10 shadow-[0_0_15px_rgba(0,240,255,0.05)]",
    card: "!shadow-none !border-0 !bg-transparent !rounded-none",
    footer: "!shadow-none !border-0 !bg-transparent !rounded-none",
  },
};

function AuthPage({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4 py-8">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[20%] left-[20%] w-[30%] h-[30%] rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute bottom-[10%] right-[15%] w-[25%] h-[25%] rounded-full bg-secondary/10 blur-[120px]" />
      </div>
      <div className="z-10 w-full flex flex-col items-center gap-6 sm:gap-8">
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
            TOP TIN ROOFING
          </h1>
          <p className="text-muted-foreground text-sm">Elite Command Center</p>
        </div>
        {children}
      </div>
    </div>
  );
}

function SignInPage() {
  return (
    <AuthPage>
      <SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} appearance={clerkAppearance} />
    </AuthPage>
  );
}

function SignUpPage() {
  return (
    <AuthPage>
      <SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`} appearance={clerkAppearance} />
    </AuthPage>
  );
}

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const qc = useQueryClient();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (prevUserIdRef.current !== undefined && prevUserIdRef.current !== userId) {
        qc.clear();
      }
      prevUserIdRef.current = userId;
    });
    return unsubscribe;
  }, [addListener, qc]);

  return null;
}

function HomeRedirect() {
  return (
    <>
      <Show when="signed-in"><Redirect to="/dashboard" /></Show>
      <Show when="signed-out"><Redirect to="/sign-in" /></Show>
    </>
  );
}

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  return (
    <>
      <Show when="signed-in"><Component /></Show>
      <Show when="signed-out"><Redirect to="/sign-in" /></Show>
    </>
  );
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: ReactNode; fallback: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

function AppRouter() {
  const [, setLocation] = useLocation();
  const { clerkPubKey, clerkProxyUrl, valid } = getClerkConfig();

  if (!valid) {
    return (
      <AuthPage>
        <div className="text-center text-destructive">
          <h2 className="text-lg font-semibold">Configuration Error</h2>
          <p className="text-sm text-muted-foreground">
            Missing or invalid VITE_CLERK_PUBLISHABLE_KEY
          </p>
        </div>
      </AuthPage>
    );
  }

  return (
    <ErrorBoundary
      fallback={
        <AuthPage>
          <div className="text-center text-destructive">
            <h2 className="text-lg font-semibold">Something went wrong</h2>
            <p className="text-sm text-muted-foreground">
              Please refresh the page to try again.
            </p>
          </div>
        </AuthPage>
      }
    >
      <ClerkProvider
        publishableKey={clerkPubKey}
        proxyUrl={clerkProxyUrl}
        signInUrl={`${basePath}/sign-in`}
        signUpUrl={`${basePath}/sign-up`}
        routerPush={(to) => setLocation(stripBase(to))}
        routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
      >
      <QueryClientProvider client={queryClient}>
        <ClerkQueryClientCacheInvalidator />
        <CommandPaletteProvider>
          <TooltipProvider>
            <Switch>
              <Route path="/" component={HomeRedirect} />
              <Route path="/sign-in/*?" component={SignInPage} />
              <Route path="/sign-up/*?" component={SignUpPage} />
              <Route path="/dashboard"><ProtectedRoute component={Dashboard} /></Route>
              <Route path="/leads"><ProtectedRoute component={Leads} /></Route>
              <Route path="/customers"><ProtectedRoute component={Customers} /></Route>
              <Route path="/projects"><ProtectedRoute component={Projects} /></Route>
              <Route path="/estimates"><ProtectedRoute component={Estimates} /></Route>
              <Route path="/invoices"><ProtectedRoute component={Invoices} /></Route>
              <Route path="/crew"><ProtectedRoute component={Crew} /></Route>
              <Route path="/schedule"><ProtectedRoute component={Schedule} /></Route>
              <Route path="/tasks"><ProtectedRoute component={Tasks} /></Route>
              <Route path="/materials"><ProtectedRoute component={Materials} /></Route>
              <Route path="/settings"><ProtectedRoute component={SettingsPage} /></Route>
              <Route component={NotFound} />
            </Switch>
            <Toaster richColors position="top-right" />
          </TooltipProvider>
        </CommandPaletteProvider>
      </QueryClientProvider>
    </ClerkProvider>
    </ErrorBoundary>
  );
}

function App() {
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <WouterRouter base={basePath}>
      <AppRouter />
    </WouterRouter>
  );
}

export default App;
