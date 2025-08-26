import Layout from "../components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  Play, 
  ExternalLink, 
  Download,
  Leaf,
  Bug,
  Sprout
} from "lucide-react";

const Resources = () => {
  const articles = [
    {
      title: "Common Tomato Diseases and Their Prevention",
      category: "Disease Prevention",
      readTime: "5 min read",
      description: "Learn to identify and prevent the most common diseases affecting tomato crops.",
      icon: Bug,
      color: "destructive"
    },
    {
      title: "Optimizing Crop Yields with AI Technology",
      category: "Technology",
      readTime: "8 min read", 
      description: "Discover how artificial intelligence is revolutionizing modern agriculture.",
      icon: Sprout,
      color: "success"
    },
    {
      title: "Sustainable Farming Practices for the Future",
      category: "Sustainability",
      readTime: "6 min read",
      description: "Explore eco-friendly farming methods that protect the environment.",
      icon: Leaf,
      color: "success"
    }
  ];

  const videos = [
    {
      title: "How to Use Drone Technology for Crop Monitoring",
      duration: "12:34",
      views: "45K views"
    },
    {
      title: "AI-Powered Disease Detection Tutorial",
      duration: "8:22",
      views: "32K views"
    },
    {
      title: "Weather Forecasting for Smart Farming",
      duration: "15:48",
      views: "28K views"
    }
  ];

  const guides = [
    {
      title: "Complete Guide to Crop Disease Identification",
      pages: "24 pages",
      format: "PDF"
    },
    {
      title: "Best Practices for Agricultural Technology",  
      pages: "18 pages",
      format: "PDF"
    },
    {
      title: "Seasonal Farming Calendar and Tips",
      pages: "32 pages", 
      format: "PDF"
    }
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Educational <span className="bg-gradient-primary bg-clip-text text-transparent">Resources</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Expand your agricultural knowledge with our comprehensive collection of articles, 
            guides, and educational materials about crop diseases and modern farming techniques.
          </p>
        </div>

        {/* Featured Articles */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-8">Featured Articles</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {articles.map((article, index) => (
              <Card key={index} className="shadow-soft hover:shadow-glow transition-shadow cursor-pointer">
                <CardHeader>
                  <div className={`bg-gradient-${article.color === 'success' ? 'nature' : 'primary'} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                    <article.icon className="h-6 w-6 text-white" />
                  </div>
                  <Badge variant="secondary" className="w-fit mb-2">
                    {article.category}
                  </Badge>
                  <CardTitle className="text-xl">{article.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{article.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{article.readTime}</span>
                    <Button variant="outline" size="sm">
                      Read More
                      <ExternalLink className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Video Tutorials */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-8">Video Tutorials</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {videos.map((video, index) => (
              <Card key={index} className="shadow-soft hover:shadow-glow transition-shadow cursor-pointer">
                <CardContent className="p-0">
                  <div className="bg-gradient-subtle h-48 rounded-t-lg flex items-center justify-center">
                    <div className="bg-primary/20 w-16 h-16 rounded-full flex items-center justify-center">
                      <Play className="h-8 w-8 text-primary ml-1" />
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="font-semibold mb-2">{video.title}</h3>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{video.duration}</span>
                      <span>{video.views}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Downloadable Guides */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-8">Downloadable Guides</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {guides.map((guide, index) => (
              <Card key={index} className="shadow-soft">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="bg-gradient-earth w-12 h-12 rounded-lg flex items-center justify-center">
                      <BookOpen className="h-6 w-6 text-earth-foreground" />
                    </div>
                    <Badge variant="outline">{guide.format}</Badge>
                  </div>
                  <h3 className="font-semibold mb-2">{guide.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{guide.pages}</p>
                  <Button variant="outline" className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Download Guide
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-2xl">Quick Links & External Resources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold">Government Resources</h4>
                <div className="space-y-2">
                  <a href="#" className="flex items-center text-sm text-primary hover:text-primary/80">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Department of Agriculture
                  </a>
                  <a href="#" className="flex items-center text-sm text-primary hover:text-primary/80">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Agricultural Extension Services
                  </a>
                  <a href="#" className="flex items-center text-sm text-primary hover:text-primary/80">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Crop Insurance Programs
                  </a>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold">Research Institutions</h4>
                <div className="space-y-2">
                  <a href="#" className="flex items-center text-sm text-primary hover:text-primary/80">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Agricultural Research Centers
                  </a>
                  <a href="#" className="flex items-center text-sm text-primary hover:text-primary/80">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    University Extension Programs
                  </a>
                  <a href="#" className="flex items-center text-sm text-primary hover:text-primary/80">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    International Crop Research
                  </a>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Resources;