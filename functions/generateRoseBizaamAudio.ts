export default async function generateRoseBizaamAudio(data) {
  try {
    const text = "שלום, אני כתבת הרשת החדשה. רוז ביזאם הפכה לאחת הילדות הווירליות המשעשעות ביותר בעידן הדיגיטלי. הילדה הקטנה מאתר הוברים בירושלים תופסת לבות עם התביעות שלה ותגובותיה האמיתיות. מאז שהווידאו שלה התפשט ברשתות החברתיות, היא הפכה לסמל של תרבות הרשת הישראלית. ההורים שלה פתחו לה חשבון ברשתות ובנו עליה קומיוניטי גדול. כל זה בגיל צעיר כל כך, מה שמעלה שאלות על הילדות בעידן הדיגיטלי.";
    
    const ELEVEN_LABS_API_KEY = "sk_cd10b6dc975c37b71c57ad2da75c1c95fa6e3eb94d70cd30";
    
    const response = await fetch("https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq3XekKb", {
      method: "POST",
      headers: {
        "xi-api-key": ELEVEN_LABS_API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        text: text,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Eleven Labs error: ${response.status}`);
    }

    const audioBuffer = await response.arrayBuffer();
    
    // Upload to storage
    const uploadResponse = await fetch("/api/upload", {
      method: "POST",
      headers: {
        "Content-Type": "audio/mpeg"
      },
      body: audioBuffer
    });

    if (!uploadResponse.ok) {
      throw new Error("Upload failed");
    }

    const uploadData = await uploadResponse.json();

    return {
      success: true,
      audio_url: uploadData.file_url,
      duration: 40,
      text: text
    };
  } catch (error) {
    console.error("Audio generation error:", error);
    throw new Error(`Failed to generate audio: ${error.message}`);
  }
}