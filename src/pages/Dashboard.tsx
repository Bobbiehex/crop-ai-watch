import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";
import { 
  Upload, 
  Image as ImageIcon, 
  Activity, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Download
} from "lucide-react";

interface Analysis {
  id: string;
  disease: string;
  severity: string;
  confidence: number;
  treatments: string[];
  analysisDate: string;
  cropType: string;
  imageUrl: string;
}

const Dashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [cropType, setCropType] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<Analysis | null>(null);
  const [recentAnalyses, setRecentAnalyses] = useState<Analysis[]>([]);
  const [stats, setStats] = useState({
    totalScans: 0,
    healthyScans: 0,
    issuesFound: 0,
    avgConfidence: 0
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast({
          title: "File too large",
          description: "Please select an image smaller than 10MB.",
          variant: "destructive",
        });
        return;
      }
      setSelectedFile(file);
      setCurrentAnalysis(null);
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${user!.id}/${Date.now()}.${fileExt}`;
    
    const { error } = await supabase.storage
      .from('crop-images')
      .upload(fileName, file);

    if (error) throw error;

    const { data } = supabase.storage
      .from('crop-images')
      .getPublicUrl(fileName);

    return data.publicUrl;
  };

  const handleAnalyze = async () => {
    if (!selectedFile || !cropType || !user) {
      toast({
        title: "Missing Information",
        description: "Please select an image and crop type.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    
    try {
      // Upload image to Supabase Storage
      const imageUrl = await uploadImage(selectedFile);
      
      // Call analysis edge function
      const { data, error } = await supabase.functions.invoke('analyze-crop', {
        body: {
          imageUrl,
          cropType,
          userId: user.id
        }
      });
      
      if (error) throw error;
      
      const analysis: Analysis = {
        ...data.analysis,
        cropType,
        imageUrl
      };
      
      setCurrentAnalysis(analysis);
      
      // Refresh recent analyses
      await fetchRecentAnalyses();
      await fetchStats();
      
      toast({
        title: "Analysis Complete",
        description: "Your crop image has been analyzed successfully.",
      });
      
    } catch (error: any) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis Failed",
        description: error.message || "Failed to analyze the image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const fetchRecentAnalyses = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('crop_analyses')
        .select('*')
        .eq('user_id', user.id)
        .order('analysis_date', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      
      const formatted = data?.map(item => ({
        id: item.id,
        disease: item.disease_detected || 'Unknown',
        severity: item.severity_level || 'unknown',
        confidence: item.confidence_score || 0,
        treatments: item.treatment_suggestions || [],
        analysisDate: item.analysis_date,
        cropType: item.crop_type,
        imageUrl: item.image_url
      })) || [];
      
      setRecentAnalyses(formatted);
    } catch (error) {
      console.error('Error fetching analyses:', error);
    }
  };

  const fetchStats = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('crop_analyses')
        .select('severity_level, confidence_score')
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      const totalScans = data?.length || 0;
      const healthyScans = data?.filter(item => item.severity_level === 'healthy').length || 0;
      const issuesFound = totalScans - healthyScans;
      const avgConfidence = data?.length 
        ? Math.round(data.reduce((sum, item) => sum + (item.confidence_score || 0), 0) / data.length)
        : 0;
      
      setStats({
        totalScans,
        healthyScans,
        issuesFound,
        avgConfidence
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const generatePDFReport = (analysis: Analysis) => {
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(20);
    doc.text('Crop Analysis Report', 20, 30);
    
    // Analysis details
    doc.setFontSize(12);
    doc.text(`Date: ${new Date(analysis.analysisDate).toLocaleDateString()}`, 20, 50);
    doc.text(`Crop Type: ${analysis.cropType}`, 20, 60);
    doc.text(`Disease Detected: ${analysis.disease}`, 20, 70);
    doc.text(`Severity Level: ${analysis.severity}`, 20, 80);
    doc.text(`Confidence Score: ${analysis.confidence}%`, 20, 90);
    
    // Treatments
    doc.text('Recommended Treatments:', 20, 110);
    analysis.treatments.forEach((treatment, index) => {
      doc.text(`${index + 1}. ${treatment}`, 25, 120 + (index * 10));
    });
    
    // Save the PDF
    doc.save(`crop-analysis-${analysis.id}.pdf`);
    
    toast({
      title: "Report Downloaded",
      description: "PDF report has been generated and downloaded.",
    });
  };

  // Load data on component mount
  useEffect(() => {
    if (user) {
      fetchRecentAnalyses();
      fetchStats();
    }
  }, [user]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "healthy": return "secondary";
      case "mild": return "success";
      case "moderate": return "warning";
      case "severe": return "destructive";
      default: return "secondary";
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Crop Analysis <span className="bg-gradient-primary bg-clip-text text-transparent">Dashboard</span>
        </h1>
        <p className="text-muted-foreground">Upload crop images for AI-powered disease detection and analysis</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Upload Section */}
        <div className="lg:col-span-1">
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload Image
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="crop-type">Crop Type</Label>
                  <Select value={cropType} onValueChange={setCropType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select crop type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tomato">Tomato</SelectItem>
                      <SelectItem value="corn">Corn</SelectItem>  
                      <SelectItem value="wheat">Wheat</SelectItem>
                      <SelectItem value="rice">Rice</SelectItem>
                      <SelectItem value="potato">Potato</SelectItem>
                      <SelectItem value="bean">Bean</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                  <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <div className="space-y-2">
                    <Label htmlFor="file-upload" className="cursor-pointer">
                      <span className="text-sm font-medium text-primary hover:text-primary/80">
                        Click to upload
                      </span>
                      <span className="text-sm text-muted-foreground"> or drag and drop</span>
                    </Label>
                    <Input
                      id="file-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileSelect}
                    />
                    <p className="text-xs text-muted-foreground">PNG, JPG up to 10MB</p>
                  </div>
                </div>

                {selectedFile && (
                  <div className="space-y-3">
                    <div className="text-sm">
                      <strong>Selected:</strong> {selectedFile.name}
                    </div>
                    <Button 
                      onClick={handleAnalyze} 
                      disabled={isAnalyzing || !cropType}
                      className="w-full bg-gradient-primary"
                    >
                      {isAnalyzing ? (
                        <>
                          <Activity className="h-4 w-4 mr-2 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Activity className="h-4 w-4 mr-2" />
                          Analyze Image
                        </>
                      )}
                    </Button>
                  </div>
                )}

                {isAnalyzing && (
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">Analysis Progress</div>
                    <Progress value={75} className="w-full" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results Section */}
        <div className="lg:col-span-2">
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Analysis Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              {currentAnalysis ? (
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Disease Detection</h3>
                        <Badge variant={getSeverityColor(currentAnalysis.severity) as any}>
                          {currentAnalysis.disease === 'Healthy' ? (
                            <CheckCircle className="h-3 w-3 mr-1" />
                          ) : (
                            <AlertTriangle className="h-3 w-3 mr-1" />
                          )}
                          {currentAnalysis.disease}
                        </Badge>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Severity Level</h4>
                        <Badge variant={getSeverityColor(currentAnalysis.severity) as any}>
                          {currentAnalysis.severity}
                        </Badge>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Confidence Level</h4>
                        <div className="flex items-center gap-2">
                          <Progress value={currentAnalysis.confidence} className="flex-1" />
                          <span className="text-sm font-medium">{currentAnalysis.confidence}%</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Recommended Actions</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {currentAnalysis.treatments.map((treatment, index) => (
                            <li key={index}>• {treatment}</li>
                          ))}
                        </ul>
                      </div>

                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => generatePDFReport(currentAnalysis)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download Report
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <ImageIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>Upload an image to see analysis results</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid md:grid-cols-4 gap-4 mt-8">
        <Card className="shadow-soft">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Scans</p>
                <p className="text-2xl font-bold">{stats.totalScans}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Healthy Crops</p>
                <p className="text-2xl font-bold">{stats.healthyScans}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Issues Found</p>
                <p className="text-2xl font-bold">{stats.issuesFound}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Confidence</p>
                <p className="text-2xl font-bold">{stats.avgConfidence}%</p>
              </div>
              <Activity className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Analyses */}
      <Card className="shadow-soft mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Analyses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentAnalyses.map((analysis) => (
              <div key={analysis.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-subtle rounded-lg flex items-center justify-center">
                    <ImageIcon className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <div className="font-medium capitalize">{analysis.cropType}</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(analysis.analysisDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="font-medium">{analysis.disease}</div>
                    <div className="text-sm text-muted-foreground">{analysis.confidence}% confidence</div>
                  </div>
                  <Badge variant={getSeverityColor(analysis.severity) as any}>
                    {analysis.severity}
                  </Badge>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => generatePDFReport(analysis)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            {recentAnalyses.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No analyses yet. Upload your first crop image to get started!</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;