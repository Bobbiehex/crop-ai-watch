import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Leaf, Brain, Plane, Users, Target, Award } from "lucide-react";
import cropHealthImage from "@/assets/crop-health.jpg";
import droneImage from "@/assets/drone-agriculture.jpg";

const About = () => {
  return (
    <div className="container mx-auto px-4 py-16">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">
          About <span className="bg-gradient-primary bg-clip-text text-transparent">CropAI</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          We're revolutionizing agriculture through cutting-edge AI technology and drone imagery, 
          helping farmers detect crop diseases early and optimize their yields for sustainable farming.
        </p>
      </div>

      {/* Mission & Vision */}
      <div className="grid md:grid-cols-2 gap-8 mb-16">
        <Card className="border-2 border-primary/20 shadow-soft">
          <CardHeader>
            <div className="bg-gradient-primary w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Target className="h-6 w-6 text-primary-foreground" />
            </div>
            <CardTitle className="text-2xl">Our Mission</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
              To empower farmers worldwide with AI-driven insights that enable early disease detection, 
              reduce crop losses, and promote sustainable agricultural practices through innovative technology.
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-accent/20 shadow-soft">
          <CardHeader>
            <div className="bg-gradient-nature w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Award className="h-6 w-6 text-success-foreground" />
            </div>
            <CardTitle className="text-2xl">Our Vision</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
              To create a world where every farmer has access to intelligent crop monitoring systems, 
              leading to increased food security and environmentally conscious farming practices.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Technology Stack */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-8">
          Powered by Advanced Technology
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="bg-gradient-primary w-16 h-16 rounded-xl flex items-center justify-center mb-4 mx-auto">
              <Brain className="h-8 w-8 text-primary-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">AI & Machine Learning</h3>
            <p className="text-muted-foreground">
              Advanced neural networks trained on thousands of crop images for accurate disease detection
            </p>
          </div>

          <div className="text-center">
            <div className="bg-gradient-earth w-16 h-16 rounded-xl flex items-center justify-center mb-4 mx-auto">
              <Plane className="h-8 w-8 text-earth-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Drone Technology</h3>
            <p className="text-muted-foreground">
              High-resolution aerial imaging for comprehensive field monitoring and analysis
            </p>
          </div>

          <div className="text-center">
            <div className="bg-gradient-nature w-16 h-16 rounded-xl flex items-center justify-center mb-4 mx-auto">
              <Leaf className="h-8 w-8 text-success-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Sustainable Farming</h3>
            <p className="text-muted-foreground">
              Data-driven insights that promote eco-friendly and sustainable agricultural practices
            </p>
          </div>
        </div>
      </div>

      {/* Impact Statistics */}
      <div className="bg-card rounded-2xl p-8 mb-16 shadow-soft">
        <h2 className="text-3xl font-bold text-center mb-8">Our Impact</h2>
        <div className="grid md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-3xl font-bold text-primary mb-2">95%</div>
            <div className="text-muted-foreground">Detection Accuracy</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-success mb-2">10,000+</div>
            <div className="text-muted-foreground">Farmers Helped</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-accent mb-2">50%</div>
            <div className="text-muted-foreground">Crop Loss Reduction</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-earth mb-2">25+</div>
            <div className="text-muted-foreground">Countries Served</div>
          </div>
        </div>
      </div>

      {/* Features Showcase */}
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <div>
          <img 
            src={cropHealthImage} 
            alt="Healthy crop analysis" 
            className="rounded-xl shadow-soft w-full h-64 object-cover"
          />
        </div>
        <div>
          <h2 className="text-3xl font-bold mb-4">Precision Agriculture</h2>
          <p className="text-muted-foreground mb-6 leading-relaxed">
            Our AI system analyzes crop health at the cellular level, identifying diseases 
            before they're visible to the naked eye. This early detection capability helps 
            farmers take preventive action and protect their yields.
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">Early Detection</Badge>
            <Badge variant="secondary">Disease Classification</Badge>
            <Badge variant="secondary">Treatment Recommendations</Badge>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-12 items-center mt-16">
        <div className="md:order-2">
          <img 
            src={droneImage} 
            alt="Drone monitoring crops" 
            className="rounded-xl shadow-soft w-full h-64 object-cover"
          />
        </div>
        <div>
          <h2 className="text-3xl font-bold mb-4">Aerial Monitoring</h2>
          <p className="text-muted-foreground mb-6 leading-relaxed">
            Integrated drone technology provides comprehensive field coverage, capturing 
            high-resolution imagery that our AI processes to create detailed health maps 
            of entire crop fields.
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">Real-time Monitoring</Badge>
            <Badge variant="secondary">Field Mapping</Badge>
            <Badge variant="secondary">Automated Analysis</Badge>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;