import os
import json
import base64
import urllib.request
import urllib.error
from typing import Dict, Any

async def generate_voice_alert(text: str) -> Dict[str, Any]:
    """
    Generates ElevenLabs synthesized voice alert for risk underwriter announcements.
    If ELEVENLABS_API_KEY is not configured or if an error occurs, safely returns
    structured fallback speech metadata for client Web Speech API synthesis.
    """
    api_key = os.environ.get("ELEVENLABS_API_KEY", "").strip()
    voice_id = os.environ.get("ELEVENLABS_VOICE_ID", "21m00Tcm4TlvDq8ikWAM")  # Default Rachel voice

    if not api_key:
        return {
            "success": True,
            "has_audio": False,
            "text": text,
            "voice_name": "Risk Underwriter (Web Speech)",
            "message": "ElevenLabs API key not set. Using high-fidelity client Web Speech API fallback."
        }

    url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"
    headers = {
        "xi-api-key": api_key,
        "Content-Type": "application/json",
        "Accept": "audio/mpeg",
        "User-Agent": "Node-X-Logistics/2.0"
    }
    payload = {
        "text": text,
        "model_id": "eleven_monolingual_v1",
        "voice_settings": {
            "stability": 0.75,
            "similarity_boost": 0.85
        }
    }

    try:
        data_bytes = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(url, data=data_bytes, headers=headers, method="POST")
        with urllib.request.urlopen(req, timeout=4.0) as response:
            if response.status == 200:
                audio_content = response.read()
                audio_b64 = base64.b64encode(audio_content).decode("utf-8")
                return {
                    "success": True,
                    "has_audio": True,
                    "audio_data": f"data:audio/mpeg;base64,{audio_b64}",
                    "text": text,
                    "voice_name": "ElevenLabs Underwriter Voice",
                    "message": "Synthesized successfully via ElevenLabs API."
                }
            else:
                return {
                    "success": True,
                    "has_audio": False,
                    "text": text,
                    "voice_name": "Risk Underwriter (Web Speech Fallback)",
                    "message": f"ElevenLabs API returned {response.status}. Fallback engaged."
                }
    except Exception as e:
        return {
            "success": True,
            "has_audio": False,
            "text": text,
            "voice_name": "Risk Underwriter (Web Speech Fallback)",
            "message": "ElevenLabs fallback engaged."
        }
