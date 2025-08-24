import os
import json
import logging
from dotenv import load_dotenv
import google.generativeai as genai

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Load environment variables from .env file
load_dotenv()

# Read Gemini API key
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise ValueError("Please set GEMINI_API_KEY in your .env file")
logger.debug("API key loaded successfully")

# Initialize Gemini client
genai.configure(api_key=api_key)
model = genai.GenerativeModel('gemini-1.5-pro')
logger.debug("Gemini client initialized")

# Load TV feed
try:
    with open("./tv_feed.json", "r") as f:
        tv_feed = json.load(f)
    logger.debug("TV feed loaded successfully")
except FileNotFoundError:
    logger.error("tv_feed.json not found in the current directory")
    raise

user_query = "Looking for a TV ideal for gaming in a living room with bright lighting"

prompt_template = f"""
You are a product assistant. You are given a list of Samsung TV data in JSON format.
Each TV entry has fields: modelCode, shortDescription, longDescription, variants, display, processor, gamingFeatures, audio, connectivity, design, images.

Based on the user query below, create **exactly 10 product cards** in a valid JSON array format. Each product card must contain:

1. frontImage: main image URL
2. tvType: few words describing type, e.g., "Samsung QLED TV"
3. topFeatures: top 3 features relevant to the user query
4. price: current price and suggested price (use the 55-inch variant if multiple sizes exist)
5. availableSizes: list of available sizes
6. description: a detailed description that reflects the user query (highlight gaming or living room relevance)

User query: "{user_query}"

TV feed: {json.dumps(tv_feed)}

Return the response as a valid JSON array of exactly 10 product cards. Ensure the JSON is complete, with proper opening and closing brackets, and no trailing commas. If you cannot find enough real products, generate hypothetical ones to complete the list of 10, clearly marking them as hypothetical in the description.
"""

def clean_json_string(text):
    """Clean and fix potentially malformed JSON string."""
    text = text.strip()
    # Remove markdown code blocks
    if text.startswith("```json") and text.endswith("```"):
        text = text[7:-3].strip()
    elif text.startswith("```") and text.endswith("```"):
        text = text[3:-3].strip()
    
    # Ensure the JSON is a complete array
    if not text.startswith("["):
        text = "[" + text
    if not text.endswith("]"):
        # Remove trailing comma before closing the array
        text = text.rstrip(",").rstrip() + "]"
    
    return text

# Call Gemini API with retry logic
max_retries = 3
product_cards = []
for attempt in range(max_retries):
    try:
        logger.debug(f"Attempting to call Gemini API (attempt {attempt + 1}/{max_retries})")
        response = model.generate_content(
            prompt_template,
            generation_config={
                "temperature": 0.7,
                "max_output_tokens": 3000  # Increased to ensure complete response
            }
        )
        generated_text = response.text
        logger.debug("API response received successfully")
        
        # Clean the JSON string
        cleaned_text = clean_json_string(generated_text)
        
        # Parse JSON
        try:
            product_cards = json.loads(cleaned_text)
            if len(product_cards) >= 10:
                logger.debug("JSON parsed successfully")
                break
            else:
                logger.warning(f"Only {len(product_cards)} product cards generated, retrying...")
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse JSON: {str(e)}. Raw output:")
            print(cleaned_text)
            if attempt == max_retries - 1:
                logger.error("Max retries reached, giving up.")
                product_cards = []
            continue
    except Exception as e:
        logger.error(f"Error calling Gemini API: {str(e)}")
        if attempt == max_retries - 1:
            product_cards = []
        continue

# Output first 10 product cards
logger.debug(f"Outputting {len(product_cards)} product cards")
print(json.dumps(product_cards[:10], indent=2))