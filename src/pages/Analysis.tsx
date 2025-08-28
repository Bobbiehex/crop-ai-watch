import Layout from "../components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Camera, Upload, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Analysis = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">
          AI Crop <span className="bg-gradient-primary bg-clip-text text-transparent">Analysis</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Advanced machine learning algorithms analyze your crop images to detect diseases, 
          assess plant health, and provide actionable recommendations.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 mb-16">
        <Card className="shadow-soft border-2 border-primary/20">
          <CardHeader className="text-center">
            <div className="bg-gradient-primary w-16 h-16 rounded-xl flex items-center justify-center mb-4 mx-auto">
              <Upload className="h-8 w-8 text-primary-foreground" />
            </div>
            <CardTitle>Upload Images</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4">
              Upload high-quality images of your crops for analysis
            </p>
            <Badge variant="secondary">Step 1</Badge>
          </CardContent>
        </Card>

        <Card className="shadow-soft border-2 border-accent/20">
          <CardHeader className="text-center">
            <div className="bg-gradient-nature w-16 h-16 rounded-xl flex items-center justify-center mb-4 mx-auto">
              <Zap className="h-8 w-8 text-success-foreground" />
            </div>
            <CardTitle>AI Processing</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4">
              Our AI analyzes patterns and identifies potential issues
            </p>
            <Badge variant="secondary">Step 2</Badge>
          </CardContent>
        </Card>

        <Card className="shadow-soft border-2 border-earth/20">
          <CardHeader className="text-center">
            <div className="bg-gradient-earth w-16 h-16 rounded-xl flex items-center justify-center mb-4 mx-auto">
              <Camera className="h-8 w-8 text-earth-foreground" />
            </div>
            <CardTitle>Get Results</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4">
              Receive detailed analysis with treatment recommendations
            </p>
            <Badge variant="secondary">Step 3</Badge>
          </CardContent>
        </Card>
      </div>

        <div className="text-center">
          <Button 
            size="lg" 
            className="bg-gradient-primary shadow-glow"
            onClick={() => navigate('/dashboard')}
          >
            Start Analysis
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default Analysis;