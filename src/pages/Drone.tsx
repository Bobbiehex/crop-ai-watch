import { useState, useRef, useEffect } from "react";
import Layout from "../components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { 
  Play, 
  Square, 
  Camera, 
  Video,
  Wifi,
  WifiOff,
  Download,
  Trash2,
  Eye,
  Calendar,
  MapPin
} from "lucide-react";

interface DroneSession {
  id: string;
  name: string;
  date: string;
  duration: string;
  location: string;
  type: 'live' | 'recorded';
  thumbnail?: string;
}

const Drone = () => {
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [sessionName, setSessionName] = useState("");
  const [location, setLocation] = useState("");
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [sessions, setSessions] = useState<DroneSession[]>([
    {
      id: "1",
      name: "Field Survey - North Sector",
      date: "2024-01-20",
      duration: "15:30",
      location: "Field A - Sector N",
      type: "recorded"
    },
    {
      id: "2", 
      name: "Crop Health Assessment",
      date: "2024-01-18",
      duration: "22:15",
      location: "Field B - Central",
      type: "recorded"
    },
    {
      id: "3",
      name: "Irrigation Monitoring",
      date: "2024-01-15",
      duration: "8:45",
      location: "Field C - East",
      type: "recorded"
    }
  ]);

  const connectToDrone = async () => {
    try {
      // Simulate drone connection by accessing camera
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 1280, height: 720 },
        audio: true 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      setIsConnected(true);
      toast({
        title: "Drone Connected",
        description: "Successfully connected to drone camera feed.",
      });
    } catch (error) {
      console.error('Error connecting to drone:', error);
      toast({
        title: "Connection Failed",
        description: "Unable to connect to drone. Please check camera permissions.",
        variant: "destructive",
      });
    }
  };

  const disconnectFromDrone = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    
    if (isRecording) {
      stopRecording();
    }
    
    setIsConnected(false);
    toast({
      title: "Drone Disconnected",
      description: "Disconnected from drone camera feed.",
    });
  };

  const startRecording = async () => {
    if (!videoRef.current?.srcObject) return;
    
    const stream = videoRef.current.srcObject as MediaStream;
    const recorder = new MediaRecorder(stream, {
      mimeType: 'video/webm;codecs=vp9'
    });
    
    const chunks: Blob[] = [];
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data);
      }
    };
    
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      setRecordedChunks([blob]);
      
      // Add to sessions list
      const newSession: DroneSession = {
        id: Date.now().toString(),
        name: sessionName || `Drone Recording ${new Date().toLocaleDateString()}`,
        date: new Date().toISOString().split('T')[0],
        duration: "Recording completed",
        location: location || "Unknown location",
        type: "recorded"
      };
      
      setSessions(prev => [newSession, ...prev]);
    };
    
    recorder.start();
    setMediaRecorder(recorder);
    setIsRecording(true);
    
    toast({
      title: "Recording Started",
      description: "Drone feed recording has started.",
    });
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
      setIsRecording(false);
      setMediaRecorder(null);
      
      toast({
        title: "Recording Stopped",
        description: "Drone feed recording has been saved.",
      });
    }
  };

  const takeScreenshot = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    if (ctx) {
      ctx.drawImage(video, 0, 0);
      
      // Convert to blob and download
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `drone-screenshot-${Date.now()}.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }
      });
      
      toast({
        title: "Screenshot Captured",
        description: "Screenshot saved successfully.",
      });
    }
  };

  const downloadRecording = (sessionId: string) => {
    if (recordedChunks.length > 0) {
      const blob = recordedChunks[0];
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `drone-recording-${sessionId}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Download Started",
        description: "Drone recording download has started.",
      });
    }
  };

  const deleteSession = (sessionId: string) => {
    setSessions(prev => prev.filter(session => session.id !== sessionId));
    toast({
      title: "Session Deleted",
      description: "Drone session has been deleted.",
    });
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Drone <span className="bg-gradient-primary bg-clip-text text-transparent">Monitoring</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Monitor your crops with live drone feeds, record surveillance sessions, 
            and analyze field conditions from an aerial perspective.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Live Feed Section */}
          <div className="lg:col-span-2">
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="h-5 w-5" />
                  Live Drone Feed
                  {isConnected ? (
                    <Badge variant="secondary" className="ml-auto">
                      <Wifi className="h-3 w-3 mr-1" />
                      Connected
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="ml-auto">
                      <WifiOff className="h-3 w-3 mr-1" />
                      Disconnected
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-black rounded-lg overflow-hidden aspect-video relative">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                    {!isConnected && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-subtle">
                        <div className="text-center">
                          <Video className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                          <p className="text-muted-foreground">No drone feed available</p>
                        </div>
                      </div>
                    )}
                    {isRecording && (
                      <div className="absolute top-4 right-4 bg-destructive text-destructive-foreground px-2 py-1 rounded flex items-center gap-1 text-sm">
                        <div className="w-2 h-2 bg-current rounded-full animate-pulse"></div>
                        REC
                      </div>
                    )}
                  </div>
                  
                  <canvas ref={canvasRef} className="hidden" />
                  
                  <div className="flex flex-wrap gap-2">
                    {!isConnected ? (
                      <Button onClick={connectToDrone} className="bg-gradient-primary">
                        <Wifi className="h-4 w-4 mr-2" />
                        Connect to Drone
                      </Button>
                    ) : (
                      <>
                        <Button onClick={disconnectFromDrone} variant="destructive">
                          <WifiOff className="h-4 w-4 mr-2" />
                          Disconnect
                        </Button>
                        
                        {!isRecording ? (
                          <Button onClick={startRecording} variant="default">
                            <Play className="h-4 w-4 mr-2" />
                            Start Recording
                          </Button>
                        ) : (
                          <Button onClick={stopRecording} variant="destructive">
                            <Square className="h-4 w-4 mr-2" />
                            Stop Recording
                          </Button>
                        )}
                        
                        <Button onClick={takeScreenshot} variant="outline">
                          <Camera className="h-4 w-4 mr-2" />
                          Screenshot
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Controls Section */}
          <div className="space-y-6">
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle>Recording Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="session-name">Session Name</Label>
                  <Input
                    id="session-name"
                    placeholder="Enter session name"
                    value={sessionName}
                    onChange={(e) => setSessionName(e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="Field location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle>Drone Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Connection</span>
                    <Badge variant={isConnected ? "secondary" : "secondary"}>
                      {isConnected ? "Online" : "Offline"}
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Recording</span>
                    <Badge variant={isRecording ? "destructive" : "secondary"}>
                      {isRecording ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Battery</span>
                    <Badge variant="success">85%</Badge>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Signal</span>
                    <Badge variant="success">Strong</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recorded Sessions */}
        <Card className="shadow-soft mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Recorded Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-12 bg-gradient-subtle rounded flex items-center justify-center">
                      <Video className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="font-medium">{session.name}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(session.date).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {session.location}
                        </span>
                        <span>{session.duration}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => downloadRecording(session.id)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => deleteSession(session.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Drone;