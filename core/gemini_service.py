import google.generativeai as genai
from django.conf import settings
import json

# Configure Gemini AI
genai.configure(api_key=settings.GEMINI_API_KEY)

class GeminiAIService:
    def __init__(self):
        self.model = genai.GenerativeModel('gemini-2.5-flash')

    def check_scheme_eligibility(self, patient_data):
        """
        Check health scheme eligibility using Gemini AI
        Returns structured JSON response
        """
        prompt = f"""
You are a Government Healthcare Scheme Eligibility Expert for Karnataka and Central Government schemes.

Patient Details:
- Age: {patient_data.get('age')} years
- District: {patient_data.get('district')}, Karnataka
- Economic Status: {patient_data.get('economic_status')}
- Ration Card: {'Available' if patient_data.get('has_ration_card') else 'Not Available'}
- Aadhaar: {'Available' if patient_data.get('has_aadhaar') else 'Not Available'}
- Disease Type: {patient_data.get('disease_type')}
- Language Preference: {patient_data.get('language', 'English')}

Based on this information, identify the MOST SUITABLE health scheme from Karnataka or Central Government.

Consider these major schemes:
1. **Pradhan Mantri Jan Arogya Yojana (PMJAY)** - Central, for BPL families, covers ₹5 lakhs/year
2. **Vajpayee Arogyashree** - Karnataka, for BPL families, covers critical illnesses
3. **Suvarna Arogya Suraksha** - Karnataka, for APL families (₹1-2 lakhs income)
4. **Jyothi Sanjeevini Yojana** - Karnataka, for women and children
5. **Yashasvini Health Scheme** - Karnataka, for cooperative members
6. **Karnataka Arogya Raksha Scheme (KARS)** - Karnataka state employees
7. **Ayushman Bharat** - Central, cashless treatment for poor families

YOU MUST RETURN VALID JSON in this EXACT structure:
{{
  "scheme_name": "Name of the most suitable scheme",
  "scheme_type": "Karnataka" or "Central",
  "eligibility_score": "XX%" (your confidence in eligibility),
  "why_eligible": "Clear explanation why patient qualifies",
  "required_documents": ["Document 1", "Document 2", "Document 3"],
  "apply_steps": [
    "Step 1: Detailed instruction",
    "Step 2: Detailed instruction",
    "Step 3: Detailed instruction",
    "Step 4: Final verification"
  ],
  "language_output": "{patient_data.get('language', 'English')}"
}}

CRITICAL: Return ONLY the JSON object, no extra text before or after.
"""

        # Use strict generation config for JSON
        try:
            import google.generativeai as genai
            response = self.model.generate_content(
                prompt,
                generation_config=genai.types.GenerationConfig(
                    candidate_count=1,
                    max_output_tokens=1500,
                    temperature=0.2,
                    top_p=0.8,
                    top_k=40
                )
            )
            result_text = response.text.strip()
            
            # Clean response
            if result_text.startswith('```json'):
                result_text = result_text[7:]
            if result_text.startswith('```'):
                result_text = result_text[3:]
            if result_text.endswith('```'):
                result_text = result_text[:-3]
            result_text = result_text.strip()
            
            # Parse JSON
            result = json.loads(result_text)
            
            # Additional validation
            required_keys = ['scheme_name', 'scheme_type', 'eligibility_score', 'why_eligible', 'required_documents', 'apply_steps']
            for key in required_keys:
                if key not in result:
                    raise ValueError(f"Missing required key from AI response: {key}")
                    
            return result
            
        except json.JSONDecodeError:
            print(f"Failed to parse Gemini JSON output for scheme prediction: {result_text}")
            raise Exception("AI generated an invalid response. Please try again.")
        except Exception as e:
            print(f"Gemini API Error for scheme prediction: {str(e)}")
            raise Exception(f"Scheme prediction failed using Gemini API: {str(e)}")

    def analyze_medical_report(self, report_text, language='English'):
        """
        Analyze medical report using Gemini AI
        Returns structured JSON with findings
        OPTIMIZED: Further optimized for 5-second processing
        """
        # More aggressive truncation for 5-second requirement
        truncated_text = report_text[:1000] + "..." if len(report_text) > 1000 else report_text
        
        prompt = f"""
You are a highly qualified medical AI assistant. Analyze the following medical report and respond ONLY with a valid JSON object. Do not include any markdown formatting, conversational text, or explanations outside the JSON structure.

Language for analysis output: {language}

MEDICAL REPORT CONTENT:
{truncated_text}

REQUIRED JSON STRUCTURE:
{{
  "patient_summary": "A brief, easy-to-understand summary of the patient's overall health based on the report (in {language}).",
  "abnormal_findings": [
    {{
      "parameter": "Name of the test/parameter that is abnormal",
      "value": "The recorded value",
      "normal_range": "The expected normal range",
      "severity": "mild", "moderate", "severe", or "critical",
      "simple_explanation": "A simple explanation of what this abnormality means (in {language})"
    }}
  ],
  "risk_level": "Low", "Medium", or "High",
  "lifestyle_recommendations": [
    "Specific lifestyle or dietary recommendation (in {language})"
  ],
  "doctor_visit_suggestion": "Recommendation on when/if to see a doctor based on these results (in {language})"
}}

CRITICAL INSTRUCTION: Return ONLY the raw JSON object. Do not use ```json blocks.
"""

        try:
            # Add generation config optimized for accuracy and JSON structure
            import google.generativeai as genai
            response = self.model.generate_content(
                prompt,
                generation_config=genai.types.GenerationConfig(
                    candidate_count=1,
                    max_output_tokens=2048,
                    temperature=0.2, 
                    top_p=0.8,
                    top_k=40
                )
            )
            result_text = response.text.strip()
            
            # Clean response if the AI still included markdown blocks
            if result_text.startswith('```json'):
                result_text = result_text[7:]
            if result_text.startswith('```'):
                result_text = result_text[3:]
            if result_text.endswith('```'):
                result_text = result_text[:-3]
            result_text = result_text.strip()
            
            # Parse JSON
            result = json.loads(result_text)
            
            # Basic validation to ensure structure is correct
            required_keys = ['patient_summary', 'abnormal_findings', 'risk_level', 'lifestyle_recommendations', 'doctor_visit_suggestion']
            for key in required_keys:
                if key not in result:
                    raise ValueError(f"Missing required key in Gemini response: {key}")
                    
            return result
            
        except json.JSONDecodeError as e:
            print(f"Failed to parse Gemini JSON output: {result_text}")
            raise Exception("The AI generated an invalid response format. Please try again.")
        except Exception as e:
            print(f"Gemini API Error: {str(e)}")
            raise Exception(f"Failed to analyze report using Gemini AI: {str(e)}")

# Initialize service
gemini_service = GeminiAIService()
