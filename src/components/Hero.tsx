import { Button } from "@/components/ui/button";
import { ArrowRight, Scan, Plane, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import heroImage from "@/assets/hero-agriculture.jpg";

const Hero = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGetStarted = () => {
    if (user) {
      navigate("/dashboard");
    } else {
      navigate("/auth");
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroImage} 
          alt="Agricultural fields from drone perspective" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/70 to-background/50" />
      </div>

      {/* Content */}
      <div className="container relative z-10 px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              AI-Powered
            </span>{" "}
            <br />
            Crop Disease Detection
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            Revolutionize your farming with advanced AI analysis and drone imagery. 
            Detect crop diseases early, optimize yields, and make data-driven decisions 
            for sustainable agriculture.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" className="bg-gradient-primary shadow-glow" onClick={handleGetStarted}>
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button variant="outline" size="lg" className="border-2">
              Watch Demo
            </Button>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-6 mt-16">
            <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-xl p-6 shadow-soft">
              <div className="bg-gradient-nature w-12 h-12 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <Scan className="h-6 w-6 text-success-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Smart Analysis</h3>
              <p className="text-muted-foreground text-sm">
                AI-powered image analysis detects diseases with 95% accuracy
              </p>
            </div>

            <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-xl p-6 shadow-soft">
              <div className="bg-gradient-earth w-12 h-12 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <Plane className="h-6 w-6 text-earth-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Drone Integration</h3>
              <p className="text-muted-foreground text-sm">
                Real-time aerial monitoring for comprehensive field coverage
              </p>
            </div>

            <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-xl p-6 shadow-soft">
              <div className="bg-gradient-primary w-12 h-12 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <BarChart3 className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Data Insights</h3>
              <p className="text-muted-foreground text-sm">
                Detailed reports and actionable recommendations for farmers
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;