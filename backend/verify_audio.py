import sys
import os
import unittest
from unittest.mock import MagicMock, patch

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'pinnacle6', 'backend'))

# Mock libraries not needed for audio unit test if model.py imports them globally
# We need to make sure we can import model without crashing on generic cv2/tf imports
# mocking them is safer.
sys.modules['cv2'] = MagicMock()
sys.modules['tensorflow'] = MagicMock()
sys.modules['tensorflow.keras'] = MagicMock()
sys.modules['tensorflow.keras.models'] = MagicMock()

import model

class TestAudioInference(unittest.TestCase):
    def setUp(self):
        # Ensure API key is set for test
        model.AUDIO_API_KEY = "test_key"
        
    def test_audio_predict_fake(self):
        # We need to hit specific hash to get > 0.85
        # Logic: h = hashlib.sha256(filename.encode() + audio_bytes[:100]).hexdigest()
        # raw_val = int(h[:4], 16) / 65535.0
        # We can mock the hashlib or just find a value that works?
        # Easier to mock the simulation logic OR just mock the return of the simulation.
        # But `predict_audio` has the logic inside.
        # Let's patch hashlib to return a known fake hash.
        
        # Fake Hash: FFFF (Max value = 1.0)
        with patch('hashlib.sha256') as mock_sha:
            mock_sha.return_value.hexdigest.return_value = "FFFF"
            
            result = model.predict_audio(b"fake_audio_data", "test_fake.wav")
            
            print(f"Fake Test: {result}")
            self.assertEqual(result['label'], "FAKE")
            self.assertGreater(result['confidence'], 0.85)
            self.assertIn("Synthetic speech patterns detected", result['reasons'])

    def test_audio_predict_real(self):
        # Real Hash: 0000 (Min value = 0.0)
        with patch('hashlib.sha256') as mock_sha:
            mock_sha.return_value.hexdigest.return_value = "0000"
            
            result = model.predict_audio(b"real_audio_data", "test_real.wav")
            
            print(f"Real Test: {result}")
            self.assertEqual(result['label'], "REAL")
            self.assertIn("Natural speech features confirmed", result['reasons'])
            
    def test_audio_predict_inconclusive(self):
        # Inconclusive Hash: 8000 (Middle value ~ 0.5)
        with patch('hashlib.sha256') as mock_sha:
            mock_sha.return_value.hexdigest.return_value = "8000"
            
            result = model.predict_audio(b"ambiguous_data", "ambiguous.wav")
            
            print(f"Inconclusive Test: {result}")
            self.assertEqual(result['label'], "INCONCLUSIVE")
            self.assertEqual(result['confidence'], 0.60) # Fixed for inconclusive
            self.assertIn("Ambiguous vocal features", result['reasons'])

if __name__ == '__main__':
    unittest.main()
