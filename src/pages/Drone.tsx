import { useState, useRef, useEffect } from "react";
import Layout from "../components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
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

interface DroneRecording {
  id: string;
  session_name: string;
  location: string;
  recording_url?: string;
  recording_data?: string;
  duration: number;
  created_at: string;
  user_id: string;
}

const Drone = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const recordingDataRef = useRef<Blob[]>([]);
  
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [sessionName, setSessionName] = useState("");
  const [location, setLocation] = useState("");
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordingStartTime, setRecordingStartTime] = useState<number | null>(null);
  const [recordings, setRecordings] = useState<DroneRecording[]>([]);
  const [loading, setLoading] = useState(false);

  // Load user's recordings when component mounts
  useEffect(() => {
    if (user) {
      loadRecordings();
    }
  }, [user]);

  const loadRecordings = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('drone_recordings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading recordings:', error);
        return;
      }

      setRecordings(data || []);
    } catch (error) {
      console.error('Error loading recordings:', error);
    }
  };

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
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to record drone sessions.",
        variant: "destructive",
      });
      return;
    }

    if (!sessionName.trim() || !location.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in both session name and location before recording.",
        variant: "destructive",
      });
      return;
    }

    if (!videoRef.current?.srcObject) {
      toast({
        title: "No Video Feed",
        description: "Please connect to drone first.",
        variant: "destructive",
      });
      return;
    }
    
    const stream = videoRef.current.srcObject as MediaStream;
    const recorder = new MediaRecorder(stream, {
      mimeType: 'video/webm;codecs=vp9'
    });
    
    recordingDataRef.current = [];
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordingDataRef.current.push(event.data);
      }
    };
    
    recorder.onstop = async () => {
      await saveRecording();
    };
    
    recorder.start();
    setMediaRecorder(recorder);
    setIsRecording(true);
    setRecordingStartTime(Date.now());
    
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
    }
  };

  const saveRecording = async () => {
    if (!user || recordingDataRef.current.length === 0) return;

    setLoading(true);
    try {
      const blob = new Blob(recordingDataRef.current, { type: 'video/webm' });
      const duration = recordingStartTime ? Math.floor((Date.now() - recordingStartTime) / 1000) : 0;
      
      // Convert blob to base64 for storage
      const arrayBuffer = await blob.arrayBuffer();
      const base64String = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

      const { data, error } = await supabase
        .from('drone_recordings')
        .insert({
          user_id: user.id,
          session_name: sessionName,
          location: location,
          recording_data: base64String,
          duration: duration,
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving recording:', error);
        toast({
          title: "Save Error",
          description: "Failed to save recording to database.",
          variant: "destructive",
        });
        return;
      }

      // Add to local state
      if (data) {
        setRecordings(prev => [data, ...prev]);
      }

      // Clear form
      setSessionName("");
      setLocation("");
      
      toast({
        title: "Recording Saved",
        description: "Drone recording has been saved successfully.",
      });

    } catch (error) {
      console.error('Error saving recording:', error);
      toast({
        title: "Save Error",
        description: "Failed to save recording.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setRecordingStartTime(null);
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

  const downloadRecording = async (recording: DroneRecording) => {
    if (!recording.recording_data) {
      toast({
        title: "Download Error",
        description: "No recording data available.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('drone_recordings')
        .select('recording_data')
        .eq('id', recording.id)
        .single();

      if (error || !data?.recording_data) {
        toast({
          title: "Download Error",
          description: "Failed to retrieve recording data.",
          variant: "destructive",
        });
        return;
      }

      // Convert base64 back to blob
      const binaryString = atob(data.recording_data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: 'video/webm' });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${recording.session_name.replace(/[^a-z0-9]/gi, '_')}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Download Started",
        description: "Recording download has started.",
      });
    } catch (error) {
      console.error('Error downloading recording:', error);
      toast({
        title: "Download Error",
        description: "Failed to download recording.",
        variant: "destructive",
      });
    }
  };

  const deleteRecording = async (recordingId: string) => {
    try {
      const { error } = await supabase
        .from('drone_recordings')
        .delete()
        .eq('id', recordingId);

      if (error) {
        console.error('Error deleting recording:', error);
        toast({
          title: "Delete Error",
          description: "Failed to delete recording.",
          variant: "destructive",
        });
        return;
      }

      // Remove from local state
      setRecordings(prev => prev.filter(rec => rec.id !== recordingId));
      
      toast({
        title: "Recording Deleted",
        description: "Recording has been deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting recording:', error);
      toast({
        title: "Delete Error",
        description: "Failed to delete recording.",
        variant: "destructive",
      });
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl font-bold mb-6">Authentication Required</h1>
          <p className="text-xl text-muted-foreground">
            Please sign in to access the drone monitoring features.
          </p>
        </div>
      </Layout>
    );
  }

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
                          <Button 
                            onClick={startRecording} 
                            variant="default"
                            disabled={loading}
                          >
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
                  <Label htmlFor="session-name">Session Name *</Label>
                  <Input
                    id="session-name"
                    placeholder="Enter session name"
                    value={sessionName}
                    onChange={(e) => setSessionName(e.target.value)}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    placeholder="Field location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                  />
                </div>
                
                <p className="text-sm text-muted-foreground">
                  * Both fields are required before recording
                </p>
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
                    <Badge variant="secondary" className="bg-success text-success-foreground">85%</Badge>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Signal</span>
                    <Badge variant="secondary" className="bg-success text-success-foreground">Strong</Badge>
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
              Recorded Sessions ({recordings.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recordings.length === 0 ? (
                <div className="text-center py-8">
                  <Video className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">No recordings yet. Start recording to see your sessions here.</p>
                </div>
              ) : (
                recordings.map((recording) => (
                  <div key={recording.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-12 bg-gradient-subtle rounded flex items-center justify-center">
                        <Video className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="font-medium">{recording.session_name}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(recording.created_at).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {recording.location}
                          </span>
                          <span>{formatDuration(recording.duration)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => downloadRecording(recording)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => deleteRecording(recording.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Drone;