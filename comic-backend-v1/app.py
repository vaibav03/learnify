import os
import json
import base64
from flask import Flask, request, jsonify
import boto3
from botocore.exceptions import ClientError
import traceback 
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/generate-comic/*": {"origins": "*"}})

REGION_NAME = os.environ.get("AWS_REGION", "us-east-1") 
TEXT_MODEL_ID = "anthropic.claude-3-sonnet-20240229-v1:0"
IMAGE_MODEL_ID = "amazon.nova-canvas-v1:0"


try:
    bedrock_runtime = boto3.client(
        service_name='bedrock-runtime',
        region_name=REGION_NAME
    )
except Exception as e:
    print(f"Error initializing Bedrock client: {e}")
    print("Please ensure your AWS credentials and region are configured correctly.")
    exit()

def summarize_text_with_claude(input_text):
    """
    Stage 1: Summarizes the input text into 4 short paragraphs using Claude 3.
    """
    summary_prompt = f"""
    You are a professional summarizer. Your task is to summarize the following text into exactly 4 short paragraphs. Each paragraph should cover a key aspect or progression of the original text. Generate 4 paragraphs only.

    <text>
    {input_text}
    </text>

    Please provide the summary directly, without any conversational preamble or markdown.
    """
    
    body = json.dumps({
        "messages": [{"role": "user", "content": summary_prompt}],
        "max_tokens": 1024,
        "temperature": 0.3, 
        "anthropic_version": "bedrock-2023-05-31"
    })


    print("\n--- Stage 1: Summarizing input text with Claude...")
    response = bedrock_runtime.invoke_model(
        modelId=TEXT_MODEL_ID,
        contentType="application/json",
        accept="application/json",
        body=body
    )
    
    response_body = json.loads(response.get("body").read())
    summary_text = response_body['content'][0]['text']
    print("Summary generated successfully.")
    return summary_text

def generate_comic_script_from_summary(summary_text):
    """
    Stage 2: Takes the summary and generates the 4-panel comic script
             (narrative, no dialogue) with image prompts, using Claude 3.
    """
    comic_script_prompt = f"""
    You are a creative comic script writer.
    Transform the following story into a short, comical 4-panel storyline.
    Describe it in a narrative way (no dialogue), with each panel labeled clearly as:

    Panel 1: ...
    Panel 2: ...
    Panel 3: ...
    Panel 4: ...

    Each panel should describe a funny or expressive visual moment that conveys the concept.
    Focus on vivid actions, emotions, and settings that could be illustrated in a comic scene.
    
    IMPORTANT: For each panel, after the narrative description, provide a highly descriptive, concise, and focused "image_prompt" **no longer than 1000 characters** (to fit model constraints) suitable for an image generation model. Ensure a consistent 'digital comic book style'. Prioritize key visual elements and actions, omitting unnecessary details to stay within the character limit.

    Format your output as a JSON object with a 'title', 'summary_story' (the full 4-panel narrative), and a 'panels' array. Each panel object in the array should have 'caption' (the narrative description) and 'image_prompt'.

    Story:
    {summary_text}
    """
    
    body = json.dumps({
        "messages": [{"role": "user", "content": comic_script_prompt}],
        "max_tokens": 2048,
        "temperature": 0.7, 
        "anthropic_version": "bedrock-2023-05-31"
    })

    print("\n--- Stage 2: Generating comic script from summary with Claude...")
   
    response = bedrock_runtime.invoke_model(
        modelId=TEXT_MODEL_ID,
        contentType="application/json",
        accept="application/json",
        body=body
    )
    
    response_body = json.loads(response.get("body").read())
    
    json_text = response_body['content'][0]['text']
    
    if json_text.startswith("```json"):
        json_text = json_text.strip("```json").strip()
    elif json_text.startswith("```"):
        json_text = json_text.strip("```").strip()
        
    print("Comic script generated successfully.")
    return json.loads(json_text)

def generate_flashcards_from_summary(summary_text):
    """
    Stage 1B: Uses Claude 3 to convert the 4-paragraph summary into 4 
    Question and Answer flashcard pairs, returned as a JSON array.
    
    This function replaces the previous text-only splitter.
    """
    flashcard_prompt = f"""
    You are a professional educational content generator. Your task is to transform the following 4-paragraph summary into exactly 4 distinct flashcard objects.

    Each flashcard must be a concise **question** and a corresponding concise **answer** based only on the content of the summary.

    <summary>
    {summary_text}
    </summary>

    Format your entire output as a single JSON array. Each object in the array must have two keys: 'question' and 'answer'.

    Example Format:
    [
      {{
        "question": "What key event initiated the hero's journey?",
        "answer": "The sudden collapse of the ancient observatory, which released a wave of temporal energy."
      }},
      // ... three more flashcard objects
    ]
    """
    
    body = json.dumps({
        "messages": [{"role": "user", "content": flashcard_prompt}],
        "max_tokens": 1024,
        "temperature": 0.5,
        "anthropic_version": "bedrock-2023-05-31"
    })

    print("\n--- Stage 1B: Generating flashcards (Q&A) with Claude...")
    
    try:
        response = bedrock_runtime.invoke_model(
            modelId=TEXT_MODEL_ID,
            contentType="application/json",
            accept="application/json",
            body=body
        )
        
        response_body = json.loads(response.get("body").read())
        json_text = response_body['content'][0]['text']
        
        if json_text.startswith("```json"):
            json_text = json_text.strip("```json").strip()
        elif json_text.startswith("```"):
            json_text = json_text.strip("```").strip()
            
        print("Flashcards generated successfully.")
        print("flashcards text : ", json_text)
        return json.loads(json_text)
        
    except ClientError as e:
        print(f"AWS Client Error during flashcard generation: {e.response['Error']['Message']}")
        raise
    except json.JSONDecodeError as e:
        print(f"JSON Parsing Error after Claude returned text: {str(e)}")
        print(f"Raw Claude Output:\n{json_text}")
        raise Exception("LLM returned malformed JSON for flashcards.")
    except Exception as e:
        print(f"An unexpected error occurred during flashcard generation: {e}")
        raise


def generate_image_with_nova_canvas(prompt, panel_number):

    body = json.dumps({
        "messages": [
            {
                "role": "user",
                "content": [
                    {
                        "text": f"Generate a high-quality comic book style image based on this description: {prompt}. Ensure clean linework and vibrant colors. Focus on the main action and characters."
                    }
                ]
            }
        ],

    })


    print(f"   -> Generating image for Panel {panel_number} with Nova Canvas (messages payload)...")
    response = bedrock_runtime.invoke_model(
        modelId=IMAGE_MODEL_ID,
        contentType="application/json",
        accept="application/json",
        body=body
    )

    response_body = json.loads(response.get("body").read())

    with open(f"sample.json", "w") as f:
        json.dump(response_body, f, indent=4)

    print("Image generation response received.")

    print("response_body : ", response_body)
    base64_image = response_body['output']['message']['content'][0]['image']['source']['bytes']


    return base64_image

# --- API Endpoint ---

@app.route('/', methods=['POST'])
def generate_comic():
    try:
        input_text = request.form.get('text')
        
        if not input_text:
            return jsonify({"error": "Missing 'text' in request body."}), 400

        summary = summarize_text_with_claude(input_text)

        flashcard_data = generate_flashcards_from_summary(summary)
        print("flashcard_data : ", flashcard_data)
        
        comic_script_data = generate_comic_script_from_summary(summary)
        print("comic_script_data : ", comic_script_data)
        
        final_panels = []
        for i, panel in enumerate(comic_script_data['panels']):
            panel_number = i + 1
            
            # Nova Canvas image generation
            base64_image = generate_image_with_nova_canvas(panel['image_prompt'], panel_number)
            
            final_panels.append({
                "caption": panel['caption'],
                "image": base64_image
            })
            
        print("\n*** Generation Complete ***")
        print(f"Title: {comic_script_data.get('title')}")

        print("summary : ", summary)
        
        return jsonify({
            "status": "success",
            "title": comic_script_data.get('title'),
            "summary": summary,
            "panels": final_panels,
            "flashcards": flashcard_data
        })

    except ClientError as e:
        error_message = f"AWS Client Error: {e.response['Error']['Message']}"
        print(error_message)
        return jsonify({
            "error": "An error occurred with the AWS service. Check model access permissions.",
            "details": error_message
        }), 500
    
    except json.JSONDecodeError as e:
        print(f"JSON Parsing Error: {str(e)}")
        print("This often indicates the LLM did not return valid JSON.")
        return jsonify({
            "error": "Failed to parse JSON response from LLM. LLM output might be malformed.",
            "details": str(e)
        }), 500
    
    except Exception as e:
        print("\n--- UNEXPECTED ERROR TRACEBACK ---")
        traceback.print_exc()
        print("----------------------------------")
        return jsonify({
            "error": "An unexpected Python error occurred.",
            "details": str(e),
            "traceback": traceback.format_exc().splitlines()
        }), 500



if __name__ == '__main__':
    print("Starting Flask server on http://127.0.0.1:5000")
    print("\n--- To test, send a POST request to http://127.0.0.1:5000/generate-comic ---")
    print("Example JSON body: {'text': 'Your multi-paragraph input text goes here.'}")
    app.run(debug=True, port=5000, use_reloader=False)