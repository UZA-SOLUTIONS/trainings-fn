import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="container-page flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
      <p className="text-eyebrow text-muted-foreground">404</p>
      <h1 className="mt-2 font-display text-4xl font-bold tracking-tight sm:text-5xl">
        Page not found
      </h1>
      <p className="mt-3 max-w-md text-muted-foreground">
        That link doesn&apos;t match a page on this site. Try one of these destinations instead.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button asChild>
          <Link to="/">Home</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/programme">Programme</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/track">Track ID</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/apply">Apply</Link>
        </Button>
      </div>
    </main>
  );
}
