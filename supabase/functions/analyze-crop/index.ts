import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageUrl, cropType, userId } = await req.json();
    console.log('Analyzing crop:', { cropType, userId });

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Mock AI analysis for now - In a real app, you'd integrate with an AI service
    // This simulates different diseases and treatments based on crop type
    const mockAnalysis = generateMockAnalysis(cropType);

    // Store the analysis in the database
    const { data: analysis, error } = await supabase
      .from('crop_analyses')
      .insert({
        user_id: userId,
        image_url: imageUrl,
        crop_type: cropType,
        disease_detected: mockAnalysis.disease,
        severity_level: mockAnalysis.severity,
        confidence_score: mockAnalysis.confidence,
        treatment_suggestions: mockAnalysis.treatments
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to save analysis' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Analysis saved successfully');
    return new Response(
      JSON.stringify({
        analysis: {
          id: analysis.id,
          disease: analysis.disease_detected,
          severity: analysis.severity_level,
          confidence: analysis.confidence_score,
          treatments: analysis.treatment_suggestions,
          analysisDate: analysis.analysis_date
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-crop function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function generateMockAnalysis(cropType: string) {
  const diseaseDatabase: Record<string, any[]> = {
    tomato: [
      {
        disease: "Early Blight",
        severity: "moderate",
        confidence: 89,
        treatments: [
          "Apply copper-based fungicide",
          "Improve air circulation",
          "Remove affected leaves",
          "Monitor weekly for 4 weeks"
        ]
      },
      {
        disease: "Late Blight",
        severity: "severe",
        confidence: 94,
        treatments: [
          "Apply systemic fungicide immediately",
          "Remove all affected plant parts",
          "Increase plant spacing",
          "Apply preventive treatments weekly"
        ]
      },
      {
        disease: "Healthy",
        severity: "healthy",
        confidence: 97,
        treatments: [
          "Continue current care routine",
          "Monitor for any changes",
          "Maintain proper watering schedule"
        ]
      }
    ],
    corn: [
      {
        disease: "Northern Corn Leaf Blight",
        severity: "mild",
        confidence: 85,
        treatments: [
          "Apply fungicide if needed",
          "Ensure proper field drainage",
          "Consider resistant varieties next season"
        ]
      },
      {
        disease: "Healthy",
        severity: "healthy",
        confidence: 96,
        treatments: [
          "Maintain current farming practices",
          "Monitor growth regularly",
          "Ensure adequate nutrition"
        ]
      }
    ],
    wheat: [
      {
        disease: "Wheat Rust",
        severity: "moderate",
        confidence: 91,
        treatments: [
          "Apply fungicide treatment",
          "Monitor weather conditions",
          "Consider resistant varieties",
          "Improve field sanitation"
        ]
      }
    ],
    default: [
      {
        disease: "Leaf Spot Disease",
        severity: "mild",
        confidence: 78,
        treatments: [
          "Apply broad-spectrum fungicide",
          "Improve ventilation",
          "Monitor plant health",
          "Consider soil testing"
        ]
      }
    ]
  };

  const diseases = diseaseDatabase[cropType.toLowerCase()] || diseaseDatabase.default;
  return diseases[Math.floor(Math.random() * diseases.length)];
}