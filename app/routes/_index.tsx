import Button from "~/components/Button";
import type { Route } from "./+types/_index";
import { useNavigate } from "react-router";
import { FiArrowRight, FiBox } from "react-icons/fi";

export function meta({}:Route.MetaArgs) {
  return [
    { title: "SmartSeason" },
    { name: "description", content: "SmartSeason field operations dashboard." },
  ];
}


export default function Index ()
{
  const navigate = useNavigate();

  return (
    <main className="index-page">
      <section className="hero-section">
        <div className="hero-icon">
          <FiBox className="h-12 w-12" />
        </div>
        
        <div className="space-y-4">
          <h1 className="hero-title">SmartSeason</h1>
          <p className="hero-subtitle">
            Intelligent field operations management for modern agriculture. Monitor, track, and optimize your crops with real-time insights.
          </p>
        </div>

        <div className="hero-cta">
          <Button 
            label="Get Started"
            onClick={() => navigate("/auth/signin")}
            icon={FiArrowRight}
            iconPosition="right"
            size="lg"
          />
        </div>

        <p className="text-sm text-slate-500">
          Empower your farm with smart field management
        </p>
      </section>
    </main>
  );
}
